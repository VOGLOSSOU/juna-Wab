'use client'

import { useEffect, useState } from 'react'
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
    </div>
  )
}
