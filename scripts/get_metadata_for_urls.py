import pandas as pd
import requests
from lxml.html import fromstring
from tqdm import tqdm

from scraping.webpage_title_scraper import WebpageTitleScraper
from utils import get_local_url_filenames

tqdm.pandas()


# import cloudscraper
# scraper = cloudscraper.create_scraper(
#     delay=5,
#     browser={
#         'browser': 'firefox',
#         'platform': 'windows',
#         'mobile': False
#     },
#     interpreter='nodejs'
# )


def can_get_title_from_url(url):
    # heuristics based on previous failed scraping runs
    if 'twitter.com' in url:
        return False

    return True


def is_valid_title(title: str) -> bool:
    if 'access denied' == title.lower():
        return False
    elif 'Attention Required' in title and 'cloudflare' in title.lower():
        return False
    return True


def clean_title(title: str) -> str:
    title = title.replace('\n', '').replace('\r', '')
    return title


def get_title_from_python_request(url: str) -> str:
    try:
        r = scraper.get(url)
        # r = requests.get(url, timeout=30, headers=headers)
    except KeyboardInterrupt:
        return ''
    except requests.exceptions.RequestException as e:
        print('got some with getting title for webpage', url, e)
        return ''

    tree = fromstring(r.content)
    title = tree.findtext('.//title')
    return title or ''


def get_title_for_url(url: str, scraper: WebpageTitleScraper) -> str:
    if not can_get_title_from_url(url):
        return ''

    title = scraper.get_page_title(url)
    title = clean_title(title)
    return title if is_valid_title(title) else ''


def get_metadata_for_url_file(fname):
    df = pd.read_csv(fname)
    print(f'scraping {len(df)} titles in file: {fname}')

    scraper = WebpageTitleScraper()
    df['url_title'] = df.progress_apply(lambda row:
                                        row['url_title']
                                        if row.get('url_title')
                                        else get_title_for_url(row['url'], scraper),
                                        axis=1)

    df.to_csv(fname, index=False)
    scraper.driver.close()


def get_metadata_for_all_url_files():
    for fname in get_local_url_filenames():
        get_metadata_for_url_file(fname)


if __name__ == "__main__":
    get_metadata_for_all_url_files()
