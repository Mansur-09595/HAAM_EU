import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">О компании</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:underline">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline">
                  Вакансии
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:underline">
                  Пресс-центр
                </Link>
              </li>
              <li>
                <Link href="/safety" className="hover:underline">
                  Безопасность
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Помощь</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:underline">
                  Помощь
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:underline">
                  Правила
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline">
                  Часто задаваемые вопросы
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Для бизнеса</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/business" className="hover:underline">
                  Бизнес на HAAM
                </Link>
              </li>
              <li>
                <Link href="/advertising" className="hover:underline">
                  Реклама на сайте
                </Link>
              </li>
              <li>
                <Link href="/pro" className="hover:underline">
                  HAAM Pro
                </Link>
              </li>
              <li>
                <Link href="/api" className="hover:underline">
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Мобильные приложения</h3>
            <div className="flex space-x-4 mb-4">
              <Link href="#" className="hover:opacity-80">
                <img src="/placeholder.svg?height=40&width=120" alt="App Store" className="h-10" />
              </Link>
              <Link href="#" className="hover:opacity-80">
                <img src="/placeholder.svg?height=40&width=120" alt="Google Play" className="h-10" />
              </Link>
            </div>

            <h3 className="font-bold text-lg mb-2">Мы в соцсетях</h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-blue-600">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="hover:text-blue-600">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="hover:text-blue-600">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="hover:text-blue-600">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-sm text-gray-500">
          <p>© 2024 Хаам — сервис объявлений. Все права защищены.</p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link href="/terms" className="hover:underline">
              Условия использования
            </Link>
            <Link href="/privacy" className="hover:underline">
              Политика конфиденциальности
            </Link>
            <Link href="/cookies" className="hover:underline">
              Файлы cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

