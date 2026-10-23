'use client'

import Image from 'next/image'
import { useState } from 'react'
import { formatDate, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth'
import type { ActiveSubscription } from '@/types'

interface Props {
  sub: ActiveSubscription
  daysLeft: number
}

export function SubscriberCard({ sub, daysLeft }: Props) {
  const { user } = useAuthStore()
  const [flipped, setFlipped] = useState(false)
  const instructions = sub.subscription.instructions?.trim()
  const toggleCard = () => setFlipped((current) => !current)

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
      role="button"
      tabIndex={0}
      aria-label={`${flipped ? 'Revenir au recto de la carte' : 'Retourner la carte pour lire les instructions'} : ${sub.subscription.name}`}
      aria-pressed={flipped}
      onClick={toggleCard}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggleCard()
        }
      }}
      className="relative w-full rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 [perspective:1000px]"
    >
      <div
        className="grid w-full rounded-2xl transition-transform duration-500 motion-reduce:transition-none [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
      <div
        aria-hidden={flipped}
        className={`relative w-full overflow-hidden rounded-2xl select-none [grid-area:1/1] [backface-visibility:hidden] ${flipped ? 'pointer-events-none' : ''}`}
        style={{
        background: 'linear-gradient(135deg, rgba(26,92,42,0.07) 0%, rgba(26,92,42,0.13) 100%)',
        boxShadow: '0 4px 32px rgba(26,92,42,0.10)',
      }}
    >
      <div className="flex flex-col p-5 gap-3">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <Image src="/juna-logo.png" alt="Juna Eats" width={32} height={32} className="object-contain" priority />
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${expiring ? 'bg-orange-400' : 'bg-green-500'}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${expiring ? 'text-orange-500' : 'text-primary'}`}>
              {expiring ? 'Expire bientôt' : 'Actif'}
            </span>
          </div>
        </div>

        <div className="h-px bg-primary/10" />

        {/* ── Corps : 2 colonnes ── */}
        <div className="flex gap-4">

          {/* Colonne gauche */}
          <div className="flex flex-col gap-3 flex-1 min-w-0">

            {/* Abonné */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'rgba(26,92,42,0.12)', color: '#1A5C2A' }}
              >
                {getInitials(name)}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest leading-none mb-0.5">Abonné</p>
                <p className="text-sm font-bold text-text-primary truncate leading-tight">{name}</p>
                {email && <p className="text-xs text-text-secondary truncate leading-tight mt-0.5">{email}</p>}
              </div>
            </div>

            {/* Abonnement */}
            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest leading-none mb-1">Abonnement</p>
              <p className="text-sm font-bold text-text-primary truncate leading-tight">{sub.subscription.name}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                <span className="text-[10px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 leading-none">
                  {SUBSCRIPTION_DURATION_LABELS[sub.duration]}
                </span>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5 leading-none">
                  {SUBSCRIPTION_TYPE_LABELS[sub.subscription.type]}
                </span>
              </div>
            </div>

            {/* Fournisseur */}
            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest leading-none mb-1">Fournisseur</p>
              <p className="text-xs font-bold text-text-primary break-words leading-tight">{sub.subscription.provider.businessName}</p>
            </div>

          </div>

          {/* Séparateur vertical */}
          <div className="w-px bg-primary/10 self-stretch flex-shrink-0" />

          {/* Colonne droite */}
          <div className="flex flex-col gap-3 w-[38%] flex-shrink-0">

            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest leading-none mb-1">Début</p>
              <p className="text-xs font-bold text-text-primary leading-tight">{formatDate(sub.startedAt)}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest leading-none mb-1">Fin</p>
              <p className="text-xs font-bold text-text-primary leading-tight">{formatDate(sub.endsAt)}</p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-text-light uppercase tracking-widest leading-none mb-1">Réf.</p>
              <p className="text-xs font-bold font-mono tracking-widest text-text-secondary leading-tight">{ref}</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold text-primary">✓ Juna Eats</p>
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
      <div
        aria-hidden={!flipped}
        className={`flex flex-col gap-4 rounded-2xl border border-primary/15 bg-primary-surface p-5 [grid-area:1/1] [backface-visibility:hidden] [transform:rotateY(180deg)] ${!flipped ? 'pointer-events-none' : ''}`}
      >
        <div className="flex items-center justify-between gap-3">
          <Image src="/juna-logo.png" alt="Juna Eats" width={32} height={32} className="object-contain" />
          <span className="text-xs font-semibold text-primary">Instructions de l’abonnement</span>
        </div>
        <div className="border-b border-primary/10 pb-3">
          <p className="font-bold text-sm text-text-primary break-words">{sub.subscription.name}</p>
          <p className="text-xs text-text-secondary mt-1">{name}</p>
          <p className="text-xs text-text-secondary mt-1 break-words">{sub.subscription.provider.businessName}</p>
          <p className="text-xs font-mono text-text-secondary mt-1">Réf. {ref}</p>
        </div>
        <div
          role="region"
          aria-label="Instructions de votre abonnement"
          tabIndex={flipped ? 0 : -1}
          onClick={(event) => event.stopPropagation()}
          className="max-h-56 overflow-y-auto overscroll-contain select-text cursor-text text-sm text-text-primary leading-relaxed whitespace-pre-wrap break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
        >
          {instructions || 'Aucune instruction particulière pour cet abonnement.'}
        </div>
        <p className="mt-auto pt-2 text-xs text-primary text-center">Cliquez sur la carte pour revenir au recto</p>
      </div>
      </div>
    </div>
  )
}
