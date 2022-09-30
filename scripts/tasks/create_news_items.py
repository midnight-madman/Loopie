import logging
import time
from datetime import datetime
from typing import Optional

import luigi

from get_twitter_data import get_urls_from_tweets_dataframe
from settings import DATE_FORMAT
from supabase_utils import get_supabase_client
from tasks.base_loopie_task import BaseLoopieTask
from utils import find_obj_based_on_key_value_in_list, chunkify

logger = logging.getLogger('luigi-interface')


class CreateNewsItems(BaseLoopieTask):
    start_date = luigi.DateParameter(default=datetime.today())

    def get_query(self) -> Optional[str]:
        return f'''
        Select tweet.id          as tweet_id,
               tweet.id          as id,
               ni.id IS NOT NULL as has_news_item,
               tweet.created_at,
               tweet.entities,
               tweet.author_id
        from "Tweet" tweet
                 left join "NewsItemToTweet" ni2t on tweet.id = ni2t.tweet_id
                 left join "NewsItem" ni on ni2t.news_item_id = ni.id
        where ni.id IS NULL and tweet.created_at::date >= '{self.start_date.strftime(DATE_FORMAT)}'; 
        '''

    def complete(self):
        return len(self.df) == 0

    def get_existing_news_items_with_urls(self, urls: list[str]) -> list[dict]:
        url_chunks = chunkify(urls, 50)  # db query has max size of query length
        existing_news_items_in_db = []

        for url_chunk in url_chunks:
            resp_query_urls = self.supabase.table("NewsItem").select('id, url').in_('url', url_chunk).execute()
            existing_news_items_in_db.extend(resp_query_urls.data)

        return existing_news_items_in_db

    def run(self):
        url_objs = get_urls_from_tweets_dataframe(self.df)
        url_objs = [obj for obj in url_objs if
                    not obj['url'].startswith('https://twitter.com') and not '~' in obj['url']]
        new_urls = list(set([obj['url'] for obj in url_objs]))

        if not new_urls:
            return

        existing_news_items_in_db = self.get_existing_news_items_with_urls(new_urls)

        self.create_news_items(url_objs, existing_news_items_in_db)
        self.create_authors(url_objs)

        time.sleep(30)  # let DB rest a little so we can read and create connections for NewsItems
        self.supabase = get_supabase_client()
        self.create_news_item_to_tweets_connections(url_objs, existing_news_items_in_db)

    def create_news_items(self, url_objs, existing_news_items_in_db):
        unique_url_objs = {obj['url']: obj for obj in url_objs}.values()  # make list unique

        urls_in_db = list(set([obj['url'] for obj in existing_news_items_in_db]))
        news_items_to_insert = [url_obj for url_obj in unique_url_objs if url_obj['url'] not in urls_in_db]
        news_items_to_insert = [dict(url=url_obj['url']) for url_obj in news_items_to_insert]

        self.supabase.table("NewsItem").insert(news_items_to_insert).execute()
        logger.info(f'Created {len(news_items_to_insert)} new news items in DB')

    def create_news_item_to_tweets_connections(self, url_objs, existing_news_items_in_db):
        news_item_ids = []
        tweet_ids = []

        for url_obj in url_objs:
            obj = find_obj_based_on_key_value_in_list(existing_news_items_in_db, 'url', url_obj['url'])
            if not obj:
                logger.warning(
                    'could not determine news item id for tweet to insert into DB - this can be a timing issue')
                continue

            news_item_ids.append(obj['id'])
            tweet_ids.append(url_obj['tweet_id'])

        news_item_to_tweets = [dict(news_item_id=news_item_id, tweet_id=tweet_id)
                               for news_item_id, tweet_id in zip(news_item_ids, tweet_ids)]

        resp = self.supabase.table("NewsItemToTweet").insert(news_item_to_tweets).execute()
        logger.info(f'New news items to tweets connections inserted: {len(resp.data)}')
