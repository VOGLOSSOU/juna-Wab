'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProviderSubscriptions, toggleSubscriptionActive, toggleSubscriptionPublic, deleteSubscription } from '@/lib/api/subscriptions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { formatPrice, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Subscription } from '@/types'

// ─── Kebab menu ──────────────────────────────────────────────
function KebabMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-grey transition-colors text-text-secondary"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-border shadow-xl z-50 py-1 overflow-hidden"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  )
}

function KebabItem({
  label,
  onClick,
  danger,
  loading,
  icon,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  loading?: boolean
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left disabled:opacity-50 ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-text-primary hover:bg-surface-grey'
      }`}
    >
      {loading ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56"/>
        </svg>
      ) : icon}
      {label}
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default function DashboardSubscriptionsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getProviderSubscriptions().then(setSubscriptions).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  const handleToggleActive = async (id: string) => {
    setActionLoading(id + '-active')
    try {
      const result = await toggleSubscriptionActive(id)
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, isActive: result.isActive } : s))
      toast.success(result.isActive ? 'Abonnement activé' : 'Abonnement désactivé')
    } catch {
      toast.error('Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  const handleTogglePublic = async (id: string) => {
    setActionLoading(id + '-public')
    try {
      const result = await toggleSubscriptionPublic(id)
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, isPublic: result.isPublic } : s))
      toast.success(result.isPublic ? 'Abonnement publié' : 'Abonnement dépublié')
    } catch {
      toast.error('Erreur')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet abonnement ? Cette action est irréversible.')) return
    try {
      await deleteSubscription(id)
      setSubscriptions(prev => prev.filter(s => s.id !== id))
      toast.success('Abonnement supprimé')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(typeof msg === 'string' ? msg : 'Impossible de supprimer cet abonnement')
    }
  }

  if (loading) return <div className="p-10 text-center text-text-secondary">Chargement...</div>

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline-large font-semibold">Mes abonnements</h1>
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="h-10 px-4 rounded-xl border border-border text-text-primary text-sm font-medium hover:bg-surface-grey transition-colors flex items-center gap-2"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Dashboard
          </a>
          <Link href="/dashboard/subscriptions/new">
            <Button variant="primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nouvel abonnement
            </Button>
          </Link>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4 text-text-secondary">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          <p>Aucun abonnement créé. Commencez par ajouter vos plats, puis créez votre premier abonnement.</p>
          <Link href="/dashboard/subscriptions/new">
            <Button variant="primary">Créer un abonnement</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className={`bg-white rounded-xl border flex flex-col sm:flex-row ${sub.isActive ? 'border-border' : 'border-border opacity-70'}`}>
              <div className="relative w-full sm:w-40 h-32 sm:h-auto bg-surface-grey flex-shrink-0 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none overflow-hidden">
                {sub.imageUrl || sub.images?.[0] ? (
                  <Image src={sub.imageUrl ?? sub.images![0]} alt={sub.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-light">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{sub.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="default" className="text-xs">{SUBSCRIPTION_TYPE_LABELS[sub.type]}</Badge>
                      <Badge variant="grey" className="text-xs">{SUBSCRIPTION_DURATION_LABELS[sub.duration]}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-primary">{formatPrice(sub.price, sub.currency)}</span>
                      {sub.rating !== undefined && (
                        <div className="flex items-center gap-1">
                          <StarRating value={sub.rating} size={12} readOnly />
                          <span className="text-xs text-text-secondary">({sub.totalReviews ?? sub.reviewCount ?? 0})</span>
                        </div>
                      )}
                    </div>
                    <KebabMenu>
                      <KebabItem
                        label="Modifier"
                        onClick={() => window.location.href = `/dashboard/subscriptions/${sub.id}/edit`}
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
                      />
                      <KebabItem
                        label={sub.isPublic ? 'Dépublier' : 'Publier'}
                        onClick={() => handleTogglePublic(sub.id)}
                        loading={actionLoading === sub.id + '-public'}
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      />
                      <KebabItem
                        label={sub.isActive ? 'Désactiver' : 'Activer'}
                        onClick={() => handleToggleActive(sub.id)}
                        loading={actionLoading === sub.id + '-active'}
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>}
                      />
                      <div className="h-px bg-border mx-2 my-1" />
                      <KebabItem
                        label="Supprimer"
                        onClick={() => handleDelete(sub.id)}
                        danger
                        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
                      />
                    </KebabMenu>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sub.isActive ? 'bg-green-50 text-green-700' : 'bg-surface-grey text-text-secondary'}`}>
                    {sub.isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sub.isPublic ? 'bg-blue-50 text-blue-700' : 'bg-surface-grey text-text-secondary'}`}>
                    {sub.isPublic ? 'Publié' : 'Brouillon'}
                  </span>
                  {sub.subscriberCount !== undefined && (
                    <span className="text-xs text-text-secondary">{sub.subscriberCount} abonné{sub.subscriberCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
