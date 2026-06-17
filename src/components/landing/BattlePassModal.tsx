import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { ModalShell } from './ModalShell'
import { parseJSON, type SiteSettings, type BattlePass, type User, type Product } from '@/lib/api'

interface Props {
  open: boolean
  onClose: () => void
  settings: SiteSettings
  user: User | null
  onBuy: (p: Product) => void
}

interface Quest { id: string; text: string; reward: string }

const QUESTS: Quest[] = [
  { id: 'q1', text: 'Добудь 64 блока алмазной руды', reward: '300 коинов' },
  { id: 'q2', text: 'Победи 50 мобов на арене', reward: '200 коинов' },
  { id: 'q3', text: 'Проведи 5 часов на сервере', reward: 'Набор еды' },
  { id: 'q4', text: 'Построй дом из 500 блоков', reward: 'Редкий кейс' },
  { id: 'q5', text: 'Заверши данж «Логово дракона»', reward: 'Эксклюзивный скин' },
]

const PROGRESS_KEY = 'mc_bp_quests'

export function BattlePassModal({ open, onClose, settings, user, onBuy }: Props) {
  const bp = parseJSON<BattlePass>(settings.battlepass_json, { price: 569, levels: [] })
  // признак владения: привилегия пользователя == 'Battle Pass' (выдаётся создателем)
  const hasPass = !!user && (user.privilege === 'Battle Pass' || user.role === 'creator' || user.role === 'admin')

  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')) } catch { /* noop */ }
  }, [open])

  const toggle = (id: string) => {
    setDone(prev => {
      const next = { ...prev, [id]: !prev[id] }
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next))
      return next
    })
  }

  const completed = QUESTS.filter(q => done[q.id]).length
  const pct = Math.round((completed / QUESTS.length) * 100)

  return (
    <ModalShell open={open} onClose={onClose} title="Battle Pass" icon="Swords" maxWidth="max-w-xl">
      <div className="p-6">
        {!hasPass ? (
          <BuyScreen price={bp.price} levels={bp.levels} onBuy={() => {
            onBuy({ id: 'battlepass', name: 'Battle Pass', description: 'Сезонный пропуск с заданиями и наградами', price: bp.price, icon: 'Swords', color: '#fb923c' })
          }} user={user} />
        ) : (
          <>
            {/* прогресс */}
            <div className="mb-5 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-orange-300">Прогресс сезона</span>
                <span className="text-white">{completed}/{QUESTS.length}</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-black/40">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            {/* задания */}
            <div className="space-y-2.5">
              <div className="mb-1 text-xs font-semibold uppercase text-neutral-500">Задания сезона</div>
              {QUESTS.map((q, i) => {
                const ok = !!done[q.id]
                return (
                  <motion.button key={q.id} onClick={() => toggle(q.id)}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${ok ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-[#1a3a1a] bg-black/20 hover:border-orange-500/30'}`}
                  >
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${ok ? 'border-emerald-500 bg-emerald-500 text-black' : 'border-neutral-600'}`}>
                      {ok && <Icon name="Check" size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm ${ok ? 'text-neutral-400 line-through' : 'text-white'}`}>{q.text}</div>
                      <div className="text-xs text-orange-400">Награда: {q.reward}</div>
                    </div>
                  </motion.button>
                )
              })}
            </div>

            {pct === 100 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-sm font-semibold text-emerald-300"
              >
                🎉 Все задания сезона выполнены! Поздравляем!
              </motion.div>
            )}
          </>
        )}
      </div>
    </ModalShell>
  )
}

function BuyScreen({ price, levels, onBuy, user }: { price: number; levels: BattlePass['levels']; onBuy: () => void; user: User | null }) {
  return (
    <div className="text-center">
      <div className="text-6xl">⚔️</div>
      <h3 className="mt-3 font-display text-xl font-bold text-orange-300">Battle Pass ещё не активирован</h3>
      <p className="mt-2 text-sm text-neutral-300">
        Приобретите Battle Pass, чтобы получить доступ к заданиям сезона и эксклюзивным наградам.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {levels.slice(0, 3).map(l => (
          <div key={l.level} className="rounded-xl border border-orange-500/20 bg-black/30 p-3">
            <div className="text-xs text-orange-400">Уровень {l.level}</div>
            <div className="text-sm font-semibold text-white">{l.reward}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-3xl font-bold text-white">{price} ₽</div>
      <button onClick={onBuy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 font-bold text-black shadow-[0_0_20px_rgba(251,146,60,0.4)] transition-all hover:bg-orange-400 active:scale-95"
      >
        <Icon name="ShoppingCart" size={18} />Купить Battle Pass
      </button>

      {!user && (
        <p className="mt-3 text-xs text-neutral-500">После покупки войдите в аккаунт — создатель выдаст роль «Battle Pass»</p>
      )}
      {user && (
        <p className="mt-3 text-xs text-neutral-500">После оплаты создатель выдаст вам роль «Battle Pass», и задания станут доступны</p>
      )}
    </div>
  )
}
