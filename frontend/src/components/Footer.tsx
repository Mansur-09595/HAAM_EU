import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">О проекте</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:underline">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/#" className="hover:underline line-through  text-gray-500">
                  Контакты<span className="text-red-500"> (в разработке)</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Поддержка</h3>
            <ul className="space-y-2 line-through text-gray-500">
              <li>
                <Link href="/#" className="hover:underline">
                  Помощь<span className="text-red-500"> (в разработке)</span>
                </Link>
              </li>
              <li>
                <Link href="/#" className="hover:underline">
                  Правила использования<span className="text-red-500"> (в разработке)</span>
                </Link>
              </li>
              <li>
                <Link href="/#" className="hover:underline">
                  Вопросы и ответы<span className="text-red-500"> (в разработке)</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 line-through  text-gray-500">Мобильные приложения<span className="text-red-500"> (в разработке)</span></h3>
            <div className="flex space-x-4 mb-4">
              <Link href="#">
                <img
                  src="/placeholder.svg?height=40&width=120"
                  alt="App Store"
                  className="h-10 hover:opacity-80"
                />
              </Link>
              <Link href="#">
                <img
                  src="/placeholder.svg?height=40&width=120"
                  alt="Google Play"
                  className="h-10 hover:opacity-80"
                />
              </Link>
            </div>

            <h3 className="font-bold text-lg mb-2 line-through  text-gray-500">Мы в соцсетях<span className="text-red-500"> (в разработке)</span></h3>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-blue-600">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" className="hover:text-pink-500">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" className="hover:text-sky-500">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" className="hover:text-red-600">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-sm text-gray-500">
          <p>© 2025 HAAM — сервис объявлений. Все права защищены.</p>
          <div className="flex flex-wrap gap-4 mt-2">
            {/* <Link href="/terms" className="hover:underline">
              Условия использования
            </Link>
            <Link href="/privacy" className="hover:underline">
              Политика конфиденциальности
            </Link> */}
            <Link href="/cookies" className="hover:underline">
              Cookie
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
