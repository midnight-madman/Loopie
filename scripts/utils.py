from glob import glob

from api.ipfs import upload_file_to_ipfs
from settings import URL_FILES_IPFS_HASHES_FNAME, WEEKLY_LEADERBOARD_IPFS_HASH_HISTORY_FNAME, UPLOAD_DATA_TO_IPFS


def append_string_to_file(fname, string, newline=True):
    print(f'append {string} to file {fname}')

    if newline:
        string = f'{string}\n'

    with open(fname, 'a') as f:
        f.write(string)


def get_local_url_filenames():
    return glob('data/urls_*.csv')


def upload_file_and_append_ipfs_hash_to_file(upload_file_name, append_file_name):
    if not UPLOAD_DATA_TO_IPFS:
        print('Not uploading data to IPFS according to settings')
        return

    ipfs_hash = upload_file_to_ipfs(upload_file_name)
    append_string_to_file(append_file_name, ipfs_hash)


def upload_url_file_to_ipfs(fname):
    upload_file_and_append_ipfs_hash_to_file(fname, URL_FILES_IPFS_HASHES_FNAME)


def upload_ranking_file_to_ipfs(fname):
    upload_file_and_append_ipfs_hash_to_file(fname, WEEKLY_LEADERBOARD_IPFS_HASH_HISTORY_FNAME)


def read_url_file_ipfs_hashes_from_local_history():
    ipfs_hashes = open(URL_FILES_IPFS_HASHES_FNAME, 'r').read().splitlines()
    ipfs_hashes = [hash for hash in ipfs_hashes if hash and hash.startswith('/ipfs/')]
    return ipfs_hashes
