import json
import logging
from datetime import datetime
from itertools import chain
from typing import Optional

from tqdm import tqdm

from api.openai import get_open_api_summary
from const import TAG_AUTOMATION
from get_metadata_for_urls import get_content_for_url
from scraping.webpage_scraper import WebpageScraper
from tasks.base_loopie_task import BaseLoopieTask
from utils import chunkify

tqdm.pandas()
logger = logging.getLogger('luigi-interface')


MIN_TEXT_LENGTH = 5000
OPENAI_REQUEST_METADATA = dict(model="text-davinci-002",
                               temperature=0.7,
                               max_tokens=256,
                               top_p=1.0,
                               frequency_penalty=0.0,
                               presence_penalty=1)



    if not text or len(text) < MIN_TEXT_LENGTH:
        return ''

    text = text[:OPENAI_MODEL_MAX_CHARACTERS]
    try:
        response = openai.Completion.create(
            prompt=f"{text}\n\nQ: Could you please summarize the article above in three sentences?",
            **OPENAI_REQUEST_METADATA
        )
    except openai.error.InvalidRequestError as ex:
        logger.exception(f'Failed to get summary for text with OpenAI exception {ex}')
        return ''


    row['summary'] = summary
    row['metadata'] = response
    return row


class CreateNewsItemSummary(BaseLoopieTask):
    def get_query(self) -> Optional[str]:
        three_days_ago = datetime.now().strftime('%Y-%m-%d')
        return f'''
        select ni.id, ni.url from "scorednewsitem" ni
        left join "NewsItemSummary" nis on ni.id=nis.news_item_id
        where nis.id is NULL and last_tweet_date >= '{three_days_ago}'
        order by ni.score DESC
        limit 10;
        '''

    def complete(self):
        return len(self.df) == 0

    def run(self):
        urls_to_skip = list(chain.from_iterable([v['urls'] for v in TAG_AUTOMATION.values()]))
        self.df = self.df[~self.df.url.str.contains('|'.join(urls_to_skip))]

        logger.info(f'creating summary for {len(self.df)} news items')
        scraper = WebpageScraper()

        self.df['content'] = self.df.progress_apply(lambda row:
                                                    get_content_for_url(row['url'], scraper),
                                                    axis=1)
        scraper.driver.close()

        self.df = self.df.progress_apply(get_open_api_summary, axis=1)
        self.df['news_item_id'] = self.df['id']
        summaries_for_upsert = self.df[self.df.summary.str.len() > 0][['news_item_id', 'summary', 'metadata']] \
            .to_dict(orient='records')

        if not summaries_for_upsert:
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
