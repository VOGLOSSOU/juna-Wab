'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getMe } from '@/lib/api/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getInitials, formatDate } from '@/lib/utils'
import type { User } from '@/types'
import Image from 'next/image'

export default function ProfilePage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const router = useRouter()
  const [profile, setProfile] = useState<User | null>(null)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getMe().then(setProfile).catch(console.error)
  }, [hydrated, isAuthenticated])

  if (!hydrated || !isAuthenticated || !profile) return null

  return (
    <div className="max-w-content mx-auto px-6 py-10">
      <h1 className="text-headline-large font-semibold mb-8">Mon profil</h1>
      <div className="bg-white rounded-xl border border-border p-6 flex items-center gap-6 shadow-sm max-w-lg">
        <div className="w-20 h-20 rounded-full bg-primary-surface flex items-center justify-center text-primary text-2xl font-bold flex-shrink-0">
          {profile.avatarUrl ? (
            <Image src={profile.avatarUrl} alt={profile.name} width={80} height={80} className="rounded-full object-cover" />
          ) : (
            getInitials(profile.name)
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-title-large font-semibold">{profile.name}</h2>
          <p className="text-text-secondary text-sm">{profile.email}</p>
          {profile.phone && <p className="text-text-secondary text-sm">{profile.phone}</p>}
          {profile.city && <p className="text-text-light text-xs flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>{profile.city.name}</p>}
          <p className="text-text-light text-xs">Membre depuis {formatDate(profile.createdAt)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-6 max-w-lg">
        <Button variant="outline" onClick={() => router.push('/profile/orders')}>Mes commandes</Button>
        <Button variant="outline" onClick={() => router.push('/profile/favorites')}>Mes favoris</Button>
        <Button variant="outline" onClick={() => router.push('/profile/settings')}>Paramètres</Button>
        <Button variant="outline" onClick={() => router.push('/profile/notifications')}>Notifications</Button>
      </div>
    </div>
  )
}
