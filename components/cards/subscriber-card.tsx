'use client'

import Image from 'next/image'
import { formatDate, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth'
import type { ActiveSubscription } from '@/types'

interface Props {
  sub: ActiveSubscription
  daysLeft: number
}

export function SubscriberCard({ sub, daysLeft }: Props) {
  const { user } = useAuthStore()

  const name  = user?.name  ?? sub.user?.name  ?? '—'
  const email = user?.email ?? sub.user?.email ?? null

  const totalDays = Math.max(
    1,
    Math.ceil((new Date(sub.endsAt).getTime() - new Date(sub.startedAt).getTime()) / 86400000)
  )
  const progress = Math.min(100, Math.round(((totalDays - daysLeft) / totalDays) * 100))
  const ref = sub.id.slice(0, 8).toUpperCase()
  const expiring = daysLeft <= 3

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl select-none"
      style={{
        aspectRatio: '3/2',
        background: 'linear-gradient(135deg, rgba(26,92,42,0.07) 0%, rgba(26,92,42,0.13) 100%)',
        boxShadow: '0 4px 32px rgba(26,92,42,0.10)',
      }}
    >
      <div className="absolute inset-0 flex flex-col p-5 gap-2.5">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <Image src="/logo_green_orange.png" alt="JUNA" width={60} height={24} className="object-contain" priority />
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${expiring ? 'bg-orange-400' : 'bg-green-500'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${expiring ? 'text-orange-500' : 'text-primary'}`}>
              {expiring ? 'Expire bientôt' : 'Actif'}
            </span>
          </div>
        </div>

        <div className="h-px bg-primary/10" />

        {/* ── Body : 2 colonnes ── */}
        <div className="flex flex-1 gap-4 min-h-0">

          {/* Colonne gauche : abonné + abonnement */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">

            {/* Abonné */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'rgba(26,92,42,0.12)', color: '#1A5C2A' }}
              >
                {getInitials(name)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest">Abonné</p>
                <p className="text-sm font-bold text-text-primary truncate">{name}</p>
                {email && <p className="text-xs text-text-secondary truncate">{email}</p>}
              </div>
            </div>

            {/* Abonnement */}
            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest mb-0.5">Abonnement</p>
              <p className="text-sm font-bold text-text-primary truncate">{sub.subscription.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="text-[10px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {SUBSCRIPTION_DURATION_LABELS[sub.duration]}
                </span>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  {SUBSCRIPTION_TYPE_LABELS[sub.subscription.type]}
                </span>
              </div>
            </div>

            {/* Fournisseur */}
            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest mb-0.5">Fournisseur</p>
              <p className="text-xs font-bold text-text-primary truncate">{sub.subscription.provider.businessName}</p>
            </div>

          </div>

          {/* Séparateur vertical */}
          <div className="w-px bg-primary/10 self-stretch" />

          {/* Colonne droite : dates + réf */}
          <div className="flex flex-col gap-2.5 w-[38%] flex-shrink-0">

            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest mb-0.5">Début</p>
              <p className="text-xs font-bold text-text-primary">{formatDate(sub.startedAt)}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest mb-0.5">Fin</p>
              <p className="text-xs font-bold text-text-primary">{formatDate(sub.endsAt)}</p>
            </div>

            <div className="mt-auto">
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest mb-0.5">Réf.</p>
              <p className="text-xs font-bold font-mono tracking-widest text-text-secondary">{ref}</p>
            </div>

            <div className="text-right mt-auto">
              <p className="text-xs font-bold text-primary">✓ JUNA</p>
            </div>

          </div>
        </div>

        <div className="h-px bg-primary/10" />

        {/* ── Barre de progression ── */}
        <div className="flex flex-col gap-1">
          <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: expiring
                  ? 'linear-gradient(90deg,#f97316,#fb923c)'
                  : 'linear-gradient(90deg,#1A5C2A,#2d7a3a)',
              }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-text-light">{progress}% écoulé</span>
            <span className={`text-[10px] font-bold ${expiring ? 'text-orange-500' : 'text-primary'}`}>
              {daysLeft === 0
                ? "Expire aujourd'hui"
                : `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}
