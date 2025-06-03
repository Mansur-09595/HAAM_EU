// src/app/(some)/messages/page.tsx
'use client'

import React, { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
} from "@/store/slices/chat/chatActions"
import { IConversation, IMessage } from "@/types/chatTypes"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Send } from "lucide-react"

export default function MessagesPage() {
  const dispatch = useAppDispatch()

  // ID текущего пользователя (берётся из users.selected, как вы храните профиль)
  const currentUserId = useAppSelector((state) => state.users.selected?.id)

  // Состояние бесед
  const {
    items: conversations,
    loading: convLoading,
    error: convError,
  } = useAppSelector((state) => state.chat.conversations)

  // Сообщения по активной беседе
  const messagesByConversation = useAppSelector(
    (state) => state.chat.messagesByConversation
  )

  // Локальное состояние: активная беседа и текст нового сообщения
  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    null
  )
  const [newMessage, setNewMessage] = useState("")

  // Реф для автоматического скролла внизу чата
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // 1) При монтировании: загрузить список бесед
  useEffect(() => {
    dispatch(fetchConversations())
  }, [dispatch])

  // 2) Когда меняется активная беседа → загрузить её историю
  useEffect(() => {
    if (activeConversationId !== null) {
      dispatch(fetchMessages(activeConversationId))
    }
  }, [dispatch, activeConversationId])

  // 3) После каждого рендера сообщений → прокрутить вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesByConversation, activeConversationId])

  // Обработчик кнопки отправки сообщения
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || activeConversationId === null) return

    await dispatch(
      sendMessage({
        conversation_id: activeConversationId,
        content: newMessage.trim(),
      })
    ).unwrap()

    setNewMessage("")
  }

  if (convLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p>Загрузка бесед…</p>
      </div>
    )
  }

  if (convError) {
    return (
      <div className="container mx-auto px-4 py-6 text-center text-red-600">
        Ошибка загрузки бесед: {convError}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Сообщения</h1>

      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[350px_1fr]">
          {/* ─── Левый столбец: Список бесед ─────────────────────────────────────── */}
          <div className="border-r">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Поиск…" className="pl-9" />
              </div>
            </div>

            <Tabs defaultValue={activeConversationId?.toString() || ""}>
              <div className="px-3 pt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    Все
                  </TabsTrigger>
                  <TabsTrigger value="unread" className="flex-1">
                    Непрочитанные
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ─── Вкладка “Все” ─────────────────────────────────────────────────────────── */}
              <TabsContent value="all" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {conversations.map((conv) => {
                    const lastMsg = conv.last_message
                    const isOwn = lastMsg?.sender.id === currentUserId

                    return (
                      <div
                        key={conv.id}
                        className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                          activeConversationId === conv.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setActiveConversationId(conv.id)}
                      >
                        <div className="flex gap-3">
                          <div className="relative">
                            <Avatar>
                              {conv.participants
                                .filter((u) => u.id !== currentUserId)
                                .map((u) => (
                                  <AvatarImage
                                    key={u.id}
                                    src={u.avatar || ""}
                                    alt={u.username}
                                  />
                                ))[0] || (
                                <AvatarFallback>
                                  {conv.participants[0]?.username.charAt(0)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="font-medium truncate">
                                {
                                  conv.participants.find(
                                    (u) => u.id !== currentUserId
                                  )?.username
                                }
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                {lastMsg
                                  ? new Date(lastMsg.created_at).toLocaleTimeString("ru-RU", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </div>
                            </div>
                            <div
                              className={`text-sm truncate ${
                                lastMsg && lastMsg.is_read
                                  ? "text-muted-foreground"
                                  : "font-medium"
                              }`}
                            >
                              {lastMsg
                                ? isOwn
                                  ? `Вы: ${lastMsg.content}`
                                  : lastMsg.content
                                : "Нет сообщений"}
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

              {/* ─── Вкладка “Непрочитанные” ──────────────────────────────────────────── */}
              <TabsContent value="unread" className="m-0">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  {conversations
                    .filter(
                      (conv) =>
                        conv.unread_count > 0 &&
                        conv.last_message?.sender.id !== currentUserId
                    )
                    .map((conv) => {
                      const lastMsg = conv.last_message
                      const isOwn = lastMsg?.sender.id === currentUserId

                      return (
                        <div
                          key={conv.id}
                          className={`p-3 border-b hover:bg-muted/50 cursor-pointer ${
                            activeConversationId === conv.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setActiveConversationId(conv.id)}
                        >
                          <div className="flex gap-3">
                            <div className="relative">
                              <Avatar>
                                {conv.participants
                                  .filter((u) => u.id !== currentUserId)
                                  .map((u) => (
                                    <AvatarImage
                                      key={u.id}
                                      src={u.avatar || ""}
                                      alt={u.username}
                                    />
                                  ))[0] || (
                                  <AvatarFallback>
                                    {conv.participants[0]?.username.charAt(0)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="font-medium truncate">
                                  {
                                    conv.participants.find(
                                      (u) => u.id !== currentUserId
                                    )?.username
                                  }
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                  {lastMsg
                                    ? new Date(lastMsg.created_at).toLocaleTimeString("ru-RU", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </div>
                              </div>
                              <div className="text-sm truncate font-medium">
                                {lastMsg
                                  ? isOwn
                                    ? `Вы: ${lastMsg.content}`
                                    : lastMsg.content
                                  : "Нет сообщений"}
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

          {/* ─── Правый столбец: История и отправка сообщений ────────────────────────── */}
          <div className="flex flex-col h-[calc(100vh-150px)]">
            <div className="p-3 border-b flex items-center justify-between">
              {activeConversationId !== null ? (
                (() => {
                  const conv = conversations.find(
                    (c) => c.id === activeConversationId
                  ) as IConversation
                  const otherUser = conv.participants.find(
                    (u) => u.id !== currentUserId
                  )
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={otherUser?.avatar || ""}
                            alt={otherUser?.username}
                          />
                          <AvatarFallback>
                            {otherUser?.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium truncate">
                            {otherUser?.username}
                          </div>
                        </div>
                      </div>
                      {conv.listing && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm bg-muted p-2 rounded-md">
                            <div className="font-medium truncate max-w-[200px]">
                              {conv.listing.title}
                            </div>
                            <div>{conv.listing.price.toLocaleString()} ₽</div>
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()
              ) : (
                <div className="text-center w-full text-gray-500">
                  Выберите беседу
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              {activeConversationId !== null ? (
                (() => {
                  const msgsState =
                    messagesByConversation[activeConversationId]
                  const msgs: IMessage[] = msgsState?.messages || []

                  return (
                    <div className="space-y-4">
                      {msgs.map((message) => {
                        const isOwnMsg =
                          message.sender.id === currentUserId
                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isOwnMsg ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="flex gap-2 max-w-[80%]">
                              {!isOwnMsg && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={message.sender.avatar || ""}
                                    alt={message.sender.username}
                                  />
                                  <AvatarFallback>
                                    {message.sender.username.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    isOwnMsg
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  {message.content}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(
                                    message.created_at
                                  ).toLocaleTimeString("ru-RU", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )
                })()
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  Нет выбранных сообщений
                </div>
              )}
            </ScrollArea>

            <div className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
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
