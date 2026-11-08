'use client'

import { useState, useEffect, useRef } from 'react'
import { getCountries, getCities } from '@/lib/api/geo'
import { updateLocation, getUserProfile } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/store/auth'
import { getApiErrorMessage } from '@/lib/utils/api-error'
import { useCityStore } from '@/lib/store/city'
import type { Country, City } from '@/types'

function countryName(country: Country): string {
  return country.translations?.fr ?? country.translations?.en ?? country.code
}

export function GeoModal({ onClose }: { onClose: () => void }) {
  const { hasChosen } = useCityStore()
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [country, setCountry] = useState<Country | null>(null)
  const [city, setCity] = useState<City | null>(null)
  const [countriesLoading, setCountriesLoading] = useState(true)
  const [citiesLoading, setCitiesLoading] = useState(false)
  const [countriesError, setCountriesError] = useState(false)
  const [citiesError, setCitiesError] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [countriesRetry, retryCountries] = useState(0)
  const [citiesRetry, retryCities] = useState(0)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const mounted = useRef(true)
  const dialog = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  useEffect(() => {
    let current = true
    setCountriesLoading(true)
    setCountriesError(false)
    getCountries().then(data => {
      if (!current) return
      const available = data.filter(item => item.isActive !== false)
      setCountries(available)
      const stored = useCityStore.getState().selectedCountry
      setCountry(available.find(item => item.id === stored?.id) ?? null)
    }).catch(() => { if (current) setCountriesError(true) })
      .finally(() => { if (current) setCountriesLoading(false) })
    return () => { current = false }
  }, [countriesRetry])

  useEffect(() => {
    if (!country) return
    let current = true
    setCitiesLoading(true)
    setCitiesError(false)
    getCities(country.code).then(data => {
      if (!current) return
      setCities(data)
      const stored = useCityStore.getState()
      if (stored.selectedCountry?.id === country.id) {
        setCity(data.find(item => item.id === stored.selectedCity?.id) ?? null)
      }
    }).catch(() => { if (current) setCitiesError(true) })
      .finally(() => { if (current) setCitiesLoading(false) })
    return () => { current = false }
  }, [country, citiesRetry])

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    const keyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && hasChosen && !savingRef.current) onClose()
      if (event.key !== 'Tab') return
      const elements = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)')
      if (!elements?.length) { event.preventDefault(); return }
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', keyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', keyDown)
      previousFocus?.focus()
    }
  }, [hasChosen, onClose])

  async function confirm() {
    if (!country || !city || savingRef.current || countriesLoading || citiesLoading || countriesError || citiesError) return
    savingRef.current = true
    setSaving(true)
    setSaveError(null)
    const session = useAuthStore.getState()
    const stillCurrent = () => mounted.current &&
      useAuthStore.getState().authRevision === session.authRevision &&
      useAuthStore.getState().user?.id === session.user?.id
    try {
      if (session.isAuthenticated) {
        await updateLocation(city.id)
        if (!stillCurrent()) return
        const profile = await getUserProfile()
        if (!stillCurrent()) return
        const savedCity = profile.profile?.city ?? profile.city
        if (profile.id !== session.user?.id || savedCity?.id !== city.id || !savedCity.country) {
          throw new Error('Impossible de confirmer votre ville. Réessayez.')
        }
        useAuthStore.getState().updateUser(profile)
      } else {
        if (!stillCurrent()) return
        useCityStore.getState().setCity(city, country)
      }
      if (stillCurrent()) onClose()
    } catch (error) {
      if (stillCurrent()) setSaveError(getApiErrorMessage(error, 'Impossible de mettre à jour votre ville. Réessayez.'))
    } finally {
      savingRef.current = false
      if (mounted.current) setSaving(false)
    }
  }

  const filteredCities = cities.filter(item => item.name.toLocaleLowerCase('fr').includes(search.trim().toLocaleLowerCase('fr')))
  const chip = 'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60'
  const selectedChip = 'border-primary bg-primary-surface text-primary'
  const plainChip = 'border-border bg-white text-text-primary hover:border-primary/40 hover:bg-primary-surface/50'

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="city-dialog-title" aria-describedby="city-dialog-description"
        className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:max-w-lg sm:rounded-2xl">
        <header className="shrink-0 px-6 pb-5 pt-6">
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border sm:hidden" aria-hidden="true" />
          {hasChosen && <button type="button" disabled={saving} onClick={onClose} aria-label="Fermer le choix de ville" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-surface-grey disabled:opacity-50">✕</button>}
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Pays et ville</p>
          <h2 id="city-dialog-title" className="pr-8 text-xl font-semibold text-text-primary">Votre localisation</h2>
          <p id="city-dialog-description" className="mt-2 text-sm leading-relaxed text-text-secondary">Choisissez votre pays et votre ville pour voir les abonnements disponibles près de vous.</p>
        </header>

        <div className="overflow-y-auto border-y border-border px-6 py-5">
          <section aria-labelledby="country-label">
            <h3 id="country-label" className="mb-3 text-sm font-semibold text-text-primary">Pays</h3>
            {countriesLoading ? <p role="status" className="py-3 text-sm text-text-secondary">Chargement des pays...</p>
              : countriesError ? <div role="alert" className="text-sm text-error"><p>Impossible de charger les pays.</p><button type="button" onClick={() => retryCountries(value => value + 1)} className="mt-2 font-semibold underline">Réessayer</button></div>
              : countries.length === 0 ? <p className="text-sm text-text-secondary">Aucun pays disponible pour le moment.</p>
              : <div className="flex flex-wrap gap-2">{countries.map(item => <button key={item.id} type="button" disabled={saving} aria-pressed={country?.id === item.id}
                onClick={() => {
                  if (country?.id === item.id) return
                  setCountry(item); setCity(null); setCities([]); setCitiesLoading(true); setSearch(''); setSaveError(null)
                }} className={`${chip} ${country?.id === item.id ? selectedChip : plainChip}`}>
                {item.flag && <span className="mr-2" aria-hidden="true">{item.flag}</span>}{countryName(item)}
              </button>)}</div>}
          </section>

          {country && <section aria-labelledby="city-label" className="mt-6">
            <h3 id="city-label" className="mb-3 text-sm font-semibold text-text-primary">Ville</h3>
            {citiesLoading ? <p role="status" className="py-3 text-sm text-text-secondary">Chargement des villes...</p>
              : citiesError ? <div role="alert" className="text-sm text-error"><p>Impossible de charger les villes.</p><button type="button" onClick={() => retryCities(value => value + 1)} className="mt-2 font-semibold underline">Réessayer</button></div>
              : cities.length === 0 ? <p className="text-sm text-text-secondary">Aucune ville disponible pour ce pays.</p>
              : <>
                <input type="search" aria-label="Rechercher une ville" placeholder="Rechercher une ville..." value={search} disabled={saving} onChange={event => setSearch(event.target.value)} className="mb-3 h-11 w-full rounded-xl border border-border bg-surface-grey px-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">{filteredCities.map(item => <button key={item.id} type="button" disabled={saving} aria-pressed={city?.id === item.id} onClick={() => { setCity(item); setSaveError(null) }}
                  className={`${chip} flex min-w-0 items-center justify-between gap-2 ${city?.id === item.id ? selectedChip : plainChip}`}>
                  <span className="break-words">{item.name}</span>{city?.id === item.id && <span aria-hidden="true" className="shrink-0">✓</span>}
                </button>)}</div>
                {filteredCities.length === 0 && <p className="py-3 text-sm text-text-secondary">Aucune ville trouvée.</p>}
              </>}
          </section>}
        </div>

        <footer className="shrink-0 px-6 py-5" style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}>
          {city && country && <p className="mb-3 break-words text-sm text-text-secondary">Votre choix : <strong className="font-semibold text-primary">{city.name}, {countryName(country)}</strong></p>}
          {saveError && <p role="alert" className="mb-3 text-sm text-error">{saveError}</p>}
          <button type="button" onClick={confirm} disabled={!city || !country || countriesLoading || citiesLoading || countriesError || citiesError || saving} aria-busy={saving}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'Enregistrement...' : 'Confirmer'}
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-text-light">Vous pouvez changer de ville à tout moment depuis la barre de navigation.</p>
        </footer>
      </div>
    </div>
  )
}
