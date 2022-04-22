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
    {isProd && renderAnalyticsScripts()}
    <title>Stay in the Loopie</title>
    <body className="h-full">
    <Component {...pageProps} />
    </body>
    </html>)
}

export default MyApp
