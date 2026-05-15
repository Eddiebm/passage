import type { ProgrammeReading, Tradition } from '@/lib/types'

/** Library entry without memorial-specific id — ids assigned on insert. */
export type ProgrammeReadingTemplate = Omit<ProgrammeReading, 'id'>

const KJV_PSALM_23 = `The Lord is my shepherd; I shall not want.
He maketh me to lie down in green pastures: he leadeth me beside the still waters.
He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake.
Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.
Thou preparest a table before me in the presence of mine enemies: thou anointest my head with oil; my cup runneth over.
Surely goodness and mercy shall follow me all the days of my life: and I will dwell in the house of the Lord for ever.`

const KJV_JOHN_14_1_3 = `Let not your heart be troubled: ye believe in God, believe also in me.
In my Father's house are many mansions: if it were not so, I would have told you. I go to prepare a place for you.
And if I go and prepare a place for you, I will come again, and receive you unto myself; that where I am, there ye may be also.`

const KJV_REV_21_4 = `And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.`

const KJV_1_THESS_4_13_14 = `But I would not have you to be ignorant, brethren, concerning them which are asleep, that ye sorrow not, even as others which have no hope.
For if we believe that Jesus died and rose again, even so them also which sleep in Jesus will God bring with him.`

const KJV_ROM_8_38_39 = `For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come,
Nor height, nor depth, nor any other creature, shall be able to separate us from the love of God, which is in Christ Jesus our Lord.`

const KJV_2_COR_5_1 = `For we know that if our earthly house of this tabernacle were dissolved, we have a building of God, an house not made with hands, eternal in the heavens.`

const KJV_ISA_41_10 = `Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.`

const KJV_ECC_3_1_4 = `To every thing there is a season, and a time to every purpose under the heaven:
A time to be born, and a time to die; a time to plant, and a time to pluck up that which is planted;
A time to kill, and a time to heal; a time to break down, and a time to build up;
A time to weep, and a time to laugh; a time to mourn, and a time to dance.`

const HYMN_ABIDE_WITH_ME = `Abide with me; fast falls the eventide;
The darkness deepens; Lord, with me abide.
When other helpers fail and comforts flee,
Help of the helpless, O abide with me.

Swift to its close ebbs out life's little day;
Earth's joys grow dim, its glories pass away;
Change and decay in all around I see;
O Thou who changest not, abide with me.

Hold Thou Thy cross before my closing eyes;
Shine through the gloom and point me to the skies.
Heaven's morning breaks, and earth's vain shadows flee;
In life, in death, O Lord, abide with me.`

const HYMN_AMAZING_GRACE = `Amazing grace! how sweet the sound,
That saved a wretch like me!
I once was lost, but now am found,
Was blind, but now I see.

Through many dangers, toils, and snares,
I have already come;
'Tis grace hath brought me safe thus far,
And grace will lead me home.

When we've been there ten thousand years,
Bright shining as the sun,
We've no less days to sing God's praise
Than when we'd first begun.`

const HYMN_ROCK_OF_AGES = `Rock of Ages, cleft for me,
Let me hide myself in Thee;
Let the water and the blood,
From Thy riven side which flowed,
Be of sin the double cure,
Save from wrath and make me pure.

Nothing in my hand I bring,
Simply to Thy cross I cling;
Naked, come to Thee for dress,
Helpless, look to Thee for grace;
Foul, I to the fountain fly;
Wash me, Saviour, or I die.`

const HYMN_WHAT_A_FRIEND = `What a Friend we have in Jesus,
All our sins and griefs to bear!
What a privilege to carry
Everything to God in prayer!
O what peace we often forfeit,
O what needless pain we bear,
All because we do not carry
Everything to God in prayer!

Are we weak and heavy laden,
Cumbered with a load of care?
Precious Saviour, still our refuge—
Take it to the Lord in prayer.`

const HYMN_NEARER_MY_GOD = `Nearer, my God, to Thee, nearer to Thee!
E'en though it be a cross that raiseth me,
Still all my song shall be, nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!

Though like the wanderer, the sun gone down,
Darkness be over me, my rest a stone,
Yet in my dreams I'd be nearer, my God, to Thee,
Nearer, my God, to Thee, nearer to Thee!`

const HYMN_BLESSED_ASSURANCE = `Blessed assurance, Jesus is mine!
O what a foretaste of glory divine!
Heir of salvation, purchase of God,
Born of His Spirit, washed in His blood.

This is my story, this is my song,
Praising my Saviour all the day long;
This is my story, this is my song,
Praising my Saviour all the day long.`

const HYMN_OLD_RUGGED_CROSS = `On a hill far away stood an old rugged cross,
The emblem of suffering and shame;
And I love that old cross where the dearest and best
For a world of lost sinners was slain.

So I'll cherish the old rugged cross,
Till my trophies at last I lay down;
I will cling to the old rugged cross,
And exchange it some day for a crown.`

const HYMN_GUIDE_ME = `Guide me, O Thou great Jehovah,
Pilgrim through this barren land;
I am weak, but Thou art mighty;
Hold me with Thy powerful hand.
Bread of heaven, bread of heaven,
Feed me till I want no more.

Open now the crystal fountain,
Whence the healing stream doth flow;
Let the fire and cloudy pillar
Lead me all my journey through.`

const HYMN_JESUS_LOVER = `Jesus, lover of my soul,
Let me to Thy bosom fly,
While the nearer waters roll,
While the tempest still is high.
Hide me, O my Saviour, hide,
Till the storm of life is past;
Safe into the haven guide;
O receive my soul at last.`

const HYMN_IT_IS_WELL = `When peace like a river attendeth my way,
When sorrows like sea billows roll;
Whatever my lot, Thou hast taught me to say,
It is well, it is well with my soul.

It is well with my soul,
It is well, it is well with my soul.`

const GHANA_CHRISTIAN_LIBRARY: ProgrammeReadingTemplate[] = [
  {
    type: 'scripture',
    title: 'Scripture reading',
    scripture_reference: 'Psalm 23',
    scripture_text: KJV_PSALM_23,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'scripture',
    title: 'Comfort scripture',
    scripture_reference: 'John 14:1–3',
    scripture_text: KJV_JOHN_14_1_3,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'scripture',
    title: 'Scripture reading',
    scripture_reference: 'Revelation 21:4',
    scripture_text: KJV_REV_21_4,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'scripture',
    title: 'Hope in Christ',
    scripture_reference: '1 Thessalonians 4:13–14',
    scripture_text: KJV_1_THESS_4_13_14,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'scripture',
    title: 'Scripture reading',
    scripture_reference: 'Romans 8:38–39',
    scripture_text: KJV_ROM_8_38_39,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'scripture',
    title: 'Eternal dwelling',
    scripture_reference: '2 Corinthians 5:1',
    scripture_text: KJV_2_COR_5_1,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'scripture',
    title: 'Word of strength',
    scripture_reference: 'Isaiah 41:10',
    scripture_text: KJV_ISA_41_10,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'scripture',
    title: 'A time for every purpose',
    scripture_reference: 'Ecclesiastes 3:1–4',
    scripture_text: KJV_ECC_3_1_4,
    bible_translation: 'KJV',
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Opening hymn',
    hymn_book: 'EP Hymnal',
    hymn_number: '402',
    hymn_title: 'Abide with Me',
    hymn_lyrics: HYMN_ABIDE_WITH_ME,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Congregational hymn',
    hymn_book: 'Methodist Hymnal',
    hymn_number: '299',
    hymn_title: 'Amazing Grace',
    hymn_lyrics: HYMN_AMAZING_GRACE,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Hymn',
    hymn_book: 'EP Hymnal',
    hymn_number: '318',
    hymn_title: 'Rock of Ages',
    hymn_lyrics: HYMN_ROCK_OF_AGES,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Hymn',
    hymn_book: 'Methodist Hymnal',
    hymn_number: '521',
    hymn_title: 'What a Friend We Have in Jesus',
    hymn_lyrics: HYMN_WHAT_A_FRIEND,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Hymn',
    hymn_book: 'EP Hymnal',
    hymn_number: '445',
    hymn_title: 'Nearer, My God, to Thee',
    hymn_lyrics: HYMN_NEARER_MY_GOD,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Hymn',
    hymn_book: 'Methodist Hymnal',
    hymn_number: '196',
    hymn_title: 'Blessed Assurance',
    hymn_lyrics: HYMN_BLESSED_ASSURANCE,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Hymn',
    hymn_book: 'EP Hymnal',
    hymn_number: '287',
    hymn_title: 'The Old Rugged Cross',
    hymn_lyrics: HYMN_OLD_RUGGED_CROSS,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Hymn',
    hymn_book: 'Methodist Hymnal',
    hymn_number: '98',
    hymn_title: 'Guide Me, O Thou Great Jehovah',
    hymn_lyrics: HYMN_GUIDE_ME,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Hymn',
    hymn_book: 'EP Hymnal',
    hymn_number: '512',
    hymn_title: 'Jesus, Lover of My Soul',
    hymn_lyrics: HYMN_JESUS_LOVER,
    visibility: 'public',
  },
  {
    type: 'hymn',
    title: 'Closing hymn',
    hymn_book: 'Methodist Hymnal',
    hymn_number: '377',
    hymn_title: 'It Is Well with My Soul',
    hymn_lyrics: HYMN_IT_IS_WELL,
    visibility: 'public',
  },
]

const AL_FATIHA_ARABIC = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَٰنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ`

const AL_FATIHA_TRANSLATION = `In the name of Allah, the Entirely Merciful, the Especially Merciful.
All praise is due to Allah, Lord of the worlds.
The Entirely Merciful, the Especially Merciful.
Sovereign of the Day of Recompense.
It is You we worship and You we ask for help.
Guide us to the straight path —
the path of those upon whom You have bestowed favour, not of those who have earned anger nor of those who are astray.`

const YASIN_EXCERPT_ARABIC = `يس ۞ وَالْقُرْآنِ الْحَكِيمِ
إِنَّكَ لَمِنَ الْمُرْسَلِينَ عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ
تَنزِيلَ الْعَزِيزِ الرَّحِيمِ
لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ`

const YASIN_EXCERPT_TRANSLATION = `Ya Sin. By the wise Qur'an.
Indeed you are among the messengers, upon a straight path.
A revelation of the Exalted in Might, the Merciful,
that you may warn a people whose forefathers were not warned, so they are unaware.`

const GHANA_MUSLIM_LIBRARY: ProgrammeReadingTemplate[] = [
  {
    type: 'quran',
    title: 'Surah Al-Fatiha',
    quran_reference: 'Al-Fatiha (1:1–7)',
    quran_arabic: AL_FATIHA_ARABIC,
    quran_translation: AL_FATIHA_TRANSLATION,
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Surah Yasin (opening)',
    quran_reference: 'Surah Yasin (36:1–4)',
    quran_arabic: YASIN_EXCERPT_ARABIC,
    quran_translation: YASIN_EXCERPT_TRANSLATION,
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Prayer for the deceased',
    quran_reference: 'Supplication',
    quran_arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ',
    quran_translation:
      'O Allah, forgive him/her and have mercy upon him/her, and grant him/her peace and pardon. O Allah, make his/her grave spacious and fill it with light.',
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Prayer for patience',
    quran_reference: 'Supplication',
    quran_arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    quran_translation:
      'Indeed, to Allah we belong and to Him we shall return. O Allah, reward me for my affliction and replace it with something better.',
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Prayer at the grave',
    quran_reference: 'Janazah supplication',
    quran_arabic: 'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا',
    quran_translation:
      'O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females. O Allah, whoever You keep alive among us, keep them upon Islam, and whoever You take in death, take them in faith.',
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Seeking forgiveness',
    quran_reference: 'Duʿā',
    quran_arabic: 'رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ',
    quran_translation:
      'Our Lord, forgive us and our brothers who preceded us in faith, and do not place in our hearts any resentment toward those who have believed.',
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Mercy and light',
    quran_reference: 'Duʿā for the departed',
    quran_arabic: 'اللَّهُمَّ نَوِّرْ قَبْرَهُ وَاجْعَلْهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ',
    quran_translation:
      'O Allah, illuminate his/her grave and make it a garden from the gardens of Paradise. O Allah, shelter him/her under Your mercy on the Day of Judgement.',
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Trust in Allah',
    quran_reference: "Qur'an 2:156",
    quran_arabic: 'الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    quran_translation:
      'Who, when disaster strikes them, say, "Indeed we belong to Allah, and indeed to Him we will return." Those are the ones upon whom are blessings from their Lord and mercy.',
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Prayer for the family',
    quran_reference: 'Supplication',
    quran_arabic: 'اللَّهُمَّ أَعِنَّا عَلَى صَبْرِهِ وَثَبِّتْ قُلُوبَنَا',
    quran_translation:
      'O Allah, help us in our patience over this loss and steady our hearts. Grant the family comfort and righteous consolation.',
    visibility: 'public',
  },
  {
    type: 'quran',
    title: 'Closing prayer',
    quran_reference: 'Duʿā',
    quran_arabic: 'اللَّهُمَّ اجْعَلْ مُصَابَنَا خَالِصًا وَاجْعَلْهُ كَفَّارَةً',
    quran_translation:
      'O Allah, make our affliction pure for us, make it an expiation, and reunite us with our loved one in Your noble presence.',
    visibility: 'public',
  },
]

const LIBRARY_BY_TRADITION: Partial<Record<Tradition, ProgrammeReadingTemplate[]>> = {
  'ghana-christian': GHANA_CHRISTIAN_LIBRARY,
  'nigeria-christian': GHANA_CHRISTIAN_LIBRARY,
  'ghana-muslim': GHANA_MUSLIM_LIBRARY,
  'nigeria-muslim': GHANA_MUSLIM_LIBRARY,
  diaspora: GHANA_CHRISTIAN_LIBRARY,
}

export const PROGRAMME_HYMN_BOOKS = ['EP Hymnal', 'Methodist Hymnal'] as const

function normalizeRef(ref: string): string {
  return ref.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeHymnKey(book: string, number: string): string {
  return `${book.trim().toLowerCase()}|${number.trim()}`
}

/** Suggested funeral readings for a tradition (templates without ids). */
export function getSuggestedReadings(tradition: Tradition): ProgrammeReadingTemplate[] {
  const set = LIBRARY_BY_TRADITION[tradition] ?? GHANA_CHRISTIAN_LIBRARY
  return set.map((entry, index) => ({
    ...entry,
    sort_order: entry.sort_order ?? index,
  }))
}

/** Look up a hymn in the embedded library by book label and number. */
export function findHymn(book: string, number: string): ProgrammeReadingTemplate | undefined {
  const key = normalizeHymnKey(book, number)
  for (const lib of [GHANA_CHRISTIAN_LIBRARY]) {
    const match = lib.find(
      (e) =>
        e.type === 'hymn' &&
        e.hymn_book &&
        e.hymn_number &&
        normalizeHymnKey(e.hymn_book, e.hymn_number) === key,
    )
    if (match) return match
  }
  return undefined
}

/** Look up scripture by reference string (case-insensitive partial match). */
export function findScripture(reference: string): ProgrammeReadingTemplate | undefined {
  const needle = normalizeRef(reference)
  for (const lib of [GHANA_CHRISTIAN_LIBRARY]) {
    const match = lib.find(
      (e) =>
        e.type === 'scripture' &&
        e.scripture_reference &&
        normalizeRef(e.scripture_reference).includes(needle),
    )
    if (match) return match
  }
  return undefined
}

/** Count library entries by type (for diagnostics / docs). */
export function programmeLibraryStats(tradition: Tradition = 'ghana-christian'): {
  total: number
  scripture: number
  hymn: number
  quran: number
} {
  const items = getSuggestedReadings(tradition)
  return {
    total: items.length,
    scripture: items.filter((i) => i.type === 'scripture').length,
    hymn: items.filter((i) => i.type === 'hymn').length,
    quran: items.filter((i) => i.type === 'quran').length,
  }
}
