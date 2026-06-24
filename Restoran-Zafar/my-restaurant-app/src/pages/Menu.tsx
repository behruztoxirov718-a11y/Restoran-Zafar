import React, { useState, useEffect } from 'react';
import { T } from '../translations';
import { 
  Utensils, 
  ChefHat, 
  Flame, 
  Soup, 
  Salad, 
  Croissant, 
  Coffee, 
  Cake, 
  Search, 
  Heart, 
  Check, 
  Plus, 
  ShoppingCart, 
  Minus, 
  Send, 
  CheckCircle2,
  MapPin,
  Star,
  SearchX
} from 'lucide-react';
import type { Lang, CartItem, MenuItem } from '../lib/types';
import { fetchMenu, createOrder, createReview, sendTelegram, fetchCategoryConfig } from '../lib/api';
import { DEFAULT_MENU_ITEMS } from '../lib/constants';
import { EmptyState, useToast } from '../components/ui';

const LIKES_KEY = 'zafar_favorites';

// Kategoriya meta — ikona + tarjima kaliti.
const CAT_META: { id: string; labelKey: string; Icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'milliy', labelKey: 'cat_milliy', Icon: ChefHat },
  { id: 'grill', labelKey: 'cat_grill', Icon: Flame },
  { id: 'shorva', labelKey: 'cat_shorva', Icon: Soup },
  { id: 'salat', labelKey: 'cat_salat', Icon: Salad },
  { id: 'non', labelKey: 'cat_non', Icon: Croissant },
  { id: 'ichimlik', labelKey: 'cat_ichimlik', Icon: Coffee },
  { id: 'shirinlik', labelKey: 'cat_shirinlik', Icon: Cake },
];

interface MenuProps {
  lang: Lang;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

const Menu: React.FC<MenuProps> = ({ lang, cart, setCart }) => {
  const t = T[lang];
  const toast = useToast();
  const [activeCat, setActiveCat] = useState('all');
  // Faol kategoriyalar (admin sozlamasidan) — default: barchasi tartib bilan.
  const [activeCatIds, setActiveCatIds] = useState<string[]>(CAT_META.map(c => c.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState<{ [key: string]: boolean }>(() => {
    try {
      return JSON.parse(localStorage.getItem(LIKES_KEY) || '{}');
    } catch {
      return {};
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [addedStatus, setAddedStatus] = useState<{ [key: string]: boolean }>({});

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [customerAddress, setCustomerAddress] = useState('');
  const [gpsLocation, setGpsLocation] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMenu = async () => {
      setIsLoading(true);
      try {
        setMenuItems(await fetchMenu());
      } catch (err) {
        console.error("Menyuni yuklashda xatolik:", err);
        setMenuItems(DEFAULT_MENU_ITEMS);
      } finally {
        setIsLoading(false);
      }
    };
    loadMenu();
    // Faol kategoriyalar konfiguratsiyasi (admin sozlamasi).
    fetchCategoryConfig()
      .then(cfg => {
        if (!cfg || Object.keys(cfg).length === 0) return;
        const ids = CAT_META
          .map(c => c.id)
          .filter(id => cfg[id]?.active ?? true)
          .sort((a, b) => (cfg[a]?.order ?? 0) - (cfg[b]?.order ?? 0));
        setActiveCatIds(ids);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCat, searchQuery, menuItems, isLoading]);

  // Sevimlilarni localStorage'da saqlash (refresh'da yo'qolmaydi).
  useEffect(() => {
    localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
  }, [likes]);

  const toggleLike = (id: string) => {
    setLikes(prev => {
      const next = { ...prev, [id]: !prev[id] };
      toast(
        next[id]
          ? (lang === 'uz' ? 'Sevimlilarga qo\'shildi' : lang === 'ru' ? 'Добавлено в избранное' : 'Added to favorites')
          : (lang === 'uz' ? 'Sevimlilardan olib tashlandi' : lang === 'ru' ? 'Удалено из избранного' : 'Removed from favorites'),
        next[id] ? 'success' : 'info',
      );
      return next;
    });
  };

  const getDishName = (item: MenuItem) => {
    if (lang === 'ru') return item.nameRu;
    if (lang === 'en') return item.nameEn;
    return item.nameUz;
  };

  const getDishDesc = (item: MenuItem) => {
    if (lang === 'ru') return item.descRu || item.descUz || t[item.descKey] || 'Описание отсутствует.';
    if (lang === 'en') return item.descEn || item.descUz || t[item.descKey] || 'No description available.';
    return item.descUz || t[item.descKey] || 'Tavsif mavjud emas.';
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      toast(lang === 'uz' ? 'Brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi.' : 'Геолокация не поддерживается.', 'error');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        setGpsLocation(mapUrl);
        setIsLocating(false);
        toast(lang === 'uz' ? 'Joylashuv aniqlandi ✓' : lang === 'ru' ? 'Местоположение определено ✓' : 'Location detected ✓', 'success');
      },
      (error) => {
        console.error("GPS aniqlashda xatolik:", error);
        setIsLocating(false);
        toast(lang === 'uz' ? "GPS aniqlashda xatolik. Joylashuvga ruxsat berganingizni tekshiring." : "Ошибка определения GPS.", 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleAddToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        id: item.id,
        nameUz: item.nameUz,
        nameRu: item.nameRu,
        nameEn: item.nameEn,
        price: item.price,
        img: item.img,
        qty: 1
      }];
    });

    setAddedStatus(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedStatus(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const changeQty = (idx: number, delta: number) => {
    setCart(prev => {
      return prev
        .map((item, i) => {
          if (i === idx) {
            return { ...item, qty: item.qty + delta };
          }
          return item;
        })
        .filter(item => item.qty > 0);
    });
  };

  const handleOrderSubmit = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setOrderError(lang === 'uz' ? 'Iltimos, ism va telefon raqamingizni kiriting!' : 'Пожалуйста, введите имя и телефон!');
      return;
    }

    if (!customerAddress.trim() && !gpsLocation) {
      setOrderError(
        lang === 'uz' 
          ? 'Iltimos, yetkazib berish manzilingizni yozing yoki GPS tugmasini bosib joylashuvingizni aniqlang!' 
          : lang === 'ru' 
            ? 'Пожалуйста, введите адрес доставки или определите местоположение по GPS!' 
            : 'Please enter a delivery address or locate via GPS!'
      );
      return;
    }

    setIsSendingOrder(true);
    setOrderError('');

    let orderDetails = `🛒 *Yangi Buyurtma Keldi!*\n\n` +
      `👤 *Mijoz:* ${customerName}\n` +
      `📞 *Telefon:* ${customerPhone}\n`;

    if (customerAddress.trim()) {
      orderDetails += `📍 *Manzil:* ${customerAddress}\n`;
    }

    if (gpsLocation) {
      orderDetails += `🗺️ *GPS Joylashuv:* [Google Maps orqali ko'rish](${gpsLocation})\n`;
    }

    orderDetails += `\n📦 *Buyurtma tarkibi:*\n`;

    cart.forEach((item, idx) => {
      const itemName = lang === 'ru' ? item.nameRu : lang === 'en' ? item.nameEn : item.nameUz;
      orderDetails += `${idx + 1}. *${itemName}* — ${item.qty} dona x ${item.price.toLocaleString()} ${t.currency}\n`;
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    orderDetails += `\n💰 *Jami summa:* ${total.toLocaleString()} ${t.currency}`;

    try {
      const ok = await sendTelegram(orderDetails);
      if (ok) {
        await createOrder({
          customerName,
          customerPhone,
          customerAddress: customerAddress || "Yo'q",
          gpsLocation: gpsLocation || undefined,
          items: cart,
          total,
          date: new Date().toLocaleString()
        });
        setOrderSuccess(true);
      } else {
        setOrderError(lang === 'uz' ? 'Telegramga yuborishda xatolik.' : 'Ошибка отправки.');
      }
    } catch {
      setOrderError(lang === 'uz' ? 'Aloqa xatosi.' : 'Ошибка связи.');
    } finally {
      setIsSendingOrder(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    setIsSendingFeedback(true);

    try {
      await createReview({
        name: customerName || "Anonim",
        rating: feedbackRating,
        text: feedbackText.trim() || "Fikr qoldirilmadi.",
        date: new Date().toLocaleDateString()
      });
      setFeedbackSuccess(true);
      setTimeout(() => {
        setCart([]);
        setIsOrderModalOpen(false);
        setIsCartOpen(false);
        setOrderSuccess(false);
        setFeedbackSuccess(false);
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setGpsLocation(null);
        setFeedbackRating(5);
        setFeedbackText('');
      }, 2500);
    } catch (err) {
      console.error("Feedback yuborishda xatolik:", err);
      setIsOrderModalOpen(false);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const filteredItems = menuItems.filter(item => {
    const matchesCat = activeCat === 'all' || item.cat === activeCat;
    const matchesSearch = getDishName(item).toLowerCase().includes(searchQuery.toLowerCase()) ||
                          getDishDesc(item).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const SkeletonCard = () => (
    <div className="menu-card skeleton-card-loading">
      <div className="card-img-wrap" style={{ background: 'rgba(255,255,255,0.06)', height: '205px' }} />
      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ height: '12px', width: '35%', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }} />
        <div style={{ height: '22px', width: '75%', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }} />
        <div style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }} />
        <div style={{ height: '14px', width: '50%', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }} />
        <div className="card-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
          <div style={{ height: '24px', width: '40%', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }} />
          <div style={{ height: '36px', width: '35%', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }} />
        </div>
      </div>
    </div>
  );

  // SKELETON LOADER QAYTARISH
  if (isLoading) {
    return (
      <>
        <div className="menu-hero" id="menuHero" data-word={t.hero_word}>
          <div className="hero-tag">{t.hero_tag}</div>
          <h1><span>{t.hero_h1a}</span> <em>{t.hero_h1b}</em></h1>
          <p>{t.hero_p}</p>
        </div>

        <div className="section-divider"></div>

        <div className="cat-bar">
          <button className="cat-btn active">
            <Utensils size={18} strokeWidth={1.5} /> <span>{t.cat_all}</span>
          </button>
        </div>

        <div className="search-wrap">
          <div className="search-box">
            <span className="search-icon" style={{ display: 'flex', color: 'var(--muted)' }}><Search size={18} strokeWidth={1.5} /></span>
            <input type="text" placeholder={t.search_placeholder} disabled />
          </div>
        </div>

        <main className="menu-body">
          <section className="menu-section fade-up visible">
            <div className="section-header">
              <span className="section-emoji" style={{ display: 'flex', color: 'var(--gold)' }}><Utensils size={20} strokeWidth={1.5} /></span>
              <h2 className="section-title">Yuklanmoqda...</h2>
              <div className="section-header-line"></div>
            </div>
            <div className="cards-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        </main>
      </>
    );
  }

  // MENYU SAHIFASI
  return (
    <>
      <div className="menu-hero" id="menuHero" data-word={t.hero_word}>
        <div className="hero-tag">{t.hero_tag}</div>
        <h1><span>{t.hero_h1a}</span> <em>{t.hero_h1b}</em></h1>
        <p>{t.hero_p}</p>
      </div>

      <div className="section-divider"></div>

      <div className="cat-bar">
        <button className={`cat-btn ${activeCat === 'all' ? 'active' : ''}`} onClick={() => setActiveCat('all')}>
          <Utensils size={18} strokeWidth={1.5} /> <span>{t.cat_all}</span>
        </button>
        {activeCatIds.map(id => {
          const meta = CAT_META.find(c => c.id === id);
          if (!meta) return null;
          const Icon = meta.Icon;
          return (
            <button key={id} className={`cat-btn ${activeCat === id ? 'active' : ''}`} onClick={() => setActiveCat(id)}>
              <Icon size={18} strokeWidth={1.5} /> <span>{t[meta.labelKey]}</span>
            </button>
          );
        })}
      </div>

      <div className="search-wrap">
        <div className="search-box">
          <span className="search-icon" style={{ display: 'flex', color: 'var(--muted)' }}><Search size={18} strokeWidth={1.5} /></span>
          <input 
            type="text" 
            placeholder={t.search_placeholder} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <main className="menu-body">
        {filteredItems.length === 0 && (
          <EmptyState
            icon={<SearchX size={48} strokeWidth={1.3} />}
            title={lang === 'uz' ? 'Hech narsa topilmadi' : lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}
            description={
              lang === 'uz'
                ? "Qidiruv yoki tanlangan toifa bo'yicha taom yo'q. Boshqa so'z bilan urinib ko'ring."
                : lang === 'ru'
                  ? 'По запросу или категории блюд нет. Попробуйте другой запрос.'
                  : 'No dishes match your search or category. Try another keyword.'
            }
          />
        )}
        {activeCatIds.map(cat => {
          const sectionItems = filteredItems.filter(item => item.cat === cat);
          if (sectionItems.length === 0) return null;

          const sectionTitleMap: { [key: string]: string } = {
            milliy: t.sec_milliy, grill: t.sec_grill, shorva: t.sec_shorva,
            salat: t.sec_salat, non: t.sec_non, ichimlik: t.sec_ichimlik, shirinlik: t.sec_shirinlik
          };

          const sectionEmojiMap: { [key: string]: React.ReactNode } = {
            milliy: <ChefHat size={20} strokeWidth={1.5} />, 
            grill: <Flame size={20} strokeWidth={1.5} />, 
            shorva: <Soup size={20} strokeWidth={1.5} />, 
            salat: <Salad size={20} strokeWidth={1.5} />, 
            non: <Croissant size={20} strokeWidth={1.5} />, 
            ichimlik: <Coffee size={20} strokeWidth={1.5} />, 
            shirinlik: <Cake size={20} strokeWidth={1.5} />
          };

          return (
            <section key={cat} className="menu-section fade-up">
              <div className="section-header">
                <span className="section-emoji" style={{ display: 'flex', color: 'var(--gold)' }}>{sectionEmojiMap[cat]}</span>
                <h2 className="section-title">{sectionTitleMap[cat]}</h2>
                <div className="section-header-line"></div>
              </div>
              <div className="cards-grid">
                {sectionItems.map(item => (
                  <div key={item.id} className="menu-card">
                    <div className="card-img-wrap">
                      {item.badge && (
                        <span className={`card-badge ${item.badge === 'veg' ? 'badge-veg' : item.badge === 'new' ? 'badge-new' : 'badge-hot'}`}>
                          {item.badgeKey ? t[item.badgeKey] : item.badge.toUpperCase()}
                        </span>
                      )}
                      <button className={`card-like ${likes[item.id] ? 'liked' : ''}`} onClick={() => toggleLike(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Heart size={18} strokeWidth={1.5} fill={likes[item.id] ? "var(--rust)" : "none"} color={likes[item.id] ? "var(--rust)" : "var(--muted)"} />
                      </button>
                      <img className="card-img" src={item.img} alt={getDishName(item)} />
                    </div>
                    <div className="card-body">
                      <div className="card-cat-row">
                        <span className="card-cat">{sectionTitleMap[cat]}</span>
                        <span className="card-rating">
                          <Star size={13} strokeWidth={1.6} fill="var(--gold)" color="var(--gold)" />
                          {(4.3 + (item.id.charCodeAt(0) % 7) / 10).toFixed(1)}
                          <small>({40 + (item.id.charCodeAt(item.id.length - 1) % 180)})</small>
                        </span>
                      </div>
                      <div className="card-name">{getDishName(item)}</div>

                      <p className="card-desc">{getDishDesc(item)}</p>
                      
                      <div className="card-meta">{item.meta}</div>
                      <div className="card-footer">
                        <div className="card-price">
                          {item.price.toLocaleString()} <small>{t.currency}</small>
                        </div>
                        <button 
                          className={`add-btn ${addedStatus[item.id] ? 'added' : ''}`} 
                          onClick={() => handleAddToCart(item)}
                          style={addedStatus[item.id] ? { backgroundColor: 'var(--gold)', color: '#120D05', transform: 'scale(1.03)', transition: 'all 0.25s ease' } : {}}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center' }}>{addedStatus[item.id] ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}</span> 
                          <span>{addedStatus[item.id] ? (lang === 'uz' ? "Qo'shildi" : lang === 'ru' ? "Добавлено" : "Added") : t.add_btn}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {totalItemsCount > 0 && (
        <button id="cart-float" className="show" onClick={() => setIsCartOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <ShoppingCart size={18} strokeWidth={1.5} /> <span>{t.cart_label}</span>
          <span className="cart-count">{totalItemsCount}</span>
        </button>
      )}

      {isCartOpen && (
        <div className="modal-overlay cart-overlay open" onClick={(e) => e.target === e.currentTarget && setIsCartOpen(false)}>
          <div className="cart-modal">
            <div className="cart-header">
              <h3>{t.cart_title}</h3>
              <button className="cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="cart-empty-icon" style={{ color: 'var(--muted)', marginBottom: '10px' }}><ShoppingCart size={40} strokeWidth={1.5} /></div>
                <p>{t.cart_empty}</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, idx) => {
                    const itemName = lang === 'ru' ? item.nameRu : lang === 'en' ? item.nameEn : item.nameUz;
                    return (
                      <div key={item.id} className="cart-item">
                        <img className="cart-item-img" src={item.img} alt={itemName} />
                        <div className="cart-item-name">{itemName}</div>
                        <div className="qty-ctrl">
                          <button className="qty-btn" onClick={() => changeQty(idx, -1)}>
                            <Minus size={14} strokeWidth={2} />
                          </button>
                          <span className="qty-num">{item.qty}</span>
                          <button className="qty-btn" onClick={() => changeQty(idx, 1)}>
                            <Plus size={14} strokeWidth={2} />
                          </button>
                        </div>
                        <div className="cart-item-price">{(item.price * item.qty).toLocaleString()} {t.currency}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>{t.cart_total}</span>
                    <span className="cart-total-price">{totalPrice.toLocaleString()} {t.currency}</span>
                  </div>
                  
                  {/* ── 🛠️ TUZATILDI: BUYURTMA BERISh BOSILGANDA SAVATNING OZINI YOPISh BUYRUG'I QO'SHILDI ── */}
                  <button 
                    className="checkout-btn" 
                    onClick={() => {
                      setIsOrderModalOpen(true);
                      setIsCartOpen(false); // <--- SAVAT OYNASI AUTOMATIK YOPILADI!
                    }}
                  >
                    {t.checkout_btn}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {isOrderModalOpen && (
        <div className="order-overlay open" onClick={(e) => e.target === e.currentTarget && setIsOrderModalOpen(false)}>
          <div className="order-modal">
            <div className="order-modal-header">
              <h3>{lang === 'uz' ? 'Buyurtmani Rasmiylashtirish' : lang === 'ru' ? 'Оформление Заказа' : 'Place Your Order'}</h3>
              <p>{lang === 'uz' ? "Ma'lumotlaringizni kiriting" : lang === 'ru' ? 'Введите ваши данные' : 'Enter your details'}</p>
              <button className="order-modal-close" onClick={() => setIsOrderModalOpen(false)}>✕</button>
            </div>
            {!orderSuccess ? (
              <div className="order-modal-body">
                <div className="order-summary">
                  {cart.map(item => {
                    const itemName = lang === 'ru' ? item.nameRu : lang === 'en' ? item.nameEn : item.nameUz;
                    return (
                      <div key={item.id} className="order-summary-item">
                        <span>{itemName} × {item.qty}</span>
                        <span>{(item.price * item.qty).toLocaleString()} {t.currency}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="order-summary-total">
                  <span>{lang === 'uz' ? 'JAMI' : lang === 'ru' ? 'ИТОГО' : 'TOTAL'}</span>
                  <span>{totalPrice.toLocaleString()} {t.currency}</span>
                </div>
                <div className="order-field">
                  <label>{lang === 'uz' ? 'Ism Familiya' : lang === 'ru' ? 'Имя и Фамилия' : 'Full Name'}</label>
                  <input 
                    type="text" 
                    placeholder={lang === 'uz' ? 'Masalan: Bobur Yusupov' : 'Иван Иванов'} 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
                <div className="order-field">
                  <label>{lang === 'uz' ? 'Telefon Raqam' : lang === 'ru' ? 'Номер Телефона' : 'Phone Number'}</label>
                  <input 
                    type="tel" 
                    placeholder="+998 90 123 45 67" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>

                {/* ── 📍 MANZIL VA GPS ANIKLASH INPUTI (YANGI FUNKSIYONALLIK) ── */}
                <div className="order-field">
                  <label>{lang === 'uz' ? 'Yetkazib berish manzili' : lang === 'ru' ? 'Адрес доставки' : 'Delivery Address'}</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder={lang === 'uz' ? 'Chilonzor 9-kvartal, 12-uy (yoki GPS bosing)' : 'Адрес доставки...'} 
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      onClick={handleGetGPS}
                      disabled={isLocating}
                      style={{ 
                        background: gpsLocation ? '#3A7A3A' : 'var(--gold)', 
                        color: gpsLocation ? '#fff' : '#120D05', 
                        padding: '12px', 
                        cursor: 'pointer', 
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        height: '45px',
                        whiteSpace: 'nowrap',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      <MapPin size={16} /> <span>{isLocating ? '...' : (gpsLocation ? 'GPS OK' : 'GPS')}</span>
                    </button>
                  </div>
                  {gpsLocation && (
                    <p style={{ color: '#3A7A3A', fontSize: '0.75rem', marginTop: '6px', fontWeight: 'bold' }}>
                      ✓ {lang === 'uz' ? 'Geolokatsiya muvaffaqiyatli aniqlandi!' : 'Геолокация определена!'}
                    </p>
                  )}
                </div>

                <p style={{ color: 'var(--rust)', fontSize: '0.8rem', marginBottom: '8px' }}>{orderError}</p>
                <button className="order-send-btn" disabled={isSendingOrder} onClick={handleOrderSubmit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={16} strokeWidth={1.5} /> <span>{isSendingOrder ? (lang === 'uz' ? 'Yuborilmoqda...' : 'Отправка...') : (lang === 'uz' ? 'Buyurtma Yuborish' : 'Отправить заказ')}</span>
                </button>
              </div>
            ) : (
              // ── 🌟 YANGI: 5 YULDUZLI FIKR-MULOHAZA QOLDIRISH FORMASI (ORDER SUCCESS O'RNIDA) ──
              <div className="order-success show" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {!feedbackSuccess ? (
                  <>
                    <div className="order-success-icon" style={{ color: '#3A7A3A', marginBottom: '14px' }}>
                      <CheckCircle2 size={56} strokeWidth={1.5} />
                    </div>
                    <h4 style={{ marginBottom: '6px', fontFamily: 'Playfair Display, serif', fontSize: '1.4rem' }}>
                      {lang === 'uz' ? 'Buyurtmangiz Qabul Qilindi!' : 'Заказ Принят!'}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '24px', textAlign: 'center' }}>
                      {lang === 'uz' ? 'Operatorimiz tez orada bog\'lanadi. Iltimos, xizmatimizni baholang:' : 'Оператор свяжется в ближайшее время. Пожалуйста, оцените нас:'}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '18px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          type="button" 
                          onClick={() => setFeedbackRating(star)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', padding: 0 }}
                        >
                          <Star 
                            size={32} 
                            strokeWidth={1.5} 
                            fill={star <= feedbackRating ? 'var(--gold)' : 'none'} 
                            color="var(--gold)" 
                          />
                        </button>
                      ))}
                    </div>

                    <div className="order-field" style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {lang === 'uz' ? 'Fikr-mulohazangiz (ixtiyoriy):' : 'Ваш отзыв (необязательно):'}
                      </label>
                      <textarea 
                        placeholder={lang === 'uz' ? 'Taomlar va dastavka xizmati sizga yoqdimi?...' : 'Ваш отзыв...'} 
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          background: 'var(--bg2)', 
                          border: '1px solid var(--border)', 
                          color: 'var(--text)', 
                          outline: 'none', 
                          resize: 'none', 
                          height: '75px',
                          fontSize: '0.85rem',
                          fontFamily: 'inherit',
                          marginTop: '6px'
                        }}
                      />
                    </div>

                    <button 
                      type="button"
                      className="order-send-btn" 
                      disabled={isSendingFeedback}
                      onClick={handleFeedbackSubmit}
                      style={{ background: 'var(--gold)', color: '#120D05' }}
                    >
                      <span>{isSendingFeedback ? '...' : (lang === 'uz' ? 'Fikrni yuborish' : 'Отправить отзыв')}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="order-success-icon" style={{ color: '#3A7A3A', marginBottom: '18px' }}>
                      <CheckCircle2 size={56} strokeWidth={1.5} />
                    </div>
                    <h4 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.45rem', marginBottom: '8px' }}>
                      {lang === 'uz' ? 'Katta Rahmat!' : 'Спасибо!'}
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: 'var(--muted)' }}>
                      {lang === 'uz' ? 'Fikr-mulohazangiz muvaffaqiyatli qabul qilindi.' : 'Ваш отзыв успешно сохранен.'}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Menu;