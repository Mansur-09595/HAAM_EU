// src/app/notifications/page.tsx
'use client'

import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchNotifications, markAllRead } from '@/store/slices/notifications/notificationsAction'
import { useNotificationWebSocket } from '@/hooks/useNotificationWebSocket'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NotificationsPage() {
  const dispatch = useAppDispatch()
  // Если user?.id undefined — приведём к null
  const userId: number | null = useAppSelector(state => state.auth.user?.id ?? null)
  const { items, loading, error } = useAppSelector(state => state.notifications)

  // Открываем WS только с number или null
  useNotificationWebSocket(userId)

  useEffect(() => {
    if (userId !== null) {
      dispatch(fetchNotifications())
    }
  }, [dispatch, userId])

  if (loading) return <p>Загрузка уведомлений…</p>
  if (error)   return <p className="text-red-500">Ошибка: {error}</p>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Уведомления</h1>
        <Button 
          onClick={() => dispatch(markAllRead())} 
          disabled={items.length === 0}
        >
          Отметить все как прочитанные
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">У вас пока нет уведомлений.</p>
      ) : (
        <div className="space-y-4">
          {items.map(notification => (
            <Card 
              key={notification.id} 
              className={!notification.is_read ? 'bg-blue-50' : ''}
            >
              <CardHeader>
                <CardTitle className="capitalize">
                  {notification.notification_type.replace('_', ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{notification.content}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
