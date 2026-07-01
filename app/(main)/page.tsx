import type { Metadata } from 'next'
import HomeClient from './_home-client'

export const metadata: Metadata = {
  title: {
    absolute: 'Juna Eats — Abonnements repas & formules sur mesure près de chez vous',
  },
  description: 'Abonnez-vous aux meilleurs cuisiniers et traiteurs près de chez vous, ou proposez votre formule sur mesure. Petit-déjeuner, déjeuner, dîner — livraison ou retrait. Paiement Mobile Money.',
  keywords: 'abonnement repas, nourriture locale, livraison repas, traiteur, fournisseur local, plan alimentaire, manger local, Juna Eats, Juna Eats App, Junaeats, livraison de repas, plat livré, resto, restaurant, repas à domicile, food delivery, traiteur local, repas du jour, Bénin, Côte d\'Ivoire, formule sur mesure, abonnement personnalisé',
  openGraph: {
    title: 'Juna Eats — Abonnements repas & formules sur mesure près de chez vous',
    description: 'Abonnez-vous aux meilleurs cuisiniers et traiteurs près de chez vous, ou proposez votre formule sur mesure. Livraison ou retrait. Paiement Mobile Money.',
    url: 'https://junaeats.com',
    siteName: 'Juna Eats',
    locale: 'fr_FR',
    images: [{ url: '/juna-logo.png', width: 800, height: 400, alt: 'Juna Eats' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juna Eats — Abonnements repas & formules sur mesure près de chez vous',
    description: 'Abonnez-vous aux meilleurs cuisiniers locaux ou proposez votre formule sur mesure. Livraison ou retrait. Paiement Mobile Money.',
    images: ['/juna-logo.png'],
  },
  alternates: { canonical: 'https://junaeats.com' },
}

export default function HomePage() {
  return <HomeClient />
}
