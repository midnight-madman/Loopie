import { useState } from 'react'
import Footer from '../src/components/Footer'
import { GetStaticProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { filter, includes, map, take } from 'lodash'

import dayjs from 'dayjs'
import NavBar from '../src/components/NavBar'
import SideBar from '../src/components/SideBar'
import ReactPlayer from 'react-player/lazy'
import { ScoredNewsItem } from '../src/const'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import NewsItemRowComponent from '../src/components/NewsItemRowComponent'

const PODCAST_TAG_TITLE = 'Podcast'
const SHOW_MORE_THRESHOLD = 5

dayjs().format()
dayjs.extend(utc)
dayjs.extend(relativeTime)

interface PodcastsPageProps {
  newsItems: Array<ScoredNewsItem>;
}

const Podcasts = (props: PodcastsPageProps) => {
  let { newsItems } = props

  const [isShowingMore, setIsShowingMore] = useState(false)

  if (!isShowingMore) {
    newsItems = take(newsItems, SHOW_MORE_THRESHOLD)
  }

  const renderVideoTile = (newsItem: ScoredNewsItem, index: number) => {
    const canPlayVideo = ReactPlayer.canPlay(newsItem.url)
    if (!canPlayVideo) {
      return null
    }

    return (
      <li key={newsItem.id}>
        <div className="space-y-4">
          <div className="aspect-w-3 aspect-h-2">
            <div className="rounded-lg object-cover shadow-lg overflow-hidden">
              <ReactPlayer url={newsItem.url} light={true} width="100%" height="100%"/>
            </div>
          </div>
        </div>
        <NewsItemRowComponent newsItem={newsItem} isAlwaysExpanded showTags={false} />
      </li>
    )
  }

  function renderShowMoreButton () {
    return <div className="grid grid-cols place-content-center">
      <button
        className="inline-flex items-center px-2 py-1 border border-transparent text-light font-small rounded-md text-white bg-gray-700"
        onClick={() => setIsShowingMore(!isShowingMore)}>{isShowingMore ? 'Show less' : 'Show more'}</button>
    </div>
  }

  const canShowMore = newsItems.length > SHOW_MORE_THRESHOLD
  const renderVideosPageContent = () => {
    return <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8 lg:py-24">
      <div className="space-y-12 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
        <div className="space-y-5 sm:space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Podcasts</h2>
          <p className="text-xl text-gray-500">
            Heavily shared podcasts from the Loopie-verse
          </p>
        </div>
        <div className="lg:col-span-2">
          <ul
            role="list"
            className="space-y-12 sm:grid sm:grid-cols-1 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:gap-x-8"
          >
            {map(newsItems, (newsItem, idx) => renderVideoTile(newsItem, idx))}
          </ul>
          {canShowMore && renderShowMoreButton()}
        </div>
      </div>
    </div>
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div>
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <div className="xl:pl-64 flex flex-col flex-1" style={{ backgroundColor: '#FFFDF6' }}>
          <NavBar setSidebarOpen={setSidebarOpen}/>
          <div className="min-h-screen max-w-6xl px-4 sm:px-6 md:px-8">
            {renderVideosPageContent()}
          </div>
          <Footer/>
        </div>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps = async context => {
  const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string)
  const tweetStartDate = dayjs().utc().subtract(7, 'days')
  const {
    data,
    error
  } = await supabase
    .from('scorednewsitem')
    .select(
      `*, 
      NewsItemToTweet( 
        Tweet(
          created_at, 
          id::text, 
          text, 
          Author(
            twitter_username,
            score
          )
        )
      ), 
      NewsItemToTag(Tag(title))
      `)
    .contains('tags', [PODCAST_TAG_TITLE])
    .gte('last_tweet_date', tweetStartDate.format('YYYY-MM-DD'))
    .order('score', { ascending: false })
    .limit(100)

  if (error) {
    console.log(error)
    throw error
  }

  if (!data) {
    throw new Error('No news items returned from DB')
  }
  // @ts-ignore
  const newsItems = filter(data, (newsItem) => includes(newsItem.tags, PODCAST_TAG_TITLE))
  return {
    props: {
      newsItems
    },
    revalidate: 15 * 60 // every 15mins
  }
}

export default Podcasts
