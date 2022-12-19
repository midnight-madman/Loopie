import logging
from datetime import datetime

import luigi

from const import NON_NEWS_URLS
from get_twitter_data import get_urls_from_tweets_dataframe
from settings import DATE_FORMAT
from tasks.base_loopie_task import BaseLoopieTask
from tasks.utils import create_tags_for_news_items
from utils import find_obj_based_on_key_value_in_list, chunkify

logger = logging.getLogger('luigi-interface')


class CreateNewsItems(BaseLoopieTask):
    start_date = luigi.DateParameter(default=datetime.today())

    def get_query(self) -> str:
        # query for tweets without news items
        return f'''
        Select tweet.id          as tweet_id,
               tweet.id          as id,
               ni.id IS NOT NULL as has_news_item,
               tweet.created_at,
               tweet.entities,
               tweet.author_id
        from "Tweet" tweet
                 left join "NewsItemToTweet" ni2tweet on tweet.id = ni2tweet.tweet_id
                 left join "NewsItem" ni on ni2tweet.news_item_id = ni.id
        where ni.id IS NULL and tweet.created_at::date >= '{self.start_date.strftime(DATE_FORMAT)}'; 
        '''

    def get_tags_query(self) -> str:
        return 'SELECT * FROM "Tag"'

    def complete(self):
        return len(self.df) == 0

    def get_existing_news_items_with_urls(self, urls: list[str], exclude_if_has_tags: bool = False) -> list[dict]:
        url_chunks = chunkify(urls, 50)  # db query has max size of query length
        news_items_in_db = []

        for url_chunk in url_chunks:
            supabase_query = self.supabase \
                .table("NewsItem") \
                .select('id, url, title, NewsItemToTag!left(id, Tag(id, title))') \
                .in_('url', url_chunk)
            resp_query_urls = supabase_query.execute()

            if exclude_if_has_tags:
                data = [news_item for news_item in resp_query_urls.data if len(news_item.get('NewsItemToTag')) == 0]
            else:
                data = resp_query_urls.data
            news_items_in_db.extend(data)

        return news_items_in_db

    def run(self):
        url_objs = get_urls_from_tweets_dataframe(self.df)
        url_objs = [obj for obj in url_objs if self.is_news_item_url(obj['url'])]
        new_urls = list(set([obj['url'] for obj in url_objs]))

        if not new_urls:
            return

        news_items_in_db = self.get_existing_news_items_with_urls(new_urls)
        nr_created_news_items = self.create_news_items(url_objs, news_items_in_db)

        if nr_created_news_items > 0:
            news_items_in_db = self.get_existing_news_items_with_urls(new_urls)

        self.create_news_item_to_tweets_connections(url_objs, news_items_in_db)

        news_items_in_db = self.get_existing_news_items_with_urls(new_urls, exclude_if_has_tags=True)
        self.create_news_item_to_tags_connections(news_items_in_db)

    def create_news_items(self, url_objs: list[dict], news_items_in_db: list[dict]) -> int:
        unique_url_objs = {obj['url']: obj for obj in url_objs}.values()  # make list unique

        urls_in_db = list(set([obj['url'] for obj in news_items_in_db]))
        news_items_to_insert = [url_obj for url_obj in unique_url_objs if url_obj['url'] not in urls_in_db]
        news_items_to_insert = [dict(url=url_obj['url']) for url_obj in news_items_to_insert]

        if news_items_to_insert:
            resp = self.supabase.table("NewsItem").insert(news_items_to_insert, count='exact').execute()
            logger.info(f'Created {resp.count} new news items in DB')
            return resp.count
        else:
            logger.info(f'All news items already exist in DB')
            return 0

    @staticmethod
    def is_news_item_url(url: str) -> bool:
        if '~' in obj['url']:
            return False
        if url.startswith('https://twitter.com'):
            return False
        if any([non_news_url in url for non_news_url in NON_NEWS_URLS]):
            return False
        return True

    def create_news_item_to_tweets_connections(self, url_objs: list[dict], news_items_in_db: list[dict]):
        news_item_ids = []
        tweet_ids = []

        for url_obj in url_objs:
            obj = find_obj_based_on_key_value_in_list(news_items_in_db, 'url', url_obj['url'])
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

    def create_news_item_to_tags_connections(self, news_items_in_db: list[dict]):
        new_tag_connections = create_tags_for_news_items(news_items_in_db)

        if new_tag_connections:
            insert_count = 0
            for new_connections_chunk in chunkify(new_tag_connections, 30):
                resp = self.supabase.table("NewsItemToTag").insert(new_connections_chunk, count='exact').execute()
                insert_count += resp.count
            logger.info(f'News tag connections for news items created: {insert_count}')
        else:
            logger.info(f'No new tag connections for news items created')
