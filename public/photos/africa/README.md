# Africa portrait library

Dignified portrait photographs for Passage theme preview mockups and design-lab showcases.
All images sourced from [Unsplash](https://unsplash.com) under the [Unsplash License](https://unsplash.com/license).

## Regions represented

| File | Region / context |
|------|------------------|
| `ghana-accra-elder-man.jpg` | ghana, west, accra — LinkedIn Sales Navigator / Unsplash |
| `nigeria-lagos-woman.jpg` | nigeria, west, lagos — Aiony Haust / Unsplash |
| `senegal-dakar-elder.jpg` | senegal, west, dakar — Christopher Campbell / Unsplash |
| `mali-bamako-man.jpg` | mali, west, bamako, sahel — Dotun Sangoleye / Unsplash (elder with head scarf) |
| `ivory-coast-abidjan-woman.jpg` | ivory, cote, abidjan, west — Christina @ wocintechchat.com / Unsplash |
| `cameroon-yaounde-elder.jpg` | cameroon, central, yaounde — Aiony Haust / Unsplash |
| `drc-kinshasa-woman.jpg` | congo, kinshasa, drc, central — Alexandra Gorn / Unsplash |
| `kenya-nairobi-elder-woman.jpg` | kenya, nairobi, east — Christina @ wocintechchat.com / Unsplash |
| `ethiopia-addis-elder-man.jpg` | ethiopia, addis, horn, east — Christina @ wocintechchat.com / Unsplash |
| `tanzania-dar-woman.jpg` | tanzania, dar, east — Charles / Unsplash |
| `somalia-mogadishu-man.jpg` | somalia, mogadishu, horn — Suraj B / Unsplash |
| `egypt-cairo-elder.jpg` | egypt, cairo, north — Alexandra Gorn / Unsplash |
| `morocco-fez-woman.jpg` | morocco, fez, north, maghreb — Aiony Haust / Unsplash |
| `south-africa-cape-elder.jpg` | south-africa, cape, ubuntu, southern — LinkedIn Sales Navigator / Unsplash |
| `zimbabwe-harare-elder.jpg` | zimbabwe, harare, southern — Jasper Garr / Unsplash |
| `botswana-gaborone-woman.jpg` | botswana, southern, sand — Brooke Cagle / Unsplash |
| `madagascar-antananarivo-elder.jpg` | madagascar, island, rain — Aiony Haust / Unsplash |
| `mauritius-port-louis-woman.jpg` | mauritius, island, azure, seychelles — Christina @ wocintechchat.com / Unsplash |
| `rwanda-kigali-man.jpg` | rwanda, kigali, east — Christina @ wocintechchat.com / Unsplash |
| `uganda-kampala-elder.jpg` | uganda, kampala, east — Brooke Cagle / Unsplash |
| `namibia-windhoek-woman.jpg` | namibia, windhoek, southern — Brooke Cagle / Unsplash |
| `angola-luanda-man.jpg` | angola, amber, southern — Suraj B / Unsplash |
| `liberia-monrovia-elder.jpg` | liberia, monrovia, west — Aiony Haust / Unsplash |
| `sierra-leone-freetown-woman.jpg` | sierra-leone, freetown, west — Aiony Haust / Unsplash |
| `pan-african-elder-man.jpg` | pan-african, continental, ancestral, baobab, savanna — LinkedIn Sales Navigator / Unsplash |

## Usage

- `src/lib/theme-preview-image.ts` maps each `visual_theme` id to a portrait.
- `scripts/generate-theme-complete-previews.mjs` composites these into `/public/theme-previews/{id}.jpg`.

Regenerate portraits: `node scripts/download-africa-photos.mjs`
