import type { Memorial, ProgrammeReading } from '@/lib/types'

export function sortProgrammeReadings(readings: ProgrammeReading[]): ProgrammeReading[] {
  return [...readings].sort((a, b) => {
    const ao = a.sort_order ?? 0
    const bo = b.sort_order ?? 0
    if (ao !== bo) return ao - bo
    return 0
  })
}

function normalizeProgrammeReading(raw: unknown): ProgrammeReading | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<ProgrammeReading>
  if (typeof r.id !== 'string' || typeof r.type !== 'string') return null
  return {
    ...r,
    id: r.id,
    type: r.type,
    title: typeof r.title === 'string' ? r.title : '',
  } as ProgrammeReading
}

export function publicProgrammeReadings(memorial: Memorial): ProgrammeReading[] {
  const list = memorial.programme_readings ?? []
  const normalized = list
    .map(normalizeProgrammeReading)
    .filter((r): r is ProgrammeReading => r !== null && r.visibility !== 'coordinator_only')
  return sortProgrammeReadings(normalized)
}

export function hasPublicProgrammeReadings(memorial: Memorial): boolean {
  return publicProgrammeReadings(memorial).length > 0
}
