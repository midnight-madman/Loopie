import pandas as pd
from tqdm import tqdm

from api.twitter_api import execute_twitter_api_request_with_retry
from const import ACCOUNTS
from settings import ACCOUNT_SCORES_FNAME

QUANTILE_THRESHOLDS = [0.3, 0.6, 0.9]
VERIFIED_SCORE = 20
QUANTILE_SCORE_MULTIPLIER = 20


def get_twitter_account_stats(account: str) -> dict:
    search_url = f"https://api.twitter.com/2/users/by/username/{account}"
    default_params = {'user.fields': 'public_metrics,location,name,verified,entities'}
    json_response = execute_twitter_api_request_with_retry(search_url, default_params)
    try:
        return json_response['data']
    except KeyError:
        print(f'failed to get account stats for {account}: {json_response}')
        return {}


def get_twitter_accounts_stats_by_ids(user_ids: list[str]) -> list[dict]:
    user_id_chunks = [user_ids[i:i + 50] for i in range(0, len(user_ids), 50)]  # 100 per chunk is max
    search_url = f'https://api.twitter.com/2/users/'

    account_stats = []
    for user_id_chunk in tqdm(user_id_chunks):
        ids = ','.join([str(user_id) for user_id in user_id_chunk])
        params = {'ids': ids, 'user.fields': 'public_metrics,location,name,verified,entities'}
        json_response = execute_twitter_api_request_with_retry(search_url, params)

        account_stats.extend(json_response['data'])

    return account_stats


def create_quantile_score_for_col(df: pd.DataFrame, col: str):
    col_quantiles = df[col].quantile(QUANTILE_THRESHOLDS)

    for threshold, quantile in list(zip(QUANTILE_THRESHOLDS, col_quantiles)):
        df.loc[df[col] >= quantile, f'{col}_score'] = threshold * QUANTILE_SCORE_MULTIPLIER

    return df


def get_score_for_row(row):
    scores = [k for k in row.keys() if '_score' in k]
    return sum([row[col] for col in scores])


def create_accounts_with_scores_df(accounts) -> pd.DataFrame:
    res = get_twitter_accounts_stats_by_ids(accounts)
    # res = [get_twitter_account_stats(account) for account in tqdm(accounts)]
    res = [r for r in res if r]
    df = pd.json_normalize(res, sep='_')

    df = create_quantile_score_for_col(df, col='public_metrics_followers_count')
    df = create_quantile_score_for_col(df, col='public_metrics_listed_count')
    df['verified_score'] = df.verified.apply(lambda v: VERIFIED_SCORE if v else 0)
    df['score'] = df.apply(get_score_for_row, axis=1)
    df.fillna({"score": 0}, inplace=True)
    return df


def create_account_scores_file():
    print(f'loading twitter account stats for {len(ACCOUNTS)} accounts')
    df = create_accounts_with_scores_df(ACCOUNTS)
    print(f'saving account scores to {ACCOUNT_SCORES_FNAME}')
    df[['id', 'username', 'score']].to_csv(ACCOUNT_SCORES_FNAME, index=False)


if __name__ == '__main__':
    create_account_scores_file()
