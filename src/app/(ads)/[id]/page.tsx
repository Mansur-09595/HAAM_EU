import { notFound } from 'next/navigation'

export default async function AdPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params // ✅ Ждём промис

  if (!id) return notFound()

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Объявление #{id}</h1>
      <p>Здесь будет информация об объявлении с ID {id}.</p>
    </main>
  )
}
