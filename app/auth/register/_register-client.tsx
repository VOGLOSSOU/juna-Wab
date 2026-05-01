'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendVerificationCode, verifyCode, register as registerUser } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth'

type Step = 'email' | 'otp' | 'form'

const formSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Minimum 6 caractères'),
})
type FormData = z.infer<typeof formSchema>

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function RegisterClient() {
  const router = useRouter()
  const { setAuth } = useAuthStore()

  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [verifiedToken, setVerifiedToken] = useState('')

  // Step 1
  const [emailInput, setEmailInput] = useState('')
  const [sending, setSending] = useState(false)

  // Step 2
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const [verifying, setVerifying] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(600)
  const [resendCooldown, setResendCooldown] = useState(60)

  // Step 3
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Countdown 10 min OTP
  useEffect(() => {
    if (step !== 'otp') return
    const interval = setInterval(() => {
      setOtpCountdown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [step])

  // Cooldown renvoi
  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown(c => Math.max(0, c - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  // ── Étape 1 : envoi du code ──
  const handleSendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      toast.error('Adresse email invalide')
      return
    }
    setSending(true)
    try {
      await sendVerificationCode(emailInput)
      setEmail(emailInput)
      setOtp(['', '', '', '', '', ''])
      setOtpCountdown(600)
      setResendCooldown(60)
      setStep('otp')
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      if (code === 'RATE_LIMIT') {
        toast.error('Trop de demandes. Attendez avant de réessayer.')
      } else {
        toast.error("Impossible d'envoyer le code. Réessayez.")
      }
    } finally {
      setSending(false)
    }
  }

  // ── Étape 2 : vérification OTP ──
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
      const next = pasted.split('')
      setOtp(next)
      otpRefs.current[5]?.focus()
    }
  }

  const handleVerifyCode = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      toast.error('Entrez le code à 6 chiffres complet')
      return
    }
    setVerifying(true)
    try {
      const result = await verifyCode(email, code)
      setVerifiedToken(result.verifiedToken)
      setStep('form')
    } catch (err: unknown) {
      const errorCode = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      if (errorCode === 'TOKEN_EXPIRED') {
        toast.error('Code expiré. Renvoyez un nouveau code.')
      } else if (errorCode === 'INVALID_TOKEN') {
        toast.error('Code incorrect. Vérifiez et réessayez.')
        setOtp(['', '', '', '', '', ''])
        otpRefs.current[0]?.focus()
      } else if (errorCode === 'RATE_LIMIT') {
        toast.error('Trop de tentatives. Réessayez plus tard.')
      } else {
        toast.error('Erreur de vérification. Réessayez.')
      }
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
    } catch {
      toast.error("Impossible d'envoyer le code. Réessayez.")
    } finally {
      setSending(false)
    }
  }

  // ── Étape 3 : inscription ──
  const onSubmit = async (data: FormData) => {
    try {
      const result = await registerUser({
        email,
        verifiedToken,
        name: data.name,
        password: data.password,
        ...(data.phone ? { phone: data.phone } : {}),
      })
      setAuth(result.user, result.accessToken, result.refreshToken)
      toast.success('Compte créé avec succès !')
      router.push('/')
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      if (code === 'EMAIL_ALREADY_EXISTS') {
        toast.error('Cet email est déjà utilisé. Connectez-vous.')
      } else if (code === 'PHONE_ALREADY_EXISTS') {
        toast.error('Ce numéro de téléphone est déjà utilisé.')
      } else if (code === 'TOKEN_EXPIRED') {
        toast.error('Session expirée. Recommencez depuis le début.')
        setStep('email')
      } else {
        toast.error('Une erreur est survenue. Réessayez.')
      }
    }
  }

  // ── Indicateur d'étapes ──
  const steps = ['Email', 'Vérification', 'Compte']
  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">

        <div className="flex flex-col items-center gap-3">
          <Image src="/logo_green_orange.png" alt="JUNA" width={80} height={32} className="object-contain" />
          <h1 className="text-headline-large font-semibold text-text-primary">
            {step === 'email' && 'Créer un compte'}
            {step === 'otp' && 'Vérification email'}
            {step === 'form' && 'Finaliser le compte'}
          </h1>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-0">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  i < stepIndex ? 'bg-primary text-white' :
                  i === stepIndex ? 'bg-primary text-white ring-4 ring-primary/20' :
                  'bg-surface-grey text-text-light'
                }`}>
                  {i < stepIndex ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${i === stepIndex ? 'text-primary' : 'text-text-light'}`}>{label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-full mb-5 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── ÉTAPE 1 : Email ── */}
        {step === 'email' && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">
                Adresse email <span className="text-error">*</span>
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                placeholder="vous@exemple.com"
                className="h-11 px-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                autoFocus
              />
              <p className="text-xs text-text-secondary">Nous vous enverrons un code de vérification à 6 chiffres.</p>
            </div>
            <Button variant="primary" size="lg" className="w-full" loading={sending} onClick={handleSendCode}>
              Recevoir le code
            </Button>
          </div>
        )}

        {/* ── ÉTAPE 2 : OTP ── */}
        {step === 'otp' && (
          <div className="flex flex-col gap-5">
            <div className="bg-surface-grey rounded-xl px-4 py-3 text-sm text-center">
              Code envoyé à <strong className="text-text-primary">{email}</strong>
              <button
                onClick={() => setStep('email')}
                className="ml-2 text-primary hover:underline text-xs"
              >
                Modifier
              </button>
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
                    className={`w-11 h-13 text-center text-lg font-bold border-2 rounded-xl focus:outline-none focus:border-primary transition-colors ${
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
                className="text-primary font-medium hover:underline disabled:text-text-light disabled:no-underline transition-colors"
              >
                {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
              </button>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={verifying}
              disabled={otp.join('').length !== 6 || otpCountdown === 0}
              onClick={handleVerifyCode}
            >
              Vérifier le code
            </Button>
          </div>
        )}

        {/* ── ÉTAPE 3 : Formulaire ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Email verrouillé */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-primary">Adresse email</label>
              <div className="h-11 px-4 rounded-xl border border-border bg-surface-grey flex items-center gap-2 text-sm text-text-secondary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary flex-shrink-0">
                  <path d="M9 12l2 2 4-4"/><path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4L2 12l3-3V5h4l3-3z"/>
                </svg>
                <span className="text-text-primary font-medium">{email}</span>
                <span className="ml-auto text-xs text-primary">Vérifié</span>
              </div>
            </div>

            <Input
              label="Nom complet"
              type="text"
              placeholder="Votre prénom et nom"
              error={errors.name?.message}
              required
              {...register('name')}
            />

            <Input
              label="Téléphone"
              type="tel"
              placeholder="+229 61 00 00 00"
              hint="Optionnel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 caractères"
              error={errors.password?.message}
              required
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-light hover:text-text-secondary">
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              }
              {...register('password')}
            />

            <Button type="submit" variant="primary" size="lg" loading={isSubmitting} className="w-full mt-2">
              {"Créer mon compte"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-text-secondary">
          {"Déjà un compte ? "}
          <Link href="/auth/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </p>

        {step === 'form' && (
          <p className="text-center text-xs text-text-light leading-relaxed">
            {"En créant un compte, vous reconnaissez avoir pris connaissance de nos "}
            <Link href="/privacy" className="underline hover:text-text-secondary">politique de confidentialité</Link>
            {", "}
            <Link href="/terms" className="underline hover:text-text-secondary">{"conditions d'utilisation"}</Link>
            {" et "}
            <Link href="/sales-terms" className="underline hover:text-text-secondary">conditions de vente</Link>
            .
          </p>
        )}
      </div>
    </div>
  )
}
