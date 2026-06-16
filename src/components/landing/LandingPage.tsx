import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { useCart } from './useCart'
import { products, SERVER_IP, SERVER_VERSION } from './shop-data'
import { ShopModal, CartModal, RulesModal, WipModal } from './ShopModals'

const LOGO_IMG = 'https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/bucket/c9bc29d5-607e-4f60-aca7-ff80bcb975a6.png'
const HERO_CHAR = 'https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/files/367989cc-e289-4e27-996f-13dd62749b4a.jpg'

const NAV_ITEMS = [
  { label: 'Главная', icon: 'Home', action: 'home' },
  { label: 'Донат', icon: 'Gift', action: 'shop' },
  { label: 'Привилегии', icon: 'Crown', action: 'shop' },
  { label: 'Правила', icon: 'ScrollText', action: 'rules' },
  { label: 'Статистика', icon: 'BarChart2', action: 'wip' },
  { label: 'Поддержка', icon: 'HeadphonesIcon', action: 'wip' },
]

const PRIVILEGE_RANKS = [
  { id: 'vip',     name: 'VIP',     color: '#4ade80', price: 149,  desc: 'Доступ к базовым возможностям /kit vip, префикс',            crownColor: '#4ade80' },
  { id: 'premium', name: 'PREMIUM', color: '#22d3ee', price: 299,  desc: 'Увеличенные лимиты /kit premium, префикс и многое другое',   crownColor: '#22d3ee' },
  { id: 'elite',   name: 'ELITE',   color: '#a78bfa', price: 499,  desc: 'Отличные возможности /kit elite, префикс, эффекты и другое', crownColor: '#a78bfa' },
  { id: 'legend',  name: 'LEGEND',  color: '#fbbf24', price: 999,  desc: 'Максимум возможностей /kit legend, префикс, полёт и другое', crownColor: '#fbbf24' },
  { id: 'dragon',  name: 'DRAGON',  color: '#f87171', price: 1999, desc: 'Только для настоящих легенд /kit dragon, префикс, частички', crownColor: '#f87171' },
]

const FEATURES = [
  { icon: 'Package',     label: 'Уникальные киты',         sub: 'Большой выбор наборов' },
  { icon: 'Sword',       label: 'Кастомные данжи',         sub: 'Сражайся и получай награды' },
  { icon: 'Trophy',      label: 'Ивенты и конкурсы',       sub: 'Постоянные ивенты с наградами' },
  { icon: 'ShieldCheck', label: 'Активная администрация',  sub: 'Мы следим за порядком 24/7' },
  { icon: 'Coins',       label: 'Экономика',               sub: 'Стабильная и честная экономика' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 0.45 } }),
}

export default function LandingPage() {
  const cart = useCart()
  const [shopOpen,  setShopOpen]  = useState(false)
  const [cartOpen,  setCartOpen]  = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [wipOpen,   setWipOpen]   = useState(false)
  const [copied,    setCopied]    = useState(false)
  const [addedId,   setAddedId]   = useState<string | null>(null)

  const copyIp = () => {
    navigator.clipboard?.writeText(SERVER_IP)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const addToCart = (p: typeof products[0]) => {
    cart.add(p)
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  const handleNav = (action: string) => {
    if (action === 'shop')  setShopOpen(true)
    if (action === 'rules') setRulesOpen(true)
    if (action === 'wip')   setWipOpen(true)
    if (action === 'home')  window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#050f07] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-[#1a3a1a] bg-[#07130a]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 md:px-6">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex shrink-0 items-center gap-2">
            <img src={LOGO_IMG} alt="MCFIRE.BOX" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-sm font-bold text-white">MCFIRE.BOX</span>
          </button>

          {/* Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((n) => (
              <button
                key={n.label}
                onClick={() => handleNav(n.action)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                <Icon name={n.icon} size={14} />
                {n.label}
              </button>
            ))}
          </nav>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <Icon name="ShoppingCart" size={18} />
            <span className="hidden sm:inline">Корзина</span>
            {cart.count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-black">
                {cart.count}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-0 md:px-6">

        {/* ── HERO BANNER ── */}
        <motion.section
          initial="hidden" animate="visible"
          className="relative mt-5 overflow-hidden rounded-2xl border border-[#1a3a1a] bg-gradient-to-br from-[#071a0d] via-[#0a2010] to-[#051208]"
          style={{ minHeight: 380 }}
        >
          {/* glow bg */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[35%] top-[-60px] h-[340px] w-[340px] rounded-full bg-emerald-500/10 blur-[80px]" />
            <div className="absolute right-[10%] top-[20%] h-[200px] w-[200px] rounded-full bg-emerald-400/8 blur-[60px]" />
          </div>

          <div className="relative flex flex-col items-center md:flex-row">
            {/* Character image */}
            <motion.div
              variants={fadeUp} custom={0.1}
              className="relative z-10 flex-shrink-0 md:w-[42%]"
            >
              <img
                src={HERO_CHAR}
                alt="Minecraft character"
                className="h-72 w-full object-cover object-center md:h-[420px]"
                style={{ maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }}
              />
            </motion.div>

            {/* Text */}
            <div className="relative z-10 flex flex-1 flex-col items-center px-6 py-10 text-center md:items-start md:py-16 md:text-left">
              <motion.h1 variants={fadeUp} custom={0.15}
                className="font-display text-4xl leading-tight text-white drop-shadow-[0_0_30px_rgba(74,222,128,0.4)] md:text-6xl lg:text-7xl"
              >
                <span className="text-white">MCFIRE</span>
                <br />
                <span className="text-emerald-400">.BOX</span>
              </motion.h1>
              <motion.div variants={fadeUp} custom={0.2} className="mt-3 flex gap-2">
                <span className="rounded-full border border-[#84cc16]/40 bg-[#84cc16]/10 px-3 py-1 text-sm font-semibold text-[#84cc16]">BoxSMP</span>
                <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-300">Skyblock</span>
              </motion.div>
              <motion.p variants={fadeUp} custom={0.25} className="mt-4 max-w-sm text-base text-neutral-300 md:text-lg">
                Лучший Minecraft-сервер с режимами BoxSMP и Skyblock — с уникальными возможностями!
              </motion.p>
              <motion.div variants={fadeUp} custom={0.3} className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <button
                  onClick={() => setShopOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] active:scale-95"
                >
                  <Icon name="Play" size={18} />
                  Начать покупку
                  <Icon name="ChevronRight" size={16} />
                </button>
                <button
                  onClick={() => setWipOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-transparent px-6 py-3 font-bold text-emerald-300 transition-all hover:bg-emerald-500/10 active:scale-95"
                >
                  <Icon name="Info" size={18} />
                  Подробнее
                  <Icon name="Info" size={16} />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── STATS ── */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: 'Users',      label: 'Онлайн',     value: '1 257', sub: 'игроков' },
            { icon: 'Globe',      label: 'IP сервера',  value: SERVER_IP, sub: 'Нажми для копирования', click: copyIp, highlight: copied },
            { icon: 'Gamepad2',   label: 'Версия',      value: SERVER_VERSION, sub: 'Java Edition' },
            { icon: 'ShieldCheck',label: 'Защита',      value: 'Защищён', sub: 'От читеров и дюпов' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              onClick={s.click}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border bg-[#07130a] p-4 transition-all hover:border-emerald-500/50 hover:bg-[#0a1d0d] ${s.highlight ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-[#1a3a1a]'}`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                <Icon name={s.icon} size={22} className="text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-neutral-400">{s.label}</div>
                <div className="mt-0.5 truncate text-lg font-bold text-white">{s.highlight ? 'Скопировано!' : s.value}</div>
                <div className="text-xs text-neutral-500">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── PRIVILEGES ── */}
        <section className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 flex items-center justify-center gap-4"
          >
            <span className="text-emerald-400">◆</span>
            <h2 className="font-display text-2xl font-bold tracking-widest text-white md:text-3xl">ПРИВИЛЕГИИ</h2>
            <span className="text-emerald-400">◆</span>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {PRIVILEGE_RANKS.map((r, i) => {
              const prod = products.find(p => p.id === r.id) ?? products[i]
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="group flex flex-col items-center rounded-2xl border border-[#1a3a1a] bg-[#07130a] p-5 text-center transition-all hover:-translate-y-2 hover:border-emerald-500/40 hover:shadow-[0_8px_40px_-8px_rgba(74,222,128,0.3)]"
                >
                  {/* Crown emoji per rank */}
                  <div className="mb-3 text-5xl transition-transform group-hover:scale-110">
                    {i === 0 ? '👑' : i === 1 ? '👑' : i === 2 ? '👑' : i === 3 ? '👑' : '🐉'}
                  </div>
                  <div className="font-display text-lg font-bold" style={{ color: r.color, textShadow: `0 0 12px ${r.color}66` }}>
                    {r.name}
                  </div>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-400">{r.desc}</p>
                  <div className="mt-4 text-2xl font-bold text-white">{r.price} ₽</div>
                  <button
                    onClick={() => addToCart(prod)}
                    className="mt-3 w-full rounded-xl py-2.5 text-sm font-bold text-black transition-all active:scale-95"
                    style={{
                      background: addedId === r.id ? '#22c55e' : `linear-gradient(135deg, ${r.color}, ${r.color}bb)`,
                      boxShadow: `0 4px 16px -4px ${r.color}66`,
                    }}
                  >
                    {addedId === r.id ? '✓ Добавлено' : 'Купить'}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="mt-10 mb-12">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 rounded-xl border border-[#1a3a1a] bg-[#07130a] p-4 transition-all hover:border-emerald-500/30 hover:bg-[#0a1d0d]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Icon name={f.icon} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-emerald-300 truncate">{f.label}</div>
                  <div className="text-xs text-neutral-500 truncate">{f.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1a3a1a] bg-[#040c06] px-4 py-8 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Logo + copy */}
            <div>
              <div className="flex items-center gap-2">
                <img src={LOGO_IMG} alt="MCFIRE.BOX" className="h-8 w-8 rounded-lg object-cover" />
                <span className="font-display text-sm text-white">MCFIRE.BOX</span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">© 2026 MCFIRE.BOX. Все права защищены.</p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
              <button onClick={() => setRulesOpen(true)} className="transition-colors hover:text-emerald-400">Правила проекта</button>
              <button onClick={() => setWipOpen(true)}   className="transition-colors hover:text-emerald-400">Политика конфиденциальности</button>
              <button onClick={() => setWipOpen(true)}   className="transition-colors hover:text-emerald-400">Договор оферты</button>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs text-neutral-500">Мы в<br />соцсетях</span>
              {[
                { icon: 'MessageCircle', label: 'Discord' },
                { icon: 'Send',          label: 'Telegram' },
                { icon: 'Users',         label: 'VK' },
                { icon: 'Youtube',       label: 'YouTube' },
              ].map((s) => (
                <button
                  key={s.label}
                  onClick={() => setWipOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1a3a1a] bg-[#07130a] text-emerald-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10"
                  title={s.label}
                >
                  <Icon name={s.icon} size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      <ShopModal  open={shopOpen}  onClose={() => setShopOpen(false)}  onAdd={cart.add} />
      <CartModal
        open={cartOpen} onClose={() => setCartOpen(false)}
        items={cart.items} total={cart.total}
        onRemove={cart.remove} onClear={cart.clear}
        onCheckout={() => { setCartOpen(false); setWipOpen(true) }}
      />
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <WipModal   open={wipOpen}   onClose={() => setWipOpen(false)} />

      {/* ── ADD TO CART TOAST ── */}
      <AnimatePresence>
        {addedId && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{   opacity: 0, y: 20,  scale: 0.9 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-[#07130a] px-5 py-3 text-sm font-semibold text-emerald-400 shadow-lg"
          >
            ✓ Добавлено в корзину
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
