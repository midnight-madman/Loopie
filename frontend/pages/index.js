import {Fragment, useState} from 'react'
import {Dialog, Popover, Transition} from '@headlessui/react'
import {ArrowsExpandIcon, HomeIcon, InformationCircleIcon, MenuIcon, XIcon,} from '@heroicons/react/outline'
import Papa from 'papaparse';
import {isEmpty} from "lodash/lang";
import {replace, split} from "lodash/string";
import {map, max} from "lodash";
import {take} from "lodash/array";
import {filter, includes} from "lodash/collection";
import InfoComponent from "../src/components/InfoComponent";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const getCleanUrl = (url) => {
    url = replace(url, /^(https?:\/\/?)|(www\.)/ig, '')
    url = split(url, '?utm_source')[0]
    return url
}

export default function Index({urls, updatedAt}) {
    const [selectedPage, setSelectedPage] = useState('news')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showTwitterLinks, setShowTwitterLinks] = useState(false)

    let navigation = [
        {name: 'News', onClick: () => setSelectedPage('news'), icon: HomeIcon, current: selectedPage === 'news'},
        {
            name: 'About Loopie',
            onClick: () => setSelectedPage('info'),
            icon: InformationCircleIcon,
            current: selectedPage === 'info'
        },
        // { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
        // { name: 'Documents', href: '#', icon: InboxIcon, current: false },
        // { name: 'Reports', href: '#', icon: ChartBarIcon, current: false },
    ]
    // if (selectedPage === 'news') {
    //     navigation.push({
    //         name: showTwitterLinks ? 'Hide Twitter Links' : 'Show Twitter Links',
    //         onClick: () => setShowTwitterLinks(!showTwitterLinks),
    //         icon: FilterIcon,
    //         className: "hover:cursor-pointer"
    //     },)
    // }


    if (!showTwitterLinks) {
        urls = filter(urls, (urlObj) => !includes(urlObj.url, 'twitter.com'))
    }

    urls = take(urls, 100)

    function renderUrlRow(urlObj, index) {
        const hasTitle = !isEmpty(urlObj.url_title)
        const url = getCleanUrl(urlObj.url)
        const rowTitle = hasTitle ? `${urlObj.url_title} (${url})` : url

        let createdAts = replace(urlObj.created_ats, /(\[')|('])|(')/g, '').split(",")
        createdAts = map(createdAts, (createdAt) => new Date(createdAt))
        const latestShareDate = createdAts.length === 1 ? createdAts[0] : createdAts[0]

        return (<tr key={urlObj.url}>
            <td className="whitespace-nowrap pl-2 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                <div className="flex items-center">
                    <div className="font-bold">
                        {index + 1})
                    </div>
                </div>
            </td>
            <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm sm:pl-6 md:py-4">
                <div className="flex items-center">
                    <div className="">
                        <a
                            href={urlObj.url} target="_blank" rel="noreferrer noopener"
                            className="font-medium text-gray-900 hover:underline hover:text-gray-700">
                            {rowTitle}
                        </a>
                        <div className="text-gray-500">
                            {urlObj.tweet_count > 1 ? `${urlObj.tweet_count} shares` : "shared once"} | latest
                            share {latestShareDate.toDateString().toLowerCase()}
                        </div>
                    </div>
                </div>
            </td>
            {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>*/}
            {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>*/}
            {/*<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>*/}
        </tr>)
    }

    function renderPageContent() {
        switch (selectedPage) {
            case 'news':
                return (<>
                        <Popover as="header" className="relative">
                            <div className="bg-gray-900 py-4 hidden md:block">
                                <nav
                                    className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
                                    aria-label="Global"
                                >
                                    <div className="flex items-center flex-1">
                                        <div className="space-x-2 lg:space-x-4 flex md:ml-10">
                                            <h1 className="text-2xl font-semibold text-gray-100">Web3 News</h1>
                                            <h3 className="text-md pt-1.5 hidden lg:block font-semibold text-gray-200">
                                                Stay in the Loopie with us
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex md:items-center md:space-x-6">
                                        <p
                                            href="#"
                                            className="inline-flex items-center px-2 py-1 border border-transparent text-light font-small rounded-md text-white bg-gray-700"
                                        >
                                            Last update: {updatedAt.split('GMT')[0]}
                                        </p>
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
                return <InfoComponent/>
            default:
                return <p>coming soon</p>
        }
    }

    function renderNewsPageContent() {
        return (<div className="px-4 sm:px-6 lg:px-8">
                <div className="mt-8 flex flex-col">
                    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle">
                            <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5">
                                <table className="min-w-full">
                                    {/*<thead className="bg-gray-50">*/}
                                    {/*<tr>*/}
                                    {/*  <th*/}
                                    {/*      scope="col"*/}
                                    {/*      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 lg:pl-8"*/}
                                    {/*  >*/}
                                    {/*    Name*/}
                                    {/*  </th>*/}
                                    {/*  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">*/}
                                    {/*    Title*/}
                                    {/*  </th>*/}
                                    {/*  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">*/}
                                    {/*    Email*/}
                                    {/*  </th>*/}
                                    {/*  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">*/}
                                    {/*    Role*/}
                                    {/*  </th>*/}
                                    {/*  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">*/}
                                    {/*    <span className="sr-only">Edit</span>*/}
                                    {/*  </th>*/}
                                    {/*</tr>*/}
                                    {/*</thead>*/}
                                    <tbody className="bg-white">
                                    {urls.map((url, index) => renderUrlRow(url, index))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    function renderAccountSection() {
        return (<div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <a href="#" className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                    <div>
                        <img
                            className="inline-block h-9 w-9 rounded-full"
                            src="./profile_mock.png"
                            alt=""
                        />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            Your profile
                        </p>
                        <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                            coming soon
                        </p>
                    </div>
                </div>
            </a>
        </div>)
    }

    return (
        <>
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
                                        {/*<img*/}
                                        {/*    className="h-8 w-auto"*/}
                                        {/*    src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg"*/}
                                        {/*    alt="Workflow"*/}
                                        {/*/>*/}
                                        <ArrowsExpandIcon className="h-6 w-auto mr-2"/>
                                        <p className="font-medium text-2xl">Loopie</p>
                                    </div>
                                    <nav className="mt-5 px-2 space-y-1">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={!item.onClick && item.href}
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
                                            </a>
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
                        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                            <div className="flex items-center flex-shrink-0 px-4">
                                {/*<img*/}
                                {/*    className="h-8 w-auto"*/}
                                {/*    src="https://tailwindui.com/img/logos/workflow-logo-indigo-600-mark-gray-800-text.svg"*/}
                                {/*    alt="Workflow"*/}
                                {/*/>*/}
                                <ArrowsExpandIcon className="h-6 w-auto mr-2"/>
                                <p className="font-medium text-2xl">Loopie</p>
                            </div>
                            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
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
                    <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
                        <button
                            type="button"
                            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <MenuIcon className="h-6 w-6" aria-hidden="true"/>
                        </button>
                    </div>
                    <main className="">
                        <div className="">
                            {renderPageContent()}
                        </div>
                    </main>
                </div>
            </div>
        </>
    )
}


const fs = require('fs')

export async function getStaticProps(context) {
    const file = fs.createReadStream('public/weekly_leaderboard.csv')
    return new Promise((resolve, reject) =>
        Papa.parse(file, {
            header: true,
            // download: true,
            complete: resolve,
            error: reject,
        }),
    ).then(result => {
        const latestShareDates = map(result.data, (row) => {
            let createdAts = replace(row.created_ats, /(\[')|('])|(')/g, '').split(",")
            createdAts = map(createdAts, (createdAt) => new Date(createdAt))
            const latestShareDate = createdAts.length === 1 ? createdAts[0] : createdAts[0]
            return latestShareDate
        })
        const updatedAt = max(latestShareDates)
        return {props: {urls: result.data, updatedAt: updatedAt.toString()}}
    })
}
