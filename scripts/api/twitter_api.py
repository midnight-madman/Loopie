import time
from typing import List, Dict

import requests

from settings import TWITTER_BEARER_TOKEN


def get_tweets_from_account(username: str, start_time: str = None, since_id: str = None) -> List[Dict]:
    search_url = "https://api.twitter.com/2/tweets/search/recent"

    # Optional params: start_time,end_time,since_id,until_id,max_results,next_token,
    # expansions,tweet.fields,media.fields,poll.fields,place.fields,user.fields
    default_params = {
        'query': f'(from:{username} url:"https://" -is:retweet)',
        'max_results': 100,
        'tweet.fields': 'created_at,text,author_id,entities,referenced_tweets,attachments,geo,public_metrics,possibly_sensitive,context_annotations'
    }

    if start_time:
        default_params['start_time'] = start_time
    elif since_id:
        default_params['since_id'] = since_id
    else:
        raise Exception('method needs start_time or since_id')

    json_response = execute_twitter_api_request(search_url, default_params)
    if not json_response or json_response["meta"]["result_count"] == 0:
        return []

    tweets = json_response['data']

    next_token = json_response['meta'].get('next_token')
    while next_token:
        # print('getting more data for', username)
        time.sleep(1)

        fetch_more_data_params = {'next_token': next_token}
        json_response = execute_twitter_api_request(search_url, {**default_params, **fetch_more_data_params})
        tweets.extend(json_response['data'])
        next_token = json_response['meta'].get('next_token')

    return tweets


def bearer_oauth(r):
    """
    Method required by bearer token authentication.
    """
    r.headers["Authorization"] = f"Bearer {TWITTER_BEARER_TOKEN}"
    r.headers["User-Agent"] = "v2RecentSearchPython"
    return r


def execute_twitter_api_request(url, params):
    response = requests.get(url, auth=bearer_oauth, params=params)
    if response.status_code != 200:
        if response.status_code == 400 and 'invalid username' in response.text.lower():
            print('ERROR: found invalid username, please fix in const.py file', url, response.text)
            print('will skip this and continue with scraping')
            return {}
        else:
            raise Exception(url, response.status_code, response.text)
    return response.json()