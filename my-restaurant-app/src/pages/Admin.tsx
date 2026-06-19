
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
  LogOut 
} from 'lucide-react';

// ⚠️ FIREBASE DATABASE URL
const DB_URL = "https://zafar-restoran-default-rtdb.firebaseio.com";

interface CartItem {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  price: number;
  img: string;
  qty: number;
}

interface OrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  gpsLocation?: string;
  items: CartItem[];
  total: number;
  date: string;
}

interface ReservationItem {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  tableNumber?: string; // ── YANGI ──
  wish: string;
  createdAt?: string;
}

interface MenuItem {
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

// ── YANGI: MIJOZLAR FIKRI INTERFACI ──
interface CustomerReview {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

interface AdminProps {
  onGoHome: () => void;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
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

const Admin: React.FC<AdminProps> = ({ onGoHome }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'menuEdit'>('dashboard');

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  
  // ── YANGI: MIJOZLAR FIKRLARI STATE'I ──
  const [customerReviews, setCustomerReviews] = useState<CustomerReview[]>([]);

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
    const adminAuth = localStorage.getItem('zafar_admin_auth');
    if (adminAuth === 'true') setIsLoggedIn(true);

    const fetchAllData = async () => {
      try {
        // 1. Buyurtmalar
        const ordersRes = await fetch(`${DB_URL}/orders.json`);
        const ordersData = await ordersRes.json();
        const fetchedOrders = ordersData ? Object.keys(ordersData).map(key => ({
          id: key,
          ...ordersData[key]
        })) : [];
        setOrders(fetchedOrders);

        // 2. Stol band qilishlar
        const resRes = await fetch(`${DB_URL}/reservations.json`);
        const resData = await resRes.json();
        const fetchedRes = resData ? Object.keys(resData).map(key => ({
          id: key,
          ...resData[key]
        })) : [];
        setReservations(fetchedRes);

        // 3. Mijozlar sharhlari (YANGI) [1]
        const reviewsRes = await fetch(`${DB_URL}/reviews.json`);
        const reviewsData = await reviewsRes.json();
        const fetchedReviews = reviewsData ? Object.keys(reviewsData).map(key => ({
          id: key,
          ...reviewsData[key]
        })) : [];
        setCustomerReviews(fetchedReviews);

        // 4. Menyu ro'yxati
        const menuRes = await fetch(`${DB_URL}/menu.json`);
        const menuData = await menuRes.json();
        if (menuData) {
          setMenuList(Object.values(menuData) as MenuItem[]);
        } else {
          setMenuList(DEFAULT_MENU_ITEMS);
        }
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
    if (username === 'admin' && password === 'zafar123') {
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
      img: newDish.img || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600&q=80',
      descKey: 'desc_custom',
      descUz: newDish.descUz || "Lazzatli taom.",
      descRu: newDish.descRu || newDish.descUz || "Вкусное блюдо.",
      descEn: newDish.descEn || newDish.descUz || "Delicious dish.",
      meta: newDish.meta || '🔥 • Yangi'
    };

    try {
      await fetch(`${DB_URL}/menu/${newDishObj.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDishObj)
      });

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
      await fetch(`${DB_URL}/menu/${id}.json`, {
        method: 'DELETE'
      });
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
      await fetch(`${DB_URL}/menu/${editingDish.id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDish)
      });

      const updated = menuList.map(item => item.id === editingDish.id ? updatedDish : item);
      setMenuList(updated);
      setEditingDish(null);
      showSuccessModal("Taom ma'lumotlari muvaffaqiyatli yangilandi!");
    } catch (err) {
      console.error("Tahrirlashni saqlashda xatolik:", err);
    }
  };

  const totalRevenue = orders.reduce((sum, item) => sum + item.total, 0);

  if (!isLoggedIn) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-box">
          <div className="admin-logo">Zafar <span>Admin</span></div>
          <h3>Boshqaruv Paneliga Kirish</h3>
          <p>Himoyalangan hudud</p>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '14px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '6px', color: '#7A6E5E', textTransform: 'uppercase' }}>Login</label>
              <input style={{ width: '100%', padding: '12px 16px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', outline: 'none' }} type="text" placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '6px', color: '#7A6E5E', textTransform: 'uppercase' }}>Parol</label>
              <input style={{ width: '100%', padding: '12px 16px', background: '#120D05', border: '1px solid rgba(201,147,58,0.3)', color: '#F5EFE0', outline: 'none' }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            {loginErr && <div className="login-err">{loginErr}</div>}
            <button type="submit" className="admin-btn-gold">Kirish →</button>
          </form>
          <button className="back-site-btn" onClick={onGoHome}>← Saytga qaytish</button>
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

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} strokeWidth={1.5} /> Statistika va Buyurtmalar
        </button>
        <button className={`admin-tab ${activeTab === 'menuEdit' ? 'active' : ''}`} onClick={() => setActiveTab('menuEdit')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Utensils size={18} strokeWidth={1.5} /> Menyuni Tahrirlash ({menuList.length})
        </button>
      </div>

      <div className="admin-body">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><ShoppingBag size={32} strokeWidth={1.5} color="var(--gold)" /></div>
                <div>
                  <div className="stat-val">{orders.length} ta</div>
                  <div className="stat-lbl">Umumiy Buyurtmalar</div>
                </div>
              </div>
              <div className="stat-card gold-card">
                <div className="stat-icon"><TrendingUp size={32} strokeWidth={1.5} color="#F0CC90" /></div>
                <div>
                  <div className="stat-val">{totalRevenue.toLocaleString()} so'm</div>
                  <div className="stat-lbl">Jami Tushum</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Calendar size={32} strokeWidth={1.5} color="var(--gold)" /></div>
                <div>
                  <div className="stat-val">{reservations.length} ta</div>
                  <div className="stat-lbl">Stol Band Qilishlar</div>
                </div>
              </div>
            </div>

            <div className="tables-container">
              <div className="admin-table-panel">
                <div className="panel-head">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={20} strokeWidth={1.5} color="var(--gold)" /> So'nggi Buyurtmalar (Oxirgi 25 tasi)
                  </h3>
                  <span>Umumiy: {orders.length} ta</span>
                </div>
                {orders.length === 0 ? (
                  <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '20px' }}>Hozircha yangi buyurtmalar yo'q.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mijoz</th>
                          <th>Telefon</th>
                          <th>Dastavka Manzili / GPS</th>
                          <th>Buyurtma Tarkibi</th>
                          <th>Summa</th>
                          <th>Vaqt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice().reverse().slice(0, 25).map(ord => (
                          <tr key={ord.id}>
                            <td><b>{ord.customerName}</b></td>
                            <td>{ord.customerPhone}</td>
                            <td>
                              <div style={{ fontSize: '0.85rem' }}>{ord.customerAddress || "Yo'q"}</div>
                              {ord.gpsLocation && (
                                <a 
                                  href={ord.gpsLocation} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ 
                                    color: 'var(--gold)', 
                                    fontSize: '0.78rem', 
                                    textDecoration: 'underline', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    marginTop: '4px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  📍 Xaritada ko'rish
                                </a>
                              )}
                            </td>
                            <td>
                              {ord.items.map(i => `${i.nameUz} (${i.qty}x)`).join(', ')}
                            </td>
                            <td style={{ color: '#C9933A', fontWeight: 'bold' }}>
                              {ord.total.toLocaleString()} so'm
                            </td>
                            <td>{ord.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="admin-table-panel" style={{ marginTop: '32px' }}>
                <div className="panel-head">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} strokeWidth={1.5} color="var(--gold)" /> Stol Band Qilish Arizalari (Oxirgi 25 tasi)
                  </h3>
                  <span>Umumiy: {reservations.length} ta</span>
                </div>
                {reservations.length === 0 ? (
                  <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '20px' }}>Hozircha stol band qilish arizalari yo'q.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mijoz</th>
                          <th>Telefon</th>
                          <th>Sana va Vaqt</th>
                          <th>Mehmonlar</th>
                          <th>Stol Raqami</th> {/* ── YANGI STOL USTUNI ── */}
                          <th>Istak</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.slice().reverse().slice(0, 25).map(res => (
                          <tr key={res.id}>
                            <td><b>{res.name}</b></td>
                            <td>{res.phone}</td>
                            <td><span className="badge-gold">{res.date} | {res.time}</span></td>
                            <td>{res.guests}</td>
                            
                            {/* Stol raqami chiqariladi */}
                            <td><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>{res.tableNumber || "Tanlanmagan"}</span></td>
                            
                            <td>{res.wish || "Yo'q"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ── 🌟 YANGI: MIJOZLAR QOLDIRGAN JONLI SHARHLAR JADVALI ── */}
              <div className="admin-table-panel" style={{ marginTop: '32px' }}>
                <div className="panel-head">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={20} strokeWidth={1.5} color="var(--gold)" /> Mijozlar Qoldirgan Fikrlar (Oxirgi 25 tasi)
                  </h3>
                  <span>Umumiy: {customerReviews.length} ta fikr</span>
                </div>
                {customerReviews.length === 0 ? (
                  <p className="empty-txt" style={{ color: '#7A6E5E', textAlign: 'center', padding: '20px' }}>Hozircha yangi sharhlar qoldirilmagan.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mijoz</th>
                          <th>Baho (Yulduzlar)</th>
                          <th>Fikr-mulohaza (Opisaniye)</th>
                          <th>Sana</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerReviews.slice().reverse().slice(0, 25).map(rev => (
                          <tr key={rev.id}>
                            <td><b>{rev.name}</b></td>
                            <td style={{ color: 'var(--gold)', letterSpacing: '2px', fontSize: '1rem' }}>
                              {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                            </td>
                            <td style={{ fontStyle: 'italic', color: '#E8DEC8' }}>"{rev.text}"</td>
                            <td>{rev.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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
                    <label>Taom Rasmi (URL yoki Kamera/Fayl)</label>
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