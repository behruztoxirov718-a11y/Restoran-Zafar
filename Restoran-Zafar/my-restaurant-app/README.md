# Zafar Dasturxon 🍽️

O'zbek restorani "Zafar Dasturxon" uchun bir sahifali (SPA) veb-ilova. Mehmonlar uchun sayt (bosh sahifa, menyu, stol band qilish) va restoran egasi uchun Admin panel bitta kod bazasida.

**Texnologiyalar:** React 19 · TypeScript · Vite · Firebase Realtime Database (REST) · lucide-react

## Imkoniyatlar

- 🌐 **3 til** — o'zbek / rus / ingliz (`translations.ts`)
- 🌗 **Light / Dark** mavzu (localStorage'da saqlanadi)
- 🛒 **Savat va buyurtma** — menyudan taom tanlash, buyurtma berish
- 📅 **Stol band qilish** (rezervatsiya formasi)
- ⭐ **Mijoz fikrlari** (reviews)
- 🔐 **Admin panel** — buyurtmalar, rezervatsiyalar, fikrlar va menyu CRUD (statistika bilan)

## Ishga tushirish

Talab: Node.js 18+.

```bash
cd my-restaurant-app
npm install
npm run dev
```

Dev-server odatda http://localhost:5173 da ochiladi.

## Skriptlar

| Buyruq            | Vazifa                              |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Vite dev-server (HMR)               |
| `npm run build`   | `tsc -b && vite build` — prod build |
| `npm run preview` | Build natijasini lokal ko'rish      |
| `npm run lint`    | ESLint tekshiruvi                   |
| `npx tsc --noEmit`| Type-check (build qilmasdan)        |

## Loyiha tuzilishi

```
my-restaurant-app/
├── src/
│   ├── index.tsx          # App root: routing (state), global state (lang/theme/cart), nav, footer
│   ├── main.tsx           # React mount
│   ├── index.css          # Barcha global stillar + theme (CSS o'zgaruvchilari)
│   ├── translations.ts    # i18n — T[lang] (uz/ru/en)
│   ├── components/
│   │   └── Loader.tsx
│   └── pages/
│       ├── Home.tsx       # Bosh sahifa + rezervatsiya
│       ├── Menu.tsx       # Menyu, savat, buyurtma, fikr qoldirish
│       └── Admin.tsx      # Admin panel (login + dashboard + menyu CRUD)
└── public/
```

## Arxitektura haqida

- **Routing** state orqali (`index.tsx`dagi `currentPage`) — `react-router` ishlatilmaydi.
- **Backend** — Firebase Realtime Database, REST orqali (`fetch(\`${DB_URL}/<path>.json\`)`, SDK yo'q).
  Yo'llar: `menu`, `orders`, `reservations`, `reviews`.
- **Styling** — bitta global `index.css`; mavzu `:root` / `[data-theme="dark"]` CSS o'zgaruvchilari bilan.

## Admin panel

Front-saytdagi 🔒 tugma orqali kiriladi.

| Login   | Parol      |
| ------- | ---------- |
| `admin` | `zafar123` |

> ⚠️ Auth namoyish darajasida (hardcoded, `localStorage`). Production uchun yaroqli emas.

## Konfiguratsiya

Firebase DB manzili hozircha kodda hardcoded (`DB_URL`, uch faylda: `Home.tsx`, `Menu.tsx`, `Admin.tsx`):

```
https://zafar-restoran-default-rtdb.firebaseio.com
```

O'zgartirsangiz, uchala faylda ham yangilang.
