'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { receiveMessage, fetchMessages } from '@/store/slices/chat/chatActions'
import { IMessage } from '@/types/chatTypes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send } from 'lucide-react'

interface ChatWidgetProps {
  userId: number
  conversationId: number
}

export default function ChatWidget({ userId, conversationId }: ChatWidgetProps) {
  const dispatch = useAppDispatch()
  const wsRef = useRef<WebSocket | null>(null)
  const [textValue, setTextValue] = useState('')

  // Получаем из Redux текущее состояние сообщений для данной беседы
  const msgsState = useAppSelector(
    (state) => state.chat.messagesByConversation[conversationId]
  )
  const messages: IMessage[] = msgsState?.messages || []
  const loading = msgsState?.loading || false
  const error = msgsState?.error

  // ref для автоматического скролла вниз
  const endRef = useRef<HTMLDivElement | null>(null)

  // 1) При монтировании загружаем историю
  useEffect(() => {
    if (conversationId) {
      dispatch(fetchMessages(conversationId))
    }
  }, [conversationId, dispatch])

  // 2) Открываем WebSocket
  useEffect(() => {
    if (!userId) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/chat/${userId}/`)
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket открыт')
    }
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'chat_message') {
          const incoming: IMessage = data.message
          if (incoming.conversation_id === conversationId) {
            dispatch(receiveMessage({ conversationId, message: incoming }))
          }
        }
      } catch (e) {
        console.error('Ошибка при разборе сообщения WebSocket:', e)
      }
    }
    ws.onerror = (err) => {
      console.error('WebSocket ошибка', err)
    }
    ws.onclose = () => {
      console.log('WebSocket закрыт')
    }

    return () => {
      ws.close()
    }
  }, [userId, conversationId, dispatch])

  // 3) Автоскролл вниз при появлении новых сообщений
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 4) Обработчик отправки сообщения
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = textValue.trim()
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return

    const payload = {
      type: 'chat_message',
      conversation_id: conversationId,
      content: text,
    }
    wsRef.current.send(JSON.stringify(payload))
    setTextValue('')
    // Можно также сразу оптимистично запушить в store:
    // dispatch(sendMessage({ conversation_id: conversationId, content: text }))
  }

  return (
    <div className="flex flex-col h-full bg-white border rounded-lg shadow-sm">
      {/* ─── Верхняя панель с участником (можно расширить) ──────────────────────── */}
      <div className="p-3 border-b flex items-center gap-3">
        <Avatar>
          {/* На этом месте можно использовать аватар собеседника */}
          <AvatarImage
            src=""
            alt="Собеседник"
          />
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        <div className="font-medium truncate">Собеседник</div>
      </div>

      {/* ─── Область с историями сообщений ───────────────────────────────────────── */}
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        {loading && <p className="text-center text-sm text-gray-500">Загрузка...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <div className="flex flex-col space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.sender.id === userId
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className="flex gap-2 max-w-[80%]">
                  {!isOwn && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={msg.sender.avatar || ''}
                        alt={msg.sender.username}
                      />
                      <AvatarFallback>
                        {msg.sender.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex flex-col">
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwn
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 self-end">
                      {new Date(msg.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={endRef} />
        </div>
      </ScrollArea>

      {/* ─── Форма ввода нового сообщения ─────────────────────────────────────────── */}
      <div className="border-t p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Введите сообщение…"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!textValue.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
