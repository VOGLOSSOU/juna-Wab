'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { useAuthStore } from '@/lib/store/auth'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold text-text-light uppercase tracking-widest px-1">{title}</p>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const { isProvider } = useAuthStore()

  if (!hydrated || !isAuthenticated) return null

  return (
    <div className="max-w-xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/profile" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-grey transition-colors text-text-secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold">Paramètres</h1>
      </div>

      <div className="flex flex-col gap-8">

        {/* ── Espace prestataire ── */}
        <Section title="Espace prestataire">
          {isProvider ? (
            <Link href="/dashboard"
              className="bg-white rounded-xl border border-border shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary-surface flex items-center justify-center flex-shrink-0">
                <Image src="/logo_green_orange.png" alt="JUNA" width={36} height={36} className="object-contain" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text-primary">Accéder au dashboard</p>
                <p className="text-xs text-text-secondary mt-0.5">Gérez vos abonnements, commandes et plats</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-light">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ) : (
            <div className="rounded-2xl overflow-hidden shadow-sm border border-primary/20">

              {/* Header vert avec logo */}
              <div className="bg-primary px-6 py-7 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/2" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-3">
                    <Image src="/logo_white_orange.png" alt="JUNA" width={72} height={28} className="object-contain" />
                    <div>
                      <h3 className="text-white font-bold text-xl leading-tight">Devenez prestataire</h3>
                      <p className="text-white/75 text-sm mt-1 leading-relaxed max-w-xs">
                        Vendez vos plans repas par abonnement et développez votre activité.
                      </p>
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Avantages */}
              <div className="bg-primary-surface px-6 py-5 flex flex-col gap-3">
                {[
                  'Créez vos plans repas et fixez vos propres prix',
                  'Gérez vos commandes et livraisons en temps réel',
                  'Acceptez livraison à domicile et/ou retrait sur place',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <p className="text-sm text-text-primary">{text}</p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="bg-white px-6 py-5 border-t border-primary/10">
                <Link href="/auth/provider/register"
                  className="flex items-center justify-center gap-2 w-full h-12 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-light transition-colors">
                  Commencer maintenant
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </div>

            </div>
          )}
        </Section>

      </div>
    </div>
  )
}
