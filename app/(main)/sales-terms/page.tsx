/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente',
  description: 'Consultez les conditions générales de vente de Juna Eats : processus de commande, paiement Mobile Money, activation et politique de remboursement.',
  keywords: 'CGV Juna Eats, conditions de vente, paiement Mobile Money, commande repas, abonnement repas, remboursement',
  openGraph: {
    title: 'Juna Eats - Conditions Générales de Vente',
    description: 'Consultez les conditions générales de vente de Juna Eats : commande, paiement, activation.',
    images: [{ url: 'https://junaeats.com/juna-logo.png', width: 800, height: 400, alt: 'Juna Eats' }],
    type: 'website',
  },
}

export default function SalesTermsPage() {
  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: 'Accueil', url: 'https://junaeats.com' },
      { name: 'Conditions de vente', url: 'https://junaeats.com/sales-terms' },
    ]} />
    <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col gap-10">

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold text-text-primary">Conditions Générales de Vente</h1>
        <p className="text-sm text-text-secondary">Dernière mise à jour : septembre 2026</p>
      </div>

      <Section title="1. Objet">
        <p>
          Les présentes Conditions Générales de Vente (CGV) encadrent les transactions réalisées
          entre les utilisateurs et les prestataires de repas via la plateforme <strong>Juna Eats</strong>,
          éditée par <strong>ExternaLux6</strong>, établissement immatriculé à Cotonou, Bénin
          (N° RCCM : RB/COT/23 A 91500 — N° IFU : 0202233129461).
        </p>
        <p>
          Toute commande passée sur Juna Eats implique l'acceptation pleine et entière des présentes CGV.
        </p>
      </Section>

      <Section title="2. Processus de commande">
        <p>La souscription à un abonnement repas sur Juna Eats se déroule en plusieurs étapes :</p>
        <ol>
          <li><strong>Sélection d'un abonnement</strong> — l'utilisateur choisit un abonnement proposé par un prestataire disponible dans sa ville.</li>
          <li><strong>Choix du mode de réception</strong> — livraison à domicile ou retrait sur place, selon les options proposées par le prestataire.</li>
          <li><strong>Paiement</strong> — règlement en ligne via Mobile Money (ou en espèces selon le prestataire).</li>
          <li><strong>Confirmation de commande</strong> — la commande est confirmée après validation du paiement. Un récapitulatif est accessible depuis le profil de l'utilisateur.</li>
          <li><strong>Activation par l'utilisateur</strong> — l'utilisateur active sa commande une fois qu'il confirme avoir reçu son premier repas ou être prêt à démarrer l'abonnement.</li>
          <li><strong>Démarrage de l'abonnement</strong> — l'abonnement est actif et le prestataire assure la fourniture des repas.</li>
        </ol>
      </Section>

      <Section title="3. Prix et paiement">
        <ul>
          <li>Les prix sont affichés en <strong>Francs CFA (XOF)</strong>, toutes taxes comprises.</li>
          <li>Le prix affiché inclut la <strong>commission de service Juna Eats de 10 %</strong> (voir article 5).</li>
          <li>
            Le paiement s'effectue de manière sécurisée via <strong>PawaPay</strong>, qui prend en charge
            les opérateurs Mobile Money suivants : MTN MoMo, Moov Money, Orange Money, Wave.
          </li>
          <li>Un paiement en espèces peut être possible selon les modalités définies par le prestataire.</li>
          <li>
            Les <strong>frais de livraison</strong>, s'ils s'appliquent, sont négociés directement entre
            l'utilisateur et le prestataire. Ils ne sont pas inclus dans le prix affiché sur la plateforme.
          </li>
          <li>La commande n'est <strong>confirmée qu'après validation effective du paiement</strong>. Aucune commande n'est transmise au prestataire avant réception du paiement.</li>
        </ul>
      </Section>

      <Section title="4. Activation de la commande">
        <p>
          Une fois le paiement confirmé, la commande passe à l'état <strong>« En attente d'activation »</strong>.
          L'utilisateur doit activer sa commande manuellement depuis son espace profil.
        </p>
        <p>
          L'activation signifie que l'utilisateur confirme avoir reçu son premier repas ou être prêt
          à démarrer l'abonnement. Elle constitue la condition préalable au reversement au prestataire
          des sommes qui lui reviennent.
        </p>
        <p>
          Tant que la commande n'est pas activée, aucun reversement n'est effectué au prestataire.
          Ce mécanisme protège l'utilisateur en lui laissant le contrôle du démarrage effectif de l'abonnement.
        </p>
      </Section>

      <Section title="5. Commission et rémunération du prestataire">
        <p>
          Juna Eats perçoit une <strong>commission fixe de 10 %</strong> sur le prix payé par l'utilisateur
          pour chaque abonnement vendu via la plateforme. Ce taux est identique pour tous les prestataires
          et n'est pas négociable depuis l'application.
        </p>
        <p>
          Le prestataire fixe le montant qu'il souhaite percevoir pour un abonnement. Le prix affiché à
          l'utilisateur est calculé à partir de ce montant de sorte que la commission représente 10 % du
          prix payé. Le prestataire a donc vocation à recevoir l'intégralité du montant qu'il a fixé,
          soit 90 % du prix payé par l'utilisateur.
        </p>
        <p>
          <strong>À ce jour, le reversement au prestataire n'est pas automatisé.</strong> Il est traité
          manuellement par Juna Eats, après activation de la commande, selon les modalités communiquées
          au prestataire. Un mécanisme de reversement automatique sera mis en place ultérieurement ; les
          présentes CGV seront mises à jour à cette occasion.
        </p>
      </Section>

      <Section title="6. Annulation et remboursement">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
          <svg className="flex-shrink-0 mt-0.5 text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>L'annulation de commande n'est pas encore disponible sur Juna Eats.</strong>{' '}
            Cette fonctionnalité est en cours de développement et sera prochainement accessible depuis votre espace commandes.
            En attendant, nous vous invitons à vérifier attentivement les détails de l'abonnement (prestataire, durée,
            type de repas, mode de réception) avant de finaliser votre paiement. Une fois la commande
            passée et le paiement validé, elle ne peut pas être annulée pour le moment.
          </p>
        </div>
        <p>
          En cas de <strong>non-livraison avérée</strong> ou de manquement grave du prestataire,
          vous pouvez nous contacter à <strong>externalux6@gmail.com</strong>. Chaque situation
          sera examinée individuellement et un remboursement pourra être envisagé au cas par cas.
        </p>
      </Section>

      <Section title="7. Litiges">
        <p>
          En cas de litige avec un prestataire (repas non conforme, non-livraison, qualité insuffisante),
          nous vous invitons à contacter Juna Eats en premier lieu à <strong>externalux6@gmail.com</strong>.
        </p>
        <p>
          Juna Eats joue un rôle de <strong>médiateur</strong> entre l'utilisateur et le prestataire.
          Nous ferons notre possible pour faciliter la résolution du litige, sans toutefois pouvoir
          être tenus responsables des manquements directs du prestataire.
        </p>
      </Section>

      <Section title="8. Force majeure">
        <p>
          Juna Eats ne peut être tenu responsable de tout retard ou inexécution résultant d'un événement
          imprévisible et indépendant de sa volonté, notamment :
        </p>
        <ul>
          <li>Coupure ou instabilité du réseau internet ou mobile</li>
          <li>Indisponibilité temporaire d'un opérateur Mobile Money (MTN, Moov, Orange, Wave)</li>
          <li>Interruption de service de l'hébergeur (Railway)</li>
          <li>Tout autre événement de force majeure au sens du droit applicable</li>
        </ul>
        <p>
          En cas d'interruption du service, Juna Eats s'engage à rétablir l'accès dans les meilleurs délais
          et à informer les utilisateurs concernés.
        </p>
      </Section>

    </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-text-primary border-b border-border pb-2">{title}</h2>
      <div className="flex flex-col gap-3 text-text-secondary text-sm leading-relaxed [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-2 [&_ol]:pl-4 [&_ol]:list-decimal [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-4 [&_ul]:list-disc [&_li]:leading-relaxed [&_strong]:text-text-primary">
        {children}
      </div>
    </section>
  )
}
