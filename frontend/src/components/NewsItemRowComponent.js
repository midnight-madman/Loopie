import {replace, split} from "lodash/string";
import {map, take, trimEnd, truncate} from "lodash";
import {useEffect, useState} from 'react'
import {ArrowSmDownIcon, ArrowSmUpIcon} from '@heroicons/react/outline'

const getCleanUrl = (url) => {
    url = replace(url, /^(https?:\/\/?)|(www\.)/ig, '')
    url = split(url, '?utm_source')[0]
    url = trimEnd(url, '/')
    return url
}

const NewsItemRowComponent = ({newsItem, index}) => {
    const [isExpandedRow, setIsExpandedRow] = useState(false);

    const cleanUrl = getCleanUrl(newsItem.url)
    const rowTitle = newsItem.title
    const rowSubtitle = truncate(cleanUrl, {'length': 45})
    const latestSharedDate = new Date(newsItem.last_tweet_date)
    const tweets = map(newsItem.NewsItemToTweet, 'Tweet')

    useEffect(() => {
        const shareButton = document.getElementById(`share-newsItem-${newsItem.id}`);
        shareButton.addEventListener('click', async () => {
            // does the browser supports the feature?
            if (navigator.share) {
                try {
                    await navigator.share({url: newsItem.url, text: 'Found this on https://loopie.site:\n\n'});
                    console.log('? Shared via API.');
                } catch (error) {
                    console.log(`? ${error}`);
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                 className="mx-1 mt-1 w-4 h-4">
              <path fillRule="evenodd"
                    d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                    clipRule="evenodd"/>
              <path fillRule="evenodd"
                    d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                    clipRule="evenodd"/>
            </svg>|
        </span>
    }

    const renderExpandedRow = () => {
        return <div className="mx-auto flex space-x-4 mt-2 py-2 border-y border-gray-300">
            {map(tweets, (tweet, index) =>
                <span key={`key-${tweet.id}-${index}`}>
                    {index > 0 && "- "}
                    <a target="_blank" rel="noreferrer noopener"
                       className="mr-1 hover:underline"
                       href={`https://twitter.com/${tweet.Author.twitter_username}/status/${tweet.id}`}>{tweet.text || "Open tweet"}</a>
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
    }

    return (<tr key={`url-row-${index}`}>
        {/*<td className="whitespace-nowrap text-sm font-medium text-gray-900 relative">*/}
        {/*    <div className="absolute top-2.5 left-2">*/}
        {/*        <div className="font-normal text-gray-500">*/}
        {/*            {index + 1}.*/}
        {/*        </div>*/}
        {/*    </div>*/}
        {/*</td>*/}
        <td className="whitespace-normal max-w-xs pl-2 py-2">
            <div className="flex items-center">
                <div className="">
                    <a
                        href={newsItem.url} target="_blank" rel="noreferrer noopener"
                        className="text-gray-900 hover:underline hover:text-gray-700">
                        <span className="text-lg font-medium">
                        {truncate(rowTitle, {'length': 150})}{' '}
                        </span>
                    </a>
                    <div className="text-md text-gray-500">
                        <div className="flex">
                            <span className="mr-1">
                            {latestSharedDate && take(latestSharedDate.toDateString().split(' '), 3).join(' ')} |
                            </span>
                            <span className="mr-1">{rowSubtitle}{' '}|</span>
                            {renderShare()}
                            <span className="flex hover:underline hover:text-gray-700 hover:cursor-pointer"
                                  onClick={() => setIsExpandedRow(!isExpandedRow)}>
                            <p className="">{isExpandedRow ? 'Less' : 'More'}</p>
                                {isExpandedRow ?
                                    <ArrowSmUpIcon
                                        className='mt-0.5  flex-shrink-0 h-5 w-5'
                                        aria-hidden="true"
                                    /> : <ArrowSmDownIcon
                                        className='mt-0.5  flex-shrink-0 h-5 w-5'
                                        aria-hidden="true"
                                    />}
                        </span>
                        </div>
                        {isExpandedRow && renderExpandedRow()}
                    </div>
                </div>
            </div>
        </td>
        {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>*/}
        {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>*/}
        {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>*/}
    </tr>)
}

export default NewsItemRowComponent;
