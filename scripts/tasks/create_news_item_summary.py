import json
import logging
from datetime import datetime, timedelta
from itertools import chain
from typing import Optional

import pandas as pd
from tqdm import tqdm

from api.openai import get_open_api_summary
from api.wayback_machine import get_scrapeable_url
from const import TAG_AUTOMATION
from get_metadata_for_urls import get_content_for_url
from scraping.webpage_scraper import WebpageScraper
from tasks.base_loopie_task import BaseLoopieTask
from utils import chunkify

tqdm.pandas()
logger = logging.getLogger('luigi-interface')


class CreateNewsItemSummary(BaseLoopieTask):
    def get_query(self) -> Optional[str]:
        three_days_ago = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
        return f'''
        select ni.id, ni.url from "scorednewsitem" ni
        left join "NewsItemSummary" nis on ni.id=nis.news_item_id
        where nis.id is NULL and last_tweet_date >= '{three_days_ago}'
        order by ni.score DESC
        limit 20;
        '''

    def get_df(self) -> Optional[pd.DataFrame]:
        df = super().get_df()
        urls_to_skip = list(chain.from_iterable([v['urls'] for v in TAG_AUTOMATION.values()]))
        df = df[~df.url.str.contains('|'.join(urls_to_skip))]
        return df

    def complete(self):
        return len(self.df) == 0

    def run(self):
        logger.info(f'creating summaries for {len(self.df)} news items')
        scraper = WebpageScraper()

        self.df['content'] = self.df.progress_apply(lambda row:
                                                    get_content_for_url(get_scrapeable_url(row['url']), scraper),
                                                    axis=1)
        scraper.driver.close()

        self.df['news_item_id'] = self.df['id']
        self.df['summary'] = ''
        self.df['metadata'] = None

        self.df = self.df.progress_apply(get_open_api_summary, axis=1)
        summaries_for_upsert = self.df[self.df.summary.str.len() > 0][['news_item_id', 'summary', 'metadata']] \
            .to_dict(orient='records')

        if not summaries_for_upsert:
            logger.info('no summaries to upload to DB because none were created')
            return

        summary_chunks = chunkify(summaries_for_upsert, 50)
        summary_added_count = 0

        for metadata_chunk in summary_chunks:
            try:
                resp_upsert = self.supabase.table("NewsItemSummary").insert(metadata_chunk, count='exact').execute()
                summary_added_count += resp_upsert.count
            except json.decoder.JSONDecodeError:
                logger.exception(f'Failed to add NewsItemSummary objects {summaries_for_upsert}')

        logger.info(f'Added {summary_added_count} NewsItemSummary objects')
