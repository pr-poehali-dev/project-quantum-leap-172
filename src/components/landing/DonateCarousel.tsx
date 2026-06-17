import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import {
  parseJSON, type SiteSettings,
  type Privilege, type CoinItem, type CaseItem, type BattlePass, type Product,
} from '@/lib/api'
import { ItemDetailModal, type ItemDetail } from './ItemDetailModal'

type SectionKey = 'privileges' | 'coins' | 'cases' | 'battlepass'
export type { SectionKey }

const SECTIONS: { key: SectionKey; title: string; icon: string; color: string }[] = [
  { key: 'privileges', title: 'Привилегии',   icon: 'Crown',   color: '#4ade80' },
  { key: 'coins',      title: 'Коин-магазин', icon: 'Coins',   color: '#facc15' },
  { key: 'cases',      title: 'Кейсы',        icon: 'Package', color: '#38bdf8' },
  { key: 'battlepass', title: 'Battle Pass',  icon: 'Swords',  color: '#fb923c' },
]

interface Props {
  settings: SiteSettings
  onBuy: (p: Product) => void
  onOpenBattlePass: () => void
  addedId: string | null
  activeSection?: SectionKey | null
  onSectionChange?: (k: SectionKey) => void
  onOpenCase?: (c: CaseItem) => void
}

function waveDelay(index: number, total: number) {
  const center = (total - 1) / 2
  return Math.abs(index - center) * 0.08
}

function WaveCard({ index, total, children }: { index: number; total: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: waveDelay(index, total), ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

function buyBtnStyle(color: string, added: boolean) {
  return {
    background: added ? '#22c55e' : `linear-gradient(135deg, ${color}, ${color}bb)`,
    boxShadow: `0 4px 14px -4px ${color}55`,
  }
}

export function DonateCarousel({ settings, onBuy, onOpenBattlePass, addedId, activeSection, onSectionChange, onOpenCase }: Props) {
  const [internalActive, setInternalActive] = useState(0)
  const [dir, setDir] = useState(1)
  const [detail, setDetail] = useState<ItemDetail | null>(null)

  const activeIndex = activeSection ? SECTIONS.findIndex(s => s.key === activeSection) : internalActive
  const active = activeIndex < 0 ? internalActive : activeIndex
  const section = SECTIONS[active]

  const go = (delta: number) => {
    setDir(delta)
    const next = (active + delta + SECTIONS.length) % SECTIONS.length
    setInternalActive(next)
    onSectionChange?.(SECTIONS[next].key)
  }

  const jumpTo = (idx: number) => {
    setDir(idx > active ? 1 : -1)
    setInternalActive(idx)
    onSectionChange?.(SECTIONS[idx].key)
  }

  return (
    <>
      <section className="mt-10">
        {/* Заголовок + стрелки */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <button onClick={() => go(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-[#07130a] text-emerald-400 transition-all hover:scale-110 hover:bg-emerald-500/10 active:scale-95"
          >
            <Icon name="ChevronLeft" size={18} />
          </button>

          <AnimatePresence mode="wait">
            <motion.div key={section.key}
              initial={{ opacity: 0, y: dir > 0 ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dir > 0 ? -10 : 10 }}
              transition={{ duration: 0.25 }}
              className="flex w-48 items-center justify-center gap-2"
            >
              <Icon name={section.icon} size={22} style={{ color: section.color }} />
              <h2 className="font-display text-lg font-bold text-white md:text-xl"
                style={{ textShadow: `0 0 14px ${section.color}55` }}
              >
                {section.title}
              </h2>
            </motion.div>
          </AnimatePresence>

          <button onClick={() => go(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-[#07130a] text-emerald-400 transition-all hover:scale-110 hover:bg-emerald-500/10 active:scale-95"
          >
            <Icon name="ChevronRight" size={18} />
          </button>
        </div>

        {/* Точки-индикаторы */}
        <div className="mb-6 flex justify-center gap-1.5">
          {SECTIONS.map((s, i) => (
            <button key={s.key} onClick={() => jumpTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5' : 'w-1.5 bg-white/20'}`}
              style={i === active ? { background: s.color } : undefined}
            />
          ))}
        </div>

        {/* Контент с волной */}
        <AnimatePresence mode="wait">
          <motion.div key={section.key}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {section.key === 'privileges' && <PrivilegesGrid settings={settings} onBuy={onBuy} addedId={addedId} onDetail={setDetail} />}
            {section.key === 'coins'      && <CoinsGrid      settings={settings} onBuy={onBuy} addedId={addedId} onDetail={setDetail} />}
            {section.key === 'cases'      && <CasesGrid      settings={settings} onBuy={onBuy} addedId={addedId} onDetail={setDetail} onOpenCase={onOpenCase} />}
            {section.key === 'battlepass' && <BattlePassPreview settings={settings} onOpen={onOpenBattlePass} />}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Модалка-детали */}
      <ItemDetailModal item={detail} onClose={() => setDetail(null)} onBuy={p => { onBuy(p) }} addedId={addedId} />
    </>
  )
}

// ─── Привилегии ───────────────────────────────────────────────────────────────
function PrivilegesGrid({ settings, onBuy, addedId, onDetail }: {
  settings: SiteSettings; onBuy: (p: Product) => void; addedId: string | null; onDetail: (d: ItemDetail) => void
}) {
  const list = parseJSON<Privilege[]>(settings.privileges_json, [])
  const EMOJIS = ['👑', '💎', '⭐', '🌟', '🐉']

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {list.map((r, i) => (
        <WaveCard key={r.id} index={i} total={list.length}>
          <div
            onClick={() => onDetail({
              id: r.id, name: r.name, desc: r.desc, price: r.price,
              color: r.color, image: r.image, emoji: EMOJIS[i] || '👑',
              features: r.features, extraLabel: 'Привилегия',
            })}
            className="group flex h-full cursor-pointer flex-col items-center overflow-hidden rounded-2xl border border-[#1a3a1a] bg-[#07130a] p-3 text-center transition-all hover:-translate-y-1 hover:shadow-lg md:p-4"
            style={{ ['--hover-border' as string]: `${r.color}44` }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = `${r.color}44`)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a3a1a')}
          >
            {/* Аватарка или эмодзи */}
            <div className="mb-2.5 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl"
              style={{ background: `${r.color}18` }}>
              {r.image
                ? <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                : <span className="text-3xl transition-transform group-hover:scale-110">{EMOJIS[i] || '👑'}</span>}
            </div>
            <div className="text-sm font-bold" style={{ color: r.color }}>{r.name}</div>
            <p className="mt-1 flex-1 text-[11px] leading-relaxed text-neutral-500 line-clamp-2">{r.desc}</p>
            <div className="mt-2 text-base font-bold text-white">{r.price} ₽</div>
            <button
              onClick={e => { e.stopPropagation(); onBuy({ id: r.id, name: r.name, description: r.desc, price: r.price, icon: 'Crown', color: r.color }) }}
              className="mt-2 w-full rounded-lg py-2 text-xs font-bold text-black transition-all active:scale-95"
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

// ─── Коины ───────────────────────────────────────────────────────────────────
function CoinsGrid({ settings, onBuy, addedId, onDetail }: {
  settings: SiteSettings; onBuy: (p: Product) => void; addedId: string | null; onDetail: (d: ItemDetail) => void
}) {
  const list = parseJSON<CoinItem[]>(settings.coins_json, [])
  const color = '#facc15'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c, i) => (
        <WaveCard key={c.id} index={i} total={list.length}>
          <div
            onClick={() => onDetail({ id: c.id, name: c.name, desc: c.desc, price: c.price, color, image: c.image, emoji: '🪙', extraLabel: 'Коины' })}
            className="group flex h-full cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-[#1a3a1a] bg-[#07130a] p-4 transition-all hover:border-amber-500/30 hover:bg-amber-500/5"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-amber-500/10">
              {c.image
                ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                : <span className="text-3xl transition-transform group-hover:scale-110">🪙</span>}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold text-amber-300">{c.name}</div>
              <p className="mt-0.5 truncate text-xs text-neutral-400">{c.desc}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-bold text-white">{c.price} ₽</span>
                <button
                  onClick={e => { e.stopPropagation(); onBuy({ id: c.id, name: c.name, description: c.desc, price: c.price, icon: 'Coins', color }) }}
                  className="rounded-lg px-3 py-1 text-xs font-bold text-black transition-all active:scale-95"
                  style={buyBtnStyle(color, addedId === c.id)}
                >
                  {addedId === c.id ? '✓' : 'Купить'}
                </button>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="shrink-0 text-neutral-700 group-hover:text-amber-500" />
          </div>
        </WaveCard>
      ))}
    </div>
  )
}

// ─── Кейсы ───────────────────────────────────────────────────────────────────
function CasesGrid({ settings, onBuy, addedId, onDetail, onOpenCase }: {
  settings: SiteSettings; onBuy: (p: Product) => void; addedId: string | null
  onDetail: (d: ItemDetail) => void; onOpenCase?: (c: CaseItem) => void
}) {
  const list = parseJSON<CaseItem[]>(settings.cases_json, [])
  const color = '#38bdf8'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c, i) => (
        <WaveCard key={c.id} index={i} total={list.length}>
          <div
            onClick={() => onDetail({ id: c.id, name: c.name, desc: c.desc, price: c.price, color, image: c.image, emoji: '📦', chance: c.chance, extraLabel: 'Кейс' })}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#1a3a1a] bg-[#07130a] p-4 transition-all hover:border-sky-500/30 hover:bg-sky-500/5"
          >
            {/* Верхняя часть: иконка + инфо */}
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-500/10">
                {c.image
                  ? <img src={c.image} alt={c.name} className="h-full w-full object-cover" />
                  : <span className="text-3xl transition-transform group-hover:scale-110">📦</span>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold text-sky-300">{c.name}</div>
                <p className="mt-0.5 line-clamp-1 text-xs text-neutral-400">{c.desc}</p>
                <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                  <Icon name="Dices" size={10} />Шанс: {c.chance}
                </div>
              </div>
            </div>
            {/* Нижняя часть: цена + кнопки */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-lg font-bold text-white">{c.price} ₽</span>
              <div className="ml-auto flex gap-1.5">
                {onOpenCase && (
                  <button
                    onClick={e => { e.stopPropagation(); onOpenCase(c) }}
                    className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-sky-500 to-blue-500 px-3 py-1.5 text-xs font-bold text-white shadow-[0_2px_12px_rgba(56,189,248,0.4)] transition-all hover:brightness-110 active:scale-95"
                  >
                    <Icon name="Package" size={12} />Открыть
                  </button>
                )}
                <button
                  onClick={e => { e.stopPropagation(); onBuy({ id: c.id, name: c.name, description: c.desc, price: c.price, icon: 'Package', color }) }}
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-black transition-all active:scale-95"
                  style={buyBtnStyle(color, addedId === c.id)}
                >
                  {addedId === c.id ? '✓' : 'В корзину'}
                </button>
              </div>
            </div>
          </div>
        </WaveCard>
      ))}
    </div>
  )
}

// ─── Battle Pass preview ──────────────────────────────────────────────────────
function BattlePassPreview({ settings, onOpen }: { settings: SiteSettings; onOpen: () => void }) {
  const bp = parseJSON<BattlePass>(settings.battlepass_json, { price: 569, levels: [] })
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-lg"
    >
      <div className="overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-br from-[#1a0f05] via-[#150c04] to-[#0a0602] p-6 shadow-[0_0_40px_-10px_rgba(251,146,60,0.4)]">
        <div className="flex flex-col items-center text-center">
          <div className="text-5xl">⚔️</div>
          <h3 className="mt-3 font-display text-xl font-bold text-orange-300">BATTLE PASS</h3>
          <p className="mt-2 max-w-xs text-sm text-neutral-300">
            Выполняй задания, прокачивай уровни и получай эксклюзивные награды!
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {bp.levels.slice(0, 3).map(l => (
              <div key={l.level} className="rounded-lg border border-orange-500/20 bg-black/30 px-3 py-1.5 text-center">
                <div className="text-[10px] text-orange-400">Ур. {l.level}</div>
                <div className="text-xs font-semibold text-white">{l.reward}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-2xl font-bold text-white">{bp.price} ₽</div>
          <button onClick={onOpen}
            className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 font-bold text-black shadow-[0_0_16px_rgba(251,146,60,0.4)] transition-all hover:bg-orange-400 active:scale-95"
          >
            <Icon name="Sparkles" size={17} />Открыть Battle Pass
          </button>
        </div>
      </div>
    </motion.div>
  )
}