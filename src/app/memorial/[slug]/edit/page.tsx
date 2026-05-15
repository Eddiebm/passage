import { EditPortal } from './edit-portal'

export default async function EditMemorialPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <EditPortal slug={slug} />
}
