import { ContributePageClient } from './contribute-client'

export default async function ContributePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ContributePageClient slug={slug} />
}
