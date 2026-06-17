import { motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { ModalShell } from './ModalShell'

export type DonateSection = 'privileges' | 'coins' | 'cases' | 'battlepass' | 'unban'

const SECTIONS: { id: DonateSection; title: string; icon: string; bg: string; hover: string; special?: boolean }[] = [
  { id: 'privileges', title: 'Привилегии',    icon: 'Crown',     bg: 'bg-emerald-500', hover: 'hover:bg-emerald-400' },
  { id: 'coins',      title: 'Коин-магазин',  icon: 'Coins',     bg: 'bg-amber-500',   hover: 'hover:bg-amber-400' },
  { id: 'cases',      title: 'Магазин кейсов', icon: 'Package',   bg: 'bg-sky-500',     hover: 'hover:bg-sky-400' },
  { id: 'battlepass', title: 'Battle Pass',   icon: 'Swords',    bg: 'bg-orange-500',  hover: 'hover:bg-orange-400' },
  { id: 'unban',      title: 'Разбан и размут', icon: 'Unlock',  bg: 'bg-red-600',     hover: 'hover:bg-red-500', special: true },
]

interface Props { open: boolean; onClose: () => void; onGo: (s: DonateSection) => void }

export function DonateModal({ open, onClose, onGo }: Props) {
  return (
    <ModalShell open={open} onClose={onClose} title="Донат" icon="Gift" maxWidth="max-w-lg">
      <div className="space-y-3 p-6">
        {SECTIONS.map((s, i) => (
          <motion.div key={s.id}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${s.special ? 'border-red-500/50 bg-red-500/5' : 'border-[#1a3a1a] bg-black/20'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}/15`}>
                <Icon name={s.icon} size={20} className={s.special ? 'text-red-400' : 'text-white'} />
              </div>
              <span className={s.special ? 'unban-glow font-display text-base font-bold text-white' : 'font-semibold text-white'}>
                {s.title}
              </span>
            </div>
            <button onClick={() => onGo(s.id)}
              className={`rounded-xl px-5 py-2 text-sm font-bold text-white transition-all active:scale-95 ${s.bg} ${s.hover} ${s.special ? 'shadow-[0_0_18px_rgba(220,38,38,0.6)]' : ''}`}
            >
              Перейти
            </button>
          </motion.div>
        ))}
      </div>
    </ModalShell>
  )
}
