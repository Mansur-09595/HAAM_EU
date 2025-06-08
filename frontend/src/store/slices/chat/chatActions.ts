// src/store/slices/chat/chatActions.ts

import { createAsyncThunk } from '@reduxjs/toolkit'
import { createAction } from '@reduxjs/toolkit'
import { RootState } from '@/store/store'
import {  refreshToken } from '@/store/slices/auth/authAction'
import { logout } from '@/store/slices/auth/authSlice'
import { IConversation, IMessage, ICreateConversationPayload, ISendMessagePayload, ISendMessageResponse, IPaginatedConversations } from '@/types/chatTypes'

const API_BASE = 'http://localhost:8000/api/chat'


// Вспомогательная функция: берёт актуальный accessToken из стейта
function getBearerToken(getState: () => RootState): string | null {
  const token = getState().auth.accessToken
  return token ? `Bearer ${token}` : null
}

// 1) Получить все беседы текущего пользователя
export const fetchConversations = createAsyncThunk<
  IConversation[],       // результат: массив IConversation
  void,                  // без аргументов
  { rejectValue: string; state: RootState }
>(
  'chat/fetchConversations',
  async (_, { rejectWithValue, dispatch, getState }) => {
    const url = `${API_BASE}/conversations/`

    // Вспомогательная функция: делает fetch с текущим токеном и возвращает либо JSON, либо признак Unauthorized/ошибки
    const tryFetch = async (bearerToken: string) => {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: bearerToken,
        },
      })

      if (res.status === 401) {
        return { unauthorized: true, json: null as IPaginatedConversations | null, errorText: null as string | null }
      }

      if (!res.ok) {
        const text = await res.text()
        return { unauthorized: false, json: null as IPaginatedConversations | null, errorText: `Ошибка ${res.status}: ${text}` }
      }

      const json = (await res.json()) as IPaginatedConversations
      return { unauthorized: false, json, errorText: null as string | null }
    }

    // 1) Достаём accessToken из state
    const rawToken = getState().auth.accessToken
    if (!rawToken) {
      return rejectWithValue('Нет accessToken')
    }
    let bearer = `Bearer ${rawToken}`

    // 2) Первый запрос
    let result = await tryFetch(bearer)

    // 3) Если получили 401 → пробуем обновить токен
    if (result.unauthorized) {
      const refreshAction = await dispatch(refreshToken()).unwrap().catch(() => {
        dispatch(logout())
        return null
      })
      if (!refreshAction) {
        dispatch(logout())
        return rejectWithValue('logout')
      }
      // получили новый токен, собираем новый Bearer
      bearer = `Bearer ${getState().auth.accessToken}`
      result = await tryFetch(bearer)
      if (result.unauthorized) {
        dispatch(logout())
        return rejectWithValue('logout')
      }
    }

    // 4) Если вышла какая-то другая ошибка (не 401), возвращаем её в rejectWithValue
    if (result.errorText) {
      return rejectWithValue(result.errorText)
    }

    // 5) Успешно получили JSON типа IPaginatedConversations
    const paginated = result.json as IPaginatedConversations

    // 6) Возвращаем только массив conversations
    return paginated.results
  }
)


// 2) Получить историю сообщений по conversationId
export const fetchMessages = createAsyncThunk<
  IMessage[],           // возвращаемый тип — массив сообщений
  number,               // аргумент — conversationId
  { rejectValue: string; state: RootState }
>(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue, dispatch, getState }) => {
    const url = `${API_BASE}/conversations/${conversationId}/messages/`

    const tryFetch = async (token: string) => {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
      })
      if (res.status === 401) {
        return { unauthorized: true, data: null }
      }
      if (!res.ok) {
        const text = await res.text()
        return { unauthorized: false, data: rejectWithValue(`Ошибка ${res.status}: ${text}`) }
      }
      const data = (await res.json()) as IMessage[]
      return { unauthorized: false, data }
    }

    let token = getBearerToken(getState)
    if (!token) return rejectWithValue('Нет accessToken')

    let result = await tryFetch(token)
    if (result.unauthorized) {
      const refreshAction = await dispatch(refreshToken()).unwrap().catch(() => {
        dispatch(logout())
        return null
      })
      if (!refreshAction) return rejectWithValue('logout')
      token = `Bearer ${getState().auth.accessToken}`
      result = await tryFetch(token)
      if (result.unauthorized) {
        dispatch(logout())
        return rejectWithValue('logout')
      }
    }

    if (Array.isArray(result.data)) {
      return result.data
    } else {
      return rejectWithValue('Ошибка: неверный тип данных')
    }
  }
)


// 3) Создать новую беседу (если её ещё нет) — POST /conversations/
export const createConversation = createAsyncThunk<
  IConversation,
  ICreateConversationPayload,
  { rejectValue: string; state: RootState }
>(
  'chat/createConversation',
  async (payload, { rejectWithValue, dispatch, getState }) => {
    const url = `${API_BASE}/conversations/`

    const tryFetch = async (token: string) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(payload),
      })
      if (res.status === 401) {
        return { unauthorized: true, data: null }
      }
      if (!res.ok) {
        const text = await res.text()
        return { unauthorized: false, data: rejectWithValue(`Ошибка ${res.status}: ${text}`) }
      }
      const data = (await res.json()) as IConversation
      return { unauthorized: false, data }
    }

    let token = getBearerToken(getState)
    if (!token) return rejectWithValue('Нет accessToken')

    let result = await tryFetch(token)
    if (result.unauthorized) {
      const refreshAction = await dispatch(refreshToken()).unwrap().catch(() => {
        dispatch(logout())
        return null
      })
      if (!refreshAction) return rejectWithValue('logout')
      token = `Bearer ${getState().auth.accessToken}`
      result = await tryFetch(token)
      if (result.unauthorized) {
        dispatch(logout())
        return rejectWithValue('logout')
      }
    }

    if (result.data && typeof result.data === 'object') {
      return result.data
    } else {
      return rejectWithValue('Ошибка: неверный тип данных')
    }
  }
)


// 4) Отправить сообщение — POST /conversations/{id}/send_message/
export const sendMessage = createAsyncThunk<
  IMessage,               // тип, который вернется при успешном запросе
  ISendMessagePayload,    // { conversation_id, content }
  { rejectValue: string; state: RootState }
>(
  'chat/sendMessage',
  async ({ conversation_id, content }, { rejectWithValue, dispatch, getState }) => {
    const url = `${API_BASE}/conversations/${conversation_id}/send_message/`

    // 1) Вспомогательная “обёртка” для одного fetch с указанным токеном
    const tryFetchOnce = async (bearer: string) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: bearer,
        },
        body: JSON.stringify({ content }),
      })
      // Если 401 → говорим, что unauthorized, вернём null в data
      if (res.status === 401) {
        return { unauthorized: true, json: null as ISendMessageResponse | null }
      }
      // Если любая другая ошибка
      if (!res.ok) {
        const text = await res.text()
        return { unauthorized: false, json: null as ISendMessageResponse | null, errorText: `Ошибка ${res.status}: ${text}` }
      }
      // Всё ок, возвращаем распарсенный JSON
      const json = (await res.json()) as ISendMessageResponse
      return { unauthorized: false, json }
    }

    // 2) Попытка сделать запрос с текущим токеном
    let bearer = getBearerToken(getState)
    if (!bearer) {
      return rejectWithValue('Нет accessToken')
    }

    // Выполним первый fetch
    let result = await tryFetchOnce(bearer)

    // 3) Если статус 401 (accessToken устарел) — пробуем рефреш
    if (result.unauthorized) {
      // 3.1) Вызываем refreshToken
      const refresh = await dispatch(refreshToken()).unwrap().catch(() => {
        dispatch(logout())
        return null
      })
      if (!refresh) {
        // Рефреш не удалось: принудительный logout
        dispatch(logout())
        return rejectWithValue('logout')
      }
      // 3.2) Берём новый токен из стейта
      bearer = `Bearer ${getState().auth.accessToken}`
      // 3.3) Повторяем fetch с новым токеном
      result = await tryFetchOnce(bearer)
      if (result.unauthorized) {
        // Если снова 401 — выкидываем logout
        dispatch(logout())
        return rejectWithValue('logout')
      }
    }

    // 4) Если HTTP-ошибка (не 401), передаём текст ошибки дальше
    if ('errorText' in result && result.errorText) {
      return rejectWithValue(result.errorText)
    }

    // 5) Если мы здесь, result.json точно не null, преобразуем его в IMessage и возвращаем
    const data = result.json as ISendMessageResponse
    return {
      id: data.id,
      conversation_id: data.conversation_id,
      sender: data.sender,
      content: data.content,
      is_read: data.is_read,
      created_at: data.created_at,
    } as IMessage
  }
)

// 5) Обработка входящего WebSocket-сообщения
export const receiveMessage = createAction<{ conversationId: number; message: IMessage }>('chat/receiveMessage')
