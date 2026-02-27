import { useParams } from 'react-router-dom'

export function DealDetailsPage() {
  const { id } = useParams()

  return (
    <section>
      <h1 className="text-2xl font-semibold">Deal Details</h1>
      <p className="mt-2 text-slate-600">Deal id: {id ?? 'none'}</p>
    </section>
  )
}
