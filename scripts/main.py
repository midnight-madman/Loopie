from generate_url_rankings import generate_url_rankings
from get_metadata_for_urls import get_metadata_for_url_file
from get_twitter_data import get_twitter_data
from ipfs_utils import upload_url_file_to_ipfs, upload_ranking_file_to_ipfs


def main():
    twitter_data_fname = get_twitter_data()
    if not twitter_data_fname:
        print("No new twitter data, exiting...")
        return

    get_metadata_for_url_file(twitter_data_fname)
    upload_url_file_to_ipfs(twitter_data_fname)

    url_rankings_fname = generate_url_rankings()
    upload_ranking_file_to_ipfs(url_rankings_fname)


if __name__ == "__main__":
    main()
