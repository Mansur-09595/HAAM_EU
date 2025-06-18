import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IConversation, IMessage } from "@/types/chatTypes";
import {
  fetchConversations,
  fetchMessages,
  sendMessage,
  createConversation,
  receiveMessage,
  markConversationRead,
} from "./chatActions";

interface IMessagesState {
  [conversationId: number]: {
    messages: IMessage[];
    loading: boolean;
    error: string | null;
  };
}

interface IChatState {
  conversations: {
    items: IConversation[];
    loading: boolean;
    error: string | null;
  };
  messagesByConversation: IMessagesState;
  createConversation: {
    loading: boolean;
    error: string | null;
  };
  sendMessage: {
    loading: boolean;
    error: string | null;
  };
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
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ─── fetchConversations ─────────────────────────────────
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversations.loading = true;
        state.conversations.error = null;
      })
      .addCase(
        fetchConversations.fulfilled,
        (state, action: PayloadAction<IConversation[]>) => {
          state.conversations.loading = false;
          state.conversations.items = action.payload;
        }
      )
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversations.loading = false;
        state.conversations.error =
          action.payload ?? action.error.message ?? null;
      });

    // ─── fetchMessages ──────────────────────────────────────
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const convId = action.meta.arg;
        if (!state.messagesByConversation[convId]) {
          state.messagesByConversation[convId] = {
            messages: [],
            loading: false,
            error: null,
          };
        }
        state.messagesByConversation[convId].loading = true;
        state.messagesByConversation[convId].error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const convId = action.meta.arg;
        state.messagesByConversation[convId].loading = false;
        state.messagesByConversation[convId].messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const convId = action.meta.arg;
        state.messagesByConversation[convId].loading = false;
        state.messagesByConversation[convId].error =
          action.payload ?? action.error.message ?? null;
      });

    // ─── createConversation ─────────────────────────────────
    builder
      .addCase(createConversation.pending, (state) => {
        state.conversations.loading = true;
        state.conversations.error = null;
      })
      .addCase(
        createConversation.fulfilled,
        (state, action: PayloadAction<IConversation>) => {
          state.conversations.loading = false;
          const exists = state.conversations.items.some(
            (c) => c.id === action.payload.id
          );
          if (!exists) {
            state.conversations.items.unshift(action.payload);
          }
        }
      )
      .addCase(createConversation.rejected, (state, action) => {
        state.conversations.loading = false;
        state.conversations.error =
          action.payload ?? action.error.message ?? null;
      });

    // ─── sendMessage ────────────────────────────────────────
    builder
      .addCase(sendMessage.pending, (state, action) => {
        const convId = action.meta.arg.conversation_id;
        console.log('[REDUCER] sendMessage.pending → conversationId=', convId);
        if (!state.messagesByConversation[convId]) {
          state.messagesByConversation[convId] = {
            messages: [],
            loading: false,
            error: null,
          };
        }
        state.messagesByConversation[convId].loading = true;
        state.messagesByConversation[convId].error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const convId = action.meta.arg.conversation_id;
        console.log('[REDUCER] sendMessage.fulfilled → conversationId=', convId, 'message=', action.payload);
        state.messagesByConversation[convId].loading = false;
        state.messagesByConversation[convId].messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const convId = action.meta.arg.conversation_id;
        console.log('[REDUCER] sendMessage.rejected → conversationId=', convId, 'error=', action.payload ?? action.error.message);
        state.messagesByConversation[convId].loading = false;
        state.messagesByConversation[convId].error =
          action.payload ?? action.error.message ?? null;
      });
    // ─── receiveMessage (WebSocket) ─────────────────────────
    builder.addCase(receiveMessage, (state, action) => {
      const { conversationId, message } = action.payload;
      console.log('[REDUCER] receiveMessage → conversationId=', conversationId, 'message=', message);
      const msgsState = state.messagesByConversation[conversationId];

      if (msgsState) {
        msgsState.messages.push(message);
      } else {
        state.messagesByConversation[conversationId] = {
          messages: [message],
          loading: false,
          error: null,
        };
      }

      // Обновляем last_message в conversations
      const conv = state.conversations.items.find(
        (c) => c.id === conversationId
      );
      if (conv) {
        conv.last_message = message;
      }
    }
  )
    builder.addCase(markConversationRead.fulfilled, (state, { payload }) => {
      const conv = state.conversations.items.find(c => c.id === payload.conversationId)
      if (conv) {
        conv.unread_count = 0
        if (conv.last_message) conv.last_message.is_read = true
      }
      // и в списке сообщений беседы
      const msgsState = state.messagesByConversation[payload.conversationId]
      if (msgsState) {
        msgsState.messages = msgsState.messages.map(m => ({ ...m, is_read: true }))
      }
    })
  },
});

export default chatSlice.reducer;
