import { useAuthStore } from '@/lib/store/auth'
import type { Subscription } from '@/types'

let revision = 0
export const favoriteRevision = () => revision
export const advanceFavoriteRevision = () => ++revision

export function favoriteAccountId(): string | null {
  const auth = useAuthStore.getState()
  return auth.isAuthenticated ? auth.user?.id ?? null : null
}

// Les flags venant d'une ancienne requête ne doivent pas passer à un autre compte.
export function tagFavoriteAccount<T extends Subscription>(sub: T, accountId: string | null, requestRevision: number): T {
  return { ...sub, favoriteAccountId: accountId, favoriteRevision: requestRevision,
    providerSubscriptions: sub.providerSubscriptions?.map(item => tagFavoriteAccount(item, accountId, requestRevision)) }
}
