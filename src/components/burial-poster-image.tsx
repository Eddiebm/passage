import Image from 'next/image'
import { BURIAL_POSTER_HEIGHT, BURIAL_POSTER_WIDTH } from '@/lib/burial-poster'
import { themePosterAssetUrl } from '@/lib/theme-poster-assets'
import { getVisualThemeMeta, type VisualTheme } from '@/lib/visual-themes'

/** Full-resolution burial poster JPEG (1080×1920). */
export function BurialPosterImage({
  themeId,
  priority = false,
  compact = false,
  className = '',
}: {
  themeId: VisualTheme
  priority?: boolean
  compact?: boolean
  className?: string
}) {
  const meta = getVisualThemeMeta(themeId)
  const src = themePosterAssetUrl(themeId)
  const alt = meta
    ? `${meta.label} burial poster — Passage`
    : `${themeId} burial poster`

  const maxW = compact ? 'max-w-[180px]' : 'max-w-[min(100%,320px)]'

  return (
    <div className={`mx-auto w-full ${maxW} ${className}`}>
      <div
        className={`overflow-hidden rounded-lg border border-[#1a1a1a]/12 shadow-md ${compact ? 'rounded-md' : ''}`}
      >
        <div className="aspect-[9/16] w-full">
          <Image
            src={src}
            alt={alt}
            width={BURIAL_POSTER_WIDTH}
            height={BURIAL_POSTER_HEIGHT}
            className="h-full w-full object-cover object-top"
            sizes={compact ? '180px' : '(max-width: 768px) 90vw, 320px'}
            priority={priority}
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}
