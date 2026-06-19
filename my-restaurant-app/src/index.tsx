import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Loader from './components/Loader';
import Admin from './pages/Admin';
import { T } from './translations';
import { Sun, Moon, Lock, Send, ArrowUp } from 'lucide-react';

interface CartItem {
  id: string;
  nameUz: string;
  nameRu: string;
  nameEn: string;
  price: number;
  img: string;
  qty: number;
}

// ── CUSTOM LOGO SVG COMPONENTLARI (Lucide brand ikonkalar o'rniga xavfsiz variant) ──
const FacebookIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'menu' | 'admin'>('home');
  const [lang, setLang] = useState<'uz' | 'ru' | 'en'>('uz');
  const [isDark, setIsDark] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
      const navbar = document.getElementById('navbar');
      if (navbar) {
        navbar.style.boxShadow = window.scrollY > 40 ? '0 4px 32px rgba(26,18,8,0.14)' : 'none';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.setAttribute('data-theme', nextDark ? 'dark' : 'light');
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const handlePageChange = (page: 'home' | 'menu' | 'admin') => {
    setCurrentPage(page);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const t = T[lang];

  return (
    <>
      {loading && <Loader />}

      {/* NAVIGATION BAR - FAQAT ADMIN SAHIFASIDA BO'LMAGANDA KO'RINADI */}
      {currentPage !== 'admin' && (
        <nav id="navbar">
          <span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('home')} className="nav-logo">
            Zafar <span>Dasturxon</span>
          </span>
          <ul className="nav-links">
            <li>
              <a 
                href="#about" 
                className={currentPage === 'home' ? 'active' : ''} 
                onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              >
                {t.nav_about}
              </a>
            </li>
            <li>
              <span 
                style={{ cursor: 'pointer' }} 
                className={currentPage === 'menu' ? 'active' : ''} 
                onClick={() => handlePageChange('menu')}
              >
                {t.nav_menu}
              </span>
            </li>
            <li>
              <a 
                href="#reviews" 
                onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              >
                {t.nav_reviews}
              </a>
            </li>
            <li>
              <a 
                href="#reservation" 
                onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              >
                {t.nav_contact}
              </a>
            </li>
          </ul>
          <div className="nav-controls">
            <button className={`burger ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
              <span></span><span></span><span></span>
            </button>
            <div className="lang-switcher">
              <button className={`lang-btn ${lang === 'uz' ? 'active' : ''}`} onClick={() => setLang('uz')}>UZ</button>
              <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
              <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
            
            {/* SUN / MOON ICONKASI */}
            <button className="theme-toggle" id="themeToggle" onClick={toggleTheme}>
              {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>
            
            {/* ADMIN PANELGA KIRISH TUGMASI */}
            <button 
              className="theme-toggle lock-nav-btn" 
              title="Admin Panel" 
              onClick={() => handlePageChange('admin')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg2)', border: '1px solid var(--border)' }}
            >
              <Lock size={16} strokeWidth={1.5} color="var(--gold)" />
            </button>

            <span 
              style={{ cursor: 'pointer' }}
              className="nav-cta" 
              onClick={() => { handlePageChange('home'); setTimeout(() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
            >
              {t.nav_book}
            </span>
          </div>
        </nav>
      )}

      {/* MOBILE DRAWER - FAQAT ADMIN SAHIFASIDA BO'LMAGANDA KO'RINADI */}
      {currentPage !== 'admin' && (
        <div className={`mobile-drawer ${isDrawerOpen ? 'open' : ''}`}>
          <ul>
            <li>
              <a 
                href="#about" 
                onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              >
                {t.nav_about}
              </a>
            </li>
            <li><span style={{ display: 'block', padding: '15px 28px', cursor: 'pointer' }} onClick={() => handlePageChange('menu')}>{t.nav_menu}</span></li>
            <li>
              <a 
                href="#reviews" 
                onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              >
                {t.nav_reviews}
              </a>
            </li>
            <li>
              <a 
                href="#reservation" 
                onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
              >
                {t.nav_contact}
              </a>
            </li>
            {/* MOBIL QURILMALARDA ADMIN PANELGA KIRISH SHU YERDAN */}
            <li>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 28px', cursor: 'pointer', color: 'var(--gold)' }} onClick={() => handlePageChange('admin')}>
                <Lock size={16} strokeWidth={1.5} /> Admin Panel
              </span>
            </li>
          </ul>
          <span 
            style={{ cursor: 'pointer' }}
            className="drawer-cta" 
            onClick={() => { handlePageChange('home'); setTimeout(() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' }), 100); }}
          >
            {t.nav_book}
          </span>
        </div>
      )}

      {/* CONTENT PAGES ROUTER */}
      {currentPage === 'home' ? (
        <Home lang={lang} setPage={handlePageChange} />
      ) : currentPage === 'menu' ? (
        <Menu lang={lang} cart={cart} setCart={setCart} />
      ) : (
        <Admin onGoHome={() => handlePageChange('home')} />
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand-name">Zafar <span>Dasturxon</span></div>
            <p className="footer-tagline">{t.footer_tagline}</p>
            <div className="footer-social">
              <a href="#" className="social-btn"><FacebookIcon /></a>
              <a href="#" className="social-btn"><InstagramIcon /></a>
              <a href="#" className="social-btn"><Send size={18} strokeWidth={1.5} /></a>
            </div>
          </div>
          <div>
            <div className="footer-heading">{t.footer_pages}</div>
            <ul className="footer-links">
              <li><span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('home')}>{t.nav_about}</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('menu')}>{t.nav_menu}</span></li>
              <li><a href="#reviews" onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>{t.nav_reviews}</a></li>
              <li><a href="#reservation" onClick={(e) => { e.preventDefault(); handlePageChange('home'); setTimeout(() => document.getElementById('reservation')?.scrollIntoView({ behavior: 'smooth' }), 100); }}>{t.nav_contact}</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">{t.footer_dishes}</div>
            <ul className="footer-links">
              <li><span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('menu')}>{t.cat_milliy}</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('menu')}>{t.cat_grill}</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('menu')}>{t.cat_shorva}</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('menu')}>{t.cat_shirinlik}</span></li>
              <li><span style={{ cursor: 'pointer' }} onClick={() => handlePageChange('menu')}>{t.cat_ichimlik}</span></li>
            </ul>
          </div>
          <div>
            <div className="footer-heading">{t.nav_contact}</div>
            <ul className="footer-links">
              <li><a href="#">Amir Temur 15, Toshkent</a></li>
              <li><a href="tel:+998712345678">+998 71 234 56 78</a></li>
              <li><a href="mailto:info@zafar.uz">info@zafar.uz</a></li>
              <li><a href="#">10:00 – 23:00</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t.footer_copy}</span>
          <span>{t.footer_credit}</span>
        </div>
      </footer>

      {/* SCROLL TO TOP */}
      {showScrollTop && (
        <button id="scrollTop" className="show" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <ArrowUp size={20} strokeWidth={2} />
        </button>
      )}
    </>
  );
};

export default App;