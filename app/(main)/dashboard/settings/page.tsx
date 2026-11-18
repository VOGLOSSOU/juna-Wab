'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getProviderProfile } from '@/lib/api/auth'
import { setPayoutInfo } from '@/lib/api/providers'
import { normalizePaymentPhone } from '@/lib/utils/payment'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { showApiError } from '@/lib/utils/api-error'
import toast from 'react-hot-toast'
import type { Provider } from '@/types'

const PAYOUT_NETWORKS = [
  { value: 'MTN', label: 'MTN' },
  { value: 'MOOV', label: 'Moov' },
] as const

const QUICK_LINKS = [
  { href: '/dashboard/subscriptions', label: 'Mes abonnements', desc: 'Créer et gérer vos formules', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
  { href: '/dashboard/meals', label: 'Mes plats', desc: 'Gérer votre catalogue de plats', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg> },
  { href: '/dashboard/active-subscriptions', label: 'Abonnés actifs', desc: 'Vos clients en cours, et le total qui vous est dû', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
  { href: '/dashboard/orders', label: 'Mes commandes', desc: 'Toutes les commandes reçues', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { href: '/dashboard/proposals', label: 'Propositions reçues', desc: 'Demandes sur-mesure de vos clients', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
  { href: '/dashboard/stats', label: 'Statistiques', desc: 'Revenus et performance', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { href: '/dashboard/profile', label: 'Mon profil prestataire', desc: 'Informations publiques, zones de livraison', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
] as const

function formatPayoutPhone(value?: string | null): string {
  if (!value) return ''
  // "2290163000000" -> affichage local "0163000000"
  return value.startsWith('229') ? value.slice(3) : value
}

export default function DashboardSettingsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard('/auth/login')
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [phone, setPhone] = useState('')
  const [network, setNetwork] = useState<'MTN' | 'MOOV' | null>(null)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getProviderProfile()
      .then((p) => {
        setProvider(p)
        setPhone(formatPayoutPhone(p.payoutPhoneNumber))
        setNetwork(p.payoutNetwork ?? null)
      })
      .catch(() => toast.error('Impossible de charger votre profil'))
      .finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  // Le numéro de contact du compte peut servir de suggestion, mais seulement
  // s'il est déjà dans un format exploitable pour un versement.
  const accountPhoneNormalized = useMemo(
    () => (provider?.phone ? normalizePaymentPhone(provider.phone) : null),
    [provider?.phone]
  )

  if (!hydrated || loading) {
    return (
      <div className="max-w-content mx-auto px-6 py-12 animate-pulse flex flex-col gap-6">
        <div className="h-8 w-56 bg-surface-grey rounded-lg" />
        <div className="h-64 bg-surface-grey rounded-xl" />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!network) {
      toast.error('Choisissez un opérateur (MTN ou Moov).')
      return
    }
    const normalized = normalizePaymentPhone(phone)
    if (!normalized) {
      toast.error('Numéro invalide : utilisez 10 chiffres commençant par 01.')
      return
    }
    setSubmitting(true)
    try {
      const result = await setPayoutInfo({ payoutPhoneNumber: normalized, payoutNetwork: network })
      setProvider((prev) => (prev ? { ...prev, payoutPhoneNumber: result.payoutPhoneNumber, payoutNetwork: network } : prev))
      setPhone(formatPayoutPhone(result.payoutPhoneNumber))
      toast.success('Numéro de réception enregistré !')
    } catch (err: unknown) {
      showApiError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const isConfigured = !!provider?.payoutPhoneNumber && !!provider?.payoutNetwork

  return (
    <div className="max-w-content mx-auto px-6 py-12 flex flex-col gap-8">
      <div>
        <h1 className="text-headline-large font-semibold mb-1">Paramètres prestataire</h1>
        <p className="text-text-secondary text-sm">Gérez les informations de votre compte prestataire.</p>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-6 flex flex-col gap-5 max-w-xl">
        <div>
          <h2 className="font-semibold text-text-primary">Versements Mobile Money</h2>
          <p className="text-sm text-text-secondary mt-1">
            Le numéro sur lequel vous recevez le paiement de vos abonnements, une fois que vos clients
            activent leur commande.
          </p>
        </div>

        {isConfigured && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary-surface border border-primary/15 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary flex-shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-text-primary">
              Configuré : <strong>{provider?.payoutNetwork}</strong> — {formatPayoutPhone(provider?.payoutPhoneNumber)}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-primary">Opérateur<span className="text-error ml-1">*</span></label>
            <div className="flex gap-2">
              {PAYOUT_NETWORKS.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setNetwork(op.value)}
                  className={`h-10 px-5 rounded-xl text-sm font-medium border-2 transition-colors ${
                    network === op.value
                      ? 'border-primary bg-primary-surface text-primary'
                      : 'border-border text-text-primary hover:bg-surface-grey'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>

          {provider?.phone && (
            accountPhoneNormalized ? (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-surface-grey border border-border text-sm">
                <span className="text-text-secondary">
                  Numéro lié à votre compte : <strong className="text-text-primary">{formatPayoutPhone(accountPhoneNormalized)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setPhone(formatPayoutPhone(accountPhoneNormalized))}
                  className="text-primary font-medium hover:underline flex-shrink-0"
                >
                  Utiliser ce numéro
                </button>
              </div>
            ) : (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>
                  Le numéro de votre compte ({provider.phone}) n&apos;est pas dans un format valide pour un versement
                  (10 chiffres commençant par 01). Mettez-le à jour dans{' '}
                  <Link href="/profile/settings" className="underline font-medium">vos informations de compte</Link>{' '}
                  avant de pouvoir l&apos;utiliser ici.
                </span>
              </div>
            )
          )}

          <Input
            label="Votre numéro Mobile Money"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0163000000"
            hint="10 chiffres commençant par 01. Vous pouvez aussi saisir le numéro complet avec 229."
          />

          <Button type="submit" variant="primary" loading={submitting} className="self-start">
            {isConfigured ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-semibold text-text-primary">Accès rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow flex items-center gap-4"
            >
              <div className="text-primary flex-shrink-0">{item.icon}</div>
              <div>
                <p className="font-semibold text-sm text-text-primary">{item.label}</p>
                <p className="text-xs text-text-secondary mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
