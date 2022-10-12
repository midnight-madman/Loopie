import logging
from datetime import datetime

import luigi

from tasks.base_loopie_task import BaseLoopieTask
from tasks.utils import create_news_item_to_tags_connections
from utils import chunkify

logger = logging.getLogger('luigi-interface')


class CreateNewsItemToTagConnections(BaseLoopieTask):
    start_date = luigi.DateParameter(default=datetime.today())

    def get_query(self) -> str:
        # query for news items without tags
        return f'''
        Select news_item.*, count(tag.id)
        from "NewsItem" news_item
                 left join "NewsItemToTag" nitt on news_item.id = nitt.news_item_id
                 left join "Tag" tag on nitt.tag_id = tag.id
        group by news_item.id
        HAVING count(tag.id) = 0 and news_item.title is not NULL
        '''

    def complete(self):
        return len(self.df) == 0

    def run(self):
        news_items = self.df.to_dict(orient='records')
        new_tag_connections = create_news_item_to_tags_connections(news_items)

        if new_tag_connections:
            insert_count = 0
            for new_connections_chunk in chunkify(new_tag_connections, 30):
                resp = self.supabase.table("NewsItemToTag").insert(new_connections_chunk, count='exact').execute()
                insert_count += resp.count
            logger.info(f'News tag connections for news items created: {insert_count}')
        else:
            logger.info(f'No new tag connections for news items created')
