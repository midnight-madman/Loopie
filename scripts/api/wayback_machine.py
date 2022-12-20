import logging
from typing import Optional

import requests

WAYBACK_MACHINE_BASE_URL = "https://archive.org/wayback/available?url="

PREFER_ARCHIVE_URLS = [
    'nytimes',
    'washingtonpost.com',
    'ft.com',
    'wsj.com'
]

logger = logging.getLogger(__name__)


def get_archived_snapshots(url: str):
    resp = requests.get(WAYBACK_MACHINE_BASE_URL + url)
    return resp.json()['archived_snapshots']


def get_closest_archive_url(url: str) -> Optional[str]:
    try:
        snapshots = get_archived_snapshots(url)
        if snapshots and 'closest' in snapshots:
            return snapshots['closest']['url']
        else:
            return None
    except Exception as ex:
        logger.info(f'Failed to get archive url {url}. Error: {ex}')
        return None


def get_scrapeable_url(url: str) -> str:
    use_archive_url = any([prefer_archive_url in url for prefer_archive_url in PREFER_ARCHIVE_URLS])
    if use_archive_url:
        archive_url = get_closest_archive_url(url)
        if archive_url:
            logger.info(f'Found scrapeable url for url: {url}: {archive_url}')
            return archive_url

    return url
