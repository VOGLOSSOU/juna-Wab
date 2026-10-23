import { useId } from 'react'

export function SubscriptionInstructionsField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-text-primary">Instructions de l’abonnement - facultatif</label>
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={4} maxLength={2000}
        aria-describedby={`${id}-hint ${id}-count`}
        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
      <p id={`${id}-hint`} className="text-xs text-text-secondary">Précisez les portions, accompagnements ou consignes de préparation propres à cette formule. Le prix reste celui que vous définissez.</p>
      <p id={`${id}-count`} className="text-xs text-text-light text-right">{value.length}/2000</p>
    </div>
  )
}

export function SubscriptionInstructions({ instructions }: { instructions?: string | null }) {
  if (!instructions?.trim()) return null
  return (
    <section className="bg-primary-surface rounded-xl p-4">
      <h2 className="text-sm font-semibold text-text-primary">Précisions du prestataire</h2>
      <p className="mt-2 text-sm text-text-secondary whitespace-pre-wrap break-words">{instructions}</p>
    </section>
  )
}
