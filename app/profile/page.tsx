'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getUserProfile, updateMe } from '@/lib/api/auth'
import { getCountries, getCities } from '@/lib/api/geo'
import { useAuthStore } from '@/lib/store/auth'
import { useRouter } from 'next/navigation'
import { getInitials, formatDate } from '@/lib/utils'
import type { User, City, Country } from '@/types'
import toast from 'react-hot-toast'

function ProfileSkeleton() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 w-36 bg-surface-grey rounded-lg mb-6" />

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-4">
        {/* Avatar header */}
        <div className="bg-primary-surface px-6 py-8 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary/20" />
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-32 bg-primary/20 rounded-lg" />
            <div className="h-3.5 w-20 bg-primary/10 rounded-lg" />
          </div>
        </div>
        {/* Info rows */}
        <div className="divide-y divide-divider">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-4 h-4 rounded bg-surface-grey flex-shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-2.5 w-16 bg-surface-grey rounded" />
                <div className="h-3.5 w-40 bg-border rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav buttons */}
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-white rounded-xl border border-border" />
        ))}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="text-text-light flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-text-light">{label}</p>
        <p className="text-sm text-text-primary font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-text-secondary">{label}</label>
      {children}
    </div>
  )
}

function NavItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-5 py-3.5 bg-white border border-border rounded-xl text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors"
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-light">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  )
}

const inputClass = "w-full h-11 px-4 rounded-xl border border-border bg-white text-sm text-text-primary placeholder:text-text-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"

export default function ProfilePage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const { user: storeUser, updateUser, logout } = useAuthStore()
  const router = useRouter()

  function handleLogout() {
    logout()
    router.push('/')
    toast.success('Vous êtes déconnecté')
  }
  const [profile, setProfile] = useState<User | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  // City picker
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerStep, setPickerStep] = useState<'country' | 'city'>('country')
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [pickerCountry, setPickerCountry] = useState<Country | null>(null)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerLoading, setPickerLoading] = useState(false)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getUserProfile()
      .then((data) => { setProfile(data); updateUser(data) })
      .catch(() => { /* token expiré — logout() appelé par l'intercepteur, useAuthGuard redirige */ })
      .finally(() => setLoadingProfile(false))
  }, [hydrated, isAuthenticated])

  function startEdit() {
    if (!profile) return
    setName(profile.name)
    setPhone(profile.phone ?? '')
    setAddress(profile.profile?.address ?? '')
    setSelectedCity(profile.city ?? profile.profile?.city ?? null)
    setEditing(true)
    setPickerOpen(false)
    getCountries().then(setCountries).catch(console.error)
  }

  function cancelEdit() {
    setEditing(false)
    setPickerOpen(false)
    setPickerStep('country')
    setPickerSearch('')
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    setSaving(true)
    try {
      await updateMe({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        cityId: selectedCity?.id,
      })
      const updated = await getUserProfile()
      setProfile(updated)
      updateUser(updated)
      setEditing(false)
      setPickerOpen(false)
      toast.success('Profil mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  async function handlePickerCountry(country: Country) {
    setPickerCountry(country)
    setPickerLoading(true)
    setPickerSearch('')
    try {
      const data = await getCities(country.code)
      setCities(data)
      setPickerStep('city')
    } catch {
      toast.error('Impossible de charger les villes')
    } finally {
      setPickerLoading(false)
    }
  }

  function handlePickerCity(city: City) {
    setSelectedCity(city)
    setPickerOpen(false)
    setPickerStep('country')
    setPickerSearch('')
  }

  // Pas encore hydraté → skeleton immédiat
  if (!hydrated || (hydrated && isAuthenticated && loadingProfile)) return <ProfileSkeleton />

  // Non authentifié → useAuthGuard redirige, on ne rend rien
  if (!isAuthenticated || !profile) return null

  const avatar = profile.avatarUrl ?? profile.profile?.avatar ?? null
  const city = profile.city ?? profile.profile?.city ?? null
  const address2 = profile.profile?.address
  const categories = profile.profile?.preferences?.favoriteCategories
  const restrictions = profile.profile?.preferences?.dietaryRestrictions

  const filteredCountries = countries.filter((c) =>
    (c.translations?.fr ?? c.translations?.en ?? c.code).toLowerCase().includes(pickerSearch.toLowerCase())
  )
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(pickerSearch.toLowerCase())
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Mon profil</h1>

      {/* ─── CARD ─── */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden mb-4">

        {/* Avatar header */}
        <div className="bg-primary-surface px-6 py-8 flex flex-col items-center gap-3 relative">
          <div className="relative w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold overflow-hidden flex-shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              getInitials(profile.name)
            )}
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-text-primary">{profile.name}</h2>
            {profile.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4L2 12l3-3V5h4l3-3z"/>
                </svg>
                Compte vérifié
              </span>
            )}
          </div>

          {/* Bouton Modifier — view mode seulement */}
          {!editing && (
            <button
              onClick={startEdit}
              className="absolute top-4 right-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-white border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary-surface transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Modifier
            </button>
          )}
        </div>

        {/* ─── VIEW MODE ─── */}
        {!editing && (
          <div className="divide-y divide-divider">
            <InfoRow
              label="Adresse email"
              value={profile.email}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            />
            {profile.phone && (
              <InfoRow
                label="Téléphone"
                value={profile.phone}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .84h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.23-1.23a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>}
              />
            )}
            {city && (
              <InfoRow
                label="Ville"
                value={city.name}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>}
              />
            )}
            {address2 && (
              <InfoRow
                label="Adresse"
                value={address2}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
              />
            )}
            <InfoRow
              label="Membre depuis"
              value={formatDate(profile.createdAt)}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            />
          </div>
        )}

        {/* ─── EDIT MODE ─── */}
        {editing && (
          <div className="p-5 flex flex-col gap-4">

            {/* Email — non modifiable */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-grey border border-border">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-light flex-shrink-0">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <span className="text-sm text-text-light">{profile.email} · non modifiable</span>
            </div>

            <Field label="Nom complet">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                disabled={saving}
                className={inputClass}
              />
            </Field>

            <Field label="Téléphone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+229 01 00 00 00 00"
                disabled={saving}
                className={inputClass}
              />
            </Field>

            <Field label="Adresse de livraison">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rue des Cocotiers, Lot 12"
                disabled={saving}
                className={inputClass}
              />
            </Field>

            <Field label="Ville">
              <button
                type="button"
                onClick={() => { setPickerOpen(!pickerOpen); setPickerSearch('') }}
                disabled={saving}
                className="w-full h-11 px-4 rounded-xl border border-border bg-white text-sm text-left flex items-center justify-between hover:border-primary/50 transition-colors disabled:opacity-50"
              >
                <span className={selectedCity ? 'text-text-primary font-medium' : 'text-text-light'}>
                  {selectedCity ? selectedCity.name : 'Choisir une ville'}
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className={`text-text-light transition-transform ${pickerOpen ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Picker inline */}
              {pickerOpen && (
                <div className="mt-1 border border-border rounded-xl overflow-hidden shadow-md bg-white">
                  {/* Step header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-divider bg-surface-grey">
                    {pickerStep === 'city' && (
                      <button
                        onClick={() => { setPickerStep('country'); setPickerSearch('') }}
                        className="text-text-secondary hover:text-primary transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6"/>
                        </svg>
                      </button>
                    )}
                    <span className="text-xs font-medium text-text-secondary">
                      {pickerStep === 'country' ? 'Choisir un pays' : `Villes — ${pickerCountry ? (pickerCountry.translations?.fr ?? pickerCountry.code) : ''}`}
                    </span>
                  </div>

                  {/* Search */}
                  <div className="px-3 pt-3 pb-2">
                    <div className="relative">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light pointer-events-none">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <input
                        autoFocus
                        type="text"
                        value={pickerSearch}
                        onChange={(e) => setPickerSearch(e.target.value)}
                        placeholder={pickerStep === 'country' ? 'Rechercher un pays...' : 'Rechercher une ville...'}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-grey text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* List */}
                  <div className="max-h-48 overflow-y-auto px-2 pb-2">
                    {pickerLoading ? (
                      <div className="flex flex-col gap-1.5 py-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-10 bg-surface-grey rounded-lg animate-pulse" />
                        ))}
                      </div>
                    ) : pickerStep === 'country' ? (
                      filteredCountries.length === 0 ? (
                        <p className="text-center text-text-secondary text-sm py-6">Aucun pays trouvé</p>
                      ) : (
                        filteredCountries.map((country) => (
                          <button
                            key={country.id}
                            onClick={() => handlePickerCountry(country)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-surface text-left transition-colors group"
                          >
                            <span className="text-sm text-text-primary group-hover:text-primary transition-colors">
                              {country.flag && <span className="mr-2">{country.flag}</span>}
                              {country.translations?.fr ?? country.translations?.en ?? country.code}
                            </span>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-light group-hover:text-primary">
                              <polyline points="9 18 15 12 9 6"/>
                            </svg>
                          </button>
                        ))
                      )
                    ) : (
                      filteredCities.length === 0 ? (
                        <p className="text-center text-text-secondary text-sm py-6">Aucune ville trouvée</p>
                      ) : (
                        filteredCities.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handlePickerCity(c)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary-surface text-left transition-colors group"
                          >
                            <span className="text-sm text-text-primary group-hover:text-primary transition-colors">{c.name}</span>
                            {selectedCity?.id === c.id && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </button>
                        ))
                      )
                    )}
                  </div>
                </div>
              )}
            </Field>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-text-primary hover:bg-surface-grey transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Préférences */}
      {!editing && ((categories && categories.length > 0) || (restrictions && restrictions.length > 0)) && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-4">
          {categories && categories.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-text-light mb-2 font-medium uppercase tracking-wide">Catégories préférées</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span key={cat} className="text-xs bg-primary-surface text-primary px-3 py-1 rounded-full font-medium">{cat}</span>
                ))}
              </div>
            </div>
          )}
          {restrictions && restrictions.length > 0 && (
            <div>
              <p className="text-xs text-text-light mb-2 font-medium uppercase tracking-wide">Restrictions alimentaires</p>
              <div className="flex flex-wrap gap-2">
                {restrictions.map((r) => (
                  <span key={r} className="text-xs bg-surface-grey text-text-secondary px-3 py-1 rounded-full font-medium">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation — masquée en mode édition */}
      {!editing && (
        <div className="flex flex-col gap-2">
          <NavItem
            label="Mes commandes"
            onClick={() => router.push('/profile/orders')}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          />
          <NavItem
            label="Paramètres"
            onClick={() => router.push('/profile/settings')}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
          />

          {/* Déconnexion */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-3.5 bg-white border border-border rounded-xl text-sm font-medium text-error hover:bg-red-50 hover:border-red-200 transition-colors mt-2"
          >
            <span className="text-error">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  )
}
