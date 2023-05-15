import json
import logging
from datetime import datetime
from typing import Optional

import luigi
from tqdm import tqdm

from get_metadata_for_urls import get_title_for_url
from scraping.webpage_scraper import WebpageScraper
from settings import DATE_FORMAT
from tasks.base_loopie_task import BaseLoopieTask
from utils import chunkify

tqdm.pandas()
logger = logging.getLogger('luigi-interface')


class AddNewsItemTitle(BaseLoopieTask):
    start_date = luigi.DateParameter(default=datetime.today())
    # interval to next github action to get tweets is two hours
    MAX_ITEMS_TO_SCRAPE_IN_TWO_HOUR_INTERVAL = 1500

    def get_query(self) -> Optional[str]:
        return f'''
        SELECT id::text,created_at::text, url, description, title
        from "NewsItem" ni
        where ni.title IS NULL and ni.created_at::date >= CURRENT_DATE - interval '3 day'
        order by ni.created_at desc
        limit {self.MAX_ITEMS_TO_SCRAPE_IN_TWO_HOUR_INTERVAL}
        ;
        '''

    def complete(self):
        return len(self.df) == 0

    def run(self):
        logger.info(f'scraping {len(self.df)} urls to get titles for news items with start date {self.start_date}')

        scraper = WebpageScraper()
        self.df['title'] = self.df.progress_apply(lambda row:
                                                  get_title_for_url(row['url'], scraper),
                                                  axis=1)
        scraper.driver.close()

        metadata_for_upsert = self.df[self.df.title.str.len() > 0][
            ['id', 'created_at', 'url', 'description', 'title']].to_dict(orient='records')
        if not metadata_for_upsert:
            return

        metadata_chunks = chunkify(metadata_for_upsert, 50)
        metadata_added_count = 0

        for metadata_chunk in metadata_chunks:
            try:
                resp_upsert = self.supabase.table("NewsItem").upsert(metadata_chunk, count='exact').execute()
                metadata_added_count += resp_upsert.count
            except json.decoder.JSONDecodeError:
                logger.exception(f'Failed to add new titles for news items {metadata_for_upsert}')

        logger.info(f'Added {metadata_added_count} news item titles')
