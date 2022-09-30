import json
import logging
from datetime import datetime
from typing import Optional

import luigi
from tqdm import tqdm

from get_metadata_for_urls import get_title_for_url
from scraping.webpage_title_scraper import WebpageTitleScraper
from settings import DATE_FORMAT
from tasks.base_loopie_task import BaseLoopieTask

tqdm.pandas()
logger = logging.getLogger('luigi-interface')


class GetMetadataForUrls(BaseLoopieTask):
    start_date = luigi.DateParameter(default=datetime.today())

    def get_query(self) -> Optional[str]:
        return f'''
        SELECT id::text,created_at::text, url, description, title
        from "NewsItem" ni
        where ni.title IS NULL and ni.created_at::date >= '{self.start_date.strftime(DATE_FORMAT)}'
        order by ni.created_at desc; 
        '''

    def complete(self):
        return len(self.df) == 0

    def run(self):
        logger.info(f'scraping {len(self.df)} titles for news items')

        scraper = WebpageTitleScraper()
        self.df['title'] = self.df.progress_apply(lambda row:
                                                  get_title_for_url(row['url'], scraper),
                                                  axis=1)

        scraper.driver.close()

        data_for_upsert = self.df[self.df.title.str.len() > 0][['id', 'created_at', 'url', 'description', 'title']].to_dict(orient='records')
        if not data_for_upsert:
            return

        try:
            resp_upsert = self.supabase.table("NewsItem").upsert(data_for_upsert, count='exact', returning='minimal').execute()
        except json.decoder.JSONDecodeError:
            logger.exception(f'Failed to upsert new titles for news items {data_for_upsert}')
        logger.info(f'Added {resp_upsert.count} titles for news items')
