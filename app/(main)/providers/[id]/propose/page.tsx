'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { createProposal } from '@/lib/api/proposals'
import { Button } from '@/components/ui/button'
import { showApiError } from '@/lib/utils/api-error'
import {
  mealDisplayPrice, SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS, SUBSCRIPTION_CATEGORY_LABELS,
} from '@/lib/utils'
import toast from 'react-hot-toast'
import type { PublicProviderProfile, SubscriptionType, SubscriptionDuration, SubscriptionCategory } from '@/types'

const API_URL = 'https://juna-app.up.railway.app/api/v1'

async function fetchProvider(id: string): Promise<PublicProviderProfile | null> {
  try {
    const res = await fetch(`${API_URL}/providers/${id}`)
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch {
    return null
  }
}

interface SelectedMeal { mealId: string; quantity: number; mealPricingLabel?: string }

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse flex flex-col gap-6">
      <div className="h-8 w-56 bg-surface-grey rounded" />
      <div className="h-40 bg-surface-grey rounded-xl" />
      <div className="h-60 bg-surface-grey rounded-xl" />
    </div>
  )
}

export default function ProposeSubscriptionPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')

  const [provider, setProvider] = useState<PublicProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [type, setType] = useState<SubscriptionType>('LUNCH')
  const [category, setCategory] = useState<SubscriptionCategory>('AFRICAN')
  const [duration, setDuration] = useState<SubscriptionDuration>('WORK_WEEK')
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState<SelectedMeal[]>([])

  useEffect(() => {
    if (!id) return
    fetchProvider(id).then((data) => {
      if (!data) {
        router.push('/')
        return
      }
      setProvider(data)
      setLoading(false)
    })
  }, [id, router])

  if (!hydrated || loading) return <Skeleton />
  if (!provider) return null

  const meals = provider.meals ?? []

  function toggleMeal(mealId: string) {
    setSelected((prev) =>
      prev.some((m) => m.mealId === mealId)
        ? prev.filter((m) => m.mealId !== mealId)
        : [...prev, { mealId, quantity: 1 }]
    )
  }

  function setQuantity(mealId: string, quantity: number) {
    setSelected((prev) => prev.map((m) => (m.mealId === mealId ? { ...m, quantity: Math.max(1, quantity) } : m)))
  }

  function setPricingLabel(mealId: string, label: string) {
    setSelected((prev) => prev.map((m) => (m.mealId === mealId ? { ...m, mealPricingLabel: label } : m)))
  }

  async function handleSubmit() {
    if (selected.length === 0) {
      toast.error('Sélectionnez au moins un plat.')
      return
    }
    for (const sel of selected) {
      const meal = meals.find((m) => m.id === sel.mealId)
      if (meal?.priceType === 'MULTIPLE' && !sel.mealPricingLabel) {
        toast.error(`Choisissez une variante pour "${meal.name}".`)
        return
      }
    }
    setSubmitting(true)
    try {
      await createProposal({
        providerId: id,
        type,
        category,
        duration,
        message: message.trim() || undefined,
        meals: selected,
      })
      toast.success('Proposition envoyée au prestataire !')
      router.push('/profile/proposals')
    } catch (err) {
      showApiError(err, "Échec de l'envoi de la proposition")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/providers/${id}`} className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-surface-grey transition-colors flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Proposer un abonnement</h1>
          <p className="text-sm text-text-secondary">à {provider.businessName}</p>
        </div>
      </div>

      {/* Fréquence */}
      <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
        <h2 className="font-semibold text-sm">Vos préférences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Type de repas</label>
            <select value={type} onChange={(e) => setType(e.target.value as SubscriptionType)} className="h-10 rounded-lg border border-border bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {Object.entries(SUBSCRIPTION_TYPE_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as SubscriptionCategory)} className="h-10 rounded-lg border border-border bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {Object.entries(SUBSCRIPTION_CATEGORY_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Fréquence</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value as SubscriptionDuration)} className="h-10 rounded-lg border border-border bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              {Object.entries(SUBSCRIPTION_DURATION_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-text-secondary">Message pour le prestataire (optionnel)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: Tous les midis du lundi au vendredi svp"
          />
        </div>
      </div>

      {/* Plats */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm">Choisissez les plats</h2>
          <span className="text-xs text-text-secondary">{selected.length} sélectionné{selected.length !== 1 ? 's' : ''}</span>
        </div>
        {meals.length === 0 ? (
          <p className="text-sm text-text-secondary px-5 py-8 text-center">Ce prestataire n&apos;a pas encore de plats au catalogue.</p>
        ) : (
          <div className="divide-y divide-border max-h-[28rem] overflow-y-auto">
            {meals.map((meal) => {
              const sel = selected.find((m) => m.mealId === meal.id)
              return (
                <div key={meal.id} className={`flex flex-col gap-2 px-5 py-3 ${sel ? 'bg-primary-surface' : ''}`}>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => toggleMeal(meal.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                      <div className="relative w-12 h-12 rounded-lg bg-surface-grey flex-shrink-0 overflow-hidden">
                        {meal.imageUrl ? (
                          <Image src={meal.imageUrl} alt={meal.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-light">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{meal.name}</p>
                        <p className="text-xs text-text-secondary">{mealDisplayPrice(meal)}</p>
                      </div>
                    </button>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        sel ? 'border-primary bg-primary' : 'border-border'
                      }`}
                      onClick={() => toggleMeal(meal.id)}
                    >
                      {sel && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </div>

                  {sel && (
                    <div className="flex items-center gap-3 pl-[60px]">
                      <label className="text-xs text-text-secondary">Quantité</label>
                      <input
                        type="number"
                        min={1}
                        value={sel.quantity}
                        onChange={(e) => setQuantity(meal.id, Number(e.target.value))}
                        className="w-14 h-8 text-sm text-center rounded border border-border"
                      />
                      {meal.priceType === 'MULTIPLE' && meal.pricings && meal.pricings.length > 0 && (
                        <select
                          value={sel.mealPricingLabel ?? ''}
                          onChange={(e) => setPricingLabel(meal.id, e.target.value)}
                          className="h-8 rounded border border-border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="" disabled>Variante</option>
                          {meal.pricings.map((p) => <option key={p.label} value={p.label}>{p.label}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Button variant="primary" size="lg" loading={submitting} disabled={!isAuthenticated} onClick={handleSubmit}>
        Envoyer la proposition
      </Button>
    </div>
  )
}
