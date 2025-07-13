import { createAsyncThunk } from '@reduxjs/toolkit'
import { createAction } from '@reduxjs/toolkit'
import { TokenManager } from '@/utils/tokenUtils'
import { AuthErrorHandler } from '@/utils/authErrorHandler'
import {
  IConversation,
  IMessage,
  ICreateConversationPayload,
  ISendMessagePayload,
  ISendMessageResponse,
  IPaginatedConversations,
} from '@/types/chatTypes'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ? `${process.env.NEXT_PUBLIC_API_BASE}/chat` : 'http://localhost:8000/api/chat'

// 1) Получить все беседы текущего пользователя
export const fetchConversations = createAsyncThunk<
  IConversation[],
  void,
  { rejectValue: string }
>(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/conversations/`)
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      const data = (await res.json()) as IPaginatedConversations
      return data.results
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)


// 2) Получить историю сообщений по conversationId
export const fetchMessages = createAsyncThunk<
  IMessage[],
  number,
  { rejectValue: string }
>(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(
        `${API_BASE}/conversations/${conversationId}/messages/`
      )
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return (await res.json()) as IMessage[]
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)


// 3) Создать новую беседу (если её ещё нет) — POST /conversations/
export const createConversation = createAsyncThunk<
  IConversation,
  ICreateConversationPayload,
  { rejectValue: string }
>(
  'chat/createConversation',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(`${API_BASE}/conversations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return (await res.json()) as IConversation
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)


// 4) Отправить сообщение — POST /conversations/{id}/send_message/
export const sendMessage = createAsyncThunk<
  IMessage,
  ISendMessagePayload,
  { rejectValue: string }
>(
  'chat/sendMessage',
  async ({ conversation_id, content }, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(
        `${API_BASE}/conversations/${conversation_id}/send_message/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      )
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      const data = (await res.json()) as ISendMessageResponse
      return {
        id: data.id,
        conversation_id: data.conversation_id,
        sender: data.sender,
        content: data.content,
        is_read: data.is_read,
        created_at: data.created_at,
      } as IMessage
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)

// 5) Обработка входящего WebSocket-сообщения
export const receiveMessage = createAction<{ conversationId: number; message: IMessage }>('chat/receiveMessage')

// 6) Отметить беседу как прочитанную — POST /conversations/{id}/mark_read/
export const markConversationRead = createAsyncThunk<
  { conversationId: number },
  number,
  { rejectValue: string }
>(
  'chat/markConversationRead',
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await TokenManager.fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api'}/notifications/${conversationId}/mark_read/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )
      if (!res.ok) {
        const msg = await AuthErrorHandler.handle(res)
        return rejectWithValue(msg)
      }
      return { conversationId }
    } catch {
      return rejectWithValue('Ошибка подключения')
    }
  }
)
