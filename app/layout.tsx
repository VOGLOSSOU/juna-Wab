import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: {
    default: 'Vos repas, livrés par abonnement — JUNA',
    template: '%s — JUNA',
  },
  description: 'Découvrez et abonnez-vous aux meilleurs plans repas en Afrique de l\'Ouest. Traiteurs locaux, livraison à domicile ou retrait sur place.',
  keywords: 'abonnement repas, nourriture, Bénin, Côte d\'Ivoire, livraison, traiteur, JUNA',
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '14px',
            },
            success: { style: { borderLeft: '4px solid #1A5C2A' } },
            error:   { style: { borderLeft: '4px solid #D32F2F' } },
          }}
        />
      </body>
    </html>
  )
}
