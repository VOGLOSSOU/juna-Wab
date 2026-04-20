'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCityStore } from '@/lib/store/city'

const SLIDES = [
  { src: '/plat-1.png', alt: 'Repas africain 1' },
  { src: '/plat-2.png', alt: 'Repas africain 2' },
  { src: '/plat-3.png', alt: 'Repas africain 3' },
]

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { selectedCity } = useCityStore()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/explorer?search=${encodeURIComponent(search.trim())}`)
    } else {
      router.push('/explorer')
    }
  }

  function scrollToContent() {
    const section = document.getElementById('hero-section')
    if (section) {
      window.scrollTo({ top: section.offsetHeight, behavior: 'smooth' })
    }
  }

  return (
    <section id="hero-section" className="relative h-[600px] md:h-[680px] overflow-hidden">
      {/* Slideshow background */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay dégradé — sombre en bas, semi-transparent en haut */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/75" />

      {/* Contenu centré */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center gap-6">

        {/* Badge ville */}
        {selectedCity && (
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-medium px-4 py-1.5 rounded-full">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {selectedCity.name}
          </div>
        )}

        {/* Titre principal */}
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-lg">
            Vos repas livrés,{' '}
            <span className="text-accent">chaque jour.</span>
          </h1>
          <p className="text-white/85 text-lg md:text-xl max-w-2xl leading-relaxed drop-shadow">
            Abonnez-vous aux meilleurs cuisiniers et traiteurs autour de vous.
            Des repas faits maison, livrés directement chez vous.
          </p>
        </div>

        {/* Barre de recherche */}
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden border border-white/20 mt-2"
        >
          <div className="flex items-center px-4 flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un plat, un traiteur..."
              className="flex-1 h-14 text-text-primary text-sm bg-transparent outline-none placeholder:text-text-light"
            />
          </div>
          <button
            type="submit"
            className="h-14 px-5 bg-primary text-white hover:bg-primary-light transition-colors flex-shrink-0 flex items-center justify-center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </form>

      </div>

      {/* Flèche scroll vers le bas */}
      <button
        onClick={scrollToContent}
        aria-label="Voir le contenu"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 group"
      >
        <span className="text-white/50 text-xs font-medium tracking-wide group-hover:text-white/80 transition-colors">
          Découvrir
        </span>
        <div className="animate-bounce">
          <svg
            width="28" height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-white/60 group-hover:text-white transition-colors drop-shadow"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
    </section>
  )
}
