import type { Memorial, ProgrammeReading } from '@/lib/types'

export function sortProgrammeReadings(readings: ProgrammeReading[]): ProgrammeReading[] {
  return [...readings].sort((a, b) => {
    const ao = a.sort_order ?? 0
    const bo = b.sort_order ?? 0
    if (ao !== bo) return ao - bo
    return 0
  })
}

export function publicProgrammeReadings(memorial: Memorial): ProgrammeReading[] {
  const list = memorial.programme_readings ?? []
  return sortProgrammeReadings(
    list.filter((r) => r.visibility !== 'coordinator_only'),
  )
}

export function hasPublicProgrammeReadings(memorial: Memorial): boolean {
  return publicProgrammeReadings(memorial).length > 0
}
