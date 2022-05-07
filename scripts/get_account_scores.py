#!/usr/bin/env python
# coding: utf-8
import pandas as pd

from api.twitter_api import execute_twitter_api_request
from const import ACCOUNTS
from settings import ACCOUNT_SCORES_FNAME

QUANTILE_THRESHOLDS = [0.2, 0.4, 0.6, 0.8, 1.0]
VERIFIED_SCORE = 20


def get_twitter_account_stats(account: str) -> dict:
    search_url = f"https://api.twitter.com/2/users/by/username/{account}"
    default_params = {'user.fields': 'public_metrics,location,name,verified,entities'}
    json_response = execute_twitter_api_request(search_url, default_params)

    return json_response['data']


def create_quantile_score_for_col(df: pd.DataFrame, col: str):
    col_quantiles = df[col].quantile(QUANTILE_THRESHOLDS)

    for threshold, quantile in list(zip(QUANTILE_THRESHOLDS, col_quantiles)):
        df.loc[df[col] >= quantile, f'{col}_score'] = threshold * 100

    return df


def get_score_for_row(row):
    scores = [k for k in row.keys() if '_score' in k]
    return sum([row[col] for col in scores])


def create_account_scores_file():
    print(f'loading twitter account stats for {len(ACCOUNTS)} accounts')
    res = [get_twitter_account_stats(account) for account in ACCOUNTS]
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
