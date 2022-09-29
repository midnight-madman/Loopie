import logging
from datetime import datetime
from typing import Optional

import luigi

from get_metadata_for_urls import get_title_for_url
from settings import DATE_FORMAT
from tasks.base_loopie_task import BaseLoopieTask
from scraping.webpage_title_scraper import WebpageTitleScraper

logger = logging.getLogger(__name__)


class GetMetadataForUrls(BaseLoopieTask):
    start_date = luigi.DateParameter(default=datetime.today())

    def get_query(self) -> Optional[str]:
        return f'''
        SELECT *
        from "NewsItem" ni
        where ni.title IS NULL and ni.created_at::date >= '{self.start_date.strftime(DATE_FORMAT)}'; 
        '''

    def complete(self):
        return len(self.df) == 0

    def run(self):
        logger.info(f'scraping {len(self.df)} titles for news items')

        scraper = WebpageTitleScraper()
        self.df['title'] = self.df.apply(lambda row:
                                        get_title_for_url(row['url'], scraper),
                                        axis=1)

        scraper.driver.close()

        data_for_upsert = self.df[~self.df.title.isnull()][['id', 'title']].to_dict(orient='records')
        self.supabase.table("NewsItem").upsert(data_for_upsert, count="exact")
        logger.info(f'Added {len(data_for_upsert)} titles for news items')
