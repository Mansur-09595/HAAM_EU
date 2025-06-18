export default async function AdPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Объявление: {slug}</h1>
      <p>Вы перешли по несуществующей ссылке </p>
    </main>
  )
}
