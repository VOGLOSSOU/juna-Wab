'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getSubscription, updateSubscription } from '@/lib/api/subscriptions'
import { getMyMeals } from '@/lib/api/meals'
import { uploadImage } from '@/lib/api/upload'
import toast from 'react-hot-toast'
import type { Meal, Subscription, SubscriptionType, SubscriptionDuration, SubscriptionCategory } from '@/types'

const TYPE_LABELS: Record<SubscriptionType, string> = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Collation',
  BREAKFAST_LUNCH: 'Petit-déj + Déjeuner',
  BREAKFAST_DINNER: 'Petit-déj + Dîner',
  LUNCH_DINNER: 'Déjeuner + Dîner',
  FULL_DAY: 'Journée complète',
  CUSTOM: 'Personnalisé',
}

const DURATION_LABELS: Record<SubscriptionDuration, string> = {
  DAY: '1 jour',
  THREE_DAYS: '3 jours',
  WORK_WEEK: 'Semaine de travail (5j)',
  WEEK: '1 semaine',
  TWO_WEEKS: '2 semaines',
  WORK_WEEK_2: '2 semaines de travail',
  WORK_MONTH: 'Mois de travail',
  MONTH: '1 mois',
  WEEKEND: 'Week-end',
}

const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  AFRICAN: 'Africaine',
  EUROPEAN: 'Européenne',
  ASIAN: 'Asiatique',
  AMERICAN: 'Américaine',
  FUSION: 'Fusion',
  VEGETARIAN: 'Végétarien',
  VEGAN: 'Vegan',
  HALAL: 'Halal',
  FAST_FOOD: 'Fast-food',
  HEALTHY: 'Healthy',
  OTHER: 'Autre',
}

const inputClass =
  'w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors disabled:opacity-50'

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-[var(--color-text-primary)]">
        {label} {required && <span className="text-[var(--color-error)]">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--color-text-light)]">{hint}</p>}
    </div>
  )
}

function ChipGroup<T extends string>({ options, labels, value, onChange }: { options: T[]; labels: Record<T, string>; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button key={opt} type="button" onClick={() => onChange(opt)}
          className={`h-9 px-4 rounded-xl text-sm font-medium transition-colors ${value === opt ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-grey)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'}`}>
          {labels[opt]}
        </button>
      ))}
    </div>
  )
}

export default function EditSubscriptionPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [meals, setMeals] = useState<Meal[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState<SubscriptionType>('LUNCH')
  const [duration, setDuration] = useState<SubscriptionDuration>('WORK_WEEK')
  const [category, setCategory] = useState<SubscriptionCategory>('AFRICAN')
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !id) return
    Promise.all([getSubscription(id), getMyMeals()])
      .then(([sub, mls]) => {
        setSubscription(sub)
        setMeals(mls)
        setName(sub.name)
        setDescription(sub.description ?? '')
        setPrice(String(sub.price))
        setType(sub.type)
        setDuration(sub.duration)
        setCategory(sub.category)
        setImageUrl(sub.imageUrl ?? '')
        setImagePreview(sub.imageUrl ?? null)
        setSelectedMealIds((sub.meals ?? []).map((m) => m.id))
      })
      .catch(() => toast.error('Impossible de charger l\'abonnement'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated, id])

  if (!hydrated || !isAuthenticated) return null

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-[var(--color-surface-grey)] animate-pulse" />
        ))}
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-[var(--color-text-secondary)]">Abonnement introuvable.</p>
        <button onClick={() => router.push('/dashboard/subscriptions')} className="mt-4 text-sm text-[var(--color-primary)] hover:underline">
          Retour à mes abonnements
        </button>
      </div>
    )
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setImageUploading(true)
    try {
      const url = await uploadImage('subscriptions', file)
      setImageUrl(url)
      toast.success('Image mise à jour')
    } catch {
      toast.error("Erreur lors de l'upload")
      setImagePreview(subscription?.imageUrl ?? null)
    } finally {
      setImageUploading(false)
    }
  }

  function toggleMeal(mealId: string) {
    setSelectedMealIds((prev) => prev.includes(mealId) ? prev.filter((x) => x !== mealId) : [...prev, mealId])
  }

  function canSubmit() {
    if (!name.trim() || name.trim().length < 3) return false
    if (!description.trim() || description.trim().length < 10) return false
    const p = Number(price)
    if (!price || isNaN(p) || p < 100) return false
    if (selectedMealIds.length === 0) return false
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit()) return
    setSubmitting(true)
    try {
      await updateSubscription(id, {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        type,
        category,
        duration,
        ...(imageUrl && imageUrl !== subscription?.imageUrl ? { imageUrl } : {}),
        mealIds: selectedMealIds,
      })
      toast.success('Abonnement mis à jour !')
      router.push('/dashboard/subscriptions')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(typeof msg === 'string' ? msg : 'Erreur lors de la mise à jour')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-grey)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Modifier l'abonnement</h1>
          <p className="text-sm text-[var(--color-text-secondary)] truncate max-w-xs">{subscription.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Infos générales */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Informations générales</h2>

          <Field label="Photo de l'abonnement" hint="Laissez vide pour conserver l'actuelle">
            <div className="flex items-center gap-4">
              <div onClick={() => imageInputRef.current?.click()}
                className="w-24 h-20 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-grey)] flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)]/50 transition-colors overflow-hidden flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview} alt="cover" className="w-full h-full object-cover" />
                ) : imageUploading ? (
                  <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="2"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}
                className="h-9 px-4 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-grey)] transition-colors disabled:opacity-50">
                Changer la photo
              </button>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            </div>
          </Field>

          <div className="h-px bg-[var(--color-border)]" />

          <Field label="Nom" required>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} maxLength={100} />
          </Field>

          <Field label="Description" required hint="10–1000 caractères">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={1000}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors resize-none" />
            <p className="text-xs text-[var(--color-text-light)] text-right -mt-1">{description.length}/1000</p>
          </Field>

          <Field label="Prix (XOF)" required hint="Minimum 100 XOF">
            <div className="relative">
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={`${inputClass} pr-14`} min={100} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-light)] font-medium">XOF</span>
            </div>
          </Field>
        </div>

        {/* Caractéristiques */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Caractéristiques</h2>
          <Field label="Type de repas" required>
            <ChipGroup options={Object.keys(TYPE_LABELS) as SubscriptionType[]} labels={TYPE_LABELS} value={type} onChange={setType} />
          </Field>
          <Field label="Durée" required>
            <ChipGroup options={Object.keys(DURATION_LABELS) as SubscriptionDuration[]} labels={DURATION_LABELS} value={duration} onChange={setDuration} />
          </Field>
          <Field label="Catégorie" required>
            <ChipGroup options={Object.keys(CATEGORY_LABELS) as SubscriptionCategory[]} labels={CATEGORY_LABELS} value={category} onChange={setCategory} />
          </Field>
        </div>

        {/* Repas inclus */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Repas inclus</h2>
            {selectedMealIds.length > 0 && (
              <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-surface)] px-2.5 py-1 rounded-full">
                {selectedMealIds.length} sélectionné{selectedMealIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {meals.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">Aucun repas disponible.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {meals.map((meal) => {
                const selected = selectedMealIds.includes(meal.id)
                return (
                  <button key={meal.id} type="button" onClick={() => toggleMeal(meal.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)]' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-grey)]'}`}>
                    {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt={meal.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-grey)] flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8">
                          <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${selected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>{meal.name}</p>
                      {meal.description && <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{meal.description}</p>}
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                      {selected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={!canSubmit() || submitting}
          className="w-full h-12 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
          {submitting ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56" /></svg>
              Enregistrement...
            </>
          ) : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  )
}
