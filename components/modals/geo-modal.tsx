'use client'

import { useState, useEffect } from 'react'
import { getCountries, getCities } from '@/lib/api/geo'
import { useCityStore } from '@/lib/store/city'
import type { Country, City } from '@/types'

function countryName(c: Country): string {
  return c.translations?.fr ?? c.translations?.en ?? c.code
}

export function GeoModal() {
  const { hasChosen, setCity } = useCityStore()
  const [step, setStep] = useState<'country' | 'city'>('country')
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!hasChosen) {
      getCountries().then(setCountries).catch(console.error)
    }
  }, [hasChosen])

  if (hasChosen) return null

  const handleSelectCountry = async (country: Country) => {
    setSelectedCountry(country)
    setLoading(true)
    setSearch('')
    try {
      const data = await getCities(country.code)
      setCities(data)
      setStep('city')
    } catch {
      console.error('Erreur chargement villes')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCity = (city: City) => {
    if (selectedCountry) setCity(city, selectedCountry)
  }

  const filteredCountries = countries.filter((c) =>
    countryName(c).toLowerCase().includes(search.toLowerCase())
  )
  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px] p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-none">

        {/* Header avec icone */}
        <div className="px-6 pt-7 pb-5">
          {/* Poignée mobile */}
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6 sm:hidden" />

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-surface flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1A5C2A" strokeWidth="1.8">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary leading-snug">
                {step === 'country' ? 'Où êtes-vous ?' : `Quelle ville en ${selectedCountry ? countryName(selectedCountry) : ''} ?`}
              </h2>
              <p className="text-text-secondary text-sm mt-1 leading-relaxed">
                {step === 'country'
                  ? 'Choisissez votre pays pour découvrir les prestataires et abonnements disponibles près de chez vous.'
                  : 'Sélectionnez votre ville — nous vous montrerons les abonnements les plus proches de vous en priorité.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-6" />

        {/* Corps */}
        <div className="px-6 py-4">
          {/* Retour */}
          {step === 'city' && (
            <button
              onClick={() => { setStep('country'); setSearch('') }}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-4"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Changer de pays
            </button>
          )}

          {/* Barre de recherche */}
          <div className="relative mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              placeholder={step === 'country' ? 'Rechercher un pays...' : 'Rechercher une ville...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-surface-grey text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>

          {/* Liste */}
          {loading ? (
            <div className="flex flex-col gap-2 py-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-surface-grey rounded-xl animate-pulse" />
              ))}
            </div>
          ) : step === 'country' ? (
            filteredCountries.length === 0 ? (
              <p className="text-center text-text-secondary text-sm py-8">Aucun pays trouvé</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1">
                {filteredCountries.map((country) => (
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
              <p className="text-center text-text-secondary text-sm py-8">Aucune ville trouvée</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1">
                {filteredCities.map((city) => (
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

        {/* Footer discret */}
        <div className="px-6 pb-6 pt-1">
          <p className="text-xs text-text-light text-center">
            Vous pourrez changer de ville à tout moment depuis votre profil.
          </p>
        </div>
      </div>
    </div>
  )
}
