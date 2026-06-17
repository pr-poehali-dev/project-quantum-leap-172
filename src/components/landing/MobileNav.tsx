import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import type { User } from '@/lib/api'
import { isStaff } from '@/lib/permissions'

interface NavAction {
  label: string
  icon: string
  onClick: () => void
  color?: string
  badge?: number
}

interface Props {
  user: User | null
  cartCount: number
  newComplaints: number
  onHome: () => void
  onDonate: () => void
  onNews: () => void
  onRules: () => void
  onPunish: () => void
  onTickets: () => void
  onCart: () => void
  onProfile: () => void
  onLogin: () => void
  onStaff: () => void
  onAdmin: () => void
}

export function MobileNav({
  user, cartCount, newComplaints,
  onHome, onDonate, onNews, onRules, onPunish, onTickets,
  onCart, onProfile, onLogin, onStaff, onAdmin,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)

  const isAdmin = user?.role === 'creator' || user?.role === 'admin'

  // основные 4 кнопки нижней панели
  const mainItems: NavAction[] = [
    { label: 'Главная', icon: 'Home', onClick: onHome },
    { label: 'Донат', icon: 'Gift', onClick: onDonate },
    { label: 'Новости', icon: 'Newspaper', onClick: onNews },
    { label: 'Ещё', icon: 'Menu', onClick: () => setMenuOpen(true) },
  ]

  // пункты в выезжающем «ещё» меню
  const moreItems: NavAction[] = [
    { label: 'Наказания', icon: 'Gavel', onClick: onPunish },
    { label: 'Правила', icon: 'ScrollText', onClick: onRules },
    { label: 'Тикеты', icon: 'Ticket', onClick: onTickets },
    ...(isStaff(user?.role) ? [{ label: 'Персонал', icon: 'ShieldHalf', onClick: onStaff, color: '#60a5fa', badge: newComplaints }] : []),
    ...(isAdmin ? [{ label: 'Панель', icon: 'Settings', onClick: onAdmin, color: '#fbbf24' }] : []),
  ]

  const close = () => setMenuOpen(false)
  const run = (fn: () => void) => { fn(); close() }

  return (
    <>
      {/* нижняя панель — только на мобильных */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#1a3a1a] bg-[#07130a]/95 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-around px-2 py-1.5">
          {mainItems.map(item => (
            <button key={item.label}
              onClick={item.label === 'Ещё' ? item.onClick : () => { item.onClick(); close() }}
              className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-neutral-400 transition-colors hover:text-emerald-400 active:scale-95"
            >
              <Icon name={item.icon} size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
          {/* кнопка профиля / войти */}
          <button
            onClick={user ? onProfile : onLogin}
            className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-neutral-400 transition-colors hover:text-emerald-400 active:scale-95"
          >
            {user ? (
              <>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/30 text-[10px] font-bold text-emerald-400">
                  {user.username[0].toUpperCase()}
                </div>
                <span className="text-[10px] font-medium">Профиль</span>
              </>
            ) : (
              <>
                <Icon name="LogIn" size={20} />
                <span className="text-[10px] font-medium">Войти</span>
              </>
            )}
            {/* бейдж жалоб для стаффа */}
            {isStaff(user?.role) && newComplaints > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                {newComplaints}
              </span>
            )}
          </button>
          {/* корзина */}
          <button
            onClick={onCart}
            className="relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-neutral-400 transition-colors hover:text-emerald-400 active:scale-95"
          >
            <Icon name="ShoppingCart" size={20} />
            <span className="text-[10px] font-medium">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-0.5 text-[9px] font-bold text-black">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* отступ внизу страницы чтобы контент не перекрывался */}
      <div className="h-16 lg:hidden" />

      {/* выезжающее «ещё» меню */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-[#1a3a1a] bg-[#07130a] pb-8 pt-3 lg:hidden"
            >
              {/* ручка */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-neutral-700" />

              <div className="space-y-1 px-4">
                {moreItems.map(item => (
                  <button key={item.label}
                    onClick={() => run(item.onClick)}
                    className="relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-white/5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1a3a1a] bg-black/30">
                      <Icon name={item.icon} size={20} style={item.color ? { color: item.color } : undefined}
                        className={!item.color ? 'text-neutral-300' : ''} />
                    </div>
                    <span className="font-semibold text-white">{item.label}</span>
                    {!!item.badge && item.badge > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                    <Icon name="ChevronRight" size={16} className="ml-auto text-neutral-600" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
