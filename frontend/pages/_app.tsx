import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import '@rainbow-me/rainbowkit/styles.css'
import { SessionProvider } from 'next-auth/react'
import { WagmiConfig } from 'wagmi'
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chains, getSiweMessageOptions, wagmiConfig } from '../src/wagmi_config'
import { useRouter } from 'next/router'

const App = ({
  Component,
  pageProps
}: AppProps) => {
  const router = useRouter()

  const renderApp = () => {
    const tag = router.asPath.startsWith('/news/') ? router.asPath.replace('/news/', '') : ''
    const imageUrl = `https://loopie.site/api/og?tag=${tag}`
    const description = `${tag ? `${tag} ` : ''}news for the early enthusiast`

    return <html className="h-full bg-white">
    <Head>
      <title>Loopie</title>
      <link rel="shortcut icon" href="/favicon.png"/>
      <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      <meta property="og:site_name" content="Loopie"/>
      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://www.loopie.site"/>
      <meta property="og:title" key="ogtitle" content="Loopie"/>
      <meta property="og:description" key="ogdesc" content={description}/>
      <meta property="description" content={description}/>
      <meta
        property="og:image"
        content={imageUrl}
      />

      <meta name="twitter:card" content="summary_large_image"/>
      <meta property="twitter:domain" content="https://www.loopie.site"/>
      <meta property="twitter:url" content="https://www.loopie.site"/>
      <meta name="twitter:title" content="Loopie"/>
      <meta name="twitter:description" content={description}/>
      <meta name="twitter:image" content={imageUrl}/>
    </Head>
    <body className="h-full">
    <Component {...pageProps} />
    </body>
    </html>
  }

  // @ts-ignore
  const { session } = pageProps
  return <WagmiConfig config={wagmiConfig}>
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
