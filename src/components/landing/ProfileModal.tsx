import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import type { User, Role } from '@/lib/api'
import { isStaff, ROLE_META } from '@/lib/permissions'

const PRIV_COLORS: Record<string, string> = {
  VIP: '#4ade80', PREMIUM: '#22d3ee', ELITE: '#a78bfa',
  DELUXE: '#06b6d4', LEGEND: '#fbbf24', DRAGON: '#f87171',
}

interface Props {
  open: boolean
  onClose: () => void
  user: User
  onLogout: () => void
  onOpenStaff?: () => void
  onOpenAdmin?: () => void
  onOpenPunishments?: () => void
}

export function ProfileModal({ open, onClose, user, onLogout, onOpenStaff, onOpenAdmin, onOpenPunishments }: Props) {
  const roleInfo = ROLE_META[user.role as Role] || ROLE_META.player
  const privColor = user.privilege ? (PRIV_COLORS[user.privilege] || '#4ade80') : null
  const isAdmin = user.role === 'creator' || user.role === 'admin'

  const go = (fn?: () => void) => { onClose(); fn?.() }

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div initial={{ opacity: 0, scale: 0.93, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-[#07130a] p-6 shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]"
          >
            <button onClick={onClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 text-neutral-400 hover:text-white"
            >
              <Icon name="X" size={16} />
            </button>

            <h2 className="mb-5 font-display text-lg text-white">Личный кабинет</h2>

            {/* Аватар и роль */}
            <div className="flex items-center gap-4 rounded-xl border border-[#1a3a1a] bg-black/30 p-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl font-bold text-emerald-400">
                {user.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-lg font-bold text-white">{user.username}</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <Icon name={roleInfo.icon} size={14} style={{ color: roleInfo.color }} />
                  <span className="text-sm font-semibold" style={{ color: roleInfo.color }}>{roleInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Стата */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
                <div className="text-xs text-neutral-500">Привилегия</div>
                {user.privilege ? (
                  <div className="mt-1 font-bold" style={{ color: privColor || '#4ade80' }}>{user.privilege}</div>
                ) : (
                  <div className="mt-1 text-sm text-neutral-500">Нет</div>
                )}
              </div>
              <div className="rounded-xl border border-[#1a3a1a] bg-black/20 p-3">
                <div className="text-xs text-neutral-500">Статус</div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-sm text-emerald-300">Онлайн</span>
                </div>
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="mt-3 space-y-2">
              {/* Мои наказания */}
              <button onClick={() => go(onOpenPunishments)}
                className="flex w-full items-center gap-3 rounded-xl border border-[#1a3a1a] bg-black/20 px-4 py-2.5 text-sm text-neutral-300 transition-colors hover:border-red-500/30 hover:bg-red-500/5 hover:text-white"
              >
                <Icon name="Gavel" size={16} className="text-red-400" />
                Мои наказания
                <Icon name="ChevronRight" size={14} className="ml-auto text-neutral-600" />
              </button>

              {/* Панель персонала (только для staff) */}
              {isStaff(user.role) && (
                <button onClick={() => go(onOpenStaff)}
                  className="flex w-full items-center gap-3 rounded-xl border border-sky-500/20 bg-sky-500/5 px-4 py-2.5 text-sm text-sky-300 transition-colors hover:border-sky-500/40 hover:bg-sky-500/10"
                >
                  <Icon name="ShieldHalf" size={16} />
                  Панель персонала
                  <Icon name="ChevronRight" size={14} className="ml-auto text-neutral-600" />
                </button>
              )}

              {/* Панель управления (только admin/creator) */}
              {isAdmin && (
                <button onClick={() => go(onOpenAdmin)}
                  className="flex w-full items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-sm text-amber-300 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10"
                >
                  <Icon name="Settings" size={16} />
                  Панель управления
                  <Icon name="ChevronRight" size={14} className="ml-auto text-neutral-600" />
                </button>
              )}
            </div>

            <Button onClick={onLogout} variant="outline"
              className="mt-4 w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Icon name="LogOut" size={16} className="mr-2" />
              Выйти
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
