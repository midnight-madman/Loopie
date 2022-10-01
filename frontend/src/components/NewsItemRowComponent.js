import {isEmpty} from "lodash/lang";
import {replace, split} from "lodash/string";
import {map, take, trimEnd, truncate} from "lodash";
import {useState} from 'react'
import {ArrowSmDownIcon, ArrowSmUpIcon,} from '@heroicons/react/outline'

const getCleanUrl = (url) => {
    url = replace(url, /^(https?:\/\/?)|(www\.)/ig, '')
    url = split(url, '?utm_source')[0]
    url = trimEnd(url, '/')
    return url
}

const NewsItemRowComponent = ({newsItem, index}) => {
    const [isExpandedRow, setIsExpandedRow] = useState(false);

    const cleanUrl = getCleanUrl(newsItem.url)
    const hasTitle = !isEmpty(newsItem.title)
    const rowTitle = hasTitle ? newsItem.title : cleanUrl
    const rowSubtitle = hasTitle && `(${truncate(cleanUrl, {'length': 45})})`
    const latestSharedDate = new Date(newsItem.last_tweet_date)

    const renderExpandedRow = () => {
        return <div className="mx-auto flex space-x-4 mt-2 py-2 border-y border-gray-300">
            {map(newsItem.NewsItemToTweet, (tweetObj, index) =>
                <span key={`key-${tweetObj.Tweet.id}-${index}`}>
                    {index > 0 && "- "}
                    <a target="_blank" rel="noreferrer noopener"
                       className="mr-1 hover:underline"
                       href={`https://twitter.com/${tweetObj.Tweet.Author.twitter_username}/status/${tweetObj.Tweet.id}`}>{tweetObj.Tweet.text || "Open tweet"}</a>
                    {tweetObj.Tweet.Author.twitter_username && (<>by <a target="_blank" rel="noreferrer noopener"
                        className="hover:underline"
                        href={`https://twitter.com/@${tweetObj.Tweet.Author.twitter_username}`}>{tweetObj.Tweet.Author.twitter_username}</a></>)}
                </span>
            )
            }
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
        <td className="whitespace-normal max-w-xs pl-2 py-2 text-sm">
            <div className="flex items-center">
                <div className="">
                    <a
                        href={newsItem.url} target="_blank" rel="noreferrer noopener"
                        className="font-medium text-gray-900 hover:underline hover:text-gray-700">
                        {truncate(rowTitle, {'length': 150})}{' '}
                        <span className="font-normal text-gray-500">{rowSubtitle}</span>
                    </a>
                    <div className="text-gray-500">
                        <div className="flex">
                            {/*{newsItem.score || 20} points | */}
                            last
                            shared {latestSharedDate && take(latestSharedDate.toDateString().split(' '), 3).join(' ')} |
                            <span className="flex hover:cursor-pointer"
                                  onClick={() => setIsExpandedRow(!isExpandedRow)}>
                            <p className="ml-1">{isExpandedRow ? 'hide' : 'show'}</p>
                                {isExpandedRow ?
                                    <ArrowSmUpIcon
                                        className='text-gray-400 group-hover:text-gray-500 flex-shrink-0 h-5 w-5'
                                        aria-hidden="true"
                                    /> : <ArrowSmDownIcon
                                        className='text-gray-400 group-hover:text-gray-500 flex-shrink-0 h-5 w-5'
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
