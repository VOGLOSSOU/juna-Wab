import { Suspense } from 'react'
import { CheckoutForm } from './_checkout-client'

export default function CheckoutPage() {
  return <Suspense fallback={<p className="p-8 text-center">Chargement...</p>}><CheckoutForm /></Suspense>
}
