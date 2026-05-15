'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { sendVerificationCode, verifyCode, register as registerUser, updateLocation } from '@/lib/api/auth'
import { getApiErrorCode, showApiError } from '@/lib/utils/api-error'
import { useAuthStore } from '@/lib/store/auth'
import { useCityStore } from '@/lib/store/city'
import { getCountries, getCities } from '@/lib/api/geo'
import type { Country, City } from '@/types'

type Step = 'city' | 'email' | 'otp' | 'form'

const formSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Minimum 8 caractères')
    .regex(/[A-Z]/, 'Au moins une lettre majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof formSchema>

function countryName(c: Country): string {
  return c.translations?.fr ?? c.translations?.en ?? c.code
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function RegisterClient() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { selectedCity, setCity } = useCityStore()

  const [step, setStep] = useState<Step>('email')
  const [needsCityStep, setNeedsCityStep] = useState(false)
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)

  // City step state
  const [geoStep, setGeoStep] = useState<'country' | 'city'>('country')
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoSearch, setGeoSearch] = useState('')

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })
  const passwordValue = watch('password') ?? ''

  // On mount: if no city cached, show city picker first
  useEffect(() => {
    if (!selectedCity) {
      setStep('city')
      setNeedsCityStep(true)
      getCountries().then(setCountries).catch(console.error)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── City step ──
  const handleSelectCountry = async (country: Country) => {
    setSelectedCountry(country)
    setGeoLoading(true)
    setGeoSearch('')
    try {
      const data = await getCities(country.code)
      setCities(data)
      setGeoStep('city')
    } catch {
      toast.error('Erreur lors du chargement des villes')
    } finally {
      setGeoLoading(false)
    }
  }

  const handleSelectCity = (city: City) => {
    if (selectedCountry) {
      setCity(city, selectedCountry)
      setStep('email')
    }
  }

  const filteredCountries = countries.filter(c =>
    countryName(c).toLowerCase().includes(geoSearch.toLowerCase())
  )
  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(geoSearch.toLowerCase())
  )

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
      showApiError(err)
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
      const errorCode = getApiErrorCode(err)
      if (errorCode === 'INVALID_TOKEN') {
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
      toast.success('Bienvenue !')
      const cityToSave = useCityStore.getState().selectedCity
      if (cityToSave) {
        setSetupLoading(true)
        await updateLocation(cityToSave.id).catch(() => {})
      }
      router.push('/')
    } catch (err: unknown) {
      if (getApiErrorCode(err) === 'TOKEN_EXPIRED') setStep('email')
      showApiError(err)
    }
  }

  // ── Stepper ──
  const allSteps = needsCityStep
    ? ['Ville', 'Email', 'Vérification', 'Compte']
    : ['Email', 'Vérification', 'Compte']

  const stepIndex = needsCityStep
    ? (step === 'city' ? 0 : step === 'email' ? 1 : step === 'otp' ? 2 : 3)
    : (step === 'email' ? 0 : step === 'otp' ? 1 : 2)

  const stepTitle: Record<Step, string> = {
    city: 'Votre ville',
    email: 'Créer un compte',
    otp: 'Vérification email',
    form: 'Finaliser le compte',
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      {setupLoading && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center gap-4">
          <style>{`
            @keyframes juna-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(0.85); opacity: 0.7; }
            }
            .animate-juna-pulse { animation: juna-pulse 700ms ease-in-out infinite; }
          `}</style>
          <Image src="/juna-logo.png" alt="JUNA" width={72} height={72} className="object-contain animate-juna-pulse" />
          <p className="text-sm text-text-secondary">Configuration en cours…</p>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 flex flex-col gap-6">

        <div className="flex flex-col items-center gap-3">
          <Image src="/juna-logo.png" alt="JUNA" width={64} height={64} className="object-contain" />
          <h1 className="text-headline-large font-semibold text-text-primary">{stepTitle[step]}</h1>
        </div>

        {/* Stepper */}
        <div className="flex flex-col gap-1">
          {/* Rangée cercles + lignes */}
          <div className="flex items-center">
            {allSteps.map((label, i) => (
              <Fragment key={i}>
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
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
                {i < allSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />
                )}
              </Fragment>
            ))}
          </div>
          {/* Rangée labels */}
          <div className="flex">
            {allSteps.map((label, i) => (
              <Fragment key={i}>
                <div className="w-7 shrink-0 flex justify-center overflow-visible">
                  <span className={`text-[10px] font-medium text-center whitespace-nowrap ${i === stepIndex ? 'text-primary' : 'text-text-light'}`}>
                    {label}
                  </span>
                </div>
                {i < allSteps.length - 1 && <div className="flex-1" />}
              </Fragment>
            ))}
          </div>
        </div>

        {/* ── ÉTAPE 0 : Ville ── */}
        {step === 'city' && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-text-secondary text-center">
              {geoStep === 'country'
                ? 'Choisissez votre pays pour voir les prestataires disponibles près de chez vous.'
                : `Quelle ville en ${selectedCountry ? countryName(selectedCountry) : ''} ?`}
            </p>

            {geoStep === 'city' && (
              <button
                onClick={() => { setGeoStep('country'); setGeoSearch('') }}
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Changer de pays
              </button>
            )}

            <div className="relative">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                placeholder={geoStep === 'country' ? 'Rechercher un pays...' : 'Rechercher une ville...'}
                value={geoSearch}
                onChange={e => setGeoSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface-grey text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
              />
            </div>

            {geoLoading ? (
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 bg-surface-grey rounded-xl animate-pulse" />
                ))}
              </div>
            ) : geoStep === 'country' ? (
              filteredCountries.length === 0 ? (
                <p className="text-center text-text-secondary text-sm py-4">Aucun pays trouvé</p>
              ) : (
                <ul className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1">
                  {filteredCountries.map(country => (
                    <li key={country.id}>
                      <button
                        onClick={() => handleSelectCountry(country)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary-surface text-left transition-colors group"
                      >
                        <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                          {country.flag && <span className="mr-2">{country.flag}</span>}
                          {countryName(country)}
                        </span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" className="group-hover:stroke-primary transition-colors">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              filteredCities.length === 0 ? (
                <p className="text-center text-text-secondary text-sm py-4">Aucune ville trouvée</p>
              ) : (
                <ul className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1">
                  {filteredCities.map(city => (
                    <li key={city.id}>
                      <button
                        onClick={() => handleSelectCity(city)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary-surface text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-surface-grey flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" className="group-hover:stroke-primary transition-colors">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors">{city.name}</span>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" className="group-hover:stroke-primary transition-colors">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}

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
                {resendCooldown > 0 ? `Renvoyer (${resendCooldown > 60 ? formatCountdown(resendCooldown) : `${resendCooldown}s`})` : 'Renvoyer le code'}
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
              error={errors.phone?.message}
              {...register('phone')}
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 8 caractères"
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
              {passwordValue.length > 0 && (
                <div className="flex flex-col gap-1 pl-1">
                  {[
                    { label: 'Au moins 8 caractères', met: passwordValue.length >= 8 },
                    { label: 'Au moins une majuscule', met: /[A-Z]/.test(passwordValue) },
                    { label: 'Au moins un chiffre', met: /[0-9]/.test(passwordValue) },
                  ].map(({ label, met }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={met ? '#1A5C2A' : '#AAAAAA'} strokeWidth="3">
                        {met
                          ? <polyline points="20 6 9 17 4 12"/>
                          : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                        }
                      </svg>
                      <span className={`text-xs transition-colors ${met ? 'text-primary font-medium' : 'text-text-light'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Input
              label="Confirmer le mot de passe"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Répétez votre mot de passe"
              error={errors.confirmPassword?.message}
              required
              rightIcon={
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-text-light hover:text-text-secondary">
                  {showConfirmPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              }
              {...register('confirmPassword')}
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
