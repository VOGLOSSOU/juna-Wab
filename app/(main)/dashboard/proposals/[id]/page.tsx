/* eslint-disable react/no-unescaped-entities */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProposal, approveProposal, rejectProposal } from '@/lib/api/proposals'
import { getMyMeals } from '@/lib/api/meals'
import { uploadImage } from '@/lib/api/upload'
import { ProposalStatusBadge } from '@/components/ui/proposal-status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showApiError } from '@/lib/utils/api-error'
import {
  formatDate, formatPrice, getInitials, mealDisplayPrice,
  SUBSCRIPTION_TYPE_LABELS, SUBSCRIPTION_DURATION_LABELS, SUBSCRIPTION_CATEGORY_LABELS,
} from '@/lib/utils'
import toast from 'react-hot-toast'
import type { SubscriptionProposal, Meal } from '@/types'

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse flex flex-col gap-6">
      <div className="h-8 w-48 bg-surface-grey rounded" />
      <div className="h-40 bg-surface-grey rounded-xl" />
      <div className="h-40 bg-surface-grey rounded-xl" />
    </div>
  )
}

export default function DashboardProposalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [proposal, setProposal] = useState<SubscriptionProposal | null>(null)
  const [myMeals, setMyMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)

  const [mode, setMode] = useState<'view' | 'approve' | 'reject'>('view')
  const [submitting, setSubmitting] = useState(false)

  // ── Formulaire d'approbation ──
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [commissionPercent, setCommissionPercent] = useState('10')
  const [commissionMode, setCommissionMode] = useState<'deduct' | 'add'>('deduct')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [isImmediate, setIsImmediate] = useState(true)
  const [preparationHours, setPreparationHours] = useState('')
  const [adjustMeals, setAdjustMeals] = useState(false)
  const [selectedMeals, setSelectedMeals] = useState<{ mealId: string; quantity: number }[]>([])

  // ── Formulaire de rejet ──
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    Promise.all([getProposal(id), getMyMeals()])
      .then(([p, meals]) => {
        setProposal(p)
        setMyMeals(meals)
        setSelectedMeals(p.meals.map((m) => ({ mealId: m.mealId, quantity: m.quantity })))
      })
      .catch(() => router.push('/dashboard/proposals'))
      .finally(() => setLoading(false))
  }, [id, hydrated, isAuthenticated, router])

  if (!hydrated || loading) return <Skeleton />
  if (!proposal) return null

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage('subscriptions', file)
      setImageUrl(url)
    } catch (err) {
      showApiError(err, "Échec de l'upload de l'image")
    } finally {
      setUploading(false)
    }
  }

  function toggleMeal(mealId: string) {
    setSelectedMeals((prev) =>
      prev.some((m) => m.mealId === mealId)
        ? prev.filter((m) => m.mealId !== mealId)
        : [...prev, { mealId, quantity: 1 }]
    )
  }

  function setQuantity(mealId: string, quantity: number) {
    setSelectedMeals((prev) => prev.map((m) => (m.mealId === mealId ? { ...m, quantity: Math.max(1, quantity) } : m)))
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

  function providerModeLabel(mode: 'deduct' | 'add') {
    const base = Number(price)
    const commission = Number(commissionPercent)
    if (!base || isNaN(base)) return '0'
    if (mode === 'deduct') return Math.round(base * (1 - commission / 100)).toLocaleString('fr-FR')
    return Math.round(base / (1 - commission / 100)).toLocaleString('fr-FR')
  }

  async function handleApprove() {
    if (!name.trim() || !description.trim() || !price || !imageUrl) {
      toast.error('Nom, description, prix et image sont requis.')
      return
    }
    if (!isImmediate && (!preparationHours || Number(preparationHours) < 1)) {
      toast.error("Le délai de préparation est requis si l'abonnement n'est pas immédiat.")
      return
    }
    setSubmitting(true)
    try {
      await approveProposal(id, {
        name: name.trim(),
        description: description.trim(),
        price: computedPrice(),
        imageUrl,
        junaCommissionPercent: Number(commissionPercent),
        isImmediate,
        preparationHours: !isImmediate ? Number(preparationHours) : undefined,
        meals: adjustMeals ? selectedMeals : undefined,
      })
      toast.success('Proposition approuvée — abonnement publié.')
      router.push('/dashboard/subscriptions')
    } catch (err) {
      showApiError(err, "Échec de l'approbation")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReject() {
    if (rejectionReason.trim().length < 5) {
      toast.error('Le motif doit contenir au moins 5 caractères.')
      return
    }
    setSubmitting(true)
    try {
      const reason = rejectionReason.trim()
      await rejectProposal(id, reason)
      toast.success('Proposition rejetée.')
      setProposal((prev) => (prev ? { ...prev, status: 'REJECTED', rejectionReason: reason } : prev))
      setMode('view')
    } catch (err) {
      showApiError(err, 'Échec du rejet')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/proposals" className="w-9 h-9 rounded-xl border border-border flex items-center justify-center hover:bg-surface-grey transition-colors flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-text-primary">Proposition de {proposal.user?.name ?? 'client'}</h1>
          <p className="text-sm text-text-secondary">{formatDate(proposal.createdAt)}</p>
        </div>
        <ProposalStatusBadge status={proposal.status} />
      </div>

      {/* Infos client */}
      <div className="bg-white rounded-xl border border-border p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary-surface flex items-center justify-center text-primary font-bold flex-shrink-0">
          {getInitials(proposal.user?.name ?? '?')}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm">{proposal.user?.name ?? '—'}</p>
          <p className="text-xs text-text-secondary truncate">{proposal.user?.email}</p>
        </div>
      </div>

      {/* Détails de la demande */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Détails de la demande</h2>
        </div>
        <div className="divide-y divide-border">
          <Row label="Type" value={SUBSCRIPTION_TYPE_LABELS[proposal.type]} />
          <Row label="Catégorie" value={SUBSCRIPTION_CATEGORY_LABELS[proposal.category]} />
          <Row label="Fréquence" value={SUBSCRIPTION_DURATION_LABELS[proposal.duration]} />
          {proposal.message && <Row label="Message" value={proposal.message} />}
        </div>
      </div>

      {/* Plats demandés */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm">Plats demandés ({proposal.meals.length})</h2>
        </div>
        <div className="divide-y divide-border">
          {proposal.meals.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <div className="relative w-12 h-12 rounded-lg bg-surface-grey flex-shrink-0 overflow-hidden">
                {item.meal.imageUrl ? (
                  <Image src={item.meal.imageUrl} alt={item.meal.name} fill sizes="48px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-light">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{item.meal.name}</p>
                <p className="text-xs text-text-secondary">
                  {item.mealPricingLabel ? `Variante : ${item.mealPricingLabel} · ` : ''}Quantité : {item.quantity}
                  {!item.meal.isActive && <span className="text-error font-medium"> · inactif</span>}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statut traité */}
      {proposal.status === 'REJECTED' && proposal.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-error mb-1">Motif du rejet</p>
          <p className="text-sm text-text-primary">{proposal.rejectionReason}</p>
        </div>
      )}
      {proposal.status === 'APPROVED' && proposal.resultingSubscriptionId && (
        <Link
          href={`/dashboard/subscriptions/${proposal.resultingSubscriptionId}/edit`}
          className="bg-primary-surface border border-primary/15 rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
        >
          <span className="text-sm font-medium text-primary">Voir l'abonnement publié</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-primary"><polyline points="9 18 15 12 9 6"/></svg>
        </Link>
      )}

      {/* Actions */}
      {proposal.status === 'PENDING' && mode === 'view' && (
        <div className="flex gap-3">
          <Button variant="primary" className="flex-1" onClick={() => setMode('approve')}>Approuver</Button>
          <Button variant="outline" className="flex-1" onClick={() => setMode('reject')}>Rejeter</Button>
        </div>
      )}

      {/* Formulaire d'approbation */}
      {proposal.status === 'PENDING' && mode === 'approve' && (
        <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Finaliser l'abonnement</h2>
          <Input label="Nom de l'abonnement" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Abonnement midi sur mesure" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text-primary">Description<span className="text-error ml-1">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Repas chaud chaque midi du lundi au vendredi"
            />
          </div>
          <Input label="Prix final (FCFA)" required type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="27000" />

          {/* Commission */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-grey border border-border">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-text-primary">Commission Juna Eats</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Juna Eats prélève un pourcentage sur chaque vente réalisée via la plateforme.
                </p>
              </div>
              <div className="relative flex-shrink-0">
                <input
                  type="number"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(String(Math.min(100, Math.max(0, Number(e.target.value)))))}
                  className="w-20 h-9 px-3 pr-7 rounded-lg border border-border bg-white text-sm text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  min={0}
                  max={100}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-light">%</span>
              </div>
            </div>

            {Number(price) >= 100 && (
              <>
                <div className="h-px bg-border" />
                <p className="text-xs font-medium text-text-secondary">Qui supporte la commission ?</p>
                <div className="flex flex-col gap-2">
                  {([
                    {
                      mode: 'deduct' as const,
                      label: "Je l'accepte sur mon prix",
                      detail: `Vous recevez ${providerModeLabel('deduct')} XOF · Le client paie ${Number(price).toLocaleString('fr-FR')} XOF`,
                    },
                    {
                      mode: 'add' as const,
                      label: "Je l'ajoute par-dessus",
                      detail: `Vous recevez ${Number(price).toLocaleString('fr-FR')} XOF · Le client paie ${providerModeLabel('add')} XOF`,
                    },
                  ] as const).map(({ mode, label, detail }) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setCommissionMode(mode)}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        commissionMode === mode
                          ? 'border-primary bg-primary-surface'
                          : 'border-border bg-white hover:bg-surface-grey'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${commissionMode === mode ? 'border-primary bg-primary' : 'border-border'}`}>
                        {commissionMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${commissionMode === mode ? 'text-primary' : 'text-text-primary'}`}>{label}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{detail}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white border border-border">
                  <div className="text-center flex-1">
                    <p className="text-xs text-text-light">Prix affiché aux clients</p>
                    <p className="text-base font-bold text-text-primary mt-0.5">{computedPrice().toLocaleString('fr-FR')} XOF</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-xs text-text-light">Vous recevez</p>
                    <p className="text-base font-bold text-primary mt-0.5">{providerReceives().toLocaleString('fr-FR')} XOF</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Disponibilité */}
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-text-primary">Délai de préparation</p>
            <div className="flex flex-col gap-2">
              {([
                { val: true, label: 'Disponible immédiatement', desc: "Le client reçoit sa commande sans délai d'attente" },
                { val: false, label: 'Délai de préparation', desc: 'Vous avez besoin de temps avant livraison/retrait' },
              ] as const).map(({ val, label, desc }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => setIsImmediate(val)}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                    isImmediate === val
                      ? 'border-primary bg-primary-surface'
                      : 'border-border hover:bg-surface-grey'
                  }`}
                >
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isImmediate === val ? 'text-primary' : 'text-text-primary'}`}>{label}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isImmediate === val ? 'border-primary bg-primary' : 'border-border'}`}>
                    {isImmediate === val && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                </button>
              ))}
            </div>
            {!isImmediate && (
              <Input
                label="Heures de préparation"
                required
                type="number"
                min={1}
                value={preparationHours}
                onChange={(e) => setPreparationHours(e.target.value)}
                placeholder="Ex: 2"
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">Image de l'abonnement<span className="text-error ml-1">*</span></label>
            {imageUrl ? (
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-surface-grey">
                <Image src={imageUrl} alt="" fill sizes="400px" className="object-cover" />
              </div>
            ) : (
              <label className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-border text-sm text-text-secondary cursor-pointer hover:bg-surface-grey transition-colors">
                {uploading ? 'Envoi...' : 'Choisir une image'}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input type="checkbox" checked={adjustMeals} onChange={(e) => setAdjustMeals(e.target.checked)} />
            Ajuster les plats avant publication
          </label>

          {adjustMeals && (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto border border-border rounded-lg p-2">
              {myMeals.map((meal) => {
                const sel = selectedMeals.find((m) => m.mealId === meal.id)
                return (
                  <div key={meal.id} className={`flex items-center gap-3 p-2 rounded-lg ${sel ? 'bg-primary-surface' : ''}`}>
                    <input type="checkbox" checked={!!sel} onChange={() => toggleMeal(meal.id)} />
                    <span className="flex-1 min-w-0 text-sm truncate">{meal.name}</span>
                    <span className="text-xs text-text-light">{mealDisplayPrice(meal)}</span>
                    {sel && (
                      <input
                        type="number"
                        min={1}
                        value={sel.quantity}
                        onChange={(e) => setQuantity(meal.id, Number(e.target.value))}
                        className="w-14 h-8 text-sm text-center rounded border border-border"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex gap-3 mt-2">
            <Button variant="primary" className="flex-1" loading={submitting} onClick={handleApprove}>Publier l'abonnement</Button>
            <Button variant="ghost" onClick={() => setMode('view')}>Annuler</Button>
          </div>
        </div>
      )}

      {/* Formulaire de rejet */}
      {proposal.status === 'PENDING' && mode === 'reject' && (
        <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
          <h2 className="font-semibold text-sm">Motif du rejet</h2>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: Pas assez de stock pour le moment"
          />
          <p className="text-xs text-text-light self-end">{rejectionReason.length}/500</p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" loading={submitting} onClick={handleReject}>Confirmer le rejet</Button>
            <Button variant="ghost" onClick={() => setMode('view')}>Annuler</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-3">
      <span className="text-xs text-text-secondary whitespace-nowrap">{label}</span>
      <span className="text-sm text-right text-text-primary">{value}</span>
    </div>
  )
}
