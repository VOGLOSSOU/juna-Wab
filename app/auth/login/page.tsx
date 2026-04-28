import type { Metadata } from 'next'
import LoginClient from './_login-client'

export const metadata: Metadata = {
  title: 'Juna - Connectez-vous à votre compte',
  description: 'Accédez à vos abonnements repas, suivez vos commandes et gérez votre profil sur Juna.',
  keywords: 'connexion Juna, se connecter, compte Juna, abonnement repas, accès compte',
  openGraph: {
    title: 'Juna - Connectez-vous à votre compte',
    description: 'Accédez à vos abonnements repas, suivez vos commandes et gérez votre profil sur Juna.',
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
}

export default function LoginPage() {
  return <LoginClient />
}
