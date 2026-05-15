import Image from 'next/image'
import { getVisualThemeMeta, type VisualTheme } from '@/lib/visual-themes'
import {
  flagshipShowcaseAssetUrl,
  isFlagshipShowcaseTheme,
  themePosterAssetUrl,
  themePreviewAssetUrl,
  type ThemeAssetTier,
} from '@/lib/theme-poster-assets'

function resolvePreviewSrc(themeId: string, tier: ThemeAssetTier): string {
  if (tier === 'burial-poster') return themePosterAssetUrl(themeId)
  if (tier === 'flagship-showcase' && isFlagshipShowcaseTheme(themeId)) {
    return flagshipShowcaseAssetUrl(themeId)
  }
  return themePreviewAssetUrl(themeId)
}

/** Thumbnail for a theme — uses the canonical asset for the chosen tier. */
export function ThemePreviewImage({
  themeId,
  tier = 'phone-preview',
  priority = false,
  large = false,
  className = '',
}: {
  themeId: VisualTheme
  tier?: ThemeAssetTier
  priority?: boolean
  large?: boolean
  className?: string
}) {
  const meta = getVisualThemeMeta(themeId)
  const src = resolvePreviewSrc(themeId, tier)
  const alt = meta ? `${meta.label} memorial preview` : `${themeId} memorial preview`

  const isBurial = tier === 'burial-poster'
  const isFlagship = tier === 'flagship-showcase' && isFlagshipShowcaseTheme(themeId)
  const aspect = isFlagship ? 'aspect-[3/2]' : isBurial ? 'aspect-[9/16]' : 'aspect-[390/693]'
  const frameMax = large
    ? isFlagship
      ? 'max-w-[min(100%,1024px)]'
      : 'max-w-[min(100%,390px)]'
    : isFlagship
      ? 'max-w-[280px]'
      : isBurial
        ? 'max-w-[180px]'
        : 'max-w-[200px]'
  const width = isFlagship ? 1024 : isBurial ? 1080 : 390
  const height = isFlagship ? 683 : isBurial ? 1920 : 693

  return (
    <div className={`mx-auto w-full min-w-[140px] ${frameMax} ${className}`}>
      <div
        className={`overflow-hidden ${isFlagship ? 'rounded-xl' : 'rounded-[20px] border border-[#1a1a1a]/12 bg-[#1a1a1a] p-1 shadow-md'}`}
      >
        <div className={`${aspect} overflow-hidden ${isFlagship ? '' : 'rounded-[15px]'}`}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`h-full w-full ${isFlagship ? 'object-contain object-center' : 'object-cover object-top'}`}
            sizes={large ? '(max-width: 768px) 100vw, 480px' : '200px'}
            priority={priority}
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}
