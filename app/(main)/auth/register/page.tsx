import type { Metadata } from 'next'
import RegisterClient from './_register-client'

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Inscrivez-vous sur Juna et abonnez-vous aux meilleurs traiteurs locaux près de chez vous.',
  robots: { index: false, follow: false },
}

export default function RegisterPage() {
  return <RegisterClient />
}
