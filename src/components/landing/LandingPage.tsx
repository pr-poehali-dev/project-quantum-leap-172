import { useState } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import Layout from './Layout'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { useCart } from './useCart'
import { products, SERVER_IP, SERVER_VERSION } from './shop-data'
import { ShopModal, CartModal, RulesModal, WipModal } from './ShopModals'

const HERO_IMG =
  'https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/bucket/c9bc29d5-607e-4f60-aca7-ff80bcb975a6.png'

const NAV = ['Главная', 'Донат', 'Привилегии', 'Правила', 'Корзина', 'Поддержка']

const ADVANTAGES = [
  { icon: 'Shield', title: 'Защита от гриферов', text: 'Приваты, логи и активные модераторы 24/7.' },
  { icon: 'Zap', title: 'Без лагов', text: 'Мощное железо и оптимизированные плагины.' },
  { icon: 'Users', title: 'Живое комьюнити', text: 'Дружное сообщество и регулярные ивенты.' },
  { icon: 'Gift', title: 'Награды за активность', text: 'Ежедневные бонусы, кейсы и квесты.' },
]

export default function LandingPage() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  const cart = useCart()

  const [shopOpen, setShopOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [wipOpen, setWipOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyIp = () => {
    navigator.clipboard?.writeText(SERVER_IP)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleNav = (item: string) => {
    if (item === 'Корзина') setCartOpen(true)
    else if (item === 'Правила') setRulesOpen(true)
    else if (item === 'Привилегии' || item === 'Донат') setShopOpen(true)
    else if (item === 'Поддержка') setWipOpen(true)
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-emerald-400 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-emerald-500/15 bg-[#04100a]/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <div className="flex items-center gap-2">
            <img src={HERO_IMG} alt="MCFIRE.BOX" className="h-9 w-9 rounded-lg object-cover" />
            <span className="font-display text-sm text-white">MCFIRE.BOX</span>
          </div>
          <nav className="hidden items-center gap-6 lg:flex">
            {NAV.map((item) => (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className="text-sm text-neutral-300 transition-colors hover:text-emerald-400"
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 text-emerald-300 transition-colors hover:bg-emerald-500/15 lg:hidden"
            >
              <Icon name="ShoppingCart" size={18} />
              {cart.count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-black">
                  {cart.count}
                </span>
              )}
            </button>
            <Button
              onClick={() => setShopOpen(true)}
              className="hidden bg-emerald-500 text-black hover:bg-emerald-400 sm:flex"
            >
              Начать покупку
            </Button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative hidden h-10 w-10 items-center justify-center rounded-lg border border-emerald-500/30 text-emerald-300 transition-colors hover:bg-emerald-500/15 lg:flex"
            >
              <Icon name="ShoppingCart" size={18} />
              {cart.count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-black">
                  {cart.count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="h-full overflow-y-auto">
        {/* Hero */}
        <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-24 text-center md:px-8">
          <motion.img
            src={HERO_IMG}
            alt="MCFIRE.BOX"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 h-44 w-44 rounded-full object-cover shadow-[0_0_80px_-5px_rgba(100,220,50,0.8)] md:h-56 md:w-56"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-sm text-emerald-300"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Сервер онлайн
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-2xl leading-relaxed text-white text-glow md:text-4xl lg:text-5xl"
          >
            MCFIRE.BOX
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-3 flex items-center justify-center gap-3"
          >
            <span className="rounded-full border border-[#84cc16]/40 bg-[#84cc16]/10 px-3 py-1 text-sm font-semibold text-[#84cc16]">BoxSMP</span>
            <span className="text-neutral-600">·</span>
            <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-300">Skyblock</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 max-w-2xl text-lg text-neutral-300 md:text-xl"
          >
            Лучший Minecraft-сервер с режимами BoxSMP и Skyblock — приваты, ивенты и дружное комьюнити.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              size="lg"
              onClick={() => setShopOpen(true)}
              className="bg-emerald-500 text-black shadow-[0_0_30px_-5px_rgba(16,185,129,0.7)] hover:bg-emerald-400"
            >
              <Icon name="ShoppingBag" size={20} className="mr-2" />
              Начать покупку
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={copyIp}
              className="border-emerald-500/40 bg-transparent text-emerald-300 hover:bg-emerald-500/15"
            >
              <Icon name={copied ? 'Check' : 'Copy'} size={18} className="mr-2" />
              {copied ? 'Скопировано!' : SERVER_IP}
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: 'Users', label: 'Игроков онлайн', value: '1 248' },
              { icon: 'Server', label: 'IP сервера', value: SERVER_IP },
              { icon: 'Boxes', label: 'Версия', value: SERVER_VERSION },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="rounded-2xl border border-emerald-500/20 bg-black/30 p-5 backdrop-blur-sm"
              >
                <Icon name={s.icon} size={22} className="mx-auto mb-2 text-emerald-400" />
                <div className="break-all font-bold text-white">{s.value}</div>
                <div className="text-sm text-neutral-400">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Advantages */}
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <h2 className="text-center font-display text-xl text-white md:text-2xl">Почему мы?</h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-emerald-500/20 bg-black/30 p-6 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-emerald-400/50 hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.5)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 transition-transform group-hover:scale-110">
                  <Icon name={a.icon} size={24} />
                </div>
                <h3 className="font-bold text-white">{a.title}</h3>
                <p className="mt-2 text-sm text-neutral-400">{a.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Privileges preview */}
        <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <h2 className="text-center font-display text-xl text-white md:text-2xl">Привилегии</h2>
          <p className="mt-3 text-center text-neutral-400">Выбери статус и получи крутые возможности</p>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 6).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-black/40 p-6 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-emerald-400/60 hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.6)]"
              >
                {p.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-black">
                    {p.badge}
                  </span>
                )}
                <div
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: `${p.color}22`, color: p.color }}
                >
                  <Icon name={p.icon} size={28} />
                </div>
                <h3 className="font-display text-lg text-white">{p.name}</h3>
                <p className="mt-2 text-sm text-neutral-400">{p.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-300">{p.price} ₽</span>
                  <Button
                    size="sm"
                    onClick={() => cart.add(p)}
                    className="bg-emerald-500 text-black hover:bg-emerald-400"
                  >
                    <Icon name="Plus" size={16} className="mr-1" />Купить
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button
              size="lg"
              onClick={() => setShopOpen(true)}
              variant="outline"
              className="border-emerald-500/40 bg-transparent text-emerald-300 hover:bg-emerald-500/15"
            >
              Открыть весь магазин
            </Button>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-10 backdrop-blur-sm">
            <h2 className="font-display text-xl text-white text-glow md:text-2xl">Готов начать приключение?</h2>
            <p className="mt-4 text-neutral-300">Подключайся к серверу прямо сейчас и стань частью EmeraldCraft.</p>
            <Button
              size="lg"
              onClick={copyIp}
              className="mt-6 bg-emerald-500 text-black hover:bg-emerald-400"
            >
              <Icon name={copied ? 'Check' : 'Copy'} size={18} className="mr-2" />
              {copied ? 'IP скопирован!' : `Скопировать IP: ${SERVER_IP}`}
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-emerald-500/15 bg-black/40 px-4 py-12 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <div className="flex items-center gap-2">
                <img src={HERO_IMG} alt="MCFIRE.BOX" className="h-9 w-9 rounded-lg object-cover" />
                <span className="font-display text-sm text-white">MCFIRE.BOX</span>
              </div>
              <div className="flex gap-3">
                {[
                  { icon: 'MessageCircle', label: 'Discord' },
                  { icon: 'Send', label: 'Telegram' },
                  { icon: 'Users', label: 'VK' },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setWipOpen(true)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/25 text-emerald-300 transition-colors hover:bg-emerald-500/15"
                    title={s.label}
                  >
                    <Icon name={s.icon} size={20} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-emerald-500/10 pt-6 text-sm text-neutral-500 md:flex-row">
              <span>© 2026 MCFIRE.BOX. Все права защищены.</span>
              <div className="flex gap-4">
                <button onClick={() => setWipOpen(true)} className="transition-colors hover:text-emerald-400">
                  Правила оплаты
                </button>
                <button onClick={() => setRulesOpen(true)} className="transition-colors hover:text-emerald-400">
                  Правила проекта
                </button>
                <button onClick={() => setWipOpen(true)} className="transition-colors hover:text-emerald-400">
                  Документы
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <ShopModal open={shopOpen} onClose={() => setShopOpen(false)} onAdd={cart.add} />
      <CartModal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart.items}
        total={cart.total}
        onRemove={cart.remove}
        onClear={cart.clear}
        onCheckout={() => {
          setCartOpen(false)
          setWipOpen(true)
        }}
      />
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
      <WipModal open={wipOpen} onClose={() => setWipOpen(false)} />
    </Layout>
  )
}