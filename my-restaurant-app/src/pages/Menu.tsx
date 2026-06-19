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
  CheckCircle2 
} from 'lucide-react';

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

interface MenuProps {
  lang: string;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
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

const Menu: React.FC<MenuProps> = ({ lang, cart, setCart }) => {
  const t = T[lang];
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [addedStatus, setAddedStatus] = useState<{ [key: string]: boolean }>({});

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isSendingOrder, setIsSendingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${DB_URL}/menu.json`);
        const data = await response.json();
        if (data) {
          const itemsArray = Object.values(data) as MenuItem[];
          setMenuItems(itemsArray);
        } else {
          const initialMenu: { [key: string]: MenuItem } = {};
          DEFAULT_MENU_ITEMS.forEach(item => {
            initialMenu[item.id] = item;
          });
          await fetch(`${DB_URL}/menu.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initialMenu)
          });
          setMenuItems(DEFAULT_MENU_ITEMS);
        }
      } catch (err) {
        console.error("Menyuni yuklashda xatolik:", err);
        setMenuItems(DEFAULT_MENU_ITEMS);
      }
    };
    fetchMenu();
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
  }, [activeCat, searchQuery, menuItems]);

  const toggleLike = (id: string) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }));
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
    if (!customerName.trim() || !customerPhone.trim()) return;

    setIsSendingOrder(true);
    setOrderError('');

    const TG_BOT_TOKEN = '8868012287:AAFa67M5cikUi41-QfyxGBf9NSxxgKwENqA';
    const TG_CHAT_ID = '6148610387';

    let orderDetails = `🛒 *Yangi Buyurtma Keldi!*\n\n` +
      `👤 *Mijoz:* ${customerName}\n` +
      `📞 *Telefon:* ${customerPhone}\n\n` +
      `📦 *Buyurtma tarkibi:*\n`;

    cart.forEach((item, idx) => {
      const itemName = lang === 'ru' ? item.nameRu : lang === 'en' ? item.nameEn : item.nameUz;
      orderDetails += `${idx + 1}. *${itemName}* — ${item.qty} dona x ${item.price.toLocaleString()} ${t.currency}\n`;
    });

    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    orderDetails += `\n💰 *Jami summa:* ${total.toLocaleString()} ${t.currency}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: orderDetails, parse_mode: 'Markdown' })
      });
      const data = await response.json();
      if (data.ok) {
        const newOrderObj = {
          customerName,
          customerPhone,
          items: cart,
          total,
          date: new Date().toLocaleString()
        };

        await fetch(`${DB_URL}/orders.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrderObj)
        });

        setOrderSuccess(true);
        setTimeout(() => {
          setCart([]);
          setIsOrderModalOpen(false);
          setIsCartOpen(false);
          setOrderSuccess(false);
          setCustomerName('');
          setCustomerPhone('');
        }, 3000);
      } else {
        setOrderError('Xatolik: ' + (data.description || "noma'lum"));
      }
    } catch (err) {
      setOrderError(lang === 'uz' ? 'Aloqa xatosi.' : 'Ошибка связи.');
    } finally {
      setIsSendingOrder(false);
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
        <button className={`cat-btn ${activeCat === 'milliy' ? 'active' : ''}`} onClick={() => setActiveCat('milliy')}>
          <ChefHat size={18} strokeWidth={1.5} /> <span>{t.cat_milliy}</span>
        </button>
        <button className={`cat-btn ${activeCat === 'grill' ? 'active' : ''}`} onClick={() => setActiveCat('grill')}>
          <Flame size={18} strokeWidth={1.5} /> <span>{t.cat_grill}</span>
        </button>
        <button className={`cat-btn ${activeCat === 'shorva' ? 'active' : ''}`} onClick={() => setActiveCat('shorva')}>
          <Soup size={18} strokeWidth={1.5} /> <span>{t.cat_shorva}</span>
        </button>
        <button className={`cat-btn ${activeCat === 'salat' ? 'active' : ''}`} onClick={() => setActiveCat('salat')}>
          <Salad size={18} strokeWidth={1.5} /> <span>{t.cat_salat}</span>
        </button>
        <button className={`cat-btn ${activeCat === 'non' ? 'active' : ''}`} onClick={() => setActiveCat('non')}>
          <Croissant size={18} strokeWidth={1.5} /> <span>{t.cat_non}</span>
        </button>
        <button className={`cat-btn ${activeCat === 'ichimlik' ? 'active' : ''}`} onClick={() => setActiveCat('ichimlik')}>
          <Coffee size={18} strokeWidth={1.5} /> <span>{t.cat_ichimlik}</span>
        </button>
        <button className={`cat-btn ${activeCat === 'shirinlik' ? 'active' : ''}`} onClick={() => setActiveCat('shirinlik')}>
          <Cake size={18} strokeWidth={1.5} /> <span>{t.cat_shirinlik}</span>
        </button>
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
        {['milliy', 'grill', 'shorva', 'salat', 'non', 'ichimlik', 'shirinlik'].map(cat => {
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
                      <div className="card-cat">{sectionTitleMap[cat]}</div>
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
                          style={addedStatus[item.id] ? { backgroundColor: '#3A7A3A', color: '#fff' } : {}}
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
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setIsCartOpen(false)}>
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
                  <button className="checkout-btn" onClick={() => setIsOrderModalOpen(true)}>{t.checkout_btn}</button>
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
                <p style={{ color: 'var(--rust)', fontSize: '0.8rem', marginBottom: '8px' }}>{orderError}</p>
                <button className="order-send-btn" disabled={isSendingOrder} onClick={handleOrderSubmit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Send size={16} strokeWidth={1.5} /> <span>{isSendingOrder ? (lang === 'uz' ? 'Yuborilmoqda...' : 'Отправка...') : (lang === 'uz' ? 'Buyurtma Yuborish' : 'Отправить заказ')}</span>
                </button>
              </div>
            ) : (
              <div className="order-success show">
                <div className="order-success-icon" style={{ color: '#3A7A3A', marginBottom: '18px' }}><CheckCircle2 size={56} strokeWidth={1.5} /></div>
                <h4>{lang === 'uz' ? 'Buyurtma Qabul Qilindi!' : 'Заказ Принят!'}</h4>
                <p>{lang === 'uz' ? 'Operatorimiz tez orada siz bilan bog\'lanadi.' : 'Наш operator скоро свяжется с вами.'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Menu;