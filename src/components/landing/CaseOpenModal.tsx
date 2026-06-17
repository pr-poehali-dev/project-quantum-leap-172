import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { casesApi, type CaseItemDrop, type CaseItem } from '@/lib/api'

// Редкость → стиль
const RARITY_STYLE: Record<string, { label: string; bg: string; border: string; glow: string }> = {
  common:    { label: 'Обычный',     bg: 'bg-neutral-700/40',   border: 'border-neutral-600',   glow: '' },
  uncommon:  { label: 'Необычный',   bg: 'bg-emerald-900/40',   border: 'border-emerald-500/60', glow: '0 0 20px rgba(74,222,128,0.4)' },
  rare:      { label: 'Редкий',      bg: 'bg-sky-900/40',       border: 'border-sky-400/60',    glow: '0 0 20px rgba(56,189,248,0.5)' },
  epic:      { label: 'Эпический',   bg: 'bg-purple-900/40',    border: 'border-purple-400/60', glow: '0 0 24px rgba(167,139,250,0.6)' },
  legendary: { label: 'Легендарный', bg: 'bg-amber-900/40',     border: 'border-amber-400/70',  glow: '0 0 30px rgba(251,191,36,0.7)' },
}

interface Props {
  open: boolean
  onClose: () => void
  caseItem: CaseItem
  balance: number
  onOpened: (newBalance: number) => void
}

type Phase = 'idle' | 'loading' | 'spinning' | 'result'

const STRIP_COUNT = 40  // кол-во карточек в ленте
const CARD_W = 120       // px ширина карточки + gap

function buildStrip(items: CaseItemDrop[], winner: CaseItemDrop): CaseItemDrop[] {
  // заполняем случайными предметами, последний — победитель
  const pool = [...items]
  const strip: CaseItemDrop[] = []
  for (let i = 0; i < STRIP_COUNT - 1; i++) {
    strip.push(pool[Math.floor(Math.random() * pool.length)])
  }
  strip.push(winner)
  return strip
}

function ItemCard({ item, size = 'md', highlight = false }: { item: CaseItemDrop; size?: 'sm' | 'md'; highlight?: boolean }) {
  const style = RARITY_STYLE[item.rarity] || RARITY_STYLE.common
  const sz = size === 'sm' ? 'h-14 w-14' : 'h-20 w-20'
  return (
    <div className={`flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-all ${style.bg} ${style.border} ${highlight ? 'scale-105' : ''}`}
      style={highlight && style.glow ? { boxShadow: style.glow } : undefined}>
      <div className={`${sz} flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/30`}>
        {item.image
          ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          : <span className="text-2xl">🎁</span>}
      </div>
      <div className="max-w-[100px] truncate text-center text-[10px] font-semibold text-white">{item.name}</div>
      <div className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase"
        style={{ background: item.color + '33', color: item.color }}>
        {style.label}
      </div>
    </div>
  )
}

export function CaseOpenModal({ open, onClose, caseItem, balance, onOpened }: Props) {
  const [phase, setPhase]     = useState<Phase>('idle')
  const [items, setItems]     = useState<CaseItemDrop[]>([])
  const [strip, setStrip]     = useState<CaseItemDrop[]>([])
  const [winner, setWinner]   = useState<CaseItemDrop | null>(null)
  const [error, setError]     = useState('')
  const [offset, setOffset]   = useState(0)
  const stripRef              = useRef<HTMLDivElement>(null)

  // Загружаем предметы кейса при открытии
  useEffect(() => {
    if (!open) { setPhase('idle'); setWinner(null); setError(''); return }
    casesApi.items(caseItem.id).then(setItems).catch(() => setError('Не удалось загрузить кейс'))
  }, [open, caseItem.id])

  const canOpen = balance >= caseItem.price

  const openCase = async () => {
    if (!canOpen || phase !== 'idle') return
    setError('')
    setPhase('loading')
    try {
      const result = await casesApi.open(caseItem.id, caseItem.name, caseItem.price)
      const wonItem = result.won
      const allItems = result.all_items.length > 0 ? result.all_items : items

      // Строим ленту так, чтобы победитель был на позиции STRIP_COUNT-1
      const newStrip = buildStrip(allItems, wonItem)
      setStrip(newStrip)
      setOffset(0)
      setPhase('spinning')

      // Рассчитываем финальный сдвиг: победитель в центре (позиция STRIP_COUNT-1)
      const targetIdx = STRIP_COUNT - 1
      const containerW = stripRef.current?.parentElement?.clientWidth || 400
      const finalOffset = targetIdx * (CARD_W + 8) - containerW / 2 + CARD_W / 2

      // Плавная анимация — через requestAnimationFrame меняем offset
      setTimeout(() => {
        setOffset(finalOffset)
        setTimeout(() => {
          setWinner(wonItem)
          setPhase('result')
          onOpened(result.new_balance)
        }, 3500)
      }, 50)

    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка открытия кейса')
      setPhase('idle')
    }
  }

  const reset = () => {
    setPhase('idle')
    setWinner(null)
    setError('')
    setOffset(0)
  }

  const wonStyle = winner ? (RARITY_STYLE[winner.rarity] || RARITY_STYLE.common) : null

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={phase === 'idle' || phase === 'result' ? onClose : undefined}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#1a3a1a] bg-[#07130a]"
          >
            {/* Закрыть */}
            {(phase === 'idle' || phase === 'result') && (
              <button onClick={onClose}
                className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-neutral-500 hover:text-white">
                <Icon name="X" size={14} />
              </button>
            )}

            {/* Шапка */}
            <div className="border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-sky-500/10">
                  {caseItem.image
                    ? <img src={caseItem.image} alt={caseItem.name} className="h-full w-full object-cover" />
                    : <span className="text-xl">📦</span>}
                </div>
                <div>
                  <div className="font-bold text-white">{caseItem.name}</div>
                  <div className="text-xs text-neutral-400">{caseItem.desc}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-neutral-500">Ваш баланс</div>
                  <div className={`text-sm font-bold ${canOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                    {balance} ₽
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* Предметы кейса — превью (idle) */}
              {phase === 'idle' && items.length > 0 && (
                <div className="mb-4">
                  <div className="mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Содержимое кейса</div>
                  <div className="flex flex-wrap gap-2">
                    {items.map(it => <ItemCard key={it.id} item={it} size="sm" />)}
                  </div>
                </div>
              )}

              {/* Анимация прокрутки */}
              {(phase === 'spinning' || phase === 'result') && strip.length > 0 && (
                <div className="relative mb-4 overflow-hidden rounded-xl border border-[#1a3a1a] bg-black/40">
                  {/* Указатель центра */}
                  <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-emerald-400/80 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                  {/* Градиенты по краям */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#07130a] to-transparent" />
                  <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#07130a] to-transparent" />

                  <div className="overflow-hidden py-3 px-4">
                    <div
                      ref={stripRef}
                      className="flex gap-2"
                      style={{
                        transform: `translateX(-${offset}px)`,
                        transition: phase === 'spinning' && offset > 0
                          ? 'transform 3.4s cubic-bezier(0.05, 0.8, 0.3, 1)'
                          : 'none',
                        willChange: 'transform',
                      }}
                    >
                      {strip.map((it, idx) => (
                        <div key={idx} style={{ width: CARD_W, flexShrink: 0 }}>
                          <ItemCard item={it} size="md" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Результат */}
              {phase === 'result' && winner && wonStyle && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 200 }}
                  className="mb-4 rounded-2xl border p-5 text-center"
                  style={{
                    borderColor: winner.color + '66',
                    background: winner.color + '11',
                    boxShadow: wonStyle.glow || undefined,
                  }}
                >
                  <div className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: winner.color }}>
                    {wonStyle.label}
                  </div>
                  <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl"
                    style={{ background: winner.color + '22', border: `2px solid ${winner.color}55` }}>
                    {winner.image
                      ? <img src={winner.image} alt={winner.name} className="h-full w-full object-cover" />
                      : <span className="text-4xl">🎁</span>}
                  </div>
                  <div className="text-lg font-bold text-white">{winner.name}</div>
                  <div className="mt-1 text-xs text-neutral-400">Добавлено в твой инвентарь!</div>
                </motion.div>
              )}

              {/* Ошибка */}
              {error && (
                <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* Кнопки */}
              {phase === 'idle' && (
                <div className="space-y-2">
                  {!canOpen && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center text-sm text-amber-300">
                      Нужно {caseItem.price} ₽ — пополни баланс
                    </div>
                  )}
                  <button
                    onClick={openCase}
                    disabled={!canOpen || items.length === 0}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-black transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: canOpen ? 'linear-gradient(135deg, #38bdf8, #0ea5e9)' : '#374151' }}
                  >
                    <Icon name="Package" size={18} />
                    Открыть за {caseItem.price} ₽
                  </button>
                </div>
              )}

              {phase === 'loading' && (
                <div className="flex items-center justify-center gap-3 py-4 text-neutral-400">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <Icon name="Loader2" size={20} />
                  </motion.div>
                  Открываем кейс...
                </div>
              )}

              {phase === 'result' && (
                <div className="flex gap-2">
                  <button onClick={reset}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#1a3a1a] py-2.5 text-sm font-semibold text-neutral-300 hover:bg-white/5">
                    <Icon name="RotateCcw" size={15} />Открыть ещё
                  </button>
                  <button onClick={onClose}
                    className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-black hover:bg-emerald-400">
                    Готово
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
