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
              className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-lg bg-text-primary text-white text-sm font-medium hover:bg-text-primary/90 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.6 2.4c-.3.3-.5.7-.5 1.2v16.8c0 .5.2.9.5 1.2l.1.1 9.4-9.4v-.2L3.7 2.3l-.1.1z"/>
                <path d="M16.8 12l-3.2-3.2L4.2 18l9.4-9.4 3.2 3.2z" opacity=".7"/>
                <path d="M16.8 12l-3.2 3.2L4.2 6l9.4 9.4 3.2-3.4z" opacity=".7"/>
                <path d="M19.5 10.6l-2.7-1.5-3.1 2.9 3.1 2.9 2.7-1.5c.7-.4.7-1.4 0-1.8z" opacity=".9"/>
              </svg>
              Disponible sur Google Play
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
