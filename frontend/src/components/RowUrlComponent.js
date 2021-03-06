import {isEmpty} from "lodash/lang";
import {replace, split} from "lodash/string";
import {max, map, truncate, trimEnd, take} from "lodash";
import {useState} from 'react'
import {ArrowSmDownIcon, ArrowSmUpIcon,} from '@heroicons/react/outline'

const getCleanUrl = (url) => {
    url = replace(url, /^(https?:\/\/?)|(www\.)/ig, '')
    url = split(url, '?utm_source')[0]
    url = trimEnd(url, '/')
    return url
}

const parseStrToList = (s) => replace(s, /(\['?)|('?])|(')/g, '').split(", ")

const RowUrlComponent = ({url, index}) => {
    const [isExpandedRow, setIsExpandedRow] = useState(false);

    const cleanUrl = getCleanUrl(url.url)
    const hasTitle = !isEmpty(url.url_title)
    const rowTitle = hasTitle ? url.url_title : cleanUrl
    const rowSubtitle = hasTitle && `(${truncate(cleanUrl, {'length': 45})})`

    let createdAts = parseStrToList(url.created_ats)
    createdAts = map(createdAts, (createdAt) => new Date(createdAt))
    const latestShareDate = createdAts.length === 1 ? createdAts[0] : max(createdAts)
    const tweetIds = parseStrToList(url.tweet_ids)

    const renderExpandedRow = () => {
        return <div className="flex space-x-2">
            {map(tweetIds, (tweetId, index) =>
                <span key={`key-${tweetId}-${index}`}>{index > 0 && "- "}
                    <a target="_blank" rel="noreferrer noopener"
                       className="hover:underline"
                       href={`https://twitter.com/x/status/${tweetId}`}>Open Tweet</a>
                </span>
            )
            }
        </div>
    }

    return (<tr key={`url-row-${index}`}>
        <td className="whitespace-nowrap text-sm font-medium text-gray-900 relative">
            <div className="absolute top-2.5 left-2">
                <div className="font-normal text-gray-500">
                    {index + 1}.
                </div>
            </div>
        </td>
        <td className="whitespace-normal max-w-xs pl-8 py-2 text-sm">
            <div className="flex items-center">
                <div className="">
                    <a
                        href={url.url} target="_blank" rel="noreferrer noopener"
                        className="font-medium text-gray-900 hover:underline hover:text-gray-700">
                        {rowTitle}{' '}
                        <span className="font-normal text-gray-500">{rowSubtitle}</span>
                    </a>
                    <div className="text-gray-500">
                        <div className="flex">
                            {split(url.score, '.')[0] || 2} points | last shared {take(latestShareDate.toDateString().split(' '), 3).join(' ')} |
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

export default RowUrlComponent;
