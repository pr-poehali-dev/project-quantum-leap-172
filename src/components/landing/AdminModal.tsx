import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { authApi, settingsApi, type User, type Role, type SiteSettings } from '@/lib/api'

const ROLES: { value: Role; label: string; color: string }[] = [
  { value: 'player',    label: 'Игрок',     color: '#9ca3af' },
  { value: 'helper',    label: 'Helper',    color: '#34d399' },
  { value: 'moderator', label: 'Moderator', color: '#60a5fa' },
  { value: 'admin',     label: 'Admin',     color: '#f97316' },
  { value: 'creator',   label: 'Создатель', color: '#fbbf24' },
]
const PRIVILEGES = ['', 'VIP', 'PREMIUM', 'ELITE', 'DELUXE', 'LEGEND', 'DRAGON']

interface Props { open: boolean; onClose: () => void; currentUser: User }

export function AdminModal({ open, onClose, currentUser }: Props) {
  const [tab, setTab] = useState<'users' | 'site'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<Partial<SiteSettings>>({})
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [toast, setToast] = useState('')

  const isCreator = currentUser.role === 'creator'

  useEffect(() => {
    if (!open) return
    setLoadingUsers(true)
    authApi.getUsers().then(setUsers).catch(() => {}).finally(() => setLoadingUsers(false))
    settingsApi.get().then(s => setSettings(s)).catch(() => {})
  }, [open])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const setRole = async (id: number, role: Role, privilege: string | null) => {
    await authApi.setRole(id, role, privilege || null).catch(() => {})
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role, privilege: privilege || null } : u))
    showToast('Роль обновлена')
  }

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      await settingsApi.update(settings as SiteSettings)
      showToast('Настройки сохранены!')
    } catch {
      showToast('Ошибка сохранения')
    } finally {
      setSavingSettings(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative flex h-[88vh] w-full max-w-3xl flex-col rounded-2xl border border-emerald-500/30 bg-[#07130a] shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]"
          >
            <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 text-neutral-400 hover:text-white">
              <Icon name="X" size={16} />
            </button>

            <div className="border-b border-emerald-500/20 px-6 py-4">
              <h2 className="font-display text-lg text-white">Панель управления</h2>
              <div className="mt-3 flex gap-2">
                {[
                  { key: 'users', label: 'Игроки', icon: 'Users' },
                  ...(isCreator ? [{ key: 'site', label: 'Настройки сайта', icon: 'Settings' }] : []),
                ].map(t => (
                  <button key={t.key} onClick={() => setTab(t.key as 'users' | 'site')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${tab === t.key ? 'bg-emerald-500 text-black' : 'border border-[#1a3a1a] text-neutral-400 hover:text-white'}`}
                  >
                    <Icon name={t.icon} size={14} />{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* USERS TAB */}
              {tab === 'users' && (
                <div className="space-y-3">
                  {loadingUsers && <div className="py-8 text-center text-neutral-500">Загрузка...</div>}
                  {users.map(u => {
                    const roleInfo = ROLES.find(r => r.value === u.role) || ROLES[0]
                    return (
                      <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 font-bold text-emerald-400">
                          {u.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{u.username}</div>
                          <div className="text-xs font-semibold" style={{ color: roleInfo.color }}>{roleInfo.label}</div>
                        </div>
                        {isCreator && u.id !== currentUser.id && (
                          <div className="flex flex-wrap gap-2">
                            <select value={u.role}
                              onChange={e => setRole(u.id, e.target.value as Role, u.privilege)}
                              className="rounded-lg border border-[#1a3a1a] bg-black/40 px-2 py-1 text-xs text-white outline-none"
                            >
                              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <select value={u.privilege || ''}
                              onChange={e => setRole(u.id, u.role, e.target.value || null)}
                              className="rounded-lg border border-[#1a3a1a] bg-black/40 px-2 py-1 text-xs text-white outline-none"
                            >
                              {PRIVILEGES.map(p => <option key={p} value={p}>{p || 'Без привилегии'}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* SITE SETTINGS TAB */}
              {tab === 'site' && isCreator && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-500">Изменения применяются после сохранения и перезагрузки страницы.</p>

                  {[
                    { key: 'site_title', label: 'Название сайта' },
                    { key: 'server_ip', label: 'IP сервера' },
                    { key: 'server_version', label: 'Версия сервера' },
                    { key: 'online_count', label: 'Онлайн игроков' },
                    { key: 'discord_url', label: 'Discord URL' },
                    { key: 'telegram_url', label: 'Telegram URL' },
                    { key: 'vk_url', label: 'VK URL' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="mb-1 block text-xs text-neutral-400">{f.label}</label>
                      <input
                        value={(settings as Record<string, string>)[f.key] || ''}
                        onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'hero_bg_color', label: 'Цвет фона героя' },
                      { key: 'accent_color', label: 'Акцентный цвет' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="mb-1 block text-xs text-neutral-400">{f.label}</label>
                        <div className="flex items-center gap-2">
                          <input type="color"
                            value={(settings as Record<string, string>)[f.key] || '#000000'}
                            onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
                            className="h-10 w-10 cursor-pointer rounded-lg border border-[#1a3a1a] bg-transparent"
                          />
                          <span className="text-sm text-neutral-400">{(settings as Record<string, string>)[f.key]}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={saveSettings} disabled={savingSettings}
                    className="w-full bg-emerald-500 text-black hover:bg-emerald-400"
                  >
                    {savingSettings ? 'Сохранение...' : 'Сохранить настройки'}
                  </Button>
                </div>
              )}
            </div>

            {/* Toast */}
            <AnimatePresence>
              {toast && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-[#07130a] px-4 py-2 text-sm font-semibold text-emerald-400"
                >
                  ✓ {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
