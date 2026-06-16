import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'

const LOGO = 'https://cdn.poehali.dev/projects/2e83ccfa-ea22-4097-88e8-31abba7dbd2b/bucket/c9bc29d5-607e-4f60-aca7-ff80bcb975a6.png'
const AUTH_URL = 'https://functions.poehali.dev/949c9c1b-6840-4604-96e9-0d4d07033cf5'

const STEPS = ['Ключ настройки', 'Аккаунт Создателя', 'Готово!']

export default function Setup() {
  const [step, setStep] = useState(0)
  const [setupKey, setSetupKey]   = useState('')
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [token, setToken]         = useState('')
  const [createdName, setCreatedName] = useState('')

  const nextStep = () => {
    setError('')
    if (step === 0) {
      if (!setupKey.trim()) { setError('Введите ключ настройки'); return }
      setStep(1)
    }
  }

  const submit = async () => {
    setError('')
    if (!username.trim() || username.length < 3) { setError('Ник минимум 3 символа'); return }
    if (password.length < 6) { setError('Пароль минимум 6 символов'); return }
    if (password !== password2) { setError('Пароли не совпадают'); return }

    setLoading(true)
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setup', username, password, setup_key: setupKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка сервера')
      localStorage.setItem('mc_token', data.token)
      setToken(data.token)
      setCreatedName(data.username)
      setStep(2)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#04100a] px-4"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Bg glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src={LOGO} alt="MCFIRE.BOX" className="h-16 w-16 rounded-2xl object-cover shadow-[0_0_40px_rgba(74,222,128,0.4)]" />
          <span className="font-display text-lg text-white">MCFIRE.BOX</span>
          <span className="text-sm text-neutral-400">Первоначальная настройка</span>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                i < step ? 'border-emerald-500 bg-emerald-500 text-black'
                : i === step ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400'
                : 'border-neutral-700 bg-transparent text-neutral-600'
              }`}>
                {i < step ? <Icon name="Check" size={14} /> : i + 1}
              </div>
              <span className={`text-center text-[10px] leading-tight ${i <= step ? 'text-emerald-300' : 'text-neutral-600'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-[#07130a]/80 p-6 shadow-[0_0_60px_-20px_rgba(16,185,129,0.4)] backdrop-blur-sm">
          <AnimatePresence mode="wait">

            {/* Step 0 — Setup Key */}
            {step === 0 && (
              <motion.div key="step0"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <Icon name="KeyRound" size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Ключ настройки</h2>
                    <p className="text-xs text-neutral-400">Введите секретный ключ из настроек проекта</p>
                  </div>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 mb-4">
                  <Icon name="Info" size={12} className="mr-1 inline" />
                  Ключ задаётся в разделе <b>Секреты</b> проекта как <b>SETUP_KEY</b>. Без него создать аккаунт Создателя невозможно.
                </div>
                <input
                  value={setupKey}
                  onChange={e => setSetupKey(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && nextStep()}
                  type="password"
                  placeholder="Введите ключ настройки..."
                  className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20"
                />
                {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
                <button onClick={nextStep}
                  className="mt-4 w-full rounded-xl bg-emerald-500 py-3 font-bold text-black transition-all hover:bg-emerald-400 active:scale-95"
                >
                  Продолжить <Icon name="ArrowRight" size={16} className="ml-1 inline" />
                </button>
              </motion.div>
            )}

            {/* Step 1 — Creator account */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                    <Icon name="Crown" size={20} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Аккаунт Создателя</h2>
                    <p className="text-xs text-neutral-400">Придумайте ник и пароль для входа</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Никнейм Создателя</label>
                    <input
                      value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="Например: Admin или ваш ник"
                      className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Пароль</label>
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-400">Повторите пароль</label>
                    <input
                      type="password" value={password2} onChange={e => setPassword2(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submit()}
                      placeholder="Повторите пароль"
                      className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60"
                    />
                  </div>
                </div>
                {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { setStep(0); setError('') }}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#1a3a1a] text-neutral-400 transition-all hover:text-white"
                  >
                    <Icon name="ArrowLeft" size={18} />
                  </button>
                  <button onClick={submit} disabled={loading}
                    className="flex-1 rounded-xl bg-emerald-500 py-3 font-bold text-black transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Создаём аккаунт...' : 'Создать аккаунт Создателя'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2 — Done */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, damping: 12 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-5xl"
                >
                  👑
                </motion.div>
                <h2 className="text-xl font-bold text-white">Готово!</h2>
                <p className="mt-2 text-neutral-300">
                  Аккаунт Создателя <span className="font-bold text-amber-400">{createdName}</span> успешно создан.
                </p>
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left text-sm">
                  <p className="font-semibold text-emerald-300 mb-2">Что доступно Создателю:</p>
                  <ul className="space-y-1 text-neutral-400 text-xs">
                    {[
                      'Полная панель управления сайтом',
                      'Выдача ролей всем игрокам',
                      'Публикация новостей',
                      'Изменение цветов, IP, названия сайта',
                      'Ссылки на соцсети',
                    ].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <Icon name="Check" size={12} className="text-emerald-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {token && (
                  <p className="mt-3 text-xs text-neutral-500">
                    Вы автоматически вошли в систему
                  </p>
                )}
                <a href="/"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-black transition-all hover:bg-emerald-400 active:scale-95"
                >
                  <Icon name="Home" size={18} />
                  Перейти на сайт
                </a>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-600">
          Страница /setup доступна всем — держите SETUP_KEY в секрете
        </p>
      </motion.div>
    </div>
  )
}
