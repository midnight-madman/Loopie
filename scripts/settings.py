import os

DATE_FORMAT = '%Y-%m-%d'

TWITTER_BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN')
IPFS_ENDPOINT = os.environ.get('IPFS_ENDPOINT')
INFURA_USERNAME = os.environ.get('INFURA_USERNAME')
INFURA_PASSWORD = os.environ.get('INFURA_PASSWORD')

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY')

DB_HOST = os.environ.get('DB_HOST')
DB_NAME = os.environ.get('DB_NAME')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')

from dev_settings import *
