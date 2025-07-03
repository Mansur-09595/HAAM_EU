'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function ConfirmMailSentPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto p-6 text-center space-y-4">
      <h1 className="text-2xl font-bold">Проверьте почту</h1>
      <p>Мы отправили вам письмо с инструкциями по подтверждению e-mail.</p>
      <Button onClick={() => router.push('/')}>На главную</Button>
    </div>
  )
}