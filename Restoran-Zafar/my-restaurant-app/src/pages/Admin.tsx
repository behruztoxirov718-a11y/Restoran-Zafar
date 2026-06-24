import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Calendar,
  Utensils,
  Plus,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle2,
  LogOut,
  Search,
  Eye,
  Users,
  Star,
  Wallet,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Lock,
  User,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  BarChart3,
  PieChart,
  CalendarDays,
  Settings,
  Save,
  Phone,
  Clock,
  Mail,
  Layers,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

import type {
  OrderItem,
  OrderStatus,
  ReservationItem,
  ReservationStatus,
  MenuItem,
  CustomerReview,
} from '../lib/types';
import {
  fetchOrders,
  fetchReservations,
  fetchReviews,
  fetchMenu,
  saveMenuItem,
  deleteMenuItem,
  updateOrderStatus,
  updateReservationStatus,
  deleteReservation,
  deleteReview,
  fetchCategoryConfig,
  saveCategoryConfig,
} from '../lib/api';
import type { CategoryConfig } from '../lib/api';
import { FALLBACK_DISH_IMG } from '../lib/constants';
import { Modal, useToast } from '../components/ui';

// Buyurtma holatlari — label + CSS klass.
const STATUS_META: Record<OrderStatus, { label: string; cls: string }> = {
  new: { label: 'Yangi', cls: 'st-new' },
  preparing: { label: 'Tayyorlanmoqda', cls: 'st-prep' },
  delivered: { label: 'Yetkazildi', cls: 'st-done' },
  cancelled: { label: 'Bekor qilindi', cls: 'st-cancel' },
};
const STATUS_ORDER: OrderStatus[] = ['new', 'preparing', 'delivered', 'cancelled'];
const ORDERS_PER_PAGE = 8;

// Rezervatsiya holatlari.
const RES_STATUS_META: Record<ReservationStatus, { label: string; cls: string }> = {
  pending: { label: 'Kutilmoqda', cls: 'st-new' },
  confirmed: { label: 'Tasdiqlangan', cls: 'st-done' },
  cancelled: { label: 'Bekor qilindi', cls: 'st-cancel' },
};
const ROWS_PER_PAGE = 8;

interface AdminProps {
  onGoHome: () => void;
}

const Admin: React.FC<AdminProps> = ({ onGoHome }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('zafar_admin_auth') === 'true',
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');
  const [showPw, setShowPw] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'customers' | 'reports' | 'menuEdit' | 'menuCats' | 'settings'>('dashboard');

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);

  // Buyurtmalar jadvali: qidiruv / status filtri / sahifalash / detal modal.
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [orderPage, setOrderPage] = useState(1);
  const [detailOrder, setDetailOrder] = useState<OrderItem | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  // Rezervatsiya & fikr jadvallari uchun qidiruv/sahifalash.
  const [resSearch, setResSearch] = useState('');
  const [resPage, setResPage] = useState(1);
  const [reviewPage, setReviewPage] = useState(1);
  // Mijozlar (CRM) bo'limi.
  const [custSearch, setCustSearch] = useState('');
  const [custSort, setCustSort] = useState<'spent' | 'orders' | 'recent'>('spent');
  const [custPage, setCustPage] = useState(1);
  // Sozlamalar (mock — localStorage).
  const [settings, setSettings] = useState(() => {
    try {
      return {
        name: 'Zafar Dasturxon', address: 'Amir Temur 15, Toshkent',
        phone: '+998 71 234 56 78', email: 'info@zafar.uz', hours: '10:00 – 23:00',
        instagram: '', telegram: '',
        ...JSON.parse(localStorage.getItem('zafar_settings') || '{}'),
      };
    } catch {
      return { name: 'Zafar Dasturxon', address: '', phone: '', email: '', hours: '', instagram: '', telegram: '' };
    }
  });
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [categoryCfg, setCategoryCfg] = useState<CategoryConfig>({});
  const toast = useToast();

  // ── 📊 DIAGRAMMA SINKRONIZATSIYA HOLATI ──
  const [chartMode, setChartMode] = useState<'revenue' | 'count'>('revenue');

  // ── 🌟 YANGI: SHARHLAR FILTR STATE'I ──
  const [reviewFilter, setReviewFilter] = useState<'all' | 'withText' | 'noText'>('all');

  const [newDish, setNewDish] = useState({
    nameUz: '', nameRu: '', nameEn: '',
    price: '', cat: 'milliy', img: '',
    descUz: '', descRu: '', descEn: '',
    meta: '🔥 • Yangi'
  });

  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  const [notification, setNotification] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [ordersData, resData, reviewsData, menuData, catCfg] = await Promise.all([
          fetchOrders(),
          fetchReservations(),
          fetchReviews(),
          fetchMenu(),
          fetchCategoryConfig(),
        ]);
        setOrders(ordersData);
        setReservations(resData);
        setCustomerReviews(reviewsData);
        setMenuList(menuData);
        setCategoryCfg(catCfg);
      } catch (err) {
        console.error("Ma'lumotlarni yuklashda xatolik:", err);
      }
    };

    fetchAllData();
  }, []);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 450; 
          const MAX_HEIGHT = 300; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.65);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error("Image load failed"));
      };
      reader.onerror = () => reject(new Error("FileReader failed"));
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const base64 = await compressImage(file);
      setNewDish(prev => ({ ...prev, img: base64 }));
    } catch (err) {
      console.error("Rasm yuklashda xatolik:", err);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingDish) return;
    try {
      const base64 = await compressImage(file);
      setEditingDish(prev => prev ? { ...prev, img: base64 } : null);
    } catch (err) {
      console.error("Rasm yuklashda xatolik:", err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validPw = localStorage.getItem('zafar_admin_pw') || 'zafar123';
    if (username === 'admin' && password === validPw) {
      setIsLoggedIn(true);
      localStorage.setItem('zafar_admin_auth', 'true');
      setLoginErr('');
    } else {
      setLoginErr("Login yoki parol noto'g'ri!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('zafar_admin_auth');
  };

  const showSuccessModal = (message: string) => {
    setNotification({ isOpen: true, message });
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDish.nameUz || !newDish.price) return;

    const newDishObj: MenuItem = {
      id: 'dish_' + Date.now(),
      cat: newDish.cat,
      nameUz: newDish.nameUz,
      nameRu: newDish.nameRu || newDish.nameUz,
      nameEn: newDish.nameEn || newDish.nameUz,
      price: Number(newDish.price),
      img: newDish.img || FALLBACK_DISH_IMG,
      descKey: 'desc_custom',
      descUz: newDish.descUz || "Lazzatli taom.",
      descRu: newDish.descRu || newDish.descUz || "Вкусное блюдо.",
      descEn: newDish.descEn || newDish.descUz || "Delicious dish.",
      meta: newDish.meta || '🔥 • Yangi'
    };

    try {
      await saveMenuItem(newDishObj);

      const updated = [newDishObj, ...menuList];
      setMenuList(updated);

      setNewDish({ nameUz: '', nameRu: '', nameEn: '', price: '', cat: 'milliy', img: '', descUz: '', descRu: '', descEn: '', meta: '🔥 • Yangi' });
      showSuccessModal("Yangi taom menyuga muvaffaqiyatli qo'shildi!");
    } catch (err) {
      console.error("Taom qo'shishda xatolik:", err);
    }
  };

  const handleDeleteDish = async (id: string) => {
    if (!window.confirm("Bu taomni menyudan o'chirmoqchimisiz?")) return;
    try {
      await deleteMenuItem(id);
      const updated = menuList.filter(item => item.id !== id);
      setMenuList(updated);
      showSuccessModal("Taom menyudan muvaffaqiyatli o'chirildi!");
    } catch (err) {
      console.error("Taomni o'chirishda xatolik:", err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDish) return;

    const updatedDish = {
      ...editingDish,
      descRu: editingDish.descRu || editingDish.descUz,
      descEn: editingDish.descEn || editingDish.descUz
    };

    try {
      await saveMenuItem(updatedDish);

      const updated = menuList.map(item => item.id === editingDish.id ? updatedDish : item);
      setMenuList(updated);
      setEditingDish(null);
      showSuccessModal("Taom ma'lumotlari muvaffaqiyatli yangilandi!");
    } catch (err) {
      console.error("Tahrirlashni saqlashda xatolik:", err);
    }
  };

  const totalRevenue = orders.reduce((sum, item) => sum + item.total, 0);

  // ── SaaS statistik metrikalar ──
  const uniqueCustomers = new Set(orders.map(o => o.customerPhone).filter(Boolean)).size;
  const avgRating = customerReviews.length
    ? (customerReviews.reduce((s, r) => s + (r.rating || 0), 0) / customerReviews.length).toFixed(1)
    : '—';
  const pendingOrders = orders.filter(o => (o.status || 'new') === 'new').length;
  const avgOrderValue = orders.length ? Math.round(totalRevenue / orders.length) : 0;

  // Status taqsimoti.
  const statusCounts: Record<OrderStatus, number> = { new: 0, preparing: 0, delivered: 0, cancelled: 0 };
  orders.forEach(o => { statusCounts[o.status || 'new']++; });

  // Eng ko'p buyurtma qilingan taomlar (top 5).
  const dishCountMap: Record<string, number> = {};
  orders.forEach(o => o.items?.forEach(i => { dishCountMap[i.nameUz] = (dishCountMap[i.nameUz] || 0) + i.qty; }));
  const topDishes = Object.entries(dishCountMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topDishMax = topDishes.length ? topDishes[0][1] : 1;

  // So'nggi faoliyat (buyurtma + rezervatsiya + sharh).
  type Activity = { icon: React.ReactNode; title: string; sub: string; tone: string };
  const recentActivity: Activity[] = [
    ...orders.slice(-4).reverse().map(o => ({
      icon: <ShoppingBag size={15} strokeWidth={1.7} />,
      title: `Buyurtma — ${o.customerName}`,
      sub: `${o.total.toLocaleString()} so'm`,
      tone: 'gold',
    })),
    ...reservations.slice(-2).reverse().map(r => ({
      icon: <Calendar size={15} strokeWidth={1.7} />,
      title: `Stol band — ${r.name}`,
      sub: `${r.date} · ${r.time}`,
      tone: 'blue',
    })),
    ...customerReviews.slice(-2).reverse().map(rv => ({
      icon: <Star size={15} strokeWidth={1.7} />,
      title: `Sharh — ${rv.name}`,
      sub: '★'.repeat(Math.min(5, Math.max(1, rv.rating))),
      tone: 'green',
    })),
  ];

  // Buyurtma holatini yangilash (optimistik + DB).
  const changeStatus = async (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    setDetailOrder(prev => (prev && prev.id === id ? { ...prev, status } : prev));
    try {
      await updateOrderStatus(id, status);
      toast(`Holat yangilandi: ${STATUS_META[status].label}`, 'success');
    } catch {
      toast('Holatni saqlashda xatolik', 'error');
    }
  };

  // Qidiruv + status filtri + sahifalash.
  const filteredOrders = orders
    .slice()
    .reverse()
    .filter(o => {
      const st = o.status || 'new';
      const matchStatus = statusFilter === 'all' || st === statusFilter;
      const q = orderSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        o.customerName?.toLowerCase().includes(q) ||
        o.customerPhone?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safePage = Math.min(orderPage, totalOrderPages);
  const pagedOrders = filteredOrders.slice(
    (safePage - 1) * ORDERS_PER_PAGE,
    safePage * ORDERS_PER_PAGE,
  );

  // Kunlik grafik statistikasi
  const getDailyStats = () => {
    const statsMap: { [date: string]: { count: number; revenue: number } } = {};
    
    orders.forEach(order => {
      if (!order.date) return;
      const dateStr = order.date.split(',')[0].trim();
      if (!statsMap[dateStr]) {
        statsMap[dateStr] = { count: 0, revenue: 0 };
      }
      statsMap[dateStr].count += 1;
      statsMap[dateStr].revenue += order.total;
    });

    const sortedDates = Object.keys(statsMap).sort((a, b) => {
      const partsA = a.split('.').map(Number);
      const partsB = b.split('.').map(Number);
      const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
      const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedDates.slice(-7).map(date => ({
      date,
      count: statsMap[date].count,
      revenue: statsMap[date].revenue
    }));
  };

  const dailyStats = getDailyStats();
  const maxVal = Math.max(...dailyStats.map(d => chartMode === 'revenue' ? d.revenue : d.count), chartMode === 'revenue' ? 100000 : 5);

  // Trend (oxirgi 2 kun) — stat kartalar uchun.
  const trendOf = (key: 'revenue' | 'count'): number | null => {
    const last2 = dailyStats.slice(-2);
    if (last2.length < 2 || last2[0][key] === 0) return null;
    return Math.round(((last2[1][key] - last2[0][key]) / last2[0][key]) * 100);
  };
  const revenueTrend = trendOf('revenue');
  const ordersTrend = trendOf('count');

  // Chart hover nuqtasi.

  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 50;
  const paddingY = 40;

  const points = dailyStats.map((d, index) => {
    const x = paddingX + (index * (chartWidth - 2 * paddingX)) / (dailyStats.length - 1 || 1);
    const val = chartMode === 'revenue' ? d.revenue : d.count;
    const y = chartHeight - paddingY - (val * (chartHeight - 2 * paddingY)) / maxVal;
    return { x, y, label: d.date.substring(0, 5), value: val }; 
  });

  const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // ── REZERVATSIYALAR: qidiruv + sahifalash + amallar ──
  const filteredReservations = reservations
    .slice()
    .reverse()
    .filter(r => {
      const q = resSearch.trim().toLowerCase();
      return !q || r.name?.toLowerCase().includes(q) || r.phone?.toLowerCase().includes(q);
    });
  const totalResPages = Math.max(1, Math.ceil(filteredReservations.length / ROWS_PER_PAGE));
  const safeResPage = Math.min(resPage, totalResPages);
  const pagedReservations = filteredReservations.slice(
    (safeResPage - 1) * ROWS_PER_PAGE,
    safeResPage * ROWS_PER_PAGE,
  );

  const changeResStatus = async (id: string, status: ReservationStatus) => {
    setReservations(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
    try {
      await updateReservationStatus(id, status);
      toast(`Rezervatsiya: ${RES_STATUS_META[status].label}`, 'success');
    } catch {
      toast('Saqlashda xatolik', 'error');
    }
  };

  const removeReservation = async (id: string) => {
    if (!window.confirm("Bu arizani o'chirmoqchimisiz?")) return;
    setReservations(prev => prev.filter(r => r.id !== id));
    try { await deleteReservation(id); toast("Ariza o'chirildi", 'info'); }
    catch { toast("O'chirishda xatolik", 'error'); }
  };

  // ── FIKRLAR: filtr + sahifalash + o'chirish ──
  const getFilteredReviews = () => {
    return customerReviews.filter(rev => {
      const hasText = rev.text && rev.text !== "Fikr qoldirilmadi." && rev.text.trim() !== "";
      if (reviewFilter === 'withText') return hasText;
      if (reviewFilter === 'noText') return !hasText;
      return true;
    });
  };
  const allFilteredReviews = getFilteredReviews().slice().reverse();
  const totalReviewPages = Math.max(1, Math.ceil(allFilteredReviews.length / ROWS_PER_PAGE));
  const safeReviewPage = Math.min(reviewPage, totalReviewPages);
  const filteredReviews = allFilteredReviews.slice(
    (safeReviewPage - 1) * ROWS_PER_PAGE,
    safeReviewPage * ROWS_PER_PAGE,
  );

  const removeReview = async (id: string) => {
    if (!window.confirm("Bu fikrni o'chirmoqchimisiz?")) return;
    setCustomerReviews(prev => prev.filter(r => r.id !== id));
    try { await deleteReview(id); toast("Fikr o'chirildi", 'info'); }
    catch { toast("O'chirishda xatolik", 'error'); }
  };

  // Filtr tugmalari uchun dinamik uslub
  const filterBtnStyle = (isActive: boolean) => ({
    background: isActive ? 'var(--gold)' : 'transparent',
    color: isActive ? '#120D05' : 'var(--muted)',
    border: '1px solid rgba(201,147,58,0.3)',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    borderRadius: '2px',
    transition: 'all 0.2s'
  });

  // ── MIJOZLAR (CRM): buyurtmalardan yig'iladi ──
  interface CustomerAgg {
    name: string; phone: string; count: number; total: number; lastDate: string; lastIdx: number;
  }
  const customerMap = new Map<string, CustomerAgg>();
  orders.forEach((o, idx) => {
    const key = (o.customerPhone || o.customerName || '—').trim();
    const ex = customerMap.get(key);
    if (ex) {
      ex.count += 1; ex.total += o.total; ex.name = o.customerName || ex.name;
      ex.lastDate = o.date || ex.lastDate; ex.lastIdx = idx;
    } else {
      customerMap.set(key, { name: o.customerName || '—', phone: o.customerPhone || '—', count: 1, total: o.total, lastDate: o.date || '', lastIdx: idx });
    }
  });
  const allCustomers = Array.from(customerMap.values());
  const repeatCustomers = allCustomers.filter(c => c.count > 1).length;
  const topSpent = allCustomers.reduce((m, c) => Math.max(m, c.total), 0);

  const filteredCustomers = allCustomers
    .filter(c => {
      const q = custSearch.trim().toLowerCase();
      return !q || c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (custSort === 'orders') return b.count - a.count;
      if (custSort === 'recent') return b.lastIdx - a.lastIdx;
      return b.total - a.total;
    });
  const totalCustPages = Math.max(1, Math.ceil(filteredCustomers.length / ROWS_PER_PAGE));
  const safeCustPage = Math.min(custPage, totalCustPages);
  const pagedCustomers = filteredCustomers.slice(
    (safeCustPage - 1) * ROWS_PER_PAGE,
    safeCustPage * ROWS_PER_PAGE,
  );

  // ── HISOBOTLAR / ANALITIKA ──
  const CAT_LABEL: Record<string, string> = {
    milliy: 'Milliy', grill: 'Grill', shorva: "Sho'rvalar", salat: 'Salatlar',
    non: 'Non & Somsa', ichimlik: 'Ichimliklar', shirinlik: 'Shirinliklar', boshqa: 'Boshqa',
  };
  const CAT_COLORS = ['#C9933A', '#E8B86D', '#8B5A2B', '#D4703A', '#6F8F4F', '#5A8CC8', '#B8869C', '#7A6E5E'];

  // Kategoriya bo'yicha tushum (orders × menyu).
  const catSales: Record<string, number> = {};
  orders.forEach(o => o.items?.forEach(it => {
    const cat = menuList.find(m => m.id === it.id)?.cat || 'boshqa';
    catSales[cat] = (catSales[cat] || 0) + it.price * it.qty;
  }));
  const catEntries = Object.entries(catSales).sort((a, b) => b[1] - a[1]);
  const catTotal = catEntries.reduce((s, [, v]) => s + v, 0) || 1;

  // Donut segmentlari (mutatsiyasiz — kumulyativ ulush oldindan hisoblanadi).
  const donutR = 60, donutC = 2 * Math.PI * donutR;
  const fractions = catEntries.map(([, v]) => v / catTotal);
  const donutSegments = catEntries.map(([cat, val], i) => {
    const offsetFrac = fractions.slice(0, i).reduce((s, f) => s + f, 0);
    return {
      cat, val,
      color: CAT_COLORS[i % CAT_COLORS.length],
      dash: fractions[i] * donutC,
      offset: -offsetFrac * donutC,
      pct: Math.round(fractions[i] * 100),
    };
  });

  // Sana parse (aralash formatlar: dd.mm.yyyy yoki m/d/yyyy).
  const parseDate = (s?: string): Date | null => {
    if (!s) return null;
    const part = s.split(',')[0].trim();
    let d: number, m: number, y: number;
    if (part.includes('.')) { [d, m, y] = part.split('.').map(Number); }
    else if (part.includes('/')) { [m, d, y] = part.split('/').map(Number); }
    else return null;
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };
  // Hafta kunlari bo'yicha tushum (Du..Ya).
  const weekdayNames = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];
  const weekdayRev = [0, 0, 0, 0, 0, 0, 0];
  orders.forEach(o => {
    const dt = parseDate(o.date);
    if (dt) { const idx = (dt.getDay() + 6) % 7; weekdayRev[idx] += o.total; }
  });
  const weekdayMax = Math.max(...weekdayRev, 1);
  const bestWeekday = weekdayRev.indexOf(Math.max(...weekdayRev));

  // Top taomlar tushum bo'yicha.
  const dishRev: Record<string, number> = {};
  orders.forEach(o => o.items?.forEach(it => { dishRev[it.nameUz] = (dishRev[it.nameUz] || 0) + it.price * it.qty; }));
  const topByRevenue = Object.entries(dishRev).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topRevMax = topByRevenue.length ? topByRevenue[0][1] : 1;

  // ── KATEGORIYALAR boshqaruvi ──
  const CAT_IDS = ['milliy', 'grill', 'shorva', 'salat', 'non', 'ichimlik', 'shirinlik'];
  const CAT_EMOJI: Record<string, string> = {
    milliy: '🫕', grill: '🔥', shorva: '🍲', salat: '🥗', non: '🫓', ichimlik: '🍵', shirinlik: '🍮',
  };
  const orderedCategories = CAT_IDS
    .map((id, i) => ({
      id,
      active: categoryCfg[id]?.active ?? true,
      order: categoryCfg[id]?.order ?? i,
      count: menuList.filter(m => m.cat === id).length,
      value: menuList.filter(m => m.cat === id).reduce((s, m) => s + m.price, 0),
    }))
    .sort((a, b) => a.order - b.order);

  const persistCategories = (list: typeof orderedCategories) => {
    const cfg: CategoryConfig = {};
    list.forEach((c, i) => { cfg[c.id] = { active: c.active, order: i }; });
    setCategoryCfg(cfg);
    saveCategoryConfig(cfg).catch(() => toast('Saqlashda xatolik', 'error'));
  };

  const toggleCategory = (id: string) => {
    const next = orderedCategories.map(c => (c.id === id ? { ...c, active: !c.active } : c));
    persistCategories(next);
    const c = next.find(x => x.id === id);
    toast(`${CAT_LABEL[id]}: ${c?.active ? 'yoqildi' : "o'chirildi"}`, c?.active ? 'success' : 'info');
  };

  const moveCategory = (id: string, dir: -1 | 1) => {
    const idx = orderedCategories.findIndex(c => c.id === id);
    const swap = idx + dir;
    if (swap < 0 || swap >= orderedCategories.length) return;
    const next = [...orderedCategories];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    persistCategories(next);
  };

  // ── SOZLAMALAR handlerlar ──
  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('zafar_settings', JSON.stringify(settings));
    toast('Sozlamalar saqlandi', 'success');
  };
  const changePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const validPw = localStorage.getItem('zafar_admin_pw') || 'zafar123';
    if (pwForm.current !== validPw) { toast("Joriy parol noto'g'ri", 'error'); return; }
    if (pwForm.next.length < 6) { toast("Yangi parol kamida 6 belgi", 'error'); return; }
    if (pwForm.next !== pwForm.confirm) { toast('Parollar mos kelmadi', 'error'); return; }
    localStorage.setItem('zafar_admin_pw', pwForm.next);
    setPwForm({ current: '', next: '', confirm: '' });
    toast('Parol yangilandi', 'success');
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-auth">
        {/* Chap brand panel */}
        <div className="admin-auth-brand">
          <div className="admin-auth-brand-inner">
            <div className="admin-auth-logo">Zafar <span>Dasturxon</span></div>
            <div className="admin-auth-badge"><ShieldCheck size={15} strokeWidth={1.8} /> Boshqaruv Paneli</div>
            <p className="admin-auth-tag">Restoran statistikasi, buyurtmalar, menyu va arizalarni bir joydan boshqaring.</p>
          </div>
        </div>

        {/* O'ng form */}
        <div className="admin-auth-form">
          <button className="admin-auth-back" onClick={onGoHome}>
            <ArrowLeft size={16} strokeWidth={1.8} /> Saytga qaytish
          </button>

          <div className="admin-auth-card">
            <div className="admin-auth-icon"><Lock size={32} strokeWidth={1.3} /></div>
            <h2>Boshqaruv paneliga kirish</h2>
            <p className="admin-auth-sub">Himoyalangan hudud — login va parolni kiriting</p>

            <form onSubmit={handleLogin} noValidate>
              <div className="admin-auth-field">
                <label>Login</label>
                <div className="admin-auth-input">
                  <User size={17} strokeWidth={1.6} />
                  <input type="text" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} />
                </div>
              </div>
              <div className="admin-auth-field">
                <label>Parol</label>
                <div className="admin-auth-input">
                  <Lock size={17} strokeWidth={1.6} />
                  <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" className="admin-auth-eye" onClick={() => setShowPw(s => !s)} tabIndex={-1}>
                    {showPw ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
                  </button>
                </div>
              </div>
              {loginErr && <div className="admin-auth-err">{loginErr}</div>}
              <button type="submit" className="admin-auth-submit">Kirish →</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo" onClick={onGoHome} style={{ cursor: 'pointer' }}>Zafar <span>Dasturxon</span></div>
          <span className="admin-badge">Admin Panel</span>
        </div>
        <div className="admin-header-right" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <button className="back-site-btn" onClick={onGoHome} style={{ margin: 0, textDecoration: 'none', color: '#F5EFE0', background: 'rgba(255,255,255,0.06)', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)' }}>🌐 Saytni ko'rish</button>
          <button className="logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} strokeWidth={1.5} /> Chiqish
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVIGATSIYA */}
      <div className="admin-container">
        <aside className="admin-sidebar">
          <div className="sidebar-label">Boshqaruv</div>

          <button
            className={`admin-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <TrendingUp size={18} strokeWidth={1.6} />
            <span>Dashboard</span>
            {pendingOrders > 0 && <span className="sb-count">{pendingOrders}</span>}
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <Calendar size={18} strokeWidth={1.6} />
            <span>Arizalar & Sharhlar</span>
            <span className="sb-count muted">{reservations.length + customerReviews.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            <Users size={18} strokeWidth={1.6} />
            <span>Mijozlar</span>
            <span className="sb-count muted">{allCustomers.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart3 size={18} strokeWidth={1.6} />
            <span>Hisobotlar</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'menuEdit' ? 'active' : ''}`}
            onClick={() => setActiveTab('menuEdit')}
          >
            <Utensils size={18} strokeWidth={1.6} />
            <span>Menyu</span>
            <span className="sb-count muted">{menuList.length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'menuCats' ? 'active' : ''}`}
            onClick={() => setActiveTab('menuCats')}
          >
            <Layers size={18} strokeWidth={1.6} />
            <span>Kategoriyalar</span>
            <span className="sb-count muted">{orderedCategories.filter(c => c.active).length}</span>
          </button>

          <button
            className={`admin-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} strokeWidth={1.6} />
            <span>Sozlamalar</span>
          </button>

          <div className="sidebar-foot">
            <div className="sb-avatar">A</div>
            <div className="sb-user">
              <div className="sb-name">Administrator</div>
              <div className="sb-role">Super admin</div>
            </div>
          </div>
        </aside>

        <main className="admin-main-content">
          
          {/* 1-sahifa: Statistika va Buyurtmalar */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-content">
              <div className="stats-grid">
                <div className="stat-card gold-card">
                  <div className="stat-icon"><Wallet size={26} strokeWidth={1.6} color="#120D05" /></div>
                  <div>
                    <div className="stat-val">{totalRevenue.toLocaleString()}<small> so'm</small></div>
                    <div className="stat-lbl">
                      Jami Tushum
                      {revenueTrend !== null && (
                        <span className={`trend ${revenueTrend >= 0 ? 'up' : 'down'}`}>
                          {revenueTrend >= 0 ? '↑' : '↓'} {Math.abs(revenueTrend)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><ShoppingBag size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val">{orders.length}</div>
                    <div className="stat-lbl">
                      Buyurtmalar
                      {ordersTrend !== null && (
                        <span className={`trend ${ordersTrend >= 0 ? 'up' : 'down'}`}>
                          {ordersTrend >= 0 ? '↑' : '↓'} {Math.abs(ordersTrend)}%
                        </span>
                      )}
                      {pendingOrders > 0 && <span className="stat-pill">{pendingOrders} yangi</span>}
                    </div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Users size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val">{uniqueCustomers}</div>
                    <div className="stat-lbl">Mijozlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Calendar size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val">{reservations.length}</div>
                    <div className="stat-lbl">Rezervatsiyalar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Star size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val">{avgRating}<small> / 5</small></div>
                    <div className="stat-lbl">O'rtacha baho ({customerReviews.length})</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Utensils size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val">{menuList.length}</div>
                    <div className="stat-lbl">Menyu taomlari</div>
                  </div>
                </div>
              </div>

              {/* DYNAMIC AREA CHART PANEL */}
              <div className="admin-table-panel" style={{ marginBottom: '32px' }}>
                <div className="panel-head" style={{ borderBottom: 'none', marginBottom: '14px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} strokeWidth={1.5} color="var(--gold)" /> Biznes Dinamikasi (Oxirgi 7 kun)
                  </h3>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => setChartMode('revenue')} 
                      style={{
                        background: chartMode === 'revenue' ? 'var(--gold)' : 'transparent',
                        color: chartMode === 'revenue' ? '#120D05' : 'var(--muted)',
                        border: '1px solid rgba(201,147,58,0.3)',
                        padding: '6px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'all 0.2s'
                      }}
                    >
                      Tushum (so'm)
                    </button>
                    <button 
                      onClick={() => setChartMode('count')} 
                      style={{
                        background: chartMode === 'count' ? 'var(--gold)' : 'transparent',
                        color: chartMode === 'count' ? '#120D05' : 'var(--muted)',
                        border: '1px solid rgba(201,147,58,0.3)',
                        padding: '6px 14px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderRadius: '2px',
                        transition: 'all 0.2s'
                      }}
                    >
                      Soni (ta)
                    </button>
                  </div>
                </div>

                {dailyStats.length === 0 ? (
                  <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '40px' }}>Hozircha grafikni tuzish uchun buyurtmalar yetarli emas.</p>
                ) : (
                  <div style={{ width: '100%', maxWidth: '780px', margin: '0 auto', overflowX: 'auto' }}>
                    <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', background: '#120A04', border: '1px solid rgba(201,147,58,0.1)', borderRadius: '8px', padding: '10px 0' }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.4"/>
                          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = paddingY + ratio * (chartHeight - 2 * paddingY);
                        const val = Math.round(maxVal * (1 - ratio));
                        return (
                          <g key={i} opacity="0.15">
                            <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="#fff" strokeDasharray="4 4" />
                            <text x={paddingX - 10} y={y + 4} fill="#fff" fontSize="10" textAnchor="end">
                              {chartMode === 'revenue' ? `${(val / 1000).toFixed(0)}k` : val}
                            </text>
                          </g>
                        );
                      })}

                      {points.length > 0 && (
                        <>
                          <path d={areaPath} fill="url(#chartGradient)" />
                          <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                      )}

                      {points.map((p, i) => (
                        <g key={i}>
                          {/* Sezgir zona — hover oson bo'lishi uchun */}
                          <rect
                            x={p.x - 24} y={paddingY} width="48" height={chartHeight - 2 * paddingY}
                            fill="transparent" style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoverIdx(i)}
                            onMouseLeave={() => setHoverIdx(null)}
                          />
                          <circle cx={p.x} cy={p.y} r={hoverIdx === i ? 7 : 5} fill="#120D05" stroke="var(--gold)" strokeWidth="3" style={{ transition: 'r 0.15s' }} />
                          <text x={p.x} y={chartHeight - paddingY + 20} fill="var(--muted)" fontSize="10" textAnchor="middle" fontWeight="bold">
                            {p.label}
                          </text>
                          {hoverIdx !== i && (
                            <text x={p.x} y={p.y - 12} fill="#F0CC90" fontSize="10" textAnchor="middle" fontWeight="black">
                              {chartMode === 'revenue' ? `${(p.value / 1000).toFixed(0)}k` : `${p.value} ta`}
                            </text>
                          )}
                        </g>
                      ))}

                      {/* HOVER TOOLTIP */}
                      {hoverIdx !== null && points[hoverIdx] && (() => {
                        const p = points[hoverIdx];
                        const boxW = 92, boxH = 40;
                        const bx = Math.min(Math.max(p.x - boxW / 2, paddingX), chartWidth - paddingX - boxW);
                        const by = Math.max(p.y - boxH - 14, 6);
                        return (
                          <g pointerEvents="none">
                            <rect x={bx} y={by} width={boxW} height={boxH} rx="6" fill="#0A0703" stroke="var(--gold)" strokeWidth="1" opacity="0.97" />
                            <text x={bx + boxW / 2} y={by + 16} fill="#A89880" fontSize="9" textAnchor="middle">{p.label}</text>
                            <text x={bx + boxW / 2} y={by + 31} fill="#F0CC90" fontSize="12" textAnchor="middle" fontWeight="bold">
                              {chartMode === 'revenue' ? `${p.value.toLocaleString()} so'm` : `${p.value} ta`}
                            </text>
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>

              {/* WIDGETLAR: top taomlar + status taqsimoti + so'nggi faoliyat */}
              <div className="dash-widgets">
                <div className="admin-table-panel widget">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Utensils size={18} strokeWidth={1.6} color="var(--gold)" /> Top taomlar
                    </h3>
                  </div>
                  {topDishes.length === 0 ? (
                    <p className="empty-txt" style={{ color: '#7A6E5E', padding: '14px 0' }}>Hozircha ma'lumot yo'q.</p>
                  ) : (
                    <div className="top-dishes">
                      {topDishes.map(([name, count], i) => (
                        <div key={name} className="top-dish">
                          <span className="td-rank">{i + 1}</span>
                          <div className="td-main">
                            <div className="td-row"><span className="td-name">{name}</span><span className="td-count">{count} ta</span></div>
                            <div className="td-bar"><div className="td-bar-fill" style={{ width: `${(count / topDishMax) * 100}%` }} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="admin-table-panel widget">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingBag size={18} strokeWidth={1.6} color="var(--gold)" /> Holatlar taqsimoti
                    </h3>
                  </div>
                  <div className="status-breakdown">
                    {STATUS_ORDER.map(s => {
                      const c = statusCounts[s];
                      const pct = orders.length ? Math.round((c / orders.length) * 100) : 0;
                      return (
                        <div key={s} className="sb-stat">
                          <div className="sb-stat-top">
                            <span className={`sb-dot ${STATUS_META[s].cls}`} />
                            <span className="sb-stat-label">{STATUS_META[s].label}</span>
                            <span className="sb-stat-num">{c}</span>
                          </div>
                          <div className="td-bar"><div className={`td-bar-fill ${STATUS_META[s].cls}`} style={{ width: `${pct}%` }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="aov">
                    <span>O'rtacha buyurtma</span>
                    <b>{avgOrderValue.toLocaleString()} so'm</b>
                  </div>
                </div>

                <div className="admin-table-panel widget">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={18} strokeWidth={1.6} color="var(--gold)" /> So'nggi faoliyat
                    </h3>
                  </div>
                  {recentActivity.length === 0 ? (
                    <p className="empty-txt" style={{ color: '#7A6E5E', padding: '14px 0' }}>Hozircha faoliyat yo'q.</p>
                  ) : (
                    <div className="activity-feed">
                      {recentActivity.map((a, i) => (
                        <div key={i} className="activity-item">
                          <span className={`activity-icon tone-${a.tone}`}>{a.icon}</span>
                          <div className="activity-text">
                            <div className="activity-title">{a.title}</div>
                            <div className="activity-sub">{a.sub}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="tables-container">
                <div className="admin-table-panel">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShoppingBag size={20} strokeWidth={1.5} color="var(--gold)" /> Buyurtmalar
                    </h3>
                    <span>Topildi: {filteredOrders.length} ta</span>
                  </div>

                  {/* Qidiruv + status filtri */}
                  <div className="table-toolbar">
                    <div className="table-search">
                      <Search size={16} strokeWidth={1.6} />
                      <input
                        type="text"
                        placeholder="Mijoz ismi yoki telefon..."
                        value={orderSearch}
                        onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
                      />
                    </div>
                    <div className="status-chips">
                      <button
                        className={`status-chip ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => { setStatusFilter('all'); setOrderPage(1); }}
                      >Barchasi</button>
                      {STATUS_ORDER.map(s => (
                        <button
                          key={s}
                          className={`status-chip ${statusFilter === s ? 'active' : ''}`}
                          onClick={() => { setStatusFilter(s); setOrderPage(1); }}
                        >{STATUS_META[s].label}</button>
                      ))}
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '20px' }}>Bu filtr bo'yicha buyurtma topilmadi.</p>
                  ) : (
                    <>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Mijoz</th>
                            <th>Telefon</th>
                            <th>Tarkib</th>
                            <th>Summa</th>
                            <th>Holat</th>
                            <th>Vaqt</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedOrders.map(ord => {
                            const st = ord.status || 'new';
                            return (
                            <tr key={ord.id} className={`order-row ${STATUS_META[st].cls}`}>
                              <td><b>{ord.customerName}</b></td>
                              <td>{ord.customerPhone}</td>
                              <td style={{ maxWidth: '220px' }}>
                                {ord.items.map(i => `${i.nameUz} (${i.qty}x)`).join(', ')}
                              </td>
                              <td style={{ color: '#C9933A', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                {ord.total.toLocaleString()} so'm
                              </td>
                              <td>
                                <select
                                  className={`status-select ${STATUS_META[st].cls}`}
                                  value={st}
                                  onChange={e => changeStatus(ord.id, e.target.value as OrderStatus)}
                                >
                                  {STATUS_ORDER.map(s => (
                                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                                  ))}
                                </select>
                              </td>
                              <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{ord.date}</td>
                              <td>
                                <button className="row-action" onClick={() => setDetailOrder(ord)} title="Batafsil">
                                  <Eye size={16} strokeWidth={1.7} />
                                </button>
                              </td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    </div>

                    {totalOrderPages > 1 && (
                      <div className="table-pagination">
                        <button disabled={safePage <= 1} onClick={() => setOrderPage(p => Math.max(1, p - 1))}>
                          <ChevronLeft size={16} strokeWidth={1.8} />
                        </button>
                        <span>{safePage} / {totalOrderPages}</span>
                        <button disabled={safePage >= totalOrderPages} onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))}>
                          <ChevronRight size={16} strokeWidth={1.8} />
                        </button>
                      </div>
                    )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2-sahifa: Arizalar va Fikr-mulohazalar */}
          {activeTab === 'requests' && (
            <div className="requests-content">
              <div className="tables-container">
                <div className="admin-table-panel">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={20} strokeWidth={1.5} color="var(--gold)" /> Stol Band Qilish Arizalari
                    </h3>
                    <span>Topildi: {filteredReservations.length} ta</span>
                  </div>

                  <div className="table-toolbar">
                    <div className="table-search">
                      <Search size={16} strokeWidth={1.6} />
                      <input
                        type="text"
                        placeholder="Mijoz ismi yoki telefon..."
                        value={resSearch}
                        onChange={e => { setResSearch(e.target.value); setResPage(1); }}
                      />
                    </div>
                  </div>

                  {filteredReservations.length === 0 ? (
                    <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '20px' }}>Ariza topilmadi.</p>
                  ) : (
                    <>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Mijoz</th>
                            <th>Telefon</th>
                            <th>Sana va Vaqt</th>
                            <th>Mehmonlar</th>
                            <th>Stol</th>
                            <th>Holat</th>
                            <th>Amallar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pagedReservations.map(res => {
                            const rst = res.status || 'pending';
                            return (
                            <tr key={res.id} className={`order-row ${RES_STATUS_META[rst].cls}`}>
                              <td><b>{res.name}</b>{res.wish && res.wish !== "Yo'q" && <div style={{ fontSize: '0.76rem', color: '#A89880', marginTop: '2px' }}>“{res.wish}”</div>}</td>
                              <td>{res.phone}</td>
                              <td><span className="badge-gold">{res.date} | {res.time}</span></td>
                              <td>{res.guests}</td>
                              <td><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{res.tableNumber || "—"}</span></td>
                              <td><span className={`status-select ${RES_STATUS_META[rst].cls}`} style={{ cursor: 'default' }}>{RES_STATUS_META[rst].label}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {rst !== 'confirmed' && (
                                    <button className="row-action act-ok" title="Tasdiqlash" onClick={() => changeResStatus(res.id, 'confirmed')}><Check size={15} strokeWidth={2} /></button>
                                  )}
                                  {rst !== 'cancelled' && (
                                    <button className="row-action act-no" title="Bekor qilish" onClick={() => changeResStatus(res.id, 'cancelled')}><X size={15} strokeWidth={2} /></button>
                                  )}
                                  <button className="row-action act-del" title="O'chirish" onClick={() => removeReservation(res.id)}><Trash2 size={14} strokeWidth={1.7} /></button>
                                </div>
                              </td>
                            </tr>
                          );})}
                        </tbody>
                      </table>
                    </div>
                    {totalResPages > 1 && (
                      <div className="table-pagination">
                        <button disabled={safeResPage <= 1} onClick={() => setResPage(p => Math.max(1, p - 1))}><ChevronLeft size={16} strokeWidth={1.8} /></button>
                        <span>{safeResPage} / {totalResPages}</span>
                        <button disabled={safeResPage >= totalResPages} onClick={() => setResPage(p => Math.min(totalResPages, p + 1))}><ChevronRight size={16} strokeWidth={1.8} /></button>
                      </div>
                    )}
                    </>
                  )}
                </div>

                {/* ── 🌟 JONLI FILTRLANADIGAN MIJOZLAR FIKRLARI PANELI ── */}
                <div className="admin-table-panel" style={{ marginTop: '32px' }}>
                  <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={20} strokeWidth={1.5} color="var(--gold)" /> Mijozlar Qoldirgan Fikrlar
                    </h3>

                    {/* ── JONLI FILTR TUGMALARI ── */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => { setReviewFilter('all'); setReviewPage(1); }}
                        style={filterBtnStyle(reviewFilter === 'all')}
                      >
                        Barchasi ({customerReviews.length})
                      </button>
                      <button
                        onClick={() => { setReviewFilter('withText'); setReviewPage(1); }}
                        style={filterBtnStyle(reviewFilter === 'withText')}
                      >
                        Fikr yozganlar ({customerReviews.filter(r => r.text && r.text !== "Fikr qoldirilmadi." && r.text.trim() !== "").length})
                      </button>
                      <button
                        onClick={() => { setReviewFilter('noText'); setReviewPage(1); }}
                        style={filterBtnStyle(reviewFilter === 'noText')}
                      >
                        Faqat baholaganlar ({customerReviews.filter(r => !r.text || r.text === "Fikr qoldirilmadi." || r.text.trim() === "").length})
                      </button>
                    </div>
                  </div>

                  {filteredReviews.length === 0 ? (
                    <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '20px' }}>Ushbu filtr bo'yicha ma'lumot topilmadi.</p>
                  ) : (
                    <>
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Mijoz</th>
                            <th>Baho</th>
                            <th>Fikr-mulohaza</th>
                            <th>Sana</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReviews.map(rev => (
                            <tr key={rev.id}>
                              <td><b>{rev.name}</b></td>
                              <td style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                              </td>
                              <td style={{ fontStyle: 'italic', color: '#E8DEC8' }}>"{rev.text}"</td>
                              <td style={{ whiteSpace: 'nowrap' }}>{rev.date}</td>
                              <td>
                                <button className="row-action act-del" title="O'chirish" onClick={() => removeReview(rev.id)}><Trash2 size={14} strokeWidth={1.7} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalReviewPages > 1 && (
                      <div className="table-pagination">
                        <button disabled={safeReviewPage <= 1} onClick={() => setReviewPage(p => Math.max(1, p - 1))}><ChevronLeft size={16} strokeWidth={1.8} /></button>
                        <span>{safeReviewPage} / {totalReviewPages}</span>
                        <button disabled={safeReviewPage >= totalReviewPages} onClick={() => setReviewPage(p => Math.min(totalReviewPages, p + 1))}><ChevronRight size={16} strokeWidth={1.8} /></button>
                      </div>
                    )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3-sahifa: Mijozlar (CRM) */}
          {activeTab === 'customers' && (
            <div className="customers-content">
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card gold-card">
                  <div className="stat-icon"><Users size={26} strokeWidth={1.6} color="#120D05" /></div>
                  <div>
                    <div className="stat-val">{allCustomers.length}</div>
                    <div className="stat-lbl">Jami mijozlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Check size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val">{repeatCustomers}</div>
                    <div className="stat-lbl">Doimiy mijozlar</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Wallet size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val">{(allCustomers.length ? Math.round(totalRevenue / allCustomers.length) : 0).toLocaleString()}<small> so'm</small></div>
                    <div className="stat-lbl">O'rtacha mijoz qiymati</div>
                  </div>
                </div>
              </div>

              <div className="admin-table-panel">
                <div className="panel-head">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} strokeWidth={1.6} color="var(--gold)" /> Mijozlar bazasi
                  </h3>
                  <span>Topildi: {filteredCustomers.length} ta</span>
                </div>

                <div className="table-toolbar">
                  <div className="table-search">
                    <Search size={16} strokeWidth={1.6} />
                    <input
                      type="text"
                      placeholder="Mijoz ismi yoki telefon..."
                      value={custSearch}
                      onChange={e => { setCustSearch(e.target.value); setCustPage(1); }}
                    />
                  </div>
                  <div className="status-chips">
                    <button className={`status-chip ${custSort === 'spent' ? 'active' : ''}`} onClick={() => { setCustSort('spent'); setCustPage(1); }}>Eng ko'p sarflagan</button>
                    <button className={`status-chip ${custSort === 'orders' ? 'active' : ''}`} onClick={() => { setCustSort('orders'); setCustPage(1); }}>Eng faol</button>
                    <button className={`status-chip ${custSort === 'recent' ? 'active' : ''}`} onClick={() => { setCustSort('recent'); setCustPage(1); }}>Yangi</button>
                  </div>
                </div>

                {filteredCustomers.length === 0 ? (
                  <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '20px' }}>Mijoz topilmadi.</p>
                ) : (
                  <>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mijoz</th>
                          <th>Telefon</th>
                          <th>Buyurtmalar</th>
                          <th>Jami sarflagan</th>
                          <th>O'rtacha</th>
                          <th>Oxirgi buyurtma</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedCustomers.map((c, i) => {
                          const rank = (safeCustPage - 1) * ROWS_PER_PAGE + i;
                          return (
                          <tr key={c.phone + i}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="cust-avatar">{(c.name[0] || '?').toUpperCase()}</span>
                                <span>
                                  <b>{c.name}</b>
                                  {c.total >= topSpent && topSpent > 0 && <span className="vip-badge">VIP</span>}
                                  {c.count > 1 && c.total < topSpent && <span className="repeat-badge">Doimiy</span>}
                                  {custSort === 'spent' && rank < 3 && <span className="rank-badge">#{rank + 1}</span>}
                                </span>
                              </div>
                            </td>
                            <td>{c.phone}</td>
                            <td><b>{c.count}</b> ta</td>
                            <td style={{ color: '#C9933A', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{c.total.toLocaleString()} so'm</td>
                            <td style={{ whiteSpace: 'nowrap' }}>{Math.round(c.total / c.count).toLocaleString()} so'm</td>
                            <td style={{ whiteSpace: 'nowrap', fontSize: '0.82rem' }}>{c.lastDate || '—'}</td>
                          </tr>
                        );})}
                      </tbody>
                    </table>
                  </div>
                  {totalCustPages > 1 && (
                    <div className="table-pagination">
                      <button disabled={safeCustPage <= 1} onClick={() => setCustPage(p => Math.max(1, p - 1))}><ChevronLeft size={16} strokeWidth={1.8} /></button>
                      <span>{safeCustPage} / {totalCustPages}</span>
                      <button disabled={safeCustPage >= totalCustPages} onClick={() => setCustPage(p => Math.min(totalCustPages, p + 1))}><ChevronRight size={16} strokeWidth={1.8} /></button>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* 4-sahifa: Hisobotlar / Analitika */}
          {activeTab === 'reports' && (
            <div className="reports-content">
              <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card gold-card">
                  <div className="stat-icon"><Wallet size={26} strokeWidth={1.6} color="#120D05" /></div>
                  <div>
                    <div className="stat-val">{avgOrderValue.toLocaleString()}<small> so'm</small></div>
                    <div className="stat-lbl">O'rtacha chek</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><PieChart size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val" style={{ fontSize: '1.2rem' }}>{catEntries.length ? CAT_LABEL[catEntries[0][0]] : '—'}</div>
                    <div className="stat-lbl">Eng ko'p sotilgan toifa</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><CalendarDays size={26} strokeWidth={1.6} color="var(--gold)" /></div>
                  <div>
                    <div className="stat-val" style={{ fontSize: '1.2rem' }}>{orders.length ? weekdayNames[bestWeekday] : '—'}</div>
                    <div className="stat-lbl">Eng faol kun</div>
                  </div>
                </div>
              </div>

              <div className="dash-widgets">
                {/* Kategoriya donut */}
                <div className="admin-table-panel widget">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PieChart size={18} strokeWidth={1.6} color="var(--gold)" /> Toifa bo'yicha sotuv
                    </h3>
                  </div>
                  {catEntries.length === 0 ? (
                    <p className="empty-txt" style={{ color: '#7A6E5E', padding: '14px 0' }}>Ma'lumot yo'q.</p>
                  ) : (
                    <div className="donut-wrap">
                      <svg viewBox="0 0 160 160" className="donut">
                        <circle cx="80" cy="80" r={donutR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
                        {donutSegments.map((s, i) => (
                          <circle
                            key={i} cx="80" cy="80" r={donutR} fill="none"
                            stroke={s.color} strokeWidth="18"
                            strokeDasharray={`${s.dash} ${donutC - s.dash}`}
                            strokeDashoffset={s.offset}
                            transform="rotate(-90 80 80)"
                          />
                        ))}
                        <text x="80" y="76" textAnchor="middle" fill="#F5EFE0" fontSize="13" fontWeight="bold">{(catTotal).toLocaleString()}</text>
                        <text x="80" y="92" textAnchor="middle" fill="#A89880" fontSize="9">so'm jami</text>
                      </svg>
                      <div className="donut-legend">
                        {donutSegments.map((s, i) => (
                          <div key={i} className="legend-row">
                            <span className="legend-dot" style={{ background: s.color }} />
                            <span className="legend-name">{CAT_LABEL[s.cat] || s.cat}</span>
                            <span className="legend-pct">{s.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hafta kunlari */}
                <div className="admin-table-panel widget">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart3 size={18} strokeWidth={1.6} color="var(--gold)" /> Hafta kunlari (tushum)
                    </h3>
                  </div>
                  <div className="weekday-chart">
                    {weekdayRev.map((v, i) => (
                      <div key={i} className="wd-col">
                        <div className="wd-bar-wrap">
                          <div className="wd-bar" style={{ height: `${(v / weekdayMax) * 100}%`, background: i === bestWeekday ? 'linear-gradient(180deg,#E8B86D,#C9933A)' : 'rgba(201,147,58,0.35)' }} />
                        </div>
                        <span className="wd-label">{weekdayNames[i]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top taomlar (tushum) */}
                <div className="admin-table-panel widget">
                  <div className="panel-head">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={18} strokeWidth={1.6} color="var(--gold)" /> Top taomlar (tushum)
                    </h3>
                  </div>
                  {topByRevenue.length === 0 ? (
                    <p className="empty-txt" style={{ color: '#7A6E5E', padding: '14px 0' }}>Ma'lumot yo'q.</p>
                  ) : (
                    <div className="top-dishes">
                      {topByRevenue.map(([name, rev], i) => (
                        <div key={name} className="top-dish">
                          <span className="td-rank">{i + 1}</span>
                          <div className="td-main">
                            <div className="td-row"><span className="td-name">{name}</span><span className="td-count">{rev.toLocaleString()} so'm</span></div>
                            <div className="td-bar"><div className="td-bar-fill" style={{ width: `${(rev / topRevMax) * 100}%` }} /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 5-sahifa: Menyuni Tahrirlash */}
          {activeTab === 'menuEdit' && (
            <div className="menu-edit-content">
              <div className="admin-form-panel">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={20} strokeWidth={1.5} color="var(--gold)" /> Yangi Taom Qo'shish
                </h3>
                <form onSubmit={handleAddDish} className="add-dish-form">
                  <div className="form-grid-3">
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Taom Nomi (UZ) *</label>
                      <input type="text" required placeholder="Masalan: Samarqand Oshi" value={newDish.nameUz} onChange={e => setNewDish({...newDish, nameUz: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Narxi (so'mda) *</label>
                      <input type="number" required placeholder="45000" value={newDish.price} onChange={e => setNewDish({...newDish, price: e.target.value})} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Toifasi</label>
                      <select value={newDish.cat} onChange={e => setNewDish({...newDish, cat: e.target.value})} className="admin-select" style={{ height: '45px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', padding: '0 10px' }}>
                        <option value="milliy">🫕 Milliy</option>
                        <option value="grill">🔥 Grill</option>
                        <option value="shorva">🍲 Sho'rvalar</option>
                        <option value="salat">🥗 Salatlar</option>
                        <option value="non">🫓 Non va Somsa</option>
                        <option value="ichimlik">🍵 Ichimliklar</option>
                        <option value="shirinlik">🍮 Shirinliklar</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Taom Rasmi (URL yoki Kamera/Fayl) [1]</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                          type="text" 
                          placeholder="Rasm havolasini kiriting yoki yuklang..." 
                          value={newDish.img} 
                          onChange={e => setNewDish({...newDish, img: e.target.value})} 
                          style={{ flex: 1 }}
                        />
                        <label style={{ 
                          background: 'var(--gold)', 
                          color: '#120D05', 
                          padding: '12px 16px', 
                          cursor: 'pointer', 
                          fontSize: '0.85rem', 
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          margin: 0,
                          height: '45px',
                          whiteSpace: 'nowrap'
                        }}>
                          📷 <span style={{ textTransform: 'uppercase', fontSize: '0.72rem' }}>Rasm olish</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      </div>
                      
                      {newDish.img && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={newDish.img} alt="Rasm ko'rinishi" style={{ width: '80px', height: '55px', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                          <button 
                            type="button" 
                            onClick={() => setNewDish(prev => ({ ...prev, img: '' }))}
                            style={{
                              background: 'rgba(212,112,58,0.15)',
                              border: '1px solid rgba(212,112,58,0.3)',
                              color: '#D4703A',
                              padding: '6px 12px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={12} /> <span>Rasmni o'chirish</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Qisqa ta'rif / Meta</label>
                      <input type="text" placeholder="🔥 35 min • 👤 1–2" value={newDish.meta} onChange={e => setNewDish({...newDish, meta: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Taom Ta'rifi / Tavsifi (UZ) *</label>
                      <textarea 
                        required 
                        placeholder="Taom tarkibi, tayyorlanishi yoki ta'rifi..." 
                        value={newDish.descUz} 
                        onChange={e => setNewDish({...newDish, descUz: e.target.value})} 
                        style={{ padding: '12px 16px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Tavsifi (RU) - ixtiyoriy</label>
                      <textarea 
                        placeholder="Описание блюда на русском..." 
                        value={newDish.descRu} 
                        onChange={e => setNewDish({...newDish, descRu: e.target.value})} 
                        style={{ padding: '12px 16px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label>Tavsifi (EN) - ixtiyoriy</label>
                      <textarea 
                        placeholder="Description in English..." 
                        value={newDish.descEn} 
                        onChange={e => setNewDish({...newDish, descEn: e.target.value})} 
                        style={{ padding: '12px 16px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                      />
                    </div>
                  </div>

                  <button type="submit" className="admin-btn-gold" style={{ width: 'fit-content', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} strokeWidth={2} /> Menyuga Qo'shish
                  </button>
                </form>
              </div>

              <div className="admin-table-panel" style={{ marginTop: '32px' }}>
                <div className="panel-head">
                  <h3>🍽️ Hozirgi Menyu Ro'yxati</h3>
                  <span>Jami {menuList.length} ta taom</span>
                </div>

                <div className="admin-dish-grid">
                  {menuList.map(dish => (
                    <div key={dish.id} className="admin-dish-card">
                      <img src={dish.img} alt={dish.nameUz} />
                      <div className="dish-info">
                        <span className="cat-tag">{dish.cat.toUpperCase()}</span>
                        <h4>{dish.nameUz}</h4>
                        <div className="price">{dish.price.toLocaleString()} so'm</div>
                      </div>
                      <div className="dish-actions">
                        <button className="edit-btn" onClick={() => setEditingDish(dish)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Edit size={14} strokeWidth={1.5} /> Tahrirlash
                        </button>
                        <button className="del-btn" onClick={() => handleDeleteDish(dish.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Trash2 size={14} strokeWidth={1.5} /> O'chirish
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6-sahifa: Kategoriyalar */}
          {activeTab === 'menuCats' && (
            <div className="cats-content">
              <div className="admin-table-panel">
                <div className="panel-head">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={20} strokeWidth={1.6} color="var(--gold)" /> Menyu kategoriyalari
                  </h3>
                  <span>{orderedCategories.filter(c => c.active).length} / {orderedCategories.length} faol</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#7A6E5E', marginBottom: '20px', lineHeight: 1.5 }}>
                  Kategoriyani o'chirsangiz, u <b style={{ color: '#A89880' }}>saytdagi menyu</b>da ko'rinmaydi. Tartibni o'zgartirish ham saytga ta'sir qiladi.
                </p>

                <div className="cat-list">
                  {orderedCategories.map((c, i) => (
                    <div key={c.id} className={`cat-row ${c.active ? '' : 'inactive'}`}>
                      <div className="cat-reorder">
                        <button disabled={i === 0} onClick={() => moveCategory(c.id, -1)} title="Yuqoriga"><ArrowUp size={14} strokeWidth={2} /></button>
                        <button disabled={i === orderedCategories.length - 1} onClick={() => moveCategory(c.id, 1)} title="Pastga"><ArrowDown size={14} strokeWidth={2} /></button>
                      </div>
                      <span className="cat-emoji">{CAT_EMOJI[c.id]}</span>
                      <div className="cat-info">
                        <div className="cat-name">{CAT_LABEL[c.id]}</div>
                        <div className="cat-meta">{c.count} ta taom · {c.value.toLocaleString()} so'm</div>
                      </div>
                      <button
                        className={`cat-toggle ${c.active ? 'on' : 'off'}`}
                        onClick={() => toggleCategory(c.id)}
                        title={c.active ? "O'chirish" : 'Yoqish'}
                      >
                        <span className="cat-toggle-knob" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7-sahifa: Sozlamalar */}
          {activeTab === 'settings' && (
            <div className="settings-content">
              <div className="settings-grid">
                <div className="admin-form-panel">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Settings size={20} strokeWidth={1.6} color="var(--gold)" /> Restoran profili
                  </h3>
                  <form onSubmit={saveSettings}>
                    <div className="set-field">
                      <label>Restoran nomi</label>
                      <input type="text" value={settings.name} onChange={e => setSettings({ ...settings, name: e.target.value })} />
                    </div>
                    <div className="set-field">
                      <label><MapPin size={13} strokeWidth={1.7} /> Manzil</label>
                      <input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
                    </div>
                    <div className="set-row">
                      <div className="set-field">
                        <label><Phone size={13} strokeWidth={1.7} /> Telefon</label>
                        <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
                      </div>
                      <div className="set-field">
                        <label><Mail size={13} strokeWidth={1.7} /> Email</label>
                        <input type="text" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} />
                      </div>
                    </div>
                    <div className="set-row">
                      <div className="set-field">
                        <label><Clock size={13} strokeWidth={1.7} /> Ish vaqti</label>
                        <input type="text" value={settings.hours} onChange={e => setSettings({ ...settings, hours: e.target.value })} />
                      </div>
                      <div className="set-field">
                        <label>Instagram</label>
                        <input type="text" placeholder="@zafar" value={settings.instagram} onChange={e => setSettings({ ...settings, instagram: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="admin-btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <Save size={16} strokeWidth={1.7} /> Saqlash
                    </button>
                  </form>
                </div>

                <div className="admin-form-panel">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Lock size={20} strokeWidth={1.6} color="var(--gold)" /> Parolni o'zgartirish
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#7A6E5E', marginBottom: '18px' }}>Admin panelga kirish parolini yangilang.</p>
                  <form onSubmit={changePassword}>
                    <div className="set-field">
                      <label>Joriy parol</label>
                      <input type="password" value={pwForm.current} onChange={e => setPwForm({ ...pwForm, current: e.target.value })} placeholder="••••••••" />
                    </div>
                    <div className="set-field">
                      <label>Yangi parol</label>
                      <input type="password" value={pwForm.next} onChange={e => setPwForm({ ...pwForm, next: e.target.value })} placeholder="kamida 6 belgi" />
                    </div>
                    <div className="set-field">
                      <label>Yangi parolni tasdiqlang</label>
                      <input type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="••••••••" />
                    </div>
                    <button type="submit" className="admin-btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <Save size={16} strokeWidth={1.7} /> Parolni yangilash
                    </button>
                  </form>
                  <div className="set-note">
                    ⚠️ Eslatma: bu mock (localStorage). Real xavfsizlik uchun backend kerak.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {editingDish && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '440px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)', marginBottom: '18px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <Edit size={20} strokeWidth={1.5} /> Taom tahrirlash
            </span>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#7A6E5E' }}>Taom nomi (UZ)</label>
                <input 
                  style={{ padding: '10px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0' }} 
                  type="text" 
                  value={editingDish.nameUz} 
                  onChange={e => setEditingDish(prev => prev ? { ...prev, nameUz: e.target.value } : null)} 
                />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#7A6E5E' }}>Yangi narxi (so'm)</label>
                <input 
                  style={{ padding: '10px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0' }} 
                  type="number" 
                  value={editingDish.price} 
                  onChange={e => setEditingDish(prev => prev ? { ...prev, price: Number(e.target.value) } : null)} 
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#7A6E5E' }}>Rasm URL yoki Yuklash [1]</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    style={{ padding: '10px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', flex: 1 }} 
                    type="text" 
                    value={editingDish.img} 
                    onChange={e => setEditingDish(prev => prev ? { ...prev, img: e.target.value } : null)} 
                  />
                  <label style={{ 
                    background: 'var(--gold)', 
                    color: '#120D05', 
                    padding: '10px 14px', 
                    cursor: 'pointer', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    margin: 0,
                    height: '40px',
                    whiteSpace: 'nowrap'
                  }}>
                    📷 <span style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>Olish</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleEditImageUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
                
                {editingDish.img && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={editingDish.img} alt="Rasm ko'rinishi" style={{ width: '60px', height: '45px', objectFit: 'cover', border: '1px solid var(--gold)' }} />
                    <button 
                      type="button" 
                      onClick={() => setEditingDish(prev => prev ? { ...prev, img: '' } : null)}
                      style={{
                        background: 'rgba(212,112,58,0.15)',
                        border: '1px solid rgba(212,112,58,0.3)',
                        color: '#D4703A',
                        padding: '4px 8px',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={12} /> <span>O'chirish</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#7A6E5E' }}>Tavsifi / Ta'rifi (UZ)</label>
                <textarea 
                  style={{ padding: '10px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }}
                  value={editingDish.descUz || ''} 
                  onChange={e => setEditingDish(prev => prev ? { ...prev, descUz: e.target.value } : null)} 
                />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#7A6E5E' }}>Tavsifi (RU) - ixtiyoriy</label>
                <textarea 
                  style={{ padding: '10px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }}
                  value={editingDish.descRu || ''} 
                  onChange={e => setEditingDish(prev => prev ? { ...prev, descRu: e.target.value } : null)} 
                />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                <label style={{ fontSize: '0.75rem', color: '#7A6E5E' }}>Tavsifi (EN) - ixtiyoriy</label>
                <textarea 
                  style={{ padding: '10px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', resize: 'vertical', minHeight: '60px', fontFamily: 'inherit' }}
                  value={editingDish.descEn || ''} 
                  onChange={e => setEditingDish(prev => prev ? { ...prev, descEn: e.target.value } : null)} 
                />
              </div>

              <div className="modal-btns" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="admin-btn-gold" style={{ flex: 1 }}>Saqlash</button>
                <button type="button" className="cancel-btn" onClick={() => setEditingDish(null)} style={{ flex: 1 }}>Bekor qilish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BUYURTMA DETAL MODAL */}
      <Modal
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title="Buyurtma tafsilotlari"
        subtitle={detailOrder?.date}
        maxWidth={460}
      >
        {detailOrder && (
          <div className="order-detail">
            <div className="order-detail-row">
              <span>Mijoz</span><b>{detailOrder.customerName}</b>
            </div>
            <div className="order-detail-row">
              <span>Telefon</span><b>{detailOrder.customerPhone}</b>
            </div>
            <div className="order-detail-row">
              <span>Manzil</span><b>{detailOrder.customerAddress || "Yo'q"}</b>
            </div>
            {detailOrder.gpsLocation && (
              <div className="order-detail-row">
                <span>GPS</span>
                <a href={detailOrder.gpsLocation} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <MapPin size={14} /> Xaritada
                </a>
              </div>
            )}
            <div className="order-detail-items">
              {detailOrder.items.map((i, idx) => (
                <div key={idx} className="order-detail-item">
                  <span>{i.nameUz} × {i.qty}</span>
                  <span>{(i.price * i.qty).toLocaleString()} so'm</span>
                </div>
              ))}
            </div>
            <div className="order-detail-total">
              <span>JAMI</span>
              <span>{detailOrder.total.toLocaleString()} so'm</span>
            </div>
            <div className="order-detail-status">
              {STATUS_ORDER.map(s => (
                <button
                  key={s}
                  className={`status-chip ${(detailOrder.status || 'new') === s ? 'active' : ''}`}
                  onClick={() => changeStatus(detailOrder.id, s)}
                >{STATUS_META[s].label}</button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {notification.isOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="admin-modal-box success-notification" style={{ textAlign: 'center', maxWidth: '360px', border: '1px solid #C9933A' }}>
            <div style={{ color: 'var(--gold)', marginBottom: '10px', display: 'flex', justifyContent: 'center' }}><CheckCircle2 size={48} strokeWidth={1.5} /></div>
            <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.35rem', color: '#C9933A', marginBottom: '10px' }}>Muvaffaqiyatli!</h4>
            <p style={{ fontSize: '0.9rem', color: '#F5EFE0', marginBottom: '20px', lineHeight: '1.5' }}>{notification.message}</p>
            <button 
              type="button" 
              className="admin-btn-gold" 
              onClick={() => setNotification({ isOpen: false, message: '' })}
              style={{ width: '100%', padding: '12px' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;