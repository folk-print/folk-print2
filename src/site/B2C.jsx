import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Slot from './Slot.jsx'
import Logo from './Logo.jsx'
import { brand, tgHref, igHref, telHref, mailHref } from './brand.js'
import { clients } from './clients.js'
import { useLang, LangToggle } from './lang.jsx'
import { Reveal, useCountUp, usePrefersReducedMotion } from './motion.jsx'

const STR = {
  ru: {
    screenLabel: 'Folk Print — Главная (B2C)',
    navCatalog: 'Каталог',
    navHowItWorks: 'Как это работает',
    navPrint: 'Печать',
    navCases: 'Кейсы',
    navPrices: 'Цены',
    navContacts: 'Контакты',
    ctaCalcOrderHeader: 'Рассчитать заказ',
    menuButtonAria: 'Меню',
    menuCloseAria: 'Закрыть',
    mobileNavCatalog: 'Каталог',
    mobileNavHowItWorks: 'Как это работает',
    mobileNavPrint: 'Печать',
    mobileNavCases: 'Кейсы',
    mobileNavPrices: 'Цены',
    mobileNavContacts: 'Контакты',
    mobileCtaCalcOrder: 'Рассчитать заказ',
    heroBadgePersonal: 'ДЛЯ СЕБЯ',
    heroBadgeBusiness: 'ДЛЯ БИЗНЕСА',
    heroTitle: 'Принты, которые говорят за тебя',
    heroSubtitle: 'Качественная печать на футболках, худи, шопперах и кепках. Любой дизайн, любая идея — от 1 штуки.',
    heroBtnOrderPrint: 'Заказать принт',
    heroBtnViewCatalog: 'Смотреть каталог',
    heroFeatureFromOne: 'От 1 штуки',
    heroFeatureAnyComplexity: 'Любая сложность',
    heroFeatureOnTime: 'Точно в срок',
    heroSlotPersonInShirt: 'фото · человек в футболке с принтом',
    heroStickerNote: 'Большой принт. Дерзкая энергия.',
    heroVerticalLabel: 'Folk Print · Ташкент',
    occasionsTitle: 'Принты для любого повода',
    occasionsParagraph: 'Нанесём твой дизайн на качественную одежду и аксессуары — для себя, в подарок или для своего дела.',
    occasionsLinkFullCatalog: 'Весь каталог',
    occasionGiftsSlot: 'фото · кружка/футболка в подарок',
    occasionGiftsTitle: 'Подарки',
    occasionGiftsDesc: 'Кружки, футболки, подушки с принтом.',
    occasionHolidaysSlot: 'фото · мерч к празднику',
    occasionHolidaysTitle: 'Праздники',
    occasionHolidaysDesc: 'Дни рождения, девичники, встречи.',
    occasionOwnIdeaSlot: 'фото · свой дизайн на вещи',
    occasionOwnIdeaTitle: 'Своя идея',
    occasionOwnIdeaDesc: 'Твой дизайн на любой вещи.',
    occasionMerchSlot: 'фото · мерч для команды/блогера',
    occasionMerchTitle: 'Мерч',
    occasionMerchDesc: 'Для блогеров, команд и сообществ.',
    howTitle: 'Как это работает',
    howHandwritten: 'Просто. Понятно.',
    howStep1Title: 'Пришлите дизайн',
    howStep1Desc: 'Любой файл, любая идея.',
    howStep2Title: 'Выберите изделие',
    howStep2Desc: 'Футболка, худи, шоппер, кепка.',
    howStep3Title: 'Выберите печать',
    howStep3Desc: 'DTG, DTF, шёлк, вышивка.',
    howStep4Title: 'Получите заказ',
    howStep4Desc: 'Упакуем и доставим вовремя.',
    howBadgeWePrintWell: 'Мы просто хорошо печатаем',
    qualityTitle: 'Качество печати решает',
    qualityParagraph: 'Разные техники под разные задачи — подскажем, что лучше для твоего дизайна.',
    qualityLinkMore: 'Подробнее',
    qualityM1Slot: 'фото · вышивка',
    qualityM1Title: 'Вышивка',
    qualityM1Desc: 'Премиально, с фактурой',
    qualityM2Slot: 'фото · шёлкография',
    qualityM2Title: 'Шёлкография',
    qualityM2Desc: 'Большие тиражи',
    qualityM3Slot: 'фото · DTF',
    qualityM3Title: 'DTF-печать',
    qualityM3Desc: 'Полноцвет, сложный лого',
    qualityM4Slot: 'фото · шеврон',
    qualityM4Title: 'Шеврон',
    qualityM4Desc: 'Объёмные нашивки',
    qualityM5Slot: 'фото · термотрансфер',
    qualityM5Title: 'Термотрансфер',
    qualityM5Desc: 'Имена и номера',
    qualityM6Slot: 'фото · бирки',
    qualityM6Title: 'Бирки',
    qualityM6Desc: 'Брендинг под горло',
    pricesTitle: 'Простые цены',
    pricesParagraph: 'Чем больше тираж — тем ниже цена за штуку. Макет всегда бесплатно.',
    priceTshirtsTitle: 'Футболки',
    priceTshirtsDesc: 'Хлопок, плотные, любой цвет. Шьём и на детей.',
    priceFromLabel1: '',
    priceOnRequest1: 'от 119 000',
    priceTshirtsFeature1: 'Стандарт — 149 000 сум',
    priceTshirtsFeature2: 'Оверсайз — 179 000 сум',
    priceTshirtsFeature3: 'Детская — 119 000 сум',
    priceBtnLearnPrice1: 'Узнать цену',
    priceHitBadge: 'ХИТ',
    priceHoodiesTitle: 'Худи и свитшоты',
    priceHoodiesDesc: 'Тёплые, мягкий начёс.',
    priceFromLabel2: '',
    priceOnRequest2: 'от 249 000',
    priceHoodiesFeature1: 'Худи — 279 000 сум',
    priceHoodiesFeature2: 'Свитшот — 249 000 сум',
    priceHoodiesFeature3: 'Принт спереди и сзади',
    priceBtnLearnPrice2: 'Узнать цену',
    priceTotesTitle: 'Шопперы и кепки',
    priceTotesDesc: 'Эко-шопперы и кепки под ваш принт.',
    priceFromLabel3: '',
    priceOnRequest3: 'от 99 000',
    priceTotesFeature1: 'Шоппер — 99 000 сум',
    priceTotesFeature2: 'Кепка — 99 000 сум',
    priceTotesFeature3: 'Печать с двух сторон',
    priceBtnLearnPrice3: 'Узнать цену',
    priceTagFromOne: 'От 1 штуки',
    priceTagVolumeDiscounts: 'Скидки от тиража',
    priceTagFreeMockup: 'Бесплатный макет',
    priceTagDeliveryTashkent: 'Доставка по Ташкенту',
    casesTitle: 'Наши работы',
    casesParagraph: 'Немного из того, что мы напечатали для людей и небольших команд.',
    caseBirthdaySlot: 'фото · мерч ко дню рождения',
    caseBirthdayCaption: 'Мерч ко дню рождения',
    caseTeamHoodieSlot: 'фото · худи для команды',
    caseTeamHoodieCaption: 'Худи для команды',
    caseMarketTotesSlot: 'фото · шопперы для маркета',
    caseMarketTotesCaption: 'Шопперы для маркета',
    caseEventCapsSlot: 'фото · кепки для события',
    caseEventCapsCaption: 'Кепки для события',
    trustedByLabel: 'Нам доверяют',
    ctaTitle: 'Есть идея? Давай напечатаем.',
    ctaParagraph: 'Ответь на пару вопросов — пришлём лучшие варианты изделий и точную цену.',
    ctaBtnCalcOrder: 'Рассчитать заказ',
    ctaSlotPrint1: 'фото принта',
    ctaSlotPrint2: 'фото принта',
    ctaSlotPrint3: 'фото принта',
    contactsTitle: 'Обсудим твой принт?',
    contactsParagraph: 'Напиши в мессенджер или оставь заявку — ответим, подберём изделие и пришлём цену.',
    contactsPhone2: '+998 33 338 86 08',
    contactsTelegram: 'Telegram',
    contactsWhatsapp: 'WhatsApp',
    contactsInstagram: 'Instagram',
    contactsAddress: 'г. Ташкент, Учтепинский район, массив Чиланзар, 11-й квартал, 51/1 · Пн–Сб 10:00–19:00',
    formTitle: 'Оставить заявку',
    formPlaceholderName: 'Имя',
    formPlaceholderPhone: 'Телефон',
    formPlaceholderMessage: 'Что хотите напечатать?',
    formSubmit: 'Отправить заявку',
    formConsent: 'Нажимая кнопку, вы соглашаетесь на обработку данных.',
    formSuccessTitle: 'Ура! Заявка у нас 🎉',
    formSuccessText: 'Уже несём её менеджеру. В рабочее время отвечаем за ~15 минут — обсудим идею, принт и сроки. А ты пока можешь придумывать дизайн 😉',
    footerTagline: 'Принты, которые говорят за тебя. Печать на одежде в Ташкенте.',
    footerColCatalogTitle: 'Каталог',
    footerCatalogTshirts: 'Футболки',
    footerCatalogHoodies: 'Худи',
    footerCatalogTotes: 'Шопперы',
    footerCatalogCaps: 'Кепки',
    footerCatalogStationery: 'Канцтовары',
    footerColOccasionsTitle: 'Поводы',
    footerOccasionGifts: 'Подарки',
    footerOccasionHolidays: 'Праздники',
    footerOccasionOwnIdea: 'Своя идея',
    footerOccasionMerch: 'Мерч',
    footerColInfoTitle: 'Информация',
    footerInfoHowItWorks: 'Как это работает',
    footerInfoPrint: 'Печать',
    footerInfoPrices: 'Цены',
    footerInfoCases: 'Кейсы',
    footerColContactsTitle: 'Контакты',
    footerContactsTelegram: 'Telegram',
    footerContactsInstagram: 'Instagram',
    footerContactsCity: 'Ташкент, Чиланзар',
    footerCopyright: '© 2026 Folk Print. Принты только. Вайб в комплекте.',
  },
  uz: {
    screenLabel: 'Folk Print — Bosh sahifa (B2C)',
    navCatalog: 'Katalog',
    navHowItWorks: 'Qanday ishlaymiz',
    navPrint: 'Bosma',
    navCases: 'Ishlarimiz',
    navPrices: 'Narxlar',
    navContacts: 'Aloqa',
    ctaCalcOrderHeader: 'Narxni hisoblash',
    menuButtonAria: 'Menyu',
    menuCloseAria: 'Yopish',
    mobileNavCatalog: 'Katalog',
    mobileNavHowItWorks: 'Qanday ishlaymiz',
    mobileNavPrint: 'Bosma',
    mobileNavCases: 'Ishlarimiz',
    mobileNavPrices: 'Narxlar',
    mobileNavContacts: 'Aloqa',
    mobileCtaCalcOrder: 'Narxni hisoblash',
    heroBadgePersonal: 'OʻZIM UCHUN',
    heroBadgeBusiness: 'BIZNES UCHUN',
    heroTitle: 'Sen uchun gapiradigan printlar',
    heroSubtitle: 'Futbolka, xudi, shopper va kepkalarga sifatli bosma. Istalgan dizayn, istalgan gʻoya — 1 donadan.',
    heroBtnOrderPrint: 'Print buyurtma qilish',
    heroBtnViewCatalog: 'Katalogni koʻrish',
    heroFeatureFromOne: '1 donadan',
    heroFeatureAnyComplexity: 'Istalgan murakkablik',
    heroFeatureOnTime: 'Aniq muddatda',
    heroSlotPersonInShirt: 'foto · printli futbolkadagi inson',
    heroStickerNote: 'Katta print. Dadil energiya.',
    heroVerticalLabel: 'Folk Print · Toshkent',
    occasionsTitle: 'Har qanday bahona uchun printlar',
    occasionsParagraph: 'Dizayningni sifatli kiyim va aksessuarlarga tushiramiz — oʻzing uchun, sovgʻaga yoki oʻz ishing uchun.',
    occasionsLinkFullCatalog: 'Toʻliq katalog',
    occasionGiftsSlot: 'foto · sovgʻa krujka/futbolka',
    occasionGiftsTitle: 'Sovgʻalar',
    occasionGiftsDesc: 'Printli krujka, futbolka va yostiqlar.',
    occasionHolidaysSlot: 'foto · bayram uchun merch',
    occasionHolidaysTitle: 'Bayramlar',
    occasionHolidaysDesc: 'Tugʻilgan kunlar, qizlar bazmi, uchrashuvlar.',
    occasionOwnIdeaSlot: 'foto · narsadagi oʻz dizayning',
    occasionOwnIdeaTitle: 'Oʻz gʻoyang',
    occasionOwnIdeaDesc: 'Dizayning istalgan narsada.',
    occasionMerchSlot: 'foto · jamoa/bloger uchun merch',
    occasionMerchTitle: 'Merch',
    occasionMerchDesc: 'Blogerlar, jamoalar va hamjamiyatlar uchun.',
    howTitle: 'Qanday ishlaymiz',
    howHandwritten: 'Oddiy. Tushunarli.',
    howStep1Title: 'Dizaynni yuboring',
    howStep1Desc: 'Istalgan fayl, istalgan gʻoya.',
    howStep2Title: 'Mahsulotni tanlang',
    howStep2Desc: 'Futbolka, xudi, shopper, kepka.',
    howStep3Title: 'Bosma turini tanlang',
    howStep3Desc: 'DTG, DTF, ipak bosma, kashta.',
    howStep4Title: 'Buyurtmani oling',
    howStep4Desc: 'Joylab, oʻz vaqtida yetkazamiz.',
    howBadgeWePrintWell: 'Biz shunchaki yaxshi bosamiz',
    qualityTitle: 'Bosma sifati hal qiladi',
    qualityParagraph: 'Har bir vazifaga — oʻz texnikasi. Dizayningga qaysi biri mosligini aytib beramiz.',
    qualityLinkMore: 'Batafsil',
    qualityM1Slot: 'foto · kashta',
    qualityM1Title: 'Kashta',
    qualityM1Desc: 'Premium, fakturali',
    qualityM2Slot: 'foto · ipak bosma',
    qualityM2Title: 'Ipak bosma',
    qualityM2Desc: 'Katta tirajlar uchun',
    qualityM3Slot: 'foto · DTF',
    qualityM3Title: 'DTF-bosma',
    qualityM3Desc: 'Toʻliq rangli, murakkab logo',
    qualityM4Slot: 'foto · shevron',
    qualityM4Title: 'Shevron',
    qualityM4Desc: 'Hajmli nashivkalar',
    qualityM5Slot: 'foto · termotransfer',
    qualityM5Title: 'Termotransfer',
    qualityM5Desc: 'Ism va raqamlar',
    qualityM6Slot: 'foto · yorliqlar',
    qualityM6Title: 'Yorliqlar',
    qualityM6Desc: 'Yoqa ostiga brending',
    pricesTitle: 'Oddiy narxlar',
    pricesParagraph: 'Tiraj qancha katta — donasi shuncha arzon. Maket har doim bepul.',
    priceTshirtsTitle: 'Futbolkalar',
    priceTshirtsDesc: 'Paxta, zich, istalgan rang. Bolalar uchun ham.',
    priceFromLabel1: '',
    priceOnRequest1: '119 000 dan',
    priceTshirtsFeature1: 'Standart — 149 000 soʻm',
    priceTshirtsFeature2: 'Oversayz — 179 000 soʻm',
    priceTshirtsFeature3: 'Bolalar — 119 000 soʻm',
    priceBtnLearnPrice1: 'Narxni bilish',
    priceHitBadge: 'XIT',
    priceHoodiesTitle: 'Xudi va svitshotlar',
    priceHoodiesDesc: 'Issiq, yumshoq tukli.',
    priceFromLabel2: '',
    priceOnRequest2: '249 000 dan',
    priceHoodiesFeature1: 'Xudi — 279 000 soʻm',
    priceHoodiesFeature2: 'Svitshot — 249 000 soʻm',
    priceHoodiesFeature3: 'Old va orqa tomonga print',
    priceBtnLearnPrice2: 'Narxni bilish',
    priceTotesTitle: 'Shopperlar va kepkalar',
    priceTotesDesc: 'Eko-shopper va kepka — printingiz bilan.',
    priceFromLabel3: '',
    priceOnRequest3: '99 000 dan',
    priceTotesFeature1: 'Shopper — 99 000 soʻm',
    priceTotesFeature2: 'Kepka — 99 000 soʻm',
    priceTotesFeature3: 'Ikki tomonga bosma',
    priceBtnLearnPrice3: 'Narxni bilish',
    priceTagFromOne: '1 donadan',
    priceTagVolumeDiscounts: 'Tirajga koʻra chegirmalar',
    priceTagFreeMockup: 'Bepul maket',
    priceTagDeliveryTashkent: 'Toshkent boʻylab yetkazib berish',
    casesTitle: 'Ishlarimiz',
    casesParagraph: 'Odamlar va kichik jamoalar uchun bosgan ishlarimizdan ayrimlari.',
    caseBirthdaySlot: 'foto · tugʻilgan kun merchi',
    caseBirthdayCaption: 'Tugʻilgan kun merchi',
    caseTeamHoodieSlot: 'foto · jamoa uchun xudi',
    caseTeamHoodieCaption: 'Jamoa uchun xudi',
    caseMarketTotesSlot: 'foto · market uchun shopperlar',
    caseMarketTotesCaption: 'Market uchun shopperlar',
    caseEventCapsSlot: 'foto · tadbir uchun kepkalar',
    caseEventCapsCaption: 'Tadbir uchun kepkalar',
    trustedByLabel: 'Bizga ishonishadi',
    ctaTitle: 'Gʻoyangiz bormi? Keling, bosamiz.',
    ctaParagraph: 'Bir-ikki savolga javob bering — eng yaxshi mahsulot variantlari va aniq narxni yuboramiz.',
    ctaBtnCalcOrder: 'Narxni hisoblash',
    ctaSlotPrint1: 'print fotosi',
    ctaSlotPrint2: 'print fotosi',
    ctaSlotPrint3: 'print fotosi',
    contactsTitle: 'Printingni muhokama qilaylikmi?',
    contactsParagraph: 'Messenjerga yozing yoki ariza qoldiring — javob beramiz, mahsulot tanlab, narxini yuboramiz.',
    contactsPhone2: '+998 33 338 86 08',
    contactsTelegram: 'Telegram',
    contactsWhatsapp: 'WhatsApp',
    contactsInstagram: 'Instagram',
    contactsAddress: 'Toshkent sh., Uchtepa tumani, Chilonzor massivi, 11-kvartal, 51/1 · Dush–Shan 10:00–19:00',
    formTitle: 'Ariza qoldirish',
    formPlaceholderName: 'Ism',
    formPlaceholderPhone: 'Telefon',
    formPlaceholderMessage: 'Nima bosmoqchisiz?',
    formSubmit: 'Arizani yuborish',
    formConsent: 'Tugmani bosish orqali maʼlumotlaringizni qayta ishlashga rozilik bildirasiz.',
    formSuccessTitle: 'Zoʻr! Arizang bizda 🎉',
    formSuccessText: 'Uni menejerga uzatyapmiz. Ish vaqtida ~15 daqiqada javob beramiz — gʻoya, print va muddatlarni gaplashamiz. Shu vaqtda dizayn oʻylab turing 😉',
    footerTagline: 'Sen uchun gapiradigan printlar. Toshkentda kiyimga bosma.',
    footerColCatalogTitle: 'Katalog',
    footerCatalogTshirts: 'Futbolkalar',
    footerCatalogHoodies: 'Xudi',
    footerCatalogTotes: 'Shopperlar',
    footerCatalogCaps: 'Kepkalar',
    footerCatalogStationery: 'Kanstovarlar',
    footerColOccasionsTitle: 'Bahonalar',
    footerOccasionGifts: 'Sovgʻalar',
    footerOccasionHolidays: 'Bayramlar',
    footerOccasionOwnIdea: 'Oʻz gʻoyang',
    footerOccasionMerch: 'Merch',
    footerColInfoTitle: 'Maʼlumot',
    footerInfoHowItWorks: 'Qanday ishlaymiz',
    footerInfoPrint: 'Bosma',
    footerInfoPrices: 'Narxlar',
    footerInfoCases: 'Ishlarimiz',
    footerColContactsTitle: 'Aloqa',
    footerContactsTelegram: 'Telegram',
    footerContactsInstagram: 'Instagram',
    footerContactsCity: 'Toshkent, Chilonzor',
    footerCopyright: '© 2026 Folk Print. Faqat printlar. Vayb esa ustiga qoʻshimcha.',
  },
}

export default function B2C() {
  const { lang } = useLang()
  const t = STR[lang]
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [sent, setSent] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const worksRef = useRef(null)
  const scrollWorks = (dir) => {
    const el = worksRef.current
    if (!el) return
    const card = el.querySelector('figure')
    const step = card ? card.offsetWidth + 16 : 280
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }
  const reduceMotion = usePrefersReducedMotion()

  const closeMenu = () => {
    if (reduceMotion) { setMenuOpen(false); setMenuClosing(false); return }
    setMenuClosing(true)
    setTimeout(() => { setMenuOpen(false); setMenuClosing(false) }, 220)
  }

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        setScrolled(window.scrollY > 10)
        const ctaEl = document.getElementById('cta')
        const ctaReached = ctaEl && ctaEl.getBoundingClientRect().top < window.innerHeight - 80
        setShowCta(window.scrollY > 560 && !ctaReached)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  const uz = lang === 'uz'
  const WORKS = [
    { photo: '/photos/work-birthday-cat.jpg', slot: t.caseBirthdaySlot, caption: t.caseBirthdayCaption },
    { photo: '/photos/case-hoodies.jpg', slot: t.caseTeamHoodieSlot, caption: t.caseTeamHoodieCaption },
    { photo: '/photos/case-totes.jpg', slot: t.caseMarketTotesSlot, caption: t.caseMarketTotesCaption },
    { photo: '/photos/work-caps.jpg', slot: t.caseEventCapsSlot, caption: t.caseEventCapsCaption },
    { photo: '/photos/work-tee.jpg', slot: 'кейс', caption: uz ? 'Oʻz print futbolkada' : 'Свой принт на футболке' },
    { photo: '/photos/work-hoodie.jpg', slot: 'кейс', caption: uz ? 'Sevimli dizayndagi xudi' : 'Худи с твоим дизайном' },
  ]
  const GIFTS = [
    { photo: '/photos/work-notebook-muzh.jpg', icon: 'notebook', title: uz ? 'Bloknotlar' : 'Блокноты', desc: uz ? 'Logotip bilan bloknotlar — yozuv va sovgʻa uchun.' : 'Фирменные блокноты с логотипом — для заметок и в подарок.' },
    { photo: '/photos/work-thermos-cat.jpg', icon: 'flask', title: uz ? 'Termoslar' : 'Термосы', desc: uz ? 'Oʻz printingiz bilan termoslar — issiqni saqlaydi.' : 'Термосы и термокружки с вашим принтом — тепло всегда с собой.' },
    { photo: '/photos/work-keychain.jpg', icon: 'key', title: uz ? 'Breloklar' : 'Брелки', desc: uz ? 'Metall va akril breloklar — yoqimli qoʻshimcha.' : 'Металлические и акриловые брелоки — приятный сувенир к заказу.' },
    { photo: '/photos/work-giftset-boss.jpg', icon: 'gift', title: uz ? 'Sovgʻa toʻplamlari' : 'Подарочные наборы', desc: uz ? 'Tayyor toʻplam: futbolka, bloknot, termos va brelok.' : 'Готовые боксы: футболка, блокнот, термос и брелок в упаковке.' },
  ]
  const giftIcon = (k) => ({
    notebook: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="13" height="18" rx="2" /><path d="M6 7H4M6 12H4M6 17H4M10 8h5M10 12h4" /></svg>,
    flask: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M9 2h6M10 2v3.4a3 3 0 0 1-.5 1.6L8.5 9M14 2v3.4a3 3 0 0 0 .5 1.6L15.5 9" /><path d="M7.5 9h9v9.5a2.5 2.5 0 0 1-2.5 2.5h-4a2.5 2.5 0 0 1-2.5-2.5z" /><path d="M7.5 13h9" /></svg>,
    key: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="8.5" cy="8.5" r="4.5" /><path d="M11.7 11.7 20 20M16.5 17.5l2-2M14 15l2-2" /></svg>,
    gift: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 9h15v3h-15z" /><path d="M6 12v8.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V12M12 9v12" /><path d="M12 9C12 5.5 9 4.5 8 6s.5 3 4 3M12 9c0-3.5 3-4.5 4-3s-.5 3-4 3" /></svg>,
  }[k])
  const [eggN, setEggN] = useState(0)
  const [eggMsg, setEggMsg] = useState('')
  const eggBurst = (e) => {
    const btn = e.currentTarget
    const r = btn.getBoundingClientRect()
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2
    const host = document.createElement('div')
    host.style.cssText = 'position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:9999'
    document.body.appendChild(host)
    const set = ['🎉', '👕', '✨', '🧡', '🎁', '🖨️', '👟', '🧢']
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span')
      s.textContent = set[i % set.length]
      const ang = (Math.PI * 2 * i) / 16
      const dist = 66 + (i % 4) * 22
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - 30
      s.style.cssText = 'position:absolute;left:' + cx + 'px;top:' + cy + 'px;font-size:' + (17 + (i % 3) * 6) + 'px;transform:translate(-50%,-50%);transition:transform .95s cubic-bezier(.2,.7,.3,1),opacity .95s ease;will-change:transform,opacity'
      host.appendChild(s)
      requestAnimationFrame(() => { s.style.transform = 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) rotate(' + (i % 2 ? 210 : -210) + 'deg)'; s.style.opacity = '0' })
    }
    setTimeout(() => host.remove(), 1100)
    btn.classList.remove('egg-bounce'); void btn.offsetWidth; btn.classList.add('egg-bounce')
    const msgs = uz ? ['Salom! 👋', 'Yana bir marta? 😄', 'Bizni topding! 🧡', 'Oxirigacha yetkazding ✨'] : ['Привет! 👋', 'Ещё разок? 😄', 'Ты нашёл пасхалку! 🧡', 'Долистал до самого низа ✨']
    const n = eggN + 1; setEggN(n)
    setEggMsg(msgs[(n - 1) % msgs.length])
    setTimeout(() => setEggMsg(''), 2400)
  }

  return (
    <>
      <style>{`
        .nav-link:hover{color:#C97A14}
        .switch-b2b:hover{color:#15120D}
        @media (max-width:460px){.aud-seg{padding:7px 13px!important;font-size:12px!important;letter-spacing:.02em!important}}
        .cta-pill:hover{background:#F0951F}
        .btn-dark:hover{background:#000}
        .b2c-carousel-btn{width:46px;height:46px;border-radius:999px;border:1.5px solid #E7DECF;background:#fff;color:#15120D;display:grid;place-items:center;cursor:pointer;transition:background .2s,border-color .2s,transform .2s}
        .b2c-carousel-btn:hover{background:#FCAC45;border-color:#FCAC45}
        .b2c-carousel-btn:active{transform:scale(.92)}
        .b2c-works-track{scrollbar-width:none;-ms-overflow-style:none}
        .b2c-works-track::-webkit-scrollbar{display:none}
        .b2c-work-card{transition:transform .25s var(--fp-ease-out)}
        .b2c-work-card:hover{transform:translateY(-4px)}
        .b2b-num-chip{transition:transform .2s var(--fp-ease-out),box-shadow .2s var(--fp-ease-out)}
        .fp-pressable:hover .b2b-num-chip{transform:translateY(-2px) scale(1.05)}
        /* how-it-works — motion */
        .hiw-num{transition:transform .35s var(--fp-ease-spring),background .3s var(--fp-ease-out),color .3s var(--fp-ease-out),box-shadow .35s var(--fp-ease-out),border-color .3s var(--fp-ease-out)}
        .hiw-grid > div:hover .hiw-num{transform:translateY(-4px) scale(1.08);background:linear-gradient(135deg,#FCAC45,#F0951F);border-color:transparent;color:#15120D;box-shadow:0 14px 30px -10px rgba(240,149,31,.6)}
        .hiw-grid > div h3{transition:color .3s var(--fp-ease-out)}
        .hiw-grid > div:hover h3{color:#C97A14}
        .hiw-grid.is-in .hiw-num{animation:hiwPop .6s var(--fp-ease-spring) backwards;animation-delay:calc(var(--d,0ms) + 120ms)}
        @keyframes hiwPop{0%{opacity:0;transform:scale(.3) rotate(-18deg)}60%{opacity:1}100%{transform:none}}
        .hiw-grid.is-in .hiw-arrow{animation:hiwArrowPulse 2.4s var(--fp-ease) infinite}
        .hiw-grid.is-in > svg:nth-of-type(2){animation-delay:.6s}
        .hiw-grid.is-in > svg:nth-of-type(3){animation-delay:1.2s}
        @keyframes hiwArrowPulse{0%,100%{opacity:.4}45%{opacity:1}}
        .hiw-badge{transition:transform .4s var(--fp-ease-spring),box-shadow .4s var(--fp-ease-out);animation:hiwSway 4s var(--fp-ease) 1.2s infinite}
        @keyframes hiwSway{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(-1deg) translateY(-3px)}}
        .hiw-badge:hover{animation:none;transform:rotate(0deg) scale(1.06);box-shadow:0 18px 40px -14px rgba(21,18,13,.5)}
        @media (prefers-reduced-motion: reduce){.hiw-grid.is-in .hiw-num,.hiw-grid.is-in .hiw-arrow,.hiw-badge{animation:none!important}}
        .b2c-egg svg{transition:transform .25s var(--fp-ease-out)}
        .b2c-egg:hover svg{transform:rotate(-10deg) scale(1.08)}
        .b2c-egg.egg-bounce svg{animation:eggBounce .5s}
        @keyframes eggBounce{0%,100%{transform:none}30%{transform:translateY(-8px) rotate(9deg) scale(1.14)}60%{transform:translateY(0) rotate(-6deg) scale(.95)}}
        .b2c-egg-msg{animation:eggMsgIn .3s var(--fp-ease-out) both;transform:translateX(-50%)}
        @keyframes eggMsgIn{from{opacity:0;transform:translateX(-50%) translateY(7px) scale(.8)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
        .b2c-gift-ic{transition:transform .25s var(--fp-ease-out)}
        .b2c-gift-card:hover .b2c-gift-ic{transform:translateY(-4px) scale(1.06)}
        .b2c-sticky-cta{display:none}
        .b2c-fab-phone{display:none}
        .b2c-head-phone{display:inline-flex}
        @media(max-width:1023px){.b2c-head-phone{display:none!important}}
        @keyframes fabPing{0%{transform:scale(1);opacity:.6}70%,100%{transform:scale(1.5);opacity:0}}
        @media (max-width:880px){
          .b2c-sticky-cta{position:fixed;left:14px;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:60;display:flex;align-items:center;justify-content:center;gap:8px;background:#FCAC45;color:#15120D;font-weight:700;font-size:16px;padding:15px 22px;border-radius:999px;box-shadow:0 12px 30px rgba(21,18,13,.30);text-decoration:none;transform:translateY(0);opacity:1;transition:transform .42s var(--fp-ease-spring),opacity .3s ease}
          .b2c-sticky-cta.show{transform:translateY(0);opacity:1}
          .b2c-fab-phone{position:fixed;right:22px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:61;width:60px;height:60px;border-radius:999px;display:grid;place-items:center;background:#15120D;color:#FCAC45;box-shadow:0 12px 30px rgba(21,18,13,.4);text-decoration:none;transform:translateY(0) scale(1);opacity:1;transition:transform .42s var(--fp-ease-spring),opacity .3s ease}
          .b2c-fab-phone.show{transform:translateY(0) scale(1);opacity:1}
          .b2c-fab-phone::after{content:'';position:absolute;inset:0;border-radius:999px;border:2px solid rgba(252,172,69,.7);animation:fabPing 2s ease-out infinite;pointer-events:none}
        }
        .btn-outline-dark:hover{background:#15120D;color:#F5EFE5}
        .card-lift:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(21,18,13,.10)}
        .price-outline:hover{background:#15120D;color:#F5EFE5 !important}
        .price-amber:hover{background:#F0951F}
        .link-amber:hover{color:#FCAC45}
        .contact-dark:hover{background:#000}
        .b2c-burger{display:none}
        @media(max-width:880px){
          .b2c-desk-nav{display:none!important}
          .b2c-desk-cta{display:none!important}
          .b2c-burger{display:grid!important}
        }
        @media(max-width:760px){
          .b2c-hero-h1{font-size:clamp(40px,12vw,62px)!important}
          .b2c-full-btn{width:100%!important;justify-content:center!important}
          .b2c-foot-cols{gap:26px!important}
        }
      `}</style>

      <div id="top" data-screen-label={t.screenLabel} style={{ background: '#F5EFE5', color: '#15120D', fontFamily: "'Manrope',system-ui,sans-serif", minHeight: '100vh', overflowX: 'clip', position: 'relative' }}>

        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(245,239,229,.94)' : 'rgba(245,239,229,.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(21,18,13,.08)', boxShadow: scrolled ? '0 8px 26px rgba(21,18,13,.10)' : '0 0 0 rgba(21,18,13,0)', transition: 'background var(--fp-dur) var(--fp-ease), box-shadow var(--fp-dur) var(--fp-ease)' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: scrolled ? '8px 26px' : '14px 26px', display: 'flex', alignItems: 'center', gap: '22px', transition: 'padding var(--fp-dur) var(--fp-ease)' }}>
            <a href="#top" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}><Logo variant="black" height={34} /></a>
            <nav className="b2c-desk-nav" style={{ display: 'flex', gap: '22px', marginLeft: '14px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#catalog" className="nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navCatalog}</a>
              <a href="#how" className="nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navHowItWorks}</a>
              <a href="#cases" className="nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navCases}</a>
              <a href="#prices" className="nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navPrices}</a>
              <a href="#contacts" className="nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navContacts}</a>
            </nav>
            <LangToggle className="b2c-desk-cta" style={{ flex: 'none' }} />
            <a href="tel:+998333388608" aria-label={t.contactsPhone2} className="b2c-head-phone fp-pressable" style={{ alignItems: 'center', gap: '9px', textDecoration: 'none', color: '#15120D', fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: '18px', letterSpacing: '.02em', whiteSpace: 'nowrap' }}><span style={{ display: 'grid', placeItems: 'center', width: '31px', height: '31px', borderRadius: '999px', background: '#15120D', color: '#FCAC45', flex: 'none' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/></svg></span>{t.contactsPhone2}</a>
            <a href="#zayavka" className="cta-pill b2c-desk-cta fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '15px', padding: '12px 20px', borderRadius: '999px', textDecoration: 'none', whiteSpace: 'nowrap' }}>{t.ctaCalcOrderHeader} <span>↗</span></a>
            <button onClick={() => setMenuOpen(true)} aria-label={t.menuButtonAria} className="b2c-burger fp-pressable" style={{ flex: 'none', marginLeft: 'auto', width: '46px', height: '46px', borderRadius: '999px', border: '1px solid rgba(21,18,13,.18)', background: '#fff', placeItems: 'center', cursor: 'pointer', gap: '4px' }}>
              <span style={{ display: 'block', width: '18px', height: '2px', background: '#15120D', boxShadow: '0 6px 0 #15120D,0 -6px 0 #15120D' }}></span>
            </button>
          </div>
        </header>

        {menuOpen && (
          <>
            <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 89, background: 'rgba(21,18,13,.4)', animation: menuClosing ? 'fpFadeOut .2s ease both' : 'fpMenuIn .22s ease both' }}></div>
            <div className={menuClosing ? '' : 'fp-menu-in'} style={{ position: 'fixed', inset: 0, zIndex: 90, background: '#15120D', color: '#F5EFE5', padding: '26px', display: 'flex', flexDirection: 'column', animation: menuClosing ? 'fpFadeOut .2s ease both' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Logo variant="amber" height={32} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <LangToggle tone="dark" />
                  <button onClick={closeMenu} aria-label={t.menuCloseAria} className="fp-pressable" style={{ width: '46px', height: '46px', borderRadius: '999px', border: '1px solid rgba(245,239,229,.25)', background: 'transparent', color: '#F5EFE5', fontSize: '22px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              <nav style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[['#catalog', t.mobileNavCatalog], ['#how', t.mobileNavHowItWorks], ['#cases', t.mobileNavCases], ['#prices', t.mobileNavPrices], ['#contacts', t.mobileNavContacts]].map(([href, label], i) => (
                  <a key={href} onClick={closeMenu} href={href} style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '38px', color: '#F5EFE5', textDecoration: 'none', animation: menuClosing ? undefined : 'fpInUp .5s both', animationDelay: menuClosing ? undefined : (i * 40) + 'ms', '--d': (i * 40) + 'ms' }}>{label}</a>
                ))}
              </nav>
              <a onClick={closeMenu} href="#zayavka" className="fp-pressable" style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '18px', padding: '18px', borderRadius: '999px', textDecoration: 'none' }}>{t.mobileCtaCalcOrder} ↗</a>
            </div>
          </>
        )}

        {/* ============ HERO ============ */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) 26px clamp(40px,5vw,72px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,4vw,56px)', alignItems: 'stretch' }}>
              <div style={{ flex: '1 1 440px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '26px', paddingTop: '8px' }}>
                <div style={{ display: 'inline-flex', gap: '5px', background: '#fff', border: '1px solid #E7DECF', borderRadius: '999px', padding: '5px', width: 'max-content', animation: 'fpInUp .8s 0s both' }}>
                  <Link to="/" className="switch-b2b fp-pressable aud-seg" style={{ color: '#988E7B', fontWeight: 700, fontSize: '13px', padding: '8px 18px', borderRadius: '999px', letterSpacing: '.05em', textDecoration: 'none' }}>{t.heroBadgeBusiness}</Link>
                  <span className="aud-seg" style={{ background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '13px', padding: '8px 18px', borderRadius: '999px', letterSpacing: '.05em' }}>{t.heroBadgePersonal}</span>
                </div>

                <h1 className="b2c-hero-h1" style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(46px,7vw,108px)', lineHeight: '.9', letterSpacing: '-.01em', margin: 0, animation: 'fpInUp .8s .08s both' }}><span style={{ position: 'relative', display: 'inline-block' }}>{t.heroTitle}<svg viewBox="0 0 300 16" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, bottom: '-0.17em', width: '64%', height: '0.24em', overflow: 'visible', pointerEvents: 'none' }} fill="none"><path d="M5 11 C74 4 206 16 296 6" stroke="#F0951F" strokeWidth="7" strokeLinecap="round" strokeDasharray="320" strokeDashoffset="320" style={{ animation: 'fpDraw 1s .5s ease both' }} /></svg></span></h1>

                <p style={{ margin: 0, color: '#6F6655', fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.5, maxWidth: '430px', animation: 'fpInUp .8s .16s both' }}>{t.heroSubtitle}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '13px', animation: 'fpInUp .8s .24s both' }}>
                  <a href="#zayavka" className="btn-dark fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#15120D', color: '#F5EFE5', fontWeight: 700, fontSize: '16px', padding: '18px 28px', borderRadius: '999px', textDecoration: 'none' }}>{t.heroBtnOrderPrint} <span>↗</span></a>
                  <a href="#catalog" className="btn-outline-dark fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1.5px solid #15120D', color: '#15120D', fontWeight: 700, fontSize: '16px', padding: '16px 26px', borderRadius: '999px', textDecoration: 'none' }}>{t.heroBtnViewCatalog}</a>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 30px', marginTop: '6px', paddingTop: '22px', borderTop: '1px solid rgba(21,18,13,.10)', animation: 'fpInUp .8s .32s both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 600, fontSize: '14px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="#F0951F"><path d="M12 1l2.6 6.9L22 9l-5.2 4.9L18 22l-6-3.7L6 22l1.2-8.1L2 9l7.4-1.1z" /></svg>{t.heroFeatureFromOne}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 600, fontSize: '14px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /></svg>{t.heroFeatureAnyComplexity}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 600, fontSize: '14px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>{t.heroFeatureOnTime}</div>
                </div>
              </div>

              <div style={{ flex: '1 1 470px', minWidth: '300px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-6px', left: '34px', zIndex: 3, width: '120px', height: '30px', background: 'rgba(21,18,13,.78)', transform: 'rotate(-4deg)', boxShadow: '0 4px 10px rgba(0,0,0,.18)' }}></div>
                <div style={{ position: 'relative', minHeight: 'clamp(380px,46vw,580px)', height: '100%', borderRadius: '18px', overflow: 'hidden', background: '#EBE2D2' }}>
                  <Slot priority src="/photos/hero-studio.jpg" label={t.heroSlotPersonInShirt} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectPosition: '66% 42%' }} />
                </div>
                <div style={{ position: 'absolute', right: '-6px', top: '46px', zIndex: 4, textAlign: 'right', transform: 'rotate(-7deg)' }}>
                  <span style={{ fontFamily: "'Caveat'", fontWeight: 700, fontSize: '30px', color: '#15120D', lineHeight: 1, display: 'block', background: '#F5EFE5', padding: '6px 12px', borderRadius: '10px', boxShadow: '0 6px 18px rgba(0,0,0,.10)' }}>{t.heroStickerNote}</span>
                  <svg width="80" height="56" viewBox="0 0 80 56" style={{ marginRight: '24px', marginTop: '2px' }} fill="none"><path d="M70 6 C55 2 18 8 12 34" stroke="#F0951F" strokeWidth="4" strokeLinecap="round" /><path d="M6 30 L12 36 L20 32" stroke="#F0951F" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div style={{ position: 'absolute', right: '8px', bottom: '14px', zIndex: 4, writingMode: 'vertical-rl', fontFamily: "'Oswald'", fontWeight: 600, letterSpacing: '.2em', fontSize: '13px', color: 'rgba(245,239,229,.92)', textTransform: 'uppercase' }}>{t.heroVerticalLabel}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ OCCASIONS / CATALOG ============ */}
        <section id="catalog" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px', display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,3vw,48px)' }}>
            <Reveal style={{ flex: '1 1 240px', minWidth: '220px', maxWidth: '320px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.occasionsTitle}</h2>
              <svg viewBox="0 0 240 22" style={{ width: '200px', height: '20px', margin: '10px 0 0', display: 'block' }} fill="none"><path d="M4 14 C64 6 150 18 236 7" stroke="#F0951F" strokeWidth="6" strokeLinecap="round" /></svg>
              <p style={{ margin: '18px 0 0', color: '#6F6655', fontSize: '16px', lineHeight: 1.5 }}>{t.occasionsParagraph}</p>
              <a href="#catalog" className="fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '18px', fontWeight: 700, fontSize: '15px', color: '#15120D', textDecoration: 'none', borderBottom: '2px solid #FCAC45', paddingBottom: '3px' }}>{t.occasionsLinkFullCatalog} ↗</a>
            </Reveal>
            <Reveal stagger style={{ flex: '999 1 580px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px' }}>
              <a href="#zayavka" className="card-lift" style={{ '--d': '0ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4/5', background: '#EBE2D2' }}><Slot src="/photos/occ-gifts.jpg" label={t.occasionGiftsSlot} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '21px', margin: 0, lineHeight: 1 }}>{t.occasionGiftsTitle}</h3><span style={{ flex: 'none', width: '36px', height: '36px', borderRadius: '999px', background: '#FCAC45', color: '#15120D', display: 'grid', placeItems: 'center', fontSize: '17px' }}>→</span></div>
                  <p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.occasionGiftsDesc}</p>
                </div>
              </a>
              <a href="#zayavka" className="card-lift" style={{ '--d': '70ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4/5', background: '#EBE2D2' }}><Slot src="/photos/occ-holidays.jpg" label={t.occasionHolidaysSlot} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '21px', margin: 0, lineHeight: 1 }}>{t.occasionHolidaysTitle}</h3><span style={{ flex: 'none', width: '36px', height: '36px', borderRadius: '999px', background: '#FCAC45', color: '#15120D', display: 'grid', placeItems: 'center', fontSize: '17px' }}>→</span></div>
                  <p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.occasionHolidaysDesc}</p>
                </div>
              </a>
              <a href="#zayavka" className="card-lift" style={{ '--d': '140ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4/5', background: '#EBE2D2' }}><Slot src="/photos/occ-ownidea-model.jpg" label={t.occasionOwnIdeaSlot} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '21px', margin: 0, lineHeight: 1 }}>{t.occasionOwnIdeaTitle}</h3><span style={{ flex: 'none', width: '36px', height: '36px', borderRadius: '999px', background: '#FCAC45', color: '#15120D', display: 'grid', placeItems: 'center', fontSize: '17px' }}>→</span></div>
                  <p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.occasionOwnIdeaDesc}</p>
                </div>
              </a>
              <a href="#zayavka" className="card-lift" style={{ '--d': '210ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4/5', background: '#EBE2D2' }}><Slot src="/photos/occ-merch.jpg" label={t.occasionMerchSlot} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '21px', margin: 0, lineHeight: 1 }}>{t.occasionMerchTitle}</h3><span style={{ flex: 'none', width: '36px', height: '36px', borderRadius: '999px', background: '#FCAC45', color: '#15120D', display: 'grid', placeItems: 'center', fontSize: '17px' }}>→</span></div>
                  <p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.occasionMerchDesc}</p>
                </div>
              </a>
            </Reveal>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '18px', marginBottom: '38px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.howTitle}</h2>
              <span style={{ fontFamily: "'Caveat'", fontWeight: 700, fontSize: '34px', color: '#15120D', lineHeight: '.9', marginBottom: '6px' }}>{t.howHandwritten}</span>
            </Reveal>
            <style>{`@media (max-width:680px){
              .hiw-grid{flex-direction:column !important;align-items:center !important}
              .hiw-grid > div:not(:last-child){flex:0 0 auto !important;width:100%;max-width:300px;align-items:center !important;text-align:center}
              .hiw-grid > svg{transform:rotate(90deg);margin:6px auto !important}
            }`}</style>
            <Reveal stagger className="hiw-grid" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ '--d': '0ms', flex: '1 1 170px', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="hiw-num" style={{ width: '80px', height: '80px', borderRadius: '999px', border: '2px solid #15120D', display: 'grid', placeItems: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: '30px' }}>01</div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep1Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.howStep1Desc}</p></div>
              </div>
              <svg width="34" height="20" viewBox="0 0 34 20" className="hiw-arrow" style={{ '--d': '70ms', marginTop: '30px', flex: 'none' }} fill="none"><path d="M2 10h26M22 3l8 7-8 7" stroke="#C3B89F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ '--d': '140ms', flex: '1 1 170px', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="hiw-num" style={{ width: '80px', height: '80px', borderRadius: '999px', border: '2px solid #15120D', display: 'grid', placeItems: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: '30px' }}>02</div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep2Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.howStep2Desc}</p></div>
              </div>
              <svg width="34" height="20" viewBox="0 0 34 20" className="hiw-arrow" style={{ '--d': '210ms', marginTop: '30px', flex: 'none' }} fill="none"><path d="M2 10h26M22 3l8 7-8 7" stroke="#C3B89F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ '--d': '280ms', flex: '1 1 170px', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="hiw-num" style={{ width: '80px', height: '80px', borderRadius: '999px', border: '2px solid #15120D', display: 'grid', placeItems: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: '30px' }}>03</div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep3Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.howStep3Desc}</p></div>
              </div>
              <svg width="34" height="20" viewBox="0 0 34 20" className="hiw-arrow" style={{ '--d': '350ms', marginTop: '30px', flex: 'none' }} fill="none"><path d="M2 10h26M22 3l8 7-8 7" stroke="#C3B89F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={{ '--d': '420ms', flex: '1 1 170px', minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="hiw-num" style={{ width: '80px', height: '80px', borderRadius: '999px', border: '2px solid #15120D', display: 'grid', placeItems: 'center', fontFamily: "'Oswald'", fontWeight: 600, fontSize: '30px' }}>04</div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep4Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.4 }}>{t.howStep4Desc}</p></div>
              </div>
              <div className="hiw-badge" style={{ '--d': '490ms', flex: 'none', width: '150px', height: '150px', borderRadius: '999px', background: '#15120D', color: '#F5EFE5', display: 'grid', placeItems: 'center', textAlign: 'center', transform: 'rotate(-5deg)', marginLeft: '6px' }}>
                <span style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', lineHeight: 1.15, padding: '0 16px' }}>{t.howBadgeWePrintWell}</span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ STUDIO / 3D CONSTRUCTOR CTA ============ */}
        <section id="studio-cta" style={{ padding: 'clamp(20px,3vw,44px) 26px' }}>
          <Reveal>
            <div style={{ maxWidth: '1300px', margin: '0 auto', background: 'linear-gradient(135deg,#211B14,#15120D)', borderRadius: '26px', overflow: 'hidden', position: 'relative', boxShadow: '0 24px 60px rgba(21,18,13,.28)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
                <div style={{ flex: '1 1 440px', minWidth: '280px', padding: 'clamp(30px,4vw,58px)', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
                  <span style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(252,172,69,.14)', color: '#FCAC45', border: '1px solid rgba(252,172,69,.34)', fontWeight: 700, fontSize: '13px', letterSpacing: '.04em', padding: '7px 14px', borderRadius: '999px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M12 12l9-5M12 12v10M12 12L3 7" /></svg>
                    {uz ? '3D-konstruktor · onlayn' : '3D-конструктор · онлайн'}
                  </span>
                  <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(34px,4.4vw,62px)', lineHeight: '.92', margin: 0, color: '#F5EFE5' }}>{uz ? 'Printingizni oʻzingiz yigʻing' : 'Собери свой принт сам'}</h2>
                  <p style={{ margin: 0, color: 'rgba(245,239,229,.62)', fontSize: '17px', lineHeight: 1.5, maxWidth: '460px' }}>{uz ? 'Maketni yuklang, mahsulot va rangni tanlang, 3D-modelni aylantiring — va buyurtmani shu yerda rasmiylashtiring. Bepul.' : 'Загрузи макет, выбери изделие и цвет, покрути 3D-модель — и оформи заказ прямо на сайте. Это бесплатно.'}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <Link to="/studio" className="b2c-studio-btn fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '17px', padding: '17px 30px', borderRadius: '999px', textDecoration: 'none' }}>{uz ? 'Konstruktorni ochish' : 'Открыть конструктор'} <span aria-hidden="true">→</span></Link>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: 'rgba(245,239,229,.5)', fontWeight: 600, fontSize: '13.5px' }}><span style={{ color: '#FCAC45' }}>✓</span>{uz ? 'Maket bepul' : 'Макет бесплатно'}</span>
                  </div>
                </div>
                <div style={{ flex: '1 1 420px', minWidth: '280px', position: 'relative', minHeight: 'clamp(240px,30vw,380px)' }}>
                  <Slot src="/photos/studio-banner-tee.jpg" label={uz ? 'Folk Print studiyasi' : 'Студия Folk Print'} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                  <span style={{ position: 'absolute', left: '18px', bottom: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(21,18,13,.78)', WebkitBackdropFilter: 'blur(6px)', backdropFilter: 'blur(6px)', color: '#F5EFE5', fontSize: '12.5px', fontWeight: 600, padding: '8px 13px', borderRadius: '999px' }}><span style={{ color: '#FCAC45' }}>◈</span>{uz ? 'Real 3D-oldindan koʻrish' : 'Живой 3D-предпросмотр'}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ============ PRICES ============ */}
        <section id="prices" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '18px', marginBottom: '34px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.pricesTitle}</h2>
              <p style={{ margin: 0, color: '#6F6655', fontSize: '16px', lineHeight: 1.5, maxWidth: '380px' }}>{t.pricesParagraph}</p>
            </Reveal>
            <Reveal stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: '18px' }}>
              <div style={{ '--d': '0ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '24px', margin: 0 }}>{t.priceTshirtsTitle}</h3><p style={{ margin: '4px 0 0', color: '#857B69', fontSize: '14px' }}>{t.priceTshirtsDesc}</p></div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}><span style={{ color: '#857B69', fontSize: '14px' }}>{t.priceFromLabel1}</span><span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '32px', lineHeight: 1 }}>{t.priceOnRequest1}</span></div>
                <div style={{ height: '1px', background: '#EDE5D6' }}></div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.priceTshirtsFeature1}</li>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.priceTshirtsFeature2}</li>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.priceTshirtsFeature3}</li>
                </ul>
                <a href="#zayavka" className="price-outline fp-pressable" style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1.5px solid #15120D', color: '#15120D', fontWeight: 700, fontSize: '15px', padding: '14px', borderRadius: '999px', textDecoration: 'none' }}>{t.priceBtnLearnPrice1}</a>
              </div>
              <div style={{ '--d': '70ms', background: '#15120D', color: '#F5EFE5', border: '1px solid #15120D', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '20px', right: '20px', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '12px', letterSpacing: '.04em', padding: '6px 12px', borderRadius: '999px' }}>{t.priceHitBadge}</span>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '24px', margin: 0 }}>{t.priceHoodiesTitle}</h3><p style={{ margin: '4px 0 0', color: 'rgba(245,239,229,.65)', fontSize: '14px' }}>{t.priceHoodiesDesc}</p></div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}><span style={{ color: 'rgba(245,239,229,.65)', fontSize: '14px' }}>{t.priceFromLabel2}</span><span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '32px', lineHeight: 1, color: '#FCAC45' }}>{t.priceOnRequest2}</span></div>
                <div style={{ height: '1px', background: 'rgba(245,239,229,.14)' }}></div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: 'rgba(245,239,229,.9)' }}><span style={{ color: '#FCAC45' }}>✓</span>{t.priceHoodiesFeature1}</li>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: 'rgba(245,239,229,.9)' }}><span style={{ color: '#FCAC45' }}>✓</span>{t.priceHoodiesFeature2}</li>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: 'rgba(245,239,229,.9)' }}><span style={{ color: '#FCAC45' }}>✓</span>{t.priceHoodiesFeature3}</li>
                </ul>
                <a href="#zayavka" className="price-amber fp-pressable" style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '15px', padding: '15px', borderRadius: '999px', textDecoration: 'none' }}>{t.priceBtnLearnPrice2}</a>
              </div>
              <div style={{ '--d': '140ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '24px', margin: 0 }}>{t.priceTotesTitle}</h3><p style={{ margin: '4px 0 0', color: '#857B69', fontSize: '14px' }}>{t.priceTotesDesc}</p></div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}><span style={{ color: '#857B69', fontSize: '14px' }}>{t.priceFromLabel3}</span><span style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '32px', lineHeight: 1 }}>{t.priceOnRequest3}</span></div>
                <div style={{ height: '1px', background: '#EDE5D6' }}></div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.priceTotesFeature1}</li>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.priceTotesFeature2}</li>
                  <li style={{ display: 'flex', gap: '9px', fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.priceTotesFeature3}</li>
                </ul>
                <a href="#zayavka" className="price-outline fp-pressable" style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1.5px solid #15120D', color: '#15120D', fontWeight: 700, fontSize: '15px', padding: '14px', borderRadius: '999px', textDecoration: 'none' }}>{t.priceBtnLearnPrice3}</a>
              </div>
            </Reveal>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 26px', marginTop: '22px', color: '#6F6655', fontSize: '14px', fontWeight: 600 }}>
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: '#F0951F' }}>●</span>{t.priceTagFromOne}</span>
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: '#F0951F' }}>●</span>{t.priceTagVolumeDiscounts}</span>
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: '#F0951F' }}>●</span>{t.priceTagFreeMockup}</span>
              <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ color: '#F0951F' }}>●</span>{t.priceTagDeliveryTashkent}</span>
            </div>
          </div>
        </section>

        {/* ============ CASES ============ */}
        <section id="cases" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '18px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(32px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.casesTitle}</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, color: '#6F6655', fontSize: '16px', lineHeight: 1.5, maxWidth: '360px' }}>{t.casesParagraph}</p>
                <div style={{ display: 'flex', gap: '10px', flex: 'none' }}>
                  <button type="button" onClick={() => scrollWorks(-1)} aria-label={uz ? 'Orqaga' : 'Назад'} className="b2c-carousel-btn fp-pressable"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg></button>
                  <button type="button" onClick={() => scrollWorks(1)} aria-label={uz ? 'Oldinga' : 'Вперёд'} className="b2c-carousel-btn fp-pressable"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg></button>
                </div>
              </div>
            </Reveal>
            <div ref={worksRef} className="b2c-works-track" style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', paddingBottom: '6px' }}>
              {WORKS.map((w, i) => (
                <figure key={i} className="b2c-work-card" style={{ flex: '0 0 clamp(208px, 64vw, 280px)', scrollSnapAlign: 'start', margin: 0 }}>
                  <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden', background: '#EBE2D2' }}><Slot src={w.photo} label={w.slot} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                  <figcaption style={{ marginTop: '10px', fontWeight: 600, fontSize: '14px' }}>{w.caption}</figcaption>
                </figure>
              ))}
              {GIFTS.map((g, i) => (
                <figure key={'g' + i} className="b2c-work-card b2c-gift-card" style={{ flex: '0 0 clamp(208px, 64vw, 280px)', scrollSnapAlign: 'start', margin: 0 }}>
                  <div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: '16px', overflow: 'hidden', background: '#EBE2D2' }}>
                    <Slot src={g.photo} label={g.title} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                    <span style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2, background: '#15120D', color: '#FCAC45', fontSize: '10.5px', fontWeight: 700, letterSpacing: '.06em', padding: '5px 9px', borderRadius: '999px', textTransform: 'uppercase' }}>{uz ? 'Sovgʻalar' : 'Сувениры'}</span>
                  </div>
                  <figcaption style={{ marginTop: '10px' }}>
                    <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '17px', lineHeight: 1 }}>{g.title}</div>
                    <p style={{ margin: '5px 0 0', color: '#857B69', fontSize: '13px', lineHeight: 1.4 }}>{g.desc}</p>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div style={{ marginTop: '46px', borderTop: '1px solid rgba(21,18,13,.10)', paddingTop: '26px' }}>
              <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: '14px', color: '#857B69', marginBottom: '16px' }}>{t.trustedByLabel}</div>
              <div style={{ overflow: 'hidden', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)' }}>
                <div className="fp-marquee-track" style={{ display: 'flex', width: 'max-content' }}>
                  {[0, 1].map((half) => (
                    <div key={half} aria-hidden={half === 1} style={{ display: 'flex', flex: 'none' }}>
                      {clients.filter((c) => c.logo).map((c, i) => (
                        <div key={i} title={c.name} className="fp-logo-chip" style={{ flex: 'none', height: '66px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', marginRight: '16px', background: '#fff', border: '1px solid #EAE0CF', borderRadius: '14px', boxShadow: '0 1px 2px rgba(21,18,13,.05)' }}>
                          <img src={c.logo} alt={c.name} loading="lazy" style={{ height: '36px', width: 'auto', maxWidth: '150px', objectFit: 'contain', display: 'block' }} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ BIG CTA ============ */}
        <section id="cta" style={{ padding: 'clamp(20px,3vw,44px) 26px' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', background: '#FCAC45', borderRadius: '26px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px', padding: 'clamp(30px,4vw,56px)' }}>
              <div style={{ flex: '1 1 380px', minWidth: '280px' }}>
                <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(38px,5vw,80px)', lineHeight: '.9', margin: 0, color: '#15120D' }}>{t.ctaTitle}</h2>
                <p style={{ margin: '18px 0 26px', color: '#5B4A24', fontSize: '17px', lineHeight: 1.5, maxWidth: '420px' }}>{t.ctaParagraph}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <a href="#zayavka" className="contact-dark fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#15120D', color: '#F5EFE5', fontWeight: 700, fontSize: '17px', padding: '18px 30px', borderRadius: '999px', textDecoration: 'none' }}>{t.ctaBtnCalcOrder} →</a>
                  <svg width="92" height="50" viewBox="0 0 92 50" fill="none"><path d="M86 40 C60 50 18 44 8 14" stroke="#15120D" strokeWidth="3.4" strokeLinecap="round" /><path d="M3 24 L8 12 L20 16" stroke="#15120D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
              <div style={{ flex: '1 1 320px', minWidth: '260px', position: 'relative', height: 'clamp(240px,26vw,300px)' }}>
                <div style={{ position: 'absolute', left: '2%', top: '14%', width: '42%', transform: 'rotate(-7deg)', background: '#fff', padding: '8px 8px 26px', borderRadius: '6px', boxShadow: '0 14px 30px rgba(0,0,0,.18)', animation: 'fpFloatC1 6s ease-in-out infinite' }}><div style={{ position: 'relative', aspectRatio: '3/4', background: '#EBE2D2', borderRadius: '3px', overflow: 'hidden' }}><Slot src="/photos/tote.jpg" label={t.ctaSlotPrint1} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div></div>
                <div style={{ position: 'absolute', left: '30%', top: '2%', width: '42%', transform: 'rotate(4deg)', background: '#fff', padding: '8px 8px 26px', borderRadius: '6px', boxShadow: '0 14px 30px rgba(0,0,0,.18)', zIndex: 2, animation: 'fpFloatC2 7s ease-in-out infinite .35s' }}><div style={{ position: 'relative', aspectRatio: '3/4', background: '#EBE2D2', borderRadius: '3px', overflow: 'hidden' }}><Slot src="/photos/tee-anime.jpg" label={t.ctaSlotPrint2} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div></div>
                <div style={{ position: 'absolute', left: '58%', top: '18%', width: '42%', transform: 'rotate(-3deg)', background: '#fff', padding: '8px 8px 26px', borderRadius: '6px', boxShadow: '0 14px 30px rgba(0,0,0,.18)', animation: 'fpFloatC3 6.5s ease-in-out infinite .2s' }}><div style={{ position: 'relative', aspectRatio: '3/4', background: '#EBE2D2', borderRadius: '3px', overflow: 'hidden' }}><Slot src="/photos/hoodie.jpg" label={t.ctaSlotPrint3} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CONTACTS ============ */}
        <section id="contacts" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px', display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,3vw,48px)' }}>
            <div style={{ flex: '1 1 380px', minWidth: '280px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(34px,4vw,60px)', lineHeight: '.92', margin: 0 }}>{t.contactsTitle}</h2>
              <p style={{ margin: '18px 0 20px', color: '#6F6655', fontSize: '17px', lineHeight: 1.5, maxWidth: '420px' }}>{t.contactsParagraph}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', marginBottom: '26px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: '#fff', border: '1px solid #E7DECF', borderRadius: '999px', padding: '8px 14px' }}>
                  <span style={{ position: 'relative', width: '9px', height: '9px', display: 'inline-block' }}>
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '999px', background: '#1F8A5B' }} />
                    <span style={{ position: 'absolute', inset: 0, borderRadius: '999px', background: '#1F8A5B', animation: 'fpPing 1.8s ease-out infinite' }} />
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{lang === 'uz' ? 'Hozir aloqadamiz' : 'Сейчас на связи'}</span>
                  <span style={{ color: '#988E7B', fontSize: '13px' }}>· {lang === 'uz' ? 'Du–Sha 10:00–19:00' : 'Пн–Сб 10:00–19:00'}</span>
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#FCEFD9', color: '#C97A14', borderRadius: '999px', padding: '8px 14px', fontWeight: 700, fontSize: '13.5px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 L4 14h6l-1 8 9-12h-6z" /></svg>
                  {lang === 'uz' ? '~15 daqiqada javob' : 'Отвечаем за ~15 минут'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '26px' }}>
                <a href="tel:+998333388608" className="fp-pressable" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', textDecoration: 'none', color: '#15120D' }}><span className="b2b-num-chip" style={{ flex: 'none', display: 'grid', placeItems: 'center', minWidth: '54px', height: '42px', padding: '0 12px', borderRadius: '12px', background: '#15120D', color: '#FCAC45', fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '17px', letterSpacing: '.03em', lineHeight: 1, border: '1px solid #2A241A', boxShadow: '0 4px 12px rgba(21,18,13,.3)' }}>B2C</span><span style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: '24px' }}>{t.contactsPhone2}</span><span style={{ color: '#857B69', fontWeight: 600, fontSize: '12.5px', background: '#fff', border: '1px solid #EDE5D6', borderRadius: '999px', padding: '4px 11px', whiteSpace: 'nowrap' }}>Менеджер</span></a>
                <a href={telHref(brand.phone)} className="fp-pressable" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', textDecoration: 'none', color: '#15120D' }}><span className="b2b-num-chip" style={{ flex: 'none', display: 'grid', placeItems: 'center', minWidth: '54px', height: '42px', padding: '0 12px', borderRadius: '12px', background: 'linear-gradient(135deg,#FCAC45,#F0951F)', color: '#15120D', fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '17px', letterSpacing: '.03em', lineHeight: 1, boxShadow: '0 4px 12px rgba(240,149,31,.42)' }}>B2B</span><span style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: '24px' }}>{brand.phone}</span><span style={{ color: '#857B69', fontWeight: 600, fontSize: '12.5px', background: '#fff', border: '1px solid #EDE5D6', borderRadius: '999px', padding: '4px 11px', whiteSpace: 'nowrap' }}>Менеджер</span></a>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                <a href="https://t.me/Folkprintme" className="contact-dark fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#15120D', border: '1.5px solid #15120D', color: '#F5EFE5', fontWeight: 700, fontSize: '15px', padding: '11px 20px', borderRadius: '999px', textDecoration: 'none' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: 'none' }}><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.98-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg>{t.contactsTelegram}</a>                <a href="https://www.instagram.com/folkprint.uz/" className="price-outline fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid #15120D', color: '#15120D', fontWeight: 700, fontSize: '15px', padding: '11px 20px', borderRadius: '999px', textDecoration: 'none' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flex: 'none' }}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>{t.contactsInstagram}</a>
              </div>
            </div>

            <div id="zayavka" style={{ flex: '1 1 360px', minWidth: '280px', background: '#fff', border: '1px solid #E7DECF', borderRadius: '22px', padding: 'clamp(24px,3vw,36px)', alignSelf: 'flex-start', scrollMarginTop: '90px' }}>
              {!sent ? (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setSent(true); fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'b2c', hp: fd.get('hp') || '', fields: { 'Имя': fd.get('name') || '', 'Телефон': fd.get('phone') || '', 'Сообщение': fd.get('message') || '' } }) }).catch(() => {}) }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '22px' }}>{t.formTitle}</div>
                  <input type="text" name="name" autoComplete="name" placeholder={t.formPlaceholderName} style={{ border: '1px solid #E2D9C8', background: '#FAF6EE', borderRadius: '12px', padding: '15px 16px', fontSize: '15px', fontFamily: 'inherit', color: '#15120D', outline: 'none' }} />
                  <input type="tel" name="phone" autoComplete="tel" placeholder={t.formPlaceholderPhone} style={{ border: '1px solid #E2D9C8', background: '#FAF6EE', borderRadius: '12px', padding: '15px 16px', fontSize: '15px', fontFamily: 'inherit', color: '#15120D', outline: 'none' }} />
                  <textarea rows="3" name="message" placeholder={t.formPlaceholderMessage} style={{ border: '1px solid #E2D9C8', background: '#FAF6EE', borderRadius: '12px', padding: '15px 16px', fontSize: '15px', fontFamily: 'inherit', color: '#15120D', outline: 'none', resize: 'vertical' }}></textarea>
                  <button type="submit" className="price-amber fp-pressable" style={{ background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '16px', padding: '16px', border: 0, borderRadius: '999px', cursor: 'pointer' }}>{t.formSubmit} →</button>
                  <p style={{ margin: 0, color: '#A79C88', fontSize: '12px', lineHeight: 1.4 }}>{t.formConsent}</p>
                </form>
              ) : (
                <div className="fp-pop" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', padding: '20px 0' }}>
                  <span className="fp-badge-pop" style={{ width: '56px', height: '56px', borderRadius: '999px', background: '#FCAC45', color: '#15120D', display: 'grid', placeItems: 'center', fontSize: '26px' }}>✓</span>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '24px' }}>{t.formSuccessTitle}</div>
                  <p style={{ margin: 0, color: '#6F6655', fontSize: '15px', lineHeight: 1.5 }}>{t.formSuccessText}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer style={{ background: '#15120D', color: '#F5EFE5', padding: 'clamp(40px,4vw,64px) 0 28px' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', justifyContent: 'space-between' }}>
              <div style={{ flex: '1 1 330px', minWidth: '240px' }}>
                <Logo variant="amber" height={34} />
                <p style={{ margin: '12px 0 16px', color: 'rgba(245,239,229,.55)', fontSize: '15px', lineHeight: 1.5, maxWidth: '300px' }}>{t.footerTagline}</p>
                <a href={brand.mapLink} target="_blank" rel="noopener noreferrer" aria-label="Открыть на Яндекс.Картах" style={{ display: 'block', position: 'relative', maxWidth: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(245,239,229,.14)', boxShadow: '0 12px 30px rgba(0,0,0,.28)' }}>
                  <iframe src={brand.mapSrc} title="Folk Print — Ташкент, Чиланзар" loading="lazy" style={{ border: 0, width: '100%', height: '190px', display: 'block', pointerEvents: 'none' }} />
                  <span style={{ position: 'absolute', left: '12px', bottom: '12px', background: 'rgba(21,18,13,.85)', color: '#F5EFE5', fontSize: '12.5px', fontWeight: 600, padding: '8px 13px', borderRadius: '999px', display: 'inline-flex', gap: '7px', alignItems: 'center' }}><span style={{ color: '#FCAC45' }}>📍</span>Открыть на карте</span>
                </a>
                <a href={brand.mapLink} target="_blank" rel="noopener noreferrer" className="link-amber fp-pressable" style={{ display: 'block', marginTop: '14px', maxWidth: '400px', color: 'rgba(245,239,229,.7)', fontSize: '13.5px', lineHeight: 1.5, textDecoration: 'none' }}>{brand.address}</a>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColCatalogTitle}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCatalogTshirts}</a><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCatalogHoodies}</a><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCatalogTotes}</a><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCatalogCaps}</a><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCatalogStationery}</a></div></div>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColOccasionsTitle}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerOccasionGifts}</a><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerOccasionHolidays}</a><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerOccasionOwnIdea}</a><a href="#catalog" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerOccasionMerch}</a></div></div>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColInfoTitle}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href="#how" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerInfoHowItWorks}</a><a href="#prices" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerInfoPrices}</a><a href="#cases" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerInfoCases}</a></div></div>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColContactsTitle}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href="tel:+998333388608" className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.contactsPhone2} <span style={{ color: 'rgba(245,239,229,.4)' }}>(B2C)</span></a><a href={telHref(brand.phone)} className="link-amber fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{brand.phone} <span style={{ color: 'rgba(245,239,229,.4)' }}>(B2B)</span></a><a href="https://t.me/Folkprintme" className="link-amber fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: 'none' }}><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.98-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg>{t.footerContactsTelegram}</a><a href="https://www.instagram.com/folkprint.uz/" className="link-amber fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flex: 'none' }}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>{t.footerContactsInstagram}</a></div></div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginTop: '44px', paddingTop: '22px', borderTop: '1px solid rgba(245,239,229,.12)' }}>
              <span style={{ color: 'rgba(245,239,229,.5)', fontSize: '13px' }}>{t.footerCopyright}</span>
              <button type="button" onClick={eggBurst} aria-label={uz ? 'Syurpriz' : 'Сюрприз'} className="b2c-egg fp-pressable" style={{ position: 'relative', background: 'transparent', border: 0, padding: 0, cursor: 'pointer', lineHeight: 0 }}>{eggMsg && <span className="b2c-egg-msg" style={{ position: 'absolute', bottom: '122%', left: '50%', whiteSpace: 'nowrap', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '12.5px', padding: '6px 11px', borderRadius: '999px', boxShadow: '0 8px 20px rgba(0,0,0,.35)' }}>{eggMsg}</span>}<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="22" fill="#FCAC45" /><circle cx="17" cy="20" r="2.6" fill="#15120D" /><circle cx="31" cy="20" r="2.6" fill="#15120D" /><path d="M15 28 C19 34 29 34 33 28" stroke="#15120D" strokeWidth="3" strokeLinecap="round" /></svg></button>
            </div>
          </div>
        </footer>

        {/* sticky mobile CTA — portaled to <body> (escapes .fp-route transform) */}
        {typeof document !== 'undefined' && createPortal(
          <a href="#zayavka" className={'b2c-sticky-cta fp-pressable' + (showCta ? ' show' : '')}>{t.heroBtnOrderPrint} <span aria-hidden="true">↗</span></a>,
          document.body
        )}

        {/* mobile round call button — floats above the sticky CTA, right side */}
        {typeof document !== 'undefined' && createPortal(
          <a href="tel:+998333388608" aria-label={uz ? 'Qoʻngʻiroq qilish' : 'Позвонить'} className={'b2c-fab-phone fp-pressable' + (showCta ? ' show' : '')}>
            <svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
          </a>,
          document.body
        )}

      </div>
    </>
  )
}
