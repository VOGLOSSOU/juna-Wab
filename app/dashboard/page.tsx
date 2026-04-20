'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProviderProfile } from '@/lib/api/auth'
import { getProviderOrders } from '@/lib/api/orders'
import { getProviderSubscriptions } from '@/lib/api/subscriptions'
import { getMyMeals } from '@/lib/api/meals'
import { StatusBadge } from '@/components/ui/status-badge'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Provider, Order, Subscription, Meal } from '@/types'

export default function DashboardPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [provider, setProvider] = useState<Provider | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    Promise.all([
      getProviderProfile(),
      getProviderOrders(),
      getProviderSubscriptions(),
      getMyMeals(),
    ]).then(([prov, ords, subs, mls]) => {
      setProvider(prov)
      setOrders(ords)
      setSubscriptions(subs)
      setMeals(mls)
    }).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  if (!hydrated || !isAuthenticated || loading) {
    return (
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="h-8 w-48 bg-surface-grey rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white rounded-xl border border-border animate-pulse" />)}
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'PENDING')
  const activeSubscriptions = subscriptions.filter(s => s.isActive)
  const recentOrders = orders.slice(0, 5)

  const stats = [
    { label: 'Commandes en attente', value: pendingOrders.length, href: '/dashboard/orders', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, color: 'text-accent' },
    { label: 'Abonnements actifs', value: activeSubscriptions.length, href: '/dashboard/subscriptions', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>, color: 'text-primary' },
    { label: 'Plats enregistrés', value: meals.length, href: '/dashboard/meals', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>, color: 'text-primary' },
    { label: 'Total commandes', value: orders.length, href: '/dashboard/orders', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>, color: 'text-text-secondary' },
  ]

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-large font-semibold">Tableau de bord</h1>
          {provider && (
            <p className="text-text-secondary text-sm mt-1">
              {provider.businessName}
              {provider.status === 'PENDING' && <span className="ml-2 text-accent text-xs font-medium">(En attente de validation)</span>}
            </p>
          )}
        </div>
        <Link href="/dashboard/subscriptions/new" className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nouvel abonnement
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow flex flex-col gap-3">
            <div className={`${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-text-secondary mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Commandes récentes</h2>
          <Link href="/dashboard/orders" className="text-primary text-sm font-medium hover:underline">Voir tout</Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-text-secondary text-sm">Aucune commande reçue pour l&apos;instant.</div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-surface-grey transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{order.user?.name ?? '—'} • {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-primary">{formatPrice(order.amount ?? order.totalAmount ?? 0, order.currency)}</span>
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Navigation rapide */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/subscriptions', label: 'Gérer mes abonnements', desc: `${subscriptions.length} abonnement${subscriptions.length !== 1 ? 's' : ''}`, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
          { href: '/dashboard/meals', label: 'Gérer mes plats', desc: `${meals.length} plat${meals.length !== 1 ? 's' : ''}`, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg> },
          { href: '/dashboard/profile', label: 'Mon profil prestataire', desc: 'Modifier mes informations', icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow flex items-center gap-4">
            <div className="text-primary">{item.icon}</div>
            <div>
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-text-secondary">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
