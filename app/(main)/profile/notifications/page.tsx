'use client'

import { useEffect, useState } from 'react'
import { useAuthGuard } from '@/lib/hooks/use-auth-guard'
import { getNotifications, markAllNotificationsRead } from '@/lib/api/notifications'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const { isAuthenticated, hydrated } = useAuthGuard()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!hydrated || !isAuthenticated) return
    getNotifications().then(setNotifications).finally(() => setLoading(false))
  }, [hydrated, isAuthenticated])

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-headline-large font-semibold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>Tout marquer lu</Button>
        )}
      </div>

      {loading ? (
        <p className="text-text-secondary text-sm">Chargement...</p>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <div className="text-text-light mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg></div>
          <p>Aucune notification.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex gap-3 p-4 rounded-lg border ${notif.isRead ? 'bg-white border-border' : 'bg-primary-surface border-primary/20'}`}
            >
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${notif.isRead ? 'bg-border' : 'bg-primary'}`} />
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-sm">{notif.title}</p>
                <p className="text-sm text-text-secondary">{notif.body}</p>
                <p className="text-xs text-text-light">{timeAgo(notif.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
