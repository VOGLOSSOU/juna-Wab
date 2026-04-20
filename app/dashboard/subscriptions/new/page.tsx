'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { createSubscription } from '@/lib/api/subscriptions'
import { getMyMeals } from '@/lib/api/meals'
import { uploadImage } from '@/lib/api/upload'
import toast from 'react-hot-toast'
import type { Meal, SubscriptionType, SubscriptionDuration, SubscriptionCategory } from '@/types'

// ─── Labels ────────────────────────────────────────────────
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

// ─── UI helpers ─────────────────────────────────────────────
const inputClass =
  'w-full h-11 px-4 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors disabled:opacity-50'

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
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

function ChipGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
}: {
  options: T[]
  labels: Record<T, string>
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`h-9 px-4 rounded-xl text-sm font-medium transition-colors ${
            value === opt
              ? 'bg-[var(--color-primary)] text-white'
              : 'bg-[var(--color-surface-grey)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]'
          }`}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  )
}

// ─── Page ───────────────────────────────────────────────────
export default function NewSubscriptionPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const router = useRouter()

  const [meals, setMeals] = useState<Meal[]>([])
  const [loadingMeals, setLoadingMeals] = useState(true)

  // Form fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [type, setType] = useState<SubscriptionType>('LUNCH')
  const [duration, setDuration] = useState<SubscriptionDuration>('WORK_WEEK')
  const [category, setCategory] = useState<SubscriptionCategory>('AFRICAN')
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([])
  const [commissionPercent, setCommissionPercent] = useState('10')
  const [commissionMode, setCommissionMode] = useState<'deduct' | 'add'>('deduct')
  const [isPublic, setIsPublic] = useState(false)
  const [isImmediate, setIsImmediate] = useState(true)
  const [preparationHours, setPreparationHours] = useState('')

  // Image
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getMyMeals()
      .then(setMeals)
      .catch(() => toast.error('Impossible de charger vos repas'))
      .finally(() => setLoadingMeals(false))
  }, [hydrated, isAuthenticated])

  if (!hydrated || !isAuthenticated) return null

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagePreview(URL.createObjectURL(file))
    setImageUploading(true)
    try {
      const url = await uploadImage('subscriptions', file)
      setImageUrl(url)
      toast.success('Image uploadée')
    } catch {
      toast.error("Erreur lors de l'upload")
      setImagePreview(null)
    } finally {
      setImageUploading(false)
    }
  }

  function toggleMeal(id: string) {
    setSelectedMealIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function canSubmit() {
    if (!name.trim() || name.trim().length < 3) return false
    if (!description.trim() || description.trim().length < 10) return false
    const p = Number(price)
    if (!price || isNaN(p) || p < 100) return false
    if (!imageUrl) return false
    if (selectedMealIds.length === 0) return false
    if (!isImmediate && !preparationHours) return false
    return true
  }

  function providerMode(mode: 'deduct' | 'add') {
    const base = Number(price)
    const commission = Number(commissionPercent)
    if (!base || isNaN(base)) return 0
    if (mode === 'deduct') return Math.round(base * (1 - commission / 100)).toLocaleString('fr-FR')
    return Math.round(base / (1 - commission / 100)).toLocaleString('fr-FR')
  }

  function computedPrice() {
    const base = Number(price)
    const commission = Number(commissionPercent)
    if (!base || isNaN(base)) return 0
    if (commissionMode === 'deduct') return base
    return Math.round(base / (1 - commission / 100))
  }

  function providerReceives() {
    const base = Number(price)
    const commission = Number(commissionPercent)
    if (!base || isNaN(base)) return 0
    if (commissionMode === 'deduct') return Math.round(base * (1 - commission / 100))
    return base
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit()) return
    setSubmitting(true)
    try {
      await createSubscription({
        name: name.trim(),
        description: description.trim(),
        price: computedPrice(),
        type,
        category,
        duration,
        imageUrl,
        mealIds: selectedMealIds,
        isPublic,
        isImmediate,
        ...(!isImmediate && preparationHours ? { preparationHours: Number(preparationHours) } : {}),
        junaCommissionPercent: Number(commissionPercent),
      })
      toast.success('Abonnement créé !')
      router.push('/dashboard/subscriptions')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(typeof msg === 'string' ? msg : 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:bg-[var(--color-surface-grey)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Nouvel abonnement</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Proposez un abonnement repas à vos clients</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* ── Section 1 : Infos générales ── */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Informations générales</h2>

          {/* Image cover */}
          <Field label="Photo de l'abonnement" required hint="JPG, PNG · Dimension recommandée 800×600">
            <div className="flex items-center gap-4">
              <div
                onClick={() => imageInputRef.current?.click()}
                className="w-24 h-20 rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface-grey)] flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary-surface)] transition-colors overflow-hidden flex-shrink-0"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="cover" className="w-full h-full object-cover" />
                ) : imageUploading ? (
                  <svg className="animate-spin text-[var(--color-primary)]" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading}
                  className="h-9 px-4 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-grey)] transition-colors disabled:opacity-50"
                >
                  {imagePreview ? 'Changer la photo' : 'Choisir une photo'}
                </button>
                {imageUrl && (
                  <p className="text-xs text-[var(--color-success)] flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Photo uploadée
                  </p>
                )}
              </div>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </Field>

          <div className="h-px bg-[var(--color-border)]" />

          <Field label="Nom de l'abonnement" required hint="3 à 100 caractères">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Formule Déjeuner Africain"
              className={inputClass}
              maxLength={100}
            />
          </Field>

          <Field label="Description" required hint="Décrivez ce que vous proposez (10–1000 caractères)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Un repas complet préparé chaque jour avec des produits frais..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition-colors resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-[var(--color-text-light)] text-right -mt-1">{description.length}/1000</p>
          </Field>

          <Field label="Votre prix de référence (XOF)" required hint="Le montant que vous souhaitez pour cet abonnement. Minimum 100 XOF.">
            <div className="relative">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 25000"
                className={`${inputClass} pr-14`}
                min={100}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-light)] font-medium">
                XOF
              </span>
            </div>
          </Field>

          {/* Commission */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--color-surface-grey)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">Commission JUNA</p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  JUNA prélève un pourcentage sur chaque vente réalisée via la plateforme.
                </p>
              </div>
              <div className="relative flex-shrink-0">
                <input
                  type="number"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(String(Math.min(100, Math.max(0, Number(e.target.value)))))}
                  className="w-20 h-9 px-3 pr-7 rounded-lg border border-[var(--color-border)] bg-white text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]"
                  min={0}
                  max={100}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-light)]">%</span>
              </div>
            </div>

            {Number(price) >= 100 && (
              <>
                <div className="h-px bg-[var(--color-border)]" />
                <p className="text-xs font-medium text-[var(--color-text-secondary)]">
                  Qui supporte la commission ?
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      mode: 'deduct' as const,
                      label: 'Je l\'accepte sur mon prix',
                      detail: `Vous recevez ${providerMode('deduct')} XOF · Le client paie ${Number(price).toLocaleString('fr-FR')} XOF`,
                    },
                    {
                      mode: 'add' as const,
                      label: 'Je l\'ajoute par-dessus',
                      detail: `Vous recevez ${Number(price).toLocaleString('fr-FR')} XOF · Le client paie ${providerMode('add')} XOF`,
                    },
                  ].map(({ mode, label, detail }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCommissionMode(mode)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        commissionMode === mode
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)]'
                          : 'border-[var(--color-border)] bg-white hover:bg-[var(--color-surface-grey)]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${commissionMode === mode ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-border)]'}`}>
                        {commissionMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${commissionMode === mode ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>{label}</p>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{detail}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Récap final */}
                <div className="flex items-center justify-between gap-2 mt-1 px-3 py-2.5 rounded-xl bg-white border border-[var(--color-border)]">
                  <div className="text-center flex-1">
                    <p className="text-xs text-[var(--color-text-light)]">Prix affiché aux clients</p>
                    <p className="text-base font-bold text-[var(--color-text-primary)] mt-0.5">{computedPrice().toLocaleString('fr-FR')} XOF</p>
                  </div>
                  <div className="w-px h-8 bg-[var(--color-border)]" />
                  <div className="text-center flex-1">
                    <p className="text-xs text-[var(--color-text-light)]">Vous recevez</p>
                    <p className="text-base font-bold text-[var(--color-primary)] mt-0.5">{providerReceives().toLocaleString('fr-FR')} XOF</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Section 2 : Caractéristiques ── */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Caractéristiques</h2>

          <Field label="Type de repas" required>
            <ChipGroup
              options={Object.keys(TYPE_LABELS) as SubscriptionType[]}
              labels={TYPE_LABELS}
              value={type}
              onChange={setType}
            />
          </Field>

          <Field label="Durée de l'abonnement" required>
            <ChipGroup
              options={Object.keys(DURATION_LABELS) as SubscriptionDuration[]}
              labels={DURATION_LABELS}
              value={duration}
              onChange={setDuration}
            />
          </Field>

          <Field label="Catégorie culinaire" required>
            <ChipGroup
              options={Object.keys(CATEGORY_LABELS) as SubscriptionCategory[]}
              labels={CATEGORY_LABELS}
              value={category}
              onChange={setCategory}
            />
          </Field>
        </div>

        {/* ── Section 3 : Repas inclus ── */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[var(--color-text-primary)]">Repas inclus</h2>
            {selectedMealIds.length > 0 && (
              <span className="text-xs font-medium text-[var(--color-primary)] bg-[var(--color-primary-surface)] px-2.5 py-1 rounded-full">
                {selectedMealIds.length} sélectionné{selectedMealIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {loadingMeals ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-[var(--color-surface-grey)] animate-pulse" />
              ))}
            </div>
          ) : meals.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-grey)] flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8">
                  <path d="M18 8h1a4 4 0 010 8h-1" />
                  <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                  <line x1="6" y1="1" x2="6" y2="4" />
                  <line x1="10" y1="1" x2="10" y2="4" />
                  <line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">Aucun repas créé pour le moment</p>
              <a
                href="/dashboard/meals"
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Créer mes repas d&apos;abord
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {meals.map((meal) => {
                const selected = selectedMealIds.includes(meal.id)
                return (
                  <button
                    key={meal.id}
                    type="button"
                    onClick={() => toggleMeal(meal.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-surface-grey)]'
                    }`}
                  >
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[var(--color-surface-grey)] flex items-center justify-center flex-shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8">
                          <path d="M18 8h1a4 4 0 010 8h-1" />
                          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
                          <line x1="6" y1="1" x2="6" y2="4" />
                          <line x1="10" y1="1" x2="10" y2="4" />
                          <line x1="14" y1="1" x2="14" y2="4" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${selected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                        {meal.name}
                      </p>
                      {meal.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] truncate mt-0.5">{meal.description}</p>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selected
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                          : 'border-[var(--color-border)]'
                      }`}
                    >
                      {selected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
          {selectedMealIds.length === 0 && meals.length > 0 && (
            <p className="text-xs text-[var(--color-error)]">Sélectionnez au moins 1 repas</p>
          )}
        </div>

        {/* ── Section 4 : Disponibilité ── */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] shadow-sm p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[var(--color-text-primary)]">Disponibilité</h2>

          <Field
            label="Délai de préparation"
            hint={
              isImmediate
                ? 'Votre abonnement sera disponible immédiatement après commande.'
                : "Indiquez le nombre d'heures de préparation nécessaires."
            }
          >
            <div className="flex flex-col gap-3">
              {[
                { val: true, label: 'Disponible immédiatement', desc: "Le client reçoit sa commande sans délai d'attente" },
                { val: false, label: 'Délai de préparation', desc: 'Vous avez besoin de temps avant livraison/retrait' },
              ].map(({ val, label, desc }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setIsImmediate(val)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    isImmediate === val
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-surface)]'
                      : 'border-[var(--color-border)] hover:bg-[var(--color-surface-grey)]'
                  }`}
                >
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isImmediate === val ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{desc}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      isImmediate === val
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                        : 'border-[var(--color-border)]'
                    }`}
                  >
                    {isImmediate === val && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Field>

          {!isImmediate && (
            <Field label="Heures de préparation" required hint="Combien d'heures avant la commande devez-vous être prévenu ?">
              <input
                type="number"
                value={preparationHours}
                onChange={(e) => setPreparationHours(e.target.value)}
                placeholder="Ex: 24"
                className={inputClass}
                min={1}
              />
            </Field>
          )}

          <div className="h-px bg-[var(--color-border)]" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Publier immédiatement</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {isPublic
                  ? "L'abonnement sera visible dans l'Explorer dès la création."
                  : "Vous pourrez le publier manuellement depuis votre liste d'abonnements."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                isPublic ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border)]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={!canSubmit() || submitting}
          className="w-full h-12 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[var(--color-primary-light)] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Création en cours...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Créer l&apos;abonnement
            </>
          )}
        </button>

        <p className="text-xs text-center text-[var(--color-text-light)] pb-4">
          {isPublic
            ? "Cet abonnement sera visible par les clients dès la création."
            : "Cet abonnement ne sera pas visible. Vous pouvez le publier plus tard depuis la liste."}
        </p>
      </form>
    </div>
  )
}
