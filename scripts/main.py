import argparse
import logging.config
import sys
from datetime import datetime, date

import luigi
import sentry_sdk

from settings import DATE_FORMAT, SENTRY_DSN
from supabase_utils import get_supabase_client
from tasks.copy_tweets_to_db import CopyTweetsToDB
from tasks.create_news_item_summary import CreateNewsItemSummary
from tasks.create_news_item_to_tag_connections import CreateNewsItemToTagConnections
from tasks.create_news_items import CreateNewsItems
from tasks.get_metadata_for_urls import GetMetadataForUrls
from tasks.update_author_scores import UpdateAuthorScores

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        traces_sample_rate=1.0
    )

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger('luigi-interface')

task_name_to_config = {
    'copy-tweets-to-db': {
        'class': CopyTweetsToDB,
        'args': ['last_tweet_id', ]
    },
    'create-news-items': {
        'class': CreateNewsItems,
        'args': ['start_date', ]
    },
    'get-metadata-for-urls': {
        'class': GetMetadataForUrls,
        'args': ['start_date', ]
    },
    'update-author-scores': {
        'class': UpdateAuthorScores,
        'args': ['last_updated_date', ]
    },
    'create-news-item-to-tag-connections': {
        'class': CreateNewsItemToTagConnections,
    },
    'create-news-item-summary': {
        'class': CreateNewsItemSummary
    }
}


def run_from_cli_args(args):
    args_dict = vars(args)
    logger.info(f'running from cli args {args_dict}')

    task_name = args_dict.get('task_name')
    if task_name:
        task_config = task_name_to_config[task_name]
        kwargs = {arg: args_dict.get(arg, None) for arg in task_config.get('args', [])}
        for key, value in kwargs.items():
            if 'date' in key:
                if value:
                    value = datetime.strptime(value, DATE_FORMAT)
                else:
                    value = date.today()
                kwargs[key] = value

            if 'last_tweet_id' == key and not value:
                supabase = get_supabase_client()
                data = supabase.table("Tweet").select("id").order('id', desc=True).limit(1).execute()
                last_tweet_id = data.data[0]['id']
                kwargs[key] = last_tweet_id

        task_instance = task_config['class'](**kwargs)
        tasks = [task_instance]
    else:
        tasks = [CopyTweetsToDB(last_tweet_id=last_tweet_id)]

    luigi.build(tasks, workers=1, local_scheduler=True)


def str2bool(v):
    if isinstance(v, bool):
        return v
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')


def create_arg_parser():
    parser = argparse.ArgumentParser(description='Run Loopie task pipeline')
    parser.add_argument('--is-test', type=str2bool, nargs='?', const=True, default=False, help=f'')
    parser.add_argument('--task-name', default=None, help=f'Name of task class')
    parser.add_argument('--start-date', default=None,
                        help=f'Start date for relevant task class, format must be YYYY-MM-DD')
    return parser


if __name__ == '__main__':
    parser = create_arg_parser()
    args = parser.parse_args()

    run_from_cli_args(args)
