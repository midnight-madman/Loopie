/** @type {import('next').NextConfig} */
module.exports = (phase, { defaultConfig }) => {
  return {
    ...defaultConfig,
    experimental: {
      appDir: true
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
}
