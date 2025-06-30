// import Link from "next/link"
// import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

// export default function Footer() {
//   return (
//     <footer className="bg-gray-100 border-t">
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <div>
//             <h3 className="font-bold text-lg mb-4">О проекте</h3>
//             <ul className="space-y-2">
//               <li>
//                 <Link href="/about" className="hover:underline">
//                   О нас
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/#" className="hover:underline line-through  text-gray-500">
//                   Контакты<span className="text-red-500"> (в разработке)</span>
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4">Поддержка</h3>
//             <ul className="space-y-2 line-through text-gray-500">
//               {/* <li>
//                 <Link href="/#" className="hover:underline">
//                   Помощь<span className="text-red-500"> (в разработке)</span>
//                 </Link>
//               </li> */}
//               <li>
//                 <Link href="/#" className="hover:underline">
//                   Правила использования<span className="text-red-500"> (в разработке)</span>
//                 </Link>
//               </li>
//               <li>
//                 <Link href="/#" className="hover:underline">
//                   Вопросы и ответы<span className="text-red-500"> (в разработке)</span>
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4 line-through  text-gray-500">Мобильные приложения<span className="text-red-500"> (в разработке)</span></h3>

//             <h3 className="font-bold text-lg mb-2 line-through  text-gray-500">Мы в соцсетях<span className="text-red-500"> (в разработке)</span></h3>
//             <div className="flex space-x-4">
//               <Link href="#" className="hover:text-blue-600">
//                 <Facebook className="h-6 w-6" />
//               </Link>
//               <Link href="#" className="hover:text-pink-500">
//                 <Instagram className="h-6 w-6" />
//               </Link>
//               <Link href="#" className="hover:text-sky-500">
//                 <Twitter className="h-6 w-6" />
//               </Link>
//               <Link href="#" className="hover:text-red-600">
//                 <Youtube className="h-6 w-6" />
//               </Link>
//             </div>
//           </div>
//         </div>

//         <div className="border-t mt-8 pt-6 text-sm text-gray-500">
//           <p>© 2025 HAAM — сервис объявлений. Все права защищены.</p>
//           <div className="flex flex-wrap gap-4 mt-2">
//             <Link href="/cookies" className="hover:underline">
//               Cookie
//             </Link>
//           </div>
//         </div>
//       </div>
//     </footer>
//   )
// }


"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Facebook, Instagram, Twitter, Youtube, Home, Search, Plus, Heart, User } from "lucide-react"

export default function Footer() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Footer */}
      <footer className="bg-gray-100 border-t hidden md:block">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">О компании</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="hover:underline">
                    О нас
                  </Link>
                </li>
                <li>
                  <Link href="/#" className="hover:underline">
                    Контакты
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:underline">
                    Помощь
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Пользователям</h3>
              <ul className="space-y-2">
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
                <li>
                  <Link href="/safety" className="hover:underline">
                    Безопасность сделок
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
            <p>© 2025 HAAM — сервис объявлений. Все права защищены.</p>
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

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center py-2">
          <Link
            href="/"
            className={`flex flex-col items-center p-2 ${pathname === "/" ? "text-blue-600" : "text-gray-600"}`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Главная</span>
          </Link>

          <Link
            href="/listings"
            className={`flex flex-col items-center p-2 ${pathname === "/listings" ? "text-blue-600" : "text-gray-600"}`}
          >
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Поиск</span>
          </Link>

          <Link
            href="/new"
            className="flex flex-col items-center p-2 text-white bg-blue-600 rounded-full mx-2"
          >
            <Plus className="h-6 w-6" />
          </Link>

          <Link
            href="/favorites"
            className={`flex flex-col items-center p-2 ${
              pathname === "/favorites" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs mt-1">Избранное</span>
          </Link>

          <Link
            href="/profile"
            className={`flex flex-col items-center p-2 ${pathname === "/profile" ? "text-blue-600" : "text-gray-600"}`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Профиль</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
