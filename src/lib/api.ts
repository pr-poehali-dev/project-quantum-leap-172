const URLS = {
  auth:        'https://functions.poehali.dev/949c9c1b-6840-4604-96e9-0d4d07033cf5',
  news:        'https://functions.poehali.dev/5985fce8-7814-4a73-ba57-7d03b8d3b919',
  settings:    'https://functions.poehali.dev/e8c0ce34-e71f-405a-82d3-7ce08f326c35',
  punishments: 'https://functions.poehali.dev/33631a93-426f-48ae-9063-a95b8fd03b64',
  complaints:  'https://functions.poehali.dev/15a9bf2c-c0e9-488b-b9ab-80b0488240ab',
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
  logo_url: string
  bg_image_url: string
  slideshow_interval: string
  slideshow_images: string      // JSON-массив строк
  privileges_json: string       // JSON
  coins_json: string
  cases_json: string
  battlepass_json: string
  menu_buttons_json: string
}

export interface Privilege { id: string; name: string; color: string; price: number; desc: string; icon?: string; image?: string; features?: string[] }
export interface CoinItemFull extends CoinItem { features?: string[] }
export interface CaseItemFull extends CaseItem { features?: string[] }
export interface CoinItem { id: string; name: string; desc: string; price: number; image: string }
export interface CaseItem { id: string; name: string; desc: string; chance: string; price: number; image: string }
export interface MenuButton { label: string; link: string; visible: boolean }
export interface BattlePass { price: number; levels: { level: number; reward: string }[] }

export type PunishmentType = 'ban' | 'mute'
export interface Punishment {
  id: number
  player_name: string
  reason: string
  punishment_type: PunishmentType
  issued_at: string
  expires_at: string | null
  admin_name: string
  proof_url: string
  active: boolean
  removed_by: string | null
  removed_at: string | null
}

export type ComplaintKind = 'player_report' | 'appeal' | 'staff_report'
export interface Complaint {
  id: number
  kind: ComplaintKind
  author_name: string
  target_name: string
  text: string
  proof_url: string
  punishment_id: number | null
  status: 'open' | 'accepted' | 'rejected'
  created_at: string
  reviewed_by: string | null
  reviewed_at: string | null
}

export interface ActionLog {
  id: number
  actor_name: string
  actor_role: string
  action: string
  created_at: string
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
  upload: (content_type: string, data: string) =>
    req<{ url: string }>(URLS.settings, { method: 'POST', body: JSON.stringify({ content_type, data }) }),
}

// ── PUNISHMENTS ──
export const punishmentsApi = {
  list: (player?: string) =>
    req<Punishment[]>(URLS.punishments + (player ? `?player=${encodeURIComponent(player)}` : '')),
  logs: () => req<ActionLog[]>(URLS.punishments + '?action=logs'),
  issue: (data: { player_name: string; reason: string; punishment_type: PunishmentType; hours: number; proof_url: string }) =>
    req<Punishment>(URLS.punishments, { method: 'POST', body: JSON.stringify(data) }),
  remove: (id: number) =>
    req(URLS.punishments, { method: 'PUT', body: JSON.stringify({ id }) }),
}

// ── COMPLAINTS ──
export const complaintsApi = {
  list: () => req<Complaint[]>(URLS.complaints),
  create: (data: { kind: ComplaintKind; text: string; target_name?: string; proof_url?: string; punishment_id?: number }) =>
    req<Complaint>(URLS.complaints, { method: 'POST', body: JSON.stringify(data) }),
  review: (id: number, status: 'accepted' | 'rejected') =>
    req(URLS.complaints, { method: 'PUT', body: JSON.stringify({ id, status }) }),
}

// ── Helpers для парсинга JSON-настроек ──
export function parseJSON<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}