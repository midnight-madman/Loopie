import { NextApiRequest, NextApiResponse } from 'next'
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getCsrfToken } from 'next-auth/react'
import { SiweMessage } from 'siwe'

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default async function auth (req: NextApiRequest, res: NextApiResponse<any>) {
  const providers = [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
          placeholder: '0x0'
        },
        signature: {
          label: 'Signature',
          type: 'text',
          placeholder: '0x0'
        }
      },
      async authorize (credentials) {
        try {
          console.log('authorize called with credentials message', credentials?.message)

          const siwe = new SiweMessage(JSON.parse(credentials?.message || '{}'))

          const nextAuthUrl = process.env.NEXTAUTH_URL || null

          console.log('authorize called for nextAuthUrl', nextAuthUrl)
          if (!nextAuthUrl) {
            return null
          }

          const nextAuthHost = new URL(nextAuthUrl).host
          if (siwe.domain !== nextAuthHost) {
            return null
          }

          if (siwe.nonce !== (await getCsrfToken({ req }))) {
            return null
          }

          await siwe.validate(credentials?.signature || '')
          return {
            id: siwe.address
          }
        } catch (e) {
          return null
        }
      }
    })
  ]

  // @ts-ignore
  const isDefaultSigninPage = req.method === 'GET' && req.query.nextauth.includes('signin')

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop()
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session ({ session, token }) {
        session.address = token.sub as string
        if (session.user) {
          session.user.name = token.sub
        }
        // session.user.image = 'https://www.fillmurray.com/128/128'
        return session
      }
    }
  })
}
