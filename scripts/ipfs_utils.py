from api.ipfs import upload_file_to_ipfs
from settings import UPLOAD_DATA_TO_IPFS, URL_FILES_IPFS_HASHES_FNAME, WEEKLY_LEADERBOARD_IPFS_HASH_HISTORY_FNAME
from utils import append_string_to_file


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