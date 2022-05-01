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
        created_ats = []

        for item in df.created_ats.to_list():
            item = item.replace("['", '').replace("']", '')
            item = item.split("', '")

            if len(item) > 1:
                for created_at in item:
                    created_ats.append(created_at)
            else:
                created_ats.append(item[0])

        df_all_created_ats = [dateutil.parser.isoparse(item) for item in created_ats]
        latest_tweet_date_in_df = max(df_all_created_ats)

        if not latest_tweet_date or latest_tweet_date < latest_tweet_date_in_df:
            latest_fname = fname
            latest_tweet_date = latest_tweet_date_in_df

    return latest_fname
