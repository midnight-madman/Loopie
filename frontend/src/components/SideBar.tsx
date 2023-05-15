import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { SpeakerWaveIcon, HomeIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ConnectButton } from './ConnectButton'
import { useRouter } from 'next/router'
import clsx from 'clsx'

const SideBar = ({
  sidebarOpen,
  setSidebarOpen,
  showWalletConnect = false
}: { sidebarOpen: boolean, setSidebarOpen: (arg0: boolean) => void, showWalletConnect?: boolean }) => {
  const router = useRouter()
  const navigation = [
    {
      name: 'News',
      path: '/',
      icon: HomeIcon,
      className: 'hover:cursor-pointer'
    },
    {
      name: 'Videos',
      path: '/video',
      icon: VideoCameraIcon,
      className: 'hover:cursor-pointer'
    },
    {
      name: 'Podcasts',
      path: '/podcast',
      icon: SpeakerWaveIcon,
      className: 'hover:cursor-pointer'
    }
    // {
    //   name: 'Contribute',
    //   path: 'contribute',
    //   icon: HandRaisedIcon,
    //   className: 'hover:cursor-pointer'
    // }
  ]

  const renderAccountSection = () => {
    return showWalletConnect && (
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <ConnectButton/>
          </div>
        </div>
      </div>)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  const renderNavigationItem = (item: any) => {
    const onClick = () => {
      if (router.asPath !== item.path) {
        router.push(item.path)
      }
      closeSidebar()
    }

    return <button
      key={item.name}
      onClick={() => onClick()}
      className={clsx(
        router.asPath === item.path
          ? 'text-gray-900'
          : 'text-gray-600 hover:text-gray-900',
        item.className,
        'group flex items-center px-2 py-2 text-base font-medium rounded-md'
      )}
    >
      <item.icon
        className={clsx(
          router.asPath === item.path ? 'text-gray-500' : 'text-gray-400 group-hover:text-gray-500',
          'mr-4 flex-shrink-0 h-6 w-6'
        )}
        aria-hidden="true"
      />
      {item.name}
    </button>
  }

  return <>
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 flex z-40 xl:hidden" onClose={setSidebarOpen}>
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full"
               style={{ backgroundColor: ' #FFFDF6' }}>
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
                  onClick={() => closeSidebar()}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true"/>
                </button>
              </div>
            </Transition.Child>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <img src="/favicon.png" alt="Logo" className="h-10"/>
                <p className="font-serif font-semibold text-gray-800 text-3xl">Loopie</p>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map(renderNavigationItem)}
              </nav>
            </div>
            {renderAccountSection()}
          </div>
        </Transition.Child>
        <div className="flex-shrink-0 w-14">{/* Force sidebar to shrink to fit close icon */}</div>
      </Dialog>
    </Transition.Root>

     {/* Static sidebar for desktop */}
     <div className="hidden xl:flex xl:w-64 xl:flex-col xl:fixed xl:inset-y-0">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200"
           style={{ backgroundColor: ' #FFFDF6' }}>
        <div className="flex-1 flex flex-col pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map(renderNavigationItem)}
          </nav>
        </div>
         {renderAccountSection()}
      </div>
     </div>
  </>
}

export default SideBar
