import React from 'react'
import Head from 'next/head'

export const metadata = {
  title: 'Loopie',
  description: 'calm web3 news for the early enthusiast'
}

export default function RootLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const imageUrl = 'https://loopie.site/api/og'
  const description = 'calm web3 news for the early enthusiast'

  return (
    <html className="h-full bg-white">
    <Head>
      <title>Loopie</title>
      <link rel="shortcut icon" href="/favicon.png"/>
      <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
      <meta property="og:site_name" content="Loopie"/>
      <meta property="og:type" content="website"/>
      <meta property="og:url" content="https://www.loopie.site"/>
      <meta property="og:title" key="ogtitle" content="Loopie"/>
      <meta property="og:description" key="ogdesc" content={description}/>
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
    {children}
    </body>
    </html>
  )
}
