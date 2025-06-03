// src/components/ChatWidget.tsx

'use client';
import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  receiveMessage,
  fetchMessages,
} from '@/store/slices/chat/chatActions';
import { IMessage } from '@/types/chatTypes';

interface ChatWidgetProps {
  userId: number;
  conversationId: number;
}

export default function ChatWidget({ userId, conversationId }: ChatWidgetProps) {
  const dispatch = useAppDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const messagesState = useAppSelector((state) =>
    state.chat.messagesByConversation[conversationId]
  );
  const messages = messagesState?.messages ?? [];
  const loadingMessages = messagesState?.loading ?? false;
  const errorMessages = messagesState?.error;

  useEffect(() => {
    // 1) Подгружаем историю через REST
    dispatch(fetchMessages(conversationId));

    // 2) Открываем WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://localhost:8000/ws/chat/${userId}/`)
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket для чата открыт');
    };
    ws.onclose = () => {
      console.log('WebSocket для чата закрыт');
    };
    ws.onerror = (err) => {
      console.error('WebSocket ошибка', err);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_message') {
        const message: IMessage = data.message;
        // Проверяем, что это именно наша беседа
        if (message.conversation_id === conversationId) {
          dispatch(receiveMessage({ conversationId, message }));
        }
      }
    };

    return () => {
      ws.close();
    };
  }, [conversationId, dispatch, userId]);

  // Отправка нового сообщения
  const handleSend = (content: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const payload = {
      type: 'chat_message',
      conversation_id: conversationId,
      content,
    };
    wsRef.current.send(JSON.stringify(payload));
    // Опционально дизпатчим sendMessage, чтобы сразу рендерить (но обычно WS пришлёт back свою же копию):
    // dispatch(sendMessage({ conversation_id: conversationId, content }));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-grow overflow-y-auto p-2">
        {loadingMessages && <p>Загрузка...</p>}
        {errorMessages && <p className="text-red-500">{errorMessages}</p>}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${
              msg.sender.id === userId ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'
            }`}
          >
            <div className="text-xs text-gray-600">{msg.sender.username}</div>
            <div>{msg.content}</div>
            <div className="text-[10px] text-gray-500">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 border-t flex">
        <input
          type="text"
          className="flex-grow border rounded px-2 py-1"
          placeholder="Введите сообщение..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const target = e.target as HTMLInputElement;
              const text = target.value.trim();
              if (text) {
                handleSend(text);
                target.value = '';
              }
            }
          }}
        />
        <button
          className="ml-2 bg-green-500 text-white px-4 rounded"
          onClick={() => {
            const inp = document.querySelector(
              'input[placeholder="Введите сообщение..."]'
            ) as HTMLInputElement;
            const text = inp.value.trim();
            if (text) {
              handleSend(text);
              inp.value = '';
            }
          }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
}
