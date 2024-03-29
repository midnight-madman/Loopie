const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
  // openAnalyzer: false,
})

/** @type {import('next').NextConfig} */
module.exports = (phase, { defaultConfig }) => {
  const config = {
    ...defaultConfig,
    async redirects () {
      return [
        {
          source: '/',
          destination: '/news/Web3',
          permanent: false
        }
      ]
    },
    reactStrictMode: true,
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
      ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
    },
    webpack: (config) => {
      config.resolve = {
        ...config.resolve,
        fallback: {
          fs: false,
          path: false,
          os: false
        }
      }
      return config
    }
  }
  return withBundleAnalyzer(config)
}
