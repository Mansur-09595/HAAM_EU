import './globals.css'
import type { Metadata } from 'next'
import { Providers } from './providers' // Импортируем обёртку
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'DIaẋedarş — Avito Clone',
  description: 'Объявления для вайнахов в Европе',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Оборачиваем всё приложение в Redux-провайдер */}
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
