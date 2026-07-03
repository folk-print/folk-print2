// User-facing strings. UZ is the canonical set; RU mirrors it. Missing keys fall
// back to UZ (see I18nContext). Use {name} placeholders.
export const LANGS = ['uz', 'ru']

export const STRINGS = {
  uz: {
    brand: 'Folk Print',
    tagline: 'Maxsus {product} · toʻliq qoplamali dizayner',
    product_tshirt: 'Klassik futbolka',

    lang_label: 'Til',
    lang_uz: 'Oʻzbekcha',
    lang_ru: 'Русский',

    upload_title: 'Naqshlaringizni yuklang',
    upload_hint: 'PNG, JPG, WEBP, GIF yoki SVG — sudrab tashlang yoki bosing.',
    skipped: 'Qoʻllab-quvvatlanmaydigan fayl(lar) oʻtkazib yuborildi: {files}',

    shirt_colour: 'Futbolka rangi',
    custom_colour: 'Maxsus rang',

    pieces_title: 'Kiyim qismlari',
    part_front: 'Old',
    part_back: 'Orqa',
    part_sleeveL: 'Chap yeng',
    part_sleeveR: 'Oʻng yeng',
    zone_all: 'Hammasi',
    editing_piece: 'Tahrir: {piece}',
    board_hint: 'Naqshni barmoq bilan suring · burchaklar — oʻlcham va aylanish · yuqoridagi zonalar qismni yaqinlashtiradi.',

    selected_print: 'Tanlangan naqsh',
    select_hint: 'Tahrirlash uchun naqsh (yoki qatlam) ustiga bosing.',
    action_center: 'Markazga',
    action_duplicate: 'Nusxalash',
    action_forward: 'Oldinga',
    action_backward: 'Orqaga',
    action_delete: 'Oʻchirish',
    opacity: 'Shaffoflik',
    edit_hint: 'Naqshni surib koʻchiring, kattalashtiring va aylantiring — 3D futbolka jonli yangilanadi.',

    layers: 'Qatlamlar',
    layers_empty: 'Hali naqsh yoʻq. Boshlash uchun rasm yuklang.',
    tip_show: 'Koʻrsatish',
    tip_hide: 'Yashirish',
    tip_forward: 'Oldinga surish',
    tip_backward: 'Orqaga surish',
    tip_delete: 'Oʻchirish',

    preview_3d: 'Jonli 3D koʻrinish',
    rotate_hint: 'Aylantirish uchun suring · kattalashtirish uchun skroll qiling',
    loading_3d: '3D yuklanmoqda…',

    export_artwork: 'Naqsh (PNG)',
    export_snapshot: '3D surat',
    export_spec: 'JSON',

    order: 'Buyurtma berish',
    order_sending: 'Yuborilmoqda…',
    order_sent: 'Buyurtmangiz yuborildi!',
    order_saved: 'Buyurtma tayyor — fayl yuklab olindi.',
    order_failed: 'Yuborib boʻlmadi. Qayta urinib koʻring.',
  },
  ru: {
    brand: 'Folk Print',
    tagline: 'Свой {product} · дизайнер сплошного принта',
    product_tshirt: 'Классическая футболка',

    lang_label: 'Язык',
    lang_uz: 'Oʻzbekcha',
    lang_ru: 'Русский',

    upload_title: 'Загрузите принты',
    upload_hint: 'PNG, JPG, WEBP, GIF или SVG — перетащите или нажмите.',
    skipped: 'Пропущены неподдерживаемые файлы: {files}',

    shirt_colour: 'Цвет футболки',
    custom_colour: 'Свой цвет',

    pieces_title: 'Детали изделия',
    part_front: 'Перёд',
    part_back: 'Спинка',
    part_sleeveL: 'Левый рукав',
    part_sleeveR: 'Правый рукав',
    zone_all: 'Все',
    editing_piece: 'Редактирование: {piece}',
    board_hint: 'Тащите принт пальцем · уголки — размер и поворот · зоны сверху приближают деталь.',

    selected_print: 'Выбранный принт',
    select_hint: 'Нажмите на принт или слой, чтобы отредактировать его.',
    action_center: 'По центру',
    action_duplicate: 'Дублировать',
    action_forward: 'Вперёд',
    action_backward: 'Назад',
    action_delete: 'Удалить',
    opacity: 'Непрозрачность',
    edit_hint: 'Перетаскивайте принт, чтобы перемещать, масштабировать и поворачивать его — 3D-футболка обновляется сразу.',

    layers: 'Слои',
    layers_empty: 'Принтов пока нет. Загрузите изображение, чтобы начать.',
    tip_show: 'Показать',
    tip_hide: 'Скрыть',
    tip_forward: 'Поднять выше',
    tip_backward: 'Опустить ниже',
    tip_delete: 'Удалить',

    preview_3d: '3D-превью в реальном времени',
    rotate_hint: 'Тяните, чтобы вращать · колёсико для масштаба',
    loading_3d: 'Загрузка 3D…',

    export_artwork: 'Макет (PNG)',
    export_snapshot: '3D-снимок',
    export_spec: 'JSON',

    order: 'Заказать',
    order_sending: 'Отправка…',
    order_sent: 'Ваш заказ отправлен!',
    order_saved: 'Заказ готов — файл сохранён.',
    order_failed: 'Не удалось отправить. Попробуйте снова.',
  },
}
