# [Loopie](https://www.loopie.link/)

Stay in the loop with everything that's happening in web3 - a simple HackerNews-style page with the most frequently shared links

![pika-2022-04-27T09_02_45 917Z](https://user-images.githubusercontent.com/94986441/166223538-b32dc96e-b6b0-470e-8f22-4d68a714357a.png)



## 💡 Ideas for Governance
- Allow community members to vote on the list of Twitter accounts

## 🏗 How the site is built
1. Check for previous runs and find last tweet id that was saved before
2. Fetch new tweets with urls since last tweet id via Twitter API
3. Find urls and save titles of the websites
4. Upload data to IPFS
5. Build leaderboard for site based on urls shared in the last week


## 🔝 Todo to improve ranking
- count multiple url shares only once per twitter account
- give each url a score
    - add retweets / nr. of links to tweet to score

## 🎢 Todo to improve user experience
- create tag for each page based on urls and accounts that shared it
- create switch to show daily, weekly, (monthly?) most shared links

## ⚡️ Todo for more awareness of Loopie
- reply on Twitter to most shared links / tweets

## 🧑‍🔧 Fix
- fix: 😔 people delete tweets after they are scraped, they still show up on the leaderboard

## ⚙️ Config to run scripts locally
Run
- `pip install pipenv`
- `pipenv install`
- `brew cask install geckodriver` (on first run a confirmation in Security Preferences might be required)
