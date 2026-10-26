import { create } from 'zustand'
import { useAuthStore } from './auth'
import { advanceFavoriteRevision } from '@/lib/api/favorite-context'
import { setFavorite } from '@/lib/api/favorites'

interface FavoritesState {
  accountId: string | null
  generation: number
  flags: Record<string, boolean>
  flagRevisions: Record<string, number>
  pending: Record<string, boolean>
  revision: number
  reset: (accountId: string | null) => void
  toggle: (id: string, current: boolean) => Promise<void>
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  accountId: null, generation: 0, flags: {}, flagRevisions: {}, pending: {}, revision: 0,
  reset: (accountId) => set(state => ({ accountId, generation: state.generation + 1,
    flags: {}, flagRevisions: {}, pending: {}, revision: advanceFavoriteRevision() })),
  toggle: async (id, current) => {
    const auth = useAuthStore.getState()
    const accountId = auth.isAuthenticated ? auth.user?.id ?? null : null
    if (!accountId) throw new Error('Connexion requise')
    if (get().accountId !== accountId) get().reset(accountId)
    if (get().pending[id]) return
    const generation = get().generation
    const value = current
    set(state => ({ pending: { ...state.pending, [id]: true } }))
    try {
      const isFavorite = await setFavorite(id, !value)
      if (get().generation !== generation) return
      const revision = advanceFavoriteRevision()
      set(state => ({ flags: { ...state.flags, [id]: isFavorite },
        flagRevisions: { ...state.flagRevisions, [id]: revision }, revision }))
    } finally {
      if (get().generation === generation) {
        set(state => { const pending = { ...state.pending }; delete pending[id]; return { pending } })
      }
    }
  },
}))

const currentAccount = () => {
  const auth = useAuthStore.getState()
  return auth.isAuthenticated ? auth.user?.id ?? null : null
}
useFavoritesStore.getState().reset(currentAccount())
useAuthStore.subscribe(() => {
  const accountId = currentAccount()
  if (accountId !== useFavoritesStore.getState().accountId) useFavoritesStore.getState().reset(accountId)
})
