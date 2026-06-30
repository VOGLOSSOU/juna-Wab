/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { mealDisplayPrice, MEAL_TYPE_LABELS, formatPrice, getInitials } from '@/lib/utils'
import type { Meal, Subscription } from '@/types'

const API_URL = 'https://juna-app.up.railway.app/api/v1'

async function fetchMeal(id: string): Promise<Meal | null> {
  try {
    const res = await fetch(`${API_URL}/meals/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

async function fetchProviderMeals(providerId: string): Promise<Meal[]> {
  try {
    const res = await fetch(`${API_URL}/meals?providerId=${providerId}`)
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json?.data) ? json.data : []
  } catch {
    return []
  }
}

async function fetchSubscription(id: string): Promise<Subscription | null> {
  try {
    const res = await fetch(`${API_URL}/subscriptions/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

function MealSkeleton() {
  return (
    <div className="animate-pulse max-w-content mx-auto px-6 pt-8">
      <div className="h-80 bg-surface-grey rounded-2xl mb-6" />
      <div className="h-6 w-2/3 bg-surface-grey rounded mb-3" />
      <div className="h-4 w-1/3 bg-surface-grey rounded mb-8" />
      <div className="h-20 bg-surface-grey rounded-xl" />
    </div>
  )
}

export default function MealDetailClient() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const subscriptionId = searchParams.get('subscriptionId')

  const [meal, setMeal] = useState<Meal | null>(null)
  const [otherMeals, setOtherMeals] = useState<Meal[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchMeal(id).then((data) => {
      if (!data) {
        router.push('/')
        return
      }
      setMeal(data)
      setLoading(false)
      if (data.providerId) {
        fetchProviderMeals(data.providerId).then((meals) =>
          setOtherMeals(meals.filter((m) => m.id !== data.id))
        )
      }
    })
  }, [id, router])

  useEffect(() => {
    if (!subscriptionId) return
    fetchSubscription(subscriptionId).then(setSubscription)
  }, [subscriptionId])

  if (loading) return <MealSkeleton />
  if (!meal) return null

  const price = mealDisplayPrice(meal)
  const mealTypeLabel = meal.mealType ? MEAL_TYPE_LABELS[meal.mealType] : null

  return (
    <div className="pb-16">
      <div className="max-w-content mx-auto px-6 pt-8 flex flex-col gap-8">

        {/* ── Image ── */}
        <div className="relative w-full h-72 md:h-96 rounded-2xl overflow-hidden bg-surface-grey">
          {meal.imageUrl ? (
            <Image src={meal.imageUrl} alt={meal.name} fill sizes="100vw" className="object-cover" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-light">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            </div>
          )}
          {meal.priceType === 'MULTIPLE' && (
            <span className="absolute top-4 left-4 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">Variantes</span>
          )}
        </div>

        {/* ── Titre + prix ── */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-text-primary leading-tight">{meal.name}</h1>
              {mealTypeLabel && (
                <span className="text-xs font-medium text-text-secondary bg-surface-grey px-2.5 py-1 rounded-full w-fit">{mealTypeLabel}</span>
              )}
            </div>
            {price && (
              <span className="text-xl font-bold text-primary whitespace-nowrap">{price}</span>
            )}
          </div>

          {meal.description && (
            <p className="text-sm text-text-secondary leading-relaxed">{meal.description}</p>
          )}

          {meal.priceGuideline && (
            <p className="text-xs text-text-light italic bg-surface-grey rounded-xl px-3 py-2.5">{meal.priceGuideline}</p>
          )}

          {meal.priceType === 'MULTIPLE' && meal.pricings && meal.pricings.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Variantes disponibles</p>
              <div className="flex flex-col gap-2">
                {meal.pricings.map((p, i) => (
                  <div key={p.id ?? i} className="flex items-center justify-between bg-surface-grey rounded-xl px-4 py-3">
                    <span className="text-sm text-text-primary font-medium">{p.label}</span>
                    <span className="text-sm font-bold text-primary">{formatPrice(Number(p.price))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Abonnement lié ── */}
        {subscription && (
          <Link
            href={`/subscriptions/${subscription.id}`}
            className="flex items-center gap-3 bg-primary-surface border border-primary/15 rounded-2xl px-5 py-4 hover:border-primary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-text-secondary">Ce plat fait partie de l'abonnement</span>
              <span className="text-sm font-semibold text-text-primary line-clamp-1">{subscription.name}</span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="flex-shrink-0 text-text-light"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        )}

        {/* ── Prestataire ── */}
        {meal.provider && (
          <Link
            href={`/providers/${meal.provider.id}`}
            className="flex items-center gap-3 bg-white rounded-2xl border border-border px-5 py-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all"
          >
            <div className="relative w-12 h-12 rounded-2xl bg-primary-surface flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 overflow-hidden">
              {meal.provider.logo ? (
                <Image src={meal.provider.logo} alt={meal.provider.businessName} fill sizes="48px" className="object-cover" />
              ) : (
                getInitials(meal.provider.businessName)
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs text-text-light uppercase tracking-widest">Proposé par</span>
              <span className="flex items-center gap-1 text-sm font-semibold text-text-primary">
                <span className="truncate">{meal.provider.businessName}</span>
                {meal.provider.isVerified && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
                    <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="flex-shrink-0 text-text-light"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        )}

        {/* ── Autres plats du prestataire ── */}
        {otherMeals.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-text-primary mb-4">
              Autres plats {meal.provider ? `de ${meal.provider.businessName}` : ''}
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 hide-scrollbar">
              {otherMeals.map((m) => {
                const mPrice = mealDisplayPrice(m)
                return (
                  <Link
                    key={m.id}
                    href={`/meals/${m.id}`}
                    className="flex-shrink-0 w-40 flex flex-col bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-28 bg-surface-grey">
                      {m.imageUrl ? (
                        <Image src={m.imageUrl} alt={m.name} fill sizes="160px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-light">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                        </div>
                      )}
                      {m.priceType === 'MULTIPLE' && (
                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Variantes</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col gap-1 flex-1">
                      <p className="text-xs font-semibold text-text-primary line-clamp-2 leading-snug">{m.name}</p>
                      {mPrice && <p className="text-xs font-bold text-primary mt-auto pt-1">{mPrice}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Back */}
        <Link href="/" className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-1.5 transition-colors w-fit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          Retour à l'accueil
        </Link>

      </div>
    </div>
  )
}
