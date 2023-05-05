import { Popover } from '@headlessui/react'
import { ConnectButton } from './ConnectButton'
import { Bars3Icon } from '@heroicons/react/24/outline'

const NavBar = ({
  setSidebarOpen,
  showWalletConnect = false
}: { setSidebarOpen: (arg0: boolean) => void, showWalletConnect?: boolean }) => {
  const renderNewsletterSignup = () =>
    <iframe src="https://embeds.beehiiv.com/89ec0452-f9ac-41d5-ba96-31735973d0d4?slim=true" data-test-id="beehiiv-embed"
            height="52" frameBorder="0" scrolling="no"
            style={{
              margin: 0,
              borderRadius: '0px !important',
              backgroundColor: 'transparent'
            }}></iframe>

  return (
    <>
      <Popover as="header" className="relative">
        <div className="py-2 hidden xl:block border-b border-gray-200">
          <nav
            className="relative max-w-7xl flex items-center justify-between px-4 sm:px-6"
            aria-label="Global"
          >
            <div className="flex items-center flex-1">
              <div className="space-x-2 flex flex-shrink-0 items-center md:ml-4">
                <img src="/favicon.png" alt="Logo" className="h-10 -ml-2"/>
                <h1 className="font-serif font-semibold text-gray-800 text-4xl">Loopie</h1>
              </div>
            </div>
            {showWalletConnect && (
              <div className="hidden md:flex md:items-center md:space-x-6">
                <ConnectButton/>
              </div>)}
            {!showWalletConnect && renderNewsletterSignup()}
          </nav>
        </div>
      </Popover>
      <div
        style={{ backgroundColor: ' #FFFDF6' }}
        className="sticky top-0 z-10 xl:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 border-b border-gray-100 flex">
        <button
          type="button"
          className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon className="h-6 w-6" aria-hidden="true"/>
        </button>
        <h3 className="flex text-md pl-2 font-semibold text-gray-800">
          <img src="/favicon.png" className="h-9 w-9" alt="Logo"/>
          <p className="ml-1 mt-0.5 font-serif font-semibold text-gray-800 text-3xl">
            Loopie
          </p>
        </h3>
      </div>
    </>
  )
}

export default NavBar
