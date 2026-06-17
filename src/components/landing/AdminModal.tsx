import { useState, useEffect } from 'react'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { ModalShell } from './ModalShell'
import { ImageUpload } from './ImageUpload'
import {
  authApi, settingsApi, parseJSON,
  type User, type Role, type SiteSettings,
  type Privilege, type CoinItem, type CaseItem, type MenuButton, type BattlePass,
} from '@/lib/api'
import { ROLE_META } from '@/lib/permissions'

const ROLES: Role[] = ['player', 'helper', 'moderator', 'admin', 'creator']
const PRIVILEGES = ['', 'VIP', 'PREMIUM', 'ELITE', 'DELUXE', 'LEGEND', 'DRAGON']

type Tab = 'users' | 'appearance' | 'privileges' | 'shop' | 'menu' | 'social'

interface Props { open: boolean; onClose: () => void; currentUser: User }

export function AdminModal({ open, onClose, currentUser }: Props) {
  const [tab, setTab] = useState<Tab>('users')
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<Partial<SiteSettings>>({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const isCreator = currentUser.role === 'creator'

  useEffect(() => {
    if (!open) return
    authApi.getUsers().then(setUsers).catch(() => {})
    settingsApi.get().then(setSettings).catch(() => {})
  }, [open])

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2000) }
  const set = (k: keyof SiteSettings, v: string) => setSettings(p => ({ ...p, [k]: v }))

  const setRole = async (id: number, role: Role, privilege: string | null) => {
    await authApi.setRole(id, role, privilege || null).catch(() => {})
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role, privilege: privilege || null } : u))
    showToast('Роль обновлена')
  }

  const save = async () => {
    setSaving(true)
    try {
      await settingsApi.update(settings)
      showToast('Сохранено! Обновите страницу')
    } catch { showToast('Ошибка сохранения') }
    finally { setSaving(false) }
  }

  const tabs: { key: Tab; label: string; icon: string; show: boolean }[] = [
    { key: 'users',      label: 'Игроки',      icon: 'Users',    show: true },
    { key: 'appearance', label: 'Оформление',  icon: 'Palette',  show: isCreator },
    { key: 'privileges', label: 'Привилегии',  icon: 'Crown',    show: isCreator },
    { key: 'shop',       label: 'Магазины',    icon: 'ShoppingBag', show: isCreator },
    { key: 'menu',       label: 'Меню',        icon: 'Menu',     show: isCreator },
    { key: 'social',     label: 'Контакты',    icon: 'Link',     show: isCreator },
  ]

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-3xl">
      <div className="border-b border-emerald-500/20 px-6 py-4">
        <h2 className="font-display text-lg text-white">Панель управления</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {tabs.filter(t => t.show).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${tab === t.key ? 'bg-emerald-500 text-black' : 'border border-[#1a3a1a] text-neutral-400 hover:text-white'}`}
            >
              <Icon name={t.icon} size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {tab === 'users' && (
          <div className="space-y-3">
            {users.map(u => {
              const meta = ROLE_META[u.role]
              return (
                <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 font-bold text-emerald-400">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-white">{u.username}</div>
                    <div className="text-xs font-semibold" style={{ color: meta.color }}>{meta.label}{u.privilege ? ` · ${u.privilege}` : ''}</div>
                  </div>
                  {isCreator && u.id !== currentUser.id && (
                    <div className="flex flex-wrap gap-2">
                      <select value={u.role} onChange={e => setRole(u.id, e.target.value as Role, u.privilege)}
                        className="rounded-lg border border-[#1a3a1a] bg-black/40 px-2 py-1 text-xs text-white outline-none">
                        {ROLES.map(r => <option key={r} value={r}>{ROLE_META[r].label}</option>)}
                      </select>
                      <select value={u.privilege || ''} onChange={e => setRole(u.id, u.role, e.target.value || null)}
                        className="rounded-lg border border-[#1a3a1a] bg-black/40 px-2 py-1 text-xs text-white outline-none">
                        {PRIVILEGES.map(p => <option key={p} value={p}>{p || 'Без привилегии'}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {tab === 'appearance' && isCreator && (
          <div className="space-y-5">
            <ImageUpload label="Аватарка / логотип сайта" value={settings.logo_url || ''} onChange={v => set('logo_url', v)} />
            <Field label="Название сайта">
              <Input value={settings.site_title} onChange={v => set('site_title', v)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <ColorField label="Цвет фона" value={settings.hero_bg_color || '#071a0d'} onChange={v => set('hero_bg_color', v)} />
              <ColorField label="Акцентный цвет" value={settings.accent_color || '#4ade80'} onChange={v => set('accent_color', v)} />
            </div>
            <ImageUpload label="Фоновое изображение сайта (необязательно)" value={settings.bg_image_url || ''} onChange={v => set('bg_image_url', v)} size={96} />
            <SlideshowEditor settings={settings} onChange={setSettings} />
          </div>
        )}

        {tab === 'privileges' && isCreator && (
          <PrivilegesEditor settings={settings} onChange={setSettings} />
        )}

        {tab === 'shop' && isCreator && (
          <ShopEditor settings={settings} onChange={setSettings} />
        )}

        {tab === 'menu' && isCreator && (
          <MenuEditor settings={settings} onChange={setSettings} />
        )}

        {tab === 'social' && isCreator && (
          <div className="space-y-4">
            <Field label="IP сервера"><Input value={settings.server_ip} onChange={v => set('server_ip', v)} /></Field>
            <Field label="Версия сервера"><Input value={settings.server_version} onChange={v => set('server_version', v)} /></Field>
            <Field label="Онлайн игроков"><Input value={settings.online_count} onChange={v => set('online_count', v)} /></Field>
            <Field label="Discord URL"><Input value={settings.discord_url} onChange={v => set('discord_url', v)} /></Field>
            <Field label="Telegram URL"><Input value={settings.telegram_url} onChange={v => set('telegram_url', v)} /></Field>
            <Field label="VK URL"><Input value={settings.vk_url} onChange={v => set('vk_url', v)} /></Field>
          </div>
        )}

        {isCreator && tab !== 'users' && (
          <Button onClick={save} disabled={saving} className="mt-6 w-full bg-emerald-500 text-black hover:bg-emerald-400">
            <Icon name="Save" size={16} className="mr-2" />
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        )}
      </div>

      {toast && (
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-[#07130a] px-4 py-2 text-sm font-semibold text-emerald-400">
          ✓ {toast}
        </div>
      )}
    </ModalShell>
  )
}

// ─── Слайд-шоу ───
function SlideshowEditor({ settings, onChange }: { settings: Partial<SiteSettings>; onChange: (s: Partial<SiteSettings>) => void }) {
  const images = parseJSON<string[]>(settings.slideshow_images, [])
  const setImages = (imgs: string[]) => onChange({ ...settings, slideshow_images: JSON.stringify(imgs) })

  return (
    <div className="rounded-xl border border-[#1a3a1a] bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-emerald-300">Слайд-шоу персонажа (3–5 фото)</span>
        <span className="text-xs text-neutral-500">{images.length}/5</span>
      </div>
      <div className="space-y-3">
        {images.map((img, i) => (
          <div key={i} className="flex items-center gap-2">
            <ImageUpload value={img} onChange={v => { const c = [...images]; c[i] = v; setImages(c.filter(Boolean)) }} size={56} />
            <button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300">
              <Icon name="Trash2" size={16} />
            </button>
          </div>
        ))}
        {images.length < 5 && (
          <ImageUpload value="" onChange={v => v && setImages([...images, v])} size={56} label="Добавить фото" />
        )}
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs text-neutral-400">Интервал смены (сек): {settings.slideshow_interval || '12'}</label>
        <input type="range" min={10} max={15} value={parseInt(settings.slideshow_interval || '12')}
          onChange={e => onChange({ ...settings, slideshow_interval: e.target.value })}
          className="w-full accent-emerald-500" />
      </div>
    </div>
  )
}

// ─── Привилегии ───
function PrivilegesEditor({ settings, onChange }: { settings: Partial<SiteSettings>; onChange: (s: Partial<SiteSettings>) => void }) {
  const list = parseJSON<Privilege[]>(settings.privileges_json, [])
  const save = (items: Privilege[]) => onChange({ ...settings, privileges_json: JSON.stringify(items) })
  const upd = (i: number, patch: Partial<Privilege>) => save(list.map((p, idx) => idx === i ? { ...p, ...patch } : p))

  return (
    <div className="space-y-3">
      {list.map((p, i) => (
        <div key={p.id} className="space-y-2 rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
          <div className="flex gap-2">
            <input value={p.name} onChange={e => upd(i, { name: e.target.value })} placeholder="Название"
              className="flex-1 rounded-lg border border-[#1a3a1a] bg-black/40 px-3 py-2 text-sm font-bold text-white outline-none" style={{ color: p.color }} />
            <input value={p.price} onChange={e => upd(i, { price: parseInt(e.target.value) || 0 })} type="number" placeholder="₽"
              className="w-24 rounded-lg border border-[#1a3a1a] bg-black/40 px-3 py-2 text-sm text-white outline-none" />
            <input type="color" value={p.color} onChange={e => upd(i, { color: e.target.value })}
              className="h-9 w-9 cursor-pointer rounded-lg border border-[#1a3a1a] bg-transparent" />
          </div>
          <textarea value={p.desc} onChange={e => upd(i, { desc: e.target.value })} rows={2} placeholder="Описание"
            className="w-full resize-none rounded-lg border border-[#1a3a1a] bg-black/40 px-3 py-2 text-sm text-neutral-300 outline-none" />
          <button onClick={() => save(list.filter((_, idx) => idx !== i))} className="text-xs text-red-400 hover:underline">Удалить привилегию</button>
        </div>
      ))}
      <button onClick={() => save([...list, { id: `p${Date.now()}`, name: 'НОВАЯ', color: '#4ade80', price: 99, desc: '' }])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/40 py-3 text-sm text-emerald-400 hover:bg-emerald-500/5">
        <Icon name="Plus" size={15} />Добавить привилегию
      </button>
    </div>
  )
}

// ─── Магазины (коины, кейсы, BattlePass) ───
function ShopEditor({ settings, onChange }: { settings: Partial<SiteSettings>; onChange: (s: Partial<SiteSettings>) => void }) {
  const [sub, setSub] = useState<'coins' | 'cases' | 'bp'>('coins')
  const coins = parseJSON<CoinItem[]>(settings.coins_json, [])
  const cases = parseJSON<CaseItem[]>(settings.cases_json, [])
  const bp = parseJSON<BattlePass>(settings.battlepass_json, { price: 569, levels: [] })

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {([['coins', 'Коины'], ['cases', 'Кейсы'], ['bp', 'Battle Pass']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${sub === k ? 'bg-emerald-500 text-black' : 'border border-[#1a3a1a] text-neutral-400'}`}>{l}</button>
        ))}
      </div>

      {sub === 'coins' && (
        <ItemList items={coins} fields={['name', 'desc', 'price']} hasImage
          onSave={items => onChange({ ...settings, coins_json: JSON.stringify(items) })}
          empty={{ id: `c${Date.now()}`, name: 'Пакет коинов', desc: '', price: 99, image: '' }} />
      )}
      {sub === 'cases' && (
        <ItemList items={cases} fields={['name', 'desc', 'chance', 'price']} hasImage
          onSave={items => onChange({ ...settings, cases_json: JSON.stringify(items) })}
          empty={{ id: `k${Date.now()}`, name: 'Новый кейс', desc: '', chance: '10%', price: 49, image: '' }} />
      )}
      {sub === 'bp' && (
        <div className="space-y-3">
          <Field label="Стоимость Battle Pass (₽)">
            <Input value={String(bp.price)} onChange={v => onChange({ ...settings, battlepass_json: JSON.stringify({ ...bp, price: parseInt(v) || 0 }) })} />
          </Field>
          <div className="space-y-2">
            {bp.levels.map((lvl, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-[#1a3a1a] bg-black/20 p-2">
                <span className="shrink-0 text-sm font-bold text-emerald-400">Ур. {lvl.level}</span>
                <input value={lvl.reward}
                  onChange={e => { const c = [...bp.levels]; c[i] = { ...lvl, reward: e.target.value }; onChange({ ...settings, battlepass_json: JSON.stringify({ ...bp, levels: c }) }) }}
                  className="flex-1 rounded-lg border border-[#1a3a1a] bg-black/40 px-3 py-1.5 text-sm text-white outline-none" placeholder="Награда" />
                <button onClick={() => onChange({ ...settings, battlepass_json: JSON.stringify({ ...bp, levels: bp.levels.filter((_, idx) => idx !== i) }) })}>
                  <Icon name="Trash2" size={15} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => onChange({ ...settings, battlepass_json: JSON.stringify({ ...bp, levels: [...bp.levels, { level: bp.levels.length + 1, reward: '' }] }) })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/40 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/5">
            <Icon name="Plus" size={14} />Добавить уровень
          </button>
        </div>
      )}
    </div>
  )
}

function ItemList<T extends { id: string; image?: string } & Record<string, unknown>>({ items, fields, hasImage, onSave, empty }: {
  items: T[]; fields: string[]; hasImage?: boolean; onSave: (i: T[]) => void; empty: T
}) {
  const upd = (i: number, patch: Partial<T>) => onSave(items.map((it, idx) => idx === i ? { ...it, ...patch } : it))
  const labels: Record<string, string> = { name: 'Название', desc: 'Описание', price: 'Цена ₽', chance: 'Шанс' }
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={it.id} className="space-y-2 rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
          {hasImage && <ImageUpload value={it.image || ''} onChange={v => upd(i, { image: v } as Partial<T>)} size={48} />}
          {fields.map(f => (
            <input key={f} value={String(it[f] ?? '')} placeholder={labels[f] || f}
              type={f === 'price' ? 'number' : 'text'}
              onChange={e => upd(i, { [f]: f === 'price' ? (parseInt(e.target.value) || 0) : e.target.value } as Partial<T>)}
              className="w-full rounded-lg border border-[#1a3a1a] bg-black/40 px-3 py-2 text-sm text-white outline-none" />
          ))}
          <button onClick={() => onSave(items.filter((_, idx) => idx !== i))} className="text-xs text-red-400 hover:underline">Удалить</button>
        </div>
      ))}
      <button onClick={() => onSave([...items, { ...empty, id: `i${Date.now()}` }])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/40 py-3 text-sm text-emerald-400 hover:bg-emerald-500/5">
        <Icon name="Plus" size={15} />Добавить товар
      </button>
    </div>
  )
}

// ─── Меню ───
function MenuEditor({ settings, onChange }: { settings: Partial<SiteSettings>; onChange: (s: Partial<SiteSettings>) => void }) {
  const list = parseJSON<MenuButton[]>(settings.menu_buttons_json, [])
  const save = (items: MenuButton[]) => onChange({ ...settings, menu_buttons_json: JSON.stringify(items) })
  const upd = (i: number, patch: Partial<MenuButton>) => save(list.map((m, idx) => idx === i ? { ...m, ...patch } : m))
  return (
    <div className="space-y-3">
      {list.map((m, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
          <input value={m.label} onChange={e => upd(i, { label: e.target.value })} placeholder="Текст"
            className="w-28 rounded-lg border border-[#1a3a1a] bg-black/40 px-3 py-2 text-sm text-white outline-none" />
          <input value={m.link} onChange={e => upd(i, { link: e.target.value })} placeholder="Ссылка"
            className="flex-1 rounded-lg border border-[#1a3a1a] bg-black/40 px-3 py-2 text-sm text-white outline-none" />
          <button onClick={() => upd(i, { visible: !m.visible })}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${m.visible ? 'border-emerald-500/40 text-emerald-400' : 'border-neutral-700 text-neutral-600'}`}>
            <Icon name={m.visible ? 'Eye' : 'EyeOff'} size={15} />
          </button>
          <button onClick={() => save(list.filter((_, idx) => idx !== i))}><Icon name="Trash2" size={15} className="text-red-400" /></button>
        </div>
      ))}
      <button onClick={() => save([...list, { label: 'Пункт', link: '#', visible: true }])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-500/40 py-3 text-sm text-emerald-400 hover:bg-emerald-500/5">
        <Icon name="Plus" size={15} />Добавить пункт меню
      </button>
    </div>
  )
}

// ─── Мелкие helpers ───
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-1 block text-xs text-neutral-400">{label}</label>{children}</div>
}
function Input({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return <input value={value || ''} onChange={e => onChange(e.target.value)}
    className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-400">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="h-10 w-10 cursor-pointer rounded-lg border border-[#1a3a1a] bg-transparent" />
        <span className="text-sm text-neutral-400">{value}</span>
      </div>
    </div>
  )
}
