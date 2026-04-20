'use client'

import { create } from 'zustand'
import type { Subscription, DeliveryMethod, PaymentMethod } from '@/types'

interface CheckoutState {
  subscription: Subscription | null
  step: 1 | 2 | 3 | 4
  deliveryMethod: DeliveryMethod | null
  deliveryAddress: string
  landmarkId: string
  notes: string
  paymentMethod: PaymentMethod | null
  orderId: string | null
  fromMobile: boolean
  setSubscription: (subscription: Subscription) => void
  setStep: (step: 1 | 2 | 3 | 4) => void
  setDelivery: (method: DeliveryMethod, address?: string, landmarkId?: string, notes?: string) => void
  setPaymentMethod: (method: PaymentMethod) => void
  setOrderId: (id: string) => void
  setFromMobile: (value: boolean) => void
  reset: () => void
}

export const useCheckoutStore = create<CheckoutState>()((set) => ({
  subscription: null,
  step: 1,
  deliveryMethod: null,
  deliveryAddress: '',
  landmarkId: '',
  notes: '',
  paymentMethod: null,
  orderId: null,
  fromMobile: false,

  setSubscription: (subscription) => set({ subscription }),
  setStep: (step) => set({ step }),
  setDelivery: (method, address = '', landmarkId = '', notes = '') =>
    set({ deliveryMethod: method, deliveryAddress: address, landmarkId, notes }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setOrderId: (id) => set({ orderId: id }),
  setFromMobile: (value) => set({ fromMobile: value }),
  reset: () =>
    set({
      subscription: null,
      step: 1,
      deliveryMethod: null,
      deliveryAddress: '',
      landmarkId: '',
      notes: '',
      paymentMethod: null,
      orderId: null,
      fromMobile: false,
    }),
}))
