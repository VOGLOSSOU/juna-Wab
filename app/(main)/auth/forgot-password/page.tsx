'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { forgotPassword } from '@/lib/api/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Adresse email invalide')
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      // Le backend renvoie toujours 200, même si l'email n'existe pas
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">

        <div className="flex flex-col items-center gap-3">
          <Image src="/juna-logo.png" alt="Juna Eats" width={64} height={64} className="object-contain" />
          <h1 className="text-headline-large font-semibold text-text-primary">Mot de passe oublié</h1>
          <p className="text-text-secondary text-sm text-center">
            {sent
              ? "Vérifiez votre boîte mail."
              : "Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe."}
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Si un compte existe pour <strong className="text-text-primary">{email}</strong>, vous recevrez un lien de réinitialisation sous peu. Pensez à vérifier vos spams.
            </p>
            <Link href="/auth/login" className="w-full">
              <Button variant="primary" size="lg" className="w-full">
                Retour à la connexion
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">
                Adresse email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="vous@exemple.com"
                className="h-11 px-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                autoFocus
              />
            </div>

            <Button variant="primary" size="lg" className="w-full" loading={loading} onClick={handleSubmit}>
              Envoyer le lien
            </Button>

            <p className="text-center text-sm text-text-secondary">
              <Link href="/auth/login" className="text-primary font-medium hover:underline">
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
