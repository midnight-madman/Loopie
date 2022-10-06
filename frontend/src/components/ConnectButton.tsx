import { ConnectButton as RainbowKitConnectButton } from '@rainbow-me/rainbowkit'
import { useState } from 'react'
import { classNames } from '../utils'

export const ConnectButton = ({ buttonClassName }: { buttonClassName?: string }) => {
  const [backgroundColor, setBackgroundColor] = useState('#f08080')

  const renderButton = ({
    text, onClick, children
  } : {text: string, onClick: () => void, children?: any}) =>
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setBackgroundColor('#f4978e')}
      onMouseLeave={() => setBackgroundColor('#f08080')}
      style={{ backgroundColor }}
      className={classNames(buttonClassName, 'inline-flex items-center rounded-md border border-transparent px-4 py-2 lg:px-8 lg:py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-200 focus:ring-offset-2')}
    >
      {text}
      {children}
    </button>

  return (
        <RainbowKitConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted
            }) => {
              // Note: If your app doesn't use authentication, you
              // can remove all 'authenticationStatus' checks
              const ready = mounted && authenticationStatus !== 'loading'
              const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                        authenticationStatus === 'authenticated')
              return (
                    <div
                        {...(!ready && {
                          'aria-hidden': true,
                          style: {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none'
                          }
                        })}
                    >
                        {(() => {
                          if (!connected) {
                            return renderButton({ text: 'Connect Wallet', onClick: openConnectModal })
                          }
                          if (chain.unsupported) {
                            return renderButton({ text: 'Wrong network', onClick: openChainModal })
                          }
                          return (
                                <div className="flex gap-3">
                                    {/* <button */}
                                    {/*  style={{ backgroundColor: '#f08080' }} */}
                                    {/*  className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2" */}
                                    {/*  onClick={openChainModal} */}
                                    {/* > */}
                                    {/*    {chain.hasIcon && ( */}
                                    {/*        <div */}
                                    {/*            style={{ */}
                                    {/*              background: chain.iconBackground, */}
                                    {/*              width: 12, */}
                                    {/*              height: 12, */}
                                    {/*              borderRadius: 999, */}
                                    {/*              overflow: 'hidden', */}
                                    {/*              marginRight: 4 */}
                                    {/*            }} */}
                                    {/*        > */}
                                    {/*          {chain.iconUrl && ( */}
                                    {/*              <img */}
                                    {/*                  alt={chain.name ?? 'Chain icon'} */}
                                    {/*                  src={chain.iconUrl} */}
                                    {/*                  style={{ width: 12, height: 12 }} */}
                                    {/*              /> */}
                                    {/*          )} */}
                                    {/*        </div> */}
                                    {/*    )} */}
                                    {/*    {chain.name} */}
                                    {/* </button> */}
                                    {renderButton({
                                      text: account.displayName,
                                      onClick: openAccountModal
                                    })}
                                </div>
                          )
                        })()}
                    </div>
              )
            }}
        </RainbowKitConnectButton.Custom>
  )
}
