import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Popover } from '@headlessui/react'
import { createClient } from '@supabase/supabase-js'
import dayjs from 'dayjs'
import { filter, find, findIndex, get, includes, isEmpty, map, split } from 'lodash'
import { LoadingComponent } from './LoadingComponent'
import { ArrowTopRightOnSquareIcon, CalendarDaysIcon, StarIcon, UserIcon } from '@heroicons/react/24/solid'
import { ConnectButton } from './ConnectButton'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import { ScoredNewsItem, Tag } from '../const'
import clsx from 'clsx'

dayjs().format()
dayjs.extend(utc)
dayjs.extend(relativeTime)

const tabs = [
  {
    name: 'Web3 News: Yes/No',
    href: '#',
    current: true,
    enabled: true
  },
  {
    name: 'More tasks',
    href: '#',
    current: false,
    enabled: false
  },
  {
    name: 'coming soon',
    href: '#',
    current: false,
    enabled: false
  }
]
const NEWS_ITEMS_PER_PAGE = 15

export function ContributeComponent () {
  const {
    status,
    data: session
  } = useSession({
    required: true,
    onUnauthenticated () {
      // The user is not authenticated, handling it here
      // openConnectModal?.()
    }
  })
  const account = session?.user?.name
  const [paginationIndex, setPaginationIndex] = useState(0)
  const [newsItems, setNewsItems] = useState<ScoredNewsItem[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [newsItemIdToState, setNewsItemIdToState] = useState<{ [key: string]: string }>({})
  const web3Tag = find(tags, tag => tag.title === 'Web3')
  const hasData = !isEmpty(tags) && !isEmpty(newsItems)

  const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string)
  const tweetStartDate = dayjs().utc().subtract(2, 'days')
  const isLoading = status === 'loading'

  const getTagsFromSupabase = async () => {
    const {
      data,
      error
    } = await supabase
      .from('Tag')
      .select('*')

    if (error || !data) {
      console.log(error)
      return
    }

    // @ts-ignore
    setTags(data)
  }

  const getNewsItemsFromSupabase = async (pageStartIndex: number = 0) => {
    const {
      data,
      error
    } = await supabase
      .from('scorednewsitem')
      .select('*, NewsItemToTweet( Tweet(created_at, id::text, text, Author (twitter_username))), NewsItemToTag( Tag(*))', { count: 'exact' })
      .gte('last_tweet_date', tweetStartDate.format('YYYY-MM-DD'))
      .order('score', { ascending: false })
      .range(pageStartIndex, pageStartIndex + NEWS_ITEMS_PER_PAGE)

    if (error || !data) {
      console.log(error)
      return
    }
    // @ts-ignore
    setNewsItems(data)
  }

  useEffect(() => {
    if (!isEmpty(newsItems)) {
      return
    }

    getTagsFromSupabase().then(() => getNewsItemsFromSupabase(paginationIndex)).then(() =>
      setNewsItemIdToState(map(newsItems, 'id').reduce((o, key) => ({
        ...o,
        [key]: ''
      }), {}))
    )
  }, [status])

  const renderWelcomeText = () =>
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

  if (isLoading) {
    return <div className="h-screen grid grid-cols place-content-center">
      {renderWelcomeText()}
      <div className="pt-8 px-8">
        <ConnectButton/>
      </div>
    </div>
  }

  const removeTagFromNewsItemInSupabase = async (newsItemId: string, tagId: string) => {
    console.log('removing tag for news item id', newsItemId)
    setNewsItemIdToState({
      ...newsItemIdToState,
      [newsItemId]: 'pending'
    })
    const {
      data,
      error
    } = await supabase
      .from('NewsItemToTag')
      .delete()
      .in('wallet_address', ['AUTOMATION', account])
      .match({
        news_item_id: newsItemId,
        tag_id: tagId
      })

    if (error || !data) {
      console.log(error)
      setNewsItemIdToState({
        ...newsItemIdToState,
        [newsItemId]: 'error'
      })
    } else {
      setNewsItemIdToState({
        ...newsItemIdToState,
        [newsItemId]: 'success'
      })
    }
  }

  const addTagToNewsItemInSupabase = async (newsItemId: string, tagId: string) => {
    setNewsItemIdToState({
      ...newsItemIdToState,
      [newsItemId]: 'pending'
    })

    const {
      data,
      error
    } = await supabase
      .from('NewsItemToTag')
      .insert([
        {
          news_item_id: newsItemId,
          tag_id: tagId,
          wallet_address: account
        }
      ])

    if (error || !data) {
      console.log(error)
      setNewsItemIdToState({
        ...newsItemIdToState,
        [newsItemId]: 'error'
      })
    } else {
      setNewsItemIdToState({
        ...newsItemIdToState,
        [newsItemId]: 'success'
      })
    }
  }

  const onSubmitNextPage = () => {
    const newPaginationIndex = paginationIndex + NEWS_ITEMS_PER_PAGE + 1
    setPaginationIndex(newPaginationIndex)
    setNewsItems([])
    getNewsItemsFromSupabase(newPaginationIndex)
  }

  const getButtonTitleFromState = (state: string, hasWeb3TagOnNewsItem: boolean) => {
    switch (state) {
      case '':
      case undefined:
        return hasWeb3TagOnNewsItem ? 'Nope, it\'s not web3' : 'Yes, it\'s web3'
      case 'pending':
        return '...'
      case 'success':
        return 'Done'
      case 'error':
        return 'X'
    }
  }

  function renderNewsItemToTagRow (newsItem: ScoredNewsItem, newsItemState: string) {
    const tagsOnNewsItem = filter(map(newsItem.NewsItemToTag, 'Tag'), (tag) => !isEmpty(tag))
    const hasWeb3TagOnNewsItem = findIndex(tagsOnNewsItem, (tag: Tag) => tag.id === web3Tag?.id) !== -1
    const buttonTitle = getButtonTitleFromState(newsItemState, hasWeb3TagOnNewsItem)
    const isButtonEnabled = includes([undefined, '', 'pending'], newsItemState)

    return <li key={newsItem.id}
               className="max-w-xl bg-white px-4 py-6 shadow sm:rounded-lg sm:p-6">
      <article aria-labelledby={'newsItem-title-' + newsItem.id}>
        <div>
          <div className="flex space-x-3">
            <div className="min-w-0 flex-1">
              <h2 id={'newsItem-title-' + newsItem.id}
                  className="mt-4 text-base font-medium text-gray-900">
                <a target="_blank"
                   rel="noreferrer noopener"
                   className="flex hover:underline"
                   href={newsItem.url}>{newsItem.title}
                  <ArrowTopRightOnSquareIcon className="ml-2 w-5 h-5"/>
                </a>
              </h2>
              <p className="text-sm font-medium text-gray-500">
                <div className="mx-auto flex space-x-4 mt-2 py-2">
                  {map(tagsOnNewsItem, (tag, index) =>
                    <span
                      className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800">
                      {tag.title}
                    </span>)}
                </div>
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
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-between space-x-8">
          <div className="flex space-x-6">
            {/* <span className="inline-flex items-center text-sm"> */}
            {/*  <button type="button" */}
            {/*          className="inline-flex space-x-2 text-gray-400"> */}
            {/*    <HandThumbUpIcon className="h-5 w-5" aria-hidden="true"/> */}
            {/*    <span */}
            {/*      className="font-medium text-gray-900">{newsItem.score}</span> */}
            {/*    <span className="sr-only">score</span> */}
            {/*  </button> */}
            {/* </span> */}
            <span className="inline-flex items-center text-sm">
              <button type="button"
                      className="inline-flex space-x-2 text-gray-400">
                <UserIcon className="h-5 w-5" aria-hidden="true"/>
                <span
                  className="font-medium text-gray-700">{newsItem.count_unique_authors}</span>
                <span className="sr-only">number of posters</span>
              </button>
            </span>
            <span className="inline-flex items-center text-sm">
              <button type="button"
                      className="inline-flex space-x-2 text-gray-400">
                <CalendarDaysIcon className="h-5 w-5" aria-hidden="true"/>
                <span
                  className="font-medium text-gray-700">{split(newsItem.updated_at, 'T')[0]}</span>
                <span className="sr-only">created at date</span>
              </button>
            </span
            ><span className="inline-flex items-center text-sm">
              <button type="button"
                      className="inline-flex space-x-2 text-gray-400">
                <StarIcon className="h-5 w-5" aria-hidden="true"/>
                <span
                  className="font-medium text-gray-700">{newsItem.score}</span>
                <span className="sr-only">score</span>
              </button>
            </span>
          </div>
          <div className="flex text-sm">
                <span className="inline-flex items-center text-sm">
                  <button
                    disabled={!isButtonEnabled}
                    // @ts-ignore
                    onClick={() => hasWeb3TagOnNewsItem ? removeTagFromNewsItemInSupabase(newsItem.id, web3Tag.id) : addTagToNewsItemInSupabase(newsItem.id, web3Tag.id)}
                    className={clsx(
                      isButtonEnabled && (hasWeb3TagOnNewsItem ? 'bg-gray-400 hover:bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'),
                      newsItemState === 'success' && 'bg-green-600',
                      isButtonEnabled && 'shadow-sm',
                      'inline-flex justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none')}
                  >
                      {buttonTitle}
                    </button>
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
            clsx(
              open ? 'fixed inset-0 z-40 overflow-y-auto' : '',
              'bg-white shadow-sm lg:static lg:overflow-y-visible'
            )
          }
        >
          {({ open }) => (
            <>
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
        {renderWelcomeText()}
        <div className="py-4">
          <div className="mx-auto sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-12 lg:gap-8 lg:px-8">
            <main className="lg:col-span-9 xl:col-span-9">
              <div className="px-4 sm:px-0">
                <div className="sm:hidden">
                  <label htmlFor="question-tabs" className="sr-only">
                    Select a tab
                  </label>
                  <select
                    id="question-tabs"
                    className="block w-full rounded-md border-gray-300 text-base font-medium text-gray-900 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                    // @ts-ignore
                    defaultValue={tabs.find((tab) => tab.current).name}
                  >
                    {tabs.map((tab) => (
                      <option key={tab.name}>{tab.name}</option>
                    ))}
                  </select>
                </div>
                <div className="hidden sm:block">
                  <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
                       aria-label="Tabs">
                    {tabs.map((tab, tabIdx) => (
                      <a
                        key={tab.name}
                        href={tab.href}
                        aria-current={tab.current ? 'page' : undefined}
                        className={clsx(
                          tab.current ? 'text-gray-900' : 'text-gray-500',
                          tab.enabled ? 'hover:text-gray-700 hover:bg-gray-50' : 'bg-gray-50',
                          tabIdx === 0 ? 'rounded-l-lg' : '',
                          tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                          'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-6 text-sm font-medium text-center focus:z-10'
                        )}
                      >
                        <span>{tab.name}</span>
                        <span
                          aria-hidden="true"
                          className={clsx(
                            tab.current ? 'bg-rose-500' : 'bg-transparent',
                            'absolute inset-x-0 bottom-0 h-0.5'
                          )}
                        />
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="">
                <h1 className="sr-only">News</h1>
                {!hasData
                  ? <><LoadingComponent/></>
                  : <ul role="list" className="space-y-4">
                    {newsItems.map((newsItem) => renderNewsItemToTagRow(newsItem, get(newsItemIdToState, newsItem.id)))}
                  </ul>
                }
              </div>
              {hasData && (<div className="grid grid-cols place-content-center mt-8">
                <button
                  className="items-center px-2 py-1 border border-transparent text-light font-small rounded-md text-white bg-gray-700"
                  onClick={() => onSubmitNextPage()}>Show more
                </button>
                <p className="mt-2 text-sm font-medium text-gray-500">
                  showing items {paginationIndex + 1} to {paginationIndex + NEWS_ITEMS_PER_PAGE + 1}
                </p>
              </div>)}
            </main>
            {/* <aside className="hidden xl:col-span-4 xl:block"> */}
            {/*    <div className="sticky top-4 space-y-4"> */}
            {/*        <section aria-labelledby="trending-heading"> */}
            {/*            <div className="rounded-lg bg-white shadow"> */}
            {/*                <div className="p-6"> */}
            {/*                    <h2 id="trending-heading" className="text-base font-medium text-gray-900"> */}
            {/*                        Trending */}
            {/*                    </h2> */}
            {/*                    <div className="mt-6"> */}
            {/*                        <a */}
            {/*                            href="#" */}
            {/*                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50" */}
            {/*                        > */}
            {/*                            View all */}
            {/*                        </a> */}
            {/*                    </div> */}
            {/*                </div> */}
            {/*            </div> */}
            {/*        </section> */}
            {/*    </div> */}
            {/* </aside> */}
          </div>
        </div>
      </div>
    )
  }

  return renderComponent()
}
