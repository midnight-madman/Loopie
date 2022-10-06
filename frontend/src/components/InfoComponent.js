import { Fragment } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { CpuChipIcon, NewspaperIcon, UsersIcon, XMarkIcon } from '@heroicons/react/24/outline'
import TimelineComponent from './TimelineComponent'

const exampleAuthorAccounts = [
  'VitalikButerin',
  'FEhrsam',
  'haydenzadams',
  'balajis',
  'StaniKulechov',
  'cburniske',
  'twobitidiot',
  'spencernoon',
  'ljxie',
  'cobie',
  'rleshner',
  'danrobinson',
  'samczsun',
  'arjunblj',
  'kaiynne',
  'lawmaster'
]
const HEADER_TITLE = 'Build Loopie with us'
const HEADER_SUBTITLE = 'We will be the #1 news source for web3 - starting with collaborative link aggregation'

const navigation = [
  { name: 'Changelog', href: '#' },
  { name: 'About', href: '#' },
  { name: 'Partners', href: '#' },
  { name: 'News', href: '#' }
]
const supportLinks = [
  {
    name: 'Governance',
    href: '#',
    description:
      'Who are the authors and twitter accounts we rely on to submit content? Let\'s create on-chain governance and vote on it!',
    icon: UsersIcon,
    linkText: 'WAGMI'
  },
  {
    name: 'Tech',
    href: '#',
    description:
      'Decentralize all tech from acquiring data, storing it and showing it in this frontend.',
    icon: CpuChipIcon,
    linkText: 'WAGMI'
  },
  {
    name: 'Customization',
    href: '#',
    description: 'Your interests are unique - so the news that we provide should be customized, too.',
    icon: NewspaperIcon,
    linkText: 'WAGMI'
  }
]
const faqs = [
  {
    id: 1,
    question: 'What\'s the best thing about Switzerland?',
    answer:
      'I don\'t know, but the flag is a big plus.'
  },
  {
    id: 2,
    question: 'Why do you never see elephants hiding in trees?',
    answer:
      'Because they\'re so good at it.'
  },
  {
    id: 3,
    question: 'How do you make holy water?',
    answer:
      'You boil the hell out of it.'
  },
  {
    id: 4,
    question: 'Why can\'t you hear a pterodactyl go to the bathroom?',
    answer:
      'Because the pee is silent.'
  },
  {
    id: 5,
    question: 'What do you call someone with no body and no nose?',
    answer: 'Nobody knows.'
  },
  {
    id: 6,
    question: 'Why did the invisible man turn down the job offer?',
    answer:
      'He couldn\'t see himself doing it.'
  }
]

export default function InfoComponent ({ openFeedbackModal }) {
  function renderNewsletterSection () {
    return <></>
    // return (<section
    //         className="max-w-md mx-auto py-24 px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:py-32 lg:px-8 lg:flex lg:items-center"
    //         aria-labelledby="newsletter-heading"
    //     >
    //         <div className="lg:w-0 lg:flex-1">
    //             <h2 className="text-3xl font-extrabold text-blue-gray-900 sm:text-4xl" id="newsletter-heading">
    //                 Sign up for our newsletter
    //             </h2>
    //             <p className="mt-3 max-w-3xl text-lg text-blue-gray-500">
    //                 Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui Lorem cupidatat commodo. Elit sunt
    //                 amet
    //                 fugiat veniam occaecat fugiat.
    //             </p>
    //         </div>
    //         <div className="mt-8 lg:mt-0 lg:ml-8">
    //             <form className="sm:flex">
    //                 <label htmlFor="email-address" className="sr-only">
    //                     Email address
    //                 </label>
    //                 <input
    //                     id="email-address"
    //                     name="email-address"
    //                     type="email"
    //                     autoComplete="email"
    //                     required
    //                     className="w-full px-5 py-3 border border-blue-gray-300 shadow-sm placeholder-blue-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:max-w-xs rounded-md"
    //                     placeholder="Enter your email"
    //                 />
    //                 <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
    //                     <button
    //                         type="submit"
    //                         className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //                     >
    //                         Notify me
    //                     </button>
    //                 </div>
    //             </form>
    //             <p className="mt-3 text-sm text-blue-gray-500">
    //                 We care about the protection of your data. Read our{' '}
    //                 <a href="#" className="font-medium underline">
    //                     Privacy Policy.
    //                 </a>
    //             </p>
    //         </div>
    //     </section>)
  }

  function renderFaq () {
    return (<section
      className="max-w-md mx-auto py-24 px-4 divide-y-2 divide-blue-gray-200 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:py-32 lg:px-8"
      aria-labelledby="faq-heading"
    >
      <h2 className="text-3xl font-extrabold text-blue-gray-900" id="faq-heading">
        Frequently asked questions
      </h2>
      <div className="mt-6 pt-10">
        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:grid-rows-2 md:gap-x-8 md:gap-y-12">
          {faqs.map((faq) => (
            <div key={faq.id}>
              <dt className="text-lg font-medium text-blue-gray-900">{faq.question}</dt>
              <dd className="mt-2 text-base text-blue-gray-500">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>)
  }

  return (
    <div className="bg-white">
      <header className="relative pb-36 bg-blue-gray-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            // src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&&sat=-100"
            src="https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=bottom&w=987&h=800&q=60&sat=-100"
            alt=""
          />
          <div className="absolute inset-0 bg-blue-gray-800 mix-blend-multiply" aria-hidden="true"/>
        </div>
        <Popover as="div" className="relative z-10">
          <nav
            className="relative max-w-7xl mx-auto flex items-center justify-between pt-6 pb-2 px-4 sm:px-6 lg:px-8"
            aria-label="Global"
          >
            {/* <div className="flex items-center flex-1"> */}
            {/*    <div className="flex items-center justify-between w-full lg:w-auto"> */}
            {/*        <a href="#"> */}
            {/*            <span className="sr-only">Workflow</span> */}
            {/*            <img */}
            {/*                className="h-8 w-auto sm:h-10" */}
            {/*                src="https://tailwindui.com/img/logos/workflow-mark.svg?color=blue&shade=500" */}
            {/*                alt="" */}
            {/*            /> */}
            {/*        </a> */}
            {/*        <div className="-mr-2 flex items-center lg:hidden"> */}
            {/*            <Popover.Button className="bg-blue-gray-900 bg-opacity-0 rounded-md p-2 inline-flex items-center justify-center text-white hover:bg-opacity-100 focus:outline-none focus:ring-2 focus-ring-inset focus:ring-white"> */}
            {/*                <span className="sr-only">Open main menu</span> */}
            {/*                <MenuIcon className="h-6 w-6" aria-hidden="true" /> */}
            {/*            </Popover.Button> */}
            {/*        </div> */}
            {/*    </div> */}
            {/*    <div className="hidden space-x-10 lg:flex lg:ml-10"> */}
            {/*        {navigation.map((item) => ( */}
            {/*            <a key={item.name} href={item.href} className="text-base font-medium text-white hover:text-blue-100"> */}
            {/*                {item.name} */}
            {/*            </a> */}
            {/*        ))} */}
            {/*    </div> */}
            {/* </div> */}
            {/* <div className="hidden lg:flex lg:items-center lg:space-x-6"> */}
            {/*    <a */}
            {/*        href="#" */}
            {/*        className="py-2 px-6 bg-blue-500 border border-transparent rounded-md shadow-md text-base font-medium text-white hover:bg-blue-600" */}
            {/*    > */}
            {/*        Login */}
            {/*    </a> */}
            {/* </div> */}
          </nav>

          <Transition
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel focus
                           className="absolute top-0 inset-x-0 p-2 transition transform origin-top lg:hidden">
              <div
                className="rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
                <div className="px-5 pt-4 flex items-center justify-between">
                  <div>
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/workflow-mark.svg?color=blue&shade=500"
                      alt=""
                    />
                  </div>
                  <div className="-mr-2">
                    <Popover.Button
                      className="bg-white rounded-md p-2 inline-flex items-center justify-center text-blue-gray-400 hover:bg-blue-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                      <span className="sr-only">Close menu</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true"/>
                    </Popover.Button>
                  </div>
                </div>
                <div className="pt-5 pb-6">
                  <div className="px-2 space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-3 py-2 rounded-md text-base font-medium text-blue-gray-900 hover:bg-blue-gray-50"
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                  <div className="mt-6 px-5">
                    <a
                      href="#"
                      className="block text-center w-full py-2 px-4 border border-transparent rounded-md shadow bg-blue-500 text-white font-medium hover:bg-blue-600"
                    >
                      Login
                    </a>
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </Popover>

        <div
          className="relative mt-24 max-w-md mx-auto px-4 pb-32 sm:max-w-3xl sm:px-6 md:mt-32 lg:max-w-7xl lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            {HEADER_TITLE}</h1>
          <p className="mt-6 max-w-3xl text-xl text-blue-gray-300">
            {HEADER_SUBTITLE}
          </p>
        </div>
      </header>

      <main>
        <div className="bg-blue-gray-50">
          {/* Cards */}
          <section
            className="-mt-32 max-w-md mx-auto relative z-10 px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8"
            aria-labelledby="contact-heading"
          >
            <h2 className="sr-only" id="contact-heading">
              Contact us
            </h2>
            <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-3 lg:gap-y-0 lg:gap-x-8">
              {supportLinks.map((link) => (
                <div key={link.name} className="flex flex-col bg-white rounded-2xl shadow-xl">
                  <div className="flex-1 relative pt-16 px-6 pb-8 md:px-8">
                    <div
                      className="absolute top-0 p-5 inline-block bg-blue-600 rounded-xl shadow-lg transform -translate-y-1/2">
                      <link.icon className="h-6 w-6 text-white" aria-hidden="true"/>
                    </div>
                    <h3 className="text-xl font-medium text-blue-gray-900">{link.name}</h3>
                    <p className="mt-4 text-base text-blue-gray-500">{link.description}</p>
                  </div>
                  <div className="p-6 bg-blue-gray-50 rounded-bl-2xl rounded-br-2xl md:px-8">
                    <button
                      onClick={() => openFeedbackModal()}
                      // href={link.href}
                      className="text-base font-medium text-blue-700 hover:text-blue-600">
                      {link.linkText}
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Feature Timeline */}
          <section
            className="max-w-md mx-auto py-24 px-4 divide-y-2 divide-blue-gray-200 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:py-32 lg:px-8"
            aria-labelledby="timeline-heading"
          >
            <h2 className="text-3xl font-extrabold text-blue-gray-900" id="timeline-heading">
              Details
            </h2>
            <div className="mt-6 pt-10 space-x-2 space-y-4 md:space-x-8 md:grid md:grid-cols-2">
              <TimelineComponent/>
              <div className="align-left">
                <h3 className="text-xl font-extrabold text-blue-gray-900">
                  Some of the accounts we're tracking
                </h3>
                <p className="text-lg font-normal text-blue-gray-700">
                  <a className="underline"
                     href="https://github.com/midnight-madman/Loopie/blob/main/scripts/const.py">
                    Here
                    is the full list</a></p>
                <ul role="list" className="divide-y divide-gray-200">
                  {exampleAuthorAccounts.map((account) => (
                    <li key={account} className="py-4 flex">
                      <img className="h-10 w-10 rounded-full"
                           src={`https://unavatar.io/twitter/${account}`}
                           alt=""/>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{account}</p>
                        {/* <p className="text-sm text-gray-500">{person.email}</p> */}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
          {renderFaq()}
        </div>

        {/* CTA Section */}
        <section className="relative bg-white" aria-labelledby="join-heading">
          <div className="hidden absolute inset-x-0 h-1/2 bg-blue-gray-50 lg:block" aria-hidden="true"/>
          <div className="max-w-7xl mx-auto bg-blue-600 lg:bg-transparent lg:px-8">
            <div className="lg:grid lg:grid-cols-12">
              <div
                className="relative z-10 lg:col-start-1 lg:row-start-1 lg:col-span-4 lg:py-16 lg:bg-transparent">
                <div className="absolute inset-x-0 h-1/2 bg-blue-gray-50 lg:hidden" aria-hidden="true"/>
                <div className="max-w-md mx-auto px-4 sm:max-w-3xl sm:px-6 lg:max-w-none lg:p-0">
                  <div className="aspect-w-10 aspect-h-6 sm:aspect-w-2 sm:aspect-h-1 lg:aspect-w-1">
                    <img
                      className="object-cover object-center rounded-3xl shadow-2xl"
                      src="https://images.unsplash.com/photo-1491497895121-1334fc14d8c9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=934&q=80"
                      alt=""
                    />
                  </div>
                </div>
              </div>

              <div
                className="relative bg-blue-600 lg:col-start-3 lg:row-start-1 lg:col-span-10 lg:rounded-3xl lg:grid lg:grid-cols-10 lg:items-center">
                <div className="hidden absolute inset-0 overflow-hidden rounded-3xl lg:block"
                     aria-hidden="true">
                  <svg
                    className="absolute bottom-full left-full transform translate-y-1/3 -translate-x-2/3 xl:bottom-auto xl:top-0 xl:translate-y-0"
                    width={404}
                    height={384}
                    fill="none"
                    viewBox="0 0 404 384"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="64e643ad-2176-4f86-b3d7-f2c5da3b6a6d"
                        x={0}
                        y={0}
                        width={20}
                        height={20}
                        patternUnits="userSpaceOnUse"
                      >
                        <rect x={0} y={0} width={4} height={4} className="text-blue-500"
                              fill="currentColor"/>
                      </pattern>
                    </defs>
                    <rect width={404} height={384}
                          fill="url(#64e643ad-2176-4f86-b3d7-f2c5da3b6a6d)"/>
                  </svg>
                  <svg
                    className="absolute top-full transform -translate-y-1/3 -translate-x-1/3 xl:-translate-y-1/2"
                    width={404}
                    height={384}
                    fill="none"
                    viewBox="0 0 404 384"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="64e643ad-2176-4f86-b3d7-f2c5da3b6a6d"
                        x={0}
                        y={0}
                        width={20}
                        height={20}
                        patternUnits="userSpaceOnUse"
                      >
                        <rect x={0} y={0} width={4} height={4} className="text-blue-500"
                              fill="currentColor"/>
                      </pattern>
                    </defs>
                    <rect width={404} height={384}
                          fill="url(#64e643ad-2176-4f86-b3d7-f2c5da3b6a6d)"/>
                  </svg>
                </div>
                <div
                  className="relative max-w-md mx-auto py-12 px-4 space-y-6 sm:max-w-3xl sm:py-16 sm:px-6 lg:max-w-none lg:p-0 lg:col-start-4 lg:col-span-6">
                  <h2 className="text-3xl font-extrabold text-white" id="join-heading">
                    Build Loopie with us
                  </h2>
                  {/* <p className="text-lg text-white"> */}
                  {/*    Varius facilisi mauris sed sit. Non sed et duis dui leo, vulputate id malesuada */}
                  {/*    non. Cras aliquet */}
                  {/*    purus dui laoreet diam sed lacus, fames. */}
                  {/* </p> */}
                  <p
                    className="block w-full py-3 px-5 text-center bg-white border border-transparent rounded-md shadow-md text-base font-medium text-blue-700 hover:bg-blue-gray-50 sm:inline-block sm:w-auto"
                    href="#"
                  >
                    Discord coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        {renderNewsletterSection()}
      </main>
    </div>
  )
}
