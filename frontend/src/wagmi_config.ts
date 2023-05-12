import { configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { GetSiweMessageOptions } from '@rainbow-me/rainbowkit-siwe-next-auth'
import { mainnet } from 'wagmi/chains'

export const {
  chains,
  publicClient
} = configureChains(
  [mainnet],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID as string }),
    publicProvider()
  ]
)

export const { connectors } = getDefaultWallets({
  appName: 'Loopie',
  chains
})

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})

export const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in to Loopie'
})
