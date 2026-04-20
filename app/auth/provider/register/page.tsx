'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { useAuthStore } from '@/lib/store/auth'
import { registerProvider, getProviderProfile } from '@/lib/api/auth'
import { getCountries, getCities, getLandmarks } from '@/lib/api/geo'
import { uploadImage } from '@/lib/api/upload'
import type { Country, City, Landmark } from '@/types'
import toast from 'react-hot-toast'

// ─── Types locaux ────────────────────────────────────────────
interface DeliveryZone { city: string; country: string; cost: number }

// ─── Composants utilitaires ──────────────────────────────────
const inputClass = "w-full h-11 px-4 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50"

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">
        {label} {required && <span className="text-error">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-text-light">{hint}</p>}
    </div>
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ['Informations', 'Localisation', 'Services', 'Récapitulatif']
  return (
    <div className="flex items-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              i + 1 < current ? 'bg-primary text-white' :
              i + 1 === current ? 'bg-primary text-white ring-4 ring-primary/20' :
              'bg-surface-grey text-text-light'
            }`}>
              {i + 1 < current ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i + 1 === current ? 'text-primary' : 'text-text-light'}`}>
              {labels[i]}
            </span>
          </div>
          {i < total - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${i + 1 < current ? 'bg-primary' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────
export default function ProviderRegisterPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const { logout } = useAuthStore()
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [providerStatus, setProviderStatus] = useState<string | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Étape 1 — Infos de base
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const logoInputRef = useRef<HTMLInputElement>(null)

  // Étape 2 — Localisation
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [landmarks, setLandmarks] = useState<Landmark[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedLandmarkIds, setSelectedLandmarkIds] = useState<string[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingLandmarks, setLoadingLandmarks] = useState(false)

  // Étape 3 — Services
  const [acceptsDelivery, setAcceptsDelivery] = useState(false)
  const [acceptsPickup, setAcceptsPickup] = useState(false)
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([])
  const [zoneCity, setZoneCity] = useState('')
  const [zoneCountry, setZoneCountry] = useState('')
  const [zoneCost, setZoneCost] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docUrl, setDocUrl] = useState('')
  const [docUploading, setDocUploading] = useState(false)
  const docInputRef = useRef<HTMLInputElement>(null)

  if (!hydrated || !isAuthenticated) return null

  // ── Handlers logo ──
  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setLogoUploading(true)
    try {
      const url = await uploadImage('providers', file)
      setLogoUrl(url)
      toast.success('Logo uploadé')
    } catch {
      toast.error('Erreur lors de l\'upload du logo')
      setLogoFile(null); setLogoPreview(null)
    } finally {
      setLogoUploading(false)
    }
  }

  // ── Handlers localisation ──
  async function handleCountrySelect(country: Country) {
    setSelectedCountry(country)
    setSelectedCity(null)
    setLandmarks([])
    setSelectedLandmarkIds([])
    setZoneCountry(country.code)
    setLoadingCities(true)
    try {
      const data = await getCities(country.code)
      setCities(data)
    } catch {
      toast.error('Impossible de charger les villes')
    } finally {
      setLoadingCities(false)
    }
  }

  async function handleCitySelect(city: City) {
    setSelectedCity(city)
    setSelectedLandmarkIds([])
    setLoadingLandmarks(true)
    try {
      const data = await getLandmarks(city.id)
      setLandmarks(data)
    } catch {
      setLandmarks([])
    } finally {
      setLoadingLandmarks(false)
    }
  }

  function toggleLandmark(id: string) {
    setSelectedLandmarkIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  // ── Handlers zones livraison ──
  function addDeliveryZone() {
    if (!zoneCity.trim() || !zoneCountry || !zoneCost) {
      toast.error('Remplissez tous les champs de la zone')
      return
    }
    const cost = Number(zoneCost)
    if (isNaN(cost) || cost < 0) { toast.error('Coût invalide'); return }
    setDeliveryZones(prev => [...prev, { city: zoneCity.trim(), country: zoneCountry, cost }])
    setZoneCity(''); setZoneCost('')
  }

  function removeDeliveryZone(i: number) {
    setDeliveryZones(prev => prev.filter((_, idx) => idx !== i))
  }

  // ── Handler document ──
  async function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDocFile(file)
    setDocUploading(true)
    try {
      const url = await uploadImage('documents', file)
      setDocUrl(url)
      toast.success('Document uploadé')
    } catch {
      toast.error('Erreur lors de l\'upload du document')
      setDocFile(null)
    } finally {
      setDocUploading(false)
    }
  }

  // ── Validations par étape ──
  function canGoStep2() {
    return logoUrl && businessName.trim().length >= 2 && businessAddress.trim().length >= 3
  }

  function canGoStep3() {
    return !!selectedCity
  }

  function canGoStep4() {
    if (!acceptsDelivery && !acceptsPickup) return false
    if (acceptsDelivery && deliveryZones.length === 0) return false
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      await registerProvider({
        businessName: businessName.trim(),
        description: description.trim() || undefined,
        businessAddress: businessAddress.trim(),
        logo: logoUrl,
        cityId: selectedCity!.id,
        acceptsDelivery,
        acceptsPickup,
        ...(acceptsDelivery && { deliveryZones }),
        ...(selectedLandmarkIds.length > 0 && { landmarkIds: selectedLandmarkIds }),
        ...(docUrl && { documentUrl: docUrl }),
      })
      setSubmitted(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(typeof msg === 'string' ? msg : 'Erreur lors de l\'inscription')
    } finally {
      setSubmitting(false)
    }
  }

  async function checkStatus() {
    setCheckingStatus(true)
    try {
      const provider = await getProviderProfile()
      setProviderStatus(provider.status ?? 'PENDING')
      if (provider.status === 'APPROVED') {
        toast.success('Votre compte est approuvé ! Reconnectez-vous.')
      } else if (provider.status === 'REJECTED') {
        toast.error('Votre demande a été refusée.')
      } else {
        toast('Toujours en attente de validation.', { icon: '⏳' })
      }
    } catch {
      toast.error('Impossible de vérifier le statut')
    } finally {
      setCheckingStatus(false)
    }
  }

  // ─── Écran PENDING post-soumission ───────────────────────
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-surface flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="1.8">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-text-primary">Demande envoyée !</h2>
          <p className="text-text-secondary mt-2 leading-relaxed">
            Votre dossier prestataire est en cours d'examen. L'équipe JUNA vous contactera après validation.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-border p-5 w-full text-left flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
              providerStatus === 'APPROVED' ? 'bg-success' :
              providerStatus === 'REJECTED' ? 'bg-error' :
              'bg-warning'
            }`} />
            <p className="text-sm font-medium">
              Statut : {
                providerStatus === 'APPROVED' ? 'Approuvé' :
                providerStatus === 'REJECTED' ? 'Refusé' :
                'En attente de validation'
              }
            </p>
          </div>
          {providerStatus !== 'APPROVED' && (
            <p className="text-xs text-text-secondary">
              Aucune notification automatique — utilisez le bouton ci-dessous pour vérifier.
            </p>
          )}
        </div>

        {providerStatus === 'APPROVED' ? (
          <button
            onClick={() => { logout(); router.push('/auth/login') }}
            className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors"
          >
            Se reconnecter pour accéder au dashboard
          </button>
        ) : (
          <button
            onClick={checkStatus}
            disabled={checkingStatus}
            className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {checkingStatus ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Vérification...
              </>
            ) : 'Vérifier le statut de ma demande'}
          </button>
        )}

        <button onClick={() => router.push('/')} className="text-sm text-text-secondary hover:text-primary transition-colors">
          Retourner à l'accueil
        </button>
      </div>
    )
  }

  // ─── Formulaire multi-step ────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Devenir prestataire</h1>
        <p className="text-text-secondary text-sm mt-1">Proposez vos repas par abonnement sur JUNA.</p>
      </div>

      <StepIndicator current={step} total={4} />

      {/* ══ ÉTAPE 1 — Informations de base ══ */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-text-primary mb-5">Votre établissement</h2>

            {/* Logo */}
            <Field label="Logo de votre établissement" required hint="JPG, PNG ou WEBP · max 5 Mo">
              <div className="flex items-center gap-4">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-surface-grey flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary-surface transition-colors overflow-hidden flex-shrink-0"
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                  ) : logoUploading ? (
                    <svg className="animate-spin text-primary" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={logoUploading}
                    className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors disabled:opacity-50"
                  >
                    {logoPreview ? 'Changer le logo' : 'Choisir un fichier'}
                  </button>
                  {logoUrl && (
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Logo uploadé
                    </p>
                  )}
                </div>
                <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
              </div>
            </Field>

            <div className="h-px bg-divider my-5" />

            <div className="flex flex-col gap-4">
              <Field label="Nom de l'établissement" required>
                <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)}
                  placeholder="Ex: Chez Mariam" className={inputClass} />
              </Field>

              <Field label="Description" hint="Parlez de votre cuisine, votre style, votre histoire...">
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="Restaurant spécialisé en cuisine africaine traditionnelle..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors resize-none"
                />
              </Field>

              <Field label="Adresse de l'établissement" required>
                <input type="text" value={businessAddress} onChange={e => setBusinessAddress(e.target.value)}
                  placeholder="Ex: Rue 234, Quartier Cadjehoun" className={inputClass} />
              </Field>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!canGoStep2()}
            className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            Continuer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      )}

      {/* ══ ÉTAPE 2 — Localisation ══ */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-text-primary mb-5">Votre localisation</h2>

            <div className="flex flex-col gap-5">
              {/* Pays */}
              <Field label="Pays" required>
                <div className="flex flex-wrap gap-2">
                  {countries.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => getCountries().then(setCountries).catch(() => toast.error('Erreur chargement pays'))}
                      className="h-10 px-4 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary-surface transition-colors flex items-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                      Charger les pays
                    </button>
                  ) : (
                    countries.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleCountrySelect(c)}
                        className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors ${
                          selectedCountry?.id === c.id
                            ? 'bg-primary text-white'
                            : 'bg-surface-grey text-text-primary hover:bg-border'
                        }`}
                      >
                        {c.flag && <span className="mr-1.5">{c.flag}</span>}
                        {c.translations?.fr ?? c.translations?.en ?? c.code}
                      </button>
                    ))
                  )}
                </div>
              </Field>

              {/* Ville */}
              {selectedCountry && (
                <Field label="Ville" required>
                  {loadingCities ? (
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-10 w-24 bg-surface-grey rounded-xl animate-pulse" />)}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {cities.map(c => (
                        <button
                          key={c.id}
                          onClick={() => handleCitySelect(c)}
                          className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors ${
                            selectedCity?.id === c.id
                              ? 'bg-primary text-white'
                              : 'bg-surface-grey text-text-primary hover:bg-border'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </Field>
              )}

              {/* Landmarks */}
              {selectedCity && (
                <Field label="Points de retrait / zones de présence" hint="Ces points permettent à JUNA d'afficher votre établissement dans les recherches de votre ville.">
                  {loadingLandmarks ? (
                    <div className="flex gap-2">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-10 w-28 bg-surface-grey rounded-xl animate-pulse" />)}
                    </div>
                  ) : landmarks.length === 0 ? (
                    <p className="text-sm text-text-light">Aucun landmark disponible pour {selectedCity.name}.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {landmarks.map(lm => (
                        <button
                          key={lm.id}
                          onClick={() => toggleLandmark(lm.id)}
                          className={`h-10 px-4 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                            selectedLandmarkIds.includes(lm.id)
                              ? 'bg-primary text-white'
                              : 'bg-surface-grey text-text-primary hover:bg-border'
                          }`}
                        >
                          {selectedLandmarkIds.includes(lm.id) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                          {lm.name}
                        </button>
                      ))}
                    </div>
                  )}
                </Field>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors">
              Retour
            </button>
            <button onClick={() => setStep(3)} disabled={!canGoStep3()}
              className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              Continuer
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ══ ÉTAPE 3 — Services ══ */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-6">
            <h2 className="font-semibold text-text-primary mb-5">Vos services</h2>

            <div className="flex flex-col gap-5">
              {/* Toggles */}
              <Field label="Mode de service" required hint="Au moins un des deux est obligatoire.">
                <div className="flex flex-col gap-3">
                  {[
                    { value: acceptsDelivery, set: setAcceptsDelivery, label: 'Livraison à domicile', desc: 'Vous livrez vos clients à leur adresse', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
                    { value: acceptsPickup, set: setAcceptsPickup, label: 'Retrait sur place', desc: 'Le client vient récupérer sa commande chez vous', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                  ].map(({ value, set, label, desc, icon }) => (
                    <button key={label} type="button" onClick={() => set(!value)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        value ? 'border-primary bg-primary-surface' : 'border-border bg-white hover:bg-surface-grey'
                      }`}
                    >
                      <span className={value ? 'text-primary' : 'text-text-secondary'}>{icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${value ? 'text-primary' : 'text-text-primary'}`}>{label}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        value ? 'border-primary bg-primary' : 'border-border'
                      }`}>
                        {value && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>

              {/* Zones de livraison */}
              {acceptsDelivery && (
                <Field label="Zones de livraison" required hint="Ajoutez chaque ville où vous livrez et le coût correspondant.">
                  <div className="flex flex-col gap-3">
                    {/* Liste des zones ajoutées */}
                    {deliveryZones.length > 0 && (
                      <div className="flex flex-col gap-2">
                        {deliveryZones.map((zone, i) => (
                          <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-primary-surface rounded-xl">
                            <span className="text-sm font-medium text-primary flex-1">
                              {zone.city} · {zone.country} · <span className="font-semibold">{zone.cost} XOF</span>
                            </span>
                            <button onClick={() => removeDeliveryZone(i)} className="text-text-light hover:text-error transition-colors">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulaire ajout zone */}
                    <div className="flex flex-col gap-2 p-4 bg-surface-grey rounded-xl">
                      <p className="text-xs font-medium text-text-secondary mb-1">Ajouter une zone</p>
                      <div className="flex gap-2">
                        <input type="text" value={zoneCity} onChange={e => setZoneCity(e.target.value)}
                          placeholder="Ville (ex: Cotonou)" className={`${inputClass} flex-1`} />
                        <select value={zoneCountry} onChange={e => setZoneCountry(e.target.value)}
                          className={`${inputClass} w-24`}>
                          <option value="">Pays</option>
                          {countries.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.translations?.fr ?? c.code}
                            </option>
                          ))}
                          {countries.length === 0 && (
                            <>
                              <option value="BJ">Bénin</option>
                              <option value="CI">Côte d'Ivoire</option>
                              <option value="SN">Sénégal</option>
                              <option value="TG">Togo</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input type="number" value={zoneCost} onChange={e => setZoneCost(e.target.value)}
                          placeholder="Coût livraison (XOF)" className={`${inputClass} flex-1`} min="0" />
                        <button onClick={addDeliveryZone}
                          className="h-11 px-4 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-light transition-colors flex-shrink-0">
                          Ajouter
                        </button>
                      </div>
                    </div>
                  </div>
                </Field>
              )}

              {/* Document justificatif */}
              <Field label="Document justificatif" hint="Optionnel — registre de commerce, pièce d'identité, etc. Aide à accélérer la validation.">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => docInputRef.current?.click()} disabled={docUploading}
                    className="h-11 px-4 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors disabled:opacity-50 flex items-center gap-2">
                    {docUploading ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    )}
                    {docFile ? docFile.name : 'Choisir un fichier'}
                  </button>
                  {docUrl && (
                    <span className="text-xs text-success flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Uploadé
                    </span>
                  )}
                  <input ref={docInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleDocChange} />
                </div>
              </Field>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)}
              className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors">
              Retour
            </button>
            <button onClick={() => setStep(4)} disabled={!canGoStep4()}
              className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              Continuer
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ══ ÉTAPE 4 — Récapitulatif ══ */}
      {step === 4 && (
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="bg-primary-surface px-6 py-5 flex items-center gap-4">
              {logoPreview && (
                <img src={logoPreview} alt="logo" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div>
                <h2 className="font-bold text-lg text-primary">{businessName}</h2>
                {description && <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">{description}</p>}
              </div>
            </div>

            <div className="divide-y divide-divider">
              {[
                { label: 'Adresse', value: businessAddress },
                { label: 'Ville', value: `${selectedCity?.name}${selectedCountry ? ` · ${selectedCountry.translations?.fr ?? selectedCountry.code}` : ''}` },
                { label: 'Services', value: [acceptsDelivery && 'Livraison', acceptsPickup && 'Retrait sur place'].filter(Boolean).join(' + ') },
                ...(acceptsDelivery ? [{ label: `Zones de livraison (${deliveryZones.length})`, value: deliveryZones.map(z => `${z.city} — ${z.cost} XOF`).join(', ') }] : []),
                ...(selectedLandmarkIds.length > 0 ? [{ label: `Points (${selectedLandmarkIds.length})`, value: landmarks.filter(l => selectedLandmarkIds.includes(l.id)).map(l => l.name).join(', ') }] : []),
                ...(docUrl ? [{ label: 'Document', value: 'Uploadé' }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3 px-6 py-3.5">
                  <span className="text-xs text-text-light w-36 flex-shrink-0 pt-0.5">{label}</span>
                  <span className="text-sm text-text-primary font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm text-amber-800">
              Votre compte passera en <strong>attente de validation</strong>. Une fois approuvé par l'équipe JUNA, reconnectez-vous pour accéder à votre dashboard.
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)}
              className="flex-1 h-12 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors">
              Retour
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Envoi en cours...
                </>
              ) : 'Soumettre ma demande'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
