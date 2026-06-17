import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { useCart } from './useCart'
import { ShopModal, CartModal } from './ShopModals'
import { AuthModal } from './AuthModal'
import { ProfileModal } from './ProfileModal'
import { NewsModal } from './NewsModal'
import { AdminModal } from './AdminModal'
import { RulesModalNew } from './RulesModalNew'
import { DonateModal, type DonateSection } from './DonateModal'
import { PunishmentsModal } from './PunishmentsModal'
import { StaffPanel } from './StaffPanel'
import { HeroSlideshow } from './HeroSlideshow'
import { DonateCarousel, type SectionKey } from './DonateCarousel'
import { BattlePassModal } from './BattlePassModal'
import { MobileNav } from './MobileNav'
import { useAuth } from '@/hooks/useAuth'
import { useComplaints } from '@/hooks/useComplaints'
import { settingsApi, parseJSON, type SiteSettings, type Product } from '@/lib/api'
import { isStaff } from '@/lib/permissions'

const LOGO_IMG = 'https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/bucket/c9bc29d5-607e-4f60-aca7-ff80bcb975a6.png'
const HERO_CHAR = 'https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/files/367989cc-e289-4e27-996f-13dd62749b4a.jpg'

const FEATURES = [
  { icon: 'Package',     label: 'Уникальные киты',        sub: 'Большой выбор наборов' },
  { icon: 'Sword',       label: 'Кастомные данжи',        sub: 'Сражайся и получай награды' },
  { icon: 'Trophy',      label: 'Ивенты и конкурсы',      sub: 'Постоянные ивенты с наградами' },
  { icon: 'ShieldCheck', label: 'Активная администрация', sub: 'Мы следим за порядком 24/7' },
  { icon: 'Coins',       label: 'Экономика',              sub: 'Стабильная и честная экономика' },
]

const ROLE_COLORS: Record<string, string> = {
  player: '#9ca3af', helper: '#34d399', moderator: '#60a5fa',
  admin: '#f97316', creator: '#fbbf24',
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d = 0) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 0.45 } }),
}

const DEFAULT_SETTINGS: SiteSettings = {
  site_title: 'MCFIRE.BOX', hero_bg_color: '#071a0d', accent_color: '#4ade80',
  server_ip: 'mcfire.box', server_version: '1.20.4', online_count: '1257',
  discord_url: '', telegram_url: '', vk_url: '',
  logo_url: LOGO_IMG, bg_image_url: '', slideshow_interval: '12',
  slideshow_images: '[]', privileges_json: '[]', coins_json: '[]',
  cases_json: '[]', battlepass_json: '{"price":569,"levels":[]}', menu_buttons_json: '[]',
}

export default function LandingPage() {
  const cart = useCart()
  const { user, login, register, logout } = useAuth()
  const newComplaints = useComplaints(user)

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [shopOpen,    setShopOpen]    = useState(false)
  const [cartOpen,    setCartOpen]    = useState(false)
  const [rulesOpen,   setRulesOpen]   = useState(false)
  const [authOpen,    setAuthOpen]    = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [newsOpen,    setNewsOpen]    = useState(false)
  const [adminOpen,   setAdminOpen]   = useState(false)
  const [donateOpen,  setDonateOpen]  = useState(false)
  const [punishOpen,  setPunishOpen]  = useState(false)
  const [staffOpen,   setStaffOpen]   = useState(false)
  const [bpOpen,         setBpOpen]         = useState(false)
  const [donateSection,  setDonateSection]  = useState<SectionKey | null>(null)
  const [copied,         setCopied]         = useState(false)
  const [addedId,        setAddedId]        = useState<string | null>(null)

  const handleDonateGo = (s: DonateSection) => {
    setDonateOpen(false)
    if (s === 'unban')      { setPunishOpen(true); return }
    if (s === 'battlepass') { setBpOpen(true); return }
    // переключаем карусель на нужный раздел и скроллим к ней
    setDonateSection(s as SectionKey)
    setTimeout(() => {
      document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  const buyToCart = (p: Product) => {
    cart.add(p)
    setAddedId(p.id)
    setTimeout(() => setAddedId(null), 1200)
  }

  useEffect(() => {
    settingsApi.get().then(setSiteSettings).catch(() => {})
  }, [])

  const copyIp = () => {
    navigator.clipboard?.writeText(siteSettings.server_ip)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const openSocial = (url: string) => {
    if (url) window.open(url, '_blank')
  }

  const isAdmin = user?.role === 'creator' || user?.role === 'admin'

  return (
    <div className="min-h-screen bg-[#050f07] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-[#1a3a1a] bg-[#07130a]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-2.5 md:px-8">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex shrink-0 items-center gap-2">
            <img src={LOGO_IMG} alt="MCFIRE.BOX" className="h-9 w-9 rounded-lg object-cover" />
            <span className="hidden font-display text-sm font-bold text-white sm:block">{siteSettings.site_title}</span>
          </button>

          {/* Nav */}
          <nav className="hidden items-center gap-1 lg:flex">
            {[
              { label: 'Главная',    icon: 'Home',       onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
              { label: 'Новости',    icon: 'Newspaper',  onClick: () => setNewsOpen(true) },
              { label: 'Донат',      icon: 'Gift',       onClick: () => setDonateOpen(true) },
              { label: 'Наказания',  icon: 'Gavel',      onClick: () => setPunishOpen(true) },
              { label: 'Правила',    icon: 'ScrollText', onClick: () => setRulesOpen(true) },
              { label: 'Тикеты',     icon: 'Ticket',     onClick: () => window.open('https://t.me/', '_blank') },
            ].map(n => (
              <button key={n.label} onClick={n.onClick}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
              >
                <Icon name={n.icon} size={14} />{n.label}
              </button>
            ))}
            {isStaff(user?.role) && (
              <button onClick={() => setStaffOpen(true)}
                className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-sky-400 transition-colors hover:bg-sky-500/10"
              >
                <Icon name="ShieldHalf" size={14} />Персонал
                {newComplaints > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {newComplaints}
                  </span>
                )}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => setAdminOpen(true)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-amber-400 transition-colors hover:bg-amber-500/10"
              >
                <Icon name="Settings" size={14} />Панель
              </button>
            )}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              <Icon name="ShoppingCart" size={17} />
              <span className="hidden sm:inline">Корзина</span>
              {cart.count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-xs font-bold text-black">
                  {cart.count}
                </span>
              )}
            </button>

            {/* Profile / Login */}
            {user ? (
              <button onClick={() => setProfileOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2 text-sm transition-colors hover:bg-emerald-500/10"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="hidden max-w-20 truncate text-white sm:block">{user.username}</span>
                {user.role !== 'player' && (
                  <span className="hidden text-xs font-bold sm:block" style={{ color: ROLE_COLORS[user.role] }}>
                    {user.role === 'creator' ? '★' : user.role === 'admin' ? '⚡' : user.role === 'moderator' ? '🛡' : '?'}
                  </span>
                )}
              </button>
            ) : (
              <button onClick={() => setAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-black/30 px-3 py-2 text-sm text-neutral-300 transition-colors hover:bg-emerald-500/10 hover:text-white"
              >
                <Icon name="LogIn" size={16} />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-4 md:px-8">

        {/* ── HERO BANNER ── */}
        <motion.section initial="hidden" animate="visible"
          className="relative mt-5 overflow-hidden rounded-2xl border border-[#1a3a1a]"
          style={{ background: `linear-gradient(135deg, ${siteSettings.hero_bg_color}, #0a2010, #051208)`, minHeight: 380 }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[35%] top-[-60px] h-[340px] w-[340px] rounded-full bg-emerald-500/10 blur-[80px]" />
            <div className="absolute right-[10%] top-[20%] h-[200px] w-[200px] rounded-full bg-emerald-400/8 blur-[60px]" />
          </div>

          <div className="relative flex flex-col items-center md:flex-row">
            <motion.div variants={fadeUp} custom={0.1} className="relative z-10 flex-shrink-0 md:w-[42%]">
              <HeroSlideshow
                images={parseJSON<string[]>(siteSettings.slideshow_images, [])}
                intervalSec={parseInt(siteSettings.slideshow_interval) || 12}
                fallback={HERO_CHAR}
              />
            </motion.div>

            <div className="relative z-10 flex min-w-0 flex-1 flex-col items-center px-6 py-10 text-center md:items-start md:py-16 md:text-left">
              <motion.h1 variants={fadeUp} custom={0.15}
                className="w-full font-display text-2xl leading-tight drop-shadow-[0_0_24px_rgba(74,222,128,0.4)] sm:text-3xl md:text-4xl lg:text-5xl"
              >
                <span className="relative inline-block max-w-full overflow-hidden whitespace-nowrap">
                  <span className="text-white">MCFIRE</span>
                  <span className="text-emerald-400">.BOX</span>
                  <span className="shine-sweep pointer-events-none absolute inset-0" />
                </span>
              </motion.h1>
              <motion.div variants={fadeUp} custom={0.2} className="mt-3 flex gap-2">
                <span className="rounded-full border border-[#84cc16]/40 bg-[#84cc16]/10 px-3 py-1 text-sm font-semibold text-[#84cc16]">BoxSMP</span>
                <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-300">Skyblock</span>
              </motion.div>
              <motion.p variants={fadeUp} custom={0.25} className="mt-4 max-w-sm text-base text-neutral-300 md:text-lg">
                Лучший Minecraft-сервер с режимами BoxSMP и Skyblock — с уникальными возможностями!
              </motion.p>
              <motion.div variants={fadeUp} custom={0.3} className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <button onClick={() => setDonateOpen(true)}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-bold text-black shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] active:scale-95"
                >
                  <Icon name="Play" size={18} />Начать покупку<Icon name="ChevronRight" size={16} />
                </button>
                <button onClick={() => setNewsOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-transparent px-6 py-3 font-bold text-emerald-300 transition-all hover:bg-emerald-500/10 active:scale-95"
                >
                  <Icon name="Newspaper" size={18} />Новости
                </button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ── STATS ── */}
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: 'Users',       label: 'Онлайн',     value: siteSettings.online_count, sub: 'игроков' },
            { icon: 'Globe',       label: 'IP сервера',  value: siteSettings.server_ip,    sub: 'Нажми для копирования', click: copyIp, highlight: copied },
            { icon: 'Gamepad2',    label: 'Версия',      value: siteSettings.server_version, sub: 'Java Edition' },
            { icon: 'ShieldCheck', label: 'Защита',      value: 'Защищён',                 sub: 'От читеров и дюпов' },
          ].map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              onClick={s.click}
              className={`flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl border bg-[#07130a] p-3 transition-all hover:border-emerald-500/50 hover:bg-[#0a1d0d] md:gap-4 md:p-4 ${s.highlight ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-[#1a3a1a]'}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 md:h-12 md:w-12">
                <Icon name={s.icon} size={20} className="text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-neutral-400">{s.label}</div>
                <div className="truncate text-sm font-bold text-white md:text-base">{s.highlight ? 'Скопировано!' : s.value}</div>
                <div className="truncate text-xs text-neutral-500">{s.sub}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── ДОНАТ: разделы со стрелками и волной ── */}
        <div id="donate-section" className="scroll-mt-20">
          <DonateCarousel
            settings={siteSettings}
            onBuy={buyToCart}
            onOpenBattlePass={() => setBpOpen(true)}
            addedId={addedId}
            activeSection={donateSection}
            onSectionChange={k => setDonateSection(k)}
          />
        </div>

        {/* ── FEATURES ── */}
        <section className="mt-10 mb-12">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {FEATURES.map((f, i) => (
              <motion.div key={f.label}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3 overflow-hidden rounded-xl border border-[#1a3a1a] bg-[#07130a] p-4 transition-all hover:border-emerald-500/30 hover:bg-[#0a1d0d]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Icon name={f.icon} size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-emerald-300">{f.label}</div>
                  <div className="truncate text-xs text-neutral-500">{f.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#1a3a1a] bg-[#040c06] px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <img src={LOGO_IMG} alt="MCFIRE.BOX" className="h-8 w-8 rounded-lg object-cover" />
                <span className="font-display text-sm text-white">{siteSettings.site_title}</span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">© 2026 MCFIRE.BOX. Все права защищены.</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
              <button onClick={() => setRulesOpen(true)}  className="transition-colors hover:text-emerald-400">Правила проекта</button>
              <button onClick={() => setNewsOpen(true)}   className="transition-colors hover:text-emerald-400">Новости</button>
              <button onClick={() => setDonateOpen(true)} className="transition-colors hover:text-emerald-400">Донат</button>
              <button onClick={() => setPunishOpen(true)} className="transition-colors hover:text-emerald-400">Наказания</button>
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-xs text-neutral-500">Мы в<br />соцсетях</span>
              {[
                { icon: 'MessageCircle', key: 'discord_url' },
                { icon: 'Send',          key: 'telegram_url' },
                { icon: 'Users',         key: 'vk_url' },
              ].map(s => (
                <button key={s.key}
                  onClick={() => openSocial((siteSettings as Record<string, string>)[s.key])}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1a3a1a] bg-[#07130a] text-emerald-400 transition-colors hover:border-emerald-500/40 hover:bg-emerald-500/10"
                >
                  <Icon name={s.icon} size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── ВСЕ МОДАЛЬНЫЕ ОКНА ── */}
      <ShopModal  open={shopOpen}  onClose={() => setShopOpen(false)}  onAdd={cart.add} />
      <CartModal
        open={cartOpen} onClose={() => setCartOpen(false)}
        items={cart.items} total={cart.total}
        onRemove={cart.remove} onClear={cart.clear}
        onCheckout={() => { setCartOpen(false); setShopOpen(true) }}
      />
      <RulesModalNew open={rulesOpen}  onClose={() => setRulesOpen(false)} />
      <DonateModal   open={donateOpen} onClose={() => setDonateOpen(false)} onGo={handleDonateGo} />
      <PunishmentsModal open={punishOpen} onClose={() => setPunishOpen(false)} user={user} />
      <BattlePassModal open={bpOpen} onClose={() => setBpOpen(false)} settings={siteSettings} user={user} onBuy={buyToCart} />
      <AuthModal   open={authOpen}    onClose={() => setAuthOpen(false)}   onLogin={login} onRegister={register} />
      <NewsModal   open={newsOpen}    onClose={() => setNewsOpen(false)}   user={user} />
      {user && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
          onLogout={() => { logout(); setProfileOpen(false) }}
          onOpenStaff={() => { setProfileOpen(false); setStaffOpen(true) }}
          onOpenAdmin={() => { setProfileOpen(false); setAdminOpen(true) }}
          onOpenPunishments={() => { setProfileOpen(false); setPunishOpen(true) }}
        />
      )}
      {user && isStaff(user.role) && <StaffPanel open={staffOpen} onClose={() => setStaffOpen(false)} user={user} />}
      {user && isAdmin && <AdminModal open={adminOpen} onClose={() => setAdminOpen(false)} currentUser={user} />}

      {/* ── МОБИЛЬНОЕ МЕНЮ ── */}
      <MobileNav
        user={user}
        cartCount={cart.count}
        newComplaints={newComplaints}
        onHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onDonate={() => setDonateOpen(true)}
        onNews={() => setNewsOpen(true)}
        onRules={() => setRulesOpen(true)}
        onPunish={() => setPunishOpen(true)}
        onTickets={() => window.open('https://t.me/', '_blank')}
        onCart={() => setCartOpen(true)}
        onProfile={() => setProfileOpen(true)}
        onLogin={() => setAuthOpen(true)}
        onStaff={() => setStaffOpen(true)}
        onAdmin={() => setAdminOpen(true)}
      />

      {/* ── ADD TO CART TOAST ── */}
      <AnimatePresence>
        {addedId && (
          <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-[#07130a] px-5 py-3 text-sm font-semibold text-emerald-400 shadow-lg lg:bottom-6"
          >
            ✓ Добавлено в корзину
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}