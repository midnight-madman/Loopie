import logging
from typing import Optional

import luigi
import pandas as pd
from sentry_sdk import capture_exception

from api.postgres import get_db_connection
from settings import SENTRY_DSN
from supabase_utils import get_supabase_client

logger = logging.getLogger(__name__)


class BaseLoopieTask(luigi.Task):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = get_supabase_client()
        self.db_connection = get_db_connection()
        self.df = self.get_df()

    def get_query(self) -> Optional[str]:
        return None

    def get_df(self) -> Optional[pd.DataFrame]:
        query = self.get_query()

        if not query:
            return None

        return pd.read_sql_query(query,
                                 con=self.db_connection,
                                 coerce_float=False)


@BaseLoopieTask.event_handler(luigi.Event.FAILURE)
def mourn_failure(task, exception):
    logger.critical(f'Error occurred: {exception}')

    if SENTRY_DSN:
        logger.info(f'sending error to sentry {exception} {task.__dict__}')
        sentry_sdk.init(
            dsn=SENTRY_DSN,
            traces_sample_rate=1.0
        )
        capture_exception(exception, scope=task.__dict__)
