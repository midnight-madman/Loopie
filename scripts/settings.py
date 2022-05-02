import os

TWITTER_BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN')

IPFS_ENDPOINT = os.environ.get('IPFS_ENDPOINT')
INFURA_USERNAME = os.environ.get('INFURA_USERNAME')
INFURA_PASSWORD = os.environ.get('INFURA_PASSWORD')

DATA_DIR = 'data/'
URL_FILES_IPFS_HASHES_FNAME = f'{DATA_DIR}url_files_ipfs_hashes.txt'
WEEKLY_LEADERBOARD_IPFS_HASH_HISTORY_FNAME = f'{DATA_DIR}weekly_leaderboard_ipfs_hash_history.txt'

USE_IPFS_TO_READ_DATA = True
UPLOAD_DATA_TO_IPFS = False  # change to True before merging!

from dev_settings import *
