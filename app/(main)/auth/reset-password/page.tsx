'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { showApiError } from '@/lib/utils/api-error'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPassword } from '@/lib/api/auth'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-text-secondary">Lien invalide ou expiré. Refaites une demande de réinitialisation.</p>
        <Link href="/auth/forgot-password">
          <Button variant="primary">Réinitialiser mon mot de passe</Button>
        </Link>
      </div>
    )
  }

  const criteria = [
    { label: 'Au moins 8 caractères', met: password.length >= 8 },
    { label: 'Maximum 128 caractères', met: password.length <= 128 && password.length > 0 },
    { label: 'Au moins une majuscule', met: /[A-Z]/.test(password) },
    { label: 'Au moins un chiffre',   met: /[0-9]/.test(password) },
  ]
  const passwordValid = criteria.every(c => c.met)

  const handleSubmit = async () => {
    if (!passwordValid) {
      toast.error('Le mot de passe ne respecte pas les critères requis')
      return
    }
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
    } catch (err: unknown) {
      showApiError(err)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div>
          <p className="font-semibold text-text-primary mb-1">Mot de passe mis à jour !</p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Votre mot de passe a été réinitialisé avec succès. Connectez-vous avec votre nouveau mot de passe.
          </p>
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/auth/login')}>
          Se connecter
        </Button>
      </div>
    )
  }

  const EyeIcon = ({ visible }: { visible: boolean }) => visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Nouveau mot de passe"
        type={showPassword ? 'text' : 'password'}
        placeholder="Minimum 8 caractères"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        rightIcon={
          <button type="button" onClick={() => setShowPassword(v => !v)} className="text-text-light hover:text-text-secondary">
            <EyeIcon visible={showPassword} />
          </button>
        }
      />

      {/* Indicateur de force temps réel */}
      {password.length > 0 && (
        <div className="flex flex-col gap-1.5 -mt-1">
          {criteria.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className={`text-xs font-bold ${c.met ? 'text-success' : 'text-error'}`}>
                {c.met ? '✓' : '✗'}
              </span>
              <span className={`text-xs ${c.met ? 'text-success' : 'text-text-secondary'}`}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <Input
        label="Confirmer le mot de passe"
        type={showConfirm ? 'text' : 'password'}
        placeholder="Répétez le mot de passe"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        required
        rightIcon={
          <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-text-light hover:text-text-secondary">
            <EyeIcon visible={showConfirm} />
          </button>
        }
      />
      {confirm && password !== confirm && (
        <p className="text-xs text-error -mt-2">Les mots de passe ne correspondent pas</p>
      )}
      <Button
        variant="primary"
        size="lg"
        className="w-full mt-2"
        loading={loading}
        onClick={handleSubmit}
      >
        Réinitialiser le mot de passe
      </Button>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <Image src="/juna-logo.png" alt="JUNA EATS" width={64} height={64} className="object-contain" />
          <h1 className="text-headline-large font-semibold text-text-primary">Nouveau mot de passe</h1>
          <p className="text-text-secondary text-sm text-center">
            Choisissez un mot de passe sécurisé pour votre compte.
          </p>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
