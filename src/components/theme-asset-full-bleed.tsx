import Image from 'next/image'
import { getVisualThemeMeta, type VisualTheme } from '@/lib/visual-themes'
import {
  flagshipShowcaseAssetUrl,
  isFlagshipShowcaseTheme,
  themePosterAssetUrl,
  themePreviewAssetUrl,
  type FlagshipShowcaseThemeId,
} from '@/lib/theme-poster-assets'
import type { ThemeAssetTier } from '@/lib/theme-poster-assets'

export type { ThemeAssetTier } from '@/lib/theme-poster-assets'

function resolveAssetSrc(themeId: string, tier: ThemeAssetTier): string {
  if (tier === 'burial-poster') return themePosterAssetUrl(themeId)
  if (tier === 'flagship-showcase') {
    if (isFlagshipShowcaseTheme(themeId)) return flagshipShowcaseAssetUrl(themeId)
    return themePreviewAssetUrl(themeId)
  }
  return themePreviewAssetUrl(themeId)
}

const TIER_LAYOUT: Record<
  ThemeAssetTier,
  { aspect: string; sizes: string; objectFit: 'contain' | 'cover' }
> = {
  'phone-preview': {
    aspect: 'aspect-[390/693]',
    sizes: '(max-width: 1024px) 100vw, 480px',
    objectFit: 'cover',
  },
  'burial-poster': {
    aspect: 'aspect-[9/16]',
    sizes: '(max-width: 1024px) 100vw, 480px',
    objectFit: 'cover',
  },
  'flagship-showcase': {
    aspect: 'aspect-[3/2]',
    sizes: '(max-width: 1024px) 100vw, 1024px',
    objectFit: 'contain',
  },
}

/** Full-bleed canonical asset — same file as matching thumbnail tier. */
export function ThemeAssetFullBleed({
  themeId,
  tier,
  priority = false,
  className = '',
}: {
  themeId: VisualTheme | FlagshipShowcaseThemeId
  tier: ThemeAssetTier
  priority?: boolean
  className?: string
}) {
  const meta = getVisualThemeMeta(themeId)
  const src = resolveAssetSrc(themeId, tier)
  const layout = TIER_LAYOUT[tier]
  const alt = meta
    ? `${meta.label} memorial ${tier === 'burial-poster' ? 'burial poster' : 'preview'}`
    : `${themeId} preview`

  return (
    <div className={`mx-auto w-full max-w-3xl ${className}`}>
      <div
        className={`relative w-full overflow-hidden rounded-2xl border border-[#3D2B1F]/12 bg-[#F4F0E8] shadow-lg ${layout.aspect}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={layout.objectFit === 'contain' ? 'object-contain object-center' : 'object-cover object-top'}
          sizes={layout.sizes}
          priority={priority}
          unoptimized
        />
      </div>
    </div>
  )
}
