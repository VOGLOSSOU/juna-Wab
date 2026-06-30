'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { getApiErrorCode, showApiError } from '@/lib/utils/api-error'
import { Button } from '@/components/ui/button'
import { sendVerificationCode, verifyCode } from '@/lib/api/auth'

type ScreenState = 'otp' | 'success'

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [screen, setScreen] = useState<ScreenState>('otp')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [verifying, setVerifying] = useState(false)
  const [sending, setSending] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(600)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (!email) { router.push('/auth/login'); return }
    // Envoyer automatiquement le code à l'arrivée
    sendVerificationCode(email).catch(() => {})
    setResendCooldown(60)
    setTimeout(() => otpRefs.current[0]?.focus(), 100)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (screen !== 'otp') return
    const interval = setInterval(() => {
      setOtpCountdown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [screen])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = v
    setOtp(next)
    if (v && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Entrez le code complet'); return }
    setVerifying(true)
    try {
      await verifyCode(email, code)
      setScreen('success')
    } catch (err: unknown) {
      if (getApiErrorCode(err) === 'INVALID_TOKEN') {
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      }
      showApiError(err)
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setSending(true)
    try {
      await sendVerificationCode(email)
      setOtp(['', '', '', '', '', ''])
      setOtpCountdown(600)
      setResendCooldown(60)
      toast.success('Nouveau code envoyé !')
      otpRefs.current[0]?.focus()
    } catch (err: unknown) {
      showApiError(err)
      if (getApiErrorCode(err) === 'TOO_MANY_REQUESTS') setResendCooldown(600)
    } finally {
      setSending(false)
    }
  }

  if (screen === 'success') {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <path d="M9 12l2 2 4-4"/>
            <path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4L2 12l3-3V5h4l3-3z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-1">Email vérifié !</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Votre adresse <strong>{email}</strong> a été vérifiée avec succès.
            Reconnectez-vous pour accéder à votre compte.
          </p>
        </div>
        <Link href="/auth/login" className="w-full">
          <Button variant="primary" size="lg" className="w-full">
            Se connecter
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-primary">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        <p className="text-sm text-text-secondary">
          Un code a été envoyé à <strong className="text-text-primary">{email}</strong>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-text-primary text-center">Code à 6 chiffres</label>
        <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { otpRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              className={`w-11 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:border-primary transition-colors ${
                digit ? 'border-primary bg-primary-surface text-primary' : 'border-border bg-white text-text-primary'
              }`}
              style={{ height: '52px' }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>
          {otpCountdown > 0
            ? <>Code valable <strong className={otpCountdown < 60 ? 'text-error' : 'text-text-primary'}>{formatCountdown(otpCountdown)}</strong></>
            : <span className="text-error">Code expiré</span>
          }
        </span>
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || sending}
          className="text-primary font-medium hover:underline disabled:text-text-light disabled:no-underline"
        >
          {resendCooldown > 0 ? `Renvoyer (${resendCooldown > 60 ? formatCountdown(resendCooldown) : `${resendCooldown}s`})` : 'Renvoyer le code'}
        </button>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        loading={verifying}
        disabled={otp.join('').length !== 6 || otpCountdown === 0}
        onClick={handleVerify}
      >
        Vérifier
      </Button>

      <p className="text-center text-xs text-text-secondary">
        {"Mauvais email ? "}
        <Link href="/auth/login" className="text-primary hover:underline font-medium">
          Retour à la connexion
        </Link>
      </p>
    </div>
  )
}

export default function VerifyEmailClient() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">
        <div className="flex justify-center">
          <Image src="/juna-logo.png" alt="JUNA EATS" width={64} height={64} className="object-contain" />
        </div>
        <div className="text-center">
          <h1 className="text-headline-large font-semibold text-text-primary">Vérifiez votre email</h1>
          <p className="text-text-secondary text-sm mt-1">{"Pour continuer, confirmez votre adresse email."}</p>
        </div>
        <VerifyEmailContent />
      </div>
    </div>
  )
}
