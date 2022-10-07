import { chain, configureChains, createClient } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { GetSiweMessageOptions } from '@rainbow-me/rainbowkit-siwe-next-auth'

export const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
)

export const { connectors } = getDefaultWallets({
  appName: 'Loopie',
  chains
})

export const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: 'Sign in to Loopie'
})
