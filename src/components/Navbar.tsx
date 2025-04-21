'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/store'
import { logout } from '@/store/slices/auth/authSlice'

const links = [
  { href: '/', label: 'Главная' },
  { href: '/favorites', label: 'Избранное' },
  { href: '/about', label: 'О сайте' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    router.push('/login')
  }

  return (
    <nav className="p-4 border-b flex justify-between items-center">
      <div className="flex gap-4">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'font-bold text-blue-500' : ''}
          >
            {link.label}
          </Link>
        ))}

        {user && (
           <>
           <Link
             href="/profile"
             className={pathname === '/profile' ? 'font-bold text-blue-500' : ''}
           >
             Профиль
           </Link>
           <Link
             href="/my-ads"
             className={pathname === '/my-ads' ? 'font-bold text-blue-500' : ''}
           >
             Мои объявления
           </Link>
         </>
        )}
      </div>

      <div>
        {user ? (
          <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
            Выйти
          </button>
        ) : (
          <Link
            href="/login"
            className={pathname === '/login' ? 'font-bold text-blue-500' : 'text-sm text-blue-600'}
          >
            Войти
          </Link>
        )}
      </div>
    </nav>
  )
}
