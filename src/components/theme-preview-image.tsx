import Image from 'next/image'
import { getVisualThemeMeta, themePreviewImageUrl, type VisualTheme } from '@/lib/visual-themes'

/** Full phone-frame JPEG preview generated from real portrait photos. */
export function ThemePreviewImage({
  themeId,
  priority = false,
  large = false,
  className = '',
}: {
  themeId: VisualTheme
  priority?: boolean
  large?: boolean
  className?: string
}) {
  const meta = getVisualThemeMeta(themeId)
  const src = themePreviewImageUrl(themeId)
  const alt = meta ? `${meta.label} memorial preview` : `${themeId} memorial preview`
  const frameMax = large ? 'max-w-[min(100%,390px)]' : 'max-w-[200px]'

  return (
    <div className={`mx-auto w-full min-w-[200px] ${frameMax} ${className}`}>
      <div className="rounded-[20px] border border-[#1a1a1a]/12 bg-[#1a1a1a] p-1 shadow-md">
        <div className="aspect-[390/693] overflow-hidden rounded-[15px]">
          <Image
            src={src}
            alt={alt}
            width={390}
            height={693}
            className="h-full w-full object-cover object-top"
            sizes={large ? '(max-width: 768px) 100vw, 390px' : '200px'}
            priority={priority}
            unoptimized
          />
        </div>
      </div>
    </div>
  )
}
