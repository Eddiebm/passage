# Example memorial sample photos

JPEG assets for the built-in demo memorials (`bannerman-samuel-2026`, `ghana-muslim-example-2026`).

| File | Memorial |
|------|----------|
| `bannerman-primary.jpg` | Primary portrait — Bannerman example |
| `bannerman-1.jpg` … `bannerman-4.jpg` | Gallery — Bannerman example |
| `muslim-primary.jpg` | Primary portrait — Ghana Muslim programme example |
| `muslim-1.jpg` … `muslim-3.jpg` | Gallery — Ghana Muslim example |

These are **dignified generated placeholders** (warm tones, soft silhouettes) so demos work offline and on Vercel without Unsplash or Blob. To replace with licensed photography, drop new files at the same paths and update `src/lib/seed-memorial.ts` if filenames change.

Regenerate placeholders:

```bash
node scripts/generate-seed-images.mjs
```
