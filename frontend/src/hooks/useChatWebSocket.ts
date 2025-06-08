import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/store'
import { receiveMessage } from '@/store/slices/chat/chatActions'
import { IMessage } from '@/types/chatTypes'

export function useChatWebSocket(userId: number | null, activeConversationId: number | null) {
  const dispatch = useAppDispatch()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Защита — если нет userId или activeConversationId → не подключаем
    console.log('[HOOK] useChatWebSocket → Монтирую или меняю userId/activeConversationId', { userId, activeConversationId })

    if (!userId || !activeConversationId) {
      if (wsRef.current) {
        console.log('[HOOK] useChatWebSocket → Закрываем соединение из-за отсутсвия userId/activeConversationId')

        wsRef.current.close()
        wsRef.current = null
      }
      return
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const token = localStorage.getItem('accessToken') || ''
    const ws = new WebSocket(`${protocol}://localhost:8000/ws/chat/${userId}/?token=${token}`)

    wsRef.current = ws

    ws.onopen = () => {
      console.log('[WebSocket] Открыто соединение для conversationId=', activeConversationId)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[WebSocket] RAW:', data)

        if (data.type === 'chat_message') {
          const message: IMessage = data.message
          console.log('[WebSocket] Получено сообщение:', message)

          dispatch(receiveMessage({ conversationId: message.conversation_id, message }))
          console.log('[HOOK] → Вызван dispatch(receiveMessage)')
        } else if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }))
          console.log('[WebSocket] → pong')
        }
      } catch (err) {
        console.error('[WebSocket] Ошибка обработки сообщения', err)
      }
    }

    ws.onerror = (err) => {
      console.error('[WebSocket] Ошибка', err)
    }

    ws.onclose = (event) => {
      console.log('[WebSocket] Соединение закрыто', event.code, event.reason)
    }

    // Очистка при размонтировании или при смене userId / activeConversationId
    return () => {
      if (wsRef.current) {
        console.log('[HOOK] useChatWebSocket → Очистка: закрываем WebSocket')
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [userId, activeConversationId, dispatch])

  return wsRef
}
