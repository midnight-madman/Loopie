import datetime
import time
from typing import Optional, List, Dict

import pandas as pd
import requests
from tqdm import tqdm

from const import ACCOUNTS
from settings import TWITTER_BEARER_TOKEN
from utils import get_local_url_filenames


def get_tweets_from_account(username: str, start_time: str = None, since_id: str = None) -> List[Dict]:
    search_url = "https://api.twitter.com/2/tweets/search/recent"

    # Optional params: start_time,end_time,since_id,until_id,max_results,next_token,
    # expansions,tweet.fields,media.fields,poll.fields,place.fields,user.fields
    default_params = {
        'query': f'(from:{username} url:"https://" -is:retweet)',
        'max_results': 100,
        'tweet.fields': 'created_at,text,author_id,entities,referenced_tweets,attachments,geo,public_metrics,possibly_sensitive,context_annotations'
    }

    if start_time:
        default_params['start_time'] = start_time
    elif since_id:
        default_params['since_id'] = since_id
    else:
        raise Exception('method needs start_time or since_id')

    json_response = execute_twitter_api_request(search_url, default_params)
    if not json_response or json_response["meta"]["result_count"] == 0:
        return []

    tweets = json_response['data']

    next_token = json_response['meta'].get('next_token')
    while next_token:
        # print('getting more data for', username)
        time.sleep(1)

        fetch_more_data_params = {'next_token': next_token}
        json_response = execute_twitter_api_request(search_url, {**default_params, **fetch_more_data_params})
        tweets.extend(json_response['data'])
        next_token = json_response['meta'].get('next_token')

    return tweets


def bearer_oauth(r):
    """
    Method required by bearer token authentication.
    """
    r.headers["Authorization"] = f"Bearer {TWITTER_BEARER_TOKEN}"
    r.headers["User-Agent"] = "v2RecentSearchPython"
    return r


def execute_twitter_api_request(url, params):
    response = requests.get(url, auth=bearer_oauth, params=params)
    if response.status_code != 200:
        if response.status_code == 400 and 'invalid username' in response.text.lower():
            print('ERROR: found invalid username, please fix in const.py file', url, response.text)
            print('will skip this and continue with scraping')
            return {}
        else:
            raise Exception(url, response.status_code, response.text)
    return response.json()


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

    tweets_dataframes = []
    for account in tqdm(ACCOUNTS):
        tweets_df = get_tweets_dataframe_from_account(account, start_time, since_id)
        time.sleep(1)

        if tweets_df is not None:
            tweets_dataframes.append(tweets_df)

    df = pd.concat(tweets_dataframes)
    return df


def download_tweets_to_file_from_scratch() -> str:
    timespan_days = 6
    timespan = datetime.timedelta(days=timespan_days)
    start_time_str = (datetime.datetime.utcnow() - timespan).isoformat() + 'Z'
    df = get_tweets_since_time_or_id(start_time=start_time_str)
    df_urls = get_urls_from_tweets_dataframe(df)
    df_urls.to_csv(f'data/urls_{timespan_days}days_since_{start_time_str}.csv', index=False)


def download_tweets_to_file_since_last_tweet_id(latest_tweet_id: str) -> str:
    df = get_tweets_since_time_or_id(since_id=latest_tweet_id)
    # df.to_csv(f'data/tweets_since_id_{latest_tweet_id}.csv', index=False)
    df_urls = get_urls_from_tweets_dataframe(df)
    df_urls.to_csv(f'data/urls_since_id_{latest_tweet_id}.csv', index=False)


def get_latest_tweet_id_from_url_files(csv_files) -> str:
    latest_tweet_id = 0

    print('find out where to continue scraping by getting the latest tweet id from csv files')
    for fname in csv_files:
        print(fname)
        df = pd.read_csv(fname)

        if 'tweet_id' not in df.columns or len(df) == 0:
            continue

        latest_tweet_in_df = df.loc[df.tweet_id == df.tweet_id.max()].iloc[0]
        latest_tweet_id_in_df = latest_tweet_in_df.tweet_id.item()
        if latest_tweet_id < latest_tweet_id_in_df:
            latest_tweet_id = latest_tweet_id_in_df

    print(f'getting latest tweets, starting from latest tweet id {latest_tweet_id}')
    return latest_tweet_id


def get_twitter_data() -> str:
    csv_files = get_local_url_filenames()
    start_from_scratch = not csv_files

    fname = ''
    if start_from_scratch:
        fname = download_tweets_to_file_from_scratch()
    else:
        latest_tweet_id = get_latest_tweet_id_from_url_files(csv_files)
        fname = download_tweets_to_file_since_last_tweet_id(latest_tweet_id)

    print(f'downloaded new tweets to {fname}')
    return fname


if __name__ == "__main__":
    get_twitter_data()
