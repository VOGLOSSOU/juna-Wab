import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Juna - Abonnez-vous à votre resto, simplifiez votre quotidien',
  description: 'Juna vous connecte à vos restos préférés via des abonnements repas. Fini le stress du "qu\'est-ce que je mange ?". Maîtrisez votre budget, gagnez du temps, mangez bien.',
  keywords: 'abonnement repas, nourriture locale, livraison repas, traiteur, fournisseur local, plan alimentaire, Juna, Juna App, Junaeats, Juna Eats, Uber Eats, livraison de repas, plat livré, resto, restaurant, commander à manger, repas à domicile, food delivery, manger en ligne, budget repas, gain de temps, clientèle fidèle, à propos Juna, mission Juna',
  openGraph: {
    title: 'Juna - Abonnez-vous à votre resto, simplifiez votre quotidien',
    description: 'Juna vous connecte à vos restos préférés via des abonnements repas. Fini le stress du "qu\'est-ce que je mange ?". Maîtrisez votre budget, gagnez du temps, mangez bien.',
    images: [{ url: 'https://junaeats.com/logo_green_orange.png', width: 800, height: 400, alt: 'Juna' }],
    type: 'website',
  },
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
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent">À propos de JUNA</p>
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

      {/* ── LE PROBLÈME ── */}
      <section className="bg-white py-24">
        <div className="max-w-content mx-auto px-6">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-6">
            <SectionLabel center>Le problème</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary leading-tight">
              &ldquo;Qu&apos;est-ce que je mange ?&rdquo;<br />
              <span className="text-text-secondary font-normal">C&apos;est une question de tous les jours.</span>
            </h2>
            <div className="flex flex-col gap-4 text-text-secondary text-base leading-relaxed text-left">
              <p>
                Vous vous levez le matin. Avant même de commencer votre journée,
                votre cerveau commence à tourner : <strong className="text-text-primary">qu&apos;est-ce que je vais manger ce midi ?
                Ce soir ? Demain ?</strong> Vous sortez acheter quelque chose de rapide,
                pas forcément bon. Vous dépensez plus que prévu. Vous mangez mal.
                Et vous recommencez le lendemain.
              </p>
              <p>
                Ce n&apos;est pas un manque de volonté. C&apos;est simplement que personne
                n&apos;a pensé à rendre la chose facile. Les restaurants coûtent cher.
                Cuisiner prend du temps. Les apps de livraison sont pratiques mais
                onéreuses et aléatoires. Et à la fin de la semaine,
                vous avez <strong className="text-text-primary">dépensé trop, mangé n&apos;importe comment,
                et pensé à ça chaque jour.</strong>
              </p>
              <p>
                En Afrique de l&apos;Ouest, ce problème est encore plus marqué.
                Les cuisiniers et traiteurs locaux de qualité existent — ils sont nombreux,
                talentueux, accessibles. Mais il n&apos;existait pas de moyen simple
                de s&apos;y abonner, de leur faire confiance, de planifier ses repas
                avec eux sur la durée.
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
                JUNA, c&apos;est votre<br />cuisine du quartier.<br />
                <span className="text-primary">Sans la cuisine.</span>
              </h2>
              <div className="flex flex-col gap-4 text-text-secondary text-base leading-relaxed">
                <p>
                  JUNA connecte des particuliers à des cuisiniers, traiteurs et restaurateurs
                  locaux via un système d&apos;abonnement repas. Vous choisissez un prestataire
                  près de chez vous, vous choisissez une formule —
                  petit-déjeuner, déjeuner, dîner, ou tout ça — et c&apos;est réglé.
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
                alt="Un repas préparé par un prestataire JUNA"
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
                title="Choisissez votre prestataire"
                text="Parcourez les cuisiniers et traiteurs disponibles dans votre ville. Voyez leurs menus, leurs formules, leurs tarifs. Choisissez celui qui correspond à vos goûts."
              />
              <Step
                number="2"
                title="Souscrivez à un abonnement"
                text="Choisissez la formule qui vous correspond — petit-déjeuner, déjeuner, dîner ou journée complète. Pour 1 jour, une semaine, ou un mois entier. Vous payez une fois."
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
              Ce que vous gagnez vraiment avec JUNA.
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
              Rendre les bons repas<br />accessibles à tous,<br />chaque jour.
            </h2>
            <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
              JUNA croit que bien manger ne devrait pas être un luxe ni une corvée.
              Que chaque personne devrait pouvoir accéder à un repas de qualité préparé avec soin —
              sans passer des heures à cuisiner, ni dépenser une fortune.
            </p>
            <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
              En même temps, nous croyons que les talents culinaires locaux méritent
              une vraie plateforme. Des femmes et des hommes qui savent cuisiner,
              qui ont du savoir-faire, et qui n&apos;avaient pas les outils pour en vivre dignement.
              JUNA leur donne cette plateforme.
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

      {/* ── CTA FINAL ── */}
      <section className="bg-[#0d2e18] py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/plat-3.png" alt="" fill className="object-cover opacity-10" sizes="100vw" />
        </div>
        <div className="relative z-10 max-w-content mx-auto px-6 flex flex-col items-center text-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-accent">Rejoindre JUNA</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
              Prêt à manger mieux,<br />sans y penser ?
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
  )
}
