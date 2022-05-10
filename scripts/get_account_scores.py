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


def create_quantile_score_for_col(df: pd.DataFrame, col: str):
    col_quantiles = df[col].quantile(QUANTILE_THRESHOLDS)

    for threshold, quantile in list(zip(QUANTILE_THRESHOLDS, col_quantiles)):
        df.loc[df[col] >= quantile, f'{col}_score'] = threshold * QUANTILE_SCORE_MULTIPLIER

    return df


def get_score_for_row(row):
    scores = [k for k in row.keys() if '_score' in k]
    return sum([row[col] for col in scores])


def create_account_scores_file():
    print(f'loading twitter account stats for {len(ACCOUNTS)} accounts')
    res = [get_twitter_account_stats(account) for account in tqdm(ACCOUNTS)]
    res = [r for r in res if r]
    df = pd.json_normalize(res, sep='_')

    print('creating account scores')
    df = create_quantile_score_for_col(df, col='public_metrics_followers_count')
    df = create_quantile_score_for_col(df, col='public_metrics_listed_count')
    df['verified_score'] = df.verified.apply(lambda v: VERIFIED_SCORE if v else 0)
    df['score'] = df.apply(get_score_for_row, axis=1)
    df.fillna({"score": 0}, inplace=True)

    print(f'saving account scores to {ACCOUNT_SCORES_FNAME}')
    df[['id', 'username', 'score']].to_csv(ACCOUNT_SCORES_FNAME, index=False)


if __name__ == '__main__':
    create_account_scores_file()
