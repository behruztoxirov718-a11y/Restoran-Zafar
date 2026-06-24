// Loyiha bo'yicha umumiy tiplar — ilgari Home/Menu/Admin fayllarida takrorlangan.

export type Lang = 'uz' | 'ru' | 'en';

export type Page = 'home' | 'menu' | 'admin' | 'auth';

export interface AuthUser {
  name: string;
  email: string;
}

export interface CartItem {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  price: number;
  img: string;
  qty: number;
}

export interface MenuItem {
  id: string;
  cat: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  price: number;
  img: string;
  descKey: string;
  descUz?: string;
  descRu?: string;
  descEn?: string;
  badge?: string;
  badgeKey?: string;
  meta: string;
}

export type OrderStatus = 'new' | 'preparing' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  gpsLocation?: string;
  items: CartItem[];
  total: number;
  date: string;
  status?: OrderStatus;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ReservationItem {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  tableNumber?: string;
  wish: string;
  createdAt?: string;
  status?: ReservationStatus;
}

export interface CustomerReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}
