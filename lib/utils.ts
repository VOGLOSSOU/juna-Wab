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

export function timeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

export function formatDate(date: string): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: fr })
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

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING:    'En attente',
  CONFIRMED:  'Confirmée',
  PREPARING:  'En préparation',
  READY:      'Prêt',
  DELIVERING: 'En livraison',
  DELIVERED:  'Livré',
  COMPLETED:  'Terminée',
  CANCELLED:  'Annulée',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING:    '#9E9E9E',
  CONFIRMED:  '#1565C0',
  PREPARING:  '#F57C00',
  READY:      '#388E3C',
  DELIVERING: '#F57C00',
  DELIVERED:  '#1A5C2A',
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
