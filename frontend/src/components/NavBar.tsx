import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Popover } from '@headlessui/react'

export function NavBar () {
  return (
        <Popover as="header" className="relative">
            <div className="py-2 hidden md:block border-b border-gray-200">
                <nav
                    className="relative max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6"
                    aria-label="Global"
                >
                    <div className="flex items-center flex-1">
                        <div className="space-x-2 flex flex-shrink-0 items-center md:ml-4">
                            <img src="/favicon.png" alt="Logo" className="h-12 -ml-2"/>
                            <h1 className="font-serif font-semibold text-gray-800 text-4xl">Loopie</h1>
                        </div>
                    </div>
                    <div className="hidden md:flex md:items-center md:space-x-6">
                        <ConnectButton chainStatus="none"
                                       label="Login"
                                       accountStatus="full"
                                       showBalance={false}/>
                    </div>
                </nav>
            </div>
        </Popover>
  )
}
