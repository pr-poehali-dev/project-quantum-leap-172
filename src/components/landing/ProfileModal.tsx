import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import type { User, Role, InventoryItem, BalanceTx } from '@/lib/api'
import { isStaff, ROLE_META } from '@/lib/permissions'

const PRIV_COLORS: Record<string, string> = {
  VIP: '#4ade80', PREMIUM: '#22d3ee', ELITE: '#a78bfa',
  DELUXE: '#06b6d4', LEGEND: '#fbbf24', DRAGON: '#f87171',
}

const RARITY_COLOR: Record<string, string> = {
  common: '#9ca3af', uncommon: '#4ade80', rare: '#38bdf8',
  epic: '#a78bfa', legendary: '#fbbf24',
}

type InnerTab = 'main' | 'inventory' | 'history' | 'topup'

interface Props {
  open: boolean
  onClose: () => void
  user: User
  onLogout: () => void
  onOpenStaff?: () => void
  onOpenAdmin?: () => void
  onOpenPunishments?: () => void
  balance: number
  inventory: InventoryItem[]
  transactions: BalanceTx[]
  onTopup: (amount: number) => Promise<void>
}

export function ProfileModal({
  open, onClose, user, onLogout,
  onOpenStaff, onOpenAdmin, onOpenPunishments,
  balance, inventory, transactions, onTopup,
}: Props) {
  const [tab, setTab]           = useState<InnerTab>('main')
  const [topupVal, setTopupVal] = useState('100')
  const [topping, setTopping]   = useState(false)
  const [topupErr, setTopupErr] = useState('')

  const roleInfo = ROLE_META[user.role as Role] || ROLE_META.player
  const privColor = user.privilege ? (PRIV_COLORS[user.privilege] || '#4ade80') : null
  const isAdmin = user.role === 'creator' || user.role === 'admin'

  const go = (fn?: () => void) => { onClose(); fn?.() }

  const handleTopup = async () => {
    const amount = parseInt(topupVal)
    if (!amount || amount < 10) { setTopupErr('Минимум 10 ₽'); return }
    if (amount > 100000) { setTopupErr('Максимум 100 000 ₽'); return }
    setTopping(true); setTopupErr('')
    try {
      await onTopup(amount)
      setTab('main')
    } catch (e: unknown) {
      setTopupErr(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setTopping(false)
    }
  }

  const QUICK = [100, 250, 500, 1000]

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-emerald-500/25 bg-[#07130a] shadow-[0_0_50px_-12px_rgba(16,185,129,0.4)]"
          >
            <button onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-neutral-500 hover:text-white">
              <Icon name="X" size={14} />
            </button>

            {/* Шапка — аватар */}
            <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-xl font-bold text-emerald-400">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-white">{user.username}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Icon name={roleInfo.icon} size={12} style={{ color: roleInfo.color }} />
                  <span className="text-xs font-semibold" style={{ color: roleInfo.color }}>{roleInfo.label}</span>
                </div>
              </div>
              {/* Баланс */}
              <button onClick={() => setTab('topup')}
                className="flex flex-col items-end rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 transition-colors hover:border-emerald-500/40">
                <span className="text-[10px] text-neutral-500">Баланс</span>
                <span className="text-sm font-bold text-emerald-400">{balance} ₽</span>
              </button>
            </div>

            {/* Внутренние табы */}
            <div className="flex border-b border-white/5 px-4 pt-2">
              {([
                ['main',      'Профиль',  'User'],
                ['inventory', 'Инвентарь','Archive'],
                ['history',   'История',  'Receipt'],
                ['topup',     'Пополнить','Plus'],
              ] as const).map(([k, l, ic]) => (
                <button key={k} onClick={() => setTab(k)}
                  className={`flex items-center gap-1.5 border-b-2 px-3 pb-2 text-xs font-semibold transition-all ${tab === k ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
                >
                  <Icon name={ic} size={12} />{l}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* ── Главное ─────────────────────────────────────────────── */}
              {tab === 'main' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
                      <div className="text-xs text-neutral-500">Привилегия</div>
                      {user.privilege
                        ? <div className="mt-1 text-sm font-bold" style={{ color: privColor || '#4ade80' }}>{user.privilege}</div>
                        : <div className="mt-1 text-sm text-neutral-500">Нет</div>}
                    </div>
                    <div className="rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
                      <div className="text-xs text-neutral-500">Предметов</div>
                      <div className="mt-1 text-sm font-bold text-white">{inventory.length}</div>
                    </div>
                  </div>

                  <button onClick={() => go(onOpenPunishments)}
                    className="flex w-full items-center gap-3 rounded-xl border border-[#1a3a1a] bg-black/20 px-3 py-2.5 text-sm text-neutral-300 transition-colors hover:border-red-500/30 hover:bg-red-500/5">
                    <Icon name="Gavel" size={15} className="text-red-400" />
                    Мои наказания
                    <Icon name="ChevronRight" size={13} className="ml-auto text-neutral-600" />
                  </button>

                  {isStaff(user.role) && (
                    <button onClick={() => go(onOpenStaff)}
                      className="flex w-full items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2.5 text-sm text-sky-300 transition-colors hover:border-sky-500/40 hover:bg-sky-500/10">
                      <Icon name="ShieldHalf" size={15} />
                      Панель персонала
                      <Icon name="ChevronRight" size={13} className="ml-auto text-neutral-600" />
                    </button>
                  )}

                  {isAdmin && (
                    <button onClick={() => go(onOpenAdmin)}
                      className="flex w-full items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-sm text-amber-300 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10">
                      <Icon name="Settings" size={15} />
                      Панель управления
                      <Icon name="ChevronRight" size={13} className="ml-auto text-neutral-600" />
                    </button>
                  )}

                  <Button onClick={onLogout} variant="outline"
                    className="mt-1 w-full border-red-500/30 text-red-400 hover:bg-red-500/10 h-9 text-xs">
                    <Icon name="LogOut" size={14} className="mr-2" />Выйти
                  </Button>
                </div>
              )}

              {/* ── Инвентарь ───────────────────────────────────────────── */}
              {tab === 'inventory' && (
                <div>
                  {inventory.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="text-4xl mb-2">📦</div>
                      <p className="text-sm text-neutral-500">Инвентарь пуст — открой кейс!</p>
                    </div>
                  ) : (
                    <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                      {inventory.map(it => (
                        <div key={it.id}
                          className="flex items-center gap-3 rounded-xl border border-[#1a3a1a] bg-black/20 p-2.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/30"
                            style={{ border: `1px solid ${it.color}44` }}>
                            {it.image
                              ? <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                              : <span className="text-lg">🎁</span>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-white">{it.name}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase" style={{ color: RARITY_COLOR[it.rarity] || '#9ca3af' }}>
                                {it.rarity}
                              </span>
                              <span className="text-[10px] text-neutral-600">из {it.case_name}</span>
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-neutral-600">
                            {new Date(it.obtained_at).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── История транзакций ──────────────────────────────────── */}
              {tab === 'history' && (
                <div>
                  {transactions.length === 0 ? (
                    <div className="py-8 text-center text-sm text-neutral-500">История пуста</div>
                  ) : (
                    <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
                      {transactions.map((tx, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-xl border border-[#1a3a1a] bg-black/20 px-3 py-2">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tx.delta > 0 ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
                            <Icon name={tx.delta > 0 ? 'ArrowDownLeft' : 'ArrowUpRight'} size={14}
                              className={tx.delta > 0 ? 'text-emerald-400' : 'text-red-400'} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs text-neutral-300">{tx.reason}</div>
                            <div className="text-[10px] text-neutral-600">
                              {new Date(tx.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                          <div className={`text-sm font-bold ${tx.delta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {tx.delta > 0 ? '+' : ''}{tx.delta} ₽
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Пополнение ──────────────────────────────────────────── */}
              {tab === 'topup' && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-center">
                    <div className="text-xs text-neutral-500">Текущий баланс</div>
                    <div className="text-2xl font-bold text-emerald-400">{balance} ₽</div>
                  </div>

                  <div>
                    <div className="mb-1.5 text-xs text-neutral-500">Быстрый выбор</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {QUICK.map(q => (
                        <button key={q} onClick={() => setTopupVal(String(q))}
                          className={`rounded-lg border py-2 text-xs font-semibold transition-all ${topupVal === String(q) ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' : 'border-[#1a3a1a] text-neutral-400 hover:border-emerald-500/30 hover:text-white'}`}>
                          {q} ₽
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">Сумма пополнения</label>
                    <input
                      type="number" value={topupVal}
                      onChange={e => setTopupVal(e.target.value)}
                      min="10" max="100000"
                      className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                      placeholder="Введите сумму"
                    />
                    {topupErr && <p className="mt-1 text-xs text-red-400">{topupErr}</p>}
                  </div>

                  <button onClick={handleTopup} disabled={topping}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 font-bold text-black transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50">
                    <Icon name="Plus" size={16} />
                    {topping ? 'Пополняем...' : `Пополнить на ${topupVal || 0} ₽`}
                  </button>

                  <p className="text-center text-[10px] text-neutral-600">
                    Пополнение тестовое — обратитесь к создателю сервера
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
