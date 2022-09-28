import logging
from typing import Optional

import luigi
import pandas as pd

from api.postgres import get_db_connection
from supabase_utils import get_supabase_client

logger = logging.getLogger(__name__)


class BaseLoopieTask(luigi.Task):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = get_supabase_client()
        self.db_connection = get_db_connection()

        query = self.get_query()
        if query:
            self.df = pd.read_sql_query(query, con=self.db_connection, coerce_float=False)

    def get_query(self) -> Optional[str]:
        return None
