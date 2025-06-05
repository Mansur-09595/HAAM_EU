import { useEffect, useRef } from 'react'
import { useAppDispatch } from '@/store/store'
import { receiveMessage } from '@/store/slices/chat/chatActions'
import { IMessage } from '@/types/chatTypes'

export function useChatWebSocket(userId: number | null, activeConversationId: number | null) {
  const dispatch = useAppDispatch()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!userId) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const token = localStorage.getItem('accessToken') || ''
    const ws = new WebSocket(`${protocol}://localhost:8000/ws/chat/${userId}/?token=${token}`)

    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat_message') {
          const message: IMessage = data.message
          if (message.conversation_id === activeConversationId) {
            dispatch(receiveMessage({ conversationId: message.conversation_id, message }))
          }
        }
      } catch (err) {
        console.error('WebSocket error', err)
      }
    }

    ws.onopen = () => {
        console.log('WebSocket открыт')
      }
  
      ws.onerror = (err) => {
        console.error('WebSocket ошибка', err)
      }
  
      ws.onclose = (event) => {
        console.log('WebSocket закрыт', event.code, event.reason)
      }

    return () => {
      ws.close()
    }
  }, [userId, activeConversationId, dispatch])

  return wsRef
}