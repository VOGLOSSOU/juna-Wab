import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
      <div className="text-text-light"><svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg></div>
      <div className="flex flex-col gap-2">
        <h1 className="text-5xl font-bold text-text-primary">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary">Page introuvable</h2>
        <p className="text-text-secondary text-base max-w-sm">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-12 px-6 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
