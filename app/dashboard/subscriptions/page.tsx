'use client'

import { useEffect, useState } from 'react'
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
      <div className="flex items-center justify-between">
        <h1 className="text-headline-large font-semibold">Mes abonnements</h1>
        <Link href="/dashboard/subscriptions/new">
          <Button variant="primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nouvel abonnement
          </Button>
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-4 text-text-secondary">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          <p>Aucun abonnement créé. Commencez par ajouter vos plats, puis créez votre premier abonnement.</p>
          <Link href="/dashboard/subscriptions/new">
            <Button variant="primary">Créer un abonnement</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className={`bg-white rounded-xl border overflow-hidden flex flex-col sm:flex-row ${sub.isActive ? 'border-border' : 'border-border opacity-70'}`}>
              <div className="relative w-full sm:w-40 h-32 sm:h-auto bg-surface-grey flex-shrink-0">
                {sub.imageUrl || sub.images?.[0] ? (
                  <Image src={sub.imageUrl ?? sub.images![0]} alt={sub.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-light">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
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
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-primary">{formatPrice(sub.price, sub.currency)}</span>
                    {sub.rating !== undefined && (
                      <div className="flex items-center gap-1">
                        <StarRating value={sub.rating} size={12} readOnly />
                        <span className="text-xs text-text-secondary">({sub.totalReviews ?? sub.reviewCount ?? 0})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-auto">
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

                <div className="flex gap-2 flex-wrap">
                  <Link href={`/dashboard/subscriptions/${sub.id}/edit`}>
                    <Button size="sm" variant="outline">Modifier</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={actionLoading === sub.id + '-active'}
                    onClick={() => handleToggleActive(sub.id)}
                  >
                    {sub.isActive ? 'Désactiver' : 'Activer'}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={actionLoading === sub.id + '-public'}
                    onClick={() => handleTogglePublic(sub.id)}
                  >
                    {sub.isPublic ? 'Dépublier' : 'Publier'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(sub.id)} className="text-red-500 hover:text-red-600">
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
