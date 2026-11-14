import { useEffect, useState } from 'react'
import { previewSubscriptionPrice } from '@/lib/api/subscriptions'

export function PriceBreakdown({ providerPrice }: { providerPrice: number }) {
  const [clientPrice, setClientPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!providerPrice || isNaN(providerPrice) || providerPrice < 100) {
      setClientPrice(null)
      return
    }
    let cancelled = false
    setLoading(true)
    const timeout = setTimeout(() => {
      previewSubscriptionPrice(providerPrice)
        .then((res) => {
          if (!cancelled) setClientPrice(res.price)
        })
        .catch(() => {
          if (!cancelled) setClientPrice(null)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300) // debounce pendant la saisie
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [providerPrice])

  if (!providerPrice || isNaN(providerPrice) || providerPrice < 100) return null

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-surface-grey border border-border">
        <div className="text-center flex-1">
          <p className="text-xs text-text-light">Votre prix</p>
          <p className="text-base font-bold text-primary mt-0.5">{providerPrice.toLocaleString('fr-FR')} XOF</p>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="text-center flex-1">
          <p className="text-xs text-text-light">Prix affiché au client</p>
          <p className="text-base font-bold text-text-primary mt-0.5">
            {loading || clientPrice === null ? '…' : `${clientPrice.toLocaleString('fr-FR')} XOF`}
          </p>
        </div>
      </div>
      <p className="text-xs text-text-secondary">
        Commission Juna Eats ajoutée au prix client. Vous recevez l&apos;intégralité de votre prix.
      </p>
    </div>
  )
}
