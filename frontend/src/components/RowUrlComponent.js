import {isEmpty} from "lodash/lang";
import {replace, split} from "lodash/string";
import {map} from "lodash";
import {Fragment, useState} from 'react'
import {ArrowSmDownIcon, ArrowSmUpIcon,} from '@heroicons/react/outline'

const getCleanUrl = (url) => {
    url = replace(url, /^(https?:\/\/?)|(www\.)/ig, '')
    url = split(url, '?utm_source')[0]
    return url
}

const parseStrToList = (s) => replace(s, /(\['?)|('])|(')/g, '').split(", ")

const RowUrlComponent = ({url, index}) => {
    const [isExpandendRow, setIsExpandedRow] = useState(false);

    const hasTitle = !isEmpty(url.url_title)
    const cleanUrl = getCleanUrl(url.url)
    const rowTitle = hasTitle ? `${url.url_title} (${cleanUrl})` : cleanUrl

    let createdAts = parseStrToList(url.created_ats)
    createdAts = map(createdAts, (createdAt) => new Date(createdAt))
    const latestShareDate = createdAts.length === 1 ? createdAts[0] : createdAts[0]
    const tweetIds = parseStrToList(url.tweet_ids)

    const renderExpandedRow = () => {
        return <div className="flex space-x-2">
            {map(tweetIds, (tweetId, index) =>
                <span>{index > 0 && "- "}
                <a target="_blank" rel="noreferrer noopener"
                   className="hover:underline"
                   href={`https://twitter.com/x/status/${tweetId}`}>Open Tweet</a>
                </span>
            )
            }
        </div>
    }

    return (<tr key={`url-row-${cleanUrl}`}>
        <td className="whitespace-nowrap pl-2 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
            <div className="flex items-center">
                <div className="font-bold mb-3">
                    {index + 1})
                </div>
            </div>
        </td>
        <td className="whitespace-normal max-w-xs py-2 pl-4 pr-3 text-sm sm:pl-6 md:py-4">
            <div className="flex items-center">
                <div className="">
                    <a
                        href={url.url} target="_blank" rel="noreferrer noopener"
                        className="font-medium text-gray-900 hover:underline hover:text-gray-700">
                        {rowTitle}
                    </a>
                    <div className="text-gray-500">
                        {url.tweet_count > 1 ? `${url.tweet_count} shares` : "shared once"} | latest
                        share {latestShareDate.toDateString().toLowerCase()} |
                        <span className="flex hover:cursor-pointer" onClick={() => setIsExpandedRow(!isExpandendRow)}>
                            {isExpandendRow ? 'collapse' : 'show'}
                            {isExpandendRow ?
                            <ArrowSmUpIcon
                                className='text-gray-400 group-hover:text-gray-500 flex-shrink-0 h-5 w-5'
                                aria-hidden="true"
                            /> : <ArrowSmDownIcon
                                className='text-gray-400 group-hover:text-gray-500 flex-shrink-0 h-5 w-5'
                                aria-hidden="true"
                            />}
                        </span>
                        {isExpandendRow && renderExpandedRow()}
                    </div>
                </div>
            </div>
        </td>
        {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>*/}
        {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>*/}
        {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>*/}
    </tr>)
}

export default RowUrlComponent;
