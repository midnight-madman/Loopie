import os

DATE_FORMAT = '%Y-%m-%d'

TWITTER_BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN')
IPFS_ENDPOINT = os.environ.get('IPFS_ENDPOINT')
INFURA_USERNAME = os.environ.get('INFURA_USERNAME')
INFURA_PASSWORD = os.environ.get('INFURA_PASSWORD')

DATA_DIR = 'data/'
CACHE_DIR = f'{DATA_DIR}cache/'
URL_FILES_IPFS_HASHES_FNAME = f'{DATA_DIR}url_files_ipfs_hashes.txt'
WEEKLY_LEADERBOARD_IPFS_HASH_HISTORY_FNAME = f'{DATA_DIR}weekly_leaderboard_ipfs_hash_history.txt'
ACCOUNT_SCORES_FNAME = f'{DATA_DIR}account_scores.csv'

USE_IPFS_TO_READ_DATA = True
UPLOAD_DATA_TO_IPFS = True

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

from dev_settings import *
