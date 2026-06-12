import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-content mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Image src="/juna-logo.png" alt="JUNA" width={48} height={48} className="object-contain" />
            <p className="text-sm text-text-secondary">
              Découvrir et souscrire à des repas préparés par des prestataires près de chez vous
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.junaeats.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302L6.612 21.46l8.625-8.625zm3.183-3.183l2.83 1.624a1.001 1.001 0 0 1 0 1.736l-2.83 1.624L19.91 12l-2.328 2.328zM6.612 2.54l10.32 5.929-2.328 2.328-8.625-8.625z"/>
              </svg>
              Play Store
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm text-text-primary">Découvrir</h4>
            <Link href="/" className="text-sm text-text-secondary hover:text-primary transition-colors">Accueil</Link>
            <Link href="/explorer" className="text-sm text-text-secondary hover:text-primary transition-colors">Explorer</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm text-text-primary">Prestataires</h4>
            <Link href="/auth/provider/register" className="text-sm text-text-secondary hover:text-primary transition-colors">Devenir prestataire</Link>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm text-text-primary">Informations</h4>
            <Link href="/about" className="text-sm text-text-secondary hover:text-primary transition-colors">À propos</Link>
            <Link href="/privacy" className="text-sm text-text-secondary hover:text-primary transition-colors">Confidentialité</Link>
            <Link href="/terms" className="text-sm text-text-secondary hover:text-primary transition-colors">{"Conditions d'utilisation"}</Link>
            <Link href="/sales-terms" className="text-sm text-text-secondary hover:text-primary transition-colors">Conditions de vente</Link>
            <Link href="/legal" className="text-sm text-text-secondary hover:text-primary transition-colors">Mentions légales</Link>
          </div>
        </div>

        <div className="border-t border-divider mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-light">© {new Date().getFullYear()} JUNA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
