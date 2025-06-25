import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'

export function useNotificationWebSocket(userId: number | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!userId) {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      return
    }

    const host = process.env.NEXT_PUBLIC_WS_BACKEND_HOST ?? 'haam-db.onrender.com'
    const token = localStorage.getItem('accessToken') ?? ''
    const ws = new WebSocket(`wss://${host}/ws/notifications/${userId}/?token=${token}`)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.notification_type === 'message') {
          toast({ title: 'Новое сообщение', description: data.content })
        }
      } catch (err) {
        console.error('Notification WS error', err)
      }
    }

    ws.onclose = () => {
      console.log('[WS] disconnected');
      wsRef.current = null
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [userId, toast])

  return wsRef
}
