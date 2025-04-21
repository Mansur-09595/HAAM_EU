'use client'

import { useAppSelector } from '@/store/store'
import PrivateRoute from '@/components/PrivateRoute'

export default function ProfilePage() {
  const { user } = useAppSelector(state => state.auth)

  return (
    <PrivateRoute>
      <main className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">👤 Профиль</h1>
        {user && (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Bio:</strong> {user.bio || '—'}</p>
            <p><strong>Phone:</strong> {user.phone || '—'}</p>
          </div>
        )}
      </main>
    </PrivateRoute>
  )
}
