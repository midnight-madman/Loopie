import { useState } from 'react'
import Footer from '../src/components/Footer'
import { GetStaticProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { map, isNil, omitBy, take } from 'lodash'

import dayjs from 'dayjs'
import NavBar from '../src/components/NavBar'
import SideBar from '../src/components/SideBar'
import ReactPlayer from 'react-player/lazy'
import { ScoredNewsItem } from '../src/const'

interface IndexProps {
  newsItems: Array<ScoredNewsItem>;
}

const Videos = (props: IndexProps) => {
  let { newsItems } = props

  const [isShowingMore, setIsShowingMore] = useState(false)

  if (!isShowingMore) {
    newsItems = take(newsItems, 10)
  }

  const renderVideoTile = (newsItem: ScoredNewsItem) => {
    if (!ReactPlayer.canPlay(newsItem.url)) {
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
          <div className="font-medium leading-6">
            <a href={newsItem.url} className="text-xl text-gray-700 hover:text-gray-500 hover:underline">
              <h3>
                {newsItem.title}
              </h3>
            </a>
            <p className="mt-1 text-md text-gray-400">Score {newsItem.score}</p>
          </div>
          {/*<div className="text-lg">*/}
          {/*  <p className="text-gray-500">{newsItem.bio}</p>*/}
          {/*</div>*/}
        </div>
      </li>
    )
  }

  const renderVideosPageContent = () => {
    return <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:px-8 lg:py-24">
      <div className="space-y-12 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
        <div className="space-y-5 sm:space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loopie Videos</h2>
          <p className="text-xl text-gray-500">
            Heavily shared videos from the Loopie
          </p>
        </div>
        <div className="lg:col-span-2">
          <ul
            role="list"
            className="space-y-12 sm:grid sm:grid-cols-1 sm:gap-x-6 sm:gap-y-12 sm:space-y-0 lg:gap-x-8"
          >
            {map(newsItems, renderVideoTile)}
          </ul>
          <div className="grid grid-cols place-content-center">
            <button
              className="inline-flex items-center px-2 py-1 border border-transparent text-light font-small rounded-md text-white bg-gray-700"
              onClick={() => setIsShowingMore(!isShowingMore)}>{isShowingMore ? 'Show less' : 'Show more'}</button>
          </div>
        </div>
      </div>
    </div>
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div>
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <div className="md:pl-64 flex flex-col flex-1" style={{ backgroundColor: '#FFFDF6' }}>
          <NavBar setSidebarOpen={setSidebarOpen}/>
          <div className="max-w-6xl px-4 sm:px-6 md:px-8">
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
  const tweetStartDate = dayjs().utc().subtract(2, 'days')
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
            twitter_username
          )
        )
      ), 
      NewsItemToTag(
        Tag(
          *
        )
      )`)
    .eq('NewsItemToTag.Tag.title', 'Video')
    .eq('NewsItemToTag.Tag.title', 'Web3')
    .gte('updated_at', tweetStartDate.format('YYYY-MM-DD'))
    .order('score', { ascending: false })
    .limit(30)

  if (error) {
    console.log(error)
    throw error
  }

  if (!data) {
    throw new Error('No news items returned from DB')
  }
  const newsItems = data.map((newsItem) => omitBy(newsItem, isNil))

  return {
    props: {
      newsItems
    },
    revalidate: 15 * 60 // every 15mins
  }
}

export default Videos
