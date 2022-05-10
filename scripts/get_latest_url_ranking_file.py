from ast import literal_eval

import dateutil.parser
import pandas as pd


def get_latest_url_ranking_file(csv_files):
    if len(csv_files) == 1:
        return csv_files[0]

    # find latest url ranking file based on when the last tweet published in file
    latest_fname = ''
    latest_tweet_date = None

    for fname in csv_files:
        df = pd.read_csv(fname, converters={"created_at": literal_eval})
        all_created_ats_nested = [parse_str_list_of_dates(row_created_ats) for row_created_ats in df.created_ats.to_list()]
        df_all_created_ats = [item for sublist in all_created_ats_nested for item in sublist]
        latest_tweet_date_in_df = max(df_all_created_ats)

        if not latest_tweet_date or latest_tweet_date < latest_tweet_date_in_df:
            latest_fname = fname
            latest_tweet_date = latest_tweet_date_in_df

    return latest_fname


def parse_str_list_of_dates(str_list_of_dates):
    str_list_of_dates = str_list_of_dates.replace("['", '').replace("']", '')
    dates = str_list_of_dates.split("', '")
    return [dateutil.parser.isoparse(date) for date in dates]
