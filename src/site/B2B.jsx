import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import Slot from './Slot.jsx'
import Logo from './Logo.jsx'
import { brand, tgHref, igHref, telHref, mailHref } from './brand.js'
import { clients } from './clients.js'
import { Reveal, useCountUp, usePrefersReducedMotion } from './motion.jsx'
import { useLang, LangToggle } from './lang.jsx'

const STR = {
  ru: {
    screenLabel: 'Folk Print — Бизнесу (B2B)',
    navProducts: 'Изделия',
    navWhyUs: 'Почему мы',
    navProcess: 'Процесс',
    navCases: 'Кейсы',
    navPrices: 'Цены',
    navContacts: 'Контакты',
    headerCtaQuote: 'Получить КП',
    burgerAriaMenu: 'Меню',
    mobileCloseAria: 'Закрыть',
    mobileNavProducts: 'Изделия',
    mobileNavWhyUs: 'Почему мы',
    mobileNavProcess: 'Процесс',
    mobileNavCases: 'Кейсы',
    mobileNavPrices: 'Цены',
    mobileNavContacts: 'Контакты',
    mobileCtaQuote: 'Получить КП ↗',
    switchPersonal: 'ДЛЯ СЕБЯ',
    switchBusiness: 'ДЛЯ БИЗНЕСА',
    heroTitle: 'Корпоративная одежда с вашим логотипом',
    heroSubtitle: 'От идеи до реализации. Брендируем форму, промо-одежду и подарки для компаний — любой тираж, по договору, с закрывающими документами.',
    heroBtnCalc: 'Получить расчёт',
    heroBtnViewProducts: 'Смотреть изделия',
    heroTrustContract: 'Работаем по договору',
    heroTrustQuality: 'Контроль качества',
    heroTrustUrgent: 'Срочно — за 24 часа',
    heroSlotTeam: 'фото · команда в брендированной форме',
    heroBadgeYourLogo: 'Нам доверяют',
    heroBadgeMethods: 'Coca-Cola · KFC · Uzum · Artel',
    heroVerticalLabel: 'Folk Print · B2B',
    statYearValue: '2014',
    statYearLabel: 'на рынке Узбекистана',
    statClientsValue: '500+',
    statClientsLabel: 'компаний-клиентов',
    statItemsValue: '1 млн+',
    statItemsSuffix: ' млн+',
    statItemsLabel: 'изделий с нанесением',
    statDaysValue: '24 часа',
    statDaysSuffix: ' часа',
    statDaysLabel: 'срочное производство',
    catalogTitle: 'Что мы брендируем',
    catalogSubtitle: 'Полный гардероб компании — от рабочей формы до подарков клиентам. Логотип наносим любым методом.',
    catalogRequestCatalog: 'Запросить каталог ↗',
    catalogSlotUniform: 'фото · корпоративная форма',
    catalogFlagshipTag: 'Флагман',
    catalogUniformTitle: 'Корпоративная форма',
    catalogUniformDesc: 'Рубашки, поло, фартуки и жилеты в фирменном стиле с вышивкой логотипа.',
    catalogMore: 'Подробнее',
    catalogSlotPromo: 'фото · промо-одежда',
    catalogPromoTitle: 'Промо-одежда',
    catalogPromoDesc: 'Футболки и кепки для акций и мероприятий.',
    catalogSlotWorkwear: 'фото · спецодежда',
    catalogWorkwearTitle: 'Спецодежда',
    catalogWorkwearDesc: 'Куртки, жилеты, рабочая форма с логотипом.',
    catalogSlotGifts: 'фото · бизнес-подарки',
    catalogGiftsTitle: 'Бизнес-подарки',
    catalogGiftsDesc: 'Сумки, термокружки, брендированный мерч.',
    catalogSlotMerch: 'фото · мерч для сотрудников',
    catalogMerchTitle: 'Мерч для команды',
    catalogMerchDesc: 'Худи, свитшоты и аксессуары для сотрудников.',
    whyTitle: 'Почему компании выбирают нас',
    whyAccent: 'Надёжно. Без сюрпризов.',
    whyContractTitle: 'Работаем по договору',
    whyContractDesc: 'Официально, с юрлицами и физлицами. Безналичный расчёт, НДС.',
    whyDocsTitle: 'Собственное производство',
    whyDocsDesc: 'Свой цех и оборудование — контролируем сроки и качество на каждом этапе, без посредников и переплат.',
    whyManagerTitle: 'Персональный менеджер',
    whyManagerDesc: 'Один контакт на весь проект — от брифа до доставки.',
    whySampleTitle: 'Образец до тиража',
    whySampleDesc: 'Утверждаете цвет, посадку и нанесение перед запуском.',
    whyQualityTitle: 'Контроль качества',
    whyQualityDesc: 'Проверяем каждую партию — посадку, цвет и стойкость нанесения.',
    whyVolumeTitle: 'Любой тираж и сроки',
    whyVolumeDesc: 'От 10 до 10 000+ изделий. Срочные заказы — от 1 дня.',
    howTitle: 'Как мы работаем',
    howSubtitle: 'Прозрачный процесс от заявки до закрывающих документов.',
    howStep1Title: 'Заявка и бриф',
    howStep1Desc: 'Расскажите задачу, тираж и сроки.',
    howStep2Title: 'Расчёт и КП',
    howStep2Desc: 'Пришлём смету и варианты изделий.',
    howStep3Title: 'Макет и образец',
    howStep3Desc: 'Согласуем дизайн и пример изделия.',
    howStep4Title: 'Производство',
    howStep4Desc: 'Печать и пошив под контролем качества.',
    howStep5Title: 'Доставка и документы',
    howStep5Desc: 'Привезём тираж и закроем сделку.',
    methodsTitle: 'Методы нанесения',
    methodsDesc: 'Подберём технологию под логотип, ткань и тираж.',
    methodEmbroideryTitle: 'Вышивка',
    methodEmbroideryDesc: 'Премиально, с фактурой',
    methodSilkscreenTitle: 'Шёлкография',
    methodSilkscreenDesc: 'Большие тиражи',
    methodDtfTitle: 'DTF-печать',
    methodDtfDesc: 'Полноцвет, сложный лого',
    methodChevronTitle: 'Шеврон',
    methodChevronDesc: 'Объёмные нашивки',
    methodTransferTitle: 'Термотрансфер',
    methodTransferDesc: 'Имена и номера',
    methodLabelsTitle: 'Бирки',
    methodLabelsDesc: 'Брендинг под горло',
    methodLaserTitle: 'Лазерная печать',
    methodLaserDesc: 'Гравировка и точный раскрой',
    casesTitle: 'Кейсы',
    casesSubtitle: 'Одеваем команды и снабжаем мероприятия по всему Узбекистану.',
    caseRetailSlot: 'фото · кейс: форма для сети',
    caseRetailTag: 'Ритейл',
    caseRetailVolume: '2 400 изделий',
    caseRetailTitle: 'Форма для розничной сети',
    caseRetailDesc: 'Поло и фартуки с вышивкой для 40 точек за 12 дней.',
    caseEventSlot: 'фото · кейс: промо к мероприятию',
    caseEventTag: 'Событие',
    caseEventVolume: '3 000 изделий',
    caseEventTitle: 'Промо к конференции',
    caseEventDesc: 'Футболки и шопперы для участников и волонтёров.',
    caseItSlot: 'фото · кейс: мерч для IT-команды',
    caseItTag: 'IT',
    caseItVolume: '800 изделий',
    caseItTitle: 'Мерч для IT-команды',
    caseItDesc: 'Худи и стикеры к релизу — онбординг-наборы новичкам.',
    trustedByLabel: 'Нам доверяют',
    marqueeSectors: ['Рестораны и кафе', 'IT-компании', 'Маркетплейсы', 'Госструктуры', 'Банки и финтех', 'Ритейл и магазины', 'Стартапы', 'Производство', 'Спортклубы', 'Образование'],
    pricesTitle: 'Цены от тиража',
    pricesSubtitle: 'Цена за изделие с нанесением логотипа. Чем больше тираж — тем ниже цена. Точную смету пришлём в КП.',
    priceColItem: 'Изделие',
    priceColPopular: 'ПОПУЛЯРНО',
    priceRowTshirt: 'Футболка',
    priceOnRequest: 'по запросу',
    priceCellQuote: 'КП',
    priceRowPolo: 'Поло с вышивкой',
    priceRowHoodie: 'Худи / свитшот',
    priceRowCap: 'Кепка',
    priceRowTote: 'Шоппер / сумка',
    priceFootnote: 'Цена за изделие с нанесением — по запросу. Финальная стоимость зависит от ткани и метода.',
    priceFootCta: 'Точный расчёт в КП →',
    ctaTitle: 'Оденем вашу команду',
    ctaSubtitle: 'Пришлите задачу — подготовим коммерческое предложение с вариантами изделий и точной ценой в течение дня.',
    ctaBtnQuote: 'Получить КП →',
    ctaSlotUniform: 'фото · форма',
    ctaSlotMerch: 'фото · мерч',
    ctaSlotGifts: 'фото · подарки',
    contactsTitle: 'Запросить предложение',
    contactsSubtitle: 'Оставьте заявку или напишите менеджеру — пришлём КП с вариантами и ценой. Работаем с юрлицами и физлицами.',
    contactsPhone: '+998 95 787 77 55',
    contactsEmail: 'b2b@folkprint.uz',
    contactsTelegram: 'Telegram',
    contactsWhatsapp: 'WhatsApp',
    contactsInstagram: 'Instagram',
    contactsFeatContract: 'Договор и безнал',
    contactsFeatDocs: 'Закрывающие документы',
    contactsFeatAllUz: 'Работаем по всему Узбекистану',
    contactsAddress: 'г. Ташкент, Учтепинский район, массив Чиланзар, 11-й квартал, 51/1 · Пн–Сб 10:00–19:00',
    formTitle: 'Заявка на КП',
    formCompany: 'Компания',
    formContactPerson: 'Контактное лицо',
    formPhone: 'Телефон',
    formEmail: 'Email',
    formVolume: 'Тираж, шт',
    formMessage: 'Что нужно: изделия, логотип, сроки (необязательно)',
    formSubmit: 'Получить КП →',
    formConsent: 'Нажимая кнопку, вы соглашаетесь на обработку данных.',
    formSuccessTitle: 'Заявка принята!',
    formSuccessDesc: 'Менеджер свяжется с вами в короткое время.',
    footerTagline: 'Корпоративная одежда с логотипом. От идеи до реализации. Ташкент.',
    footerColProducts: 'Изделия',
    footerProdUniform: 'Корп. форма',
    footerProdPromo: 'Промо-одежда',
    footerProdWorkwear: 'Спецодежда',
    footerProdGifts: 'Бизнес-подарки',
    footerProdMerch: 'Мерч',
    footerColCompany: 'Компания',
    footerCompWhyUs: 'Почему мы',
    footerCompProcess: 'Процесс',
    footerCompCases: 'Кейсы',
    footerCompPrices: 'Цены',
    footerColContacts: 'Контакты',
    footerContactCity: 'Ташкент, Чиланзар',
    footerColForClients: 'Для клиентов',
    footerClientQuote: 'Получить КП',
    footerClientContract: 'Договор и оплата',
    footerCopyright: '© 2026 Folk Print. Корпоративная одежда с логотипом.',
  },
  uz: {
    screenLabel: 'Folk Print — Biznes uchun (B2B)',
    navProducts: 'Mahsulotlar',
    navWhyUs: 'Nima uchun biz',
    navProcess: 'Jarayon',
    navCases: 'Keyslar',
    navPrices: 'Narxlar',
    navContacts: 'Aloqa',
    headerCtaQuote: 'Tijoriy taklif olish',
    burgerAriaMenu: 'Menyu',
    mobileCloseAria: 'Yopish',
    mobileNavProducts: 'Mahsulotlar',
    mobileNavWhyUs: 'Nima uchun biz',
    mobileNavProcess: 'Jarayon',
    mobileNavCases: 'Keyslar',
    mobileNavPrices: 'Narxlar',
    mobileNavContacts: 'Aloqa',
    mobileCtaQuote: 'Tijoriy taklif olish ↗',
    switchPersonal: 'OʻZIM UCHUN',
    switchBusiness: 'BIZNES UCHUN',
    heroTitle: 'Logotipingiz tushirilgan korporativ kiyim',
    heroSubtitle: 'Gʻoyadan tayyor mahsulotgacha. Kompaniyalar uchun forma, promo-kiyim va sovgʻalarni brendlaymiz — istalgan miqdorda, shartnoma asosida, barcha hujjatlari bilan.',
    heroBtnCalc: 'Hisob-kitobni olish',
    heroBtnViewProducts: 'Mahsulotlarni koʻrish',
    heroTrustContract: 'Shartnoma asosida ishlaymiz',
    heroTrustQuality: 'Sifat nazorati',
    heroTrustUrgent: 'Shoshilinch — 24 soatda',
    heroSlotTeam: 'foto · brendli formadagi jamoa',
    heroBadgeYourLogo: 'Bizga ishonishadi',
    heroBadgeMethods: 'Coca-Cola · KFC · Uzum · Artel',
    heroVerticalLabel: 'Folk Print · B2B',
    statYearValue: '2014',
    statYearLabel: 'Oʻzbekiston bozorida',
    statClientsValue: '500+',
    statClientsLabel: 'mijoz kompaniya',
    statItemsValue: '1 mln+',
    statItemsSuffix: ' mln+',
    statItemsLabel: 'logotipli mahsulot',
    statDaysValue: '24 soat',
    statDaysSuffix: ' soat',
    statDaysLabel: 'shoshilinch ishlab chiqarish',
    catalogTitle: 'Nimalarni brendlaymiz',
    catalogSubtitle: 'Kompaniyaning toʻliq garderobi — ish formasidan tortib mijozlarga sovgʻalargacha. Logotipni istalgan usulda tushiramiz.',
    catalogRequestCatalog: 'Katalog soʻrash ↗',
    catalogSlotUniform: 'foto · korporativ forma',
    catalogFlagshipTag: 'Flagman',
    catalogUniformTitle: 'Korporativ forma',
    catalogUniformDesc: 'Logotip kashtasi tushirilgan, brend uslubidagi koʻylaklar, polo, fartuk va jiletlar.',
    catalogMore: 'Batafsil',
    catalogSlotPromo: 'foto · promo-kiyim',
    catalogPromoTitle: 'Promo-kiyim',
    catalogPromoDesc: 'Aksiya va tadbirlar uchun futbolka va kepkalar.',
    catalogSlotWorkwear: 'foto · maxsus kiyim',
    catalogWorkwearTitle: 'Maxsus kiyim',
    catalogWorkwearDesc: 'Logotipli kurtkalar, jiletlar va ish formasi.',
    catalogSlotGifts: 'foto · biznes-sovgʻalar',
    catalogGiftsTitle: 'Biznes-sovgʻalar',
    catalogGiftsDesc: 'Sumkalar, termokrujkalar, brendli merch.',
    catalogSlotMerch: 'foto · xodimlar uchun merch',
    catalogMerchTitle: 'Jamoa uchun merch',
    catalogMerchDesc: 'Xodimlar uchun xudi, svitshot va aksessuarlar.',
    whyTitle: 'Nega kompaniyalar bizni tanlaydi',
    whyAccent: 'Ishonchli. Kutilmagan holatlarsiz.',
    whyContractTitle: 'Shartnoma asosida ishlaymiz',
    whyContractDesc: 'Rasmiy ravishda, yuridik va jismoniy shaxslar bilan. Naqdsiz hisob-kitob, QQS bilan.',
    whyDocsTitle: 'Oʻz ishlab chiqarish',
    whyDocsDesc: 'Oʻz sexi va jihozlari — muddat va sifatni har bosqichda vositachisiz nazorat qilamiz.',
    whyManagerTitle: 'Shaxsiy menejer',
    whyManagerDesc: 'Butun loyiha uchun bitta aloqa — brifdan yetkazib berishgacha.',
    whySampleTitle: 'Tirajdan oldin namuna',
    whySampleDesc: 'Ishlab chiqarishdan oldin rang, oʻlcham va bosmani tasdiqlaysiz.',
    whyQualityTitle: 'Sifat nazorati',
    whyQualityDesc: 'Har bir partiyani tekshiramiz — oʻlcham, rang va bosmaning chidamliligi.',
    whyVolumeTitle: 'Istalgan tiraj va muddat',
    whyVolumeDesc: '10 tadan 10 000+ tagacha. Shoshilinch buyurtmalar — 1 kundan.',
    howTitle: 'Qanday ishlaymiz',
    howSubtitle: 'Murojaatdan hujjatlargacha shaffof jarayon.',
    howStep1Title: 'Murojaat va brif',
    howStep1Desc: 'Vazifa, tiraj va muddatni aytib bering.',
    howStep2Title: 'Hisob-kitob va taklif',
    howStep2Desc: 'Smeta va mahsulot variantlarini yuboramiz.',
    howStep3Title: 'Maket va namuna',
    howStep3Desc: 'Dizayn va mahsulot namunasini kelishamiz.',
    howStep4Title: 'Ishlab chiqarish',
    howStep4Desc: 'Sifat nazorati ostida bosma va tikuv.',
    howStep5Title: 'Yetkazib berish va hujjatlar',
    howStep5Desc: 'Tirajni yetkazib, bitimni yopamiz.',
    methodsTitle: 'Logotip tushirish usullari',
    methodsDesc: 'Logotip, mato va tirajga mos texnologiyani tanlaymiz.',
    methodEmbroideryTitle: 'Kashta',
    methodEmbroideryDesc: 'Premium, fakturali',
    methodSilkscreenTitle: 'Shelkografiya',
    methodSilkscreenDesc: 'Katta tirajlar uchun',
    methodDtfTitle: 'DTF-bosma',
    methodDtfDesc: 'Toʻliq rangli, murakkab logo',
    methodChevronTitle: 'Shevron',
    methodChevronDesc: 'Hajmli nashivkalar',
    methodTransferTitle: 'Termotransfer',
    methodTransferDesc: 'Ism va raqamlar',
    methodLabelsTitle: 'Yorliqlar',
    methodLabelsDesc: 'Yoqa ostiga brending',
    methodLaserTitle: 'Lazer bosma',
    methodLaserDesc: 'Oʻyish va aniq kesish',
    casesTitle: 'Keyslar',
    casesSubtitle: 'Butun Oʻzbekiston boʻylab jamoalarni kiyintiramiz va tadbirlarni taʼminlaymiz.',
    caseRetailSlot: 'foto · keys: tarmoq uchun forma',
    caseRetailTag: 'Riteyl',
    caseRetailVolume: '2 400 mahsulot',
    caseRetailTitle: 'Chakana savdo tarmogʻi uchun forma',
    caseRetailDesc: '40 ta nuqta uchun kashtali polo va fartuklar — 12 kunda.',
    caseEventSlot: 'foto · keys: tadbir uchun promo',
    caseEventTag: 'Tadbir',
    caseEventVolume: '3 000 mahsulot',
    caseEventTitle: 'Konferensiya uchun promo',
    caseEventDesc: 'Ishtirokchi va koʻngillilar uchun futbolka va shopperlar.',
    caseItSlot: 'foto · keys: IT-jamoa uchun merch',
    caseItTag: 'IT',
    caseItVolume: '800 mahsulot',
    caseItTitle: 'IT-jamoa uchun merch',
    caseItDesc: 'Reliz uchun xudi va stikerlar — yangi xodimlarga onbording toʻplamlari.',
    trustedByLabel: 'Bizga ishonishadi',
    marqueeSectors: ['Restoran va kafelar', 'IT-kompaniyalar', 'Marketpleyslar', 'Davlat tuzilmalari', 'Bank va fintex', 'Riteyl va doʻkonlar', 'Startaplar', 'Ishlab chiqarish', 'Sport klublari', 'Taʼlim'],
    pricesTitle: 'Narxlar tirajga qarab',
    pricesSubtitle: 'Logotip tushirilgan bitta mahsulot narxi. Tiraj qancha katta boʻlsa — narx shuncha past. Aniq smetani tijoriy taklifda yuboramiz.',
    priceColItem: 'Mahsulot',
    priceColPopular: 'OMMABOP',
    priceRowTshirt: 'Futbolka',
    priceOnRequest: 'soʻrov boʻyicha',
    priceCellQuote: 'Taklif',
    priceRowPolo: 'Kashtali polo',
    priceRowHoodie: 'Xudi / svitshot',
    priceRowCap: 'Kepka',
    priceRowTote: 'Shopper / sumka',
    priceFootnote: 'Logotipli bitta mahsulot narxi — soʻrov boʻyicha. Yakuniy narx mato va usulga bogʻliq.',
    priceFootCta: 'Aniq hisob-kitob tijoriy taklifda →',
    ctaTitle: 'Jamoangizni kiyintiramiz',
    ctaSubtitle: 'Vazifani yuboring — bir kun ichida mahsulot variantlari va aniq narx bilan tijoriy taklif tayyorlaymiz.',
    ctaBtnQuote: 'Tijoriy taklif olish →',
    ctaSlotUniform: 'foto · forma',
    ctaSlotMerch: 'foto · merch',
    ctaSlotGifts: 'foto · sovgʻalar',
    contactsTitle: 'Taklif soʻrash',
    contactsSubtitle: 'Murojaat qoldiring yoki menejerga yozing — variantlar va narx bilan tijoriy taklif yuboramiz. Yuridik va jismoniy shaxslar bilan ishlaymiz.',
    contactsPhone: '+998 95 787 77 55',
    contactsEmail: 'b2b@folkprint.uz',
    contactsTelegram: 'Telegram',
    contactsWhatsapp: 'WhatsApp',
    contactsInstagram: 'Instagram',
    contactsFeatContract: 'Shartnoma va naqdsiz toʻlov',
    contactsFeatDocs: 'Hisob-kitob hujjatlari',
    contactsFeatAllUz: 'Butun Oʻzbekiston boʻylab ishlaymiz',
    contactsAddress: 'Toshkent sh., Uchtepa tumani, Chilonzor mavzesi, 11-kvartal, 51/1 · Dush–Shan 10:00–19:00',
    formTitle: 'Taklif uchun ariza',
    formCompany: 'Kompaniya',
    formContactPerson: 'Bogʻlanish uchun shaxs',
    formPhone: 'Telefon',
    formEmail: 'Email',
    formVolume: 'Tiraj, dona',
    formMessage: 'Nima kerak: mahsulotlar, logotip, muddatlar (ixtiyoriy)',
    formSubmit: 'Tijoriy taklif olish →',
    formConsent: 'Tugmani bosish orqali siz maʼlumotlaringizni qayta ishlashga rozilik bildirasiz.',
    formSuccessTitle: 'Ariza qabul qilindi!',
    formSuccessDesc: 'Menejer siz bilan tez orada bogʻlanadi.',
    footerTagline: 'Logotipli korporativ kiyim. Gʻoyadan tayyor mahsulotgacha. Toshkent.',
    footerColProducts: 'Mahsulotlar',
    footerProdUniform: 'Korp. forma',
    footerProdPromo: 'Promo-kiyim',
    footerProdWorkwear: 'Maxsus kiyim',
    footerProdGifts: 'Biznes-sovgʻalar',
    footerProdMerch: 'Merch',
    footerColCompany: 'Kompaniya',
    footerCompWhyUs: 'Nima uchun biz',
    footerCompProcess: 'Jarayon',
    footerCompCases: 'Keyslar',
    footerCompPrices: 'Narxlar',
    footerColContacts: 'Aloqa',
    footerContactCity: 'Toshkent, Chilonzor',
    footerColForClients: 'Mijozlar uchun',
    footerClientQuote: 'Tijoriy taklif olish',
    footerClientContract: 'Shartnoma va toʻlov',
    footerCopyright: '© 2026 Folk Print. Logotipli korporativ kiyim.',
  },
}

export default function B2B() {
  const { lang } = useLang()
  const t = STR[lang]
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuClosing, setMenuClosing] = useState(false)
  const [sent, setSent] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showCta, setShowCta] = useState(false)
  const casesRef = useRef(null)
  const scrollCases = (dir) => {
    const el = casesRef.current
    if (!el) return
    const card = el.querySelector('figure')
    const step = card ? card.offsetWidth + 16 : 320
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
        // show the sticky CTA after the hero, but hide it once the big CTA / footer is reached
        const ctaEl = document.getElementById('cta')
        const ctaReached = ctaEl && ctaEl.getBoundingClientRect().top < window.innerHeight - 80
        setShowCta(window.scrollY > 560 && !ctaReached)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  const stat2014 = useCountUp(2014)
  const stat500 = useCountUp(500)
  const stat1 = useCountUp(1)
  const stat3 = useCountUp(24)

  const uz = lang === 'uz'
  const CASES = [
    { photo: '/photos/case-korzinka.jpg', slot: t.caseRetailSlot, tag: t.caseRetailTag, volume: t.caseRetailVolume, title: t.caseRetailTitle, desc: t.caseRetailDesc },
    { photo: '/photos/case-forum.jpg', slot: t.caseEventSlot, tag: t.caseEventTag, volume: t.caseEventVolume, title: t.caseEventTitle, desc: t.caseEventDesc },
    { photo: '/photos/case-itpark.jpg', slot: t.caseItSlot, tag: t.caseItTag, volume: t.caseItVolume, title: t.caseItTitle, desc: t.caseItDesc },
    { photo: '/photos/case-gifts-kpmg.jpg', slot: 'кейс', tag: 'HR', volume: uz ? '350 ta toʻplam' : '350 наборов', title: uz ? 'Sovgʻalar xodimlarga' : 'Подарки для сотрудников', desc: uz ? 'Yangi yilga brendlangan bokslar — masofaviy jamoa uchun.' : 'Брендированные боксы к Новому году для распределённой команды.' },
    { photo: '/photos/case-promo.jpg', slot: 'кейс', tag: uz ? 'Marketpleys' : 'Маркетплейс', volume: uz ? '5 000 dona' : '5 000 изделий', title: uz ? 'Aksiya uchun merch' : 'Мерч для распродажи', desc: uz ? 'Kuryerlar va punktlarga futbolka va kepkalar — yirik aksiyaga.' : 'Футболки и кепки курьерам и пунктам выдачи к большой акции.' },
    { photo: '/photos/case-workwear-tmk.jpg', slot: 'кейс', tag: uz ? 'Ishlab chiqarish' : 'Производство', volume: uz ? '900 dona' : '900 изделий', title: uz ? 'Zavod uchun maxsus kiyim' : 'Спецодежда для завода', desc: uz ? 'Logotip va svetootražatel bilan jiletlar va kurtkalar.' : 'Жилеты и куртки со светоотражателями и логотипом по цехам.' },
  ]

  return (
    <>
      <style>{`
        .b2b-nav-link:hover{color:#C97A14}
        .b2b-cta-pill:hover{background:#F0951F}
        .b2b-switch-personal:hover{color:#15120D}
        @media (max-width:460px){.aud-seg{padding:7px 13px!important;font-size:12px!important;letter-spacing:.02em!important}}
        .b2b-hero-dark:hover{background:#000}
        .b2b-hero-outline:hover{background:#FCAC45;border-color:#FCAC45;color:#15120D}
        .b2b-card-hover:hover{transform:translateY(-5px);box-shadow:0 18px 40px rgba(21,18,13,.10)}
        .b2b-prices-dark:hover{background:#000}
        .b2b-cta-dark:hover{background:#000}
        .b2b-badge-chip{animation:b2bChip 3s ease-in-out infinite;transition:transform .2s var(--fp-ease-out)}
        .b2b-badge-chip:hover{transform:translateY(-1px) scale(1.06)}
        .b2b-num-chip{transition:transform .2s var(--fp-ease-out),box-shadow .2s var(--fp-ease-out)}
        .fp-pressable:hover .b2b-num-chip{transform:translateY(-2px) scale(1.05)}
        @keyframes b2bChip{0%,100%{box-shadow:0 3px 10px rgba(240,149,31,.4)}50%{box-shadow:0 5px 20px rgba(240,149,31,.72)}}
        .b2b-sticky-cta{display:none}
        .b2b-fab-phone{display:none}
        .b2b-head-phone{display:inline-flex}
        @media (max-width:1023px){.b2b-head-phone{display:none !important}}
        @keyframes fabPing{0%{transform:scale(1);opacity:.6}70%,100%{transform:scale(1.5);opacity:0}}
        @media (max-width:880px){
          .b2b-sticky-cta{position:fixed;left:14px;right:14px;bottom:calc(14px + env(safe-area-inset-bottom));z-index:60;display:flex;align-items:center;justify-content:center;gap:8px;background:#FCAC45;color:#15120D;font-weight:700;font-size:16px;padding:15px 22px;border-radius:999px;box-shadow:0 12px 30px rgba(21,18,13,.30);text-decoration:none;transform:translateY(0);opacity:1;transition:transform .42s var(--fp-ease-spring),opacity .3s ease}
          .b2b-sticky-cta.show{transform:translateY(0);opacity:1}
          .b2b-fab-phone{position:fixed;right:22px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:61;width:60px;height:60px;border-radius:999px;display:grid;place-items:center;background:#15120D;color:#FCAC45;box-shadow:0 12px 30px rgba(21,18,13,.4);text-decoration:none;transform:translateY(0) scale(1);opacity:1;transition:transform .42s var(--fp-ease-spring),opacity .3s ease}
          .b2b-fab-phone.show{transform:translateY(0) scale(1);opacity:1}
          .b2b-fab-phone::after{content:'';position:absolute;inset:0;border-radius:999px;border:2px solid rgba(252,172,69,.7);animation:fabPing 2s ease-out infinite;pointer-events:none}
        }
        .b2b-tg:hover{background:#000}
        .b2b-contact-outline:hover{background:#15120D;color:#F5EFE5 !important}
        .b2b-submit:hover{background:#F0951F}
        .b2b-foot-link:hover{color:#FCAC45}

        /* catalog bento — controlled 6-col, flagship spans 4 */
        .b2b-bento{display:grid;grid-template-columns:repeat(6,1fr);gap:16px}
        .b2b-bento .sp4{grid-column:span 4}
        .b2b-bento .sp2{grid-column:span 2}
        /* advantages spec-sheet — 3 cells per row, hairline dividers */
        .b2b-spec{display:grid;grid-template-columns:repeat(3,1fr)}
        .b2b-spec > div{border-right:1px solid rgba(245,239,229,.12);border-bottom:1px solid rgba(245,239,229,.12)}
        .b2b-spec > div:nth-child(3n){border-right:0}
        .b2b-spec > div:nth-last-child(-n+3){border-bottom:0}
        /* advantages — richer motion */
        .b2b-spec > div{position:relative;isolation:isolate;transition:background .3s var(--fp-ease-out)}
        .b2b-spec > div::before{content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:0;background:radial-gradient(130% 120% at 50% -10%,rgba(252,172,69,.14),transparent 60%);transition:opacity .4s var(--fp-ease-out)}
        .b2b-spec > div:hover{background:rgba(252,172,69,.05)}
        .b2b-spec > div:hover::before{opacity:1}
        .b2b-why-ic{transition:transform .4s var(--fp-ease-spring),background .3s var(--fp-ease-out),box-shadow .4s var(--fp-ease-out)}
        .b2b-why-ic svg{transition:transform .4s var(--fp-ease-out)}
        .b2b-spec > div:hover .b2b-why-ic{transform:translateY(-3px) scale(1.14) rotate(-6deg);background:rgba(252,172,69,.3);box-shadow:0 12px 26px -10px rgba(252,172,69,.6)}
        .b2b-spec > div:hover .b2b-why-ic svg{animation:b2bIcWiggle .55s var(--fp-ease-out)}
        @keyframes b2bIcWiggle{0%,100%{transform:none}30%{transform:rotate(9deg) scale(1.05)}65%{transform:rotate(-6deg)}}
        .b2b-spec > div h3{transition:transform .3s var(--fp-ease-out)}
        .b2b-spec > div:hover h3{transform:translateX(4px)}
        .b2b-spec.is-in > div:not(.b2b-adv-feat) .b2b-why-ic{animation:b2bIcPop .6s var(--fp-ease-spring) backwards;animation-delay:calc(var(--d,0ms) + 90ms)}
        @keyframes b2bIcPop{0%{opacity:0;transform:scale(.5) rotate(-12deg)}100%{opacity:1;transform:none}}
        .b2b-adv-feat .b2b-why-ic{animation:b2bFeatPulse 2.8s var(--fp-ease) 1s infinite}
        @keyframes b2bFeatPulse{0%,100%{box-shadow:0 0 0 0 rgba(252,172,69,0)}50%{box-shadow:0 0 0 5px rgba(252,172,69,.13),0 10px 26px -8px rgba(252,172,69,.55)}}
        @media (prefers-reduced-motion: reduce){.b2b-spec.is-in > div .b2b-why-ic,.b2b-adv-feat .b2b-why-ic{animation:none!important}}
        /* how-we-work (B2B) — light-card motion */
        .b2b-grid-collapse > div{transition:transform .35s var(--fp-ease-out),border-color .3s var(--fp-ease-out),box-shadow .35s var(--fp-ease-out)}
        .b2b-grid-collapse > div:hover{transform:translateY(-6px);border-color:#FCAC45;box-shadow:0 18px 38px -18px rgba(240,149,31,.55)}
        .b2b-hiw-num{display:inline-block;transition:transform .35s var(--fp-ease-spring)}
        .b2b-grid-collapse > div:hover .b2b-hiw-num{transform:translateY(-2px) scale(1.12)}
        .b2b-hiw-ic{transition:transform .4s var(--fp-ease-spring),background .3s var(--fp-ease-out),color .3s var(--fp-ease-out),border-color .3s var(--fp-ease-out)}
        .b2b-grid-collapse > div:hover .b2b-hiw-ic{transform:scale(1.12) rotate(-8deg);background:#FCAC45;border-color:#FCAC45;color:#15120D}
        .b2b-grid-collapse > div:last-child:hover .b2b-hiw-ic{background:#15120D;border-color:#15120D;color:#FCAC45}
        .b2b-grid-collapse.is-in .b2b-hiw-ic{animation:b2bIcPop2 .55s var(--fp-ease-spring) backwards;animation-delay:calc(var(--d,0ms) + 140ms)}
        @keyframes b2bIcPop2{0%{opacity:0;transform:scale(.4) rotate(-15deg)}60%{opacity:1}100%{transform:none}}
        .b2b-grid-collapse > div:last-child{position:relative;overflow:hidden}
        .b2b-grid-collapse > div:last-child > div{position:relative;z-index:1}
        .b2b-grid-collapse > div:last-child::after{content:'';position:absolute;top:-60%;height:220%;width:38%;left:-45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);transform:rotate(9deg);pointer-events:none;animation:b2bHowSheen 5s var(--fp-ease) 1.6s infinite}
        @keyframes b2bHowSheen{0%{left:-45%}22%{left:135%}100%{left:135%}}
        @media (prefers-reduced-motion: reduce){.b2b-grid-collapse.is-in .b2b-hiw-ic,.b2b-grid-collapse > div:last-child::after{animation:none!important}}
        /* methods — balanced 3×2 */
        .b2b-methods{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
        .b2b-method:hover{border-color:#FCAC45;background:#FFFDF8;transform:translateY(-5px);box-shadow:0 16px 32px rgba(21,18,13,.11)}
        /* methods hub — центр-слово, карточки вокруг, стрелки к центру */
        .mh-card{position:relative}
        .b2b-mhub{display:grid;grid-template-columns:minmax(0,1fr) clamp(180px,20vw,246px) minmax(0,1fr);grid-template-rows:auto auto;gap:22px 40px;align-items:stretch}
        .b2b-mhub .mh-c1{grid-column:1;grid-row:1;justify-self:end}
        .b2b-mhub .mh-c2{grid-column:3;grid-row:1;justify-self:start}
        .b2b-mhub .mh-c3{grid-column:1;grid-row:2;justify-self:end}
        .b2b-mhub .mh-c4{grid-column:3;grid-row:2;justify-self:start}
        .b2b-mhub .mh-card{width:100%;max-width:340px}
        .b2b-mhub .mh-center{grid-column:2;grid-row:1 / span 2;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:12px}
        .mh-badge{display:inline-block;background:#15120D;color:#FCAC45;font-family:'Oswald',sans-serif;font-weight:600;font-size:12px;letter-spacing:.09em;text-transform:uppercase;padding:6px 13px;border-radius:999px}
        .mh-title{font-family:'Oswald',sans-serif;font-weight:700;text-transform:uppercase;font-size:clamp(22px,2.3vw,30px);line-height:.98;margin:0}
        .mh-sub{margin:0;color:#857B69;font-size:13.5px;line-height:1.5;max-width:220px}
        .mh-arrow{position:absolute;top:50%;z-index:3;line-height:0;pointer-events:none}
        .mh-a-tl,.mh-a-bl{right:-33px}
        .mh-a-tr,.mh-a-br{left:-33px}
        .mh-a-tl{transform:translateY(-50%) rotate(40deg);animation:mhArrTL 1.9s var(--fp-ease) infinite}
        .mh-a-tr{transform:translateY(-50%) rotate(140deg);animation:mhArrTR 1.9s var(--fp-ease) infinite}
        .mh-a-bl{transform:translateY(-50%) rotate(-40deg);animation:mhArrBL 1.9s var(--fp-ease) infinite}
        .mh-a-br{transform:translateY(-50%) rotate(220deg);animation:mhArrBR 1.9s var(--fp-ease) infinite}
        @keyframes mhArrTL{0%,100%{transform:translateY(-50%) rotate(40deg) translateX(0);opacity:.45}50%{transform:translateY(-50%) rotate(40deg) translateX(5px);opacity:1}}
        @keyframes mhArrTR{0%,100%{transform:translateY(-50%) rotate(140deg) translateX(0);opacity:.45}50%{transform:translateY(-50%) rotate(140deg) translateX(5px);opacity:1}}
        @keyframes mhArrBL{0%,100%{transform:translateY(-50%) rotate(-40deg) translateX(0);opacity:.45}50%{transform:translateY(-50%) rotate(-40deg) translateX(5px);opacity:1}}
        @keyframes mhArrBR{0%,100%{transform:translateY(-50%) rotate(220deg) translateX(0);opacity:.45}50%{transform:translateY(-50%) rotate(220deg) translateX(5px);opacity:1}}
        @media (max-width:760px){
          .b2b-mhub{grid-template-columns:1fr 1fr;grid-auto-rows:auto;gap:12px}
          .b2b-mhub .mh-center{grid-column:1 / -1;grid-row:1;gap:8px;margin-bottom:2px}
          .b2b-mhub .mh-c1{grid-column:1;grid-row:2;justify-self:stretch}
          .b2b-mhub .mh-c2{grid-column:2;grid-row:2;justify-self:stretch}
          .b2b-mhub .mh-c3{grid-column:1;grid-row:3;justify-self:stretch}
          .b2b-mhub .mh-c4{grid-column:2;grid-row:3;justify-self:stretch}
          .b2b-mhub .mh-card{max-width:none}
          .mh-arrow{display:none}
          .mh-sub{max-width:340px}
        }
        @media (prefers-reduced-motion: reduce){.mh-a-tl,.mh-a-tr,.mh-a-bl,.mh-a-br{animation:none!important}}
        .b2b-carousel-btn{width:46px;height:46px;border-radius:999px;border:1.5px solid #E7DECF;background:#fff;color:#15120D;display:grid;place-items:center;cursor:pointer;transition:background .2s,border-color .2s,color .2s,transform .2s}
        .b2b-carousel-btn:hover{background:#FCAC45;border-color:#FCAC45}
        .b2b-carousel-btn:active{transform:scale(.92)}
        .b2b-cases-track{scrollbar-width:none;-ms-overflow-style:none}
        .b2b-cases-track::-webkit-scrollbar{display:none}
        .b2b-case-card{transition:transform .25s var(--fp-ease-out),box-shadow .25s}
        .b2b-case-card:hover{transform:translateY(-4px);box-shadow:0 18px 38px rgba(21,18,13,.10)}
        @media (max-width:980px){
          .b2b-bento{grid-template-columns:repeat(2,1fr)}
          .b2b-bento .sp4{grid-column:span 2}
          .b2b-bento .sp2{grid-column:span 1}
        }
        @media (max-width:860px){
          .b2b-spec{grid-template-columns:repeat(2,1fr)}
          .b2b-spec > div:nth-child(3n){border-right:1px solid rgba(245,239,229,.12)}
          .b2b-spec > div:nth-child(2n){border-right:0}
          .b2b-spec > div:nth-last-child(-n+3){border-bottom:1px solid rgba(245,239,229,.12)}
          .b2b-spec > div:nth-last-child(-n+2){border-bottom:0}
        }
        @media (max-width:720px){ .b2b-methods{grid-template-columns:repeat(2,minmax(0,1fr))} }
        @media (max-width:600px){
          .b2b-bento{grid-template-columns:1fr}
          .b2b-bento .sp4,.b2b-bento .sp2{grid-column:auto}
          .b2b-spec{grid-template-columns:1fr}
          .b2b-spec > div{border-right:0 !important}
          .b2b-spec > div:not(:last-child){border-bottom:1px solid rgba(245,239,229,.12) !important}
          .b2b-methods{grid-template-columns:1fr}
        }

        .b2b-burger{display:none}
        @media (max-width:880px){
          .b2b-desktop-nav{display:none !important}
          .b2b-header-cta{display:none !important}
          .b2b-burger{display:grid !important}
          .b2b-header-row{gap:14px !important}
        }
        @media (max-width:760px){
          .b2b-grid-collapse{grid-template-columns:1fr !important}
          .b2b-span-reset{grid-column:auto !important}
          .b2b-card-split{flex-direction:column !important}
          .b2b-flag-img{aspect-ratio:16 / 10;min-height:0 !important;flex:0 0 auto !important}
          .b2b-row-wrap{flex-direction:column !important; align-items:flex-start !important}
          .b2b-section-pad{padding-left:18px !important; padding-right:18px !important}
          .b2b-full-btn{width:100% !important; justify-content:center !important}
          .b2b-hero-h1{font-size:clamp(23px,6vw,56px) !important}
          .b2b-h2{font-size:clamp(24px,6.2vw,42px) !important}
          .b2b-cta-h2{font-size:clamp(27px,8vw,52px) !important}
          .b2b-foot-cols{gap:26px !important}
        }
      `}</style>

      <div id="top" data-screen-label={t.screenLabel} style={{ background: '#F5EFE5', color: '#15120D', fontFamily: "'Manrope',system-ui,sans-serif", minHeight: '100vh', overflowX: 'clip', position: 'relative' }}>

        <header style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(245,239,229,.94)' : 'rgba(245,239,229,.82)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(21,18,13,.08)', boxShadow: scrolled ? '0 8px 26px rgba(21,18,13,.10)' : '0 0 0 rgba(21,18,13,0)', transition: 'background var(--fp-dur) var(--fp-ease), box-shadow var(--fp-dur) var(--fp-ease)' }}>
          <div className="b2b-header-row" style={{ maxWidth: '1300px', margin: '0 auto', padding: scrolled ? '8px 26px' : '14px 26px', display: 'flex', alignItems: 'center', gap: '22px', transition: 'padding var(--fp-dur) var(--fp-ease)' }}>
            <a href="#top" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none', color: '#15120D' }}><Logo variant="black" height={34} /><span className="b2b-badge-chip" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#FCAC45,#F0951F)', color: '#15120D', fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '.08em', padding: '3px 8px 2px', borderRadius: '7px', lineHeight: 1 }}>B2B</span></a>
            <nav className="b2b-desktop-nav" style={{ display: 'flex', gap: '22px', marginLeft: '14px', flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#catalog" className="b2b-nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navProducts}</a>
              <a href="#why" className="b2b-nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navWhyUs}</a>
              <a href="#how" className="b2b-nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navProcess}</a>
              <a href="#cases" className="b2b-nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navCases}</a>
              <a href="#contacts" className="b2b-nav-link fp-pressable" style={{ color: '#15120D', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>{t.navContacts}</a>
            </nav>
            <LangToggle style={{ marginLeft: 'auto' }} />
            <a href={telHref()} aria-label={brand.phone} className="b2b-head-phone fp-pressable" style={{ alignItems: 'center', gap: '9px', textDecoration: 'none', color: '#15120D', fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: '18px', letterSpacing: '.02em', whiteSpace: 'nowrap' }}><span style={{ display: 'grid', placeItems: 'center', width: '31px', height: '31px', borderRadius: '999px', background: '#15120D', color: '#FCAC45', flex: 'none' }}><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z"/></svg></span>{brand.phone}</a>
            <a href="#zayavka" className="b2b-cta-pill b2b-header-cta fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '15px', padding: '12px 20px', borderRadius: '999px', textDecoration: 'none', whiteSpace: 'nowrap' }}>{t.headerCtaQuote} <span>↗</span></a>
            <button onClick={() => setMenuOpen(true)} aria-label={t.burgerAriaMenu} className="b2b-burger fp-pressable" style={{ flex: 'none', width: '46px', height: '46px', borderRadius: '999px', border: '1px solid rgba(21,18,13,.18)', background: '#fff', placeItems: 'center', cursor: 'pointer' }}>
              <span style={{ display: 'block', width: '18px', height: '2px', background: '#15120D', boxShadow: '0 6px 0 #15120D,0 -6px 0 #15120D' }}></span>
            </button>
          </div>
        </header>

        {menuOpen && (
          <>
            <div onClick={closeMenu} style={{ position: 'fixed', inset: 0, zIndex: 89, background: 'rgba(21,18,13,.4)', animation: menuClosing ? 'fpFadeOut .2s ease both' : 'fpMenuIn .22s ease both' }}></div>
            <div className={menuClosing ? '' : 'fp-menu-in'} style={{ position: 'fixed', inset: 0, zIndex: 90, background: '#15120D', color: '#F5EFE5', padding: '26px', display: 'flex', flexDirection: 'column', animation: menuClosing ? 'fpFadeOut .2s ease both' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Logo variant="amber" height={30} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <LangToggle tone="dark" />
                  <button onClick={closeMenu} aria-label={t.mobileCloseAria} className="fp-pressable" style={{ width: '46px', height: '46px', borderRadius: '999px', border: '1px solid rgba(245,239,229,.25)', background: 'transparent', color: '#F5EFE5', fontSize: '22px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              <nav style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['#catalog', '#why', '#how', '#cases', '#contacts'].map((href, i) => (
                  <a key={href} onClick={closeMenu} href={href} style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '36px', color: '#F5EFE5', textDecoration: 'none', animation: menuClosing ? undefined : 'fpInUp .5s both', animationDelay: menuClosing ? undefined : (i * 40) + 'ms', '--d': (i * 40) + 'ms' }}>{[t.mobileNavProducts, t.mobileNavWhyUs, t.mobileNavProcess, t.mobileNavCases, t.mobileNavContacts][i]}</a>
                ))}
              </nav>
              <a onClick={closeMenu} href="#zayavka" className="fp-pressable" style={{ marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '18px', padding: '18px', borderRadius: '999px', textDecoration: 'none' }}>{t.mobileCtaQuote}</a>
            </div>
          </>
        )}

        {/* sticky mobile CTA — slides up on scroll. Portaled to <body> so it isn't
            trapped by the .fp-route transform (which would turn fixed→absolute). */}
        {typeof document !== 'undefined' && createPortal(
          <a href="#zayavka" className={'b2b-sticky-cta fp-pressable' + (showCta ? ' show' : '')}>{t.headerCtaQuote} <span aria-hidden="true">↗</span></a>,
          document.body
        )}

        {/* mobile round call button — floats above the sticky «Получить КП», right side */}
        {typeof document !== 'undefined' && createPortal(
          <a href={telHref()} aria-label={uz ? 'Qoʻngʻiroq qilish' : 'Позвонить'} className={'b2b-fab-phone fp-pressable' + (showCta ? ' show' : '')}>
            <svg width="27" height="27" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ position: 'relative', zIndex: 1 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
          </a>,
          document.body
        )}

        {/* ============ HERO ============ */}
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: 'clamp(28px,4vw,56px) 26px clamp(34px,4vw,56px)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,4vw,56px)', alignItems: 'stretch' }}>
              <div style={{ flex: '1 1 460px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '8px' }}>
                <div style={{ display: 'inline-flex', gap: '5px', background: '#fff', border: '1px solid #E7DECF', borderRadius: '999px', padding: '5px', width: 'max-content', animation: 'fpInUp .8s 0s both' }}>
                  <span className="aud-seg" style={{ background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '13px', padding: '8px 18px', borderRadius: '999px', letterSpacing: '.05em' }}>{t.switchBusiness}</span>
                  <Link to="/lichnoe" className="b2b-switch-personal fp-pressable aud-seg" style={{ color: '#988E7B', fontWeight: 700, fontSize: '13px', padding: '8px 18px', borderRadius: '999px', letterSpacing: '.05em', textDecoration: 'none' }}>{t.switchPersonal}</Link>
                </div>

                <h1 className="b2b-hero-h1" style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(42px,6vw,96px)', lineHeight: '.9', letterSpacing: '-.01em', margin: 0, animation: 'fpInUp .8s .08s both' }}><span style={{ position: 'relative', display: 'inline-block' }}>{t.heroTitle}<svg viewBox="0 0 460 30" style={{ position: 'absolute', left: 0, bottom: '-14px', width: '100%', height: '22px' }} fill="none"><path d="M6 18 C120 6 320 26 454 9" stroke="#F0951F" strokeWidth="7" strokeLinecap="round" strokeDasharray="520" strokeDashoffset="520" style={{ animation: 'fpDraw 1s .5s ease both' }} /></svg></span></h1>

                <p style={{ margin: 0, color: '#6F6655', fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.5, maxWidth: '460px', animation: 'fpInUp .8s .16s both' }}>{t.heroSubtitle}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '13px', animation: 'fpInUp .8s .24s both' }}>
                  <a href="#zayavka" className="b2b-hero-dark b2b-full-btn fp-pressable fp-cta-glow" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#15120D', color: '#F5EFE5', fontWeight: 700, fontSize: '16px', padding: '18px 28px', borderRadius: '999px', textDecoration: 'none' }}>{t.heroBtnCalc} <span>↗</span></a>
                  <a href="#catalog" className="b2b-hero-outline b2b-full-btn fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', border: '1.5px solid #15120D', color: '#15120D', fontWeight: 700, fontSize: '16px', padding: '16px 26px', borderRadius: '999px', textDecoration: 'none' }}>{t.heroBtnViewProducts}</a>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 30px', marginTop: '6px', paddingTop: '22px', borderTop: '1px solid rgba(21,18,13,.10)', animation: 'fpInUp .8s .32s both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 600, fontSize: '14px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="2"><path d="M4 7h16v13H4zM8 7V4h8v3" strokeLinejoin="round" /></svg>{t.heroTrustContract}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 600, fontSize: '14px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /></svg>{t.heroTrustQuality}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontWeight: 600, fontSize: '14px' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0951F" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg>{t.heroTrustUrgent}</div>
                </div>
              </div>

              <div style={{ flex: '1 1 460px', minWidth: '300px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-6px', left: '34px', zIndex: 3, width: '120px', height: '30px', background: 'rgba(21,18,13,.78)', transform: 'rotate(-4deg)', boxShadow: '0 4px 10px rgba(0,0,0,.18)', animation: 'fpFloatB 6s ease-in-out infinite' }}></div>
                <div style={{ position: 'relative', minHeight: 'clamp(380px,46vw,560px)', height: '100%', borderRadius: '18px', overflow: 'hidden', background: '#EBE2D2', animation: 'fpZoomIn .9s .12s both' }}>
                  <Slot priority src="/photos/team.jpg" label={t.heroSlotTeam} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
                </div>
                <a href="#cases" className="fp-pressable" style={{ position: 'absolute', left: '-14px', bottom: '34px', zIndex: 4, background: '#fff', borderRadius: '14px', padding: '14px 16px', boxShadow: '0 16px 36px rgba(0,0,0,.16)', display: 'flex', alignItems: 'center', gap: '12px', transform: 'rotate(-3deg)', animation: 'fpFloatA 5.5s ease-in-out infinite', textDecoration: 'none', color: '#15120D' }}>
                  <span style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '11px', background: '#15120D', color: '#FCAC45', display: 'grid', placeItems: 'center', fontFamily: "'Oswald'", fontWeight: 700, fontSize: '22px' }}>✓</span>
                  <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: '18px', lineHeight: 1 }}>{t.heroBadgeYourLogo} <span style={{ color: '#C97A14', fontSize: '13px' }}>↗</span></div><div style={{ color: '#857B69', fontSize: '12px' }}>{t.heroBadgeMethods}</div></div>
                </a>
                <div style={{ position: 'absolute', right: '8px', bottom: '14px', zIndex: 4, writingMode: 'vertical-rl', fontFamily: "'Oswald'", fontWeight: 600, letterSpacing: '.2em', fontSize: '13px', color: 'rgba(245,239,229,.92)', textTransform: 'uppercase' }}>{t.heroVerticalLabel}</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ STATS / TRUST BAND ============ */}
        <section style={{ background: '#15120D', color: '#F5EFE5' }}>
          <Reveal stagger style={{ maxWidth: '1300px', margin: '0 auto', padding: 'clamp(30px,3.4vw,46px) 26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', '--d': '0ms' }}><span ref={stat2014.ref} style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 'clamp(40px,4.4vw,60px)', lineHeight: 1, color: '#FCAC45' }}>{stat2014.value}</span><span style={{ color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.4 }}>{t.statYearLabel}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', '--d': '70ms' }}><span ref={stat500.ref} style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 'clamp(40px,4.4vw,60px)', lineHeight: 1, color: '#FCAC45' }}>{stat500.value}+</span><span style={{ color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.4 }}>{t.statClientsLabel}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', '--d': '140ms' }}><span ref={stat1.ref} style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 'clamp(40px,4.4vw,60px)', lineHeight: 1, color: '#FCAC45' }}>{stat1.value}{t.statItemsSuffix}</span><span style={{ color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.4 }}>{t.statItemsLabel}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', '--d': '210ms' }}><span ref={stat3.ref} style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 'clamp(40px,4.4vw,60px)', lineHeight: 1, color: '#FCAC45' }}>{stat3.value}{t.statDaysSuffix}</span><span style={{ color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.4 }}>{t.statDaysLabel}</span></div>
          </Reveal>
        </section>

        {/* ============ PRODUCTS / CATALOG ============ */}
        <section id="catalog" style={{ padding: 'clamp(40px,4vw,68px) 0 clamp(28px,3vw,44px)' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '18px', marginBottom: '34px' }}>
              <div>
                <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(24px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.catalogTitle}</h2>
                <p style={{ margin: '16px 0 0', color: '#6F6655', fontSize: '16px', lineHeight: 1.5, maxWidth: '440px' }}>{t.catalogSubtitle}</p>
              </div>
              <a href="#zayavka" className="fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '15px', color: '#15120D', textDecoration: 'none', borderBottom: '2px solid #FCAC45', paddingBottom: '3px', marginBottom: '6px' }}>{t.catalogRequestCatalog}</a>
            </Reveal>
            <Reveal stagger className="b2b-bento">
              {/* flagship — Корпоративная форма (sp4, horizontal split) */}
              <a href="#zayavka" className="b2b-card-hover b2b-card-split sp4" style={{ '--d': '0ms', minWidth: 0, background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', transition: 'transform .2s, box-shadow .2s' }}>
                <div className="b2b-flag-img" style={{ flex: '1.15 1 0', position: 'relative', background: '#EBE2D2', minHeight: '300px' }}>
                  <Slot src="/photos/catalog-forma.jpg" label={t.catalogSlotUniform} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />                </div>
                <div style={{ flex: '1 1 0', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '9px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.05em', color: '#C97A14' }}><span style={{ width: '6px', height: '6px', borderRadius: '999px', background: '#FCAC45' }} />{t.catalogFlagshipTag}</span>
                  <h3 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: '27px', margin: 0, lineHeight: 1 }}>{t.catalogUniformTitle}</h3>
                  <p style={{ margin: 0, color: '#857B69', fontSize: '14.5px', lineHeight: 1.5 }}>{t.catalogUniformDesc}</p>
                  <span style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>{t.catalogMore} <span style={{ width: '30px', height: '30px', borderRadius: '999px', background: '#FCAC45', display: 'grid', placeItems: 'center' }}>→</span></span>
                </div>
              </a>
              {/* promo — sp2 */}
              <a href="#zayavka" className="b2b-card-hover sp2" style={{ '--d': '70ms', minWidth: 0, background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#EBE2D2' }}>
                  <Slot src="/photos/promo.jpg" label={t.catalogSlotPromo} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />                </div>
                <div style={{ padding: '16px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '20px', margin: '0 0 4px' }}>{t.catalogPromoTitle}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '13px', lineHeight: 1.4 }}>{t.catalogPromoDesc}</p></div>
              </a>
              {/* workwear — sp2 */}
              <a href="#zayavka" className="b2b-card-hover sp2" style={{ '--d': '140ms', minWidth: 0, background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#EBE2D2' }}>
                  <Slot src="/photos/specodezhda-set.jpg" label={t.catalogSlotWorkwear} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />                </div>
                <div style={{ padding: '16px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '20px', margin: '0 0 4px' }}>{t.catalogWorkwearTitle}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '13px', lineHeight: 1.4 }}>{t.catalogWorkwearDesc}</p></div>
              </a>
              {/* gifts — sp2 */}
              <a href="#zayavka" className="b2b-card-hover sp2" style={{ '--d': '210ms', minWidth: 0, background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#EBE2D2' }}>
                  <Slot src="/photos/podarki-box.jpg" label={t.catalogSlotGifts} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />                </div>
                <div style={{ padding: '16px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '20px', margin: '0 0 4px' }}>{t.catalogGiftsTitle}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '13px', lineHeight: 1.4 }}>{t.catalogGiftsDesc}</p></div>
              </a>
              {/* merch — sp2 */}
              <a href="#zayavka" className="b2b-card-hover sp2" style={{ '--d': '280ms', minWidth: 0, background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden', textDecoration: 'none', color: '#15120D', display: 'flex', flexDirection: 'column', transition: 'transform .2s, box-shadow .2s' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 3', background: '#EBE2D2' }}>
                  <Slot src="/photos/catalog-merch.jpg" label={t.catalogSlotMerch} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />                </div>
                <div style={{ padding: '16px' }}><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '20px', margin: '0 0 4px' }}>{t.catalogMerchTitle}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '13px', lineHeight: 1.4 }}>{t.catalogMerchDesc}</p></div>
              </a>
            </Reveal>
          </div>
        </section>

        {/* ============ ADVANTAGES ============ */}
        <section id="why" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '18px', marginBottom: '34px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(24px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.whyTitle}</h2>
              <span style={{ fontFamily: "'Caveat'", fontWeight: 700, fontSize: '32px', color: '#15120D', lineHeight: '.9', marginBottom: '6px' }}>{t.whyAccent}</span>
            </Reveal>
            <div style={{ background: '#15120D', color: '#F5EFE5', border: '1px solid #15120D', borderRadius: '24px', overflow: 'hidden' }}>
              <Reveal stagger as="div" className="b2b-spec">
                <div style={{ '--d': '0ms', padding: 'clamp(20px,2.4vw,30px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="b2b-why-ic" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(252,172,69,.16)', display: 'grid', placeItems: 'center' }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#FCAC45" strokeWidth="2"><path d="M6 2h9l5 5v15H6z" strokeLinejoin="round" /><path d="M14 2v6h6M9 13h6M9 17h6" strokeLinecap="round" /></svg></span>
                  <h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: 0 }}>{t.whyContractTitle}</h3>
                  <p style={{ margin: 0, color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.5 }}>{t.whyContractDesc}</p>
                </div>
                <div style={{ '--d': '70ms', padding: 'clamp(20px,2.4vw,30px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="b2b-why-ic" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(252,172,69,.16)', display: 'grid', placeItems: 'center' }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#FCAC45" strokeWidth="2"><path d="M2 21V8l6 4V8l6 4V5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v16z" strokeLinejoin="round" /><path d="M6 17h.01M11 17h.01M16 17h.01" strokeLinecap="round" /></svg></span>
                  <h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: 0 }}>{t.whyDocsTitle}</h3>
                  <p style={{ margin: 0, color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.5 }}>{t.whyDocsDesc}</p>
                </div>
                <div style={{ '--d': '140ms', padding: 'clamp(20px,2.4vw,30px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="b2b-why-ic" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(252,172,69,.16)', display: 'grid', placeItems: 'center' }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#FCAC45" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" /></svg></span>
                  <h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: 0 }}>{t.whyManagerTitle}</h3>
                  <p style={{ margin: 0, color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.5 }}>{t.whyManagerDesc}</p>
                </div>
                <div style={{ '--d': '210ms', padding: 'clamp(20px,2.4vw,30px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="b2b-why-ic" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(252,172,69,.16)', display: 'grid', placeItems: 'center' }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#FCAC45" strokeWidth="2"><path d="M3 7l5-4 4 3 4-3 5 4v10l-5 4-4-3-4 3-5-4z" strokeLinejoin="round" /><circle cx="12" cy="11" r="2.5" /></svg></span>
                  <h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: 0 }}>{t.whySampleTitle}</h3>
                  <p style={{ margin: 0, color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.5 }}>{t.whySampleDesc}</p>
                </div>
                <div style={{ '--d': '280ms', padding: 'clamp(20px,2.4vw,30px)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span className="b2b-why-ic" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(252,172,69,.16)', display: 'grid', placeItems: 'center' }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#FCAC45" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                  <h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: 0 }}>{t.whyQualityTitle}</h3>
                  <p style={{ margin: 0, color: 'rgba(245,239,229,.6)', fontSize: '14px', lineHeight: 1.5 }}>{t.whyQualityDesc}</p>
                </div>
                <div className="b2b-adv-feat" style={{ '--d': '350ms', padding: 'clamp(20px,2.4vw,30px)', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'radial-gradient(120% 100% at 100% 0,rgba(252,172,69,.12),transparent 60%)', pointerEvents: 'none' }} />
                  <span className="b2b-why-ic" style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(252,172,69,.22)', display: 'grid', placeItems: 'center', position: 'relative' }}><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#FCAC45" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" strokeLinecap="round" /></svg></span>
                  <h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: 0, color: '#FCAC45', position: 'relative' }}>{t.whyVolumeTitle}</h3>
                  <p style={{ margin: 0, color: 'rgba(245,239,229,.7)', fontSize: '14px', lineHeight: 1.5, position: 'relative' }}>{t.whyVolumeDesc}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section id="how" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '18px', marginBottom: '38px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(24px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.howTitle}</h2>
              <p style={{ margin: '0 0 6px', color: '#6F6655', fontSize: '16px', lineHeight: 1.5, maxWidth: '360px' }}>{t.howSubtitle}</p>
            </Reveal>
            <Reveal stagger className="b2b-grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '14px' }}>
              <div style={{ '--d': '0ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="b2b-hiw-num" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '40px', lineHeight: 1, color: '#FCAC45' }}>01</span><span className="b2b-hiw-ic" style={{ width: '38px', height: '38px', borderRadius: '999px', border: '1.5px solid #E7DECF', display: 'grid', placeItems: 'center', color: '#C97A14' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16v11H7l-3 3z" strokeLinejoin="round" /></svg></span></div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep1Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.45 }}>{t.howStep1Desc}</p></div>
              </div>
              <div style={{ '--d': '70ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="b2b-hiw-num" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '40px', lineHeight: 1, color: '#FCAC45' }}>02</span><span className="b2b-hiw-ic" style={{ width: '38px', height: '38px', borderRadius: '999px', border: '1.5px solid #E7DECF', display: 'grid', placeItems: 'center', color: '#C97A14' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 9h8M8 13h8" strokeLinecap="round" /></svg></span></div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep2Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.45 }}>{t.howStep2Desc}</p></div>
              </div>
              <div style={{ '--d': '140ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="b2b-hiw-num" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '40px', lineHeight: 1, color: '#FCAC45' }}>03</span><span className="b2b-hiw-ic" style={{ width: '38px', height: '38px', borderRadius: '999px', border: '1.5px solid #E7DECF', display: 'grid', placeItems: 'center', color: '#C97A14' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg></span></div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep3Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.45 }}>{t.howStep3Desc}</p></div>
              </div>
              <div style={{ '--d': '210ms', background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="b2b-hiw-num" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '40px', lineHeight: 1, color: '#FCAC45' }}>04</span><span className="b2b-hiw-ic" style={{ width: '38px', height: '38px', borderRadius: '999px', border: '1.5px solid #E7DECF', display: 'grid', placeItems: 'center', color: '#C97A14' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7h13v10H3zM16 10h3l2 3v4h-5" strokeLinejoin="round" /><circle cx="7" cy="18" r="1.8" /><circle cx="18" cy="18" r="1.8" /></svg></span></div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px' }}>{t.howStep4Title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.45 }}>{t.howStep4Desc}</p></div>
              </div>
              <div style={{ '--d': '280ms', background: '#FCAC45', border: '1px solid #FCAC45', borderRadius: '18px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span className="b2b-hiw-num" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: '40px', lineHeight: 1, color: '#15120D' }}>05</span><span className="b2b-hiw-ic" style={{ width: '38px', height: '38px', borderRadius: '999px', border: '1.5px solid rgba(21,18,13,.25)', display: 'grid', placeItems: 'center', color: '#15120D' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l9-5 9 5v8l-9 5-9-5z" strokeLinejoin="round" /><path d="M3 8l9 5 9-5M12 13v8" /></svg></span></div>
                <div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '18px', margin: '0 0 5px', color: '#15120D' }}>{t.howStep5Title}</h3><p style={{ margin: 0, color: '#5B4A24', fontSize: '14px', lineHeight: 1.45 }}>{t.howStep5Desc}</p></div>
              </div>
            </Reveal>

            {/* techniques — hub */}
            <Reveal className="b2b-mhub" style={{ marginTop: '32px', background: 'linear-gradient(140deg,#FFFDF9 0%, #F3E9D6 100%)', border: '1px solid #EEE2CE', borderRadius: '24px', padding: 'clamp(22px,2.8vw,40px)', boxShadow: '0 20px 50px -30px rgba(21,18,13,.28)' }}>
              <div className="b2b-method mh-card mh-c1" style={{ background: '#fff', border: '1px solid #EDE5D6', borderRadius: '14px', padding: '16px', transition: 'border-color .18s, background .18s, transform .28s var(--fp-ease-out), box-shadow .28s' }}>
                <span className="mh-arrow mh-a-tl" aria-hidden="true"><svg width="28" height="14" viewBox="0 0 28 14" fill="none"><path d="M1 7h24M19 2l6 5-6 5" stroke="#F0951F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '10px', overflow: 'hidden', background: '#EBE2D2', marginBottom: '12px' }}><Slot src="/photos/vyshivka.jpg" label={t.methodEmbroideryTitle} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '16px' }}>{t.methodEmbroideryTitle}</div><div style={{ color: '#857B69', fontSize: '12.5px', marginTop: '2px' }}>{t.methodEmbroideryDesc}</div>
              </div>
              <div className="mh-center">
                <span className="mh-badge">{uz ? '4 usul' : '4 технологии'}</span>
                <h3 className="mh-title">{t.methodsTitle}</h3>
                <p className="mh-sub">{t.methodsDesc}</p>
              </div>
              <div className="b2b-method mh-card mh-c2" style={{ background: '#fff', border: '1px solid #EDE5D6', borderRadius: '14px', padding: '16px', transition: 'border-color .18s, background .18s, transform .28s var(--fp-ease-out), box-shadow .28s' }}>
                <span className="mh-arrow mh-a-tr" aria-hidden="true"><svg width="28" height="14" viewBox="0 0 28 14" fill="none"><path d="M1 7h24M19 2l6 5-6 5" stroke="#F0951F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '10px', overflow: 'hidden', background: '#EBE2D2', marginBottom: '12px' }}><Slot src="/photos/dtf.jpg" label={t.methodDtfTitle} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '16px' }}>{t.methodDtfTitle}</div><div style={{ color: '#857B69', fontSize: '12.5px', marginTop: '2px' }}>{t.methodDtfDesc}</div>
              </div>
              <div className="b2b-method mh-card mh-c3" style={{ background: '#fff', border: '1px solid #EDE5D6', borderRadius: '14px', padding: '16px', transition: 'border-color .18s, background .18s, transform .28s var(--fp-ease-out), box-shadow .28s' }}>
                <span className="mh-arrow mh-a-bl" aria-hidden="true"><svg width="28" height="14" viewBox="0 0 28 14" fill="none"><path d="M1 7h24M19 2l6 5-6 5" stroke="#F0951F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '10px', overflow: 'hidden', background: '#EBE2D2', marginBottom: '12px' }}><Slot src="/photos/nashivka.jpg" label={t.methodChevronTitle} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '16px' }}>{t.methodChevronTitle}</div><div style={{ color: '#857B69', fontSize: '12.5px', marginTop: '2px' }}>{t.methodChevronDesc}</div>
              </div>
              <div className="b2b-method mh-card mh-c4" style={{ background: '#fff', border: '1px solid #EDE5D6', borderRadius: '14px', padding: '16px', transition: 'border-color .18s, background .18s, transform .28s var(--fp-ease-out), box-shadow .28s' }}>
                <span className="mh-arrow mh-a-br" aria-hidden="true"><svg width="28" height="14" viewBox="0 0 28 14" fill="none"><path d="M1 7h24M19 2l6 5-6 5" stroke="#F0951F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
                <div style={{ position: 'relative', aspectRatio: '4/3', borderRadius: '10px', overflow: 'hidden', background: '#EBE2D2', marginBottom: '12px' }}><Slot src="/photos/method-emboss.jpg" label={t.methodLaserTitle} radius={0} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '16px' }}>{t.methodLaserTitle}</div><div style={{ color: '#857B69', fontSize: '12.5px', marginTop: '2px' }}>{t.methodLaserDesc}</div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ============ CASES ============ */}
        <section id="cases" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px' }}>
            <Reveal style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '18px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(24px,3.6vw,52px)', lineHeight: '.94', margin: 0 }}>{t.casesTitle}</h2>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                <p style={{ margin: 0, color: '#6F6655', fontSize: '16px', lineHeight: 1.5, maxWidth: '360px' }}>{t.casesSubtitle}</p>
                <div style={{ display: 'flex', gap: '10px', flex: 'none' }}>
                  <button type="button" onClick={() => scrollCases(-1)} aria-label={uz ? 'Orqaga' : 'Назад'} className="b2b-carousel-btn fp-pressable"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 19l-7-7 7-7" /></svg></button>
                  <button type="button" onClick={() => scrollCases(1)} aria-label={uz ? 'Oldinga' : 'Вперёд'} className="b2b-carousel-btn fp-pressable"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg></button>
                </div>
              </div>
            </Reveal>
            <div ref={casesRef} className="b2b-cases-track" style={{ display: 'flex', gap: '16px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', paddingBottom: '6px' }}>
              {CASES.map((c, i) => (
                <figure key={i} className="b2b-case-card" style={{ flex: '0 0 clamp(258px, 78vw, 340px)', scrollSnapAlign: 'start', margin: 0, background: '#fff', border: '1px solid #E7DECF', borderRadius: '18px', overflow: 'hidden' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/3', background: '#EBE2D2' }}><Slot src={c.photo} label={c.slot} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div>
                  <figcaption style={{ padding: '18px' }}><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}><span style={{ background: '#FBEFD9', color: '#C97A14', fontWeight: 700, fontSize: '12px', padding: '5px 11px', borderRadius: '999px' }}>{c.tag}</span><span style={{ background: '#F2EADC', color: '#6F6655', fontWeight: 600, fontSize: '12px', padding: '5px 11px', borderRadius: '999px' }}>{c.volume}</span></div><h3 style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '20px', margin: '0 0 5px' }}>{c.title}</h3><p style={{ margin: 0, color: '#857B69', fontSize: '14px', lineHeight: 1.45 }}>{c.desc}</p></figcaption>
                </figure>
              ))}
            </div>

            <div style={{ marginTop: '44px', borderTop: '1px solid rgba(21,18,13,.10)', paddingTop: '26px' }}>
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
                <h2 className="b2b-cta-h2" style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(36px,4.6vw,76px)', lineHeight: '.9', margin: 0, color: '#15120D' }}>{t.ctaTitle}</h2>
                <p style={{ margin: '18px 0 26px', color: '#5B4A24', fontSize: '17px', lineHeight: 1.5, maxWidth: '440px' }}>{t.ctaSubtitle}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <a href="#zayavka" className="b2b-cta-dark fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#15120D', color: '#F5EFE5', fontWeight: 700, fontSize: '17px', padding: '18px 30px', borderRadius: '999px', textDecoration: 'none' }}>{t.ctaBtnQuote}</a>
                  <svg width="92" height="50" viewBox="0 0 92 50" fill="none"><path d="M86 40 C60 50 18 44 8 14" stroke="#15120D" strokeWidth="3.4" strokeLinecap="round" /><path d="M3 24 L8 12 L20 16" stroke="#15120D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
              <div style={{ flex: '1 1 320px', minWidth: '260px', position: 'relative', height: 'clamp(240px,26vw,300px)' }}>
                <div style={{ position: 'absolute', left: '2%', top: '14%', width: '42%', transform: 'rotate(-7deg)', background: '#fff', padding: '8px 8px 26px', borderRadius: '6px', boxShadow: '0 14px 30px rgba(0,0,0,.18)', animation: 'fpFloatC1 6s ease-in-out infinite' }}><div style={{ position: 'relative', aspectRatio: '3/4', background: '#EBE2D2', borderRadius: '3px', overflow: 'hidden' }}><Slot src="/photos/case-uzum.jpg" label={t.ctaSlotUniform} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div></div>
                <div style={{ position: 'absolute', left: '30%', top: '2%', width: '42%', transform: 'rotate(4deg)', background: '#fff', padding: '8px 8px 26px', borderRadius: '6px', boxShadow: '0 14px 30px rgba(0,0,0,.18)', zIndex: 2, animation: 'fpFloatC2 7s ease-in-out infinite .35s' }}><div style={{ position: 'relative', aspectRatio: '3/4', background: '#EBE2D2', borderRadius: '3px', overflow: 'hidden' }}><Slot src="/photos/case-ipak.jpg" label={t.ctaSlotMerch} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div></div>
                <div style={{ position: 'absolute', left: '58%', top: '18%', width: '42%', transform: 'rotate(-3deg)', background: '#fff', padding: '8px 8px 26px', borderRadius: '6px', boxShadow: '0 14px 30px rgba(0,0,0,.18)', animation: 'fpFloatC3 6.5s ease-in-out infinite .2s' }}><div style={{ position: 'relative', aspectRatio: '3/4', background: '#EBE2D2', borderRadius: '3px', overflow: 'hidden' }}><Slot src="/photos/case-artel.jpg" label={t.ctaSlotGifts} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} /></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CONTACTS ============ */}
        <section id="contacts" style={{ padding: 'clamp(36px,4vw,64px) 0' }}>
          <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 26px', display: 'flex', flexWrap: 'wrap', gap: 'clamp(28px,3vw,48px)' }}>
            <div style={{ flex: '1 1 380px', minWidth: '280px' }}>
              <h2 className="b2b-h2" style={{ fontFamily: "'Oswald'", fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(34px,4vw,60px)', lineHeight: '.92', margin: 0 }}>{t.contactsTitle}</h2>
              <p style={{ margin: '18px 0 28px', color: '#6F6655', fontSize: '17px', lineHeight: 1.5, maxWidth: '420px' }}>{t.contactsSubtitle}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '26px' }}>
                <a href={telHref()} className="fp-pressable" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', textDecoration: 'none', color: '#15120D' }}><span className="b2b-num-chip" style={{ flex: 'none', display: 'grid', placeItems: 'center', minWidth: '54px', height: '42px', padding: '0 12px', borderRadius: '12px', background: 'linear-gradient(135deg,#FCAC45,#F0951F)', color: '#15120D', fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '17px', letterSpacing: '.03em', lineHeight: 1, boxShadow: '0 4px 12px rgba(240,149,31,.42)' }}>B2B</span><span style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: '24px' }}>{brand.phone}</span><span style={{ color: '#857B69', fontWeight: 600, fontSize: '12.5px', background: '#fff', border: '1px solid #EDE5D6', borderRadius: '999px', padding: '4px 11px', whiteSpace: 'nowrap' }}>Менеджер</span></a>
                <a href={telHref(brand.phone2)} className="fp-pressable" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', textDecoration: 'none', color: '#15120D' }}><span className="b2b-num-chip" style={{ flex: 'none', display: 'grid', placeItems: 'center', minWidth: '54px', height: '42px', padding: '0 12px', borderRadius: '12px', background: '#15120D', color: '#FCAC45', fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '17px', letterSpacing: '.03em', lineHeight: 1, border: '1px solid #2A241A', boxShadow: '0 4px 12px rgba(21,18,13,.3)' }}>B2C</span><span style={{ fontFamily: "'Oswald'", fontWeight: 600, fontSize: '24px' }}>{brand.phone2}</span><span style={{ color: '#857B69', fontWeight: 600, fontSize: '12.5px', background: '#fff', border: '1px solid #EDE5D6', borderRadius: '999px', padding: '4px 11px', whiteSpace: 'nowrap' }}>Менеджер</span></a>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                <a href={tgHref()} className="b2b-tg fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#15120D', border: '1.5px solid #15120D', color: '#F5EFE5', fontWeight: 700, fontSize: '15px', padding: '11px 20px', borderRadius: '999px', textDecoration: 'none' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: 'none' }}><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.98-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg>{t.contactsTelegram}</a>                <a href={igHref()} className="b2b-contact-outline fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1.5px solid #15120D', color: '#15120D', fontWeight: 700, fontSize: '15px', padding: '11px 20px', borderRadius: '999px', textDecoration: 'none' }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flex: 'none' }}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>{t.contactsInstagram}</a>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginBottom: '18px' }}>
                <span style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600, fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.contactsFeatContract}</span>
                <span style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600, fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.contactsFeatDocs}</span>
                <span style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600, fontSize: '14px', color: '#413C32' }}><span style={{ color: '#F0951F' }}>✓</span>{t.contactsFeatAllUz}</span>
              </div>
            </div>

            <div id="zayavka" style={{ flex: '1 1 360px', minWidth: '280px', background: '#fff', border: '1px solid #E7DECF', borderRadius: '22px', padding: 'clamp(24px,3vw,36px)', alignSelf: 'flex-start', scrollMarginTop: '90px' }}>
              {!sent ? (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); setSent(true); fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source: 'b2b', hp: fd.get('hp') || '', fields: { 'Компания': fd.get('company') || '', 'Телефон': fd.get('phone') || '', 'Сообщение': fd.get('message') || '' } }) }).catch(() => {}) }} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
                  <input type="text" name="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '22px' }}>{t.formTitle}</div>
                  <input type="text" name="company" autoComplete="organization" placeholder={t.formCompany} style={{ border: '1px solid #E2D9C8', background: '#FAF6EE', borderRadius: '12px', padding: '15px 16px', fontSize: '15px', fontFamily: 'inherit', color: '#15120D', outline: 'none' }} />
                  <input type="tel" name="phone" autoComplete="tel" required placeholder={t.formPhone} style={{ border: '1px solid #E2D9C8', background: '#FAF6EE', borderRadius: '12px', padding: '15px 16px', fontSize: '15px', fontFamily: 'inherit', color: '#15120D', outline: 'none' }} />
                  <textarea rows="4" name="message" placeholder={t.formMessage} style={{ border: '1px solid #E2D9C8', background: '#FAF6EE', borderRadius: '12px', padding: '15px 16px', fontSize: '15px', fontFamily: 'inherit', color: '#15120D', outline: 'none', resize: 'vertical' }}></textarea>
                  <button type="submit" className="b2b-submit fp-pressable" style={{ background: '#FCAC45', color: '#15120D', fontWeight: 700, fontSize: '16px', padding: '16px', border: 0, borderRadius: '999px', cursor: 'pointer' }}>{t.formSubmit}</button>
                  <p style={{ margin: 0, color: '#A79C88', fontSize: '12px', lineHeight: 1.4 }}>{t.formConsent}</p>
                </form>
              ) : (
                <div className="fp-pop" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start', padding: '20px 0' }}>
                  <span className="fp-badge-pop" style={{ width: '56px', height: '56px', borderRadius: '999px', background: '#FCAC45', color: '#15120D', display: 'grid', placeItems: 'center', fontSize: '26px' }}>✓</span>
                  <div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '24px' }}>{t.formSuccessTitle}</div>
                  <p style={{ margin: 0, color: '#6F6655', fontSize: '15px', lineHeight: 1.5 }}>{t.formSuccessDesc}</p>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}><Logo variant="amber" height={32} /><span className="b2b-badge-chip" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#FCAC45,#F0951F)', color: '#15120D', fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '.08em', padding: '3px 8px 2px', borderRadius: '7px', lineHeight: 1 }}>B2B</span></div>
                <p style={{ margin: '12px 0 16px', color: 'rgba(245,239,229,.55)', fontSize: '15px', lineHeight: 1.5, maxWidth: '300px' }}>{t.footerTagline}</p>
                <a href={brand.mapLink} target="_blank" rel="noopener noreferrer" aria-label="Открыть на Яндекс.Картах" style={{ display: 'block', position: 'relative', maxWidth: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(245,239,229,.14)', boxShadow: '0 12px 30px rgba(0,0,0,.28)' }}>
                  <iframe src={brand.mapSrc} title="Folk Print — Ташкент, Чиланзар" loading="lazy" style={{ border: 0, width: '100%', height: '190px', display: 'block', pointerEvents: 'none' }} />
                  <span style={{ position: 'absolute', left: '12px', bottom: '12px', background: 'rgba(21,18,13,.85)', color: '#F5EFE5', fontSize: '12.5px', fontWeight: 600, padding: '8px 13px', borderRadius: '999px', display: 'inline-flex', gap: '7px', alignItems: 'center' }}><span style={{ color: '#FCAC45' }}>📍</span>Открыть на карте</span>
                </a>
                <a href={brand.mapLink} target="_blank" rel="noopener noreferrer" className="b2b-foot-link fp-pressable" style={{ display: 'block', marginTop: '14px', maxWidth: '400px', color: 'rgba(245,239,229,.7)', fontSize: '13.5px', lineHeight: 1.5, textDecoration: 'none' }}>{brand.address}</a>
              </div>
              <div className="b2b-foot-cols" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColProducts}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href="#catalog" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerProdUniform}</a><a href="#catalog" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerProdPromo}</a><a href="#catalog" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerProdWorkwear}</a><a href="#catalog" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerProdGifts}</a><a href="#catalog" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerProdMerch}</a></div></div>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColCompany}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href="#why" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCompWhyUs}</a><a href="#how" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCompProcess}</a><a href="#cases" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerCompCases}</a></div></div>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColContacts}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href={telHref()} className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{brand.phone} <span style={{ color: 'rgba(245,239,229,.4)' }}>(B2B)</span></a><a href={telHref(brand.phone2)} className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{brand.phone2} <span style={{ color: 'rgba(245,239,229,.4)' }}>(B2C)</span></a><a href={tgHref()} className="b2b-foot-link fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: 'none' }}><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.98-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.05-1.99 1.93c-.23.23-.42.42-.83.42z" /></svg>{t.contactsTelegram}</a><a href={igHref()} className="b2b-foot-link fp-pressable" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flex: 'none' }}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>{t.contactsInstagram}</a></div></div>
                <div><div style={{ fontFamily: "'Oswald'", fontWeight: 600, textTransform: 'uppercase', fontSize: '13px', letterSpacing: '.06em', color: 'rgba(245,239,229,.45)', marginBottom: '14px' }}>{t.footerColForClients}</div><div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}><a href="#zayavka" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerClientQuote}</a><a href="#how" className="b2b-foot-link fp-pressable" style={{ color: '#F5EFE5', textDecoration: 'none', fontSize: '14px' }}>{t.footerClientContract}</a></div></div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', marginTop: '44px', paddingTop: '22px', borderTop: '1px solid rgba(245,239,229,.12)' }}>
              <span style={{ color: 'rgba(245,239,229,.5)', fontSize: '13px' }}>{t.footerCopyright}</span>
              
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}
