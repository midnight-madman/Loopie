import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { GetSiweMessageOptions, RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import { SessionProvider } from 'next-auth/react'

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'Loopie',
  chains
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in to Loopie'
})

function App ({ Component, pageProps }: AppProps) {
  const renderAnalyticsScripts = () => {
    return (
            <>
                <script async src={'https://scripts.simpleanalyticscdn.com/latest.js'}/>
            </>
    )
  }
  const isProd = process.env.NODE_ENV === 'production'

  const renderApp = () => {
    return <html className="h-full bg-white">
        <Head>
            {isProd && renderAnalyticsScripts()}
            <title>Loopie</title>
            <link rel="shortcut icon" href="/favicon.png"/>
        </Head>
        <body className="h-full">
        <Component {...pageProps} />
        </body>
        </html>
  }

  // @ts-ignore
  const { session } = pageProps
  return <WagmiConfig client={wagmiClient}>
        <SessionProvider refetchInterval={0} session={session}>
            <RainbowKitSiweNextAuthProvider getSiweMessageOptions={getSiweMessageOptions}>
                <RainbowKitProvider chains={chains}>
                    {renderApp()}
                </RainbowKitProvider>
            </RainbowKitSiweNextAuthProvider>
        </SessionProvider>
    </WagmiConfig>
}

export default App
