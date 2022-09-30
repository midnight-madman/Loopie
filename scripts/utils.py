from glob import glob
from typing import Optional
import json
import re

from settings import URL_FILES_IPFS_HASHES_FNAME, CACHE_DIR


def append_string_to_file(fname, string, newline=True):
    print(f'append {string} to file {fname}')

    if newline:
        string = f'{string}\n'

    with open(fname, 'a') as f:
        f.write(string)


def get_local_url_filenames():
    return glob('data/urls_*.csv')


def read_url_file_ipfs_hashes_from_local_history():
    ipfs_hashes = open(URL_FILES_IPFS_HASHES_FNAME, 'r').read().splitlines()
    ipfs_hashes = [hash for hash in ipfs_hashes if hash and hash.startswith('/ipfs/')]
    return ipfs_hashes


def get_ipfs_hash_local_cache_filename(ipfs_hash: str) -> str:
    return f'{CACHE_DIR}{ipfs_hash}'


def try_get_ipfs_hash_fname_in_local_cache(ipfs_hash: str) -> Optional[str]:
    files = glob(get_ipfs_hash_local_cache_filename(ipfs_hash))
    return files[0] if files else None


def find_obj_based_on_key_value_in_list(l, key, value):
    for obj in l:
        if obj[key] == value:
            return obj
    return None


def chunkify(arr: list, n: int) -> list[list]:
    # split list into chunks of n items per chunk ... chunk
    return [arr[i:i + n] for i in range(0, len(arr), n)]
