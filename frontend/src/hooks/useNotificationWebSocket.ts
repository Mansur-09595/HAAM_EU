import { useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { TokenManager } from '@/utils/tokenUtils'


export function useNotificationWebSocket(userId: number | null) {
  const wsRef = useRef<WebSocket | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let cancelled = false
    let socket: WebSocket | null = null

    const connect = async () => {
      if (!userId) {
        wsRef.current?.close()
        wsRef.current = null
        return
      }

      const host = process.env.NEXT_PUBLIC_WS_BACKEND_HOST ?? 'haam-db.onrender.com'
      const token = (await TokenManager.getValidAccessToken()) ?? ''
      if (cancelled) return
      socket = new WebSocket(`wss://${host}/ws/notifications/${userId}/?token=${token}`)
      wsRef.current = socket

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.notification_type === 'message') {
            toast({ title: 'Новое сообщение', description: data.content })
          }
        } catch (err) {
          console.error('Notification WS error', err)
        }
      }

      socket.onclose = () => {
        console.log('[WS] disconnected')
        wsRef.current = null
      }
    }

    connect()

    return () => {
      cancelled = true
      socket?.close()
      wsRef.current = null
    }
  }, [userId, toast])
  
  return wsRef
}
