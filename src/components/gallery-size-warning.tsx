/** Calm notice when many gallery images may affect mobile guests. */
export function GallerySizeWarning() {
  return (
    <p className="rounded border border-amber-600/30 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950">
      You have many photos on this memorial. Large galleries use more data for guests on mobile networks — families
      often choose their best <strong>20–30</strong> images for the public page.
    </p>
  )
}
