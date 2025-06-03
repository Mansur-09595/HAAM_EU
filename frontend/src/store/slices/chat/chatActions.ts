// src/store/slices/chat/chatActions.ts

import { createAsyncThunk } from '@reduxjs/toolkit'
import { IConversation, IMessage, ICreateConversationPayload, ISendMessagePayload } from '@/types/chatTypes'

const API_BASE = 'http://localhost:8000/api/chat'

// 1) Получить все беседы текущего пользователя
export const fetchConversations = createAsyncThunk<
  IConversation[],
  void,
  { rejectValue: string }
>(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Нет токена, пользователь не авторизован')
    }

    try {
      const res = await fetch(`${API_BASE}/conversations/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const text = await res.text()
        return rejectWithValue(`Ошибка ${res.status}: ${text}`)
      }
      const json = await res.json() as { results: IConversation[] }
      return json.results
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || 'Сетевая ошибка при загрузке бесед')
      }
      return rejectWithValue('Неизвестная ошибка сети при загрузке бесед')
    }
  }
)

// 2) Получить все сообщения конкретной беседы
export const fetchMessages = createAsyncThunk<
  IMessage[],
  number,
  { rejectValue: string }
>(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Нет токена, пользователь не авторизован')
    }

    try {
      const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!res.ok) {
        const text = await res.text()
        return rejectWithValue(`Ошибка ${res.status}: ${text}`)
      }
      const data = await res.json() as IMessage[]
      return data
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || 'Сетевая ошибка при загрузке сообщений')
      }
      return rejectWithValue('Неизвестная ошибка сети при загрузке сообщений')
    }
  }
)

// 3) Создать новую беседу (если ещё нет) → возвращает IConversation
export const createConversation = createAsyncThunk<
  IConversation,               // Мы ожидаем вернуть один объект IConversation
  ICreateConversationPayload,  // { participant_id: number; listing_id?: number }
  { rejectValue: string }
>(
  'chat/createConversation',
  async ({ participant_id, listing_id }, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return rejectWithValue('Пожалуйста, войдите, чтобы начать чат')
    }

    try {
      const body = JSON.stringify({ participant_id, listing_id })
      const res = await fetch(`${API_BASE}/conversations/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      if (!res.ok) {
        const txt = await res.text()
        return rejectWithValue(`Ошибка ${res.status}: ${txt}`)
      }

      const data = (await res.json()) as IConversation
      return data
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || 'Сетевая ошибка при создании беседы')
      }
      return rejectWithValue('Неизвестная ошибка сети при создании беседы')
    }
  }
)

// 4) Отправить новое сообщение в беседе через REST
export const sendMessage = createAsyncThunk<
  IMessage,                // возвращаемый тип: вновь созданное сообщение
  ISendMessagePayload,     // payload: { conversation_id, content }
  { rejectValue: string }
>(
  'chat/sendMessage',
  async ({ conversation_id, content }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE}/conversations/${conversation_id}/send_message/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const text = await res.text()
        return rejectWithValue(`Ошибка ${res.status}: ${text}`)
      }
      const data = (await res.json()) as IMessage
      return data
    } catch (err: unknown) {
      if (err instanceof Error) {
        return rejectWithValue(err.message || 'Ошибка сети при отправке сообщения')
      }
      return rejectWithValue('Неизвестная ошибка сети при отправке сообщения')
    }
  }
)

// 5) Обработка входящего WebSocket-сообщения
export const receiveMessage = createAsyncThunk<
  { conversationId: number; message: IMessage },
  { conversationId: number; message: IMessage }
>(
  'chat/receiveMessage',
  async ({ conversationId, message }) => {
    // просто передаём дальше, без сетевого запроса
    return { conversationId, message }
  }
)
