from io import StringIO

import pandas as pd
import requests

from settings import IPFS_ENDPOINT, INFURA_USERNAME, INFURA_PASSWORD
from utils import try_get_ipfs_hash_fname_in_local_cache, get_ipfs_hash_local_cache_filename


def get_dataframe_from_ipfs_hash(ipfs_hash: str) -> pd.DataFrame:
    file_from_local_cache = try_get_ipfs_hash_fname_in_local_cache(ipfs_hash)
    if file_from_local_cache:
        fname_or_file = file_from_local_cache
        print(f'read file {ipfs_hash} from cache')
    else:
        params = dict(arg=ipfs_hash)
        response = requests.post(IPFS_ENDPOINT + '/api/v0/get', params=params, auth=(INFURA_USERNAME, INFURA_PASSWORD))
        file_content = StringIO(response.content.decode('utf-8'))
        with open(get_ipfs_hash_local_cache_filename(ipfs_hash), mode='w') as f:
            print(file_content.getvalue(), file=f)
        fname_or_file = file_content
        print(f'read file {ipfs_hash} from ipfs')

    df = pd.read_csv(fname_or_file)

    # name of the first column is the ipfs hash instead of "url", replace here when reading
    df.rename(columns={df.columns[0]: "url"}, inplace=True)
    df = df[df['url'].notna()]
    if 'tweet_id' in df.columns:
        df['tweet_id'] = df['tweet_id'].astype('int64')
    if 'author_id' in df.columns:
        df['author_id'] = df['author_id'].astype('int64')

    return df


def upload_file_to_ipfs(fname: str) -> str:
    print(f'uploading file {fname} to IPFS')
    files = dict(file=(open(fname, 'r')))

    response = requests.post(IPFS_ENDPOINT + '/api/v0/add', files=files, auth=(INFURA_USERNAME, INFURA_PASSWORD))
    if response.status_code != 200:
        raise Exception('ipfs upload failed')

    hash = response.text.split(",")[1].split(":")[1].replace('"', '')
    print('uploaded to ipfs under hash:', hash)

    return f'/ipfs/{hash}'
