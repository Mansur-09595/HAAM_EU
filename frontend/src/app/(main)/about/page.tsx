import Link from "next/link"

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-6 text-center">
        О проекте <span className="text-primary">
          <Link href="/" className="text-3xl font-bold text-blue-700 ml-2 md:ml-0">
            HAAM.BE
          </Link></span>
      </h1>

      <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
        <p>
          <strong className="text-foreground text-blue-700">HAAM.be</strong> — это сервис объявлений, созданный командой вайнахов из Бельгии. Наша цель — объединить и поддержать не только вайнахскую диаспору, но и всех русскоязычных людей, проживающих в Европе.
        </p>

        <p>
          Сайт даёт возможность легко размещать объявления — будь то <span className="font-medium text-foreground text-blue-700">товары, услуги, аренда жилья или поиск специалистов</span>. Это место, где каждый может поделиться нужным или найти подходящее.
        </p>

        <p>
          В данный момент платформа активно работает в <span className="font-semibold text-foreground text-blue-700">Бельгии</span>, но мы стремимся к расширению. В ближайшем будущем мы добавим поддержку других европейских стран и городов.
        </p>

        <p>
          Мы — небольшая, но целеустремлённая команда, и работаем каждый день, чтобы сделать <span className="text-primary font-semibold text-blue-700">сервис</span> удобным, доступным и полезным сервисом для всех.
        </p>

        <p className="font-medium text-foreground text-blue-700">
          HAAM.be — чтобы было проще, ближе и надёжнее.
        </p>
      </div>
    </main>
  )
}
