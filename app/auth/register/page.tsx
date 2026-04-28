import type { Metadata } from 'next'
import RegisterClient from './_register-client'

export const metadata: Metadata = {
  title: 'Juna - Créez votre compte gratuitement',
  description: 'Inscrivez-vous sur Juna et abonnez-vous à vos restos préférés. Paiement Mobile Money, livraison ou retrait — simple et sans engagement.',
  keywords: 'inscription Juna, créer un compte, s\'inscrire, abonnement repas, compte gratuit, Juna App',
  openGraph: {
    title: 'Juna - Créez votre compte gratuitement',
    description: 'Inscrivez-vous sur Juna et abonnez-vous à vos restos préférés. Paiement Mobile Money, livraison ou retrait — simple et sans engagement.',
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
}

export default function RegisterPage() {
  return <RegisterClient />
}
