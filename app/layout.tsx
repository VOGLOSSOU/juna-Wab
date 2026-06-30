import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  metadataBase: new URL('https://junaeats.com'),
  title: {
    default: 'Mangez bien, sans se donner de la peine - Juna Eats',
    template: '%s - Juna Eats',
  },
  description: 'Découvrez et abonnez-vous aux meilleurs plans repas en Afrique de l\'Ouest. Traiteurs locaux, livraison à domicile ou retrait sur place. Paiement Mobile Money.',
  keywords: 'abonnement repas, nourriture locale, livraison repas, traiteur, Bénin, Côte d\'Ivoire, Juna Eats, Junaeats, food delivery, repas à domicile, petit-déjeuner, déjeuner, dîner, plan alimentaire',
  openGraph: {
    siteName: 'Juna Eats',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/juna-logo.png', width: 800, height: 400, alt: 'Juna Eats' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@junaeats',
    images: ['/juna-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.ico',   sizes: 'any' },
      { url: '/icon-192.png',  sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png',  sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  verification: {
    google: 'IsOCPEX_-_8qamlPDGB2sjB2npCjrqqwBaYay2QxIDE',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Juna Eats',
  url: 'https://junaeats.com',
  logo: 'https://junaeats.com/juna-logo.png',
  description: "Plateforme d'abonnements repas en Afrique de l'Ouest. Prestataires locaux, livraison ou retrait, paiement Mobile Money.",
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'junaapp1@gmail.com',
    contactType: 'customer service',
    availableLanguage: 'French',
  },
  areaServed: ['Bénin', "Côte d'Ivoire"],
  sameAs: [
    'https://play.google.com/store/apps/details?id=com.junaeats.app',
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Juna Eats',
  url: 'https://junaeats.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://junaeats.com/explorer?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-background">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              background: '#18181B',
              color: '#FAFAFA',
              borderRadius: '12px',
              padding: '12px 18px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              maxWidth: '360px',
            },
            success: {
              iconTheme: { primary: '#4ade80', secondary: '#18181B' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#18181B' },
            },
          }}
        />
      </body>
    </html>
  )
}
