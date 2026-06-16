import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

const overlay = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const panel = { hidden: { opacity: 0, scale: 0.93, y: 24 }, visible: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.93, y: 24 } }

interface Props {
  open: boolean
  onClose: () => void
  onLogin: (u: string, p: string) => Promise<void>
  onRegister: (u: string, p: string) => Promise<void>
}

export function AuthModal({ open, onClose, onLogin, onRegister }: Props) {
  const [tab, setTab] = useState<'login' | 'reg'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      if (tab === 'login') await onLogin(username, password)
      else await onRegister(username, password)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div variants={overlay} initial="hidden" animate="visible" exit="hidden"
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div variants={panel} initial="hidden" animate="visible" exit="exit"
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-2xl border border-emerald-500/30 bg-[#07130a] p-6 shadow-[0_0_60px_-15px_rgba(16,185,129,0.5)]"
          >
            <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 text-neutral-400 hover:text-white">
              <Icon name="X" size={16} />
            </button>

            <div className="mb-6 flex rounded-xl border border-[#1a3a1a] bg-black/30 p-1">
              {(['login', 'reg'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${tab === t ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'}`}
                >
                  {t === 'login' ? 'Войти' : 'Регистрация'}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-400">Никнейм</label>
                <input
                  value={username} onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="Steve"
                  className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-400">Пароль</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="••••••"
                  className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
              <Button onClick={submit} disabled={loading} className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
                {loading ? 'Загрузка...' : tab === 'login' ? 'Войти' : 'Создать аккаунт'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
