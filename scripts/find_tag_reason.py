import argparse
import logging
import sys

from const import TAG_AUTOMATION

logging.basicConfig(stream=sys.stdout, level=logging.INFO)

logger = logging.getLogger(__name__)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--title', type=str, required=True)
    title = parser.parse_args().title.lower()
    has_found_tag = False

    logger.info(f'Checking for tags: {title}')
    for tag_title, tag_info in TAG_AUTOMATION.items():
        keywords = tag_info['keywords']

        for keyword in keywords:
            is_match = keyword.lower() in title
            if is_match:
                logger.info(f'{tag_title} tag matches for keyword: "{keyword}"')
                has_found_tag = True

    if not has_found_tag:
        logger.info('No tags found')
