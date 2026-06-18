
import React, { useState, useEffect } from 'react';
import { T } from '../translations';

interface HomeProps {
  lang: string;
  setPage: (page: 'home' | 'menu') => void;
}

const Home: React.FC<HomeProps> = ({ lang, setPage }) => {
  const t = T[lang];
  const [activeTab, setActiveTab] = useState<'asosiy' | 'shorva' | 'grill' | 'shirinlik'>('asosiy');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Rezervatsiya formasi holati
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    guests: '1–2 kishi',
    wish: ''
  });
  const [errors, setErrors] = useState({ name: false, phone: false, date: false, time: false });
  const [errorMsg, setErrorMsg] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      { threshold: 0.12 }
    );
    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const fieldMap: { [key: string]: string } = {
      'rm-name': 'name',
      'rm-phone': 'phone',
      'rm-date': 'date',
      'rm-time': 'time',
      'rm-guests': 'guests',
      'rm-wish': 'wish'
    };
    const stateKey = fieldMap[id];
    if (stateKey) {
      setFormData(prev => ({ ...prev, [stateKey]: value }));
    }
  };

  const handleReservationSubmit = async () => {
    const { name, phone, date, time, guests, wish } = formData;
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

    const TG_BOT_TOKEN = '8868012287:AAFa67M5cikUi41-QfyxGBf9NSxxgKwENqA';
    const TG_CHAT_ID = '6148610387';
    const message = `🔔 *Yangi Stol Band Qilindi!*\n\n` +
      `👤 *Ism:* ${name}\n` +
      `📞 *Telefon:* ${phone}\n` +
      `📅 *Sana:* ${date}\n` +
      `🕒 *Vaqt:* ${time}\n` +
      `👥 *Mehmonlar:* ${guests}\n` +
      `✍️ *Istak:* ${wish || "Yo'q"}`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text: message, parse_mode: 'Markdown' })
      });
      const data = await response.json();
      if (data.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsModalOpen(false);
          setIsSuccess(false);
          setFormData({ name: '', phone: '', date: '', time: '', guests: '1–2 kishi', wish: '' });
        }, 3500);
      } else {
        setErrorMsg('Xatolik: ' + (data.description || "noma'lum"));
      }
    } catch (err) {
      setErrorMsg(lang === 'uz' ? 'Tarmoq xatosi. Internet aloqangizni tekshiring.' : 'Ошибка сети.');
    } finally {
      setIsSending(false);
    }
  };

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
              <div className="stat-num">14+</div>
              <div className="stat-label">{t.stat1}</div>
            </div>
            <div>
              <div className="stat-num">48k</div>
              <div className="stat-label">{t.stat2}</div>
            </div>
            <div>
              <div className="stat-num">120+</div>
              <div className="stat-label">{t.stat3}</div>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <img className="hero-img" src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80" alt="Restoran" />
          <div className="hero-img-overlay"></div>
          <div className="hero-badge">
            <span className="hero-badge-num">⭐ 4.9</span>
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
              <div className="feature-icon">🌿</div>
              <div>
                <div className="feature-title">{t.feat1_title}</div>
                <div className="feature-desc">{t.feat1_desc}</div>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">👨‍🍳</div>
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
          {/* ASOSIY */}
          {activeTab === 'asosiy' && (
            <>
              <div className="menu-card fade-up">
                <div className="menu-badge">{t.badge_popular}</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80" alt="Osh" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.card1_cat}</div>
                  <div className="menu-card-name">{t.card1_name}</div>
                  <p className="menu-card-desc">{t.card1_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.card1_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80" alt="Dimlama" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.card1_cat}</div>
                  <div className="menu-card-name">{t.extra1_name}</div>
                  <p className="menu-card-desc">{t.extra1_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.extra1_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <div className="menu-badge">{t.badge_new}</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80" alt="Manti" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.card1_cat}</div>
                  <div className="menu-card-name">{t.extra2_name}</div>
                  <p className="menu-card-desc">{t.extra2_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.extra2_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SHO'RVALAR */}
          {activeTab === 'shorva' && (
            <>
              <div className="menu-card fade-up">
                <div className="menu-badge">{t.badge_popular}</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&q=80" alt="Shorva" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab2}</div>
                  <div className="menu-card-name">{t.sh1_name}</div>
                  <p className="menu-card-desc">{t.sh1_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.sh1_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80" alt="Mastava" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab2}</div>
                  <div className="menu-card-name">{t.sh2_name}</div>
                  <p className="menu-card-desc">{t.sh2_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.sh2_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <div className="menu-badge">{t.badge_new}</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=600&q=80" alt="Lagmon" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab2}</div>
                  <div className="menu-card-name">{t.sh3_name}</div>
                  <p className="menu-card-desc">{t.sh3_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.sh3_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* GRILL */}
          {activeTab === 'grill' && (
            <>
              <div className="menu-card fade-up">
                <div className="menu-badge">Top</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80" alt="Kabob" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab3}</div>
                  <div className="menu-card-name">{t.card2_name}</div>
                  <p className="menu-card-desc">{t.card2_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.card2_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=600&q=80" alt="Lula" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab3}</div>
                  <div className="menu-card-name">{t.gr2_name}</div>
                  <p className="menu-card-desc">{t.gr2_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.gr2_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <div className="menu-badge">{t.badge_new}</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80" alt="Tikka" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab3}</div>
                  <div className="menu-card-name">{t.gr3_name}</div>
                  <p className="menu-card-desc">{t.gr3_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.gr3_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* SHIRINLIKLAR */}
          {activeTab === 'shirinlik' && (
            <>
              <div className="menu-card fade-up">
                <div className="menu-badge">Top</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80" alt="Chak-chak" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab4}</div>
                  <div className="menu-card-name">{t.sw1_name}</div>
                  <p className="menu-card-desc">{t.sw1_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.sw1_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80" alt="Halva" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab4}</div>
                  <div className="menu-card-name">{t.sw2_name}</div>
                  <p className="menu-card-desc">{t.sw2_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.sw2_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
              <div className="menu-card fade-up">
                <div className="menu-badge">{t.badge_new}</div>
                <img className="menu-card-img" src="https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80" alt="Qand Pishiriq" />
                <div className="menu-card-body">
                  <div className="menu-card-tag">{t.tab4}</div>
                  <div className="menu-card-name">{t.sw3_name}</div>
                  <p className="menu-card-desc">{t.sw3_desc}</p>
                  <div className="menu-card-footer">
                    <span className="menu-price">{t.sw3_price}</span>
                    <button className="menu-order-btn" onClick={() => setPage('menu')}>{t.order_btn}</button>
                  </div>
                </div>
              </div>
            </>
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
              <div className="contact-icon">📍</div>
              <div>
                <div className="contact-label">{t.contact_address_label}</div>
                <div className="contact-value">{t.contact_address_val}</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div>
                <div className="contact-label">{t.contact_phone_label}</div>
                <div className="contact-value">+998 71 234 56 78</div>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">🕐</div>
              <div>
                <div className="contact-label">{t.contact_hours_label}</div>
                <div className="contact-value">{t.contact_hours_val}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="reservation-form fade-up" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>🍽️</div>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: 'var(--cream)' }}>{t.form_title}</h3>
          <p style={{ color: 'rgba(245,239,224,0.5)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: '320px' }}>{t.form_subtitle}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,147,58,0.2)' }}>
              <span style={{ fontSize: '1.2rem' }}>📍</span>
              <span style={{ fontSize: '0.88rem', color: 'rgba(245,239,224,0.7)' }}>{t.contact_address_val}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,147,58,0.2)' }}>
              <span style={{ fontSize: '1.2rem' }}>🕐</span>
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
                <div className="res-modal-field full">
                  <label>{t.form_guests}</label>
                  <select id="rm-guests" value={formData.guests} onChange={handleInputChange}>
                    <option value="1–2 kishi">{t.guests1}</option>
                    <option value="3–4 kishi">{t.guests2}</option>
                    <option value="5–8 kishi">{t.guests3}</option>
                    <option value="9+ kishi (banket)">{t.guests4}</option>
                  </select>
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
                <div className="res-success-icon">🎉</div>
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