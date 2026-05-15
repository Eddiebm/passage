import type { MemorialMode, OutputTemplate, VisualTheme } from '@/lib/types'
import {
  SERVICE_TIER_COPY,
  SERVICE_TIER_ORDER,
  getServiceTierCopy,
  type ServiceTierCopy,
  type ServiceTierMode,
} from '@/lib/service-tier-copy'

export type { ServiceTierMode, ServiceTierCopy }
export { SERVICE_TIER_COPY, SERVICE_TIER_ORDER, getServiceTierCopy }

export type ServiceTierConfig = ServiceTierCopy

/** Ordered tier configs for tabs and lists. */
export const SERVICE_TIERS: ServiceTierConfig[] = SERVICE_TIER_ORDER.map(
  (mode) => SERVICE_TIER_COPY[mode],
)

export function isServiceTierMode(value: string | null | undefined): value is ServiceTierMode {
  return value === 'notice' || value === 'programme' || value === 'full'
}

export function tierLabel(mode: ServiceTierMode): string {
  return SERVICE_TIER_COPY[mode].label
}

export type ServiceTierDefaults = {
  memorial_mode: MemorialMode
  output_template: OutputTemplate
  visual_theme: VisualTheme
}

/** Defaults applied when a tier is chosen in the create wizard. */
export function tierDefaults(mode: ServiceTierMode): ServiceTierDefaults {
  switch (mode) {
    case 'notice':
      return {
        memorial_mode: 'notice',
        output_template: 'notice',
        visual_theme: 'programme',
      }
    case 'programme':
      return {
        memorial_mode: 'programme',
        output_template: 'programme',
        visual_theme: 'programme',
      }
    case 'full':
      return {
        memorial_mode: 'full',
        output_template: 'programme',
        visual_theme: 'programme',
      }
  }
}
