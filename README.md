# [Loopie](https://www.loopie.site/) [![Last update](https://github.com/midnight-madman/Loopie/actions/workflows/Run-tasks-on-schedule.yaml/badge.svg)](https://github.com/midnight-madman/Loopie/actions/workflows/Run-tasks-on-schedule.yaml)

Stay in the loop with everything that's happening in web3 - a simple HackerNews/RektNews-style page with the most frequently shared links

<img src="https://user-images.githubusercontent.com/94986441/193413164-d66b76b9-b747-4043-b260-258c37a6d979.png" width="600" />


## 💡 Ideas for Governance
- Allow community members to vote on the list of Twitter accounts

## 🏗 How the site is built
1. Find last tweet id in DB
2. Fetch new tweets with urls since last tweet id via Twitter API
3. Find urls and save titles of the websites
4. Build leaderboard for site based on urls shared in the previous days


## 🔝 Todo to improve ranking
- count multiple url shares only once per twitter account
- give each url a score
    - add retweets / nr. of links to tweet to score


## ⚙️ Config to run scripts locally
Run
- `pip install pipenv`
- `pipenv install`
- `brew cask install geckodriver` (on first run a confirmation in Security Preferences might be required)
