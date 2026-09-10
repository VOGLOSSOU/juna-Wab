import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-jsonld'
import nathanPortrait from '@/team/nathan.jpg'
import juniorPortrait from '@/team/junior.jpg'
import frepelPortrait from '@/team/frepel.jpg'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Juna Eats connecte les Africains de l\'Ouest à des traiteurs locaux via des abonnements repas. Fini le stress du "qu\'est-ce que je mange ?". Mangez bien, sans se donner de la peine.',
  keywords: 'à propos Juna Eats, mission Juna Eats, abonnement repas, traiteur local, Junaeats, Bénin, Côte d\'Ivoire, food delivery, budget repas, gain de temps',
  openGraph: {
    title: 'À propos de Juna Eats - Mangez bien, sans se donner de la peine',
    description: 'Juna Eats connecte les Africains de l\'Ouest à des traiteurs locaux via des abonnements repas.',
    url: 'https://junaeats.com/about',
    siteName: 'Juna Eats',
    locale: 'fr_FR',
    images: [{ url: '/juna-logo.png', width: 800, height: 400, alt: 'Juna Eats' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'À propos de Juna Eats',
    description: 'Abonnements repas chez des traiteurs locaux en Afrique de l\'Ouest.',
    images: ['/juna-logo.png'],
  },
  alternates: { canonical: 'https://junaeats.com/about' },
}

function SectionLabel({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-widest text-primary mb-3 ${center ? 'text-center' : ''}`}>
      {children}
    </p>
  )
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col gap-3 p-6 bg-white rounded-2xl border border-border">
      <div className="w-11 h-11 rounded-xl bg-primary-surface flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
    </div>
  )
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
        {number}
      </div>
      <div className="flex flex-col gap-1 pt-1">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
    <BreadcrumbJsonLd items={[
      { name: 'Accueil', url: 'https://junaeats.com' },
      { name: 'À propos', url: 'https://junaeats.com/about' },
    ]} />
    <div className="flex flex-col">

      {/* ── HERO ── */}
      <section className="relative min-h-[580px] flex flex-col items-center justify-center overflow-hidden bg-[#0d2e18]">
        <div className="absolute inset-0">
          <Image
            src="/plat-2.png"
            alt=""
            fill
            className="object-cover object-center opacity-20"
            sizes="100vw"
            priority
          />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center gap-6 px-6 py-24 max-w-3xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">À propos de Juna Eats</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
            On a résolu<br />un problème quotidien.
          </h1>
          <p className="text-white/75 text-lg md:text-xl max-w-xl leading-relaxed">
            Chaque jour, des millions de personnes perdent du temps, de l&apos;énergie
            et de l&apos;argent sur une seule question :{' '}
            <em className="text-white/90 not-italic font-medium">&ldquo;Qu&apos;est-ce que je mange aujourd&apos;hui ?&rdquo;</em>
          </p>
        </div>

        {/* Flèche scroll animée */}
        <div className="relative z-10 pb-10 flex flex-col items-center gap-1">
          <span className="text-white/40 text-xs tracking-wide">Découvrir</span>
          <div className="animate-bounce">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/50">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ── NOTRE HISTOIRE ── */}
      <section aria-labelledby="our-story-title" className="bg-[#F7F5EF] py-16 md:py-24 lg:py-32">
        <div className="max-w-content mx-auto px-6">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)] lg:gap-20 items-start">
            <div className="lg:sticky lg:top-28">
              <SectionLabel>Notre histoire</SectionLabel>
              <h2 id="our-story-title" className="max-w-md text-4xl md:text-5xl font-bold text-text-primary leading-[1.15] tracking-tight">
                L&apos;histoire derrière{' '}
                <span className="font-serif font-normal italic text-primary">Juna Eats.</span>
              </h2>
              <p className="mt-6 max-w-xs text-sm leading-7 text-text-secondary">
                Un voyage à préparer. Une idée dans un cahier.
              </p>
              <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Par Nathan VOGLOSSOU
              </p>
            </div>
            <figure className="min-w-0">
              <span aria-hidden="true" className="block h-20 select-none font-serif text-[140px] leading-none text-primary/25 md:h-24 md:text-[180px]">
                &ldquo;
              </span>
              <blockquote className="flex flex-col gap-6 text-[#55584F] text-[15px] leading-7 md:text-base md:leading-8">
              <p className="text-lg leading-8 text-text-primary md:text-xl md:leading-9">
                Junior AZONNOUDO et moi nous sommes rencontrés à l&apos;université. Depuis,
                nous avons toujours aimé travailler ensemble et porter des projets communs.
                Notre projet de fin d&apos;études en informatique s&apos;appelait déjà{' '}
                <strong className="text-text-primary">Juna, pour Junior et Nathan.</strong>
              </p>
              <p>
                Un matin, pendant notre stage de fin de formation, je lui ai proposé de partir
                à Lomé. L&apos;idée était de nous retirer dans une autre ville pour nous consacrer
                pleinement à ce projet. En lui expliquant mon plan, j&apos;ai précisé une chose :
                je ne voulais surtout pas emporter de casseroles ni d&apos;ustensiles de cuisine.
                Je voulais qu&apos;on voyage léger, avec seulement nos ordinateurs de travail.
              </p>
              <p>
                C&apos;est au cours de cette discussion que l&apos;idée m&apos;est venue,
                comme une évidence :
              </p>
              <p className="py-4 font-serif text-2xl italic text-primary leading-relaxed md:py-6 md:text-3xl md:leading-relaxed">
                &ldquo;Junior, j&apos;ai une idée ! Et si on créait une application qui nous
                permettrait, une fois sur place, de découvrir des abonnements repas et
                d&apos;y souscrire depuis notre logement ? Ensuite, on choisirait d&apos;aller
                chercher nos repas ou de se faire livrer !&rdquo;
              </p>
              <details className="group">
                <summary className="flex min-h-12 w-fit cursor-pointer list-none items-center gap-3 rounded-full bg-primary/5 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  <span className="group-open:hidden">Lire la suite de notre histoire</span>
                  <span className="hidden group-open:inline">Réduire le récit</span>
                  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="mt-8 flex flex-col gap-6">
              <p>
                J&apos;ai couru chercher un cahier pour noter l&apos;idée telle qu&apos;elle venait
                de m&apos;apparaître. Puis j&apos;ai dit à Junior que, comme pour nos précédents
                projets, je voulais construire celui-ci avec lui. Et je voulais l&apos;appeler
                Juna. Nous savions que notre projet de fin d&apos;études ne se poursuivrait pas
                après la formation ; ce nom allait désormais porter une nouvelle aventure.
                C&apos;est ainsi qu&apos;est né le concept de base de Juna Eats.
              </p>
              <p>
                La possibilité de composer son propre abonnement est arrivée plus tard,
                pendant le développement : si un utilisateur ne trouvait pas la formule
                qui lui convenait, il pourrait en proposer une et la soumettre au prestataire.
                Nous avons continué à construire le produit en échangeant directement avec
                ses futurs utilisateurs et en intégrant leurs retours au fur et à mesure.
              </p>
              <p>
                Pour me consacrer entièrement à Juna Eats, j&apos;ai choisi de reporter
                d&apos;un an mes études de master. J&apos;ai aussi fait des voyages spécialement
                pour rencontrer les utilisateurs sur le terrain, discuter avec eux et
                comprendre leurs habitudes. Ces échanges nous ont appris que beaucoup
                auraient aimé pouvoir s&apos;abonner aux repas de leur vendeur de nourriture
                préféré.
              </p>
              <p>
                Aujourd&apos;hui, Juna Eats est un produit que des personnes utilisent pour
                répondre à un vrai besoin du quotidien. Il continue de grandir, jour après
                jour, avec elles. Tout est parti d&apos;une conversation entre Junior et moi,
                d&apos;un voyage que nous préparions et d&apos;une idée notée dans un cahier.
              </p>
                </div>
              </details>
              </blockquote>
              <span aria-hidden="true" className="mt-2 block h-16 select-none text-right font-serif text-[120px] leading-none text-primary/25">
                &rdquo;
              </span>
            </figure>
          </div>
        </div>
      </section>

      {/* ── UN BESOIN PARTAGÉ ── */}
      <section className="bg-white py-24">
        <div className="max-w-content mx-auto px-6">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
            <SectionLabel center>Un besoin partagé</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
              Notre question était aussi<br />
              <span className="text-primary">celle de beaucoup d&apos;autres.</span>
            </h2>
            <div className="flex flex-col gap-4 text-text-secondary text-base leading-relaxed text-left">
              <p>
                Au fil de nos échanges avec les utilisateurs, nous avons compris que ce besoin
                dépassait largement notre projet de voyage. Beaucoup souhaitaient pouvoir{' '}
                <strong className="text-text-primary">s&apos;abonner aux repas de leur vendeur préféré</strong>,
                au lieu de commander au jour le jour.
              </p>
              <p>
                Pour un étudiant entre les cours et les révisions, un stagiaire loin de chez lui
                ou un professionnel pris par son travail, organiser ses repas demande du temps
                et un budget à anticiper. Même lorsqu&apos;on sait où bien manger, il reste
                à s&apos;organiser chaque jour.
              </p>
              <p>
                Les cuisiniers sont là. Les habitudes et les préférences aussi. Ce qui manquait
                aux personnes rencontrées, c&apos;était un moyen simple de prévoir leurs repas
                auprès de ceux qu&apos;elles choisissent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── LA RÉPONSE ── */}
      <section className="bg-surface-grey py-24">
        <div className="max-w-content mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6">
              <SectionLabel>Notre réponse</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
                Juna Eats, c&apos;est votre<br />cuisine du quartier.<br />
                <span className="text-primary">Sans la cuisine.</span>
              </h2>
              <div className="flex flex-col gap-4 text-text-secondary text-base leading-relaxed">
                <p>
                  Juna Eats connecte des particuliers à des cuisiniers, traiteurs et restaurateurs
                  locaux via un système d&apos;abonnement repas. Vous choisissez un prestataire
                  près de chez vous, vous choisissez une formule —
                  petit-déjeuner, déjeuner, dîner, ou tout ça — et c&apos;est réglé.
                </p>
                <p>
                  Vous ne trouvez pas la formule idéale ? Proposez la vôtre directement
                  au prestataire de votre choix. Vous décrivez vos préférences, choisissez
                  vos plats et la durée — le prestataire valide, et c&apos;est parti.
                </p>
                <p>
                  Vous ne réfléchissez plus. Votre repas vous attend, préparé par
                  quelqu&apos;un qui sait cuisiner, chaque jour. Livré chez vous
                  ou disponible à récupérer sur place — vous choisissez.
                </p>
                <p>
                  <strong className="text-text-primary">Une seule décision. Des semaines de tranquillité.</strong>
                </p>
              </div>
            </div>
            <div className="relative h-80 lg:h-[420px] rounded-2xl overflow-hidden bg-[#0d2e18]">
              <Image
                src="/plat-1.png"
                alt="Un repas préparé par un prestataire Juna Eats"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-semibold">Des repas faits avec soin.</p>
                <p className="text-white/70 text-sm mt-1">Par des cuisiniers locaux que vous pouvez voir et choisir.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      <section className="bg-white py-24">
        <div className="max-w-content mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <SectionLabel center>Comment ça marche</SectionLabel>
              <h2 className="text-3xl font-bold text-text-primary">
                Trois étapes. C&apos;est tout.
              </h2>
            </div>
            <div className="flex flex-col gap-8">
              <Step
                number="1"
                title="Explorez les abonnements"
                text="Parcourez les abonnements repas disponibles dans votre ville. Voyez les formules, les tarifs, les modes de réception. Le prestataire associé est visible directement sur chaque abonnement."
              />
              <Step
                number="2"
                title="Souscrivez ou créez votre formule"
                text="Choisissez une formule existante — petit-déjeuner, déjeuner, dîner ou journée complète. Ou proposez directement votre propre abonnement sur mesure à un prestataire : vous choisissez les plats, la durée, la fréquence. Il valide en quelques clics."
              />
              <Step
                number="3"
                title="Mangez. Sans y penser."
                text="Votre repas vous est livré chaque jour ou disponible sur place. Vous n'avez plus à y penser. Votre prestataire s'occupe du reste. Chaque jour, sans exception."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── CE QUE VOUS GAGNEZ ── */}
      <section className="bg-surface-grey py-24">
        <div className="max-w-content mx-auto px-6">
          <div className="text-center mb-12">
            <SectionLabel center>La valeur</SectionLabel>
            <h2 className="text-3xl font-bold text-text-primary">
              Ce que vous gagnez vraiment avec Juna Eats.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ValueCard
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              title="Du temps retrouvé"
              text="Fini de chercher, de décider, de cuisiner. Chaque minute économisée est une minute pour ce qui compte vraiment dans votre journée."
            />
            <ValueCard
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 6v6l4 2"/></svg>}
              title="La tranquillité mentale"
              text="La question de quoi manger disparaît de votre quotidien. Une charge mentale en moins — petite en apparence, énorme dans la réalité."
            />
            <ValueCard
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
              title="Un budget maîtrisé"
              text="Vous savez exactement combien vous dépensez. Un abonnement, un prix, une sérénité financière sur vos repas. Plus de petites dépenses qui s'accumulent."
            />
            <ValueCard
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
              title="Manger mieux"
              text="Des repas préparés par de vrais cuisiniers, avec de vrais ingrédients. Pas du fast-food commandé dans la précipitation. Une alimentation plus saine, plus régulière."
            />
            <ValueCard
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>}
              title="Soutenir le local"
              text="Chaque abonnement souscrit finance directement un cuisinier de votre quartier. Vous mangez bien et vous faites grandir une économie locale de qualité."
            />
            <ValueCard
              icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
              title="De la confiance"
              text="Vous choisissez votre prestataire, vous le connaissez. Pas de surprise, pas d'aléatoire. Vous savez qui prépare vos repas. La confiance, ça se construit."
            />
          </div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="bg-white py-24">
        <div className="max-w-content mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
            <SectionLabel center>Notre mission</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
              Éliminer la galère du<br />&ldquo;qu&apos;est-ce que je mange ?&rdquo;<br />chaque jour.
            </h2>
            <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
              Trouver un bon repas chaque jour, c&apos;est une vraie friction : décider quoi manger,
              trouver où l&apos;acheter, se déplacer, gérer le budget, recommencer le lendemain.
              Cette charge mentale quotidienne, silencieuse mais réelle, épuise — et Juna Eats existe pour la supprimer.
            </p>
            <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
              Notre mission : rendre les bons repas accessibles à tous, sans friction, sans galère, sans se donner de la peine.
              Un abonnement, un prestataire de confiance, et votre repas est là — chaque jour.
            </p>
            <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
              En même temps, nous croyons que les talents culinaires locaux méritent
              une vraie plateforme. Des femmes et des hommes qui savent cuisiner,
              qui ont du savoir-faire, et qui n&apos;avaient pas les outils pour en vivre dignement.
              Juna Eats leur donne cette plateforme.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4 w-full">
              {[
                { n: '01', label: 'Accessibilité alimentaire' },
                { n: '02', label: 'Valorisation du local' },
                { n: '03', label: 'Tranquillité au quotidien' },
              ].map(({ n, label }) => (
                <div key={n} className="flex flex-col items-center gap-2 p-5 bg-surface-grey rounded-2xl">
                  <span className="text-2xl font-bold text-primary">{n}</span>
                  <span className="text-xs text-text-secondary text-center font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── L'ÉQUIPE ── */}
      <section aria-labelledby="team-title" className="bg-[#F7F5EF] py-16 md:py-24 lg:py-32">
        <div className="max-w-content mx-auto px-6">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-20 items-start mb-12 md:mb-16">
            <div>
              <SectionLabel>L&apos;équipe actuelle</SectionLabel>
              <h2 id="team-title" className="max-w-lg text-4xl md:text-5xl font-bold text-text-primary leading-[1.15] tracking-tight">
                Les visages derrière{' '}
                <span className="font-serif font-normal italic text-primary">Juna Eats.</span>
              </h2>
            </div>
            <div className="flex flex-col gap-4 text-text-secondary text-base leading-8">
              <p>
                L&apos;idée était là, mais il fallait d&apos;abord terminer notre projet de fin
                d&apos;études et passer la soutenance. Ensuite, Junior et moi pouvions enfin
                nous attaquer à ce qu&apos;on appelait entre nous le &ldquo;vrai Juna&rdquo;.
              </p>
              <p>
                Nous étions tous les deux développeurs. J&apos;avais aussi des compétences
                en communication, en marketing et en vente, mais nous ne savions pas tout
                faire. Pour les interfaces de l&apos;application, le logo et la charte graphique,
                il nous fallait un designer. J&apos;ai donc fait appel à Uriel LISSAN,
                très bon dans ce domaine, qui a accepté de rejoindre l&apos;aventure.
              </p>
              <p>
                Seulement voilà : Uriel, c&apos;est un peu notre fantôme dans l&apos;équipe
                (rires). Il disparaît, puis réapparaît quand on arrive à le joindre.
                Il peut passer des mois sans donner de nouvelles, manquer les réunions
                et laisser les messages du groupe sans réponse. Pour l&apos;avoir au téléphone,
                il faut parfois plusieurs tentatives. Son talent est bien là ; sa disponibilité,
                elle, joue à cache-cache.
              </p>
              <p>
                Et cela a eu un effet très concret : le développement a pris du retard,
                parce que nous attendions les interfaces pour avancer. Uriel a réalisé
                le logo et quelques pages basiques, dont nous nous sommes inspirés pour
                la suite du développement. Puis Junior et moi avons repris les choses
                en main et continué le travail. Il fait toujours partie de l&apos;équipe :
                pour des tâches précises, nous pouvons faire appel à lui. Mais au quotidien,
                il garde pour l&apos;instant sa casquette de fantôme.
              </p>
              <p>
                En avançant, un autre besoin s&apos;est imposé : la communication sur les
                réseaux sociaux. Malgré mes compétences, il nous fallait une expertise
                supplémentaire sur ce sujet. J&apos;ai invité Frepel ASSAN, étudiant en
                intelligence artificielle et en communication, à nous rejoindre. Il est
                devenu notre CMO, notre responsable marketing, et s&apos;occupe des stratégies
                de communication et de marketing.
              </p>
              <p>
                Aujourd&apos;hui, nous sommes donc trois membres permanents : Junior,
                cofondateur et CTO, qui pilote la technique ; Frepel, à la communication
                et au marketing ; et moi, cofondateur et CEO, au développement avec Junior,
                à la direction du projet et à la vente. Et Uriel reste des nôtres,
                à son rythme. Voilà notre équipe, telle qu&apos;elle est réellement.
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                L&apos;équipe racontée par Nathan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 lg:gap-10">
            {[
              {
                name: 'Nathan VOGLOSSOU',
                role: 'Cofondateur & CEO',
                specialty: 'Direction · Développement · Vente',
                portrait: nathanPortrait,
              },
              {
                name: 'Junior AZONNOUDO',
                role: 'Cofondateur & CTO',
                specialty: 'Direction technique · Développement',
                portrait: juniorPortrait,
              },
              {
                name: 'Frepel ASSAN',
                role: 'CMO · Responsable marketing',
                specialty: 'Communication · Réseaux sociaux',
                portrait: frepelPortrait,
              },
            ].map(({ name, role, specialty, portrait }) => (
              <article key={name} className="min-w-0">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#E9E5DC]">
                  <Image
                    src={portrait}
                    alt={`Portrait de ${name}`}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 1280px) 384px, (min-width: 768px) 33vw, 100vw"
                    className="object-cover object-top"
                  />
                </div>
                <div className="pt-6">
                  <h3 className="text-xl lg:text-2xl font-semibold tracking-tight text-text-primary">{name}</h3>
                  <p className="mt-2 text-sm font-semibold text-primary">{role}</p>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">{specialty}</p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-10 max-w-2xl mx-auto text-center font-serif text-lg italic leading-8 text-text-secondary">
            Et Uriel sur les photos ? Je lui ai demandé la sienne, notamment pour nos dossiers
            de candidature… elle se fait toujours attendre. Il est bien dans l&apos;équipe,
            simplement pas encore dans la galerie. Tant mieux pour sa réputation de fantôme :
            aucune photo ne vient le trahir !
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-[#0d2e18] py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/plat-3.png" alt="" fill className="object-cover opacity-10" sizes="100vw" />
        </div>
        <div className="relative z-10 max-w-content mx-auto px-6 flex flex-col items-center text-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Rejoindre Juna Eats</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Prêt à manger mieux,<br />sans se donner de la peine ?
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-lg leading-relaxed">
              Choisissez un prestataire près de chez vous. Abonnez-vous.
              Et laissez quelqu&apos;un d&apos;autre s&apos;occuper de vos repas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/auth/register"
              className="group inline-flex items-center gap-3 h-14 px-8 bg-white text-primary font-bold rounded-2xl hover:bg-white/95 transition-all text-sm shadow-lg shadow-black/20"
            >
              Créer mon compte gratuitement
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-0.5 transition-transform">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
            <Link
              href="/explorer"
              className="inline-flex items-center gap-2 h-14 px-8 text-white font-semibold rounded-2xl transition-all text-sm border border-white/20 hover:border-white/40 hover:bg-white/5"
            >
              Explorer les abonnements
            </Link>
          </div>

          <p className="text-white/30 text-xs">Gratuit. Sans engagement. Annulable à tout moment.</p>
        </div>
      </section>

    </div>
    </>
  )
}
