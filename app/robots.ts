import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/profile/', '/checkout/', '/auth/'],
      },
    ],
    sitemap: 'https://junaeats.com/sitemap.xml',
  }
}
