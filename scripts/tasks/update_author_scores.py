import logging
from datetime import datetime
from typing import Optional

import luigi
import numpy as np
from tqdm import tqdm

from get_twitter_account_scores import create_accounts_with_scores_df
from settings import DATE_FORMAT
from tasks.base_loopie_task import BaseLoopieTask

tqdm.pandas()
logger = logging.getLogger('luigi-interface')


class UpdateAuthorScores(BaseLoopieTask):
    last_updated_date = luigi.DateParameter(default=datetime.today())

    def get_query(self) -> Optional[str]:
        return f'''
        SELECT twitter_id::text, twitter_username, score
        from "Author" author
        --where author.updated_at is null or author.updated_at::date <= '{self.last_updated_date.strftime(DATE_FORMAT)}';
        '''

    def complete(self):
        return len(self.df) == 0

    def run(self):
        logger.info(f'updating scores for {len(self.df)} authors')

        df_scores = create_accounts_with_scores_df(list(self.df.twitter_id))
        df_for_upsert = self.df.merge(df_scores, left_on='twitter_id', right_on='id')
        df_for_upsert['score'] = df_for_upsert.score_y.astype(int)
        df_for_upsert['twitter_username'] = df_for_upsert.username  # update or create usernames
        table_cols = ['twitter_id', 'twitter_username', 'score']
        col_names_for_data_dict = [c for c in df_for_upsert.columns if c.startswith('public_metrics')]
        all_cols = col_names_for_data_dict + table_cols

        data_for_upsert = df_for_upsert[~df_for_upsert.score.isnull()][all_cols].to_dict(orient='records')
        data_for_upsert = [{
            **{k: v for k, v in d.items() if k not in col_names_for_data_dict},
            **{'data': {k: v for k, v in d.items() if k in col_names_for_data_dict and v and not np.isnan(v)}}
        } for d in data_for_upsert]
        resp_upsert = self.supabase.table("Author").upsert(data_for_upsert, count="exact").execute()

        logger.info(f'Updated {resp_upsert.count} scores for authors')
