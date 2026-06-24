import type { AuthUser } from './types';

// ⚠️ MOCK auth — faqat localStorage. Real backend keyingi bosqichda.
const SESSION_KEY = 'zafar_user';
const USERS_KEY = 'zafar_users';

interface StoredUser extends AuthUser {
  password: string;
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Validatsiya yordamchilari
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// Mock kechikish — real tarmoq tuyg'usi uchun.
const delay = (ms = 700) => new Promise((r) => setTimeout(r, ms));

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  await delay();
  const users = readUsers();
  const normalized = email.trim().toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new Error('exists');
  }
  const user: StoredUser = { name: name.trim(), email: normalized, password };
  writeUsers([...users, user]);
  const session: AuthUser = { name: user.name, email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  await delay();
  const normalized = email.trim().toLowerCase();
  const match = readUsers().find((u) => u.email === normalized && u.password === password);
  if (!match) {
    throw new Error('invalid');
  }
  const session: AuthUser = { name: match.name, email: match.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await delay();
  if (!isValidEmail(email)) throw new Error('invalid');
  // Mock: real holatda bu yerda email yuborilardi.
}
