# Example memorial sample photos

JPEG assets for the built-in demo memorials (`bannerman-samuel-2026`, `ghana-muslim-example-2026`).

## Gender representation

Passage ships **two** example memorials so demos show both men and women with respectful names and imagery:

| Memorial slug | Presentation | Seed files |
|---------------|--------------|------------|
| `bannerman-samuel-2026` | Male — Samuel Kwesi Bannerman (Christian, full mode) | `bannerman-primary.jpg`, `bannerman-1.jpg` … `bannerman-4.jpg` |
| `ghana-muslim-example-2026` | Female — Hajia Aminata Mensah (Ghana Muslim programme) | `muslim-primary.jpg`, `muslim-1.jpg` … `muslim-3.jpg` |

Placeholders use distinct silhouettes (broader shoulders / uncovered head for the gentleman; softer shoulders and optional hijab drape for the matriarch). Replace with licensed photography at the same paths when ready.

| File | Memorial |
|------|----------|
| `bannerman-primary.jpg` | Primary portrait — male Bannerman example |
| `bannerman-1.jpg` … `bannerman-4.jpg` | Gallery — male Bannerman example |
| `muslim-primary.jpg` | Primary portrait — female Ghana Muslim example |
| `muslim-1.jpg` … `muslim-3.jpg` | Gallery — female Ghana Muslim example |

These are **dignified generated placeholders** (warm tones, soft silhouettes) so demos work offline and on Vercel without Unsplash or Blob. To replace with licensed photography, drop new files at the same paths and update `src/lib/seed-memorial.ts` if filenames change.

**Portrait policy:** customer-facing preview imagery must use African portraits only — see `src/lib/portrait-policy.ts` and `public/photos/africa/README.md`. Seed silhouettes are intentional African-presenting demo placeholders; theme mockups use `public/photos/africa/`.

Regenerate placeholders:

```bash
node scripts/generate-seed-images.mjs
```
