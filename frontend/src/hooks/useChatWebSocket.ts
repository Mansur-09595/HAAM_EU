import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/store'
import { receiveMessage } from '@/store/slices/chat/chatActions'
import { IMessage } from '@/types/chatTypes'
import { TokenManager } from '@/utils/tokenUtils'

export function useChatWebSocket(
  userId: number | null,
  activeConversationId: number | null
) {
  const dispatch = useAppDispatch()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    let cancelled = false
    let socket: WebSocket | null = null

    const connect = async () => {
      if (!userId || !activeConversationId) {
        wsRef.current?.close()
        wsRef.current = null
        return
      }

      const token = (await TokenManager.getValidAccessToken()) ?? ''
      if (cancelled) return
      const host = process.env.NEXT_PUBLIC_WS_BACKEND_HOST ?? 'localhost:8000'
      const url = `wss://${host}/ws/chat/${userId}/?token=${token}`
      console.log('[WebSocket] connecting to', url)

      socket = new WebSocket(url)
      wsRef.current = socket

      socket.onopen = () => console.log('[WebSocket] chat connected')
      socket.onmessage = (e) => {
        console.time('WS onmessage')
        performance.mark('msg-start')
        const data = JSON.parse(e.data)
        if (data.type === 'chat_message') {
          const message: IMessage = data.message
          dispatch(
            receiveMessage({ 
              conversationId: message.conversation_id, 
              message })
          )
          console.timeEnd('WS onmessage')
          performance.mark('msg-end')
          performance.measure('message-handling', 'msg-start', 'msg-end')
        } else if (data.type === 'ping') {
          socket?.send(JSON.stringify({ type: 'pong' }))
        }
      }
      socket.onerror = (ev) => console.error('[WebSocket] chat onerror', ev)
      socket.onclose = (e) =>
        console.warn('[WebSocket] chat onclose', e.code, e.reason, e.wasClean)
    }

    connect()

    return () => {
      cancelled = true
      socket?.close()
      wsRef.current = null
    }
  }, [userId, activeConversationId, dispatch])

  return wsRef
}
