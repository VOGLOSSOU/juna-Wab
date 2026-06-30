import type { Metadata } from 'next'
import ProviderProfileClient from './_provider-client'

const API_URL = 'https://juna-app.up.railway.app/api/v1'

async function getProvider(id: string) {
  try {
    const res = await fetch(`${API_URL}/providers/${id}`, { next: { revalidate: 3600 } })
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const p = await getProvider(params.id)
  if (!p) return {
    title: 'Prestataire',
    description: 'Découvrez ce prestataire repas sur Juna et abonnez-vous.',
  }
  const ogTitle = `${p.businessName} - Juna`
  const description = (p.description ?? `Découvrez les abonnements repas de ${p.businessName} sur Juna.`).slice(0, 160)
  const url = `https://junaeats.com/providers/${params.id}`
  return {
    title: p.businessName,
    description,
    keywords: `${p.businessName}, abonnement repas, prestataire Juna, ${p.city?.name ?? ''}, traiteur, repas livraison`,
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: 'Juna',
      images: [{ url: p.logo ?? 'https://junaeats.com/juna-logo.png', width: 800, height: 400, alt: p.businessName }],
      type: 'profile',
    },
    alternates: { canonical: url },
  }
}

export default function ProviderProfilePage() {
  return <ProviderProfileClient />
}
