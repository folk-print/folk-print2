// Single source of truth for on-page SEO. Consumed by the build-time shell
// generator (scripts/seo-shells.mjs → per-route static HTML + sitemap) and by the
// app for client-side <title> sync on SPA navigation.
//
// Canonical host: the new site replaces folkprint.uz. One host, non-www, https.
export const SITE_URL = 'https://folkprint.uz'

// NAP + geo for LocalBusiness / geo meta. Coordinates match the taplink map pin.
export const BUSINESS = {
  name: 'Folk Print',
  legalName: 'Folk Print',
  foundingDate: '2014',
  city: 'Ташкент',
  cityUz: 'Toshkent',
  country: 'UZ',
  region: 'UZ-TK',
  areaServed: 'Узбекистан',
  // NAP — same values as src/site/brand.js (carried over from the live site).
  phone: '+998957877755',   // B2B
  phone2: '+998333388608',  // B2C
  streetAddress: 'Учтепинский район, массив Чиланзар, 11-й квартал, 51/1',
  // Ежедневно 09:00–20:00 (per Google Business Profile) in schema.org form.
  openingHours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '20:00' },
  lat: 41.276582,
  lng: 69.189784,
  telegram: 'https://t.me/Folkprintme',
  telegramBiz: 'https://t.me/folkprint_b2b',
  instagram: 'https://www.instagram.com/folkprint.b2b/',
  instagram2: 'https://www.instagram.com/folkprint.uz/',
  ogImage: '/brand/logo-amber.png', // TODO: replace with a 1200×630 branded card
}

// Print methods → Service schema.
export const SERVICES = ['DTF-печать', 'Вышивка', 'Шёлкография', 'Термотрансфер', 'Шеврон']

// Per-route SEO. `path` is the RU path; the UZ variant is served under /uz + path.
// Titles ≤ ~60 chars, descriptions ≤ ~155, one primary + secondary keywords, one H1.
export const PAGES = [
  {
    key: 'home',
    path: '/',
    ru: {
      title: 'Корпоративная одежда с логотипом · Ташкент | Folk Print',
      description: 'Корпоративная одежда, униформа и мерч с вашим логотипом в Ташкенте. DTF, вышивка, шёлкография. Оптом для бизнеса с 2014 года. Доставка по всему Узбекистану. Рассчитать заказ →',
      h1: 'Корпоративная одежда и мерч с логотипом в Ташкенте',
      primary: 'корпоративная одежда с логотипом Ташкент',
      keywords: ['корпоративная одежда с логотипом Ташкент', 'корпоративная одежда с логотипом Узбекистан', 'униформа с логотипом Ташкент', 'брендирование одежды Ташкент', 'нанесение логотипа на одежду Ташкент', 'печать на одежде Узбекистан', 'корпоративный мерч на заказ Ташкент', 'спецодежда с логотипом Ташкент', 'корпоративные подарки Ташкент', 'одежда с логотипом для бизнеса'],
    },
    uz: {
      title: 'Logotipli korporativ kiyim · Toshkent | Folk Print',
      description: 'Logotip bilan korporativ kiyim, forma va merch — Toshkentda. DTF, kashta, shyolkografiya. Biznes uchun 2014-yildan. Buyurtma bering →',
      h1: 'Toshkentda logotipli korporativ kiyim va merch',
      primary: 'logotipli korporativ kiyim Toshkent',
      keywords: ['logotipli korporativ kiyim Toshkent', 'logotip bilan forma', 'korporativ merch buyurtma Toshkent', 'kiyimga logotip tushirish', 'firma kiyimi Toshkent'],
    },
  },
  {
    key: 'lichnoe',
    path: '/lichnoe',
    ru: {
      title: 'Печать на футболках на заказ · Ташкент | Folk Print',
      description: 'Футболки, худи и кепки со своим принтом или фото на заказ в Ташкенте. Именные подарки, мерч для команды и праздника. DTF-печать. Заказать →',
      h1: 'Футболки, худи и мерч со своим принтом на заказ',
      primary: 'печать на футболках на заказ Ташкент',
      keywords: ['печать на футболках на заказ Ташкент', 'футболка с фото на заказ', 'худи с принтом на заказ Ташкент', 'футболка с принтом на день рождения', 'заказать футболку со своим принтом Ташкент', 'командные футболки с принтом Ташкент', 'кепка с принтом на заказ Ташкент', 'именная футболка в подарок'],
    },
    uz: {
      title: 'Futbolkaga bosma buyurtma · Toshkent | Folk Print',
      description: "O'z rasmingiz yoki logotipingiz bilan futbolka, xudi va kepka — Toshkentda. Sovg'a va jamoa uchun. DTF bosma. Buyurtma bering →",
      h1: "O'z dizayningiz bilan futbolka, xudi va merch",
      primary: 'futbolkaga bosma buyurtma Toshkent',
      keywords: ['futbolkaga bosma Toshkent', 'futbolkaga rasm tushirish', "o'z dizayningiz bilan futbolka", 'xudi bosma buyurtma', "sovg'a futbolka", 'kepkaga bosma Toshkent'],
    },
  },
  {
    key: 'studio',
    path: '/studio',
    // The 3D studio is hosted on the VPS at this host (folkprint.uz/studio 308-
    // redirects here). So the studio shell self-canonicals to cassist and is left
    // OUT of the folkprint.uz sitemap — no redirect/canonical/sitemap conflict.
    canonHost: 'https://folkprint-studio.cassist.uz',
    ru: {
      title: '3D-конструктор футболок онлайн · макет | Folk Print',
      description: 'Создайте макет футболки, худи или кепки онлайн в 3D-конструкторе Folk Print. Загрузите принт, посмотрите результат и закажите печать в Ташкенте.',
      h1: '3D-конструктор: создайте макет своей одежды онлайн',
      primary: 'создать макет футболки онлайн',
      keywords: ['создать макет футболки онлайн', '3D конструктор футболок онлайн', 'конструктор одежды с принтом онлайн', 'заказать футболку со своим дизайном', 'дизайн футболки онлайн Ташкент', 'печать на футболках онлайн заказ Ташкент'],
    },
    uz: {
      title: 'Onlayn 3D-konstruktor · futbolka maketi | Folk Print',
      description: "Futbolka, xudi yoki kepka maketini onlayn 3D-konstruktorda yarating. Rasm yuklang, natijani ko'ring va Toshkentda bosma buyurtma qiling.",
      h1: '3D-konstruktor: kiyim maketini onlayn yarating',
      primary: 'onlayn futbolka maketi yaratish',
      keywords: ['onlayn futbolka maketi', '3D futbolka konstruktori', "o'z dizayni bilan futbolka buyurtma", 'onlayn kiyim dizayni Toshkent'],
    },
  },
]

// Resolve the SEO block for a given pathname (used by the client title sync).
export function seoForPath(pathname) {
  const uz = pathname === '/uz' || pathname.startsWith('/uz/')
  const ruPath = uz ? (pathname.replace(/^\/uz/, '') || '/') : pathname
  const page = PAGES.find((p) => p.path === ruPath) || PAGES[0]
  return { lang: uz ? 'uz' : 'ru', ...(uz ? page.uz : page.ru) }
}
