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
from supabase_utils import upload_content_to_supabase
from tasks.base_loopie_task import BaseLoopieTask
from utils import chunkify

tqdm.pandas()
logger = logging.getLogger('luigi-interface')

BUCKET_NAME = 'NewsItemTexts'


class AddNewsItemSummary(BaseLoopieTask):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.scraped_file_ids = [file.get('name') for file in self.supabase.storage.from_(BUCKET_NAME).list()]

    def get_query(self) -> Optional[str]:
        return f'''
        select ni.news_item_id as id, ni.url from "scorednewsitem" ni
            left join "NewsItemSummary" nis on ni.news_item_id=nis.news_item_id
        where nis.id is NULL and last_tweet_date >= CURRENT_DATE - interval '3 day'
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

    def get_content_for_row(self, row, scraper) -> str:
        if row['id'] in self.scraped_file_ids:
            print(f'Found {row["id"]} in supabase storage, skipping scraping for {row["url"]}')
            content = self.supabase.storage.from_(BUCKET_NAME).download(row['id']).decode('utf-8')
        else:
            content = get_content_for_url(get_scrapeable_url(row['url']), scraper)
        return content

    def run(self):
        logger.info(f'creating summaries for {len(self.df)} news items')
        scraper = WebpageScraper()

        self.df['content'] = self.df.progress_apply(lambda row:
                                                    self.get_content_for_row(row, scraper),
                                                    axis=1)
        scraper.driver.close()

        should_upload_to_supabase_filter = (self.df.content.str.len() > 0) & ~(self.df.id.isin(self.scraped_file_ids))
        self.df[should_upload_to_supabase_filter].progress_apply(lambda row:
                                                                 upload_content_to_supabase(supabase=self.supabase,
                                                                                            content=row['content'],
                                                                                            bucket=BUCKET_NAME,
                                                                                            destination=row['id']),
                                                                 axis=1)

        self.df['news_item_id'] = self.df['id']
        self.df['summary'] = ''
        self.df['metadata'] = None

        logger.info('Start creating summaries via OpenAI API')
        self.df = self.df[self.df.content.str.len() > 0].progress_apply(get_open_api_summary, axis=1)
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
