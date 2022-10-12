import logging

import psycopg2

from settings import DB_NAME, DB_USER, DB_HOST, DB_PASSWORD

logger = logging.getLogger(__name__)

ALL_TAGS_QUERY = 'SELECT * FROM "Tag"'


def get_db_connection():
    try:
        conn = psycopg2.connect(database=DB_NAME,
                                user=DB_USER,
                                password=DB_PASSWORD,
                                host=DB_HOST)
        logger.info("Database connected successfully")
        return conn
    except:
        logger.exception("Database not connected successfully")
    return None
