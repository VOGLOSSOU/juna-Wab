'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { useCityStore } from '@/lib/store/city'
import { Button } from '@/components/ui/button'
import { cn, getInitials } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { selectedCity } = useCityStore()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navLinks = isAuthenticated
    ? [
        { href: '/', label: 'Accueil' },
        { href: '/explorer', label: 'Explorer' },
        { href: '/profile/orders', label: 'Mes commandes' },
      ]
    : [
        { href: '/', label: 'Accueil' },
        { href: '/explorer', label: 'Explorer' },
      ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white shadow-sm border-b border-border">
      <div className="max-w-content mx-auto h-full px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo_green_orange.png"
            alt="JUNA"
            width={80}
            height={32}
            className="object-contain"
            priority
          />
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
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
          {/* City selector */}
          {isAuthenticated && selectedCity && (
            <button className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-text-secondary hover:bg-surface-grey transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {selectedCity.name}
            </button>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 rounded-full bg-primary-surface flex items-center justify-center text-primary font-semibold text-sm hover:bg-primary/10 transition-colors"
              >
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.name} width={36} height={36} className="rounded-full object-cover" />
                ) : (
                  getInitials(user?.name ?? 'U')
                )}
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-11 z-20 w-48 bg-white rounded-lg shadow-lg border border-border py-1">
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-grey" onClick={() => setUserMenuOpen(false)}>
                      Mon profil
                    </Link>
                    <Link href="/profile/settings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-surface-grey" onClick={() => setUserMenuOpen(false)}>
                      Paramètres
                    </Link>
                    <div className="border-t border-divider my-1" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false) }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-red-50"
                    >
                      Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Se connecter</Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm">S&apos;inscrire</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
