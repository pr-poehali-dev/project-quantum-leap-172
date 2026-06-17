import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { ModalShell } from './ModalShell'
import { complaintsApi, punishmentsApi, type User, type Complaint, type ActionLog } from '@/lib/api'
import { ROLE_RIGHTS, ROLE_META, canReviewComplaints } from '@/lib/permissions'

const KIND_LABELS: Record<Complaint['kind'], { label: string; color: string }> = {
  player_report: { label: 'Жалоба на игрока', color: '#fbbf24' },
  appeal:        { label: 'Обжалование',      color: '#60a5fa' },
  staff_report:  { label: 'Жалоба на админа', color: '#f87171' },
}

interface Props { open: boolean; onClose: () => void; user: User }

export function StaffPanel({ open, onClose, user }: Props) {
  const [tab, setTab] = useState<'rights' | 'complaints' | 'logs'>('rights')
  const rights = ROLE_RIGHTS[user.role]
  const meta = ROLE_META[user.role]

  const tabs: { key: typeof tab; label: string; icon: string; show: boolean }[] = [
    { key: 'rights', label: 'Мои права', icon: 'ScrollText', show: true },
    { key: 'complaints', label: 'Жалобы', icon: 'Inbox', show: canReviewComplaints(user.role) },
    { key: 'logs', label: 'Журнал', icon: 'History', show: user.role === 'admin' || user.role === 'creator' },
  ]

  return (
    <ModalShell open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="border-b border-emerald-500/20 px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon name={meta.icon} size={20} style={{ color: meta.color }} />
          <h2 className="font-display text-lg text-white">Панель персонала</h2>
          <span className="rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: `${meta.color}22`, color: meta.color }}>
            {meta.label}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {tabs.filter(t => t.show).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${tab === t.key ? 'bg-emerald-500 text-black' : 'border border-[#1a3a1a] text-neutral-400 hover:text-white'}`}
            >
              <Icon name={t.icon} size={14} />{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {tab === 'rights' && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-400">Возможности вашей роли «{rights.title}»:</p>
            <div>
              <div className="mb-2 text-xs font-semibold uppercase text-emerald-400">Доступно</div>
              <ul className="space-y-1.5">
                {rights.allowed.map(r => (
                  <li key={r} className="flex items-start gap-2 text-sm text-neutral-200">
                    <Icon name="Check" size={15} className="mt-0.5 shrink-0 text-emerald-400" />{r}
                  </li>
                ))}
              </ul>
            </div>
            {rights.denied.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-semibold uppercase text-red-400">Недоступно</div>
                <ul className="space-y-1.5">
                  {rights.denied.map(r => (
                    <li key={r} className="flex items-start gap-2 text-sm text-neutral-500">
                      <Icon name="X" size={15} className="mt-0.5 shrink-0 text-red-400" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'complaints' && <ComplaintsTab user={user} />}
        {tab === 'logs' && <LogsTab />}
      </div>
    </ModalShell>
  )
}

function ComplaintsTab({ user }: { user: User }) {
  const [items, setItems] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    complaintsApi.list().then(setItems).catch(() => {}).finally(() => setLoading(false))
  }, [])
  useEffect(() => { load() }, [load])

  const review = async (id: number, status: 'accepted' | 'rejected') => {
    await complaintsApi.review(id, status).catch(() => {})
    setItems(prev => prev.map(c => c.id === id ? { ...c, status, reviewed_by: user.username } : c))
  }

  if (loading) return <div className="py-8 text-center text-neutral-500">Загрузка...</div>
  if (items.length === 0) return (
    <div className="py-10 text-center">
      <Icon name="Inbox" size={36} className="mx-auto mb-2 text-emerald-500/30" />
      <p className="text-neutral-500">Новых обращений нет</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {items.map(c => {
        const k = KIND_LABELS[c.kind]
        return (
          <motion.div key={c.id} layout className="rounded-xl border border-[#1a3a1a] bg-black/20 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: `${k.color}22`, color: k.color }}>{k.label}</span>
              {c.status === 'open'
                ? <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300">Открыта</span>
                : <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${c.status === 'accepted' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>{c.status === 'accepted' ? 'Принята' : 'Отклонена'}</span>}
            </div>
            <p className="mt-2 text-sm text-neutral-200">{c.text}</p>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-500">
              <span>От: {c.author_name}</span>
              {c.target_name && <span>Цель: {c.target_name}</span>}
              <span>{new Date(c.created_at).toLocaleString('ru-RU')}</span>
            </div>
            {c.proof_url && (
              <a href={c.proof_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-sky-400 hover:underline">
                <Icon name="Link" size={11} />Доказательство
              </a>
            )}
            {c.status === 'open' && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => review(c.id, 'accepted')} className="bg-emerald-500 text-black hover:bg-emerald-400">Принять</Button>
                <Button size="sm" variant="outline" onClick={() => review(c.id, 'rejected')} className="border-red-500/30 text-red-400 hover:bg-red-500/10">Отклонить</Button>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

function LogsTab() {
  const [logs, setLogs] = useState<ActionLog[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    punishmentsApi.logs().then(setLogs).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="py-8 text-center text-neutral-500">Загрузка...</div>
  if (logs.length === 0) return <div className="py-10 text-center text-neutral-500">Журнал пуст</div>

  return (
    <div className="space-y-2">
      {logs.map(l => (
        <div key={l.id} className="flex items-start gap-3 rounded-lg border border-[#1a3a1a] bg-black/20 p-2.5 text-sm">
          <Icon name="Dot" size={16} className="mt-0.5 text-emerald-400" />
          <div className="min-w-0 flex-1">
            <span className="font-semibold text-white">{l.actor_name}</span>
            <span className="text-neutral-400"> {l.action}</span>
            <div className="text-xs text-neutral-600">{new Date(l.created_at).toLocaleString('ru-RU')}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
