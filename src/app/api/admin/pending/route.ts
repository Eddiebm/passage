import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminSession } from '@/lib/admin-session'
import { listMemorialsByStatus } from '@/lib/memorial-store'

export async function GET() {
  const jar = await cookies()
  if (!isAdminSession(jar)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const memorials = await listMemorialsByStatus('pending_review')
  return NextResponse.json({ memorials })
}
