import React, { useState, useEffect } from 'react';
import { T } from '../translations';
import { Star, Leaf, ChefHat, MapPin, Phone, Clock, UtensilsCrossed, CheckCircle2 } from 'lucide-react';
import type { Lang, Page, CustomerReview, MenuItem } from '../lib/types';
import { createReservation, sendTelegram, fetchReviews, fetchMenu } from '../lib/api';
import { CountUp } from '../components/ui';

interface HomeProps {
  lang: Lang;
  setPage: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ lang, setPage }) => {
  const t = T[lang];
  const [activeTab, setActiveTab] = useState<'asosiy' | 'shorva' | 'grill' | 'shirinlik'>('asosiy');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '1–2 kishi',
    tableNumber: '1-stol', // ── YANGI STOL RAQAMI STATE'I ──
    wish: ''
  });
  const [errors, setErrors] = useState({ name: false, phone: false, date: false, time: false });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [menuPreview, setMenuPreview] = useState<MenuItem[]>([]);

  // Real mijoz fikrlarini DB'dan olamiz (matnli, yuqori baholilar).
  useEffect(() => {
    fetchReviews()
      .then((all) => {
        const good = all
          .filter((r) => r.rating >= 4 && r.text && r.text !== 'Fikr qoldirilmadi.' && r.text.trim() !== '')
          .reverse()
          .slice(0, 3);
        setReviews(good);
      })
      .catch(() => {});
    // Tanlangan menyu — Menu sahifa bilan bir xil DB manbadan.
    fetchMenu().then(setMenuPreview).catch(() => {});
  }, []);

  // Tab → menyu kategoriyasi.
  const TAB_CAT: Record<typeof activeTab, string> = {
    asosiy: 'milliy', shorva: 'shorva', grill: 'grill', shirinlik: 'shirinlik',
  };
  const getName = (m: MenuItem) => (lang === 'ru' ? m.nameRu : lang === 'en' ? m.nameEn : m.nameUz);
  const getDesc = (m: MenuItem) =>
    (lang === 'ru' ? m.descRu : lang === 'en' ? m.descEn : m.descUz) || m.descUz ||
    t[m.descKey] || '';
  const previewItems = menuPreview.filter((m) => m.cat === TAB_CAT[activeTab]).slice(0, 3);

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
      { threshold: 0.05 }
    );
    
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const fieldMap: { [key: string]: string } = {
      'rm-name': 'name',
      'rm-phone': 'phone',
      'rm-date': 'date',
      'rm-time': 'time',
      'rm-guests': 'guests',
      'rm-tableNumber': 'tableNumber', // ── FIELD MAP YANGILANDI ──
      'rm-wish': 'wish'
    };
    const stateKey = fieldMap[id];
    if (stateKey) {
      setFormData(prev => ({ ...prev, [stateKey]: value }));
    }
  };

  const handleReservationSubmit = async () => {
    const { name, phone, date, time, guests, tableNumber, wish } = formData;
    const newErrors = {
      name: !name.trim(),
      phone: !phone.trim(),
      date: !date,
      time: !time
    };

    setErrors(newErrors);

    if (newErrors.name || newErrors.phone || newErrors.date || newErrors.time) {
      const errTexts: { [key: string]: string } = {
        uz: "Iltimos, ism, telefon, sana va vaqtni kiriting!",
        ru: "Пожалуйста, заполните имя, телефон, дату и время!",
        en: "Please enter name, phone, date and time!"
      };
      setErrorMsg(errTexts[lang] || errTexts.uz);
      return;
    }

    setErrorMsg('');
    setIsSending(true);

    // Telegram xabarga stol raqami ham qo'shildi
    const message = `🔔 *Yangi Stol Band Qilindi!*\n\n` +
      `👤 *Ism:* ${name}\n` +
      `📞 *Telefon:* ${phone}\n` +
      `📅 *Sana:* ${date}\n` +
      `🕒 *Vaqt:* ${time}\n` +
      `🪑 *Stol raqami:* ${tableNumber}\n` +
      `👥 *Mehmonlar:* ${guests}\n` +
      `✍️ *Istak:* ${wish || "Yo'q"}`;

    try {
      const ok = await sendTelegram(message);
      if (ok) {
        await createReservation({
          name, phone, date, time, guests, tableNumber, wish,
          createdAt: new Date().toISOString()
        });

        setIsSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setIsSuccess(false);
          setFormData({ name: '', phone: '', date: '', time: '', guests: '1–2 kishi', tableNumber: '1-stol', wish: '' });
        }, 3500);
      } else {
        setErrorMsg(lang === 'uz' ? 'Telegramga yuborishda xatolik.' : 'Ошибка отправки.');
      }
    } catch {
      setErrorMsg(lang === 'uz' ? 'Tarmoq xatosi. Internet aloqangizni tekshiring.' : 'Ошибка сети.');
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) =>
    name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <>
      {/* HERO SECTION */}
      <section id="hero">
        <div className="hero-left">
          <div className="hero-tag">{t.hero_tag}</div>
          <h1 dangerouslySetInnerHTML={{ __html: t.hero_h1 }} />
          <p className="hero-desc">{t.hero_desc}</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => setPage('menu')}>{t.hero_btn1}</button>
            <a href="#reservation" className="btn-ghost">{t.hero_btn2}</a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="stat-num"><CountUp value={14} suffix="+" /></div>
              <div className="stat-label">{t.stat1}</div>
            </div>
            <div>
              <div className="stat-num"><CountUp value={48} suffix="k" /></div>
              <div className="stat-label">{t.stat2}</div>
            </div>
            <div>
              <div className="stat-num"><CountUp value={120} suffix="+" /></div>
              <div className="stat-label">{t.stat3}</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <img className="hero-img" src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80" alt="Restoran" />
          <div className="hero-img-overlay"></div>
          <div className="hero-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span className="hero-badge-num" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={20} fill="currentColor" strokeWidth={1.5} /> 4.9
            </span>
            <span className="hero-badge-text">{t.badge_rating}</span>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* ABOUT SECTION */}
      <section id="about">
        <div className="about-images fade-up">
          <img className="about-img-main" src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=700&q=80" alt="Restoran ichkarisi" />
          <img className="about-img-small" src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80" alt="Taom" />
          <div className="about-gold-line"></div>
        </div>
        <div className="fade-up">
          <div className="section-tag">{t.about_tag}</div>
          <h2>{t.about_h2}</h2>
          <p className="about-text">{t.about_p1}</p>
          <p className="about-text">{t.about_p2}</p>
          <div className="about-features">
            <div className="feature-item">
              <div className="feature-icon"><Leaf size={24} strokeWidth={1.5} color="var(--gold)" /></div>
              <div>
                <div className="feature-title">{t.feat1_title}</div>
                <div className="feature-desc">{t.feat1_desc}</div>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><ChefHat size={24} strokeWidth={1.5} color="var(--gold)" /></div>
              <div>
                <div className="feature-title">{t.feat2_title}</div>
                <div className="feature-desc">{t.feat2_desc}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTED MENU SECTION */}
      <section id="menu">
        <div className="menu-header fade-up">
          <div className="section-tag">{t.menu_tag}</div>
          <h2>{t.menu_h2}</h2>
        </div>
        <div className="menu-tabs fade-up">
          <button className={`tab-btn ${activeTab === 'asosiy' ? 'active' : ''}`} onClick={() => setActiveTab('asosiy')}>{t.tab1}</button>
          <button className={`tab-btn ${activeTab === 'shorva' ? 'active' : ''}`} onClick={() => setActiveTab('shorva')}>{t.tab2}</button>
          <button className={`tab-btn ${activeTab === 'grill' ? 'active' : ''}`} onClick={() => setActiveTab('grill')}>{t.tab3}</button>
          <button className={`tab-btn ${activeTab === 'shirinlik' ? 'active' : ''}`} onClick={() => setActiveTab('shirinlik')}>{t.tab4}</button>
        </div>
        
        <div className="menu-grid">
          {previewItems.length === 0 ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="menu-card skeleton-card-loading" style={{ minHeight: '380px' }} />
            ))
          ) : (
            previewItems.map((item) => (
              <div key={item.id} className="menu-card fade-up visible">
                {item.badge && (
                  <div className="menu-badge">
                    {item.badgeKey ? t[item.badgeKey] : item.badge === 'veg' ? t.badge_veg : item.badge === 'new' ? t.badge_new : t.badge_popular}
                  </div>
                )}
                <img className="menu-card-img" src={item.img} alt={getName(item)} loading="lazy" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t['tab' + (activeTab === 'asosiy' ? '1' : activeTab === 'shorva' ? '2' : activeTab === 'grill' ? '3' : '4')]}</div>
                  <div className="menu-card-name">{getName(item)}</div>
                  <p className="menu-card-desc">{getDesc(item)}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{item.price.toLocaleString()} {t.currency}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section id="reviews">
        <div className="reviews-header fade-up">
          <div className="section-tag">{t.reviews_tag}</div>
          <h2>{t.reviews_h2}</h2>
        </div>
        <div className="reviews-grid">
          {reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="review-card fade-up visible">
                <div className="stars">{'⭐'.repeat(Math.min(5, Math.max(1, r.rating)))}</div>
                <p className="review-text">"{r.text}"</p>
                <div className="reviewer">
                  <div className="reviewer-avatar reviewer-avatar--initials">{getInitials(r.name)}</div>
                  <div>
                    <div className="reviewer-name">{r.name}</div>
                    <div className="reviewer-loc">{r.date}</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="review-card fade-up">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">{t.review1}</p>
                <div className="reviewer">
                  <img className="reviewer-avatar" src="https://i.pravatar.cc/100?img=1" alt="Mehmon" />
                  <div>
                    <div className="reviewer-name">Bobur Yusupov</div>
                    <div className="reviewer-loc">Toshkent</div>
                  </div>
                </div>
              </div>
              <div className="review-card fade-up">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">{t.review2}</p>
                <div className="reviewer">
                  <img className="reviewer-avatar" src="https://i.pravatar.cc/100?img=5" alt="Mehmon" />
                  <div>
                    <div className="reviewer-name">Malika Rahimova</div>
                    <div className="reviewer-loc">Samarqand</div>
                  </div>
                </div>
              </div>
              <div className="review-card fade-up">
                <div className="stars">⭐⭐⭐⭐⭐</div>
                <p className="review-text">{t.review3}</p>
                <div className="reviewer">
                  <img className="reviewer-avatar" src="https://i.pravatar.cc/100?img=12" alt="Mehmon" />
                  <div>
                    <div className="reviewer-name">Jamshid Karimov</div>
                    <div className="reviewer-loc">Namangan</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* RESERVATION/CONTACT SECTION */}
      <section id="reservation">
        <div className="reservation-info fade-up">
          <div className="section-tag">{t.res_tag}</div>
          <h2>{t.res_h2}</h2>
          <p>{t.res_desc}</p>
          <div className="contact-items">
            <div className="contact-item">
              <div className="contact-icon"><MapPin size={20} strokeWidth={1.5} color="#fff" /></div>
              <div>
                <div className="contact-label">{t.contact_address_label}</div>
                <div className="contact-value">{t.contact_address_val}</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Phone size={20} strokeWidth={1.5} color="#fff" /></div>
              <div>
                <div className="contact-label">{t.contact_phone_label}</div>
                <div className="contact-value">+998 71 234 56 78</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon"><Clock size={20} strokeWidth={1.5} color="#fff" /></div>
              <div>
                <div className="contact-label">{t.contact_hours_label}</div>
                <div className="contact-value">{t.contact_hours_val}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="reservation-form fade-up" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '28px', textAlign: 'center' }}>
          <div style={{ color: 'var(--gold)', marginBottom: '10px' }}><UtensilsCrossed size={48} strokeWidth={1.5} /></div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--cream)' }}>{t.form_title}</h3>
          <p style={{ color: 'rgba(245,239,224,0.5)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '320px' }}>{t.form_subtitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,147,58,0.2)' }}>
              <span style={{ color: 'var(--gold)', display: 'flex' }}><MapPin size={18} strokeWidth={1.5} /></span>
              <span style={{ fontSize: '0.88rem', color: 'rgba(245,239,224,0.7)' }}>{t.contact_address_val}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,147,58,0.2)' }}>
              <span style={{ color: 'var(--gold)', display: 'flex' }}><Clock size={18} strokeWidth={1.5} /></span>
              <span style={{ fontSize: '0.88rem', color: 'rgba(245,239,224,0.7)' }}>{t.contact_hours_val}</span>
            </div>
          </div>
          <button className="form-btn" id="resBtn" onClick={() => setIsModalOpen(true)} style={{ width: '100%', marginTop: '8px' }}>
            {t.form_btn}
          </button>
        </div>
      </section>

      {/* RESERVATION MODAL */}
      {isModalOpen && (
        <div className="res-overlay open" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="res-modal">
            <div className="res-modal-header">
              <h3>{t.form_title}</h3>
              <p>{t.form_subtitle}</p>
              <button className="res-modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            {!isSuccess ? (
              <div className="res-modal-body">
                <div className="res-modal-row">
                  <div className="res-modal-field">
                    <label style={{ color: errors.name ? 'var(--rust)' : '' }}>{t.form_name}</label>
                    <input 
                      type="text" 
                      id="rm-name" 
                      placeholder={t.form_name_ph} 
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{ borderColor: errors.name ? 'var(--rust)' : '' }}
                    />
                  </div>
                  <div className="res-modal-field">
                    <label style={{ color: errors.phone ? 'var(--rust)' : '' }}>{t.form_phone}</label>
                    <input 
                      type="tel" 
                      id="rm-phone" 
                      placeholder="+998 90 123 45 67" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{ borderColor: errors.phone ? 'var(--rust)' : '' }}
                    />
                  </div>
                </div>
                <div className="res-modal-row">
                  <div className="res-modal-field">
                    <label style={{ color: errors.date ? 'var(--rust)' : '' }}>{t.form_date}</label>
                    <input 
                      type="date" 
                      id="rm-date" 
                      value={formData.date}
                      onChange={handleInputChange}
                      style={{ borderColor: errors.date ? 'var(--rust)' : '' }}
                    />
                  </div>
                  <div className="res-modal-field">
                    <label style={{ color: errors.time ? 'var(--rust)' : '' }}>{t.form_time}</label>
                    <input 
                      type="time" 
                      id="rm-time" 
                      value={formData.time}
                      onChange={handleInputChange}
                      style={{ borderColor: errors.time ? 'var(--rust)' : '' }}
                    />
                  </div>
                </div>

                {/* ── 🪑 STOL TANLASH VA MEHMONLAR SONI ── */}
                <div className="res-modal-row">
                  <div className="res-modal-field">
                    <label>{t.form_guests}</label>
                    <select id="rm-guests" value={formData.guests} onChange={handleInputChange}>
                      <option value="1–2 kishi">{t.guests1}</option>
                      <option value="3–4 kishi">{t.guests2}</option>
                      <option value="5–8 kishi">{t.guests3}</option>
                      <option value="9+ kishi (banket)">{t.guests4}</option>
                    </select>
                  </div>
                  
                  {/* ── YANGI: 1 DAN 30 GACHA STOL TANLOVI ── */}
                  <div className="res-modal-field">
                    <label>Stol Raqami (1–30)</label>
                    <select id="rm-tableNumber" value={formData.tableNumber} onChange={handleInputChange}>
                      {Array.from({ length: 30 }).map((_, i) => (
                        <option key={i} value={`${i + 1}-stol`}>{i + 1}-stol</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="res-modal-field full">
                  <label>{t.form_wish}</label>
                  <input 
                    type="text" 
                    id="rm-wish" 
                    placeholder={t.form_wish_ph} 
                    value={formData.wish}
                    onChange={handleInputChange}
                  />
                </div>
                <p className="res-error">{errorMsg}</p>
                <button className="res-send-btn" disabled={isSending} onClick={handleReservationSubmit}>
                  <span>{isSending ? (lang === 'uz' ? 'Yuborilmoqda...' : lang === 'ru' ? 'Отправка...' : 'Sending...') : t.form_btn}</span>
                </button>
              </div>
            ) : (
              <div className="res-success show">
                <div className="res-success-icon" style={{ color: '#3A7A3A', marginBottom: '16px' }}><CheckCircle2 size={56} strokeWidth={1.5} /></div>
                <h4>{lang === 'uz' ? 'Stol Band Qilindi!' : lang === 'ru' ? 'Стол Забронирован!' : 'Table Reserved!'}</h4>
                <p>{lang === 'uz' ? 'Tez orada siz bilan bog\'lanamiz.' : lang === 'ru' ? 'Мы свяжемся с вами в ближайшее время.' : 'We will contact you shortly.'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;