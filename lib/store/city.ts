'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { City, Country } from '@/types'

interface CityState {
  selectedCity: City | null
  selectedCountry: Country | null
  hasChosen: boolean
  setCity: (city: City, country: Country) => void
  reset: () => void
}

export const useCityStore = create<CityState>()(
  persist(
    (set) => ({
      selectedCity: null,
      selectedCountry: null,
      hasChosen: false,

      setCity: (city, country) =>
        set({ selectedCity: city, selectedCountry: country, hasChosen: true }),

      reset: () =>
        set({ selectedCity: null, selectedCountry: null, hasChosen: false }),
    }),
    { name: 'juna-city' }
  )
)
