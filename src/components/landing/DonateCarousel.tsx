import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import {
  parseJSON, type SiteSettings,
  type Privilege, type CoinItem, type CaseItem, type BattlePass, type Product,
} from '@/lib/api'

type SectionKey = 'privileges' | 'coins' | 'cases' | 'battlepass'

const SECTIONS: { key: SectionKey; title: string; icon: string; color: string }[] = [
  { key: 'privileges', title: 'Привилегии',  icon: 'Crown',   color: '#4ade80' },
  { key: 'coins',      title: 'Коин-магазин', icon: 'Coins',   color: '#facc15' },
  { key: 'cases',      title: 'Кейсы',        icon: 'Package', color: '#38bdf8' },
  { key: 'battlepass', title: 'Battle Pass',  icon: 'Swords',  color: '#fb923c' },
]

interface Props {
  settings: SiteSettings
  onBuy: (p: Product) => void
  onOpenBattlePass: () => void
  addedId: string | null
}

// волновая задержка: центр первым, далее по расстоянию от центра
function waveDelay(index: number, total: number) {
  const center = (total - 1) / 2
  return Math.abs(index - center) * 0.1
}

export function DonateCarousel({ settings, onBuy, onOpenBattlePass, addedId }: Props) {
  const [active, setActive] = useState(0)
  const [dir, setDir] = useState(1)

  const section = SECTIONS[active]

  const go = (delta: number) => {
    setDir(delta)
    setActive(prev => (prev + delta + SECTIONS.length) % SECTIONS.length)
  }

  return (
    <section className="mt-12">
      {/* заголовок раздела со стрелками */}
      <div className="mb-8 flex items-center justify-center gap-4">
        <button onClick={() => go(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-[#07130a] text-emerald-400 transition-all hover:scale-110 hover:bg-emerald-500/10 active:scale-95"
          aria-label="Назад"
        >
          <Icon name="ChevronLeft" size={20} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div key={section.key}
            initial={{ opacity: 0, y: dir > 0 ? 12 : -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: dir > 0 ? -12 : 12 }}
            transition={{ duration: 0.3 }}
            className="flex min-w-[220px] items-center justify-center gap-3"
          >
            <Icon name={section.icon} size={26} style={{ color: section.color }} />
            <h2 className="font-display text-xl font-bold tracking-wider text-white md:text-2xl"
              style={{ textShadow: `0 0 16px ${section.color}66` }}
            >
              {section.title}
            </h2>
          </motion.div>
        </AnimatePresence>

        <button onClick={() => go(1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-[#07130a] text-emerald-400 transition-all hover:scale-110 hover:bg-emerald-500/10 active:scale-95"
          aria-label="Вперёд"
        >
          <Icon name="ChevronRight" size={20} />
        </button>
      </div>

      {/* точки разделов */}
      <div className="mb-8 flex justify-center gap-2">
        {SECTIONS.map((s, i) => (
          <button key={s.key} onClick={() => { setDir(i > active ? 1 : -1); setActive(i) }}
            className={`h-2 rounded-full transition-all ${i === active ? 'w-6' : 'w-2 bg-white/20'}`}
            style={i === active ? { background: s.color } : undefined}
          />
        ))}
      </div>

      {/* контент с волной */}
      <AnimatePresence mode="wait">
        <motion.div key={section.key}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {section.key === 'privileges' && (
            <PrivilegesGrid settings={settings} onBuy={onBuy} addedId={addedId} />
          )}
          {section.key === 'coins' && (
            <CoinsGrid settings={settings} onBuy={onBuy} addedId={addedId} />
          )}
          {section.key === 'cases' && (
            <CasesGrid settings={settings} onBuy={onBuy} addedId={addedId} />
          )}
          {section.key === 'battlepass' && (
            <BattlePassPreview settings={settings} onOpen={onOpenBattlePass} />
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

// карточка-обёртка с волновой анимацией
function WaveCard({ index, total, children }: { index: number; total: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, delay: waveDelay(index, total), ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function buyBtnStyle(color: string, added: boolean) {
  return {
    background: added ? '#22c55e' : `linear-gradient(135deg, ${color}, ${color}bb)`,
    boxShadow: `0 4px 16px -4px ${color}66`,
  }
}

function PrivilegesGrid({ settings, onBuy, addedId }: { settings: SiteSettings; onBuy: (p: Product) => void; addedId: string | null }) {
  const list = parseJSON<Privilege[]>(settings.privileges_json, [])
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {list.map((r, i) => (
        <WaveCard key={r.id} index={i} total={list.length}>
          <div className="group flex h-full flex-col items-center overflow-hidden rounded-2xl border border-[#1a3a1a] bg-[#07130a] p-4 text-center transition-all hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-[0_8px_40px_-8px_rgba(74,222,128,0.3)] md:p-5">
            <div className="mb-3 text-5xl transition-transform group-hover:scale-110">{i === list.length - 1 ? '🐉' : '👑'}</div>
            <div className="font-display text-base font-bold md:text-lg" style={{ color: r.color, textShadow: `0 0 12px ${r.color}66` }}>{r.name}</div>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-400">{r.desc}</p>
            <div className="mt-4 text-xl font-bold text-white md:text-2xl">{r.price} ₽</div>
            <button onClick={() => onBuy({ id: r.id, name: r.name, description: r.desc, price: r.price, icon: 'Crown', color: r.color })}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-black transition-all active:scale-95"
              style={buyBtnStyle(r.color, addedId === r.id)}
            >
              {addedId === r.id ? '✓ Добавлено' : 'Купить'}
            </button>
          </div>
        </WaveCard>
      ))}
    </div>
  )
}

function CoinsGrid({ settings, onBuy, addedId }: { settings: SiteSettings; onBuy: (p: Product) => void; addedId: string | null }) {
  const list = parseJSON<CoinItem[]>(settings.coins_json, [])
  const color = '#facc15'
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((c, i) => (
        <WaveCard key={c.id} index={i} total={list.length}>
          <div className="group flex h-full flex-col items-center overflow-hidden rounded-2xl border border-[#1a3a1a] bg-[#07130a] p-5 text-center transition-all hover:-translate-y-2 hover:border-amber-500/40 hover:shadow-[0_8px_40px_-8px_rgba(250,204,21,0.3)]">
            {c.image
              ? <img src={c.image} alt={c.name} className="mb-3 h-20 w-20 rounded-xl object-cover" />
              : <div className="mb-3 text-5xl transition-transform group-hover:scale-110">🪙</div>}
            <div className="font-bold text-amber-300">{c.name}</div>
            <p className="mt-1 flex-1 text-xs text-neutral-400">{c.desc}</p>
            <div className="mt-3 text-xl font-bold text-white">{c.price} ₽</div>
            <button onClick={() => onBuy({ id: c.id, name: c.name, description: c.desc, price: c.price, icon: 'Coins', color })}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-black transition-all active:scale-95"
              style={buyBtnStyle(color, addedId === c.id)}
            >
              {addedId === c.id ? '✓ Добавлено' : 'Купить'}
            </button>
          </div>
        </WaveCard>
      ))}
    </div>
  )
}

function CasesGrid({ settings, onBuy, addedId }: { settings: SiteSettings; onBuy: (p: Product) => void; addedId: string | null }) {
  const list = parseJSON<CaseItem[]>(settings.cases_json, [])
  const color = '#38bdf8'
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {list.map((c, i) => (
        <WaveCard key={c.id} index={i} total={list.length}>
          <div className="group flex h-full flex-col items-center overflow-hidden rounded-2xl border border-[#1a3a1a] bg-[#07130a] p-5 text-center transition-all hover:-translate-y-2 hover:border-sky-500/40 hover:shadow-[0_8px_40px_-8px_rgba(56,189,248,0.3)]">
            {c.image
              ? <img src={c.image} alt={c.name} className="mb-3 h-20 w-20 rounded-xl object-cover" />
              : <div className="mb-3 text-5xl transition-transform group-hover:scale-110">📦</div>}
            <div className="font-bold text-sky-300">{c.name}</div>
            <p className="mt-1 flex-1 text-xs text-neutral-400">{c.desc}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-300">
              <Icon name="Dices" size={11} />Шанс: {c.chance}
            </div>
            <div className="mt-2 text-xl font-bold text-white">{c.price} ₽</div>
            <button onClick={() => onBuy({ id: c.id, name: c.name, description: c.desc, price: c.price, icon: 'Package', color })}
              className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-black transition-all active:scale-95"
              style={buyBtnStyle(color, addedId === c.id)}
            >
              {addedId === c.id ? '✓ Добавлено' : 'Купить'}
            </button>
          </div>
        </WaveCard>
      ))}
    </div>
  )
}

function BattlePassPreview({ settings, onOpen }: { settings: SiteSettings; onOpen: () => void }) {
  const bp = parseJSON<BattlePass>(settings.battlepass_json, { price: 569, levels: [] })
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-2xl"
    >
      <div className="overflow-hidden rounded-2xl border border-orange-500/40 bg-gradient-to-br from-[#1a0f05] via-[#150c04] to-[#0a0602] p-6 shadow-[0_0_50px_-15px_rgba(251,146,60,0.5)] md:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="text-6xl">⚔️</div>
          <h3 className="mt-3 font-display text-2xl font-bold text-orange-300" style={{ textShadow: '0 0 20px rgba(251,146,60,0.5)' }}>BATTLE PASS</h3>
          <p className="mt-2 max-w-sm text-sm text-neutral-300">
            Выполняй задания, прокачивай уровни и получай эксклюзивные награды каждого сезона!
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {bp.levels.slice(0, 4).map(l => (
              <div key={l.level} className="rounded-xl border border-orange-500/20 bg-black/30 px-4 py-2 text-center">
                <div className="text-xs text-orange-400">Уровень {l.level}</div>
                <div className="text-sm font-semibold text-white">{l.reward}</div>
              </div>
            ))}
          </div>
          <button onClick={onOpen}
            className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-7 py-3 font-bold text-black shadow-[0_0_20px_rgba(251,146,60,0.4)] transition-all hover:bg-orange-400 active:scale-95"
          >
            <Icon name="Sparkles" size={18} />Открыть Battle Pass
          </button>
        </div>
      </div>
    </motion.div>
  )
}
