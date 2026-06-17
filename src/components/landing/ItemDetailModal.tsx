import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'
import type { Product } from '@/types'

export interface ItemDetail {
  id: string
  name: string
  desc: string
  price: number
  color: string
  image?: string
  emoji?: string
  features?: string[]
  badge?: string
  chance?: string        // для кейсов
  extraLabel?: string    // «Привилегия», «Коины», «Кейс» и т.д.
}

interface Props {
  item: ItemDetail | null
  onClose: () => void
  onBuy: (p: Product) => void
  addedId: string | null
}

export function ItemDetailModal({ item, onClose, onBuy, addedId }: Props) {
  if (!item) return null
  const added = addedId === item.id

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center"
          style={{ padding: '1rem' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border bg-[#07130a] shadow-2xl"
            style={{ borderColor: `${item.color}44` }}
          >
            {/* Цветной градиент сверху */}
            <div
              className="h-2 w-full"
              style={{ background: `linear-gradient(90deg, ${item.color}, ${item.color}88)` }}
            />

            {/* Кнопка закрыть */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-neutral-400 hover:text-white"
            >
              <Icon name="X" size={15} />
            </button>

            <div className="p-5">
              {/* Шапка: картинка + название */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
                  style={{ borderColor: `${item.color}33`, background: `${item.color}15` }}
                >
                  {item.image
                    ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    : <span className="text-3xl">{item.emoji || '🎁'}</span>}
                </div>
                <div className="min-w-0">
                  {item.extraLabel && (
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: item.color }}>
                      {item.extraLabel}
                    </div>
                  )}
                  <h3 className="truncate text-lg font-bold text-white">{item.name}</h3>
                  {item.badge && (
                    <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-black"
                      style={{ background: item.color }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Описание */}
              <p className="mt-4 text-sm leading-relaxed text-neutral-300">{item.desc}</p>

              {/* Шанс (для кейсов) */}
              {item.chance && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2">
                  <Icon name="Dices" size={15} className="text-sky-400" />
                  <span className="text-sm text-sky-300">Шанс выпадения: <strong>{item.chance}</strong></span>
                </div>
              )}

              {/* Что входит / фичи */}
              {item.features && item.features.length > 0 && (
                <div className="mt-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">Что входит</div>
                  <ul className="space-y-1.5">
                    {item.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-neutral-200">
                        <Icon name="Check" size={14} className="mt-0.5 shrink-0" style={{ color: item.color }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Цена + кнопка */}
              <div className="mt-5 flex items-center gap-3">
                <div className="text-2xl font-bold text-white">{item.price} ₽</div>
                <button
                  onClick={() => onBuy({
                    id: item.id,
                    name: item.name,
                    description: item.desc,
                    price: item.price,
                    icon: 'Gift',
                    color: item.color,
                  })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-black transition-all active:scale-95"
                  style={{
                    background: added ? '#22c55e' : `linear-gradient(135deg, ${item.color}, ${item.color}bb)`,
                    boxShadow: `0 4px 16px -4px ${item.color}66`,
                  }}
                >
                  <Icon name={added ? 'Check' : 'ShoppingCart'} size={16} />
                  {added ? 'Добавлено!' : 'В корзину'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
