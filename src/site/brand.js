// Single source of truth for Folk Print brand facts + contacts.
// REAL values, carried over from the official site (:8100 / folkprint.uz).
// The brand has NO public email — it works via phone / Telegram / Instagram.
export const brand = {
  name: 'Folk Print',
  tagline: 'От идеи до реализации',
  positioning: 'Помогаем компаниям становиться узнаваемыми',
  city: 'Ташкент',
  since: '2014',
  phone: '+998 95 787 77 55',
  phone2: '+998 33 338 86 08',
  telegram: 'folkprint_b2b',          // t.me/folkprint_b2b
  instagram: 'folkprint.b2b',         // instagram.com/folkprint.b2b
  email: '',                          // brand has no public email — prefer Telegram
  address: 'г. Ташкент, Учтепинский район, массив Чиланзар, 11-й квартал, 51/1',
  hours: 'Ежедневно · 09:00–20:00',   // confirmed via Google Business Profile
  mapSrc: 'https://yandex.uz/map-widget/v1/-/CPxVY2ot',
  mapLink: 'https://yandex.uz/maps/-/CPxVY2ot',
  url: 'https://folkprint.uz', // canonical host is non-www (must match src/config/seo.js SITE_URL)
  copyright: '© 2026 Folk Print',
}

export const tgHref = (h = brand.telegram) => `https://t.me/${h}`
export const igHref = (h = brand.instagram) => `https://instagram.com/${h}`
export const telHref = (p = brand.phone) => `tel:${p.replace(/[^+\d]/g, '')}`
export const mailHref = (e = brand.email) => `mailto:${e}`
