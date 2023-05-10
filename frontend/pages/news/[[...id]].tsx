import { useState } from 'react'
import NewsItemRowComponent from '../../src/components/NewsItemRowComponent'
import Footer from '../../src/components/Footer'
import { GetStaticPaths, GetStaticProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { map, take, values } from 'lodash'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import NavBar from '../../src/components/NavBar'
import SideBar from '../../src/components/SideBar'
import { NewsCategoriesEnum } from '../../src/const'

dayjs().format()
dayjs.extend(utc)
dayjs.extend(relativeTime)

interface IndexProps {
  newsItems: Array<object>;
}

const NewsPage = (props: IndexProps) => {
  let { newsItems } = props
  const [isShowingMore, setIsShowingMore] = useState(false)

  if (!isShowingMore) {
    newsItems = take(newsItems, 15)
  }

  const renderNewsletterSignup = () =>
    <iframe src="https://embeds.beehiiv.com/89ec0452-f9ac-41d5-ba96-31735973d0d4?slim=true" data-test-id="beehiiv-embed"
            height="52" frameBorder="0" scrolling="no"
            style={{
              margin: 0,
              borderRadius: '0px !important',
              backgroundColor: 'transparent'
            }}></iframe>

  function renderNewsPageContent () {
    return (<div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mt-2 lg:mt-5 flex flex-col">
          <div className="-mx-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full">
                  <tbody className="">
                  {map(newsItems, (newsItem, index) =>
                    <NewsItemRowComponent key={`url-row-${index}`}
                                          newsItem={newsItem}/>
                  )}
                  </tbody>
                </table>
                <div className="grid grid-cols place-content-center mt-4 mb-6">
                  {renderNewsletterSignup()}
                </div>
                <div className="grid grid-cols place-content-center">
                  <button
                    className="inline-flex items-center px-2 py-1 border border-transparent text-light font-small rounded-md text-white bg-gray-700"
                    onClick={() => setIsShowingMore(!isShowingMore)}>{isShowingMore ? 'Show less' : 'Show more'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div>
        <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        <div className="xl:pl-64 flex flex-col flex-1" style={{ backgroundColor: '#FFFDF6' }}>
          <NavBar setSidebarOpen={setSidebarOpen}/>
          <div className="max-w-5xl px-4 sm:px-6 md:px-8">
            {renderNewsPageContent()}
          </div>
          <Footer/>
        </div>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: values(NewsCategoriesEnum).map(tab => ({ params: { id: [tab] } })),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async context => {
  // @ts-ignore
  const { params: { id } } = context
  const tag = id || NewsCategoriesEnum.WEB3

  const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string)
  const tweetStartDate = dayjs().utc().subtract(2, 'days')
  const {
    data,
    error
  } = await supabase
    .from('scorednewsitem')
    .select(
      `*, 
      NewsItemSummary(
        summary
      ),
      NewsItemToTag(
        Tag(
          title
        )
      ),
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
      )
      `)
    .contains('tags', tag)
    .gte('last_tweet_date', tweetStartDate.format('YYYY-MM-DD'))
    .order('score', { ascending: false })
    .limit(25)
  if (error) {
    console.log(error)
    throw error
  }

  if (!data) {
    throw new Error('No news items returned from DB')
  }

  return {
    props: {
      newsItems: data
    },
    revalidate: 15 * 60 // every 15mins
  }
}

export default NewsPage