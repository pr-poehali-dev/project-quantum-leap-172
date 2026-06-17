import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { ModalShell } from './ModalShell'
import {
  punishmentsApi, complaintsApi,
  type User, type Punishment, type PunishmentType, type ComplaintKind,
} from '@/lib/api'
import {
  isStaff, canBan, canMute, canRemovePunishment,
  BAN_LIMIT, MUTE_LIMIT, formatLimit,
} from '@/lib/permissions'

const REASONS = ['Читы', 'Оскорбления', 'Спам', 'Реклама', 'Гриферство', 'Баг-юз', 'Угрозы', 'Мультиаккаунт', 'Другое']

interface Props { open: boolean; onClose: () => void; user: User | null }

export function PunishmentsModal({ open, onClose, user }: Props) {
  const [items, setItems] = useState<Punishment[]>([])
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<'all' | 'mine'>('all')
  const [issueOpen, setIssueOpen] = useState(false)
  const [complaintFor, setComplaintFor] = useState<{ p: Punishment; kind: ComplaintKind } | null>(null)
  const [toast, setToast] = useState('')

  const role = user?.role

  const load = useCallback(() => {
    setLoading(true)
    punishmentsApi.list().then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => { if (open) load() }, [open, load])

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2200) }

  const remove = async (id: number) => {
    try {
      await punishmentsApi.remove(id)
      setItems(prev => prev.map(p => p.id === id ? { ...p, active: false, removed_by: user?.username || '' } : p))
      showToast('Наказание снято')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  const filtered = tab === 'mine' && user
    ? items.filter(p => p.player_name.toLowerCase() === user.username.toLowerCase())
    : items

  return (
    <>
      <ModalShell open={open} onClose={onClose} maxWidth="max-w-4xl">
        <div className="border-b border-emerald-500/20 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Icon name="Gavel" size={20} className="text-red-400" />
              <h2 className="font-display text-lg text-white">База наказаний</h2>
            </div>
            {isStaff(role) && (
              <Button size="sm" onClick={() => setIssueOpen(true)}
                className="bg-red-500 text-white hover:bg-red-400"
              >
                <Icon name="Hammer" size={14} className="mr-1" />Выдать наказание
              </Button>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            {([['all', 'Все'], ['mine', 'Мои наказания']] as const).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${tab === k ? 'bg-emerald-500 text-black' : 'border border-[#1a3a1a] text-neutral-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading && <div className="py-10 text-center text-neutral-500">Загрузка...</div>}
          {!loading && filtered.length === 0 && (
            <div className="py-12 text-center">
              <Icon name="ShieldCheck" size={40} className="mx-auto mb-3 text-emerald-500/30" />
              <p className="text-neutral-500">Наказаний нет</p>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(p => {
              const isOwner = user && p.player_name.toLowerCase() === user.username.toLowerCase()
              const expired = p.expires_at && new Date(p.expires_at) < new Date()
              const statusActive = p.active && !expired
              return (
                <motion.div key={p.id} layout
                  className="rounded-xl border border-[#1a3a1a] bg-black/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${p.punishment_type === 'ban' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          {p.punishment_type === 'ban' ? 'БАН' : 'МУТ'}
                        </span>
                        <span className="font-bold text-white">{p.player_name}</span>
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${statusActive ? 'bg-red-500/10 text-red-300' : 'bg-neutral-700/40 text-neutral-400'}`}>
                          {statusActive ? 'Активно' : p.removed_by ? `Снято (${p.removed_by})` : 'Истекло'}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-neutral-300">
                        <span className="text-neutral-500">Причина:</span> {p.reason}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500">
                        <span>Выдал: {p.admin_name}</span>
                        <span>{new Date(p.issued_at).toLocaleString('ru-RU')}</span>
                        <span>{p.expires_at ? `до ${new Date(p.expires_at).toLocaleDateString('ru-RU')}` : 'навсегда'}</span>
                      </div>
                      {p.proof_url && (
                        <a href={p.proof_url} target="_blank" rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-sky-400 hover:underline"
                        >
                          <Icon name="Link" size={11} />Доказательство
                        </a>
                      )}
                    </div>
                    {canRemovePunishment(role) && statusActive && (
                      <button onClick={() => remove(p.id)}
                        className="flex h-8 items-center gap-1 rounded-lg border border-emerald-500/30 px-2 text-xs text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <Icon name="Undo2" size={13} />Снять
                      </button>
                    )}
                  </div>

                  {/* Кнопки для владельца аккаунта */}
                  {isOwner && (
                    <div className="mt-3 flex flex-wrap gap-2 border-t border-[#1a3a1a] pt-3">
                      <button onClick={() => setComplaintFor({ p, kind: 'appeal' })}
                        className="rounded-lg border border-sky-500/30 px-3 py-1.5 text-xs text-sky-300 hover:bg-sky-500/10"
                      >
                        Подать обжалование
                      </button>
                      <button onClick={() => setComplaintFor({ p, kind: 'staff_report' })}
                        className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Жалоба на администрацию
                      </button>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Кнопка жалобы на игрока для всех авторизованных */}
          {user && (
            <button onClick={() => setComplaintFor({ p: items[0], kind: 'player_report' })}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
            >
              <Icon name="Flag" size={15} />Подать жалобу на игрока
            </button>
          )}
        </div>

        {toast && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-emerald-500/40 bg-[#07130a] px-4 py-2 text-sm font-semibold text-emerald-400">
            ✓ {toast}
          </div>
        )}
      </ModalShell>

      {issueOpen && user && (
        <IssueForm role={role!} actor={user} onClose={() => setIssueOpen(false)} onDone={() => { setIssueOpen(false); load(); showToast('Наказание выдано') }} />
      )}
      {complaintFor && user && (
        <ComplaintForm
          kind={complaintFor.kind}
          punishment={complaintFor.p}
          onClose={() => setComplaintFor(null)}
          onDone={() => { setComplaintFor(null); showToast('Отправлено администрации') }}
        />
      )}
    </>
  )
}

// ─── Форма выдачи наказания ───
function IssueForm({ role, actor, onClose, onDone }: {
  role: NonNullable<User['role']>; actor: User; onClose: () => void; onDone: () => void
}) {
  const [type, setType] = useState<PunishmentType>(canBan(role) ? 'ban' : 'mute')
  const [player, setPlayer] = useState('')
  const [reason, setReason] = useState(REASONS[0])
  const [hours, setHours] = useState('')
  const [proof, setProof] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const limit = type === 'ban' ? BAN_LIMIT[role] : MUTE_LIMIT[role]

  const submit = async () => {
    setError('')
    if (!player.trim()) { setError('Укажите ник игрока'); return }
    const h = parseInt(hours) || 0
    if (limit !== null && (h === 0 || h > limit)) {
      setError(`Срок для вашей роли: до ${formatLimit(limit)}`); return
    }
    setLoading(true)
    try {
      await punishmentsApi.issue({ player_name: player.trim(), reason, punishment_type: type, hours: h, proof_url: proof.trim() })
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally { setLoading(false) }
  }

  return (
    <ModalShell open onClose={onClose} title="Выдать наказание" icon="Hammer" maxWidth="max-w-md">
      <div className="space-y-3 p-6">
        <div className="flex gap-2">
          {canBan(role) && (
            <button onClick={() => setType('ban')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold ${type === 'ban' ? 'bg-red-500 text-white' : 'border border-[#1a3a1a] text-neutral-400'}`}
            >Бан</button>
          )}
          {canMute(role) && (
            <button onClick={() => setType('mute')}
              className={`flex-1 rounded-lg py-2 text-sm font-bold ${type === 'mute' ? 'bg-amber-500 text-black' : 'border border-[#1a3a1a] text-neutral-400'}`}
            >Мут</button>
          )}
        </div>

        <Field label="Никнейм игрока">
          <input value={player} onChange={e => setPlayer(e.target.value)} placeholder="Steve"
            className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
        </Field>
        <Field label="Причина">
          <select value={reason} onChange={e => setReason(e.target.value)}
            className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60">
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label={`Срок в часах (${formatLimit(limit)})`}>
          <input value={hours} onChange={e => setHours(e.target.value.replace(/\D/g, ''))}
            placeholder={limit === null ? 'пусто = навсегда' : `до ${limit} ч`}
            className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
        </Field>
        <Field label="Ссылка на доказательство">
          <input value={proof} onChange={e => setProof(e.target.value)} placeholder="https://..."
            className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
        </Field>
        <div className="rounded-lg bg-black/30 px-3 py-2 text-xs text-neutral-500">
          Выдающий: <span className="text-neutral-300">{actor.username}</span>
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <Button onClick={submit} disabled={loading} className="w-full bg-red-500 text-white hover:bg-red-400">
          {loading ? 'Выдаём...' : 'Наказать'}
        </Button>
      </div>
    </ModalShell>
  )
}

// ─── Форма жалобы/обжалования ───
function ComplaintForm({ kind, punishment, onClose, onDone }: {
  kind: ComplaintKind; punishment?: Punishment; onClose: () => void; onDone: () => void
}) {
  const [text, setText] = useState('')
  const [target, setTarget] = useState(kind === 'staff_report' ? (punishment?.admin_name || '') : '')
  const [proof, setProof] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const titles: Record<ComplaintKind, string> = {
    player_report: 'Жалоба на игрока',
    appeal: 'Обжалование наказания',
    staff_report: 'Жалоба на администрацию',
  }

  const submit = async () => {
    setError('')
    if (!text.trim()) { setError('Введите текст'); return }
    setLoading(true)
    try {
      await complaintsApi.create({
        kind, text: text.trim(), target_name: target.trim(), proof_url: proof.trim(),
        punishment_id: kind === 'appeal' ? punishment?.id : undefined,
      })
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally { setLoading(false) }
  }

  return (
    <ModalShell open onClose={onClose} title={titles[kind]} icon="Flag" maxWidth="max-w-md">
      <div className="space-y-3 p-6">
        {kind === 'player_report' && (
          <Field label="Ник нарушителя">
            <input value={target} onChange={e => setTarget(e.target.value)} placeholder="Ник игрока"
              className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
          </Field>
        )}
        {kind === 'staff_report' && (
          <Field label="Администратор">
            <input value={target} onChange={e => setTarget(e.target.value)}
              className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
          </Field>
        )}
        <Field label="Текст">
          <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Опишите ситуацию..."
            className="w-full resize-none rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
        </Field>
        {kind !== 'appeal' && (
          <Field label="Ссылка на доказательство">
            <input value={proof} onChange={e => setProof(e.target.value)} placeholder="https://..."
              className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/60" />
          </Field>
        )}
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        <Button onClick={submit} disabled={loading} className="w-full bg-emerald-500 text-black hover:bg-emerald-400">
          {loading ? 'Отправка...' : 'Отправить'}
        </Button>
      </div>
    </ModalShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-neutral-400">{label}</label>
      {children}
    </div>
  )
}
