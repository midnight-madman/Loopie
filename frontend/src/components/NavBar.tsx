import { Popover } from '@headlessui/react'
import { ConnectButton } from './ConnectButton'
import { Bars3Icon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { NewsCategoriesEnum } from '../const'
import { map, take, values } from 'lodash'

const getEmojiForCategory = (category: NewsCategoriesEnum) => {
  switch (category) {
    case NewsCategoriesEnum.AI:
      return '🤖'
    case NewsCategoriesEnum.DAO:
      return '🏛️'
    case NewsCategoriesEnum.NFT:
      return '🖼️'
    case NewsCategoriesEnum.BITCOIN:
      return '₿'
    default:
      return '📰'
  }
}

function MobileNavItem ({
  href,
  children
}: { href: string, children: any }) {
  return (
    <li>
      <Popover.Button as={Link} href={href} className="block py-2">
        {children}
      </Popover.Button>
    </li>
  )
}

function NavItem ({
  href,
  children
}: { href: string, children: any }) {
  const isActive = useRouter().asPath === href

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'relative block px-3 py-2 transition',
          isActive
            ? 'text-slate-800 dark:text-slate-800 font-bold'
            : 'hover:text-slate-500 dark:hover:text-slate-400'
        )}
      >
        {children}
        {isActive && (
          <span
            className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-slate-500/0 via-slate-500/40 to-slate-500/0 dark:from-slate-400/0 dark:via-slate-400/40 dark:to-slate-400/0"/>
        )}
      </Link>
    </li>
  )
}

const NavBar = ({
  setSidebarOpen,
  showWalletConnect = false
}: { setSidebarOpen: (arg0: boolean) => void, showWalletConnect?: boolean }) => {
  const renderDesktopNav = () => (
    <nav>
      <ul
        className="flex rounded-full bg-white/90 px-3 text-sm font-medium text-slate-800 shadow-lg shadow-slate-800/5 ring-1 ring-slate-900/5 backdrop-blur dark:bg-slate-800/90 dark:text-slate-200 dark:ring-white/10">
        {map(take(values(NewsCategoriesEnum), 3), (tab) =>
          <NavItem href={`/news/${tab}`} key={tab}>
            {tab} {getEmojiForCategory(tab)}
          </NavItem>
        )}
      </ul>
    </nav>
  )

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
            {renderDesktopNav()}
            {showWalletConnect && (
              <div className="hidden md:flex md:items-center md:space-x-6">
                <ConnectButton/>
              </div>)}
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
        <div className="hidden sm:block mx-8 lg:mt-2">
          {renderDesktopNav()}
        </div>
      </div>
    </>
  )
}

export default NavBar
