import type { Metadata } from 'next'
import ExplorerClient from './_explorer-client'

export const metadata: Metadata = {
  title: 'Juna - Découvrez les abonnements repas proche de vous',
  description: 'Parcourez tous les abonnements repas disponibles près de chez vous. Filtrez par type, durée, catégorie. Petit-déjeuner, déjeuner, dîner — trouvez ce qui vous convient.',
  keywords: 'abonnement repas, nourriture locale, livraison repas, traiteur, fournisseur local, plan alimentaire, manger local, Juna, Juna App, Junaeats, Juna Eats, Uber Eats, livraison de repas, plat livré, resto, restaurant, commander à manger, repas à domicile, food delivery, cuisiner, manger en ligne, traiteur local, repas du jour, explorer abonnements, trouver repas, filtrer abonnements',
  openGraph: {
    title: 'Juna - Découvrez les abonnements repas proche de vous',
    description: 'Parcourez tous les abonnements repas disponibles près de chez vous. Filtrez par type, durée, catégorie. Petit-déjeuner, déjeuner, dîner — trouvez ce qui vous convient.',
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
}

export default function ExplorerPage() {
  return <ExplorerClient />
}
