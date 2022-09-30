import logging

import luigi

from const import ACCOUNTS
from get_twitter_data import get_tweets_since_id_with_retry
from supabase_utils import get_supabase_client

logger = logging.getLogger('luigi-interface')


class CopyTweetsToDB(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = get_supabase_client()

    def run(self):
        df = get_tweets_since_id_with_retry(ACCOUNTS, self.last_tweet_id)
        if df is None or len(df) == 0:
            return None

        df.fillna(value='', inplace=True)
        TWEET_DB_COLUMNS = ['id', 'referenced_tweets', 'text', 'possibly_sensitive', 'public_metrics', 'author_id',
                            'entities', 'context_annotations', 'attachments']
        tweets_to_insert = df[TWEET_DB_COLUMNS].to_dict(orient='records')
        resp_insert = self.supabase.table("Tweet").insert(tweets_to_insert, count='exact').execute()
        logger.info(f'Added {resp_insert.count} tweets to DB')

    def complete(self):
        # complete if last tweet in Tweet DB table is >= last tweet id
        data = self.supabase.table("Tweet").select("id").gt('id', self.last_tweet_id).order('id', desc=True).limit(
            1).execute()
        if not data.data:
            return False

        last_tweet_id_in_db = data.data[0]['id']

        return last_tweet_id_in_db >= self.last_tweet_id
