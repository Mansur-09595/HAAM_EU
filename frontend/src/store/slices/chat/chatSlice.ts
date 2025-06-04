// src/store/slices/chat/chatSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IConversation, IMessage } from '@/types/chatTypes'
import { fetchConversations, fetchMessages, sendMessage, createConversation } from './chatActions'

interface IMessagesState {
  [conversationId: number]: {
    messages: IMessage[]
    loading: boolean
    error: string | null
  }
}

interface IChatState {
  conversations: {
    items: IConversation[]
    loading: boolean
    error: string | null
  }
  messagesByConversation: IMessagesState
  createConversation: {
    loading: boolean
    error: string | null
  }
  sendMessage: {
    loading: boolean
    error: string | null
  }
}

const initialState: IChatState = {
  conversations: {
    items: [],
    loading: false,
    error: null,
  },
  messagesByConversation: {},
  createConversation: {
    loading: false,
    error: null,
  },
  sendMessage: {
    loading: false,
    error: null,
  },
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // ─── fetchConversations ───────────────────────────────────────────────────
    builder
      .addCase(fetchConversations.pending, state => {
        state.conversations.loading = true
        state.conversations.error = null
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<IConversation[]>) => {
        state.conversations.loading = false
        state.conversations.items = action.payload
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversations.loading = false
        state.conversations.error = action.payload ?? action.error.message ?? null
      })

      // ─── fetchMessages ─────────────────────────────────────────────────────────
      builder
        .addCase(fetchMessages.pending, (state, action) => {
          const convId = action.meta.arg
          if (!state.messagesByConversation[convId]) {
            state.messagesByConversation[convId] = { messages: [], loading: false, error: null }
          }
          state.messagesByConversation[convId].loading = true
          state.messagesByConversation[convId].error = null
        })
        .addCase(fetchMessages.fulfilled, (state, action) => {
          const convId = action.meta.arg
          state.messagesByConversation[convId].loading = false
          state.messagesByConversation[convId].messages = action.payload
        })
        .addCase(fetchMessages.rejected, (state, action) => {
          const convId = action.meta.arg
          state.messagesByConversation[convId].loading = false
          state.messagesByConversation[convId].error = action.payload ?? action.error.message ?? null
        }
      )

      // ─── sendMessage ───────────────────────────────────────────────────────────
      builder
        .addCase(sendMessage.pending, (state, action) => {
          const convId = action.meta.arg.conversation_id
          if (!state.messagesByConversation[convId]) {
            state.messagesByConversation[convId] = { messages: [], loading: false, error: null }
          }
          state.messagesByConversation[convId].loading = true
          state.messagesByConversation[convId].error = null
        })
        .addCase(sendMessage.fulfilled, (state, action) => {
          const convId = action.meta.arg.conversation_id
          state.messagesByConversation[convId].loading = false
          // Добавляем только что отправленное сообщение в конец массива
          state.messagesByConversation[convId].messages.push(action.payload)
        })
        .addCase(sendMessage.rejected, (state, action) => {
          const convId = action.meta.arg.conversation_id
          state.messagesByConversation[convId].loading = false
          state.messagesByConversation[convId].error = action.payload ?? action.error.message ?? null
        }
      )

      // ─── createConversation ────────────────────────────────────────────────────
      builder
        .addCase(createConversation.pending, state => {
          state.conversations.loading = true
          state.conversations.error = null
        })
        .addCase(createConversation.fulfilled, (state, action: PayloadAction<IConversation>) => {
          state.conversations.loading = false
          // Добавляем новую беседу, если её не было
          const exists = state.conversations.items.some(c => c.id === action.payload.id)
          if (!exists) {
            state.conversations.items.unshift(action.payload)
          }
        })
        .addCase(createConversation.rejected, (state, action) => {
          state.conversations.loading = false
          state.conversations.error = action.payload ?? action.error.message ?? null
        }
      )
  },
})

export default chatSlice.reducer
