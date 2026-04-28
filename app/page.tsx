import type { Metadata } from 'next'
import HomeClient from './_home-client'

export const metadata: Metadata = {
  title: 'Juna - Abonne-toi à ton resto préféré',
  description: 'Souscrivez à des abonnements repas chez des fournisseurs locaux près de chez vous. Petit-déjeuner, déjeuner, dîner — livraison ou retrait. Paiement Mobile Money.',
  keywords: 'abonnement repas, nourriture locale, livraison repas, traiteur, fournisseur local, plan alimentaire, manger local, Juna, Juna App, Junaeats, Juna Eats, Uber Eats, livraison de repas, plat livré, resto, restaurant, commander à manger, repas à domicile, food delivery, cuisiner, manger en ligne, traiteur local, repas du jour',
  openGraph: {
    title: 'Juna - Abonne-toi à ton resto préféré',
    description: 'Souscrivez à des abonnements repas chez des fournisseurs locaux près de chez vous. Petit-déjeuner, déjeuner, dîner — livraison ou retrait. Paiement Mobile Money.',
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
}

export default function HomePage() {
  return <HomeClient />
}
