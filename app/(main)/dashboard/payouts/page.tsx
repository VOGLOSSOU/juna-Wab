'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { useAuthStore } from '@/lib/store/auth'
import { getProviderPayouts } from '@/lib/api/providers'
import { formatPrice, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ProviderPayoutItem, ProviderPayoutStatus } from '@/types'

const STATUS_BADGE: Record<ProviderPayoutStatus, { variant: 'success' | 'info' | 'warning' | 'grey'; label: string }> = {
  SUCCESS: { variant: 'success', label: 'Versé' },
  PROCESSING: { variant: 'info', label: 'En cours' },
  NEEDS_REVIEW: { variant: 'warning', label: 'À vérifier' },
  MANUAL: { variant: 'grey', label: 'Manuel' },
}

function Skeleton() {
  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-4">
      <div className="h-8 w-64 bg-surface-grey rounded animate-pulse" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 bg-white rounded-xl border border-border animate-pulse" />
      ))}
    </div>
  )
}

export default function ProviderPayoutsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  // Identifie la session courante : change à chaque login/logout, donc toute
  // réponse qui revient pour une session différente de la session courante
  // doit être ignorée (changement de compte en cours de chargement).
  const authRevision = useAuthStore((s) => s.authRevision)
  const [items, setItems] = useState<ProviderPayoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const requestRevision = useRef(authRevision)

  // Fonction unique utilisée par le chargement initial, l'actualisation
  // manuelle et le retour sur l'onglet. `setBusy` permet de distinguer le
  // skeleton (premier chargement) du petit indicateur du bouton Actualiser.
  const load = useCallback((revision: number, setBusy: (v: boolean) => void) => {
    setBusy(true)
    getProviderPayouts(1)
      .then((res) => {
        if (requestRevision.current !== revision) return // réponse tardive d'une session précédente
        setItems(res.items)
        setTotalPages(res.totalPages)
        setPage(1)
        setError(false)
      })
      .catch((err) => {
        if (requestRevision.current !== revision) return
        console.error(err)
        setError(true)
      })
      .finally(() => {
        if (requestRevision.current !== revision) return
        setBusy(false)
      })
  }, [])

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    requestRevision.current = authRevision
    // Compte potentiellement différent : on repart d'un écran vide plutôt que
    // de laisser apparaître les versements de la session précédente.
    setItems([])
    setError(false)
    load(authRevision, setLoading)
  }, [hydrated, isAuthenticated, authRevision, load])

  // Les versements évoluent en arrière-plan (réconciliation FeexPay) : on
  // réactualise quand l'onglet redevient visible, sans action de l'utilisateur.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible') load(requestRevision.current, setRefreshing)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  function refresh() {
    load(requestRevision.current, setRefreshing)
  }

  async function loadMore() {
    const revision = requestRevision.current
    setLoadingMore(true)
    try {
      const res = await getProviderPayouts(page + 1)
      if (requestRevision.current !== revision) return
      setItems((prev) => [...prev, ...res.items])
      setPage((p) => p + 1)
    } catch (err) {
      if (requestRevision.current !== revision) return
      console.error(err)
    } finally {
      if (requestRevision.current === revision) setLoadingMore(false)
    }
  }

  if (!hydrated || loading) return <Skeleton />

  const needsReviewCount = items.filter((i) => i.payout.status === 'NEEDS_REVIEW').length
  const manualCount = items.filter((i) => i.payout.status === 'MANUAL').length

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-large font-semibold">Mes versements</h1>
          <p className="text-text-secondary text-sm mt-1">
            Les paiements reçus de vos clients et le suivi de votre versement automatique.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={refresh}
            disabled={refreshing}
            title="Actualiser"
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-text-secondary hover:bg-surface-grey hover:text-text-primary transition-colors disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={refreshing ? 'animate-spin' : ''}>
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            ← Tableau de bord
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-xl border border-border p-16 flex flex-col items-center gap-3 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-light">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="font-medium text-text-primary">Impossible de charger vos versements</p>
          <p className="text-sm text-text-secondary">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={() => load(requestRevision.current, setLoading)}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {(needsReviewCount > 0 || manualCount > 0) && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>
                {needsReviewCount > 0 && <>{needsReviewCount} versement{needsReviewCount > 1 ? 's' : ''} à vérifier. </>}
                {manualCount > 0 && <>{manualCount} versement{manualCount > 1 ? 's' : ''} n&apos;a{manualCount > 1 ? 'nt' : ''} pas été envoyé{manualCount > 1 ? 's' : ''} automatiquement. </>}
                En cas de doute, contactez-nous.
              </span>
            </div>
          )}

          {items.length === 0 ? (
            <div className="bg-white rounded-xl border border-border p-16 flex flex-col items-center gap-3 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-light">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <p className="font-medium text-text-primary">Aucun paiement reçu pour le moment</p>
              <p className="text-sm text-text-secondary">Ils apparaîtront ici dès qu&apos;un client activera un abonnement.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const badge = STATUS_BADGE[item.payout.status]
                return (
                  <div key={item.orderId} className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-text-primary">{item.subscriptionName}</p>
                          <Badge variant={badge.variant} className="text-xs">{badge.label}</Badge>
                        </div>
                        <p className="text-sm text-text-secondary mt-0.5">
                          {item.clientName} · #{item.orderNumber} · activé le {formatDate(item.activatedAt)}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-text-secondary">Votre part</p>
                        <p className="font-bold text-text-primary">{formatPrice(item.providerAmount)}</p>
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{item.payout.label}</span>
                      {item.payout.paidAt && (
                        <span className="text-text-secondary text-xs">Versé le {formatDate(item.payout.paidAt)}</span>
                      )}
                      <Link href={`/dashboard/orders/${item.orderId}`} className="text-primary font-medium hover:underline text-xs flex-shrink-0">
                        Voir la commande →
                      </Link>
                    </div>
                  </div>
                )
              })}

              {page < totalPages && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="self-center mt-2 text-sm font-medium text-primary hover:underline disabled:opacity-50"
                >
                  {loadingMore ? 'Chargement...' : 'Charger plus'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
