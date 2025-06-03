import { Users } from './IUsers';
import { Ads } from './IAds';

export interface IMessage {
    id: number;
    conversation_id: number;
    sender: {
        id: number
        username: string
        email: string
        phone: string | null
        avatar: string | null
        bio: string
        date_joined: string
    };
    content: string;
    is_read: boolean;
    created_at: string; // ISO‐строка
}
  
export interface IConversation {
    id: number
    participants: Users[] // список участников (UserSerializer)
    listing: Ads | null
    created_at: string
    updated_at: string
    last_message: IMessage | null
    unread_count: number
}

export interface IPaginatedConversations {
    count: number
    next: string | null
    previous: string | null
    results: IConversation[]
}
  
  // Пейлоад для создания беседы:
export interface ICreateConversationPayload {
    participant_id: number;    // id пользователя, с которым хотим начать диалог
    listing_id?: number;       // опционально: id объявления
}
  
  // Пейлоад для отправки сообщения:
export interface ISendMessagePayload {
    conversation_id: number;
    content: string;
}
  
  // Состояние одного разговора в Redux: 
  // здесь будем хранить историю сообщений, статус загрузки и ошибку
export interface IMessagesState {
    [conversationId: number]: {
      messages: IMessage[];
      loading: boolean;
      error: string | null;
    };
}
  
  // Основное состояние slice’а
export interface IChatState {
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
  