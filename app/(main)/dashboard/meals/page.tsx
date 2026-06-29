/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getMyMeals, createMeal, updateMeal, toggleMeal, deleteMeal } from '@/lib/api/meals'
import { uploadImage } from '@/lib/api/upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'
import { showApiError } from '@/lib/utils/api-error'
import type { Meal, MealType, MealPriceType } from '@/types'

const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: 'Petit-déjeuner',
  LUNCH: 'Déjeuner',
  DINNER: 'Dîner',
  SNACK: 'Collation',
}

const PRICE_TYPE_LABELS: Record<MealPriceType, string> = {
  FIXED: 'Prix fixe',
  MULTIPLE: 'Variantes (tailles/options)',
  RANGE: 'Fourchette de prix',
}

interface PricingRow { label: string; price: string }

interface MealFormState {
  name: string
  description: string
  mealType: MealType
  imageUrl: string
  priceType: MealPriceType
  price: string
  priceMin: string
  priceMax: string
  pricings: PricingRow[]
  priceGuideline: string
}

const DEFAULT_FORM: MealFormState = {
  name: '', description: '', mealType: 'LUNCH', imageUrl: '',
  priceType: 'FIXED', price: '', priceMin: '', priceMax: '',
  pricings: [{ label: '', price: '' }, { label: '', price: '' }],
  priceGuideline: '',
}

// ─── Helpers ─────────────────────────────────────────────────

function displayPrice(meal: Meal): string {
  if (meal.priceType === 'MULTIPLE' && meal.pricings?.length) {
    const min = Math.min(...meal.pricings.map(p => p.price))
    return `À partir de ${formatPrice(min)}`
  }
  if (meal.priceType === 'RANGE' && meal.priceMin != null && meal.priceMax != null) {
    return `${formatPrice(meal.priceMin)} – ${formatPrice(meal.priceMax)}`
  }
  if (meal.price != null) return formatPrice(meal.price)
  return ''
}

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
      <button type="button" onClick={() => setOpen(!open)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-grey transition-colors text-text-secondary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-border shadow-xl z-50 py-1 overflow-hidden" onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  )
}

function KebabItem({ label, onClick, danger, icon }: { label: string; onClick: () => void; danger?: boolean; icon: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${danger ? 'text-red-600 hover:bg-red-50' : 'text-text-primary hover:bg-surface-grey'}`}>
      {icon}{label}
    </button>
  )
}

// ─── Page ────────────────────────────────────────────────────
export default function DashboardMealsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MealFormState>(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getMyMeals().then(setMeals).catch(console.error).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage('meals', file)
      setForm(f => ({ ...f, imageUrl: url }))
    } catch (err: unknown) { showApiError(err) }
    finally { setUploading(false) }
  }

  const canSubmit = () => {
    if (uploading || form.name.trim().length < 2 || form.description.trim().length < 5 || !form.imageUrl) return false
    if (form.priceType === 'FIXED') return Number(form.price) >= 1
    if (form.priceType === 'RANGE') return Number(form.priceMin) >= 1 && Number(form.priceMax) > Number(form.priceMin)
    if (form.priceType === 'MULTIPLE') {
      const valid = form.pricings.filter(p => p.label.trim() && Number(p.price) >= 1)
      return valid.length >= 2
    }
    return false
  }

  const buildPayload = () => {
    const base = {
      name: form.name, description: form.description,
      mealType: form.mealType, imageUrl: form.imageUrl,
      priceType: form.priceType,
      ...(form.priceGuideline.trim() ? { priceGuideline: form.priceGuideline.trim() } : {}),
    }
    if (form.priceType === 'FIXED') return { ...base, price: Number(form.price) }
    if (form.priceType === 'RANGE') return { ...base, priceMin: Number(form.priceMin), priceMax: Number(form.priceMax) }
    if (form.priceType === 'MULTIPLE') return {
      ...base,
      pricings: form.pricings
        .filter(p => p.label.trim() && Number(p.price) >= 1)
        .map(p => ({ label: p.label.trim(), price: Number(p.price) })),
    }
    return base
  }

  const handleSubmit = async () => {
    if (!canSubmit()) return
    setSubmitting(true)
    try {
      const payload = buildPayload()
      if (editingId) {
        const updated = await updateMeal(editingId, payload)
        setMeals(prev => prev.map(m => m.id === editingId ? updated : m))
        toast.success('Plat modifié')
      } else {
        const created = await createMeal(payload)
        setMeals(prev => [...prev, created])
        toast.success('Plat créé')
      }
      setShowForm(false); setEditingId(null); setForm(DEFAULT_FORM)
    } catch (err: unknown) { showApiError(err) }
    finally { setSubmitting(false) }
  }

  const handleEdit = (meal: Meal) => {
    setForm({
      name: meal.name,
      description: meal.description ?? '',
      mealType: meal.mealType ?? 'LUNCH',
      imageUrl: meal.imageUrl ?? '',
      priceType: meal.priceType ?? 'FIXED',
      price: String(meal.price ?? ''),
      priceMin: String(meal.priceMin ?? ''),
      priceMax: String(meal.priceMax ?? ''),
      pricings: meal.pricings?.length
        ? meal.pricings.map(p => ({ label: p.label, price: String(p.price) }))
        : [{ label: '', price: '' }, { label: '', price: '' }],
      priceGuideline: meal.priceGuideline ?? '',
    })
    setEditingId(meal.id)
    setShowForm(true)
  }

  const handleToggle = async (id: string) => {
    try {
      const result = await toggleMeal(id)
      setMeals(prev => prev.map(m => m.id === id ? { ...m, isActive: result.isActive } : m))
      toast.success(result.isActive ? 'Plat activé' : 'Plat désactivé')
    } catch (err: unknown) { showApiError(err) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce plat ? Cette action est irréversible.')) return
    try {
      await deleteMeal(id)
      setMeals(prev => prev.filter(m => m.id !== id))
      toast.success('Plat supprimé')
    } catch (err: unknown) { showApiError(err) }
  }

  const addPricingRow = () => setForm(f => ({ ...f, pricings: [...f.pricings, { label: '', price: '' }] }))
  const removePricingRow = (i: number) => setForm(f => ({ ...f, pricings: f.pricings.filter((_, idx) => idx !== i) }))
  const updatePricingRow = (i: number, field: 'label' | 'price', value: string) =>
    setForm(f => ({ ...f, pricings: f.pricings.map((p, idx) => idx === i ? { ...p, [field]: value } : p) }))

  if (loading) return <div className="p-10 text-center text-text-secondary">Chargement...</div>

  return (
    <div className="max-w-content mx-auto px-6 py-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-headline-large font-semibold">Mes plats</h1>
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="h-10 px-4 rounded-xl border border-border text-text-primary text-sm font-medium hover:bg-surface-grey transition-colors flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <Button variant="primary" onClick={() => { setShowForm(true); setEditingId(null); setForm(DEFAULT_FORM) }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Ajouter un plat
          </Button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-lg">{editingId ? 'Modifier le plat' : 'Nouveau plat'}</h2>

          {/* Nom + Type de repas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nom *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex : Riz sauce graine" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">Type de repas *</label>
              <select value={form.mealType} onChange={e => setForm(f => ({ ...f, mealType: e.target.value as MealType }))} className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map(t => (
                  <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Décrivez le plat..." className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          {/* Type de prix */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-text-primary">Type de prix *</label>
              <select value={form.priceType} onChange={e => setForm(f => ({ ...f, priceType: e.target.value as MealPriceType }))} className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {(Object.keys(PRICE_TYPE_LABELS) as MealPriceType[]).map(t => (
                  <option key={t} value={t}>{PRICE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* FIXED */}
            {form.priceType === 'FIXED' && (
              <Input label="Prix (XOF) *" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Ex : 2500" />
            )}

            {/* RANGE */}
            {form.priceType === 'RANGE' && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Prix minimum (XOF) *" type="number" value={form.priceMin} onChange={e => setForm(f => ({ ...f, priceMin: e.target.value }))} placeholder="Ex : 1000" />
                <Input label="Prix maximum (XOF) *" type="number" value={form.priceMax} onChange={e => setForm(f => ({ ...f, priceMax: e.target.value }))} placeholder="Ex : 6000" />
              </div>
            )}

            {/* MULTIPLE */}
            {form.priceType === 'MULTIPLE' && (
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-text-primary">Variantes * <span className="font-normal text-text-secondary">(minimum 2)</span></label>
                {form.pricings.map((row, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={row.label}
                      onChange={e => updatePricingRow(i, 'label', e.target.value)}
                      placeholder={`Label (ex : ${i === 0 ? 'Petit' : i === 1 ? 'Moyen' : 'Grand'})`}
                      className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      value={row.price}
                      onChange={e => updatePricingRow(i, 'price', e.target.value)}
                      placeholder="Prix XOF"
                      className="w-32 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {form.pricings.length > 2 && (
                      <button type="button" onClick={() => removePricingRow(i)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addPricingRow} className="text-sm text-primary font-medium flex items-center gap-1.5 hover:underline w-fit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Ajouter une variante
                </button>
              </div>
            )}

            {/* Prix indicatif (optionnel, tous types) */}
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">Note sur le prix <span className="font-normal text-text-secondary">(optionnel)</span></label>
              <input
                type="text"
                value={form.priceGuideline}
                onChange={e => setForm(f => ({ ...f, priceGuideline: e.target.value }))}
                placeholder="Ex : La différence est la taille de la portion"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm font-medium text-text-primary block mb-1">Photo *</label>
            {form.imageUrl && (
              <div className="relative w-32 h-24 rounded-lg overflow-hidden mb-2 border border-border">
                <Image src={form.imageUrl} alt="Aperçu" fill className="object-cover" />
              </div>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="text-sm" />
            {uploading && <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              Upload en cours...
            </p>}
          </div>

          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={!canSubmit() || submitting}>
              {editingId ? 'Enregistrer' : 'Créer le plat'}
            </Button>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditingId(null) }}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Liste */}
      {meals.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p>Aucun plat enregistré. Ajoutez vos plats pour créer des abonnements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map(meal => (
            <div key={meal.id} className={`bg-white rounded-xl border ${meal.isActive ? 'border-border' : 'border-border opacity-60'}`}>
              <div className="relative h-40 bg-surface-grey rounded-t-xl overflow-hidden">
                {meal.imageUrl ? (
                  <Image src={meal.imageUrl} alt={meal.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-light">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  </div>
                )}
                {!meal.isActive && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Désactivé</span>
                  </div>
                )}
                {meal.priceType === 'MULTIPLE' && (
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Variantes</span>
                )}
                {meal.priceType === 'RANGE' && (
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Fourchette</span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{meal.name}</h3>
                    {meal.mealType && <span className="text-xs text-text-secondary">{MEAL_TYPE_LABELS[meal.mealType]}</span>}
                  </div>
                  <KebabMenu>
                    <KebabItem label="Modifier" onClick={() => handleEdit(meal)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>} />
                    <KebabItem label={meal.isActive ? 'Désactiver' : 'Activer'} onClick={() => handleToggle(meal.id)} icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>} />
                    <div className="h-px bg-border mx-2 my-1" />
                    <KebabItem label="Supprimer" onClick={() => handleDelete(meal.id)} danger icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>} />
                  </KebabMenu>
                </div>
                {meal.description && <p className="text-xs text-text-secondary line-clamp-2">{meal.description}</p>}
                {displayPrice(meal) && <p className="font-bold text-primary text-sm">{displayPrice(meal)}</p>}
                {meal.priceGuideline && <p className="text-xs text-text-light italic">{meal.priceGuideline}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
