/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Juna - Mentions légales',
  description: "Mentions légales de Juna — éditeur, hébergement, propriété intellectuelle et informations légales de la plateforme d'abonnements repas.",
  keywords: 'mentions légales Juna, éditeur, hébergement, ExternaLux6, informations légales',
  openGraph: {
    title: 'Juna - Mentions légales',
    description: 'Mentions légales de la plateforme Juna.',
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
}

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-10">

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-text-primary">Mentions légales</h1>
        <p className="text-sm text-text-secondary">Dernière mise à jour : avril 2025</p>
      </div>

      <Section title="1. Éditeur du site">
        <div className="bg-surface-grey rounded-xl p-5 flex flex-col gap-2 text-sm">
          <Row label="Marque / Produit" value="Juna (junaeats.com)" />
          <Row label="Société éditrice" value="ExternaLux6" />
          <Row label="Forme juridique" value="Entreprise Individuelle" />
          <Row label="N° RCCM" value="RB/COT/23 A 91500" />
          <Row label="N° IFU" value="0202233129461" />
          <Row label="Lieu d'immatriculation" value="Cotonou, Bénin" />
          <Row label="Siège social" value="Sans siège physique" />
          <Row label="Email" value="externalux6@gmail.com" />
          <Row label="Site web" value="junaeats.com" />
        </div>
      </Section>

      <Section title="2. Directeur de la publication">
        <p>
          Le directeur de la publication de la plateforme Juna est le représentant légal
          d'<strong>ExternaLux6</strong>, joignable à l'adresse : <strong>externalux6@gmail.com</strong>
        </p>
      </Section>

      <Section title="3. Hébergement">
        <div className="bg-surface-grey rounded-xl p-5 flex flex-col gap-2 text-sm">
          <Row label="Hébergeur" value="Railway (Railsware Products, Inc.)" />
          <Row label="Site" value="railway.app" />
          <Row label="Adresse" value="548 Market St, San Francisco, CA 94104, USA" />
        </div>
        <p>
          Les serveurs hébergeant l'infrastructure technique de Juna (API, base de données)
          sont opérés par Railway. Toute l'infrastructure est accessible via HTTPS.
        </p>
      </Section>

      <Section title="4. Propriété intellectuelle">
        <p>
          L'ensemble des éléments constituant la plateforme Juna — notamment le nom <strong>Juna</strong>,
          la marque <strong>Junaeats</strong>, le logo, la charte graphique, les textes, les illustrations
          et le code source — sont la propriété exclusive d'<strong>ExternaLux6</strong> et sont protégés
          par les lois en vigueur relatives à la propriété intellectuelle.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication, transmission ou dénaturation,
          totale ou partielle, de ces éléments, par quelque procédé que ce soit et sur quelque support
          que ce soit, est <strong>strictement interdite sans autorisation écrite préalable</strong>
          d'ExternaLux6.
        </p>
        <p>
          Toute demande d'autorisation doit être adressée à : <strong>externalux6@gmail.com</strong>
        </p>
      </Section>

      <Section title="5. Limitation de responsabilité">
        <p>
          ExternaLux6 s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées
          sur la plateforme Juna. Toutefois, ExternaLux6 ne peut garantir l'exactitude, la complétude
          ou l'actualité des informations publiées par les prestataires tiers.
        </p>
        <p>
          ExternaLux6 ne saurait être tenu responsable des dommages directs ou indirects résultant
          de l'utilisation de la plateforme, d'une interruption de service, ou d'informations
          inexactes publiées par un prestataire.
        </p>
      </Section>

      <Section title="6. Contact">
        <p>Pour toute question d'ordre légal ou toute réclamation :</p>
        <div className="bg-surface-grey rounded-xl p-4 flex flex-col gap-1.5 text-sm">
          <p><strong>ExternaLux6</strong> — éditeur de Juna</p>
          <p>Email : <strong>externalux6@gmail.com</strong></p>
          <p>Site web : <strong>junaeats.com</strong></p>
        </div>
      </Section>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-2">{title}</h2>
      <div className="flex flex-col gap-3 text-text-secondary text-sm leading-relaxed [&_strong]:text-text-primary">
        {children}
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-text-light w-44 flex-shrink-0">{label}</span>
      <span className="text-text-primary font-medium">{value}</span>
    </div>
  )
}
