import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Loader from './components/Loader';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import { T } from './translations';
import { Sun, Moon, Lock, Send, ArrowUp, User, LogOut } from 'lucide-react';
import type { Lang, Page, CartItem, AuthUser } from './lib/types';
import { getCurrentUser, logout } from './lib/auth';
import { useToast } from './components/ui';

// ── CUSTOM LOGO SVG COMPONENTLARI ──
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
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [lang, setLang] = useState<Lang>('uz');
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme') === 'dark',
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const toast = useToast();

  // Theme'ni <html data-theme> ga sinxronlash (tashqi DOM yangilash).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Aqlli loader — haqiqiy yuklanishga bog'liq, min 700ms (3s qotirilgan emas).
  useEffect(() => {
    const start = Date.now();
    const finish = () => {
      const wait = Math.max(0, 3000 - (Date.now() - start));
      setTimeout(() => setLoading(false), wait);
    };
    if (document.readyState === 'complete') finish();
    else {
      window.addEventListener('load', finish);
      // Xavfsizlik chegarasi.
      const cap = setTimeout(finish, 2500);
      return () => { window.removeEventListener('load', finish); clearTimeout(cap); };
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? (y / h) * 100 : 0);
      setShowScrollTop(y > 500);
      setScrolled(y > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  };

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (u: AuthUser) => {
    setUser(u);
    handlePageChange('home');
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    toast(
      lang === 'uz' ? 'Hisobdan chiqdingiz' : lang === 'ru' ? 'Вы вышли из аккаунта' : 'Signed out',
      'info',
    );
  };

  const t = T[lang];

  // Nav/footer admin va auth sahifalarida ko'rinmaydi.
  const chromeVisible = currentPage !== 'admin' && currentPage !== 'auth';

  return (
    <>
      {loading && <Loader />}

      {/* SCROLL PROGRESS BAR */}
      {chromeVisible && (
        <div className="scroll-progress" style={{ width: `${scrollPct}%` }} />
      )}

      {/* NAVIGATION BAR - FAQAT ADMIN SAHIFASIDA BO'LMAGANDA KO'RINADI */}
      {chromeVisible && (
        <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
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
            
            <button className="theme-toggle" id="themeToggle" onClick={toggleTheme}>
              {isDark ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
            </button>
            
            <button 
              className="theme-toggle lock-nav-btn" 
              title="Admin Panel" 
              onClick={() => handlePageChange('admin')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: 'var(--bg2)', border: '1px solid var(--border)' }}
            >
              <Lock size={16} strokeWidth={1.5} color="var(--gold)" />
            </button>

            {user ? (
              <div className="nav-account">
                <span className="nav-account-name" title={user.email}>
                  <User size={15} strokeWidth={1.6} /> {user.name.split(' ')[0]}
                </span>
                <button
                  className="theme-toggle"
                  title={lang === 'uz' ? 'Chiqish' : lang === 'ru' ? 'Выйти' : 'Sign out'}
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <LogOut size={16} strokeWidth={1.5} color="var(--gold)" />
                </button>
              </div>
            ) : (
              <button
                className="theme-toggle"
                title={lang === 'uz' ? 'Kirish' : lang === 'ru' ? 'Войти' : 'Sign in'}
                onClick={() => handlePageChange('auth')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <User size={16} strokeWidth={1.5} color="var(--gold)" />
              </button>
            )}

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

      {/* MOBILE DRAWER */}
      {chromeVisible && (
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
            <li>
              {user ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 28px', cursor: 'pointer', color: 'var(--gold)' }} onClick={handleLogout}>
                  <LogOut size={16} strokeWidth={1.5} /> {user.name.split(' ')[0]} — {lang === 'uz' ? 'Chiqish' : lang === 'ru' ? 'Выйти' : 'Sign out'}
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 28px', cursor: 'pointer', color: 'var(--gold)' }} onClick={() => handlePageChange('auth')}>
                  <User size={16} strokeWidth={1.5} /> {lang === 'uz' ? 'Kirish / Ro\'yxat' : lang === 'ru' ? 'Войти / Регистрация' : 'Sign in / up'}
                </span>
              )}
            </li>
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

      {/* CONTENT PAGES ROUTER — sahifa almashinishida silliq o'tish */}
      <div key={currentPage} className="page-transition">
        {currentPage === 'home' ? (
          <Home lang={lang} setPage={handlePageChange} />
        ) : currentPage === 'menu' ? (
          <Menu lang={lang} cart={cart} setCart={setCart} />
        ) : currentPage === 'auth' ? (
          <Auth lang={lang} onAuth={handleAuthSuccess} onGoHome={() => handlePageChange('home')} />
        ) : (
          <Admin onGoHome={() => handlePageChange('home')} />
        )}
      </div>

      {/* ── 🛠️ YANGILANGAN: FOOTER FAQAT ADMIN SAHIFASIDA BO'LMAGANDA KO'RINADI ── */}
      {chromeVisible && (
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
      )}

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