import type { MetadataRoute } from 'next'

const BASE_URL = 'https://junaeats.com'
const API_URL = 'https://juna-app.up.railway.app/api/v1'

async function getSubscriptionUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_URL}/subscriptions?limit=500`, {
      next: { revalidate: 86400 },
    })
    const json = await res.json()
    const items: { id: string; updatedAt?: string }[] = json.data?.items ?? json.data ?? []
    return items.map((sub) => ({
      url: `${BASE_URL}/subscriptions/${sub.id}`,
      lastModified: sub.updatedAt ? new Date(sub.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const subscriptionUrls = await getSubscriptionUrls()

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/explorer`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/telecharger`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sales-terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/suppression-compte`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    ...subscriptionUrls,
  ]
}
