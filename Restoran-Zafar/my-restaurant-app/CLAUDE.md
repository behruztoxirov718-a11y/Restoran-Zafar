# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Zafar Dasturxon" — o'zbek restorani uchun bir sahifali (SPA) React + TypeScript + Vite ilovasi. Mehmonlar uchun front-site (Home, Menu) va restoran egasi uchun Admin panel bir kod bazasida.

Barcha ish `my-restaurant-app/` ichida — `cd my-restaurant-app` qilib oling.

## Commands

```bash
npm run dev       # Vite dev-server (HMR)
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # build natijasini ko'rish
npx tsc --noEmit  # type-check (build qilmasdan)
```

Test yo'q — test runner sozlanmagan.

## Arxitektura

**Routing state orqali, react-router emas.** `react-router-dom` dependency'da bor, lekin ishlatilmaydi. Sahifa almashtirish `src/index.tsx` ichidagi `currentPage` state (`'home' | 'menu' | 'admin'`) bilan boshqariladi. Yangi sahifa qo'shsangiz shu pattern'ga rioya qiling.

**`src/index.tsx` — App root** (`main.tsx` faqat shu App'ni mount qiladi). Global state shu yerda: `lang`, `isDark` (theme), `cart`, `currentPage`. Nav, mobile drawer va footer admin sahifasidan tashqari hamma joyda ko'rinadi (`currentPage !== 'admin'` sharti bilan). Cart `index.tsx`da yashaydi va `Menu`ga prop sifatida uzatiladi.

**`src/lib/` — umumiy qatlam (yagona manba).** Ilgari Home/Menu/Admin'da takrorlangan narsalar shu yerga jamlangan:
- `types.ts` — `Lang`, `Page`, `CartItem`, `MenuItem`, `OrderItem`, `ReservationItem`, `CustomerReview`.
- `constants.ts` — `DB_URL`, `TG_BOT_TOKEN`/`TG_CHAT_ID`, `CATEGORIES`, `DEFAULT_MENU_ITEMS`, `FALLBACK_DISH_IMG`.
- `api.ts` — Firebase REST helperlar (`fetchMenu`, `saveMenuItem`, `deleteMenuItem`, `fetchOrders`/`createOrder`, `fetchReservations`/`createReservation`, `fetchReviews`/`createReview`) + `sendTelegram`.

**Backend — Firebase Realtime DB, REST orqali (SDK yo'q).** Komponentlar to'g'ridan-to'g'ri `fetch` chaqirmaydi — `src/lib/api.ts` orqali ishlaydi. Asosiy yo'llar:
- `menu.json` / `menu/<id>.json` — taomlar (Menu o'qiydi, Admin CRUD qiladi)
- `orders.json` / `orders/<id>/status.json` — buyurtmalar + holat workflow (`new`/`preparing`/`delivered`/`cancelled`; Menu yozadi, Admin o'qiydi/yangilaydi)
- `reservations.json` — stol band qilish (Home yozadi, Admin o'qiydi)
- `reviews.json` — mijoz fikrlari (Menu yozadi, Admin o'qiydi)

DB bo'sh bo'lsa, `api.fetchMenu()` `DEFAULT_MENU_ITEMS` bilan menyuni seed qiladi.

**i18n — `src/translations.ts`.** `T[lang]` (`uz` | `ru` | `en`) — tekis kalit-qiymat obyekt. Komponentlarda `const t = T[lang]` qilib `t.nav_menu` kabi ishlatiladi. Yangi matn qo'shsangiz uchchala tilga ham qo'shing. Taom nomlari/ta'riflari ko'p tilli maydonlar bilan saqlanadi (`nameUz`/`nameRu`/`nameEn`, `descUz`/...).

**UI kit — `src/components/ui/`.** Qayta ishlatiladigan komponentlar: `Button` (variant: primary/ghost/gold/danger, `loading`), `Badge` (hot/new/veg/gold), `EmptyState`, `Modal` (ESC + scroll-lock), `ToastProvider`/`useToast` (alert o'rniga). Barchasi `index.ts` orqali eksport, `ui-*` CSS klasslari `index.css` oxirida. `ToastProvider` `main.tsx`da App'ni o'raydi — istalgan komponentda `useToast()` ishlaydi. Yangi UI elementi kerak bo'lsa avval shu yerga qara.

**Styling — bitta `src/index.css` (~1360 qator).** Komponent-darajadagi CSS yo'q; class nomlari global. Mavzu (theme) `:root` va `[data-theme="dark"]` CSS o'zgaruvchilari (`--gold`, `--bg`, ...) orqali; `document.documentElement`ga `data-theme` atributi qo'yiladi va `localStorage`'da `theme` kaliti bilan saqlanadi. Inline `style={{}}` ham keng ishlatilgan.

**Admin auth — namoyish darajasida.** Login `admin` / `zafar123` hardcoded (`Admin.tsx`), holat `localStorage`'da `zafar_admin_auth` bilan saqlanadi. Haqiqiy xavfsizlik yo'q.

**Customer auth — MOCK (`src/lib/auth.ts` + `src/pages/Auth.tsx`).** Login/Register/Forgot-password sahifasi `currentPage === 'auth'` orqali ochiladi. `register`/`login` foydalanuvchilarni `localStorage`'da (`zafar_users`) saqlaydi, sessiya `zafar_user`'da. Backend yo'q — bu UI/demo. App'dagi `user` state nav'da ko'rsatiladi. Til — `Auth.tsx` ichidagi `DICT` (translations.ts emas).

**Icons — `lucide-react`.** Ba'zi maxsus ikonlar (Facebook, Instagram) `index.tsx`da inline SVG.

## Diqqat

- `DB_URL`, Telegram sirlari, `DEFAULT_MENU_ITEMS` endi faqat `src/lib/constants.ts`da — boshqa joyda takrorlama.
- Tip va API kerak bo'lsa avval `src/lib/types.ts` / `src/lib/api.ts`ga qara.
- O'zgartirishdan keyin `npm run lint` va `npx tsc --noEmit` bilan tekshiring.
