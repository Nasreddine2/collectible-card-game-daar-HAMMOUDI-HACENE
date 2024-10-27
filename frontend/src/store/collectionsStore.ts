import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

import type {} from '@redux-devtools/extension' // required for devtools typing
import { mountStoreDevtool } from 'simple-zustand-devtools'
import { WalletState, useWalletStore } from './walletStore'

export interface Collection {
  name: string
  collectionId: string
  cardCount: number
  ntfIds: number[]
}

interface CollectionsStore {
  collections: Collection[]
  activeCollection: Collection | null
  getCollection: (name: string | number) => Collection
  fetchCollections: () => Promise<void>
  setActiveCollection: (collection: Collection) => void
}

const collectionStructResponseToCollection = (
  res: [string, string, bigint, bigint[]]
) => ({
  name: res[0],
  collectionId: res[1],
  cardCount: Number(res[2]),
  ntfIds: res[3].map(n => Number(n)),
})

export const useCollectionsStore = create<CollectionsStore>()(
  devtools((set, get) => ({
    collections: [],
    activeCollection: null,
    setActiveCollection: (collection: Collection) => {
      set({ ...get(), activeCollection: collection })
    },
    getCollection: (name: string | number) => {
      if (typeof name === 'number') return get().collections[name]
      return get().collections.find(c => c.name === name)!
    },
    async fetchCollections() {
      const walletStore = useWalletStore.getState()

      if (!walletStore.mainContract) return

      const collections = await walletStore.mainContract.getCollections()
      set({
        ...get(),
        collections: collections.map(collectionStructResponseToCollection),
      })
    },
  }))
)

mountStoreDevtool('collectionStore', useCollectionsStore)
