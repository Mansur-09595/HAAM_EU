import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/store'
import { receiveMessage } from '@/store/slices/chat/chatActions'
import { IMessage } from '@/types/chatTypes'

export function useChatWebSocket(
  userId: number | null,
  activeConversationId: number | null
) {
  const dispatch = useAppDispatch()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!userId || !activeConversationId) {
      wsRef.current?.close()
      wsRef.current = null
      return
    }

    const token = localStorage.getItem('accessToken') ?? ''
    const url = `wss://haam-db.onrender.com/ws/chat/${userId}/?token=${token}`
    console.log('[WebSocket] connecting to', url)

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => console.log('[WebSocket] chat connected')
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'chat_message') {
        const message: IMessage = data.message
        dispatch(receiveMessage({ conversationId: message.conversation_id, message }))
      }
      else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }))
      }
    }
    ws.onerror = (ev) => console.error('[WebSocket] chat onerror', ev)
    ws.onclose = (e) =>
      console.warn('[WebSocket] chat onclose', e.code, e.reason, e.wasClean)

    return () => {
      ws.close()
      wsRef.current = null
    }
  }, [userId, activeConversationId, dispatch])

  return wsRef
}
