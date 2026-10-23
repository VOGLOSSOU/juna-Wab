'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useCityStore } from '@/lib/store/city'
import { GeoModal } from '@/components/modals/geo-modal'
import { Button } from '@/components/ui/button'
import { cn, getInitials } from '@/lib/utils'
import { getUserProfile } from '@/lib/api/auth'

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout, updateUser } = useAuthStore()
  const { selectedCity, hasChosen } = useCityStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [cityModalOpen, setCityModalOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const closeCityModal = useCallback(() => setCityModalOpen(false), [])

  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    getUserProfile().then(updateUser).catch(() => {})
  }, [isAuthenticated])

  const isProvider = user?.role === 'PROVIDER'

  const navLinks = isAuthenticated
    ? [
        { href: '/', label: 'Accueil' },
        { href: '/explorer', label: 'Explorer' },
        { href: '/profile/orders', label: 'Mes commandes' },
        ...(!isProvider ? [
          { href: '/profile/subscriptions', label: 'Mes abonnements' },
          { href: '/profile/proposals', label: 'Mes propositions' },
        ] : [
          { href: '/dashboard/proposals', label: 'Propositions reçues' },
        ]),
        { href: '/about', label: 'À propos' },
      ]
    : [
        { href: '/', label: 'Accueil' },
        { href: '/explorer', label: 'Explorer' },
        { href: '/about', label: 'À propos' },
      ]

  const avatar = user?.avatarUrl ?? user?.profile?.avatar ?? null

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-sm border-b border-border">
      <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/juna-logo.png"
            alt="Juna Eats"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        {/* Nav links — desktop */}
        <div className="hidden xl:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-primary bg-primary-surface'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-grey'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* City selector — available to everyone, on every screen */}
          <button
            type="button"
            onClick={() => { setMobileMenuOpen(false); setCityModalOpen(true) }}
            aria-label={hydrated && selectedCity ? `Changer de ville, ville actuelle : ${selectedCity.name}` : 'Choisir une ville'}
            aria-haspopup="dialog"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-grey transition-colors min-w-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="max-w-[120px] truncate">{hydrated && selectedCity ? selectedCity.name : 'Choisir une ville'}</span>
            <span aria-hidden="true">⌄</span>
          </button>

          {/* Avatar — direct link to profile */}
          {isAuthenticated ? (
            <Link href="/profile">
              <button className="w-9 h-9 rounded-full bg-primary-surface flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary/10 transition-colors overflow-hidden">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt={user?.name ?? ''} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name ?? 'U')
                )}
              </button>
            </Link>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">S&apos;inscrire</Button>
              </Link>
            </div>
          )}

          {/* Hamburger — mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-surface-grey transition-colors text-text-primary"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 top-16 z-40 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 z-50 bg-white border-b border-border shadow-md">
            <div className="flex flex-col py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-6 py-3 text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-primary bg-primary-surface'
                      : 'text-text-primary hover:bg-surface-grey'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!isAuthenticated && (
                <div className="flex flex-col gap-2 px-6 py-4 border-t border-divider mt-1">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Se connecter</Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">S&apos;inscrire</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
    {hydrated && (cityModalOpen || (pathname === '/' && !hasChosen)) && (
      <GeoModal onClose={closeCityModal} />
    )}
    </>
  )
}
