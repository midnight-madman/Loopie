import logging

import postgrest

from tasks.base_loopie_task import BaseLoopieTask
from tasks.utils import create_tags_for_news_items
from utils import chunkify

logger = logging.getLogger('luigi-interface')


class AddNewsItemTags(BaseLoopieTask):
    def get_query(self) -> str:
        # query for news items without tags
        return f'''
            Select news_item.*, count(tag.id)
            from "NewsItem" news_item
                    left join "NewsItemToTag" nitt on news_item.id = nitt.news_item_id
                    left join "Tag" tag on nitt.tag_id = tag.id
            group by news_item.id
            HAVING count(tag.id) = 0 and news_item.title is not NULL 
            and news_item.created_at::date >= CURRENT_DATE - interval '5 day'
            order by news_item.created_at desc
            limit 1000;
        '''

    def complete(self):
        return len(self.df) == 0

    def run(self):
        logger.info(f'Create tags for {len(self.df)} news items')

        news_items = self.df.to_dict(orient='records')
        new_tag_connections = create_tags_for_news_items(news_items)

        if new_tag_connections:
            insert_count = 0
            for new_connections_chunk in chunkify(new_tag_connections, 5):
                try:
                    resp = self.supabase.table("NewsItemToTag").insert(new_connections_chunk, count='exact').execute()
                    insert_count += resp.count
                except postgrest.exceptions.APIError as e:
                    logger.exception(f'Error while inserting new tags: {e}')
            logger.info(f'new tags created: {insert_count}')
        else:
            logger.info(f'No new tags for news items created')
