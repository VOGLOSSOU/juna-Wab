import { JUNA_COMMISSION_RATE, clientPriceFromProviderPrice } from '@/lib/utils'

export function PriceBreakdown({ providerPrice }: { providerPrice: number }) {
  if (!providerPrice || isNaN(providerPrice) || providerPrice < 100) return null
  const clientPrice = clientPriceFromProviderPrice(providerPrice)

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
          <p className="text-base font-bold text-text-primary mt-0.5">{clientPrice.toLocaleString('fr-FR')} XOF</p>
        </div>
      </div>
      <p className="text-xs text-text-secondary">
        Commission Juna Eats de {JUNA_COMMISSION_RATE * 100} % ajoutée au prix client. Vous recevez l&apos;intégralité de votre prix.
      </p>
    </div>
  )
}
