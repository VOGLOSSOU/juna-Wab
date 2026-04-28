/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Juna - Politique de confidentialité',
  description: 'Découvrez comment Juna collecte, utilise et protège vos données personnelles. Transparence totale sur le traitement de vos informations.',
  keywords: 'politique de confidentialité Juna, données personnelles, vie privée, RGPD, protection des données',
  openGraph: {
    title: 'Juna - Politique de confidentialité',
    description: 'Découvrez comment Juna collecte, utilise et protège vos données personnelles.',
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-10">

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-text-primary">Politique de confidentialité</h1>
        <p className="text-sm text-text-secondary">Dernière mise à jour : avril 2025</p>
      </div>

      <Section title="1. Introduction">
        <p>
          Juna est une plateforme de mise en relation entre abonnés et prestataires de repas,
          éditée par <strong>ExternaLux6</strong>, établissement immatriculé à Cotonou, Bénin
          (N° RCCM : RB/COT/23 A 91500 — N° IFU : 0202233129461).
        </p>
        <p>
          Nous accordons une importance particulière à la protection de vos données personnelles
          et nous nous engageons à les traiter de manière transparente, sécurisée et conforme
          aux réglementations en vigueur.
        </p>
        <p>
          La présente politique de confidentialité s'applique à tous les utilisateurs de la
          plateforme Juna (site web et application mobile). En utilisant nos services, vous
          acceptez les pratiques décrites dans ce document.
        </p>
        <p>
          Pour toute question relative à vos données personnelles, vous pouvez nous contacter
          à l'adresse : <strong>externalux6@gmail.com</strong>
        </p>
      </Section>

      <Section title="2. Données collectées">
        <Subsection title="Données d'inscription">
          <ul>
            <li>Nom complet</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Mot de passe (stocké sous forme hashée — jamais en clair)</li>
          </ul>
        </Subsection>
        <Subsection title="Données de commande">
          <ul>
            <li>Adresse de livraison</li>
            <li>Ville de livraison</li>
            <li>Historique des commandes et abonnements</li>
            <li>Mode de réception choisi (livraison ou retrait)</li>
          </ul>
        </Subsection>
        <Subsection title="Données de localisation">
          <ul>
            <li>Ville choisie par l'utilisateur pour personnaliser l'affichage des abonnements disponibles</li>
          </ul>
        </Subsection>
        <Subsection title="Données de paiement">
          <ul>
            <li>Numéro Mobile Money utilisé pour le paiement (transmis à notre prestataire de paiement PawaPay)</li>
            <li>Juna ne stocke pas vos numéros de carte bancaire ni vos informations de paiement complètes</li>
          </ul>
        </Subsection>
        <Subsection title="Données techniques">
          <ul>
            <li>Adresse IP</li>
            <li>Type de navigateur et d'appareil</li>
            <li>Logs de connexion et d'activité</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="3. Pourquoi ces données sont collectées">
        <p>Vos données personnelles sont collectées et traitées pour les finalités suivantes :</p>
        <ul>
          <li><strong>Création et gestion de votre compte</strong> — identification, authentification, accès à vos abonnements</li>
          <li><strong>Traitement des commandes et paiements</strong> — validation, suivi et facturation de vos abonnements</li>
          <li><strong>Mise en relation avec les prestataires</strong> — transmission des informations nécessaires à la préparation et à la livraison de vos repas</li>
          <li><strong>Amélioration du service</strong> — analyse des usages pour optimiser l'expérience utilisateur</li>
          <li><strong>Communication</strong> — envoi de notifications transactionnelles (confirmation de commande, rappels, mise à jour de statut)</li>
        </ul>
      </Section>

      <Section title="4. Partage avec des tiers">
        <p>
          Juna ne vend jamais vos données personnelles à des tiers à des fins publicitaires ou commerciales.
          Vos données peuvent être partagées uniquement dans les cas suivants :
        </p>
        <ul>
          <li>
            <strong>PawaPay</strong> — prestataire de paiement Mobile Money (MTN MoMo, Moov Money, Orange Money, Wave).
            Votre numéro de téléphone est transmis à PawaPay pour initier et valider les transactions.
            PawaPay dispose de sa propre politique de confidentialité consultable sur <span className="text-primary">pawapay.io</span>.
          </li>
          <li>
            <strong>Prestataires de repas</strong> — votre nom et votre adresse de livraison sont transmis au prestataire
            concerné pour exécuter votre commande. Ces informations sont strictement limitées à ce qui est nécessaire.
          </li>
          <li>
            <strong>Railway</strong> — hébergeur de l'infrastructure technique de Juna (backend, base de données).
            Les données sont stockées sur des serveurs sécurisés gérés par Railway (Railsware Products, Inc.),
            548 Market St, San Francisco, CA 94104, USA.
          </li>
        </ul>
      </Section>

      <Section title="5. Conservation des données">
        <ul>
          <li><strong>Données de compte</strong> — conservées tant que votre compte est actif</li>
          <li><strong>Données de commande</strong> — conservées pendant 3 ans à compter de la date de la commande</li>
          <li><strong>Données techniques (logs)</strong> — conservées pendant 12 mois</li>
          <li>
            <strong>Suppression sur demande</strong> — votre compte et vos données personnelles peuvent être
            supprimés sur simple demande à <strong>externalux6@gmail.com</strong> dans un délai de 30 jours.
          </li>
        </ul>
      </Section>

      <Section title="6. Vos droits">
        <p>Conformément aux réglementations applicables en matière de protection des données, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès</strong> — vous pouvez demander une copie de toutes les données que nous détenons sur vous</li>
          <li><strong>Droit de rectification</strong> — vous pouvez demander la correction de données inexactes ou incomplètes</li>
          <li><strong>Droit à la suppression</strong> — vous pouvez demander l'effacement de vos données personnelles ("droit à l'oubli")</li>
          <li><strong>Droit à la portabilité</strong> — vous pouvez demander à recevoir vos données dans un format structuré et lisible</li>
          <li><strong>Droit d'opposition</strong> — vous pouvez vous opposer au traitement de vos données dans certains cas</li>
        </ul>
        <p>
          Pour exercer l'un de ces droits, contactez-nous à : <strong>externalux6@gmail.com</strong>.
          Nous nous engageons à répondre dans un délai de 30 jours.
        </p>
      </Section>

      <Section title="7. Sécurité des données">
        <p>Juna met en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos données :</p>
        <ul>
          <li><strong>Chiffrement en transit</strong> — toutes les communications entre votre appareil et nos serveurs sont chiffrées via HTTPS (TLS)</li>
          <li><strong>Mots de passe hashés</strong> — vos mots de passe ne sont jamais stockés en clair. Nous utilisons un algorithme de hachage sécurisé</li>
          <li><strong>Tokens JWT sécurisés</strong> — l'authentification est gérée par des tokens à durée de vie limitée</li>
          <li><strong>Accès restreint</strong> — seules les personnes habilitées au sein de l'équipe Juna ont accès aux données sensibles</li>
        </ul>
        <p>
          En cas de violation de données susceptible d'affecter vos droits, nous nous engageons à vous en informer
          dans les meilleurs délais.
        </p>
      </Section>

      <Section title="8. Modifications de cette politique">
        <p>
          Juna se réserve le droit de modifier la présente politique de confidentialité à tout moment,
          notamment pour se conformer à de nouvelles obligations légales ou réglementaires.
        </p>
        <p>
          En cas de modification substantielle, vous serez notifié par email ou via une notification
          dans l'application. La date de dernière mise à jour est indiquée en haut de cette page.
          L'utilisation continue du service après notification vaut acceptation des nouvelles dispositions.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>Pour toute question relative à cette politique ou au traitement de vos données personnelles :</p>
        <div className="bg-surface-grey rounded-xl p-4 flex flex-col gap-1.5 text-sm">
          <p><strong>ExternaLux6</strong> — éditeur de Juna</p>
          <p>Forme juridique : Etablissement</p>
          <p>N° RCCM : RB/COT/23 A 91500</p>
          <p>N° IFU : 0202233129461</p>
          <p>Immatriculée à Cotonou, Bénin</p>
          <p className="mt-1">Email : <strong>externalux6@gmail.com</strong></p>
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
      <div className="flex flex-col gap-3 text-text-secondary text-sm leading-relaxed [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-4 [&_ul]:list-disc [&_li]:leading-relaxed [&_strong]:text-text-primary">
        {children}
      </div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-bold text-text-light uppercase tracking-widest">{title}</p>
      <div className="[&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-4 [&_ul]:list-disc">
        {children}
      </div>
    </div>
  )
}
