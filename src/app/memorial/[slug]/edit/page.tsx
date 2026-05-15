import { Suspense } from 'react'
import { EditPortal } from './edit-portal'

export default async function EditMemorialPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <Suspense fallback={<div className="min-h-full bg-[#FAFAF8] p-10 text-sm">Loading…</div>}>
      <EditPortal slug={slug} />
    </Suspense>
  )
}
