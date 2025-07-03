'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/store'
import {
  fetchConversations,
  fetchMessages,
  markConversationRead,
} from '@/store/slices/chat/chatActions'
import { markAllRead } from '@/store/slices/notifications/notificationsAction'
import { IConversation, IMessage } from '@/types/chatTypes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Send } from 'lucide-react'
import { useChatWebSocket } from '@/hooks/useChatWebSocket'

// Простая реализация дебаунса
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

interface ConversationListProps {
  conversations: IConversation[]
  currentUserId: number | null
  activeId: number | null
  onSelect: (id: number) => void
  filter: string
}

const ConversationList = React.memo<ConversationListProps>(
  ({ conversations, currentUserId, activeId, onSelect, filter }) => {
    const filtered = useMemo(() => {
      const term = filter.toLowerCase()
      return conversations.filter(conv => {
        const other = conv.participants.find(u => u.id !== currentUserId)
        const name = other?.username.toLowerCase() || ''
        const last = conv.last_message?.content.toLowerCase() || ''
        return name.includes(term) || last.includes(term)
      })
    }, [conversations, currentUserId, filter])

    return (
      <>
        {filtered.map(conv => {
          const lastMsg = conv.last_message
          const isOwn = lastMsg?.sender.id === currentUserId
          return (
            <div
              key={conv.id}
              className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                activeId === conv.id ? 'bg-muted' : ''
              }`}
              onClick={() => onSelect(conv.id)}
            >
              <div className="flex gap-3">
                <Avatar>
                  {conv.participants
                    .filter(u => u.id !== currentUserId)
                    .map(u => (
                      <AvatarImage key={u.id} src={u.avatar || ''} alt={u.username} />
                    ))[0] || (
                    <AvatarFallback>
                      {conv.participants[0]?.username.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">
                      {conv.participants
                        .find(u => u.id !== currentUserId)
                        ?.username}
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
                  <div
                    className={`text-sm truncate ${
                      lastMsg?.is_read ? 'text-muted-foreground' : 'font-medium'
                    }`}
                  >
                    {lastMsg
                      ? isOwn
                        ? `Вы: ${lastMsg.content}`
                        : lastMsg.content
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
      </>
    )
  }
)
ConversationList.displayName = 'ConversationList'

interface MessageListProps {
  messages: IMessage[]
  currentUserId: number | null
}

const MessageList = React.memo<MessageListProps>(({ messages, currentUserId }) => (
  <div className="space-y-4">
    {messages.map(message => {
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
              <div
                className={`rounded-lg px-4 py-2 ${
                  isOwnMsg ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      )
    })}
  </div>
))
MessageList.displayName = 'MessageList'

export default function MessagesPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentUser = useAppSelector(state => state.auth.user)
  const currentUserId = currentUser?.id ?? null

  const {
    items: conversations,
    loading: convLoading,
    error: convError,
  } = useAppSelector(state => state.chat.conversations)

  const messagesByConversation = useAppSelector(
    state => state.chat.messagesByConversation
  )

  const [activeConversationId, setActiveConversationId] = useState<number | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [tabValue, setTabValue] = useState<'all' | 'unread'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 200)

  // WS
  const wsRef = useChatWebSocket(currentUserId, activeConversationId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1) загрузка бесед
  useEffect(() => {
    dispatch(fetchConversations())
      .unwrap()
      .catch(err => {
        if (err === 'logout') router.push('/login')
      })
  }, [dispatch, router])

  // 2) conv из query
  useEffect(() => {
    const conv = Number(searchParams.get('conv'))
    if (conv && !activeConversationId) {
      setActiveConversationId(conv)
    }
  }, [searchParams, activeConversationId])

  // 3) смена беседы
  useEffect(() => {
    if (activeConversationId !== null) {
      dispatch(fetchMessages(activeConversationId))
        .unwrap()
        .catch(err => {
          if (err === 'logout') router.push('/login')
        })
      dispatch(markAllRead())
      dispatch(markConversationRead(activeConversationId))
    }
  }, [activeConversationId, dispatch, router])

  // 4) автоскролл
  const messagesForCurrent = useMemo(
    () => activeConversationId !== null
      ? messagesByConversation[activeConversationId]?.messages || []
      : [],
    [activeConversationId, messagesByConversation]
  )
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesForCurrent.length])

  // 5) токен-ошибки
  useEffect(() => {
    if (
      convError &&
      (convError.includes('token_not_valid') || convError === 'logout')
    ) {
      router.push('/login')
    }
  }, [convError, router])

  if (convLoading) return <p>Загрузка бесед…</p>
  if (convError && !convError.includes('token_not_valid') && convError !== 'logout')
    return <p className="text-red-500">Ошибка загрузки бесед: {convError}</p>

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Сообщения</h1>
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr]">
          {/* Левая колонка */}
          <div className="border-r">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск…"
                  className="pl-9"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Tabs value={tabValue} onValueChange={(value: string) => setTabValue(value as "all" | "unread")}>
              <TabsList className="w-full px-3 pt-3">
                <TabsTrigger value="all" className="flex-1">Все</TabsTrigger>
                <TabsTrigger value="unread" className="flex-1">Непрочитанные</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <ConversationList
                    conversations={conversations}
                    currentUserId={currentUserId}
                    activeId={activeConversationId}
                    onSelect={setActiveConversationId}
                    filter={debouncedSearch}
                  />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="unread" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <ConversationList
                    conversations={conversations.filter(
                      c => c.unread_count > 0 && c.last_message?.sender.id !== currentUserId
                    )}
                    currentUserId={currentUserId}
                    activeId={activeConversationId}
                    onSelect={setActiveConversationId}
                    filter={debouncedSearch}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Правая колонка */}
          <div className="flex flex-col h-[calc(100vh-150px)]">
            <div className="p-3 border-b flex items-center justify-between">
              {activeConversationId !== null ? (
                (() => {
                  const conv = conversations.find(c => c.id === activeConversationId) as IConversation
                  const other = conv.participants.find(u => u.id !== currentUserId)
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={other?.avatar || ''} alt={other?.username} />
                          <AvatarFallback>{other?.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium truncate">{other?.username}</div>
                      </div>
                      {conv.listing && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm bg-muted p-2 rounded-md">
                            <div className="font-medium truncate max-w-[200px]">{conv.listing.title}</div>
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

            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              {activeConversationId !== null ? (
                <>
                  <MessageList messages={messagesForCurrent} currentUserId={currentUserId} />
                  <div ref={scrollRef} />
                </>
              ) : (
                <div className="text-center text-gray-500 mt-10">Нет выбранной беседы</div>
              )}
            </ScrollArea>

            <div className="p-3 border-t">
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (!newMessage.trim() || activeConversationId === null) return
                  const ws = wsRef.current
                  if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(
                      JSON.stringify({
                        type: 'chat_message',
                        conversation_id: activeConversationId,
                        content: newMessage.trim(),
                      })
                    )
                  }
                  setNewMessage('')
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Введите сообщение…"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  disabled={activeConversationId === null}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || activeConversationId === null}>
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
