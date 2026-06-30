import { Suspense } from 'react'
import type { Metadata } from 'next'
import ExplorerClient from './_explorer-client'
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld'

export const metadata: Metadata = {
  title: 'Explorer les abonnements repas',
  description: 'Parcourez tous les abonnements repas disponibles près de chez vous. Filtrez par type, durée, catégorie. Petit-déjeuner, déjeuner, dîner — trouvez ce qui vous convient.',
  keywords: 'abonnement repas, nourriture locale, livraison repas, traiteur, Juna Eats, Junaeats, repas à domicile, food delivery, traiteur local, repas du jour, explorer abonnements, filtrer abonnements, petit-déjeuner, déjeuner, dîner',
  openGraph: {
    title: 'Explorer les abonnements repas - Juna Eats',
    description: 'Parcourez tous les abonnements repas disponibles près de chez vous. Filtrez par type, durée, catégorie.',
    url: 'https://junaeats.com/explorer',
    siteName: 'Juna Eats',
    locale: 'fr_FR',
    images: [{ url: '/juna-logo.png', width: 800, height: 400, alt: 'Juna Eats' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explorer les abonnements repas - Juna Eats',
    description: 'Parcourez les abonnements repas disponibles près de chez vous.',
    images: ['/juna-logo.png'],
  },
  alternates: { canonical: 'https://junaeats.com/explorer' },
}

export default function ExplorerPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[
        { name: 'Accueil', url: 'https://junaeats.com' },
        { name: 'Explorer', url: 'https://junaeats.com/explorer' },
      ]} />
      <Suspense>
        <ExplorerClient />
      </Suspense>
    </>
  )
}
