# Seed memorial photos

JPEG assets for the built-in demo memorials (`samuel-mensah-2026`, `ghana-muslim-example-2026`).

Regenerate silhouettes: `node scripts/generate-seed-images.mjs` (requires `sharp`).

## Memorial mapping

| Slug | Persona | Files |
|------|---------|-------|
| `samuel-mensah-2026` | Male — **Samuel** (Christian, full mode) | `mensah-primary.jpg`, `mensah-1.jpg` … `mensah-4.jpg` |
| `ghana-muslim-example-2026` | Female — **Fatima** (Muslim, programme mode) | `muslim-primary.jpg`, `muslim-1.jpg` … `muslim-3.jpg` |

Display names are generic first names only — see `src/lib/example-memorial-names.ts`.

## Files

| File | Role |
|------|------|
| `mensah-primary.jpg` | Primary portrait — male Christian example |
| `mensah-1.jpg` … `mensah-4.jpg` | Gallery — male Christian example |
| `muslim-primary.jpg` | Primary portrait — female Muslim example |
| `muslim-1.jpg` … `muslim-3.jpg` | Gallery — female Muslim example |
