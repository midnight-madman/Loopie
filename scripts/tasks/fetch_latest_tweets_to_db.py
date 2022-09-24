import logging
import os.path
import time

import luigi
import pandas as pd
from supabase import create_client, Client

from get_twitter_data import get_tweets_since_id_with_retry, get_urls_from_tweets_dataframe
from settings import SUPABASE_URL, SUPABASE_KEY, DATA_DIR

logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


class ReadTweets(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def output(self):
        return luigi.LocalTarget(f'{DATA_DIR}tweets_since_id_{self.last_tweet_id}.csv')

    def run(self):
        df = get_tweets_since_id_with_retry(since_id=self.last_tweet_id)
        if df is None:
            # ToDo: handle no new tweets gracefully
            return

        with self.output().open('w') as file:
            file.write(df.to_csv(index=False))


class CopyTweetsToDB(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = get_supabase_client()

    def run(self):
        df = pd.read_csv(self.input().path)
        df.fillna(value='', inplace=True)
        rows = df.to_dict(orient='records')

        self.supabase.table("Tweet").insert(rows).execute()

    def complete(self):
        # complete if last tweet in Tweet DB table is >= last tweet in local file
        if not os.path.exists(self.input().path):
            return False

        df = pd.read_csv(self.input().path)
        last_tweet_id_in_file = df.id.max()
        data = self.supabase.table("Tweet").select("id").order('id', desc=True).limit(1).execute()
        last_tweet_id_in_db = data.data[0]['id']

        return last_tweet_id_in_db >= last_tweet_id_in_file

    def requires(self):
        return ReadTweets(last_tweet_id=self.last_tweet_id)


class FetchLatestTweetUrlsToDB(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = get_supabase_client()

    def requires(self):
        return [
            ReadTweets(last_tweet_id=self.last_tweet_id),
            CopyTweetsToDB(last_tweet_id=self.last_tweet_id)
        ]

    def complete(self):
        # complete if last local tweet in NewsItemToTweet DB Table exists
        if not os.path.exists(self.input()[0].path):
            return False

        df = pd.read_csv(self.input()[0].path)
        last_tweet_id_in_file = df.id.max()
        resp = self.supabase.table("NewsItemToTweet").select("id").eq('tweet_id', last_tweet_id_in_file).limit(
            1).execute()
        return len(resp.data) != 0

    def run(self):
        df = pd.read_csv(self.input()[0].path)

        url_objs = get_urls_from_tweets_dataframe(df)
        url_objs = [obj for obj in url_objs if not obj['url'].startswith('https://twitter.com')]
        urls = [obj['url'] for obj in url_objs]

        if not urls:
            return

        resp_query_urls = self.supabase.table("NewsItem").select('id, url').in_('url', urls).execute()
        existing_news_items_in_db = resp_query_urls.data
        logger.info(f'news items in DB {len(existing_news_items_in_db)} - {len(urls)} urls in current batch')

        urls_in_db = list(set([obj['url'] for obj in existing_news_items_in_db]))
        urls_to_insert = list(set([url for url in urls if url not in urls_in_db]))
        urls_to_insert = [dict(url=url) for url in urls_to_insert]
        resp_add_news_items = self.supabase.table("NewsItem").insert(urls_to_insert).execute()
        new_news_items_in_db = resp_add_news_items.data
        logger.info(f'New news items in DB based on {len(urls_to_insert)} urls to insert: {len(new_news_items_in_db)}')

        # create NewsItem to Tweets connection
        # url_objs is all urls from file
        # I have resp_add_news_items that were fresh created
        # I have
        news_item_ids = []
        tweet_ids = []

        for url_obj in url_objs:
            obj = find_obj_based_on_key_value_in_lists([existing_news_items_in_db, new_news_items_in_db], 'url',
                                                       url_obj['url'])
            if not obj:
                raise Exception('could not determine news item id for tweet to insert into DB')

            news_item_ids.append(obj['id'])
            tweet_ids.append(url_obj['tweet_id'])

        news_item_to_tweets = [dict(news_item_id=news_item_id, tweet_id=tweet_id)
                               for news_item_id, tweet_id in zip(news_item_ids, tweet_ids)]

        delay = 2
        while True:
            resp_check_is_tweets_in_db = self.supabase.table("Tweet").select('id').eq('id', news_item_to_tweets[0][
                'tweet_id']).limit(1).execute()
            if resp_check_is_tweets_in_db.data:
                break
            print(f'will sleep for {delay} seconds')
            time.sleep(delay)
            delay *= 1.5

        resp = self.supabase.table("NewsItemToTweet").insert(news_item_to_tweets).execute()
        logger.info(f'New news items to tweets connections inserted: {len(resp.data)}')

        # insert new authors
        author_ids = list(set([obj['author_id'] for obj in url_objs]))
        resp_query_authors = self.supabase.table("Author").select('twitter_id').in_('twitter_id', author_ids).execute()
        existing_authors = resp_query_authors.data
        logger.info(f'Existing authors in DB: {len(existing_authors)} - new authors in current batch: {len(author_ids)}')

        existing_author_ids = [obj['twitter_id'] for obj in existing_authors]
        new_authors = [dict(twitter_id=obj['author_id'], twitter_username=obj['author_username'])
                       for obj in url_objs if obj['author_id'] not in existing_author_ids]
        new_authors = {obj['twitter_id']: obj for obj in new_authors}.values()  # make list unique

        resp_insert_authors = self.supabase.table("Author").insert(new_authors).execute()
        logger.info(f'Added {len(resp_insert_authors.data)} new authors')


def find_obj_based_on_key_value_in_lists(lists, key, value):
    for l in lists:
        for obj in l:
            if obj[key] == value:
                return obj
    return None
