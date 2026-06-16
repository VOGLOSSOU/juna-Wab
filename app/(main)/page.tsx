import type { Metadata } from 'next'
import HomeClient from './_home-client'

export const metadata: Metadata = {
  title: 'Découvrir et souscrire à des repas préparés par des prestataires près de chez vous',
  description: 'Souscrivez à des abonnements repas chez des fournisseurs locaux près de chez vous. Petit-déjeuner, déjeuner, dîner — livraison ou retrait. Paiement Mobile Money.',
  keywords: 'abonnement repas, nourriture locale, livraison repas, traiteur, fournisseur local, plan alimentaire, manger local, Juna, Juna App, Junaeats, livraison de repas, plat livré, resto, restaurant, repas à domicile, food delivery, traiteur local, repas du jour, Bénin, Côte d\'Ivoire',
  openGraph: {
    title: 'Découvrir et souscrire à des repas préparés par des prestataires près de chez vous - Juna',
    description: 'Souscrivez à des abonnements repas chez des fournisseurs locaux près de chez vous. Petit-déjeuner, déjeuner, dîner — livraison ou retrait. Paiement Mobile Money.',
    url: 'https://junaeats.com',
    siteName: 'Juna',
    locale: 'fr_FR',
    images: [{ url: '/juna-logo.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Découvrir et souscrire à des repas préparés par des prestataires près de chez vous - Juna',
    description: 'Abonnements repas chez des traiteurs locaux. Livraison ou retrait. Paiement Mobile Money.',
    images: ['/juna-logo.png'],
  },
  alternates: { canonical: 'https://junaeats.com' },
}

export default function HomePage() {
  return <HomeClient />
}
