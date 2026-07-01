/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: "Télécharger l'application",
  description: 'Abonne-toi aux meilleurs prestataires repas autour de toi. Disponible sur Android, bientôt sur iOS.',
  keywords: 'télécharger Juna Eats, app Juna Eats, Juna Eats Android, Juna Eats Play Store, application repas, abonnement repas mobile, Junaeats app',
  openGraph: {
    title: 'Télécharger Juna Eats - App Android',
    description: 'Abonne-toi aux meilleurs prestataires repas autour de toi. Disponible sur Android, bientôt sur iOS.',
    url: 'https://junaeats.com/telecharger',
    siteName: 'Juna Eats',
    images: [{ url: 'https://junaeats.com/juna-logo.png', width: 800, height: 400, alt: 'Juna Eats' }],
    type: 'website',
  },
  alternates: { canonical: 'https://junaeats.com/telecharger' },
}

export default function TelechargerPage() {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6 py-14 relative overflow-hidden">

      {/* Background food image */}
      <div className="absolute inset-0">
        <Image
          src="/plat-3.png"
          alt=""
          fill
          className="object-cover object-center opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black/95" />
      </div>

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-[340px] mx-auto gap-8">

        {/* Logo */}
        <Image
          src="/juna-logo.png"
          alt="Juna Eats"
          width={64}
          height={64}
          className="object-contain drop-shadow-2xl"
        />

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <h1 className="text-[2.75rem] font-extrabold text-white leading-[1.08] tracking-tight">
            Tes repas<br />planifiés<br />
            <span style={{ color: '#4ade80' }}>quotidiennement.</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-[280px] mx-auto">
            Découvrir et souscrire à des repas préparés par des prestataires près de chez vous.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full">

          {/* Google Play — primary */}
          <a
            href="https://play.google.com/store/apps/details?id=com.junaeats.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full h-[56px] bg-white rounded-2xl font-bold text-[#080808] text-[15px] hover:bg-white/92 active:scale-[0.97] transition-all shadow-xl shadow-black/40"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302L6.612 21.46l8.625-8.625zm3.183-3.183l2.83 1.624a1.001 1.001 0 0 1 0 1.736l-2.83 1.624L19.91 12l-2.328 2.328zM6.612 2.54l10.32 5.929-2.328 2.328-8.625-8.625z"/>
            </svg>
            Télécharger sur Google Play
          </a>

          {/* App Store — coming soon */}
          <div className="relative flex items-center justify-center gap-3 w-full h-[56px] rounded-2xl border border-white/10 bg-white/5 text-white/30 text-[15px] font-semibold cursor-not-allowed select-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="opacity-40">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            App Store
            <span className="absolute -top-2.5 right-4 bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              bientôt
            </span>
          </div>

          {/* Web */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full h-[44px] rounded-2xl border border-white/12 text-white/50 text-[13px] font-medium hover:bg-white/5 active:scale-[0.97] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
            </svg>
            Continuer sur junaeats.com
          </Link>
        </div>

        {/* Feature chips */}
        <div className="flex flex-col gap-2 w-full">
          {[
            {
              label: 'Prestataires locaux',
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              ),
            },
            {
              label: 'Paiement Mobile Money',
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2">
                  <rect x="5" y="2" width="14" height="20" rx="2"/>
                  <path d="M12 18h.01M9 7h6M9 11h4"/>
                </svg>
              ),
            },
            {
              label: 'Livraison à domicile ou retrait',
              icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              ),
            },
          ].map(({ label, icon }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              {icon}
              <span className="text-white/65 text-[13px] font-medium">{label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-white/20 text-[11px] tracking-wide">
          © 2026 Juna Eats · junaeats.com
        </p>

      </div>
    </div>
  )
}
