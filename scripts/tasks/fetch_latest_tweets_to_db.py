import logging

import luigi
import pandas as pd
from supabase import create_client, Client

from get_twitter_data import get_tweets_since_id_with_retry
from settings import SUPABASE_URL, SUPABASE_KEY, DATA_DIR

logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


class ReadTweets(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def output(self):
        return luigi.LocalTarget(f'{DATA_DIR}tweets_since_{self.last_tweet_id}.csv')

    def run(self):
        df = get_tweets_since_id_with_retry(since_id=self.last_tweet_id)
        if df is None:
            # ToDo: handle no new tweets gracefully
            return

        with self.output().open('w') as file:
            file.write(df.to_csv(index=False))


class CopyTweetsToDB(luigi.Task):
    last_tweet_id = luigi.Parameter()

    def run(self):
        df = pd.read_csv(self.input().path)
        df.fillna(value='', inplace=True)
        rows = df.to_dict(orient='records')

        supabase = get_supabase_client()
        supabase.table("Tweet").insert(rows).execute()

    def requires(self):
        return ReadTweets(last_tweet_id=self.last_tweet_id)


class FetchLatestTweetsToDB(luigi.Task):
    def requires(self):
        supabase = get_supabase_client()
        data = supabase.table("Tweet").select("id").order('id', desc=True).limit(1).execute()
        last_tweet_id = data.data[0]['id']

        return CopyTweetsToDB(last_tweet_id=last_tweet_id)
