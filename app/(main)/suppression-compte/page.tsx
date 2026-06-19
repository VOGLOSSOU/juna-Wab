/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Juna — Suppression de compte et de données',
  description: "Demandez la suppression définitive de votre compte Juna et de toutes vos données personnelles. Procédure simple par email.",
  keywords: 'suppression compte Juna, supprimer données personnelles, droit à l\'oubli, Juna RGPD, désinscrire Juna',
  openGraph: {
    title: 'Juna — Suppression de compte et de données',
    description: 'Demandez la suppression définitive de votre compte Juna et de vos données personnelles.',
    url: 'https://junaeats.com/suppression-compte',
    siteName: 'Juna',
    images: [{ url: 'https://junaeats.com/juna-logo.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
  alternates: { canonical: 'https://junaeats.com/suppression-compte' },
}

export default function AccountDeletionPage() {
  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: 'Accueil', url: 'https://junaeats.com' },
      { name: 'Suppression de compte', url: 'https://junaeats.com/suppression-compte' },
    ]} />
    <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-10">

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-text-primary">Suppression de compte et de données</h1>
        <p className="text-sm text-text-secondary">Applicable à l'application mobile <strong>Juna</strong>, éditée par ExternaLux6.</p>
      </div>

      {/* Encart procédure */}
      <div className="bg-primary-surface border border-primary/20 rounded-xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-text-primary">Comment demander la suppression ?</h2>
        </div>
        <ol className="flex flex-col gap-3 text-sm text-text-secondary leading-relaxed pl-1">
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <span>Envoyez un email à <a href="mailto:junaapp1@gmail.com" className="text-primary font-semibold hover:underline">junaapp1@gmail.com</a> depuis l'adresse associée à votre compte Juna.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <span>Dans votre email, précisez clairement que vous souhaitez la <strong className="text-text-primary">suppression définitive de votre compte et de toutes vos données personnelles</strong>.</span>
          </li>
          <li className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <span>Notre équipe support traitera votre demande et vous confirmera par email une fois la suppression effectuée.</span>
          </li>
        </ol>
      </div>

      {/* Délai de traitement */}
      <Section title="Délai de traitement">
        <p>
          Votre demande sera traitée dans un délai maximum de <strong>30 jours</strong> à compter de la réception de votre email.
          Vous recevrez une confirmation à l'adresse depuis laquelle vous avez envoyé la demande.
        </p>
      </Section>

      {/* Données supprimées */}
      <Section title="Données supprimées">
        <p>Suite à votre demande, les données suivantes sont définitivement supprimées :</p>
        <ul>
          <li>Votre compte utilisateur (nom, adresse email, numéro de téléphone)</li>
          <li>Votre historique de commandes et d'abonnements</li>
          <li>Vos avis et évaluations publiés</li>
          <li>Vos préférences et paramètres de compte</li>
          <li>Toute autre donnée personnelle associée à votre compte</li>
        </ul>
      </Section>

      {/* Données conservées */}
      <Section title="Données conservées après suppression">
        <p>
          Conformément à nos obligations légales et comptables, certaines données peuvent être conservées
          après la suppression de votre compte :
        </p>
        <ul>
          <li>
            <strong>Données de transaction</strong> — les enregistrements de paiements peuvent être conservés
            jusqu'à <strong>10 ans</strong> pour répondre aux obligations fiscales et comptables applicables au Bénin.
          </li>
          <li>
            <strong>Données anonymisées</strong> — des données agrégées et anonymisées (sans lien avec votre identité)
            peuvent être conservées à des fins statistiques.
          </li>
        </ul>
      </Section>

      {/* Contact */}
      <div className="bg-surface-grey rounded-xl p-5 flex flex-col gap-2">
        <p className="text-sm font-semibold text-text-primary">Une question ?</p>
        <p className="text-sm text-text-secondary">
          Contactez notre équipe support à{' '}
          <a href="mailto:junaapp1@gmail.com" className="text-primary font-medium hover:underline">
            junaapp1@gmail.com
          </a>
        </p>
      </div>

      <Link href="/" className="text-sm text-primary hover:underline font-medium">
        ← Retour à l'accueil
      </Link>

    </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-2">{title}</h2>
      <div className="flex flex-col gap-2 text-text-secondary text-sm leading-relaxed [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-4 [&_ul]:list-disc [&_li]:leading-relaxed [&_strong]:text-text-primary">
        {children}
      </div>
    </section>
  )
}
