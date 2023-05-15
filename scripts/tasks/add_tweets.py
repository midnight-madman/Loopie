import logging

import luigi
import pandas as pd

from const import TWITTER_ACCOUNTS
from get_twitter_data import get_tweets_since_id_with_retry
from supabase_utils import get_supabase_client
from utils import chunkify

logger = logging.getLogger('luigi-interface')


class AddTweets(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = get_supabase_client()

    def run(self):
        df_tweets = get_tweets_since_id_with_retry(TWITTER_ACCOUNTS, self.last_tweet_id)
        no_new_tweets = df_tweets is None or len(df_tweets) == 0
        if no_new_tweets:
            return None

        def is_tweet_with_only_twitter_urls(entities):
            return all([urlObj['expanded_url'].startswith('https://twitter.com') for urlObj in entities.get('urls')])

        df_tweets['is_tweet_with_only_twitter_urls'] = df_tweets.entities.apply(is_tweet_with_only_twitter_urls)
        df_tweets = df_tweets[~df_tweets.is_tweet_with_only_twitter_urls]

        no_new_tweets = df_tweets is None or len(df_tweets) == 0
        if no_new_tweets:
            return None

        self.create_authors(df_tweets)
        self.create_tweets(df_tweets)

    def complete(self):
        # complete if last tweet in Tweet DB table is >= last tweet id
        data = self.supabase.table('Tweet').select('id').gt('id', self.last_tweet_id).order('id', desc=True).limit(
            1).execute()
        if not data.data:
            return False

        last_tweet_id_in_db = data.data[0]['id']

        return last_tweet_id_in_db >= self.last_tweet_id

    def create_authors(self, df: pd.DataFrame):
        author_ids = list(df.author_id.unique())
        resp_query_authors = self.supabase.table('Author').select('twitter_id').in_('twitter_id', author_ids).execute()

        existing_author_ids = [str(obj['twitter_id']) for obj in resp_query_authors.data]
        df['twitter_id'] = df['author_id']
        new_authors = df[~df.twitter_id.isin(existing_author_ids)][['twitter_id', ]].to_dict(orient='records')
        new_authors = list({obj['twitter_id']: obj for obj in new_authors}.values())  # make list unique

        resp_insert_authors = self.supabase.table('Author').insert(new_authors).execute()
        logger.info(f'Added {len(resp_insert_authors.data)} new authors')

    def create_tweets(self, df: pd.DataFrame):
        df.fillna(value='', inplace=True)
        TWEET_DB_COLUMNS = ['id', 'referenced_tweets', 'text', 'possibly_sensitive', 'public_metrics', 'author_id',
                            'entities', 'context_annotations', 'attachments', 'created_at']
        tweets_to_insert = df[TWEET_DB_COLUMNS].to_dict(orient='records')

        tweets_to_insert_chunks = chunkify(tweets_to_insert, 50)
        count_tweets_added_count = 0

        for tweets_to_insert_chunk in tweets_to_insert_chunks:
            resp_insert = self.supabase.table('Tweet').insert(tweets_to_insert_chunk, count='exact').execute()
            count_tweets_added_count += resp_insert.count

        logger.info(f'Added {count_tweets_added_count} tweets to DB')
