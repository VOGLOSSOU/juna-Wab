interface ProviderNameProps {
  name: string
  isVerified?: boolean
  badgeSize?: number
}

// Nom de prestataire jamais tronqué : le dernier mot et le badge sont insécables
// pour que le badge reste collé au nom quand celui-ci passe à la ligne.
export function ProviderName({ name, isVerified, badgeSize = 14 }: ProviderNameProps) {
  const trimmed = name.trim()
  const i = trimmed.lastIndexOf(' ')
  const head = i === -1 ? '' : trimmed.slice(0, i + 1)
  const last = trimmed.slice(i + 1)

  return (
    <>
      {head}
      {/* Un mot très long doit pouvoir se couper (break-words du parent), sinon il déborde */}
      <span className={last.length <= 20 ? 'whitespace-nowrap' : undefined}>
        {last}
        {isVerified && (
          <svg width={badgeSize} height={badgeSize} viewBox="0 0 24 24" fill="none" className="inline-block align-middle ml-1 -mt-0.5" aria-label="Prestataire vérifié">
            <circle cx="12" cy="12" r="10" fill="#3B82F6"/>
            <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
    </>
  )
}
