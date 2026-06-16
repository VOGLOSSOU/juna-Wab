'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProviderOrders } from '@/lib/api/orders'
import { getProviderSubscriptions } from '@/lib/api/subscriptions'
import { getMyMeals } from '@/lib/api/meals'
import { formatPrice } from '@/lib/utils'
import type { Order, Subscription, Meal, OrderStatus } from '@/types'

const COMPLETED_STATUSES: OrderStatus[] = ['COMPLETED']

function Skeleton() {
  return (
    <div className="max-w-content mx-auto px-6 py-10 animate-pulse flex flex-col gap-8">
      <div className="h-8 w-48 bg-surface-grey rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-surface-grey rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => <div key={i} className="h-64 bg-surface-grey rounded-xl" />)}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon, color }: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
      <div className={color}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary mt-0.5">{label}</p>
        {sub && <p className="text-xs text-text-light mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardStatsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [orders, setOrders] = useState<Order[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    Promise.all([
      getProviderOrders(),
      getProviderSubscriptions(),
      getMyMeals(),
    ]).then(([ords, subs, mls]) => {
      setOrders(ords)
      setSubscriptions(subs)
      setMeals(mls)
    }).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  if (!hydrated || loading) return <Skeleton />

  const completedOrders = orders.filter(o => COMPLETED_STATUSES.includes(o.status))
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED')
  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const revenue = completedOrders.reduce((sum, o) => sum + (o.amount ?? o.totalAmount ?? 0), 0)
  const activeSubscriptions = subscriptions.filter(s => s.isActive)
  const completionRate = orders.length > 0
    ? Math.round((completedOrders.length / orders.length) * 100)
    : 0

  // Regrouper les commandes par statut
  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  const STATUS_LABELS: Record<string, string> = {
    PENDING: 'En attente', CONFIRMED: 'Confirmées', PREPARING: 'En préparation',
    READY: 'Prêtes', DELIVERING: 'En livraison', DELIVERED: 'Livrées',
    COMPLETED: 'Terminées', CANCELLED: 'Annulées',
  }

  const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-amber-400', CONFIRMED: 'bg-blue-500', PREPARING: 'bg-orange-400',
    READY: 'bg-green-500', DELIVERING: 'bg-cyan-500', DELIVERED: 'bg-primary',
    COMPLETED: 'bg-primary', CANCELLED: 'bg-red-400',
  }

  // Abonnements par catégorie
  const byCategory = subscriptions.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1
    return acc
  }, {})

  const maxCat = Math.max(...Object.values(byCategory), 1)

  const CATEGORY_LABELS: Record<string, string> = {
    AFRICAN: 'Africain', VEGETARIAN: 'Végétarien', HALAL: 'Halal', ASIAN: 'Asiatique',
    VEGAN: 'Vegan', EUROPEAN: 'Européen', FAST_FOOD: 'Fast-food', HEALTHY: 'Healthy',
    AMERICAN: 'Américain', FUSION: 'Fusion', OTHER: 'Autre',
  }

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-8">
      <h1 className="text-headline-large font-semibold">Statistiques</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Chiffre d&apos;affaires"
          value={formatPrice(revenue)}
          sub="Commandes terminées"
          color="text-primary"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
        <StatCard
          label="Commandes reçues"
          value={orders.length}
          sub={`${pendingOrders.length} en attente`}
          color="text-accent"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
        />
        <StatCard
          label="Taux de complétion"
          value={`${completionRate}%`}
          sub={`${completedOrders.length} terminées · ${cancelledOrders.length} annulées`}
          color="text-green-600"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
        />
        <StatCard
          label="Abonnements actifs"
          value={activeSubscriptions.length}
          sub={`${subscriptions.length} au total · ${meals.length} plats`}
          color="text-primary"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des commandes */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Répartition des commandes</h2>
          </div>
          {orders.length === 0 ? (
            <div className="px-5 py-10 text-center text-text-secondary text-sm">Aucune commande pour le moment.</div>
          ) : (
            <div className="px-5 py-4 flex flex-col gap-3">
              {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
                const pct = Math.round((count / orders.length) * 100)
                return (
                  <div key={status} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{STATUS_LABELS[status] ?? status}</span>
                      <span className="font-medium text-text-primary">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-grey overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${STATUS_COLORS[status] ?? 'bg-text-light'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Abonnements par catégorie */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Abonnements par catégorie</h2>
          </div>
          {subscriptions.length === 0 ? (
            <div className="px-5 py-10 text-center text-text-secondary text-sm">Aucun abonnement créé.</div>
          ) : (
            <div className="px-5 py-4 flex flex-col gap-3">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                const pct = Math.round((count / maxCat) * 100)
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-secondary">{CATEGORY_LABELS[cat] ?? cat}</span>
                      <span className="font-medium text-text-primary">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-grey overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Abonnements les plus commandés */}
      {subscriptions.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-sm">Abonnements — vue d&apos;ensemble</h2>
          </div>
          <div className="divide-y divide-border">
            {subscriptions.map(sub => (
              <div key={sub.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary line-clamp-1">{sub.name}</p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {sub.subscriberCount ?? 0} abonné{(sub.subscriberCount ?? 0) !== 1 ? 's' : ''} · {sub.reviewCount ?? 0} avis
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`w-2 h-2 rounded-full ${sub.isActive ? 'bg-green-500' : 'bg-surface-grey border border-border'}`} />
                  <span className="font-semibold text-sm text-primary">{formatPrice(sub.price, sub.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
