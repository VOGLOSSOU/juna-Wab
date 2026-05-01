import type { Metadata } from 'next'
import { Suspense } from 'react'
import VerifyEmailClient from './_verify-email-client'

export const metadata: Metadata = {
  title: 'Juna - Vérification de votre email',
  description: 'Confirmez votre adresse email pour accéder à votre compte Juna.',
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailClient />
    </Suspense>
  )
}
