import datetime

import pandas as pd

from utils import get_local_url_filenames
from api.ipfs import get_dataframe_from_ipfs_hash
from settings import USE_IPFS_TO_READ_DATA, URL_FILES_IPFS_HASHES_FNAME


def load_all_local_url_files_as_dataframe():
    csv_files = get_local_url_filenames()
    csv_files = [f for f in csv_files if 'leaderboard' not in f]
    df = pd.concat([pd.read_csv(fname) for fname in csv_files])
    df.created_at = pd.to_datetime(df.created_at, utc=True)
    print('loaded all urls via local files', len(df))
    return df


def get_ipfs_hash_for_url_files():
    ipfs_hashes = open(URL_FILES_IPFS_HASHES_FNAME, 'r').read().splitlines()
    ipfs_hashes = [hash for hash in ipfs_hashes if hash and hash.startswith('/ipfs/')]
    return ipfs_hashes


def load_all_url_files_from_ipfs():
    ipfs_hashes = get_ipfs_hash_for_url_files()
    df = pd.concat([get_dataframe_from_ipfs_hash(hash) for hash in ipfs_hashes])
    df.created_at = pd.to_datetime(df.created_at, utc=True)
    print('loaded all urls via files in IPFS', len(df))
    return df


def create_ranking_df(df):
    df_new = df.groupby('url').agg(lambda x: list(x))
    df_new['created_at'] = df_new.created_at.apply(lambda x: [ts.isoformat() for ts in x])
    df_new['tweet_count'] = df_new.tweet_id.apply(lambda x: len(x))
    df_new.sort_values(by=['tweet_count'], ascending=False, inplace=True)
    df_new['url_title'] = df_new.url_title.apply(lambda x: x[0])

    df_new.rename(columns={'tweet_id': 'tweet_ids',
                           'author_id': 'author_ids',
                           'author_username': 'author_usernames',
                           'created_at': 'created_ats'}, inplace=True)
    return df_new


def generate_url_rankings():
    if USE_IPFS_TO_READ_DATA:
        df_urls = load_all_url_files_from_ipfs()
    else:
        df_urls = load_all_local_url_files_as_dataframe()

    one_week_ago = pd.Timestamp.utcnow() - pd.offsets.Day(7)
    df_urls_last_week = df_urls[df_urls.created_at > one_week_ago]
    df_ranking_last_week = create_ranking_df(df_urls_last_week)
    fname = f'data/weekly_leaderboard_{datetime.datetime.utcnow()}.csv'
    df_ranking_last_week.to_csv(fname)
    return fname

    # one_month_ago = pd.Timestamp.utcnow() - pd.offsets.Day(30)
    # df_urls_last_month = df_urls[df_urls.created_at > one_month_ago]
    # df_ranking_last_month = create_ranking_df(df_urls_last_month)
    # df_ranking_last_month.to_csv(f'data/monthly_leaderboard_{datetime.datetime.utcnow()}.csv')


if __name__ == "__main__":
    generate_url_rankings()
