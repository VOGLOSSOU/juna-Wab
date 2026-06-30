import type { Metadata } from 'next'
import LoginClient from './_login-client'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre compte Juna pour accéder à vos abonnements repas et suivre vos commandes.',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <LoginClient />
}
