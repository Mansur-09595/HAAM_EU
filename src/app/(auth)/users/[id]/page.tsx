'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { fetchUserById, deleteUser } from '@/store/slices/auth/users/usersAction'

export default function UserDetailPage() {
  // 1) Получаем id как строку
  const params = useParams()
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id
  const id = idParam ? Number(idParam) : null

  const dispatch = useAppDispatch()
  const router = useRouter()

  // 2) Берём из стора профиль, загрузку, ошибку и текущего юзера
  const user = useAppSelector(state => state.users.selected)
  const loading = useAppSelector(state => state.users.loading)
  const error = useAppSelector(state => state.users.error)
  const currentUser = useAppSelector(state => state.auth.user)

  // 3) Загружаем профиль
  useEffect(() => {
    if (id !== null) dispatch(fetchUserById(id))
  }, [id, dispatch])

  if (loading) return <p>Загрузка…</p>
  if (error)   return <p className="text-red-500">Ошибка: {error}</p>
  if (!user)  return <p>Пользователь не найден.</p>

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-2">{user.username}</h1>
      <p className="mb-4 text-gray-600">{user.email}</p>

      {/* 4) Кнопки только для своего профиля или админа */}
      {(currentUser?.id === user.id || currentUser?.is_staff) && (
        <div className="space-x-2">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => router.push(`/users/${id}/edit`)}
          >
            Редактировать
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={() =>
              dispatch(deleteUser(id!))
                .unwrap()
                .then(() => router.push('/users'))
            }
          >
            Удалить
          </button>
        </div>
      )}
    </div>
  )
}
