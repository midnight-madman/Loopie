import pandas as pd
from tqdm import tqdm

from api.twitter_api import execute_twitter_api_request_with_retry
from utils import chunkify

VERIFIED_SCORE = 5
SCORE_MULTIPLIER = 10
NR_BINS = 10

TWITTER_API_REQUESTED_FIELDS = {'user.fields': 'public_metrics,location,name,username,verified,entities'}


def get_twitter_account_stats(account: str) -> dict:
    search_url = f"https://api.twitter.com/2/users/by/username/{account}"
    default_params = TWITTER_API_REQUESTED_FIELDS
    json_response = execute_twitter_api_request_with_retry(search_url, default_params)
    try:
        return json_response['data']
    except KeyError:
        print(f'failed to get account stats for {account}: {json_response}')
        return {}


def get_twitter_accounts_stats_by_ids(user_ids: list[str]) -> list[dict]:
    user_id_chunks = chunkify(user_ids, 50)  # 100 per chunk is max
    search_url = f'https://api.twitter.com/2/users/'

    account_stats = []
    for user_id_chunk in tqdm(user_id_chunks):
        ids = ','.join([str(user_id) for user_id in user_id_chunk])
        params = {**{'ids': ids}, **TWITTER_API_REQUESTED_FIELDS}
        json_response = execute_twitter_api_request_with_retry(search_url, params)

        account_stats.extend(json_response['data'])

    return account_stats


def create_binned_score_for_col(df: pd.DataFrame, col: str, multiplier: int):
    ranges = pd.qcut(df[col], NR_BINS, labels=range(NR_BINS))
    df[f'{col}_score'] = (ranges.cat.codes + 1) * multiplier
    return df


def get_score_for_row(row):
    scores = [k for k in row.keys() if '_score' in k]
    return sum([row[col] for col in scores])


def create_accounts_with_scores_df(accounts: list[str]) -> pd.DataFrame:
    res = get_twitter_accounts_stats_by_ids(accounts)
    # res = [get_twitter_account_stats(account) for account in tqdm(accounts)]
    res = [r for r in res if r]
    df = pd.json_normalize(res, sep='_')

    df = create_binned_score_for_col(df, col='public_metrics_followers_count', multiplier=SCORE_MULTIPLIER)
    df = create_binned_score_for_col(df, col='public_metrics_listed_count', multiplier=2)
    df['verified_score'] = df.verified.apply(lambda v: VERIFIED_SCORE if v else 0)
    df['score'] = df.apply(get_score_for_row, axis=1)
    df.fillna({"score": 0}, inplace=True)
    return df
