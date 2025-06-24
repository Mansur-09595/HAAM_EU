import { useEffect, useRef } from 'react'

export function useNotificationWebSocket(userId: number | null) {
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!userId) {
      wsRef.current?.close()
      wsRef.current = null
      return
    }

    const host = process.env.NEXT_PUBLIC_WS_BACKEND_HOST ?? 'haam-db.onrender.com'
    const token = localStorage.getItem('accessToken') ?? ''
    const url = `wss://${host}/ws/notifications/${userId}/?token=${token}`
    console.log('[WebSocket] connecting to', url)

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => console.log('[WebSocket] notifications connected')
    ws.onmessage = (e) => console.log('[WebSocket] notifications message', e.data)
    ws.onerror = (ev) => console.error('[WebSocket] notifications onerror', ev)
    ws.onclose = (e) =>
      console.warn('[WebSocket] notifications onclose', e.code, e.reason, e.wasClean)

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [userId])

  return wsRef
}
