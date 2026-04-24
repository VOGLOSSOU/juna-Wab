// ============================================================
// ENUMS
// ============================================================

export type SubscriptionType =
  | 'BREAKFAST'
  | 'LUNCH'
  | 'DINNER'
  | 'SNACK'
  | 'BREAKFAST_LUNCH'
  | 'BREAKFAST_DINNER'
  | 'LUNCH_DINNER'
  | 'FULL_DAY'
  | 'CUSTOM'

export type SubscriptionDuration =
  | 'DAY'
  | 'THREE_DAYS'
  | 'WORK_WEEK'
  | 'WEEK'
  | 'TWO_WEEKS'
  | 'WORK_WEEK_2'
  | 'WORK_MONTH'
  | 'MONTH'
  | 'WEEKEND'

export type SubscriptionCategory =
  | 'AFRICAN'
  | 'VEGETARIAN'
  | 'HALAL'
  | 'ASIAN'
  | 'VEGAN'
  | 'EUROPEAN'
  | 'FAST_FOOD'
  | 'HEALTHY'
  | 'AMERICAN'
  | 'FUSION'
  | 'OTHER'

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentMethod =
  | 'MOBILE_MONEY_WAVE'
  | 'MOBILE_MONEY_MTN'
  | 'MOBILE_MONEY_MOOV'
  | 'MOBILE_MONEY_ORANGE'
  | 'CARD'
  | 'CASH'

export type DeliveryMethod = 'DELIVERY' | 'PICKUP'

export type SortOption = 'popular' | 'recent' | 'rating' | 'price_asc' | 'price_desc'

export type UserRole = 'USER' | 'PROVIDER' | 'ADMIN'

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'

// ============================================================
// ENTITIES
// ============================================================

export interface Country {
  id: string
  code: string
  translations: { en: string; fr: string }
  flag?: string
  isActive?: boolean
}

export interface City {
  id: string
  name: string
  countryId?: string
  country?: Country
}

export interface Landmark {
  id: string
  name: string
  address?: string
  cityId: string
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl?: string
  role: UserRole
  cityId?: string
  city?: City
  isVerified?: boolean
  isActive?: boolean
  isProfileComplete?: boolean
  profile?: {
    avatar?: string | null
    address?: string
    city?: City | null
    preferences?: {
      dietaryRestrictions?: string[]
      favoriteCategories?: string[]
      notifications?: { email: boolean; push: boolean; sms: boolean }
    }
  }
  createdAt: string
}

// Provider as returned by public endpoints (in subscription listings, home feed, etc.)
export interface ProviderSummary {
  id: string
  name: string
  logo?: string
  isVerified: boolean
  description?: string | null
  rating?: number
  reviewCount?: number
  city?: string | { id: string; name: string }
  subscriptionCount?: number
  acceptsDelivery?: boolean
  acceptsPickup?: boolean
  businessAddress?: string
}

// Full provider profile (dashboard / GET /providers/me)
export interface Provider {
  id: string
  businessName: string
  description?: string | null
  logo?: string
  businessAddress?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  isVerified?: boolean
  acceptsDelivery?: boolean
  acceptsPickup?: boolean
  deliveryZones?: { city: string; country: string; cost: number }[]
  rating?: number
  totalReviews?: number
  phone?: string
  cityId?: string
  city?: City
  landmarks?: { landmark: Landmark }[]
  subscriptions?: Subscription[]
  userId?: string
}

export interface Meal {
  id: string
  name: string
  description?: string
  imageUrl?: string | null
  price?: number
  mealType?: MealType
  isActive?: boolean
  providerId?: string
  createdAt?: string
}

export interface Subscription {
  id: string
  name: string
  description?: string
  price: number
  currency?: string
  type: SubscriptionType
  duration: SubscriptionDuration
  category: SubscriptionCategory
  images?: string[]
  imageUrl?: string
  isActive: boolean
  isPublic?: boolean
  rating?: number
  reviewCount?: number
  totalReviews?: number
  mealCount?: number
  subscriberCount?: number
  providerId?: string
  provider?: ProviderSummary
  meals?: Meal[]
  deliveryZones?: string[]
  pickupPoints?: string[]
  providerSubscriptions?: Subscription[]
  createdAt?: string
}

export interface Order {
  id: string
  orderNumber?: string
  subscriptionId?: string
  subscription?: {
    id: string
    name: string
    provider?: { id: string; businessName?: string; name?: string }
  }
  userId?: string
  user?: Pick<User, 'id' | 'name'>
  status: OrderStatus
  deliveryMethod: DeliveryMethod
  deliveryAddress?: string
  deliveryCity?: string
  pickupLocation?: string
  landmarkId?: string
  landmark?: Landmark
  notes?: string
  paymentMethod?: PaymentMethod
  amount?: number
  totalAmount?: number
  deliveryCost?: number
  currency?: string
  qrCode?: string
  scheduledFor?: string
  completedAt?: string | null
  createdAt: string
  updatedAt?: string
}

export interface Review {
  id: string
  orderId?: string
  subscriptionId?: string
  userId?: string
  user?: { name: string; avatar?: string | null }
  rating: number
  comment?: string | null
  createdAt: string
}

export interface ActiveSubscription {
  id: string
  userId: string
  orderId: string
  subscriptionId: string
  startedAt: string
  endsAt: string
  duration: SubscriptionDuration
  subscription: {
    id: string
    name: string
    category: SubscriptionCategory
    type: SubscriptionType
    provider: {
      id: string
      businessName: string
    }
  }
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>
  order?: {
    id: string
    orderNumber: string
    scheduledFor: string
    deliveryMethod: DeliveryMethod
    deliveryAddress?: string
    deliveryCity?: string
  }
}

export interface Notification {
  id: string
  userId?: string
  title: string
  body: string
  isRead: boolean
  link?: string
  createdAt: string
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface ApiResponse<T> {
  success: boolean
  message: string | string[]
  data: T
  error?: { code: string }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  totalPages?: number
}

export interface HomeResponse {
  popular: Subscription[]
  recent: Subscription[]
  providers: ProviderSummary[]
}

// ============================================================
// FORM TYPES
// ============================================================

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
}

export interface ProviderRegisterForm {
  businessName: string
  description?: string
  businessAddress: string
  logo: string
  cityId: string
  acceptsDelivery: boolean
  acceptsPickup: boolean
  deliveryZones?: { city: string; country: string; cost: number }[]
  landmarkIds?: string[]
  documentUrl?: string
}

export interface CreateOrderForm {
  subscriptionId: string
  deliveryMethod: DeliveryMethod
  deliveryAddress?: string
  deliveryCity?: string
  pickupLocation?: string
  startAsap?: boolean
  requestedStartDate?: string
  notes?: string
  paymentMethod?: PaymentMethod
}

export interface SubscriptionForm {
  name: string
  description: string
  price: number
  type: SubscriptionType
  duration: SubscriptionDuration
  category: SubscriptionCategory
  imageUrl: string
  mealIds: string[]
  isPublic?: boolean
  isImmediate?: boolean
  preparationHours?: number
}

export interface MealForm {
  name: string
  description: string
  price: number
  imageUrl: string
  mealType: MealType
}
