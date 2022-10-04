import {Fragment, useState} from 'react'
import {Dialog, Popover, Transition} from '@headlessui/react'
import {HomeIcon, InformationCircleIcon, MenuIcon, SpeakerphoneIcon, XIcon,} from '@heroicons/react/outline'
import InfoComponent from "../src/components/InfoComponent";
import NewsItemRowComponent from "../src/components/NewsItemRowComponent";
import FeedbackModalComponent from "../src/components/FeedbackModalComponent";
import Footer from "../src/components/Footer";
import {GetStaticProps} from 'next'
import {createClient} from '@supabase/supabase-js'
import {isNil, omitBy, take} from "lodash";
import {ConnectButton} from '@rainbow-me/rainbowkit';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import {useAccount} from 'wagmi';

dayjs().format()
dayjs.extend(utc)
dayjs.extend(relativeTime)


// @ts-ignore
function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

interface IndexProps {
    newsItems: Array<object>;
}

const Index = (props: IndexProps) => {
    let {newsItems} = props;
    const {address, isConnected} = useAccount()

    const [selectedPage, setSelectedPage] = useState('news')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isShowingMore, setIsShowingMore] = useState(false)

    if(!isShowingMore) {
        newsItems = take(newsItems, 25)
    }

    let navigation = [
        {
            name: 'News',
            onClick: () => {
                setSelectedPage('news')
                setSidebarOpen(false);
            },
            icon: HomeIcon,
            current: selectedPage === 'news',
            className: "hover:cursor-pointer"
        },
        {
            name: 'About Loopie',
            onClick: () => {
                setSelectedPage('info');
                setSidebarOpen(false);
            },
            icon: InformationCircleIcon,
            current: selectedPage === 'info',
            className: "hover:cursor-pointer"
        }, {
            name: 'Submit Feedback',
            onClick: () => {
                setIsFeedbackModalOpen(true);
                setSidebarOpen(false);
            },
            icon: SpeakerphoneIcon,
            current: false,
            className: "hover:cursor-pointer"
        },
        // { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
        // { name: 'Documents', href: '#', icon: InboxIcon, current: false },
        // { name: 'Reports', href: '#', icon: ChartBarIcon, current: false },
    ]

    function renderPageContent() {
        switch (selectedPage) {
            case 'news':
                return (<>
                        <Popover as="header" className="relative">
                            <div className="bg-white py-2 hidden md:block border-b border-gray-200">
                                <nav
                                    className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
                                    aria-label="Global"
                                >
                                    <div className="flex items-center flex-1">
                                        <div className="space-x-2 flex flex-shrink-0 items-center md:ml-4">
                                            <img src="/favicon.png" alt="Logo" className="h-12 -ml-2"/>
                                            <h1 className="font-semibold text-gray-800 text-3xl">Loopie</h1>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex md:items-center md:space-x-6">
                                        {/*<p*/}
                                        {/*    className="inline-flex items-center text-light font-small rounded-md text-gray-700"*/}
                                        {/*>*/}
                                        {/*    Updated {updatedAtTime.fromNow()}*/}
                                        {/*</p>*/}
                                        <button
                                            onClick={() => setIsFeedbackModalOpen(true)}
                                            className="inline-flex items-center px-2 py-1 border border-transparent text-light font-small rounded-md text-white bg-gray-700"
                                        >
                                            Feedback
                                        </button>
                                    </div>
                                </nav>
                            </div>

                            <Transition
                                as={Fragment}
                                enter="duration-150 ease-out"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="duration-100 ease-in"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                            </Transition>
                        </Popover>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {renderNewsPageContent()}
                        </div>
                    </>
                )
            case 'info':
                return <InfoComponent openFeedbackModal={() => setIsFeedbackModalOpen(true)}/>
            default:
                return <p>coming soon</p>
        }
    }

    function renderNewsPageContent() {
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
                                    {newsItems.map((newsItem, index) =>
                                        <NewsItemRowComponent key={`url-row-${index}`} newsItem={newsItem}
                                                              index={index}/>
                                    )}
                                    </tbody>
                                </table>
                                <div className="grid grid-cols place-content-center">
                                    <button className="inline-flex items-center px-2 py-1 border border-transparent text-light font-small rounded-md text-white bg-gray-700"
                                        onClick={() => setIsShowingMore(!isShowingMore)}>{isShowingMore ? 'Show less' : 'Show more'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    function renderAccountSection() {
        return (<div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                    {!isConnected && (<div className="">
                        <img
                            className="inline-block h-9 w-9 rounded-full"
                            src="./profile_mock.png"
                            alt=""
                        />
                    </div>)}
                    <div className="ml-3">
                        <ConnectButton chainStatus="none" label="Login" accountStatus="full" showBalance={false}/>
                        {/*<p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">*/}
                        {/*    coming soon*/}
                        {/*</p>*/}
                    </div>
                </div>
            </div>
        </div>)
    }

    // @ts-ignore
    return (
        <>
            <script id="reform-script" async src="https://embed.reform.app/v1/embed.js"/>
            {isFeedbackModalOpen && (
                <FeedbackModalComponent open={isFeedbackModalOpen} setOpen={setIsFeedbackModalOpen}/>)}
            <div>
                <Transition.Root show={sidebarOpen} as={Fragment}>
                    <Dialog as="div" className="fixed inset-0 flex z-40 md:hidden" onClose={setSidebarOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75"/>
                        </Transition.Child>
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                                        <button
                                            type="button"
                                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <span className="sr-only">Close sidebar</span>
                                            <XIcon className="h-6 w-6 text-white" aria-hidden="true"/>
                                        </button>
                                    </div>
                                </Transition.Child>
                                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                                    <div className="flex-shrink-0 flex items-center px-4">
                                        <img src="/favicon.png" alt="Logo" className="h-10"/>
                                        <p className="font-medium text-2xl">Loopie</p>
                                    </div>
                                    <nav className="mt-5 px-2 space-y-1">
                                        {navigation.map((item) => (
                                            <button
                                                key={item.name}
                                                // href={!item.onClick && item.href}
                                                onClick={() => item.onClick && item.onClick()}
                                                className={classNames(
                                                    item.current
                                                        ? 'bg-gray-100 text-gray-900'
                                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                                    item.className,
                                                    'group flex items-center px-2 py-2 text-base font-medium rounded-md'
                                                )}
                                            >
                                                <item.icon
                                                    className={classNames(
                                                        item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                                        'mr-4 flex-shrink-0 h-6 w-6'
                                                    )}
                                                    aria-hidden="true"
                                                />
                                                {item.name}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                                {renderAccountSection()}
                            </div>
                        </Transition.Child>
                        <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
                    </Dialog>
                </Transition.Root>

                {/* Static sidebar for desktop */}
                <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                        <div className="flex-1 flex flex-col pb-4 overflow-y-auto">
                            {/*<div className="flex items-center flex-shrink-0 px-4">*/}
                            {/*    <img src="/favicon.png" className="h-10 w-auto" alt="Logo"/>*/}
                            {/*    <p className="font-medium text-2xl">*/}
                            {/*        Loopie*/}
                            {/*    </p>*/}
                            {/*</div>*/}
                            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        // @ts-ignore
                                        href={item.onClick ? undefined : item.href}
                                        onClick={() => item.onClick && item.onClick()}
                                        className={classNames(
                                            item.current
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                                            item.className,
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                        )}
                                    >
                                        <item.icon
                                            className={classNames(
                                                item.current ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
                                                'mr-3 flex-shrink-0 h-6 w-6'
                                            )}
                                            aria-hidden="true"
                                        />
                                        {item.name}
                                    </a>
                                ))}
                            </nav>
                        </div>
                        {renderAccountSection()}
                    </div>
                </div>
                <div className="md:pl-64 flex flex-col flex-1">
                    <div
                        className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-100 flex">
                        <button
                            type="button"
                            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <MenuIcon className="h-6 w-6" aria-hidden="true"/>
                        </button>
                        <h3 className="flex text-md pl-2 pt-2.5 sm:hidden font-semibold text-gray-800">
                            <img src="/favicon.png" className="-mt-1 h-8 w-auto" alt="Logo"/>
                            <p className="">
                                Loopie
                            </p>
                        </h3>
                    </div>
                    <main className="">
                        <div className="">
                            {renderPageContent()}
                        </div>
                    </main>
                    <Footer/>
                </div>
            </div>
        </>
    )
}

// @ts-ignore
export const getStaticProps: GetStaticProps = async context => {
    const supabase = createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string)
    const tweetStartDate = dayjs().utc().subtract(2, 'days')
    const {data, error} = await supabase
        .from('scorednewsitem')
        .select('*, NewsItemToTweet( Tweet(created_at, id::text, text, Author (twitter_username)))')
        .not('title', 'is', null)
        .gte('updated_at', tweetStartDate.format('YYYY-MM-DD'))
        .order('score', {ascending: false})
        .limit(50)

    if (error || !data) {
        console.log(error)
        return {
            props: {
                newsItems: []
            }
        }
    }
    const newsItems = data.map((newsItem) => omitBy(newsItem, isNil));
    return {
        props: {
            newsItems,
        },
        revalidate: 60 * 60 // every hour
    }
}


export default Index;
