'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchConversations, fetchMessages } from '@/store/slices/chat/chatActions'
import { IConversation } from '@/types/chatTypes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Send } from 'lucide-react'
import { useChatWebSocket } from '@/hooks/useChatWebSocket'

export default function MessagesPage() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[MessagesPage] Рендер компонента MessagesPage')
  }
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentUser = useAppSelector(state => state.auth.user)
  const currentUserId = currentUser?.id ?? null
  if (process.env.NODE_ENV === 'development') {
    console.log('[MessagesPage] currentUserId:', currentUserId)
  }
  const { items: conversations, loading: convLoading, error: convError } = useAppSelector(
    state => state.chat.conversations
  )
  const messagesByConversation = useAppSelector(state => state.chat.messagesByConversation)

  if (process.env.NODE_ENV === 'development') {
    console.log('[MessagesPage] messagesByConversation:', messagesByConversation)
  }
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')

  const wsRef = useChatWebSocket(currentUserId, activeConversationId)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Получаем беседы при монтировании
  useEffect(() => {
    dispatch(fetchConversations()).unwrap().catch(err => {
      if (err === 'logout') router.push('/login')
    })
  }, [dispatch, router])

  // Установка activeConversationId из query ?conv=
  useEffect(() => {
    const convFromQuery = searchParams.get('conv')
    const convId = Number(convFromQuery)
    if (convId && !activeConversationId) {
      setActiveConversationId(convId)
    }
  }, [searchParams, activeConversationId])

  // Загружаем сообщения при смене activeConversationId
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MessagesPage] useEffect → activeConversationId изменилась:', activeConversationId)
    }    if (activeConversationId !== null) {
      dispatch(fetchMessages(activeConversationId)).unwrap().catch(err => {
        if (err === 'logout') router.push('/login')
      })
    }
  }, [activeConversationId, dispatch, router])

  // Для auto-scroll — отслеживаем сообщения текущей беседы
  const messagesForCurrentConv = activeConversationId !== null
  ? (messagesByConversation[activeConversationId]?.messages || [])
  : []

  if (process.env.NODE_ENV === 'development') {
    console.log('[MessagesPage] messagesForCurrentConv:', messagesForCurrentConv)
  }
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messagesForCurrentConv.length])

  useEffect(() => {
    if (convError && (convError.includes('token_not_valid') || convError === 'logout')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[MessagesPage] convError → редирект на /login')
      }      router.push('/login')
    }
  }, [convError, router])
  
  if (convLoading) return <p>Загрузка бесед…</p>
  
  if (convError && !(convError.includes('token_not_valid') || convError === 'logout')) {
    return <p className="text-red-500">Ошибка загрузки бесед: {convError}</p>
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Сообщения</h1>
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr]">

          {/* Левая колонка: список бесед */}
          <div className="border-r">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск…" className="pl-9" />
              </div>
            </div>

            <Tabs value={activeConversationId ? undefined : 'all'} defaultValue="all">
              <TabsList className="w-full px-3 pt-3">
                <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">Непрочитанные</TabsTrigger>
              </TabsList>

              {/* Все беседы */}
              <TabsContent value="all" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {conversations.map(conv => {
                    const lastMsg = conv.last_message
                    const isOwn = lastMsg?.sender.id === currentUserId
                    return (
                      <div
                        key={conv.id}
                        className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                          activeConversationId === conv.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setActiveConversationId(conv.id)}
                      >
                        <div className="flex gap-3">
                          <Avatar>
                            {conv.participants
                              .filter(u => u.id !== currentUserId)
                              .map(u => (
                                <AvatarImage key={u.id} src={u.avatar || ''} alt={u.username} />
                              ))[0] || (
                              <AvatarFallback>{conv.participants[0]?.username.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="font-medium truncate">
                                {conv.participants.find(u => u.id !== currentUserId)?.username}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {lastMsg
                                  ? new Date(lastMsg.created_at).toLocaleTimeString('ru-RU', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : ''}
                              </div>
                            </div>
                            <div className={`text-sm truncate ${
                              lastMsg?.is_read ? 'text-muted-foreground' : 'font-medium'
                            }`}>
                              {lastMsg
                                ? (isOwn ? `Вы: ${lastMsg.content}` : lastMsg.content)
                                : 'Нет сообщений'}
                            </div>
                            {conv.listing && (
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {conv.listing.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </ScrollArea>
              </TabsContent>

              {/* Непрочитанные */}
              <TabsContent value="unread" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {conversations
                    .filter(c => c.unread_count > 0 && c.last_message?.sender.id !== currentUserId)
                    .map(conv => {
                      const lastMsg = conv.last_message
                      const isOwn = lastMsg?.sender.id === currentUserId
                      return (
                        <div
                          key={conv.id}
                          className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                            activeConversationId === conv.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setActiveConversationId(conv.id)}
                        >
                          <div className="flex gap-3">
                            <Avatar>
                              {conv.participants
                                .filter(u => u.id !== currentUserId)
                                .map(u => (
                                  <AvatarImage key={u.id} src={u.avatar || ''} alt={u.username} />
                                ))[0] || (
                                <AvatarFallback>{conv.participants[0]?.username.charAt(0)}</AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="font-medium truncate">
                                  {conv.participants.find(u => u.id !== currentUserId)?.username}
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                  {lastMsg
                                    ? new Date(lastMsg.created_at).toLocaleTimeString('ru-RU', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })
                                    : ''}
                                </div>
                              </div>
                              <div className="text-sm truncate font-medium">
                                {lastMsg
                                  ? (isOwn ? `Вы: ${lastMsg.content}` : lastMsg.content)
                                  : 'Нет сообщений'}
                              </div>
                              {conv.listing && (
                                <div className="text-xs text-muted-foreground truncate mt-1">
                                  {conv.listing.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Правая колонка: чат */}
          <div className="flex flex-col h-[calc(100vh-150px)]">
            {/* Заголовок */}
            <div className="p-3 border-b flex items-center justify-between">
              {activeConversationId !== null ? (
                (() => {
                  const conv = conversations.find(c => c.id === activeConversationId) as IConversation
                  const otherUser = conv.participants.find(u => u.id !== currentUserId)
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={otherUser?.avatar || ''} alt={otherUser?.username} />
                          <AvatarFallback>{otherUser?.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium truncate">{otherUser?.username}</div>
                        </div>
                      </div>
                      {conv.listing && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm bg-muted p-2 rounded-md">
                            <div className="font-medium truncate max-w-[200px]">
                              {conv.listing.title}
                            </div>
                            <div>{conv.listing.price?.toLocaleString()} ₽</div>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()
              ) : (
                <div className="text-center w-full text-gray-500">Выберите беседу</div>
              )}
            </div>

            {/* Сообщения */}
            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              {activeConversationId !== null ? (
                <div className="space-y-4">
                  {messagesForCurrentConv.map(message => {
                    const isOwnMsg = message.sender.id === currentUserId
                    return (
                      <div key={message.id} className={`flex ${isOwnMsg ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex gap-2 max-w-[80%]">
                          {!isOwnMsg && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender.avatar || ''} alt={message.sender.username} />
                              <AvatarFallback>{message.sender.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <div className={`rounded-lg px-4 py-2 ${isOwnMsg ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                              {message.content}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(message.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={scrollRef} />
                </div>
              ) : (
                <div className="text-center text-gray-500 mt-10">Нет выбранной беседы</div>
              )}
            </ScrollArea>

            {/* Форма отправки */}
            <div className="p-3 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!newMessage.trim() || activeConversationId === null) return

                  // отправляем по WebSocket
                  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                      type: 'chat_message',
                      conversation_id: activeConversationId,
                      content: newMessage.trim(),
                    }))
                  }

                  setNewMessage('')
                }}
              >
                <Input
                  placeholder="Введите сообщение…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={activeConversationId === null}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim() || activeConversationId === null}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
