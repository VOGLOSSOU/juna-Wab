import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-content mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <Image src="/logo_green_orange.png" alt="JUNA" width={80} height={32} className="object-contain" />
            <p className="text-sm text-text-secondary">
              Mangez bien sans y penser - Juna
            </p>
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
            <Link href="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors">Contact</Link>
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
