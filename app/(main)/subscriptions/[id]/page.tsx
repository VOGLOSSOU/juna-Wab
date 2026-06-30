import type { Metadata } from 'next'
import SubscriptionDetailClient from './_subscription-client'

const API_URL = 'https://juna-app.up.railway.app/api/v1'

async function getSubscription(id: string) {
  try {
    const res = await fetch(`${API_URL}/subscriptions/${id}`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const sub = await getSubscription(params.id)
  if (!sub) return {
    title: 'Abonnement repas',
    description: 'Découvrez cet abonnement repas sur Juna Eats et abonnez-vous en quelques clics.',
    openGraph: { images: [{ url: '/juna-logo.png', width: 800, height: 400, alt: 'Juna Eats' }] },
  }
  const ogTitle = `${sub.name} - Juna Eats`
  const description = (sub.description ?? `Abonnez-vous chez ${sub.provider?.name} sur Juna Eats.`).slice(0, 160)
  const image = sub.images?.[0] ?? '/juna-logo.png'
  const url = `https://junaeats.com/subscriptions/${params.id}`
  return {
    title: sub.name,
    description,
    keywords: `${sub.name}, ${sub.provider?.name ?? ''}, abonnement repas, Juna Eats, Junaeats, livraison repas, traiteur, repas du jour`,
    openGraph: { title: ogTitle, description, url, siteName: 'Juna Eats', locale: 'fr_FR', images: [{ url: image, width: 800, height: 400, alt: sub.name }], type: 'website' },
    twitter: { card: 'summary_large_image', title: ogTitle, description, images: [image] },
    alternates: { canonical: url },
  }
}

export default async function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  const sub = await getSubscription(params.id)

  const jsonLd = sub ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sub.name,
    description: sub.description ?? `Abonnement repas chez ${sub.provider?.name ?? 'un prestataire local'} sur Juna Eats.`,
    image: sub.images?.[0] ?? 'https://junaeats.com/juna-logo.png',
    url: `https://junaeats.com/subscriptions/${params.id}`,
    brand: {
      '@type': 'Brand',
      name: sub.provider?.name ?? 'Juna Eats',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: sub.currency ?? 'XOF',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Juna Eats',
        url: 'https://junaeats.com',
      },
    },
  } : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SubscriptionDetailClient />
    </>
  )
}
