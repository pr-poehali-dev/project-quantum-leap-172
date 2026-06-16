import { AnimatePresence, motion } from "framer-motion"
import Icon from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { products, rules } from "./shop-data"
import type { Product, CartItem } from "@/types"

const HERO_CHAR =
  "https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/bucket/c9bc29d5-607e-4f60-aca7-ff80bcb975a6.png"

const overlay = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}
const panel = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.92, y: 30 },
}

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      variants={overlay}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        variants={panel}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0a140f]/95 shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function CloseBtn({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-black/40 text-emerald-300 transition-colors hover:bg-emerald-500/20"
    >
      <Icon name="X" size={18} />
    </button>
  )
}

export function ShopModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: (p: Product) => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <Backdrop onClose={onClose}>
          <CloseBtn onClose={onClose} />
          <div className="border-b border-emerald-500/20 p-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Магазин привилегий</h2>
            <p className="mt-1 text-sm text-emerald-300/70">Выбери свой статус на сервере</p>
          </div>
          <div className="grid max-h-[60vh] grid-cols-1 gap-3 overflow-y-auto p-6 sm:grid-cols-2">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative flex flex-col rounded-xl border border-emerald-500/20 bg-black/30 p-4 transition-all hover:-translate-y-1 hover:border-emerald-400/60 hover:shadow-[0_0_25px_-8px_rgba(16,185,129,0.6)]"
              >
                {p.badge && (
                  <span className="absolute -top-2 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-black">
                    {p.badge}
                  </span>
                )}
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
                    style={{ background: `${p.color}22`, color: p.color }}
                  >
                    <Icon name={p.icon} size={22} />
                  </div>
                  <span className="font-display text-lg font-bold text-white">{p.name}</span>
                </div>
                <p className="mt-2 flex-1 text-sm text-neutral-400">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xl font-bold text-emerald-300">{p.price} ₽</span>
                  <Button
                    size="sm"
                    onClick={() => onAdd(p)}
                    className="bg-emerald-500 text-black hover:bg-emerald-400"
                  >
                    <Icon name="Plus" size={16} className="mr-1" />В корзину
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

export function CartModal({
  open,
  onClose,
  items,
  total,
  onRemove,
  onClear,
  onCheckout,
}: {
  open: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  onRemove: (id: string) => void
  onClear: () => void
  onCheckout: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <Backdrop onClose={onClose}>
          <CloseBtn onClose={onClose} />
          <div className="border-b border-emerald-500/20 p-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Корзина</h2>
          </div>
          <div className="max-h-[50vh] overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="py-12 text-center text-neutral-400">
                <Icon name="ShoppingCart" size={40} className="mx-auto mb-3 text-emerald-500/40" />
                Корзина пуста
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <motion.div
                    key={it.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-black/30 p-3"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ background: `${it.color}22`, color: it.color }}
                    >
                      <Icon name={it.icon} size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{it.name}</div>
                      <div className="text-sm text-neutral-400">
                        {it.qty} × {it.price} ₽
                      </div>
                    </div>
                    <span className="font-bold text-emerald-300">{it.qty * it.price} ₽</span>
                    <button
                      onClick={() => onRemove(it.id)}
                      className="text-neutral-500 transition-colors hover:text-red-400"
                    >
                      <Icon name="Trash2" size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t border-emerald-500/20 p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-neutral-400">Итого:</span>
                <span className="font-display text-2xl font-bold text-emerald-300">{total} ₽</span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClear}
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                >
                  Очистить
                </Button>
                <Button onClick={onCheckout} className="flex-1 bg-emerald-500 text-black hover:bg-emerald-400">
                  Оформить заказ
                </Button>
              </div>
            </div>
          )}
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

export function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <Backdrop onClose={onClose}>
          <CloseBtn onClose={onClose} />
          <div className="border-b border-emerald-500/20 p-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">Правила проекта</h2>
          </div>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto p-6">
            {rules.map((r, i) => (
              <motion.div
                key={r.num}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-emerald-500/20 bg-black/30 p-4"
              >
                <div className="font-display font-bold text-emerald-300">Правило №{r.num}</div>
                <p className="mt-1 text-white">{r.text}</p>
                <p className="mt-1 text-sm">
                  <span className="text-neutral-400">Наказание: </span>
                  <span className="font-semibold text-red-500">{r.punishment}</span>
                </p>
              </motion.div>
            ))}
          </div>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

export function WipModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlay}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            variants={panel}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", damping: 18, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0a140f]/95 p-6 text-center shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]"
          >
            <CloseBtn onClose={onClose} />
            <motion.img
              src={HERO_CHAR}
              alt="Minecraft"
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="mx-auto mb-4 h-28 w-28 rounded-xl object-cover"
            />
            <h3 className="font-display text-xl font-bold text-white">Упс!</h3>
            <p className="mt-2 text-neutral-400">
              Мы уже работаем над этим разделом и скоро всё исправим!
            </p>
            <Button onClick={onClose} className="mt-5 w-full bg-emerald-500 text-black hover:bg-emerald-400">
              Понятно
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}