import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import type { User, Role } from '@/lib/api'

const ROLE_LABELS: Record<Role, { label: string; color: string; icon: string }> = {
  player:    { label: 'Игрок',       color: '#9ca3af', icon: 'User' },
  helper:    { label: 'Helper',      color: '#34d399', icon: 'HelpCircle' },
  moderator: { label: 'Moderator',   color: '#60a5fa', icon: 'Shield' },
  admin:     { label: 'Admin',       color: '#f97316', icon: 'ShieldCheck' },
  creator:   { label: 'Создатель',   color: '#fbbf24', icon: 'Crown' },
}

const PRIV_COLORS: Record<string, string> = {
  VIP: '#4ade80', PREMIUM: '#22d3ee', ELITE: '#a78bfa',
  DELUXE: '#06b6d4', LEGEND: '#fbbf24', DRAGON: '#f87171',
}

interface Props { open: boolean; onClose: () => void; user: User; onLogout: () => void }

export function ProfileModal({ open, onClose, user, onLogout }: Props) {
  const roleInfo = ROLE_LABELS[user.role] || ROLE_LABELS.player
  const privColor = user.privilege ? (PRIV_COLORS[user.privilege] || '#4ade80') : null

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
            <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 text-neutral-400 hover:text-white">
              <Icon name="X" size={16} />
            </button>

            <h2 className="mb-5 font-display text-lg text-white">Личный кабинет</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 rounded-xl border border-[#1a3a1a] bg-black/30 p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/15 text-2xl font-bold text-emerald-400">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-bold text-white">{user.username}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Icon name={roleInfo.icon} size={14} style={{ color: roleInfo.color }} />
                  <span className="text-sm font-semibold" style={{ color: roleInfo.color }}>{roleInfo.label}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-2 gap-3">
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

            <Button onClick={onLogout} variant="outline"
              className="mt-5 w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
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
