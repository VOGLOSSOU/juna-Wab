import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Juna - Conditions Générales d'Utilisation",
  description: "Consultez les conditions générales d'utilisation de Juna. Droits, obligations et règles d'utilisation de la plateforme d'abonnements repas.",
  keywords: "CGU Juna, conditions d'utilisation, règles d'utilisation, abonnement repas, conditions générales",
  openGraph: {
    title: "Juna - Conditions Générales d'Utilisation",
    description: "Consultez les conditions générales d'utilisation de Juna.",
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-10">

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-text-primary">{"Conditions Générales d'Utilisation"}</h1>
        <p className="text-sm text-text-secondary">Dernière mise à jour : avril 2025</p>
      </div>

      <Section title="1. Objet">
        <p>
          Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation
          de la plateforme <strong>Juna</strong> (site web et application mobile), éditée par{' '}
          <strong>ExternaLux6</strong>, entreprise individuelle immatriculée à Cotonou, Bénin
          (N° RCCM : RB/COT/23 A 91500 — N° IFU : 0202233129461).
        </p>
        <p>
          Juna est une <strong>plateforme d'intermédiation</strong> qui met en relation des utilisateurs
          souhaitant s'abonner à des repas avec des prestataires (traiteurs, restaurateurs, cuisiniers)
          proposant des abonnements repas.
        </p>
        <p>
          Juna agit en tant qu'<strong>intermédiaire technique</strong> et n'est en aucun cas un
          restaurateur, un traiteur ou un service de livraison. La préparation, la qualité et la
          livraison des repas relèvent de la seule responsabilité du prestataire concerné.
        </p>
        <p>
          Toute utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.
        </p>
      </Section>

      <Section title="2. Accès au service">
        <ul>
          <li>L'accès à Juna est ouvert à toute personne physique âgée d'au moins <strong>18 ans</strong>, ou mineure avec l'autorisation d'un représentant légal.</li>
          <li>L'inscription est obligatoire pour passer une commande ou souscrire à un abonnement.</li>
          <li>Chaque utilisateur ne peut posséder <strong>qu'un seul compte personnel</strong>. La création de comptes multiples est interdite.</li>
          <li>L'utilisateur est seul responsable de la confidentialité de ses identifiants (email et mot de passe). Toute connexion effectuée depuis son compte lui est attribuée.</li>
          <li>En cas de suspicion d'utilisation frauduleuse de son compte, l'utilisateur doit en informer Juna immédiatement à <strong>externalux6@gmail.com</strong>.</li>
        </ul>
      </Section>

      <Section title="3. Comptes prestataires">
        <p>
          Les prestataires souhaitant proposer leurs abonnements sur Juna doivent créer un compte
          prestataire et passer par un processus de validation avant toute mise en ligne.
        </p>
        <ul>
          <li><strong>Validation préalable</strong> — tout compte prestataire est examiné par l'équipe Juna avant activation. Juna se réserve le droit de refuser ou de suspendre un compte sans avoir à s'en justifier.</li>
          <li><strong>Obligations du prestataire</strong> — le prestataire s'engage à honorer les commandes confirmées, à respecter la qualité et la description des repas publiés, et à maintenir ses informations (disponibilité, tarifs, zones de livraison) à jour.</li>
          <li><strong>Suspension</strong> — en cas de manquement grave (non-respect des commandes, fausses informations, avis suspects), Juna peut suspendre ou supprimer le compte prestataire sans préavis.</li>
          <li>Le prestataire reconnaît être <strong>seul responsable</strong> des repas qu'il prépare, de leur qualité et de leur livraison.</li>
        </ul>
      </Section>

      <Section title="4. Responsabilités">
        <Subsection title="Juna est responsable de">
          <ul>
            <li>Le bon fonctionnement technique de la plateforme</li>
            <li>La sécurisation des paiements via PawaPay</li>
            <li>La mise en relation entre utilisateurs et prestataires</li>
            <li>La disponibilité du service dans des conditions normales d'utilisation</li>
          </ul>
        </Subsection>
        <Subsection title="Juna n'est pas responsable de">
          <ul>
            <li>La qualité, la fraîcheur ou la composition des repas préparés par les prestataires</li>
            <li>Les retards ou défauts de livraison imputables au prestataire</li>
            <li>Les litiges commerciaux entre un utilisateur et un prestataire</li>
            <li>Les interruptions de service dues à des tiers (opérateurs téléphoniques, hébergeur, force majeure)</li>
            <li>L'exactitude des informations publiées par les prestataires (photos, descriptions, horaires)</li>
          </ul>
        </Subsection>
      </Section>

      <Section title="5. Propriété intellectuelle">
        <p>
          Le nom <strong>Juna</strong>, la marque <strong>Junaeats</strong>, le logo, le design, les textes
          et l'ensemble du contenu de la plateforme sont la propriété exclusive d'<strong>ExternaLux6</strong>.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie
          de ces éléments, quel qu'en soit le moyen ou le support, est interdite sans autorisation
          écrite préalable d'ExternaLux6.
        </p>
        <p>
          Les contenus publiés par les prestataires (photos, descriptions) restent leur propriété.
          En les publiant sur Juna, ils accordent à ExternaLux6 une licence non exclusive d'utilisation
          pour les afficher sur la plateforme.
        </p>
      </Section>

      <Section title="6. Comportements interdits">
        <p>Il est strictement interdit sur la plateforme Juna de :</p>
        <ul>
          <li>Publier de faux avis ou de fausses évaluations</li>
          <li>Passer de fausses commandes dans le but de nuire à un prestataire</li>
          <li>Utiliser frauduleusement le système de paiement (faux numéros Mobile Money, tentatives d'arnaque)</li>
          <li>Contacter directement un prestataire pour contourner la plateforme et éviter les frais de service</li>
          <li>Utiliser des robots, scrapers ou tout outil automatisé pour accéder à la plateforme</li>
          <li>Tenter d'accéder à des comptes tiers ou à des données non destinées à l'utilisateur</li>
          <li>Publier des contenus illicites, diffamatoires, obscènes ou portant atteinte aux droits de tiers</li>
        </ul>
        <p>
          Tout manquement à ces règles peut entraîner la suspension immédiate du compte,
          sans préavis ni remboursement.
        </p>
      </Section>

      <Section title="7. Suspension et résiliation">
        <ul>
          <li>
            <strong>Par Juna</strong> — Juna se réserve le droit de suspendre ou de supprimer tout compte
            en cas de fraude, de violation des présentes CGU ou de comportement préjudiciable à la plateforme
            ou à ses utilisateurs, sans préavis et sans indemnité.
          </li>
          <li>
            <strong>Par l'utilisateur</strong> — l'utilisateur peut supprimer son compte à tout moment
            depuis les paramètres de son profil ou en envoyant une demande à{' '}
            <strong>externalux6@gmail.com</strong>. La suppression entraîne la perte de l'accès
            à l'historique des commandes et abonnements en cours.
          </li>
        </ul>
      </Section>

      <Section title="8. Modifications des CGU">
        <p>
          ExternaLux6 se réserve le droit de modifier les présentes CGU à tout moment, notamment
          pour s'adapter à l'évolution du service ou à de nouvelles obligations légales.
        </p>
        <p>
          Les utilisateurs seront informés de toute modification substantielle par email ou via
          une notification dans l'application. La poursuite de l'utilisation du service après
          notification vaut acceptation des nouvelles CGU.
        </p>
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
