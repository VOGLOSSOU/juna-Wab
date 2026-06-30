import type { Metadata } from 'next'
import MealDetailClient from './_meal-client'

const API_URL = 'https://juna-app.up.railway.app/api/v1'

async function getMeal(id: string) {
  try {
    const res = await fetch(`${API_URL}/meals/${id}`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const m = await getMeal(params.id)
  if (!m) return {
    title: 'Plat',
    description: 'Découvrez ce plat sur Juna Eats.',
  }
  const ogTitle = `${m.name} - Juna Eats`
  const description = (m.description ?? `Découvrez ${m.name} proposé par ${m.provider?.businessName ?? 'un prestataire'} sur Juna Eats.`).slice(0, 160)
  const url = `https://junaeats.com/meals/${params.id}`
  return {
    title: m.name,
    description,
    keywords: `${m.name}, plat, ${m.provider?.businessName ?? ''}, repas, Juna Eats`,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: 'Juna Eats',
      images: [{ url: m.imageUrl ?? 'https://junaeats.com/juna-logo.png', width: 800, height: 400, alt: m.name }],
      type: 'website',
    },
    alternates: { canonical: url },
  }
}

export default function MealDetailPage() {
  return <MealDetailClient />
}
