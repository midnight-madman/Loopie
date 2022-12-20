import { useState } from 'react'
import NewsItemRowComponent from '../src/components/NewsItemRowComponent'
import Footer from '../src/components/Footer'
import { GetStaticProps } from 'next'
import { createClient } from '@supabase/supabase-js'
import { map, take } from 'lodash'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import relativeTime from 'dayjs/plugin/relativeTime'
import NavBar from '../src/components/NavBar'
import SideBar from '../src/components/SideBar'
import { ScoredNewsItem } from '../src/const'

dayjs().format()
dayjs.extend(utc)
dayjs.extend(relativeTime)

interface IndexProps {
  newsItems: Array<object>;
}

const Index = (props: IndexProps) => {
  let { newsItems } = props
  const [isShowingMore, setIsShowingMore] = useState(false)

  if (!isShowingMore) {
    newsItems = take(newsItems, 20)
  }

  function renderNewsPageContent () {
    return (<div className="px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mt-2 lg:mt-5 flex flex-col">
          <div className="-mx-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                <table className="min-w-full">
                  {/*<thead className="bg-gray-50">*/}
                  {/*<tr>*/}
                  {/*    <th*/}
                  {/*        scope="col"*/}
                  {/*        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"*/}
                  {/*    >*/}
                  {/*        Name*/}
                  {/*    </th>*/}
                  {/*    <th scope="col"*/}
                  {/*        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">*/}
                  {/*        Edit*/}
                  {/*        <span className="sr-only">Edit</span>*/}
                  {/*    </th>*/}
                  {/*</tr>*/}
                  {/*</thead>*/}
                  <tbody className="">
                  {map(newsItems, (newsItem, index) =>
                    <NewsItemRowComponent key={`url-row-${index}`}
                                          newsItem={newsItem}/>
                  )}
                  </tbody>
                </table>
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
        <div className="md:pl-64 flex flex-col flex-1" style={{ backgroundColor: '#FFFDF6' }}>
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

export const getStaticProps: GetStaticProps = async context => {
  const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string)
  const tweetStartDate = dayjs().utc().subtract(2, 'days')
  const {
    data,
    error
  } = await supabase
    .from<ScoredNewsItem>('scorednewsitem')
    .select(
      `*, 
      NewsItemSummary(
        summary
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
    .gte('last_tweet_date', tweetStartDate.format('YYYY-MM-DD'))
    .order('score', { ascending: false })
    .limit(50)
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

export default Index
