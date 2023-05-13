import logging
from typing import Optional

import luigi
import pandas as pd
from sentry_sdk import capture_exception

from api.postgres import get_db_connection
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
    capture_exception(exception, scope=task.__dict__)
    logger.critical('Error occurred: {e}'.format(e=exception))
