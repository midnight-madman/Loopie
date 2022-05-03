import '../styles/globals.css'
import type {AppProps} from 'next/app'
import Head from 'next/head'

function MyApp({Component, pageProps}: AppProps) {
    const renderAnalyticsScripts = () => {
        return (
            <>
                <script async src={`https://scripts.simpleanalyticscdn.com/latest.js`}/>
            </>
        );
    };
    const isProd = process.env.NODE_ENV === 'production';

    return (<html className="h-full bg-white">
    <Head>
        {isProd && renderAnalyticsScripts()}
        <title>Loopie.Link</title>
        <link rel="shortcut icon" href="/favicon.png" />
    </Head>
    <body className="h-full">
        <Component {...pageProps} />
    </body>
    </html>
    )
}

export default MyApp
