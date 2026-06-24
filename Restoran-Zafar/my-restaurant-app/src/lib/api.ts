import { DB_URL, TG_BOT_TOKEN, TG_CHAT_ID, DEFAULT_MENU_ITEMS } from './constants';
import type {
  MenuItem,
  OrderItem,
  OrderStatus,
  ReservationItem,
  ReservationStatus,
  CustomerReview,
} from './types';

// Firebase RTDB obyektini {id, ...} massivga aylantiruvchi yordamchi.
function toList<T>(data: Record<string, Omit<T, 'id'>> | null): T[] {
  if (!data) return [];
  return Object.keys(data).map((key) => ({ id: key, ...data[key] }) as T);
}

// ── MENYU ──
export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${DB_URL}/menu.json`);
  const data = await res.json();
  if (data) return Object.values(data) as MenuItem[];
  // DB bo'sh bo'lsa default menyu bilan seed qilamiz.
  await seedMenu();
  return DEFAULT_MENU_ITEMS;
}

export async function seedMenu(): Promise<void> {
  const initial: Record<string, MenuItem> = {};
  DEFAULT_MENU_ITEMS.forEach((item) => {
    initial[item.id] = item;
  });
  await fetch(`${DB_URL}/menu.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(initial),
  });
}

export async function saveMenuItem(item: MenuItem): Promise<void> {
  await fetch(`${DB_URL}/menu/${item.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await fetch(`${DB_URL}/menu/${id}.json`, { method: 'DELETE' });
}

// ── BUYURTMA / REZERVATSIYA / FIKR ──
export async function fetchOrders(): Promise<OrderItem[]> {
  const res = await fetch(`${DB_URL}/orders.json`);
  return toList<OrderItem>(await res.json());
}

export async function createOrder(order: Omit<OrderItem, 'id'>): Promise<void> {
  await fetch(`${DB_URL}/orders.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await fetch(`${DB_URL}/orders/${id}/status.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  });
}

export async function fetchReservations(): Promise<ReservationItem[]> {
  const res = await fetch(`${DB_URL}/reservations.json`);
  return toList<ReservationItem>(await res.json());
}

export async function createReservation(
  reservation: Omit<ReservationItem, 'id'>,
): Promise<void> {
  await fetch(`${DB_URL}/reservations.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reservation),
  });
}

export async function updateReservationStatus(id: string, status: ReservationStatus): Promise<void> {
  await fetch(`${DB_URL}/reservations/${id}/status.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(status),
  });
}

export async function deleteReservation(id: string): Promise<void> {
  await fetch(`${DB_URL}/reservations/${id}.json`, { method: 'DELETE' });
}

export async function fetchReviews(): Promise<CustomerReview[]> {
  const res = await fetch(`${DB_URL}/reviews.json`);
  return toList<CustomerReview>(await res.json());
}

export async function createReview(
  review: Omit<CustomerReview, 'id'>,
): Promise<void> {
  await fetch(`${DB_URL}/reviews.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
}

// ── KATEGORIYA SOZLAMASI (active + order) ──
export interface CategoryConfig {
  [id: string]: { active: boolean; order: number };
}

export async function fetchCategoryConfig(): Promise<CategoryConfig> {
  const res = await fetch(`${DB_URL}/menu_categories.json`);
  return (await res.json()) || {};
}

export async function saveCategoryConfig(cfg: CategoryConfig): Promise<void> {
  await fetch(`${DB_URL}/menu_categories.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg),
  });
}

export async function deleteReview(id: string): Promise<void> {
  await fetch(`${DB_URL}/reviews/${id}.json`, { method: 'DELETE' });
}

// ── TELEGRAM ──
// Telegramga xabar yuboradi; muvaffaqiyat (true/false) qaytaradi.
export async function sendTelegram(message: string): Promise<boolean> {
  const res = await fetch(
    `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    },
  );
  const data = await res.json();
  return !!data.ok;
}
