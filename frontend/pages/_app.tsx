import '../styles/globals.css'
import type {AppProps} from 'next/app'

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
    <head>
        {isProd && renderAnalyticsScripts()}
        <title>Loopie.Link</title>
    </head>
    <body className="h-full">
        <Component {...pageProps} />
    </body>
    </html>
    )
}

export default MyApp
