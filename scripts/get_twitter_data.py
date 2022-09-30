import ast

import pandas as pd
from tqdm import tqdm

from api.twitter_api import get_tweets_from_accounts, TwitterApiError, MaxQueryLengthTwitterApiError


def get_dataframe_from_tweets(tweets: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(tweets)
    return df


def get_urls_from_tweets_dataframe(df: pd.DataFrame) -> list[dict]:
    urls_to_store = []
    for index, data in df.iterrows():
        if not data.entities:
            continue

        try:
            # json_data2 = ast.literal_eval(json.dumps(data.entities))
            # json_data1 = json.loads(data.entities.replace('"', '\\"').replace("'", '"'))
            json_data = ast.literal_eval(data.entities)
            urls = json_data.get('urls')
        except ValueError as err:
            print('error when trying to read urls from tweets csv file', err, data.entities)
            continue

        for url in urls:
            obj = dict(
                url=url['expanded_url'],
                tweet_id=int(data.id),
                author_id=int(data.author_id),
                author_username=data.author_username,
                created_at=data.created_at,
                title=url.get('title', ''),
                description=url.get('description', '')
            )
            urls_to_store.append(obj)

    return urls_to_store


def get_tweets_since_time_or_id(accounts: list[str], since_id: str) -> pd.DataFrame:
    logger.info(f'getting tweets for {len(accounts)} accounts since id {since_id}')

    tweets_dataframes = []
    account_chunks = [accounts[i:i + 20] for i in range(0, len(accounts), 20)]  # twitter api query has max size

    for account_chunk in tqdm(account_chunks):
        try:
            tweets = get_tweets_from_accounts(account_chunk, since_id=since_id)
            tweets_df = get_dataframe_from_tweets(tweets)
        except MaxQueryLengthTwitterApiError:
            tweets_inner = []

            for account in account_chunk:
                tweets = get_tweets_from_accounts([account], since_id=since_id)
                tweets_inner.extend(tweets)

            tweets_df = get_dataframe_from_tweets(tweets_inner)

        if tweets_df is not None and len(tweets_df) > 0:
            tweets_dataframes.append(tweets_df)

    if not tweets_dataframes:
        logger.info('got no new tweets from Twitter API')
        return None

    logger.info(f'got {len(tweets_dataframes)} dataframes with tweets')
    df = pd.concat(tweets_dataframes)
    logger.info(f'got {len(df)} tweets')
    return df


def get_tweets_since_id_with_retry(accounts: list[str], since_id: str) -> pd.DataFrame:
    try:
        return get_tweets_since_time_or_id(accounts, since_id)
    except TwitterApiError as err:
        since_id_error_phrase = "Please use a \\'since_id\\' that is larger than "
        if since_id_error_phrase in str(err):
            new_since_id = str(err).split(since_id_error_phrase)[1].split('"')[0]
            new_since_id = int(new_since_id) + 10
            return get_tweets_since_time_or_id(accounts, new_since_id)
        else:
            raise err
