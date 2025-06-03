// src/app/messages/[conversationId]/page.tsx
'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAppSelector } from '@/store/store'
import  ChatWidget  from '@/components/ChatWidget'

export default function ConversationPage() {
  const { conversationId } = useParams()
  const currentUser = useAppSelector(state => state.auth.user)

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <Link href="/login" className="text-blue-600">Перейти к логину</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <ChatWidget
        userId={currentUser.id}
        conversationId={Number(conversationId)}
      />
    </div>
  )
}
