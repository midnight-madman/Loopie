from glob import glob
from io import StringIO

import pandas as pd
import requests

from settings import IPFS_ENDPOINT, INFURA_USERNAME, INFURA_PASSWORD, URL_FILES_IPFS_HASHES_FNAME, \
    WEEKLY_LEADERBOARD_IPFS_HASH_HISTORY_FNAME


def get_dataframe_from_ipfs_hash(ipfs_hash: str) -> pd.DataFrame:
    params = dict(arg=ipfs_hash)
    response = requests.post(IPFS_ENDPOINT + '/api/v0/get', params=params, auth=(INFURA_USERNAME, INFURA_PASSWORD))

    df = pd.read_csv(StringIO(response.content.decode('utf-8')))
    # name of the first column is the ipfs hash instead of "url", replace here when reading
    df.rename(columns={df.columns[0]: "url"}, inplace=True)

    print(f'read file {ipfs_hash} from IPFS, length: {len(df)}, columns: {df.columns}')
    return df


def upload_file_to_ipfs(fname: str) -> str:
    print(f'uploading file {fname} to IPFS')
    files = dict(file=(open(fname, 'r')))

    response = requests.post(IPFS_ENDPOINT + '/api/v0/add', files=files, auth=(INFURA_USERNAME, INFURA_PASSWORD))
    if response.status_code != 200:
        raise Exception('ipfs upload failed')

    hash = response.text.split(",")[1].split(":")[1].replace('"', '')
    print('uploaded to IPFS under hash:', hash)

    return f'/ipfs/{hash}'


def append_string_to_file(fname, string, newline=True):
    if newline:
        string = f'{string}\n'

    with open(fname, 'a') as f:
        f.write(string)

    print(f'appended {string} to file {fname}')


def get_local_url_filenames():
    return glob('data/urls_*.csv')


def upload_file_and_append_ipfs_hash_to_file(upload_file_name, append_file_name):
    ipfs_hash = upload_file_to_ipfs(upload_file_name)
    append_string_to_file(append_file_name, ipfs_hash)


def upload_url_file_to_ipfs(fname):
    upload_file_and_append_ipfs_hash_to_file(fname, URL_FILES_IPFS_HASHES_FNAME)


def upload_ranking_file_to_ipfs(fname):
    upload_file_and_append_ipfs_hash_to_file(fname, WEEKLY_LEADERBOARD_IPFS_HASH_HISTORY_FNAME)
