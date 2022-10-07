import { replace, split } from 'lodash/string'
import { map, trimEnd, truncate } from 'lodash'
import { useEffect, useState } from 'react'
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'

dayjs().format()
dayjs.extend(utc)
dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)

const getCleanUrl = (url) => {
  url = replace(url, /^(https?:\/\/?)|(www\.)/ig, '')
  url = split(url, '?utm_source')[0]
  url = trimEnd(url, '/')
  return url
}

const NewsItemRowComponent = ({
  newsItem,
  index
}) => {
  const [isExpandedRow, setIsExpandedRow] = useState(false)

  const cleanUrl = getCleanUrl(newsItem.url)
  const rowTitle = newsItem.title
  const rowSubtitle = truncate(cleanUrl, { length: 60 })
  const latestShareDate = dayjs(new Date(newsItem.last_tweet_date))
  const newsItemDate = latestShareDate.isToday() ? 'Today' : latestShareDate.isYesterday() ? 'Yesterday' : latestShareDate.fromNow()
  const tweets = map(newsItem.NewsItemToTweet, 'Tweet')
  const tags = map(newsItem.NewsItemToTag, 'Tag')

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
          console.log('? Shared via API.')
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
      <ArrowTopRightOnSquareIcon className="mx-1 mt-1 h-4 w-4"/>|
        </span>
  }

  const renderExpandedRow = () => {
    return <>
      <span className="text-md md:text-lg text-gray-500 truncate">
        <a href="">
          {rowSubtitle}
        </a>
      </span>
      <div className="mx-auto flex space-x-4 mt-2 py-2">
        {map(tags, (tag, index) =>
          <span
            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">
        {tag.title}
      </span>)}
      </div>
      <div className="mx-auto flex space-x-4 mt-2 py-2 border-y border-gray-600">
        {map(tweets, (tweet, index) =>
          <span key={`key-${tweet.id}-${index}`}>
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
                </span>
        )}
      </div>
    </>
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
            className="text-gray-900 hover:underline hover:text-gray-700">
                        <span className="text-lg lg:text-xl font-medium">
                        {truncate(rowTitle, { length: 150 })}{' '}
                        </span>
          </a>
          <div className="text-md md:text-lg text-gray-500">
            <div className="flex flex-row flex-wrap">
                            <span className="mr-1">
                            {newsItemDate} |
                            </span>
              {renderShare()}
              <span className="flex hover:underline hover:text-gray-700 hover:cursor-pointer"
                    onClick={() => setIsExpandedRow(!isExpandedRow)}>
                                <p className="">{isExpandedRow ? 'Less' : 'More'}</p>
                {isExpandedRow
                  ? <ArrowUpIcon
                    className="mt-1 flex-shrink-0 h-5 w-5"
                    aria-hidden="true"
                  />
                  : <ArrowDownIcon
                    className="mt-1  flex-shrink-0 h-5 w-5"
                    aria-hidden="true"
                  />}
                            </span>
            </div>
            <div className="">
              {isExpandedRow && renderExpandedRow()}
            </div>
          </div>
        </div>
      </div>
    </td>
    {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td> */}
    {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td> */}
    {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td> */}
  </tr>)
}

export default NewsItemRowComponent
