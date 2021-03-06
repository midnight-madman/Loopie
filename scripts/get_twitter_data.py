import datetime
import time
from typing import Optional

import pandas as pd
from tqdm import tqdm

from api.ipfs import get_dataframe_from_ipfs_hash
from api.twitter_api import get_tweets_from_account
from const import ACCOUNTS
from settings import DATA_DIR, USE_IPFS_TO_READ_DATA
from utils import get_local_url_filenames, read_url_file_ipfs_hashes_from_local_history


def get_tweets_dataframe_from_account(username: str, start_time: str, since_id: str) -> Optional[pd.DataFrame]:
    tweets = get_tweets_from_account(username, start_time, since_id)
    if not tweets:
        return None

    df = pd.DataFrame(tweets)
    df.index = df.id
    df['author_username'] = username

    return df


def get_urls_from_tweets_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    urls_to_store = []
    for index, data in df.iterrows():
        urls = data.entities and isinstance(data.entities, dict) and data.entities.get('urls')
        if urls:
            for url in urls:
                obj = dict(url=url['expanded_url'],
                           tweet_id=data.id,
                           author_id=data.author_id,
                           author_username=data.author_username,
                           created_at=data.created_at)
                urls_to_store.append(obj)

    df_urls = pd.DataFrame(urls_to_store)
    print(f'got {len(df_urls)} urls')
    return df_urls


def get_tweets_since_time_or_id(start_time=None, since_id=None):
    if not start_time and not since_id:
        raise Exception('method needs either start_time or since_id')

    print(f'getting tweets for {len(ACCOUNTS)} accounts since id {since_id} or start time {start_time}')
    tweets_dataframes = []
    for account in tqdm(ACCOUNTS):
        tweets_df = get_tweets_dataframe_from_account(account, start_time, since_id)
        time.sleep(1)

        if tweets_df is not None:
            tweets_dataframes.append(tweets_df)

    if not tweets_dataframes:
        print('got no new tweets from Twitter API')
        return None

    print(f'got {len(tweets_dataframes)} dataframes with tweets')
    df = pd.concat(tweets_dataframes)
    print(f'got {len(df)} tweets')
    return df


def download_tweets_to_file_from_scratch() -> Optional[str]:
    timespan_days = 6
    timespan = datetime.timedelta(days=timespan_days)
    start_time_str = (datetime.datetime.utcnow() - timespan).isoformat() + 'Z'
    df = get_tweets_since_time_or_id(start_time=start_time_str)
    if df is None:
        return None

    df_urls = get_urls_from_tweets_dataframe(df)
    fname = f'{DATA_DIR}urls_{timespan_days}days_since_{start_time_str}.csv'
    df_urls.to_csv(fname, index=False)
    return fname


def download_tweets_to_file_since_last_tweet_id(latest_tweet_id: str) -> Optional[str]:
    df = get_tweets_since_time_or_id(since_id=latest_tweet_id)
    if df is None:
        return None

    # df.to_csv(f'data/tweets_since_id_{latest_tweet_id}.csv', index=False)
    df_urls = get_urls_from_tweets_dataframe(df)
    fname = f'{DATA_DIR}urls_since_id_{latest_tweet_id}.csv'
    df_urls.to_csv(fname, index=False)
    return fname


def get_latest_tweet_id_from_dataframes(dataframes: list) -> str:
    latest_tweet_id = 0

    for df in dataframes:
        if 'tweet_id' not in df.columns or len(df) == 0:
            continue

        latest_tweet_in_df = df.loc[df.tweet_id == df.tweet_id.max()].iloc[0]
        latest_tweet_id_in_df = latest_tweet_in_df.tweet_id.item()
        if latest_tweet_id < latest_tweet_id_in_df:
            latest_tweet_id = latest_tweet_id_in_df

    print(f'getting latest tweets, starting from latest tweet id {latest_tweet_id}')
    return latest_tweet_id


def get_latest_tweet_id_from_url_files(csv_files) -> str:
    print(f'getting latest tweet id from {len(csv_files)} local csv files')
    dataframes = [pd.read_csv(fname) for fname in csv_files]
    return get_latest_tweet_id_from_dataframes(dataframes)


def get_latest_tweet_id_from_ipfs_files(ipfs_hashes) -> str:
    print(f'getting latest tweet id from {len(ipfs_hashes)} files in ipfs')
    dataframes = [get_dataframe_from_ipfs_hash(hash) for hash in ipfs_hashes]
    return get_latest_tweet_id_from_dataframes(dataframes)


def get_twitter_data() -> str:
    csv_files = get_local_url_filenames()
    ipfs_hashes = read_url_file_ipfs_hashes_from_local_history()
    has_ipfs_hashes = USE_IPFS_TO_READ_DATA and len(ipfs_hashes) > 0
    start_from_scratch = not csv_files and not has_ipfs_hashes

    if start_from_scratch:
        fname = download_tweets_to_file_from_scratch()
    else:
        if has_ipfs_hashes:
            latest_tweet_id = get_latest_tweet_id_from_ipfs_files(ipfs_hashes)
        else:
            latest_tweet_id = get_latest_tweet_id_from_url_files(csv_files)
        fname = download_tweets_to_file_since_last_tweet_id(latest_tweet_id)

    if fname:
        print(f'downloaded new tweets to {fname}')
    return fname


if __name__ == "__main__":
    get_twitter_data()
