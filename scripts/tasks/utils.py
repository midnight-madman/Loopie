import logging
from typing import Optional

import pandas as pd

from api.postgres import get_db_connection, ALL_TAGS_QUERY
from const import TAG_AUTOMATION
from utils import contains_key_in_list

logger = logging.getLogger(__name__)


def get_tag_id_for_title(tag_title: str, tags_df: pd.DataFrame) -> Optional[str]:
    df_filtered = tags_df[tags_df.title == tag_title]
    return df_filtered.iloc[0]['id'] if len(df_filtered) == 1 else None


def create_tags_for_news_items(news_items: list[dict]) -> list[dict]:
    logger.info(f'generating tags for {len(news_items)} news items')

    db_connection = get_db_connection()
    tags_df = pd.read_sql_query(ALL_TAGS_QUERY, con=db_connection, coerce_float=False)

    tag_titles = list(TAG_AUTOMATION.keys())
    tag_title_to_id = {tag_title: get_tag_id_for_title(tag_title, tags_df) for tag_title in tag_titles}

    tags = []
    for news_item in news_items:
        news_item_id = news_item['id']
        title = news_item.get('title')

        for tag_title, tag_info in TAG_AUTOMATION.items():
            parent_tag_title = tag_info.get('parent')
            has_url = contains_key_in_list(news_item, 'url', tag_info['urls'])

            has_keyword = False
            if title:
                has_keyword = contains_key_in_list(news_item, 'title', tag_info['keywords'])

            should_add_tag = has_url or has_keyword
            if should_add_tag:
                tags.append({
                    'news_item_id': news_item_id,
                    'tag_id': tag_title_to_id[tag_title],
                    'wallet_address': 'AUTOMATION'
                })

                logger.info(f'added tag {tag_title} for news item {title} - reason: url {has_url} keyword {has_keyword}')

                if parent_tag_title:
                    tags.append({
                        'news_item_id': news_item_id,
                        'tag_id': tag_title_to_id[parent_tag_title],
                        'wallet_address': 'AUTOMATION'
                    })
                    logger.info(f'added tag {tag_title_to_id[parent_tag_title]} for news item {title} - reason: parent')

    # tags might have duplicates, make it unique
    tags = [dict(t) for t in {tuple(d.items()) for d in tags}]
    return tags
