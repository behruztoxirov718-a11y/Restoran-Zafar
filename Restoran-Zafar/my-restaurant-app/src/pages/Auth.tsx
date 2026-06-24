import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react';
import type { Lang, AuthUser } from '../lib/types';
import { login, register, requestPasswordReset, isValidEmail } from '../lib/auth';
import { Button, useToast } from '../components/ui';

type Mode = 'login' | 'register' | 'forgot';

interface AuthProps {
  lang: Lang;
  onAuth: (user: AuthUser) => void;
  onGoHome: () => void;
}

const DICT = {
  uz: {
    brandTagline: "An'anaviy ta'm, zamonaviy xizmat",
    loginTitle: 'Xush kelibsiz',
    loginSub: 'Hisobingizga kiring',
    registerTitle: "Ro'yxatdan o'tish",
    registerSub: 'Yangi hisob yarating',
    forgotTitle: 'Parolni tiklash',
    forgotSub: "Emailingizni kiriting — tiklash havolasini yuboramiz",
    name: 'Ism Familiya',
    namePh: 'Bobur Yusupov',
    email: 'Email',
    emailPh: 'siz@email.com',
    password: 'Parol',
    passwordPh: '••••••••',
    confirm: 'Parolni tasdiqlang',
    forgotLink: 'Parolni unutdingizmi?',
    loginBtn: 'Kirish',
    registerBtn: "Ro'yxatdan o'tish",
    forgotBtn: 'Havola yuborish',
    noAccount: "Hisobingiz yo'qmi?",
    haveAccount: 'Hisobingiz bormi?',
    signUp: "Ro'yxatdan o'ting",
    signIn: 'Kiring',
    backToLogin: 'Kirishga qaytish',
    backHome: 'Bosh sahifaga',
    errName: 'Ismingizni kiriting',
    errEmail: "To'g'ri email kiriting",
    errPassword: "Parol kamida 6 belgi bo'lsin",
    errConfirm: 'Parollar mos kelmadi',
    errInvalid: "Email yoki parol noto'g'ri",
    errExists: 'Bu email allaqachon ro\'yxatdan o\'tgan',
    welcome: 'Xush kelibsiz',
    registered: "Ro'yxatdan o'tdingiz!",
    forgotSent: 'Havola yuborildi',
    forgotSentDesc: 'Emailingizni tekshiring (demo rejimida real email yuborilmaydi).',
  },
  ru: {
    brandTagline: 'Традиционный вкус, современный сервис',
    loginTitle: 'Добро пожаловать',
    loginSub: 'Войдите в аккаунт',
    registerTitle: 'Регистрация',
    registerSub: 'Создайте новый аккаунт',
    forgotTitle: 'Сброс пароля',
    forgotSub: 'Введите email — отправим ссылку для сброса',
    name: 'Имя и Фамилия',
    namePh: 'Иван Иванов',
    email: 'Email',
    emailPh: 'вы@email.com',
    password: 'Пароль',
    passwordPh: '••••••••',
    confirm: 'Подтвердите пароль',
    forgotLink: 'Забыли пароль?',
    loginBtn: 'Войти',
    registerBtn: 'Зарегистрироваться',
    forgotBtn: 'Отправить ссылку',
    noAccount: 'Нет аккаунта?',
    haveAccount: 'Уже есть аккаунт?',
    signUp: 'Зарегистрируйтесь',
    signIn: 'Войдите',
    backToLogin: 'Вернуться ко входу',
    backHome: 'На главную',
    errName: 'Введите имя',
    errEmail: 'Введите корректный email',
    errPassword: 'Пароль минимум 6 символов',
    errConfirm: 'Пароли не совпадают',
    errInvalid: 'Неверный email или пароль',
    errExists: 'Этот email уже зарегистрирован',
    welcome: 'Добро пожаловать',
    registered: 'Регистрация успешна!',
    forgotSent: 'Ссылка отправлена',
    forgotSentDesc: 'Проверьте почту (в демо-режиме письмо не отправляется).',
  },
  en: {
    brandTagline: 'Traditional taste, modern service',
    loginTitle: 'Welcome back',
    loginSub: 'Sign in to your account',
    registerTitle: 'Create account',
    registerSub: 'Sign up for a new account',
    forgotTitle: 'Reset password',
    forgotSub: "Enter your email — we'll send a reset link",
    name: 'Full Name',
    namePh: 'John Doe',
    email: 'Email',
    emailPh: 'you@email.com',
    password: 'Password',
    passwordPh: '••••••••',
    confirm: 'Confirm password',
    forgotLink: 'Forgot password?',
    loginBtn: 'Sign In',
    registerBtn: 'Sign Up',
    forgotBtn: 'Send link',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    signUp: 'Sign up',
    signIn: 'Sign in',
    backToLogin: 'Back to sign in',
    backHome: 'Back to home',
    errName: 'Enter your name',
    errEmail: 'Enter a valid email',
    errPassword: 'Password must be at least 6 characters',
    errConfirm: 'Passwords do not match',
    errInvalid: 'Invalid email or password',
    errExists: 'This email is already registered',
    welcome: 'Welcome',
    registered: 'Account created!',
    forgotSent: 'Link sent',
    forgotSentDesc: 'Check your email (no real email is sent in demo mode).',
  },
} as const;

const Auth: React.FC<AuthProps> = ({ lang, onAuth, onGoHome }) => {
  const tt = DICT[lang];
  const toast = useToast();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setForgotSent(false);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (mode === 'register' && !name.trim()) e.name = tt.errName;
    if (!isValidEmail(email)) e.email = tt.errEmail;
    if (mode !== 'forgot' && password.length < 6) e.password = tt.errPassword;
    if (mode === 'register' && confirm !== password) e.confirm = tt.errConfirm;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(email, password);
        toast(`${tt.welcome}, ${user.name}!`, 'success');
        onAuth(user);
      } else if (mode === 'register') {
        const user = await register(name, email, password);
        toast(tt.registered, 'success');
        onAuth(user);
      } else {
        await requestPasswordReset(email);
        setForgotSent(true);
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'exists') setErrors({ email: tt.errExists });
      else if (code === 'invalid') {
        if (mode === 'forgot') setErrors({ email: tt.errEmail });
        else toast(tt.errInvalid, 'error');
      } else toast(tt.errInvalid, 'error');
    } finally {
      setLoading(false);
    }
  };

  const titleMap = { login: tt.loginTitle, register: tt.registerTitle, forgot: tt.forgotTitle };
  const subMap = { login: tt.loginSub, register: tt.registerSub, forgot: tt.forgotSub };

  return (
    <div className="auth-wrap">
      {/* Chap brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-overlay" />
        <div className="auth-brand-content">
          <div className="auth-logo">Zafar <span>Dasturxon</span></div>
          <p className="auth-brand-tagline">{tt.brandTagline}</p>
        </div>
      </div>

      {/* O'ng form panel */}
      <div className="auth-form-panel">
        <button className="auth-back" onClick={onGoHome}>
          <ArrowLeft size={16} strokeWidth={1.8} /> {tt.backHome}
        </button>

        <div className="auth-card">
          <div className="auth-icon"><UtensilsCrossed size={36} strokeWidth={1.3} /></div>
          <h2 className="auth-title">{titleMap[mode]}</h2>
          <p className="auth-sub">{subMap[mode]}</p>

          {mode === 'forgot' && forgotSent ? (
            <div className="auth-success">
              <div className="auth-success-icon"><CheckCircle2 size={48} strokeWidth={1.4} /></div>
              <h3>{tt.forgotSent}</h3>
              <p>{tt.forgotSentDesc}</p>
              <Button variant="ghost" fullWidth onClick={() => switchMode('login')}>
                {tt.backToLogin}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {mode === 'register' && (
                <div className="auth-field">
                  <label>{tt.name}</label>
                  <div className={`auth-input ${errors.name ? 'has-error' : ''}`}>
                    <User size={17} strokeWidth={1.6} />
                    <input
                      type="text"
                      placeholder={tt.namePh}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  {errors.name && <span className="auth-err">{errors.name}</span>}
                </div>
              )}

              <div className="auth-field">
                <label>{tt.email}</label>
                <div className={`auth-input ${errors.email ? 'has-error' : ''}`}>
                  <Mail size={17} strokeWidth={1.6} />
                  <input
                    type="email"
                    placeholder={tt.emailPh}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <span className="auth-err">{errors.email}</span>}
              </div>

              {mode !== 'forgot' && (
                <div className="auth-field">
                  <label>{tt.password}</label>
                  <div className={`auth-input ${errors.password ? 'has-error' : ''}`}>
                    <Lock size={17} strokeWidth={1.6} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder={tt.passwordPh}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="auth-eye" onClick={() => setShowPw((s) => !s)} tabIndex={-1}>
                      {showPw ? <EyeOff size={16} strokeWidth={1.6} /> : <Eye size={16} strokeWidth={1.6} />}
                    </button>
                  </div>
                  {errors.password && <span className="auth-err">{errors.password}</span>}
                </div>
              )}

              {mode === 'register' && (
                <div className="auth-field">
                  <label>{tt.confirm}</label>
                  <div className={`auth-input ${errors.confirm ? 'has-error' : ''}`}>
                    <Lock size={17} strokeWidth={1.6} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder={tt.passwordPh}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </div>
                  {errors.confirm && <span className="auth-err">{errors.confirm}</span>}
                </div>
              )}

              {mode === 'login' && (
                <button type="button" className="auth-forgot-link" onClick={() => switchMode('forgot')}>
                  {tt.forgotLink}
                </button>
              )}

              <Button type="submit" fullWidth loading={loading} className="auth-submit">
                {mode === 'login' ? tt.loginBtn : mode === 'register' ? tt.registerBtn : tt.forgotBtn}
              </Button>
            </form>
          )}

          {mode !== 'forgot' && (
            <div className="auth-switch">
              {mode === 'login' ? (
                <>
                  {tt.noAccount}{' '}
                  <button type="button" onClick={() => switchMode('register')}>{tt.signUp}</button>
                </>
              ) : (
                <>
                  {tt.haveAccount}{' '}
                  <button type="button" onClick={() => switchMode('login')}>{tt.signIn}</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
