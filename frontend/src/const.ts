/* eslint-disable no-unused-vars */
type Author = {
  twitter_id: string
  twitter_username: string
  score: number
  updated_at: string
}
export type Tweet = {
  id: string
  text: string
  Author: Author
}
export type Tag = {
  id: string
  created_at: string
  title: string
}
export type ScoredNewsItem = {
  id: string
  updated_at: string
  created_at: string
  last_tweet_date: string
  url: string
  title: string
  description: number
  score: number
  count_unique_authors: number
  NewsItemToTweet: {
    Tweet: Tweet
  }[]
  NewsItemToTag: {
    Tag: Tag
  }[]
}

export enum NewsCategoriesEnum {
  WEB3 = 'Web3',
  NFT = 'NFT',
  AI = 'AI',
  DAO = 'DAO',
  BITCOIN = 'Bitcoin',
}
