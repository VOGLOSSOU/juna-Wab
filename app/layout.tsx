import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: {
    default: 'Mange mieux. Sans y penser. , JUNA',
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
