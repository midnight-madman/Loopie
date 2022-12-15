import { filter, isEmpty, map, orderBy, take, truncate, uniqBy } from 'lodash'
import { useEffect, useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { classNames } from '../utils'

dayjs().format()
dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

const TWEET_LENGTH_ONLY_LINK = 23
const WEB3_TAG_TITLE = 'Web3'
const TWEETS_IN_EXPANDED_ROW = 8

const NewsItemRowComponent = ({
  newsItem,
  isDefaultExpanded = false
}) => {
  const summary = newsItem.NewsItemSummary[0] && newsItem.NewsItemSummary[0].summary
  const [isExpandedRow, setIsExpandedRow] = useState(isDefaultExpanded)

  const rowTitle = newsItem.title
  const latestShareDate = dayjs(new Date(newsItem.last_tweet_date))
  const newsItemDate = latestShareDate.isToday() ? 'today' : latestShareDate.isYesterday() ? 'yesterday' : latestShareDate.fromNow()
  const tweets = uniqBy(filter(map(newsItem.NewsItemToTweet, 'Tweet'), (tweet) => tweet.text && tweet.text.length > TWEET_LENGTH_ONLY_LINK), 'id')
  const tags = filter(newsItem.tags, (tag) => !isEmpty(tag) && tag !== WEB3_TAG_TITLE)

  useEffect(() => {
    const shareButton = document.getElementById(`share-newsItem-${newsItem.id}`)
    shareButton.addEventListener('click', async () => {
      // does the browser supports the feature?
      if (navigator.share) {
        try {
          await navigator.share({
            url: newsItem.url,
            text: 'Found this on https://loopie.site:\n\n'
          })
        } catch (error) {
          console.log(`? ${error}`)
        }
      } else {
        // you could do a fallback solution here ...
        console.log('? Your browser does not support the web share api.')
        window.open(newsItem.url, '_blank')
      }
    })
  }, [])

  const renderShare = () => {
    return <span id={`share-newsItem-${newsItem.id}`}
                 className="mr-1 flex hover:underline hover:text-gray-700 cursor-pointer">
            Share{' '}
      <ArrowTopRightOnSquareIcon className="mx-1 mt-1.5 h-4 w-4"/>|
        </span>
  }

  const renderTweets = () => {
    return <div
      className={classNames(tweets.length >= 4
          ? 'grid grid-cols-2 md:grid-cols-4 overflow-auto gap-8 md:gap-5'
          : 'grid grid-cols-3 grid-rows-1 gap-8',
        'py-4 mx-auto flex mt-2 border-y border-gray-600')}>
      {map(take(orderBy(tweets, (tweet) => tweet.Author.score, 'desc'), TWEETS_IN_EXPANDED_ROW), (tweet, index) =>
        <div key={`key-${tweet.id}-${index}`}>
          {index > 0 && '- '}
          <a target="_blank" rel="noreferrer noopener"
             className="mr-1 hover:underline"
             href={`https://twitter.com/${tweet.Author.twitter_username}/status/${tweet.id}`}>{tweet.text || 'Open tweet'}</a>
          {tweet.Author.twitter_username && (
            <>by{' '}
              <a target="_blank" rel="noreferrer noopener"
                 className="hover:underline"
                 href={`https://twitter.com/@${tweet.Author.twitter_username}`}>{tweet.Author.twitter_username}
              </a>
            </>)}
        </div>
      )}
    </div>
  }
  const renderExpandedRow = () => {
    return <>
      {!isEmpty(tags) && (<div className="mx-auto flex space-x-4 mt-2 py-2">
        {map(tags, (tag, index) =>
          <span
            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">
        {tag}
      </span>)}
      </div>)}
      {renderTweets()}
    </>
  }

  const renderRowDetails = () => {
    return <div className="flex flex-row flex-wrap">
      <span className="mr-1">
      Last shared {newsItemDate} |
      </span>
      {renderShare()}
      <span className="flex hover:underline hover:text-gray-700 hover:cursor-pointer"
            onClick={() => setIsExpandedRow(!isExpandedRow)}>
          <p className="">Show {isExpandedRow ? 'less' : 'more'}</p>
        {isExpandedRow
          ? <ArrowUpIcon
            className="flex-shrink-0 mt-1.5 h-4 w-4"
            aria-hidden="true"
          />
          : <ArrowDownIcon
            className="flex-shrink-0 mt-1.5 h-4 w-4"
            aria-hidden="true"
          />}
      </span>
    </div>
  }

  return (<tr>
    {/* <td className="whitespace-nowrap text-sm font-medium text-gray-900 relative"> */}
    {/*    <div className="absolute top-2.5 left-2"> */}
    {/*        <div className="font-normal text-gray-500"> */}
    {/*            {index + 1}. */}
    {/*        </div> */}
    {/*    </div> */}
    {/* </td> */}
    <td className="whitespace-normal max-w-xs pl-2 py-2 md:py-3">
      <div className="flex items-center">
        <div className="">
          <a
            href={newsItem.url} target="_blank" rel="noreferrer noopener"
            className="text-gray-900 hover:underline hover:text-gray-800">
                        <span className="text-lg sm:text-2xl lg:text-xl font-semibold tracking-tight">
                        {truncate(rowTitle, { length: 150 })}{' '}
                        </span>
          </a>
          <div className="text-lg text-gray-500">
            {summary && <div><p className="mt-1 max-w-96 text-gray-500">{summary}</p></div>}
            {renderRowDetails()}
            {isExpandedRow && renderExpandedRow()}
          </div>
        </div>
      </div>
    </td>
  </tr>)
}

export default NewsItemRowComponent
