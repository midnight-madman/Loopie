import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Popover } from '@headlessui/react'
import { HandThumbUpIcon } from '@heroicons/react/20/solid'
import { classNames } from '../utils'
import { NavBar } from './NavBar'
import { createClient } from '@supabase/supabase-js'
import dayjs from 'dayjs'
import { find, findIndex, isEmpty, map, split } from 'lodash'
import { LoadingComponent } from './LoadingComponent'
import { CalendarDaysIcon, UserIcon } from '@heroicons/react/24/solid'

type Author = {
    twitter_id: string
    twitter_username: string
    score: number
    updated_at: string
}

type Tweet = {
    id: string
    text: string
    Author: Author
}

type Tag = {
    id: string
    created_at: string
    title: string
}

type ScoredNewsItem = {
    id: string
    updated_at: string
    created_at: string
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

// const tabs = [
//   { name: 'Tag Web3 News', href: '#', current: true },
//   { name: '...', href: '#', current: false },
//   { name: 'coming soon', href: '#', current: false }
// ]

export function ContributeComponent () {
  const [newsItems, setNewsItems] = useState<ScoredNewsItem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [newsItemIdToState, setNewsItemIdToState] = useState<{ [key: string]: string }>({})
  console.log(newsItemIdToState)
  const web3Tag = find(tags, tag => tag.title === 'Web3')
  const hasData = !isEmpty(tags) && !isEmpty(newsItems)
  const { openConnectModal } = useConnectModal()

  const { status } = useSession({
    required: true,
    onUnauthenticated () {
      // The user is not authenticated, handling it here
      // openConnectModal?.()
    }
  })
  const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string)
  const tweetStartDate = dayjs().utc() // .subtract(2, 'days')
  const isLoading = status === 'loading'
  useEffect(() => {
    if (isLoading || !isEmpty(newsItems)) {
      return
    }
    getTagsFromSupabase().then(() => getNewsItemsFromSupabase()).then(() =>
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
      setNewsItemIdToState(map(newsItems, 'id').reduce((o, key) => ({ ...o, [key]: '' }), {}))
    )
  }, [status])

  const renderConnectComponent = () => {
    return <div className="h-screen grid grid-cols place-content-center">
            {openConnectModal && (
                <ConnectButton chainStatus="none" label="Login to contribute" accountStatus="full" showBalance={false}/>
            )}
        </div>
  }

  if (isLoading) {
    return renderConnectComponent()
  }

  const getTagsFromSupabase = async () => {
    const { data, error } = await supabase
      .from('Tag')
      .select('*')

    if (error || !data) {
      console.log(error)
      return
    }

    console.log('got data', data)
    setTags(data)
  }

  const getNewsItemsFromSupabase = async () => {
    const { data, error } = await supabase
      .from<ScoredNewsItem>('scorednewsitem')
      .select('*, NewsItemToTweet( Tweet(created_at, id::text, text, Author (twitter_username))), NewsItemToTag( Tag(*))')
      .gte('updated_at', tweetStartDate.format('YYYY-MM-DD'))
      .order('score', { ascending: false })
      .limit(10)

    if (error || !data) {
      console.log(error)
      return
    }

    setNewsItems(data)
  }

  const addTagToNewsItemInSupabase = async (newsItemId: string, tagId: string) => {
    newsItemIdToState[newsItemId] = 'pending'
    setNewsItemIdToState(newsItemIdToState)

    const { data, error } = await supabase
      .from('NewsItemToTag')
      .insert([
        { news_item_id: newsItemId, tag_id: tagId }
      ])

    if (error || !data) {
      console.log(error)
      newsItemIdToState[newsItemId] = 'error'
      setNewsItemIdToState(newsItemIdToState)
    } else {
      newsItemIdToState[newsItemId] = 'success'
      setNewsItemIdToState(newsItemIdToState)
    }
  }

  function renderNewsItemToTagRow (newsItem: ScoredNewsItem) {
    const tagsOnNewsItem = map(newsItem.NewsItemToTag, 'Tag')
    const hasWeb3TagOnNewsItem = findIndex(tagsOnNewsItem, (tag: Tag) => tag.id === web3Tag?.id) !== -1

    let buttonTitle = 'Yes, it\'s web3'
    switch (newsItemIdToState[newsItem.id]) {
      case 'pending':
        buttonTitle = '...'
        break
      case 'success':
        buttonTitle = 'Done'
        break
      case 'error':
        buttonTitle = 'X'
        break
    }

    // @ts-ignore
    return <li key={newsItem.id}
                   className="bg-white px-4 py-6 shadow sm:rounded-lg sm:p-6">
            <article aria-labelledby={'newsItem-title-' + newsItem.id}>
                <div>
                    <div className="flex space-x-3">
                        <div className="min-w-0 flex-1">
                            <h2 id={'newsItem-title-' + newsItem.id}
                                className="mt-4 text-base font-medium text-gray-900">
                                {newsItem.title}
                            </h2>
                            <p className="text-sm font-medium text-gray-500">
                                <div className="flex">
                                    <div
                                        className="mx-auto flex space-x-4 mt-2 py-2 border-y border-gray-300">
                                        {map(map(newsItem.NewsItemToTweet, 'Tweet'), (tweet, index) =>
                                            <span key={`key-${tweet.id}-${index}`}>
                                                                                                {index > 0 && '- '}
                                                <a target="_blank"
                                                   rel="noreferrer noopener"
                                                   className="mr-1 hover:underline"
                                                   href={`https://twitter.com/${tweet.Author.twitter_username}/status/${tweet.id}`}>{tweet.text || 'Open tweet'}</a>
                                                {tweet.Author.twitter_username && (
                                                    <>by{' '}
                                                        <a target="_blank"
                                                           rel="noreferrer noopener"
                                                           className="hover:underline"
                                                           href={`https://twitter.com/@${tweet.Author.twitter_username}`}>{tweet.Author.twitter_username}
                                                        </a>
                                                    </>)}
                                                                                         </span>
                                        )}
                                    </div>
                                </div>
                            </p>
                            {/* <p className="text-sm text-gray-500"> */}
                            {/*    <div className=""> */}
                            {/*        <time */}
                            {/*            dateTime={newsItem.created_at}>{newsItem.created_at}</time> */}
                            {/*    </div> */}
                            {/* </p> */}
                        </div>
                        {/* <div className="flex flex-shrink-0 self-center"> */}
                        {/*    <Menu as="div" className="relative inline-block text-left"> */}
                        {/*        <div> */}
                        {/*            <Menu.Button */}
                        {/*                className="-m-2 flex items-center rounded-full p-2 text-gray-400 hover:text-gray-600"> */}
                        {/*                <span className="sr-only">Open options</span> */}
                        {/*                <EllipsisVerticalIcon className="h-5 w-5" */}
                        {/*                                      aria-hidden="true"/> */}
                        {/*            </Menu.Button> */}
                        {/*        </div> */}

                        {/*        <Transition */}
                        {/*            as={Fragment} */}
                        {/*            enter="transition ease-out duration-100" */}
                        {/*            enterFrom="transform opacity-0 scale-95" */}
                        {/*            enterTo="transform opacity-100 scale-100" */}
                        {/*            leave="transition ease-in duration-75" */}
                        {/*            leaveFrom="transform opacity-100 scale-100" */}
                        {/*            leaveTo="transform opacity-0 scale-95" */}
                        {/*        > */}
                        {/*            <Menu.Items */}
                        {/*                className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"> */}
                        {/*                <div className="py-1"> */}
                        {/*                    <Menu.Item> */}
                        {/*                        {({active}) => ( */}
                        {/*                            <a */}
                        {/*                                href="#" */}
                        {/*                                className={classNames( */}
                        {/*                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', */}
                        {/*                                    'flex px-4 py-2 text-sm' */}
                        {/*                                )} */}
                        {/*                            > */}
                        {/*                                <StarIcon */}
                        {/*                                    className="mr-3 h-5 w-5 text-gray-400" */}
                        {/*                                    aria-hidden="true"/> */}
                        {/*                                <span>Add to favorites</span> */}
                        {/*                            </a> */}
                        {/*                        )} */}
                        {/*                    </Menu.Item> */}
                        {/*                    <Menu.Item> */}
                        {/*                        {({active}) => ( */}
                        {/*                            <a */}
                        {/*                                href="#" */}
                        {/*                                className={classNames( */}
                        {/*                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', */}
                        {/*                                    'flex px-4 py-2 text-sm' */}
                        {/*                                )} */}
                        {/*                            > */}
                        {/*                                <CodeBracketIcon */}
                        {/*                                    className="mr-3 h-5 w-5 text-gray-400" */}
                        {/*                                    aria-hidden="true" */}
                        {/*                                /> */}
                        {/*                                <span>Embed</span> */}
                        {/*                            </a> */}
                        {/*                        )} */}
                        {/*                    </Menu.Item> */}
                        {/*                    <Menu.Item> */}
                        {/*                        {({active}) => ( */}
                        {/*                            <a */}
                        {/*                                href="#" */}
                        {/*                                className={classNames( */}
                        {/*                                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700', */}
                        {/*                                    'flex px-4 py-2 text-sm' */}
                        {/*                                )} */}
                        {/*                            > */}
                        {/*                                <FlagIcon */}
                        {/*                                    className="mr-3 h-5 w-5 text-gray-400" */}
                        {/*                                    aria-hidden="true"/> */}
                        {/*                                <span>Report content</span> */}
                        {/*                            </a> */}
                        {/*                        )} */}
                        {/*                    </Menu.Item> */}
                        {/*                </div> */}
                        {/*            </Menu.Items> */}
                        {/*        </Transition> */}
                        {/*    </Menu> */}
                        {/* </div> */}
                    </div>

                </div>
                <div className="mt-2 space-y-4 text-sm text-gray-700">
                    {newsItem.description}
                </div>
                <div className="mt-6 flex justify-between space-x-8">
                    <div className="flex space-x-6">
                                                        <span className="inline-flex items-center text-sm">
                                                          <button type="button"
                                                                  className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                                                            <HandThumbUpIcon className="h-5 w-5" aria-hidden="true"/>
                                                            <span
                                                                className="font-medium text-gray-900">{newsItem.score}</span>
                                                            <span className="sr-only">score</span>
                                                          </button>
                                                        </span>
                        <span className="inline-flex items-center text-sm">
                                                          <button type="button"
                                                                  className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                                                            <UserIcon className="h-5 w-5" aria-hidden="true"/>
                                                            <span
                                                                className="font-medium text-gray-900">{newsItem.count_unique_authors}</span>
                                                            <span className="sr-only">replies</span>
                                                          </button>
                                                        </span>
                        <span className="inline-flex items-center text-sm">
                                                          <button type="button"
                                                                  className="inline-flex space-x-2 text-gray-400 hover:text-gray-500">
                                                            <CalendarDaysIcon className="h-5 w-5" aria-hidden="true"/>
                                                            <span
                                                                className="font-medium text-gray-900">{split(newsItem.updated_at, '.')[0]}</span>
                                                            <span className="sr-only">views</span>
                                                          </button>
                                                        </span>
                    </div>
                    <div className="flex text-sm">
                                                        <span className="inline-flex items-center text-sm">
                                                    {hasWeb3TagOnNewsItem
                                                      ? (<button
                                                            type="button"
                                                            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-blue-gray-900 shadow-sm hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                        >
                                                            Nope, no web3
                                                        </button>)
                                                      : (<button
                                                            // @ts-ignore
                                                            onClick={() => addTagToNewsItemInSupabase(newsItem.id, web3Tag.id)}
                                                            type="button"
                                                            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                        >
                                                            {buttonTitle}
                                                        </button>)}
                                                            {/*  <button type="button" className="inline-flex space-x-2 text-gray-400 hover:text-gray-500"> */}
                                                            {/*  <ShareIcon className="h-5 w-5" aria-hidden="true"/> */}
                                                            {/*  <span className="font-medium text-gray-900">Share</span> */}
                                                            {/* </button> */}
                                                        </span>
                    </div>
                </div>
            </article>
        </li>
  }

  const renderComponent = () => {
    return (
            <div className="min-h-screen">
                {/* When the mobile menu is open, add `overflow-hidden` to the `body` element to prevent double scrollbars */}
                <Popover
                    as="header"
                    className={({ open }) =>
                      classNames(
                        open ? 'fixed inset-0 z-40 overflow-y-auto' : '',
                        'bg-white shadow-sm lg:static lg:overflow-y-visible'
                      )
                    }
                >
                    {({ open }) => (
                        <>
                            <NavBar/>
                            {/* <Popover.Panel as="nav" className="lg:hidden" aria-label="Global"> */}
                            {/* <div className="border-t border-gray-200 pt-4"> */}
                            {/*    <div className="mx-auto flex max-w-3xl items-center px-4 sm:px-6"> */}
                            {/*        <div className="flex-shrink-0"> */}
                            {/*            <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt=""/> */}
                            {/*        </div> */}
                            {/*        <div className="ml-3"> */}
                            {/*            <div className="text-base font-medium text-gray-800">{user.name}</div> */}
                            {/*            <div className="text-sm font-medium text-gray-500">{user.email}</div> */}
                            {/*        </div> */}
                            {/*        <button */}
                            {/*            type="button" */}
                            {/*            className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2" */}
                            {/*        > */}
                            {/*            <span className="sr-only">View notifications</span> */}
                            {/*            <BellIcon className="h-6 w-6" aria-hidden="true"/> */}
                            {/*        </button> */}
                            {/*    </div> */}
                            {/*    <div className="mx-auto mt-3 max-w-3xl space-y-1 px-2 sm:px-4"> */}
                            {/*        {userNavigation.map((item) => ( */}
                            {/*            <a */}
                            {/*                key={item.name} */}
                            {/*                href={item.href} */}
                            {/*                className="block rounded-md py-2 px-3 text-base font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900" */}
                            {/*            > */}
                            {/*                {item.name} */}
                            {/*            </a> */}
                            {/*        ))} */}
                            {/*    </div> */}
                            {/* </div> */}

                            {/* <div className="mx-auto mt-6 max-w-3xl px-4 sm:px-6"> */}
                            {/*    <a */}
                            {/*        href="#" */}
                            {/*        className="flex w-full items-center justify-center rounded-md border border-transparent bg-rose-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-rose-700" */}
                            {/*    > */}
                            {/*        New Post */}
                            {/*    </a> */}

                            {/*    <div className="mt-6 flex justify-center"> */}
                            {/*        <a href="#" className="text-base font-medium text-gray-900 hover:underline"> */}
                            {/*            Go Premium */}
                            {/*        </a> */}
                            {/*    </div> */}
                            {/* </div> */}
                            {/* </Popover.Panel> */}
                        </>
                    )}
                </Popover>
                <div className="mx-auto pt-8 px-8">
                    <div className="lg:grid lg:grid-cols-1 lg:items-center lg:gap-24">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                                Welcome friendly contributor 👋🏼
                            </h2>
                            <p className="mt-6 max-w-3xl text-lg leading-7 text-gray-500">
                                We are excited that you want to help out with Loopie 🎉<br/>
                                Join our Discord or jump in below and support with labeling the latest news
                            </p>
                        </div>
                    </div>
                </div>
                <div className="py-4">
                    <div className="mx-auto sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-8 lg:px-8">
                        <main className="lg:col-span-9 xl:col-span-6">
                            {/* <div className="px-4 sm:px-0"> */}
                            {/*    <div className="sm:hidden"> */}
                            {/*        <label htmlFor="question-tabs" className="sr-only"> */}
                            {/*            Select a tab */}
                            {/*        </label> */}
                            {/*        <select */}
                            {/*            id="question-tabs" */}
                            {/*            className="block w-full rounded-md border-gray-300 text-base font-medium text-gray-900 shadow-sm focus:border-rose-500 focus:ring-rose-500" */}
                            {/*            defaultValue={tabs.find((tab) => tab.current).name} */}
                            {/*        > */}
                            {/*            {tabs.map((tab) => ( */}
                            {/*                <option key={tab.name}>{tab.name}</option> */}
                            {/*            ))} */}
                            {/*        </select> */}
                            {/*    </div> */}
                            {/*    <div className="hidden sm:block"> */}
                            {/*        <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow" */}
                            {/*             aria-label="Tabs"> */}
                            {/*            {tabs.map((tab, tabIdx) => ( */}
                            {/*                <a */}
                            {/*                    key={tab.name} */}
                            {/*                    href={tab.href} */}
                            {/*                    aria-current={tab.current ? 'page' : undefined} */}
                            {/*                    className={classNames( */}
                            {/*                        tab.current ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700', */}
                            {/*                        tabIdx === 0 ? 'rounded-l-lg' : '', */}
                            {/*                        tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '', */}
                            {/*                        'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-sm font-medium text-center hover:bg-gray-50 focus:z-10' */}
                            {/*                    )} */}
                            {/*                > */}
                            {/*                    <span>{tab.name}</span> */}
                            {/*                    <span */}
                            {/*                        aria-hidden="true" */}
                            {/*                        className={classNames( */}
                            {/*                            tab.current ? 'bg-rose-500' : 'bg-transparent', */}
                            {/*                            'absolute inset-x-0 bottom-0 h-0.5' */}
                            {/*                        )} */}
                            {/*                    /> */}
                            {/*                </a> */}
                            {/*            ))} */}
                            {/*        </nav> */}
                            {/*    </div> */}
                            {/* </div> */}

                            <div className="">
                                <h1 className="sr-only">News</h1>

                                {!hasData
                                  ? <LoadingComponent/>
                                  : <ul role="list" className="space-y-4">
                                        {newsItems.map((newsItem) => renderNewsItemToTagRow(newsItem))}
                                    </ul>
                                }
                            </div>
                        </main>
                        <aside className="hidden xl:col-span-4 xl:block">
                            <div className="sticky top-4 space-y-4">
                                <section aria-labelledby="trending-heading">
                                    <div className="rounded-lg bg-white shadow">
                                        <div className="p-6">
                                            <h2 id="trending-heading" className="text-base font-medium text-gray-900">
                                                Trending
                                            </h2>
                                            <div className="mt-6">
                                                <a
                                                    href="#"
                                                    className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                                                >
                                                    View all
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
    )
  }

  return renderComponent()
}
