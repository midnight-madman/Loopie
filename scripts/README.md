# Structure of scripts to run
1. get twitter data
2. get additional page data (=page title for now)
3. generate weekly leaderboards
4. upload to IPFS


## Running the scripts
Downloads data from twitter, so requires a Twitter API Key.
Uploads data to IPFS, so requires an INFURA key and password.


## How to check why a news item has a certain tag
Get title and run in script:

```
python find_tag_reason.py --title 'Ethical AI Ambitiously Hoping To Have AI Learn Ethical Behavior By Itself'
```
