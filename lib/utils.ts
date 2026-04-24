import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { SubscriptionType, SubscriptionDuration, SubscriptionCategory, OrderStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'XOF'): string {
  return `${amount.toLocaleString('fr-FR')} ${currency}`
}

export function timeAgo(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d.getTime())) return '—'
  return format(d, 'd MMMM yyyy', { locale: fr })
}

export const SUBSCRIPTION_TYPE_LABELS: Record<SubscriptionType, string> = {
  BREAKFAST:       'Petit-déjeuner',
  LUNCH:           'Déjeuner',
  DINNER:          'Dîner',
  SNACK:           'Snack',
  BREAKFAST_LUNCH:  'Petit-déj + Déjeuner',
  BREAKFAST_DINNER: 'Petit-déj + Dîner',
  LUNCH_DINNER:     'Déjeuner + Dîner',
  FULL_DAY:        'Journée complète',
  CUSTOM:          'Personnalisé',
}

export const SUBSCRIPTION_DURATION_LABELS: Record<SubscriptionDuration, string> = {
  DAY:         '1 jour',
  THREE_DAYS:  '3 jours',
  WORK_WEEK:   'Semaine de travail',
  WEEK:        '1 semaine',
  TWO_WEEKS:   '2 semaines',
  WORK_WEEK_2: '2 semaines de travail',
  WORK_MONTH:  'Mois de travail',
  MONTH:       '1 mois',
  WEEKEND:     'Week-end',
}

export const SUBSCRIPTION_CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  AFRICAN:     'Africain',
  VEGETARIAN:  'Végétarien',
  HALAL:       'Halal',
  ASIAN:       'Asiatique',
  VEGAN:       'Vegan',
  EUROPEAN:    'Européen',
  FAST_FOOD:   'Fast-food',
  HEALTHY:     'Healthy',
  AMERICAN:    'Américain',
  FUSION:      'Fusion',
  OTHER:       'Autre',
}

export const SUBSCRIPTION_TYPE_DESCRIPTIONS: Record<SubscriptionType, string> = {
  BREAKFAST:        'Vous recevez un petit-déjeuner chaque matin — pain, œufs, bouillies, jus ou plats locaux du matin — préparé et mis à disposition à l\'heure du petit-déjeuner.',
  LUNCH:            'Un repas complet vous attend chaque jour à l\'heure du déjeuner. Fini de courir chercher à manger à la pause — votre repas est déjà prêt.',
  DINNER:           'Le repas du soir est pris en charge. Le prestataire prépare votre dîner et vous le livre ou le met à disposition chaque soir. Vous rentrez chez vous — votre repas vous attend.',
  SNACK:            'Une collation quotidienne — un encas, une petite faim de l\'après-midi, un jus ou un goûter. Idéal pour tenir entre deux repas sans se soucier de quoi manger.',
  BREAKFAST_LUNCH:  'Deux repas par jour couverts : le matin et le midi. Vous commencez la journée avec un petit-déjeuner préparé, et retrouvez un déjeuner complet à la pause. Il ne reste que le soir.',
  BREAKFAST_DINNER: 'Le début et la fin de votre journée sont couverts. Le matin, un petit-déjeuner pour démarrer. Le soir, un dîner pour terminer. Le déjeuner reste à votre charge.',
  LUNCH_DINNER:     'Le midi et le soir couverts. Plus besoin de penser à cuisiner après le travail ni à trouver quelque chose à manger le midi. Seul le petit-déjeuner reste à votre charge.',
  FULL_DAY:         'La formule la plus complète : petit-déjeuner, déjeuner et dîner sont tous inclus. Trois repas par jour, préparés par le prestataire. La tranquillité alimentaire totale.',
  CUSTOM:           'Le prestataire a composé une formule sur mesure. Les détails exacts des repas inclus sont précisés dans la description ci-dessus. Lisez-la attentivement avant de souscrire.',
}

export const SUBSCRIPTION_DURATION_DESCRIPTIONS: Record<SubscriptionDuration, string> = {
  DAY:         'Un abonnement d\'une seule journée. Idéal pour tester un prestataire ou pour un besoin ponctuel sans engagement.',
  THREE_DAYS:  'L\'abonnement court sur 3 jours consécutifs à partir de la date de début choisie. Pratique pour un début de semaine ou un premier essai prolongé.',
  WORK_WEEK:   'Une semaine de travail : du lundi au vendredi, soit 5 jours. Le week-end n\'est pas inclus. Parfait pour être bien nourri pendant la semaine active.',
  WEEK:        'L\'abonnement s\'étend sur 7 jours complets, week-end inclus. Vous êtes couvert du lundi au dimanche, sans interruption.',
  TWO_WEEKS:   'Deux semaines complètes, soit 14 jours consécutifs, week-end inclus. Une bonne option pour tester un prestataire sur une durée significative.',
  WORK_WEEK_2: 'Deux semaines de travail consécutives, soit 10 jours ouvrés (lundi à vendredi, deux fois). Les week-ends sont exclus.',
  WORK_MONTH:  'Un mois entier de jours de travail : 20 jours ouvrés, 5 jours par semaine pendant 4 semaines. La formule idéale pour les actifs qui ne veulent pas payer les week-ends.',
  MONTH:       'Un mois complet, soit environ 30 jours consécutifs, week-end inclus. Vous bénéficiez de vos repas chaque jour du mois, du premier au dernier jour.',
  WEEKEND:     'Uniquement le samedi et le dimanche. Idéal pour ceux qui cuisinent en semaine mais veulent profiter d\'un service traiteur le week-end.',
}

export const SUBSCRIPTION_CATEGORY_DESCRIPTIONS: Record<SubscriptionCategory, string> = {
  AFRICAN:    'Des plats inspirés des traditions culinaires africaines — riz, sauces, attiéké, igname, plantain, viandes et poissons préparés selon les recettes locales.',
  EUROPEAN:   'Des plats d\'inspiration européenne — pâtes, grillades, salades composées, sandwichs élaborés, soupes. Un style occidental adapté aux saveurs d\'Europe.',
  ASIAN:      'Des spécialités d\'Asie — riz cantonnais, nouilles, plats sautés, soupes asiatiques, rouleaux. Des saveurs umami, épicées ou sucrées-salées.',
  AMERICAN:   'Un style inspiré de la cuisine américaine — burgers, wraps, poulet frit, frites, plats généreux et comfort food. Des portions copieuses et des saveurs directes.',
  FUSION:     'Un mélange créatif entre plusieurs traditions culinaires. Le prestataire combine différentes influences pour créer des plats originaux. Idéal pour ceux qui aiment la variété.',
  VEGETARIAN: 'Tous les plats sont sans viande ni poisson. Des légumes, légumineuses, œufs et produits laitiers composent les repas. Idéal pour ceux qui ne consomment pas de chair animale.',
  VEGAN:      'Aucun produit d\'origine animale — ni viande, ni poisson, ni œufs, ni produits laitiers. Une alimentation 100 % végétale.',
  HALAL:      'Tous les repas sont préparés selon les règles alimentaires halal. Les viandes sont abattues et traitées conformément aux prescriptions islamiques.',
  FAST_FOOD:  'Des plats rapides et accessibles — burgers, sandwichs, frites et snacks. Une cuisine pratique pour manger vite sans se compliquer la vie.',
  HEALTHY:    'Des repas pensés pour votre équilibre alimentaire — légumes, protéines maigres, céréales complètes. Manger bien sans sacrifier le goût.',
  OTHER:      'Le prestataire propose une cuisine qui ne rentre pas dans les catégories listées. Consultez la description pour connaître le style exact des repas proposés.',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    'En attente',
  CONFIRMED:  'Confirmée',
  ACTIVE:     'Active',
  COMPLETED:  'Terminée',
  CANCELLED:  'Annulée',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    '#9E9E9E',
  CONFIRMED:  '#1565C0',
  ACTIVE:     '#388E3C',
  COMPLETED:  '#1A5C2A',
  CANCELLED:  '#D32F2F',
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
