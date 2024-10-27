import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { ethers } from 'ethers'
import * as ethereum from '@/lib/ethereum'
import * as main from '@/lib/main'

import type {} from '@redux-devtools/extension' // required for devtools typing
import { mountStoreDevtool } from 'simple-zustand-devtools'

export type MarketListing = {
  seller: string
  tokenId: number
  price: number
  isSold: boolean
}

export type CardType = {
  id: string
  name: string
  level: number
  hp: number
  supertype: string
  subtypes: Array<string>
  types: Array<string>
  evolvesTo: Array<string>
  rules: Array<string>
  attacks: Array<{
    name: string
    cost: Array<string>
    convertedEnergyCost: number
    damage: string
    text: string
  }>
  weaknesses: Array<{
    type: string
    value: string
  }>
  retreatCost: Array<string>
  convertedRetreatCost: number
  set: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    legalities: {
      unlimited: string
      expanded: string
    }
    ptcgoCode: string
    releaseDate: string
    updatedAt: string
    images: {
      symbol: string
      logo: string
    }
  }
  number: string
  artist: string
  rarity: string
  nationalPokedexNumbers: Array<number>
  legalities: {
    unlimited: string
    expanded: string
  }
  images: {
    small: string
    large: string
  }
  tcgplayer: {
    url: string
    updatedAt: string
    prices: {
      holofoil: {
        low: number
        mid: number
        high: number
        market: number
        directLow: number
      }
    }
  }
}



export interface WalletState {
  details: ethereum.Details | null
  nftContract: main.CardNFT | null
  mainContract: main.Main | null
  marketContract: main.CardMarket | null
  updateWallet: () => Promise<void>
  isAdmin: () => boolean
  adminAddress: string
  balance: number
  getMarketplaceOffers: () => Promise<MarketListing[]>
}

export const useWalletStore = create<WalletState>()(
  devtools((set, get) => ({
    details: null,
    nftContract: null,
    mainContract: null,
    adminAddress: '',
    marketContract: null,
    isAdmin() {
      return get().details?.account === get().adminAddress
    },
    balance: 0,
    updateWallet: async () => {
      try {
        console.log('Connecting to Metamask...')
        const details_ = await ethereum.connect('metamask')
        console.log('Wallet details: ', details_)

        if (!details_ || !details_.account) {
          console.error('Failed to get wallet details')
          set({ ...get(), details: null })
          return
        }

        console.log('Initializing NFT contract...')
        const nftContract_ = await main.initNft(details_)
        if (!nftContract_) {
          console.error('Failed to initialize NFT contract')
          set({ ...get(), details: null })
          return
        }

        console.log('Initializing Booster contract...')
        const boosterNftContract_ = await main.initBoosterNft(details_)
        if (!boosterNftContract_) {
          console.error('Failed to initialize Booster contract')
          set({ ...get(), details: null })
          return
        }

        console.log('Initializing Main contract...')
        const mainContract_ = await main.initMain(details_)
        if (!mainContract_) {
          console.error('Failed to initialize Main contract')
          set({ ...get(), details: null })
          return
        }

        console.log('Initializing Market contract...')
        const marketContract = await main.initMarket(details_)
        if (!marketContract) {
          console.error('Failed to initialize Market contract')
          set({ ...get(), details: null })
          return
        }

        console.log('Fetching balance...')
        const balance_ = await details_.provider.getBalance(details_.account)
        console.log('Balance: ', ethers.utils.formatEther(balance_))

        const provider = details_.provider
        provider.on('block', async () => {
          if (!details_.account) return
          const updatedBalance = await details_.provider.getBalance(
            details_.account
          )
          set({ ...get(), balance: +ethers.utils.formatEther(updatedBalance) })
        })

        console.log('Fetching admin address...')
        const adminAddress = await mainContract_.owner()
        console.log('Admin address: ', adminAddress)

        set({
          ...get(),
          details: details_,
          nftContract: nftContract_,
          mainContract: mainContract_,
          marketContract: marketContract,
          adminAddress: adminAddress,
          balance: +ethers.utils.formatEther(balance_),
        })
      } catch (error) {
        console.error('Error updating wallet: ', error)
      }
    },

    getMarketplaceOffers: async () => {
      const listings = await get().marketContract?.getListings()
      if (!listings) return []

      const markets: MarketListing[] = listings.map(listing => ({
        seller: listing[0],
        tokenId: Number(listing[1]),
        price: Number(listing[2]),
        isSold: listing[3],
      }))

      return markets
    },
  }))
)

mountStoreDevtool('walletStore', useWalletStore)
