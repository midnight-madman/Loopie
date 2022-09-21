import logging
import luigi
import argparse
from tasks.fetch_latest_tweets_to_db import FetchLatestTweetsToDB


logger = logging.getLogger(__name__)


def run_from_cli_args(args):
    args_dict = vars(args)
    logger.info(f'running from cli args {args_dict}')
    tasks = [FetchLatestTweetsToDB()]

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
    parser.add_argument('--is-test', type=str2bool, nargs='?', const=True, default=True, help=f'')
    return parser


if __name__ == '__main__':
    parser = create_arg_parser()
    args = parser.parse_args()

    run_from_cli_args(args)
