from io import StringIO

import pandas as pd
import requests

from settings import IPFS_ENDPOINT, INFURA_USERNAME, INFURA_PASSWORD


def get_dataframe_from_ipfs_hash(ipfs_hash: str) -> pd.DataFrame:
    params = dict(arg=ipfs_hash)
    response = requests.post(IPFS_ENDPOINT + '/api/v0/get', params=params, auth=(INFURA_USERNAME, INFURA_PASSWORD))

    df = pd.read_csv(StringIO(response.content.decode('utf-8')))
    # name of the first column is the ipfs hash instead of "url", replace here when reading
    df.rename(columns={df.columns[0]: "url"}, inplace=True)
    df = df[df['url'].notna()]
    if 'tweet_id' in df.columns:
        df['tweet_id'] = df['tweet_id'].astype('int64')
    if 'author_id' in df.columns:
        df['author_id'] = df['author_id'].astype('int64')
    print(f'read file {ipfs_hash} from ipfs, length: {len(df)}, columns: {list(df.columns)}')
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
