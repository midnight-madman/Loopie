import {
    CheckIcon,
    ChevronDoubleUpIcon,
    EllipsisHorizontalIcon,
    MegaphoneIcon,
    RectangleStackIcon
} from '@heroicons/react/24/solid'

const timeline = [
    {
        id: 1,
        content: 'Project was',
        target: 'kicked off',
        href: '#',
        date: 'April 21',
        datetime: '2022-04-21',
        icon: ChevronDoubleUpIcon,
        iconBackground: 'bg-green-500',
    },
    {
        id: 2,
        content: 'First tweets scraped and ranked',
        target: 'during ETHAmsterdam',
        href: '#',
        date: 'April 22',
        datetime: '2022-04-22',
        icon: RectangleStackIcon,
        iconBackground: 'bg-green-500',
    },
    {
        id: 3,
        content: 'Build and ',
        target: 'deploy frontend',
        href: '#',
        date: 'April 22',
        datetime: '2022-04-22',
        icon: CheckIcon,
        iconBackground: 'bg-green-500',
    },
    {
        id: 4,
        content: 'Beat the drum about Loopie and',
        target: 'get first users',
        href: '#',
        date: 'April 23',
        datetime: '2022-04-23',
        icon: MegaphoneIcon,
        iconBackground: 'bg-blue-500',
    },
    {
        id: 5,
        content: 'Add more twitter accounts to',
        target: 'always track the latest news',
        href: '#',
        date: 'April',
        datetime: '2022-04-30',
        icon: EllipsisHorizontalIcon,
        iconBackground: 'bg-purple-500',
    },
    {
        id: 6,
        content: 'Add wallet login, ',
        target: 'user accounts and rewards',
        href: '#',
        date: 'September',
        datetime: '2022-09-30',
        icon: EllipsisHorizontalIcon,
        iconBackground: 'bg-purple-500',
    },
    {
        id: 7,
        content: 'Bring collaboration to web app',
        target: 'collaboration',
        href: '#',
        date: 'Q4 22',
        datetime: '2022-11-20',
        icon: EllipsisHorizontalIcon,
        iconBackground: 'bg-purple-500',
    },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function TimelineComponent() {
    return (
        <div className="flow-root">
            <h3 className="mb-4 text-xl font-extrabold text-blue-gray-900" id="timeline-heading">
                Timeline
            </h3>
            <ul role="list" className="-mb-8">
                {timeline.map((event, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                            {eventIdx !== timeline.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                      aria-hidden="true"/>
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                  <span
                      className={classNames(
                          event.iconBackground,
                          'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                      )}
                  >
                    <event.icon className="h-5 w-5 text-white" aria-hidden="true"/>
                  </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {event.content}{' '}
                                            <a href={event.href} className="font-medium text-gray-900">
                                                {event.target}
                                            </a>
                                        </p>
                                    </div>
                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                        <time dateTime={event.datetime}>{event.date}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
