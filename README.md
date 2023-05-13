# [Loopie](https://www.loopie.site/) [![Last update](https://github.com/midnight-madman/Loopie/actions/workflows/Run-tasks-on-schedule.yaml/badge.svg)](https://github.com/midnight-madman/Loopie/actions/workflows/Run-tasks-on-schedule.yaml)

Stay in the loop with everything that's happening in web3 - a simple HackerNews/RektNews-style page with the most
frequently shared links

<img src="https://github.com/midnight-madman/Loopie/assets/94986441/20c94720-fcc5-4e69-8f87-c64abe074dea" width="600" />

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

## Misc

SQL Query to create `Scored News Items` in DB

```sql
CREATE OR REPLACE view ScoredNewsItem as
WITH Web3NewsItem as (SELECT ni.id,
                             ARRAY_AGG(DISTINCT tag.title) as tags
                      FROM "NewsItem" ni
                               join "NewsItemToTag" ni2tag on ni.id = ni2tag.news_item_id
                               join "Tag" tag on ni2tag.tag_id = tag.id
                      group by ni.id
                      having 'Web3' = ANY (ARRAY_AGG(DISTINCT tag.title)))
select CEIL(AVG(COALESCE(author.score, 0)) * count(DISTINCT author.twitter_id))::integer as score,
       count(DISTINCT author.twitter_id)                                                 as count_unique_authors,
       count(author.twitter_id)                                                          as author_ids,
       max(tweet.created_at)                                                             as last_tweet_date,
       inner_ni.tags,
       ni.*
from Web3NewsItem inner_ni
         join "NewsItem" ni on ni.id = inner_ni.id
         join "NewsItemToTweet" ni2tweet on ni.id = ni2tweet.news_item_id
         join "Tweet" tweet on tweet.id = ni2tweet.tweet_id
         join "Author" author on tweet.author_id = author.twitter_id
where tweet.created_at::date >= CURRENT_DATE - interval '7 day'
group by ni.id, inner_ni.tags
```
