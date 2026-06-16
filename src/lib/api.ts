const URLS = {
  auth:     'https://functions.poehali.dev/949c9c1b-6840-4604-96e9-0d4d07033cf5',
  news:     'https://functions.poehali.dev/5985fce8-7814-4a73-ba57-7d03b8d3b919',
  settings: 'https://functions.poehali.dev/e8c0ce34-e71f-405a-82d3-7ce08f326c35',
}

export type Role = 'player' | 'helper' | 'moderator' | 'admin' | 'creator'

export interface User {
  id: number
  username: string
  role: Role
  privilege: string | null
}

export interface NewsItem {
  id: number
  title: string
  content: string
  author_name: string
  created_at: string
}

export interface SiteSettings {
  site_title: string
  hero_bg_color: string
  accent_color: string
  server_ip: string
  server_version: string
  online_count: string
  discord_url: string
  telegram_url: string
  vk_url: string
}

function token() {
  return localStorage.getItem('mc_token') || ''
}

function headers(extra: Record<string, string> = {}) {
  return { 'Content-Type': 'application/json', 'X-Session-Token': token(), ...extra }
}

async function req<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { headers: headers(), ...opts })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера')
  return data as T
}

// ── AUTH ──
export const authApi = {
  register: (username: string, password: string) =>
    req<{ token: string } & User>(URLS.auth, {
      method: 'POST', body: JSON.stringify({ action: 'register', username, password }),
    }),
  login: (username: string, password: string) =>
    req<{ token: string } & User>(URLS.auth, {
      method: 'POST', body: JSON.stringify({ action: 'login', username, password }),
    }),
  me: () => req<User>(URLS.auth),
  getUsers: () => req<User[]>(URLS.auth + '?action=users'),
  setRole: (id: number, role: Role, privilege: string | null) =>
    req(URLS.auth, {
      method: 'PUT', body: JSON.stringify({ target_id: id, role, privilege }),
    }),
}

// ── NEWS ──
export const newsApi = {
  list: () => req<NewsItem[]>(URLS.news),
  create: (title: string, content: string) =>
    req<NewsItem>(URLS.news, { method: 'POST', body: JSON.stringify({ title, content }) }),
  update: (id: number, title: string, content: string) =>
    req(URLS.news, { method: 'PUT', body: JSON.stringify({ id, title, content }) }),
  delete: (id: number) =>
    req(URLS.news, { method: 'DELETE', body: JSON.stringify({ id }) }),
}

// ── SETTINGS ──
export const settingsApi = {
  get: () => req<SiteSettings>(URLS.settings),
  update: (data: Partial<SiteSettings>) =>
    req(URLS.settings, { method: 'PUT', body: JSON.stringify(data) }),
}