import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminSession } from '@/lib/admin-session'
import { adminApproveMemorial } from '@/lib/memorial-store'

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const jar = await cookies()
  if (!isAdminSession(jar)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { slug } = await context.params
  const updated = await adminApproveMemorial(slug)
  if (!updated) {
    return NextResponse.json(
      { error: 'Memorial not found or not pending review' },
      { status: 400 },
    )
  }
  return NextResponse.json({ memorial: updated })
}
