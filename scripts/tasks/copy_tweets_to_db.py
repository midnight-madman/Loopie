import logging

import luigi

from get_twitter_data import get_tweets_since_id_with_retry
from supabase_utils import get_supabase_client

logger = logging.getLogger(__name__)


class CopyTweetsToDB(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = get_supabase_client()

    def run(self):
        df = get_tweets_since_id_with_retry(since_id=self.last_tweet_id)
        if df is None or len(df) == 0:
            return None

        df.fillna(value='', inplace=True)
        rows = df.to_dict(orient='records')

        self.supabase.table("Tweet").insert(rows).execute()

        with self.output().open('w') as f:
            f.write(str(df.id.max()))
            f.close()

    def complete(self):
        # complete if last tweet in Tweet DB table is >= last tweet id
        data = self.supabase.table("Tweet").select("id").gt('id', self.last_tweet_id).order('id', desc=True).limit(
            1).execute()
        if not data.data:
            return False

        last_tweet_id_in_db = data.data[0]['id']

        return last_tweet_id_in_db >= self.last_tweet_id

    def output(self):
        return luigi.LocalTarget('new_batch_last_tweet_id.txt')

