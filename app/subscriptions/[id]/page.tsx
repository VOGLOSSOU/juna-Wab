import type { Metadata } from 'next'
import SubscriptionDetailClient from './_subscription-client'

const API_URL = 'https://juna-app.up.railway.app/api/v1'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/subscriptions/${params.id}`, { next: { revalidate: 3600 } })
    const json = await res.json()
    const sub = json.data
    const title = `${sub.name} - Juna`
    const description = (sub.description ?? `Abonnez-vous chez ${sub.provider?.name} sur Juna.`).slice(0, 160)
    const image = sub.images?.[0] ?? 'https://junaeats.com/logo_green_orange.png'
    return {
      title,
      description,
      keywords: `${sub.name}, ${sub.provider?.name ?? ''}, abonnement repas, Juna, Juna App, Junaeats, Juna Eats, Uber Eats, livraison repas, resto, restaurant, plat livré, commander à manger, food delivery, traiteur, repas du jour`,
      openGraph: {
        title,
        description,
        images: [{ url: image, width: 800, height: 400, alt: sub.name }],
        type: 'website',
      },
    }
  } catch {
    return {
      title: 'Abonnement repas - Juna',
      description: 'Découvrez cet abonnement repas sur Juna et abonnez-vous en quelques clics.',
      openGraph: {
        images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
      },
    }
  }
}

export default function SubscriptionDetailPage() {
  return <SubscriptionDetailClient />
}
