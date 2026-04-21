'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createReview } from '@/lib/api/reviews'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/ui/star-rating'
import toast from 'react-hot-toast'

function NewReviewForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') ?? ''
  const subscriptionId = searchParams.get('subscriptionId') ?? ''
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!rating) { toast.error('Choisissez une note'); return }
    if (!orderId || !subscriptionId) { toast.error('Informations manquantes'); return }
    setLoading(true)
    try {
      await createReview({ orderId, subscriptionId, rating, comment: comment || undefined })
      toast.success('Avis publié !')
      router.push('/profile/orders')
    } catch {
      toast.error('Erreur lors de la publication.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12 flex flex-col gap-6">
      <h1 className="text-headline-large font-semibold">Laisser un avis</h1>

      <div className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
        <div>
          <p className="font-medium text-sm mb-3">Votre note</p>
          <StarRating value={rating} readOnly={false} onChange={setRating} size={32} />
        </div>

        <div>
          <label className="font-medium text-sm block mb-2">Commentaire (optionnel)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={!rating}>
          Publier mon avis
        </Button>
      </div>
    </div>
  )
}

export default function NewReviewPage() {
  return (
    <Suspense>
      <NewReviewForm />
    </Suspense>
  )
}
