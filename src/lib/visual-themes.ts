/** Visual memorial themes — 73 coordinator-selectable appearances. */

export type VisualThemeGroup = 'light' | 'dark' | 'cultural' | 'regional'

export type VisualThemeMeta = {
  id: string
  label: string
  description: string
  group: VisualThemeGroup
  fontPair?: string
}

export const VISUAL_THEME_REGISTRY: VisualThemeMeta[] = [
  {
    id: 'programme',
    label: 'Printed programme',
    description: 'Paper tone, burgundy rules, narrow column — calm and booklet-like.',
    group: 'light',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'monument',
    label: 'Quiet monument',
    description: 'Charcoal and whitespace, large name — restrained and still.',
    group: 'light',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'kente',
    label: 'Kente restraint',
    description: 'Cream ground, subtle border bands, one gold accent line.',
    group: 'cultural',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'night',
    label: 'Night vigil',
    description: 'Dark ground, warm text, amber links — for evening viewing.',
    group: 'dark',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'ivory-letter',
    label: 'Ivory letter',
    description: 'Warm ivory stock with soft brown ink — like a posted family letter.',
    group: 'light',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'forest-rest',
    label: 'Forest rest',
    description: 'Deep green accents on mist white — grounded and natural.',
    group: 'light',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'burgundy-mass',
    label: 'Burgundy mass',
    description: 'Rich wine ground with cream type — solemn cathedral tone.',
    group: 'dark',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'coastal-breeze',
    label: 'Coastal breeze',
    description: 'Sea-glass blues on sand white — calm, open, and airy.',
    group: 'light',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'adinkra-minimal',
    label: 'Adinkra minimal',
    description: 'Off-white with ink-black type and a single gold rule — symbols implied, not loud.',
    group: 'cultural',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'scripture-scroll',
    label: 'Scripture scroll',
    description: 'Parchment wash and sepia headings — readings-forward layout.',
    group: 'light',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'candlelight',
    label: 'Candlelight',
    description: 'Warm dim brown-black with honey highlights — like a vigil room.',
    group: 'dark',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'high-contrast',
    label: 'High contrast',
    description: 'Pure white, near-black text, sharp rules — maximum legibility.',
    group: 'light',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'newspaper',
    label: 'Newspaper',
    description: 'Newsprint grey, tight columns, serif headlines — obituary column feel.',
    group: 'light',
    fontPair: 'Source Serif 4 + DM Sans',
  },
  {
    id: 'rose-remembered',
    label: 'Rose remembered',
    description: 'Blush ground with dusty rose accents — gentle remembrance.',
    group: 'light',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'earth-clay',
    label: 'Earth clay',
    description: 'Terracotta and ochre on clay white — West African earth tones.',
    group: 'cultural',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'midnight-blue',
    label: 'Midnight blue',
    description: 'Navy night sky with cool silver text — dignified and modern.',
    group: 'dark',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'linen-simple',
    label: 'Linen simple',
    description: 'Unbleached linen and soft grey type — nothing extra.',
    group: 'light',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'gold-letter',
    label: 'Gold letter',
    description: 'Cream card with restrained gold rules — formal announcement.',
    group: 'cultural',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'zongo-green',
    label: 'Zongo green',
    description: 'Islamic green accents on bright white — respectful and clear.',
    group: 'cultural',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'episcopal',
    label: 'Episcopal',
    description: 'Purple vestment accent on cool white — Anglican order-of-service.',
    group: 'light',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'methodist-blue',
    label: 'Methodist blue',
    description: 'Methodist blue headers on clean paper — hymn-book familiarity.',
    group: 'light',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'photo-ledger',
    label: 'Photo ledger',
    description: 'Neutral grey frame that lets portraits lead — gallery-first.',
    group: 'light',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'whatsapp-plain',
    label: 'WhatsApp plain',
    description: 'System sans on white — familiar chat-forward sharing.',
    group: 'light',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'closure-grey',
    label: 'Closure grey',
    description: 'Muted greys and softened type — for closed or winding-down pages.',
    group: 'light',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'palm-frond',
    label: 'Palm frond',
    description: 'Fresh palm green on sun-bleached cream — outdoor wake and garden burial.',
    group: 'cultural',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'laterite-red',
    label: 'Laterite red',
    description: 'Iron-rich red earth and burnt sienna — northern savanna ground.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'harmattan-dust',
    label: 'Harmattan dust',
    description: 'Dry-season haze, sand-washed sky, softened contrast — Sahel stillness.',
    group: 'regional',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'volta-blue',
    label: 'Volta blue',
    description: 'Lake Volta teal and riverbank mist — eastern Ghana waterways.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'ashanti-gold',
    label: 'Ashanti gold',
    description: 'Regal gold filigree on deep kola brown — Ashanti court restraint.',
    group: 'cultural',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'mourning-lilac',
    label: 'Mourning lilac',
    description: 'Soft violet-grey wash — contemporary diaspora remembrance.',
    group: 'light',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'chapel-stone',
    label: 'Chapel stone',
    description: 'Limestone grey and cool slate — urban chapel order of service.',
    group: 'light',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'incense-smoke',
    label: 'Incense smoke',
    description: 'Charcoal chapel air, silver type, faint amber — evening mass.',
    group: 'dark',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'parchment-fold',
    label: 'Parchment fold',
    description: 'Folded cream leaflet, walnut ink — hand-distributed notices.',
    group: 'light',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'telegram-notice',
    label: 'Telegram notice',
    description: 'Aged manila and typewriter black — diaspora cable-era announcement.',
    group: 'light',
    fontPair: 'Source Serif 4 + DM Sans',
  },
  {
    id: 'river-mist',
    label: 'River mist',
    description: 'Pale blue-grey fog over water — quiet crossing metaphors.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'sahara-sand',
    label: 'Sahara sand',
    description: 'Warm dunes and amber shadow — trans-Saharan memory.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'ibadan-indigo',
    label: 'Ibadan indigo',
    description: 'Deep Yoruba indigo night with silver headings — southwest Nigeria.',
    group: 'dark',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'lagos-rain',
    label: 'Lagos rain',
    description: 'Wet asphalt grey-green after a Harmattan break — coastal metropolis.',
    group: 'regional',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'tamale-earth',
    label: 'Tamale earth',
    description: 'Sahel ochre and millet gold — northern Ghana high plain.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'accra-noon',
    label: 'Accra noon',
    description: 'Bright Atlantic white with coral accent — capital-city clarity.',
    group: 'regional',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'diaspora-rose',
    label: 'Diaspora rose',
    description: 'Muted mauve and antique gold — London or Brooklyn parlour card.',
    group: 'cultural',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'ancestor-white',
    label: 'Ancestor white',
    description: 'White mourning cloth, black serif, single red thread — Akan simplicity.',
    group: 'cultural',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'drumbeat',
    label: 'Drumbeat',
    description: 'Deep umber ground, kente-gold pulse — funeral durbar at dusk.',
    group: 'dark',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'farewell-green',
    label: 'Farewell green',
    description: 'Sage and olive on linen — gentle send-off, life-celebration tone.',
    group: 'cultural',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'cairo-ivory',
    label: 'Cairo ivory',
    description: 'Limestone cream and Nile blue — North African memorial clarity.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'marrakech-terracotta',
    label: 'Marrakech terracotta',
    description: 'Riad clay rose and mint accent — Maghreb warmth without excess.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'sahara-dusk',
    label: 'Sahara dusk',
    description: 'Copper horizon and violet shadow — desert evening remembrance.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'nile-mist',
    label: 'Nile mist',
    description: 'Papyrus green-grey and river blue — Upper Nile calm.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'ethiopian-orthodox',
    label: 'Ethiopian Orthodox',
    description: 'Ivory liturgy cloth, gold cross accent, deep burgundy rule — Horn church tone.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'kenya-highlands',
    label: 'Kenya highlands',
    description: 'Tea-green hills and cloud white — Rift Valley morning service.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'somali-plains',
    label: 'Somali plains',
    description: 'Pearl sand and soft azure — coastal Horn openness.',
    group: 'regional',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'tanzania-savanna',
    label: 'Tanzania savanna',
    description: 'Acacia gold on sun-bleached grass — East African plain dignity.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'uganda-lake',
    label: 'Uganda lake',
    description: 'Lake Victoria teal and mist white — Great Lakes still water.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'senegal-teranga',
    label: 'Senegal teranga',
    description: 'Teranga gold and ocean white — Wolof welcome, solemn grace.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'mali-mudcloth',
    label: 'Mali mudcloth',
    description: 'Indigo resist on unbleached cotton — Sahel textile restraint.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'ivory-coast-lace',
    label: 'Ivory Coast lace',
    description: 'Ivory lace white and cocoa trim — Abidjan memorial elegance.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'benin-bronze',
    label: 'Benin bronze',
    description: 'Patina bronze and palm ivory — Kingdom craft, quiet honour.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'burkina-laterite',
    label: 'Burkina laterite',
    description: 'Laterite brick and millet straw — Sahelian earth remembrance.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'sierra-leone-harmony',
    label: 'Sierra Leone harmony',
    description: 'Forest green, white, and soft blue — Freetown unity palette.',
    group: 'regional',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'congo-river',
    label: 'Congo river',
    description: 'Deep forest green and river brown — basin rainforest respect.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'cameroon-green',
    label: 'Cameroon green',
    description: 'Flag green and goldenrod on bright white — central republic order.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'angola-amber',
    label: 'Angola amber',
    description: 'Atlantic amber and warm sand — southwestern coast memorial.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'south-africa-ubuntu',
    label: 'South Africa ubuntu',
    description: 'Ubuntu earth tones and protea rust — southern dignity.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'zimbabwe-stone',
    label: 'Zimbabwe stone',
    description: 'Granite grey and soapstone green — Great Zimbabwe stillness.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'zambia-copper',
    label: 'Zambia copper',
    description: 'Copperbelt ochre and sky blue — mining town memorial card.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'botswana-sand',
    label: 'Botswana sand',
    description: 'Kalahari beige and dry grass gold — low-contrast desert peace.',
    group: 'regional',
    fontPair: 'DM Sans + DM Sans',
  },
  {
    id: 'madagascar-rain',
    label: 'Madagascar rain',
    description: 'Rainforest jade and orchid pink accent — island remembrance.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'mauritius-azure',
    label: 'Mauritius azure',
    description: 'Lagoon blue and sugar-cane cream — Indian Ocean memorial light.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'cape-coast-castle',
    label: 'Cape Coast castle',
    description: 'Atlantic stone grey and remembrance white — coastal fort solemnity.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'pan-african-slate',
    label: 'Pan-African slate',
    description: 'Charcoal slate, red-gold, and green thread — dignified continental unity.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'baobab-shade',
    label: 'Baobab shade',
    description: 'Baobab bark brown and canopy green — ancestral tree shelter.',
    group: 'regional',
    fontPair: 'Cormorant + DM Sans',
  },
  {
    id: 'savanna-gold',
    label: 'Savanna gold',
    description: 'Golden grassland and wide sky blue — open savanna farewell.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
  {
    id: 'ancestral-earth',
    label: 'Ancestral earth',
    description: 'Red soil, black type, ochre accent — return to the land.',
    group: 'regional',
    fontPair: 'Libre Baskerville + DM Sans',
  },
]

export const VISUAL_THEME_IDS = VISUAL_THEME_REGISTRY.map((t) => t.id)

export type VisualTheme = (typeof VISUAL_THEME_REGISTRY)[number]['id']

export const VISUAL_THEMES: VisualTheme[] = VISUAL_THEME_IDS as VisualTheme[]

export const VISUAL_THEME_GROUPS: { id: VisualThemeGroup; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'regional', label: 'Across Africa' },
]

export function getVisualThemeMeta(id: string): VisualThemeMeta | undefined {
  return VISUAL_THEME_REGISTRY.find((t) => t.id === id)
}

export function isVisualTheme(v: string): v is VisualTheme {
  return VISUAL_THEMES.includes(v as VisualTheme)
}

export function themeStorageKey(slug: string): string {
  return `passage-theme-${slug}`
}

export const VISUAL_THEME_LABELS: Record<
  VisualTheme,
  { title: string; body: string }
> = Object.fromEntries(
  VISUAL_THEME_REGISTRY.map((t) => [t.id, { title: t.label, body: t.description }]),
) as Record<VisualTheme, { title: string; body: string }>
