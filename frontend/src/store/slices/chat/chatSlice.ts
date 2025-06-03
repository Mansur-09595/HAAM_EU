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
    // ─── fetchConversations ─────────────────────────────────────────────────
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

    // ─── createConversation ─────────────────────────────────────────────────
    builder
      .addCase(createConversation.pending, state => {
        state.createConversation.loading = true
        state.createConversation.error = null
      })
      .addCase(createConversation.fulfilled, (state, action: PayloadAction<IConversation>) => {
        state.createConversation.loading = false
        // Если беседы ещё нет в списке, добавим
        const conv = action.payload
        const exists = state.conversations.items.find(c => c.id === conv.id)
        if (!exists) {
          state.conversations.items.unshift(conv)
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.createConversation.loading = false
        state.createConversation.error = action.payload ?? action.error.message ?? null
      })

    // ─── fetchMessages ────────────────────────────────────────────────────────
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const convId = action.meta.arg
        state.messagesByConversation[convId] = {
          messages: [],
          loading: true,
          error: null,
        }
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const convId = action.meta.arg
        state.messagesByConversation[convId] = {
          messages: action.payload,
          loading: false,
          error: null,
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const convId = action.meta.arg
        state.messagesByConversation[convId] = {
          messages: [],
          loading: false,
          error: action.payload ?? action.error.message ?? null,
        }
      })

    // ─── sendMessage ─────────────────────────────────────────────────────────
    builder
      .addCase(sendMessage.pending, state => {
        state.sendMessage.loading = true
        state.sendMessage.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendMessage.loading = false
        const msg = action.payload
        const convId = msg.conversation_id
        if (!state.messagesByConversation[convId]) {
          state.messagesByConversation[convId] = {
            messages: [],
            loading: false,
            error: null,
          }
        }
        state.messagesByConversation[convId].messages.push(msg)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendMessage.loading = false
        state.sendMessage.error = action.payload ?? action.error.message ?? null
      })
  },
})

export default chatSlice.reducer
