import type { MenuItem } from './types';

// Firebase Realtime Database (REST). Eslatma: ideal holatda .env / backend orqali.
export const DB_URL = 'https://zafar-restoran-default-rtdb.firebaseio.com';

// Telegram bildirishnoma. ⚠️ Hozircha client-side (xavfsizlik keyingi bosqichda).
export const TG_BOT_TOKEN = '8868012287:AAFa67M5cikUi41-QfyxGBf9NSxxgKwENqA';
export const TG_CHAT_ID = '6148610387';

// Yangi taom qo'shilganda default rasm.
export const FALLBACK_DISH_IMG =
  'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80';

// Menyu kategoriyalari — Menu va Admin uchun yagona manba.
// labelKey -> translations.ts dagi kalit.
export const CATEGORIES = [
  { id: 'milliy', labelKey: 'cat_milliy', sectionKey: 'sec_milliy' },
  { id: 'grill', labelKey: 'cat_grill', sectionKey: 'sec_grill' },
  { id: 'shorva', labelKey: 'cat_shorva', sectionKey: 'sec_shorva' },
  { id: 'salat', labelKey: 'cat_salat', sectionKey: 'sec_salat' },
  { id: 'non', labelKey: 'cat_non', sectionKey: 'sec_non' },
  { id: 'ichimlik', labelKey: 'cat_ichimlik', sectionKey: 'sec_ichimlik' },
  { id: 'shirinlik', labelKey: 'cat_shirinlik', sectionKey: 'sec_shirinlik' },
] as const;

export const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1', cat: 'milliy', nameUz: 'Samarqand Oshi', nameRu: 'Самаркандский Плов', nameEn: 'Samarkand Plov',
    price: 45000, img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80',
    descKey: 'desc_plov', badge: 'hot', badgeKey: 'badge_popular', meta: '🕐 35 min • 👤 1–2 • 🌶️'
  },
  {
    id: 'm2', cat: 'milliy', nameUz: 'Buxoro Dimlama', nameRu: 'Бухарская Димлама', nameEn: 'Bukhara Dimlama',
    price: 52000, img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80',
    descKey: 'desc_dimlama', meta: '🕐 50 min • 👤 2'
  },
  {
    id: 'm3', cat: 'milliy', nameUz: 'Toshkent Manti', nameRu: 'Ташкентские Манты', nameEn: 'Tashkent Manti',
    price: 38000, img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
    descKey: 'desc_manti', badge: 'new', badgeKey: 'badge_new', meta: '🕐 40 min • 👤 1–2'
  },
  {
    id: 'g1', cat: 'grill', nameUz: 'Tandir Kabob', nameRu: 'Тандырный Кабоб', nameEn: 'Tandoor Kebab',
    price: 62000, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    descKey: 'desc_tandir', badge: 'hot', meta: '🕐 30 min • 👤 1 • 🌶️🌶️'
  },
  {
    id: 'g2', cat: 'grill', nameUz: 'Tikka Kabob', nameRu: 'Тикка Кабоб', nameEn: 'Tikka Kebab',
    price: 55000, img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80',
    descKey: 'desc_tikka', meta: '🕐 25 min • 👤 1'
  },
  {
    id: 'g3', cat: 'grill', nameUz: 'Lula Kabob', nameRu: 'Люля-Кебаб', nameEn: 'Lula Kebab',
    price: 48000, img: 'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=600&q=80',
    descKey: 'desc_lula', badge: 'new', badgeKey: 'badge_new', meta: '🕐 20 min • 👤 1'
  },
  {
    id: 's1', cat: 'shorva', nameUz: "Qo'zi Sho'rva", nameRu: 'Шурпа из Баранины', nameEn: 'Lamb Shorva',
    price: 35000, img: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&q=80',
    descKey: 'desc_shorva', badge: 'hot', badgeKey: 'badge_popular', meta: '🕐 15 min • 👤 1'
  },
  {
    id: 's2', cat: 'shorva', nameUz: 'Mastava', nameRu: 'Мастава', nameEn: 'Mastava Soup',
    price: 28000, img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    descKey: 'desc_mastava', meta: '🕐 15 min • 👤 1'
  },
  {
    id: 'sl1', cat: 'salat', nameUz: 'Achichuk', nameRu: 'Аччичук', nameEn: 'Achichuk Salad',
    price: 18000, img: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
    descKey: 'desc_achichuk', badge: 'veg', badgeKey: 'badge_veg', meta: '🕐 5 min • 🥬'
  },
  {
    id: 'sl2', cat: 'salat', nameUz: 'Toshkent Salati', nameRu: 'Ташкентский Салат', nameEn: 'Tashkent Salad',
    price: 22000, img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    descKey: 'desc_tsalat', badge: 'veg', badgeKey: 'badge_veg', meta: '🕐 8 min • 🥬'
  },
  {
    id: 'n1', cat: 'non', nameUz: 'Tandirda Non', nameRu: 'Тандырная Лепёшка', nameEn: 'Tandoor Bread',
    price: 8000, img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    descKey: 'desc_non', meta: '🔥 • Tayyor'
  },
  {
    id: 'n2', cat: 'non', nameUz: "Go'shtli Somsa", nameRu: 'Самса с Мясом', nameEn: 'Meat Samsa',
    price: 12000, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
    descKey: 'desc_somsa', badge: 'hot', badgeKey: 'badge_popular', meta: '🔥 • Tayyor'
  },
  {
    id: 'i1', cat: 'ichimlik', nameUz: "Ko'k Choy", nameRu: 'Зелёный Чай', nameEn: 'Green Tea',
    price: 8000, img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
    descKey: 'desc_choy', meta: '☕ • 🌿'
  },
  {
    id: 'i2', cat: 'ichimlik', nameUz: 'Tabiiy Sharbat', nameRu: 'Натуральный Сок', nameEn: 'Fresh Juice',
    price: 14000, img: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&q=80',
    descKey: 'desc_sharbat', badge: 'new', badgeKey: 'badge_new', meta: '🧊 • 🍎'
  },
  {
    id: 'sh1_s', cat: 'shirinlik', nameUz: 'Uy Halvasi', nameRu: 'Домашняя Халва', nameEn: 'Homemade Halva',
    price: 16000, img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    descKey: 'desc_halva', meta: '🍬 • 🥜'
  },
  {
    id: 'sh2_s', cat: 'shirinlik', nameUz: 'Chak-Chak', nameRu: 'Чак-Chak', nameEn: 'Chak-Chak',
    price: 18000, img: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80',
    descKey: 'desc_chakchak', badge: 'hot', meta: '🍯 • 🤎'
  }
];
