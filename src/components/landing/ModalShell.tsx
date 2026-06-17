import { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  icon?: string
  maxWidth?: string
  children: ReactNode
}

export function ModalShell({ open, onClose, title, icon, maxWidth = 'max-w-xl', children }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
        >
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#07130a] shadow-[0_0_50px_-12px_rgba(16,185,129,0.4)]`}
          >
            <button onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-neutral-500 transition-colors hover:text-white"
            >
              <Icon name="X" size={14} />
            </button>
            {title && (
              <div className="flex shrink-0 items-center gap-2 border-b border-white/5 px-5 py-3.5">
                {icon && <Icon name={icon} size={17} className="text-emerald-400" />}
                <h2 className="text-base font-bold text-white">{title}</h2>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Всплывающее «У вас нет прав» с персонажем Minecraft
export function NoPermissionToast({ show, onClose }: { show: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.7 }}
            transition={{ type: 'spring', damping: 14 }}
            onClick={e => e.stopPropagation()}
            className="flex flex-col items-center gap-3 rounded-2xl border border-red-500/40 bg-[#1a0707] p-6 text-center shadow-[0_0_50px_-10px_rgba(239,68,68,0.6)]"
          >
            <div className="text-6xl">🧟</div>
            <div className="rounded-lg border border-amber-700 bg-amber-100 px-4 py-2 font-mono text-sm font-bold text-amber-900 shadow-inner">
              У вас нет прав для<br />выполнения этого действия
            </div>
            <button onClick={onClose}
              className="mt-1 rounded-lg bg-red-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-red-400"
            >
              Понятно
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}