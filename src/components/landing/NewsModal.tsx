import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { newsApi, type NewsItem } from '@/lib/api'
import type { User } from '@/lib/api'

interface Props { open: boolean; onClose: () => void; user: User | null }

export function NewsModal({ open, onClose, user }: Props) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  const canManage = user?.role === 'creator' || user?.role === 'admin'

  useEffect(() => {
    if (!open) return
    setLoading(true)
    newsApi.list().then(setNews).catch(() => {}).finally(() => setLoading(false))
  }, [open])

  const startEdit = (item: NewsItem) => {
    setEditing(item); setTitle(item.title); setContent(item.content); setCreating(false)
  }
  const startCreate = () => {
    setEditing(null); setTitle(''); setContent(''); setCreating(true)
  }
  const cancelForm = () => { setEditing(null); setCreating(false); setError('') }

  const save = async () => {
    if (!title.trim() || !content.trim()) { setError('Заполните все поля'); return }
    setError('')
    try {
      if (creating) {
        const item = await newsApi.create(title, content)
        setNews(prev => [item, ...prev])
      } else if (editing) {
        await newsApi.update(editing.id, title, content)
        setNews(prev => prev.map(n => n.id === editing.id ? { ...n, title, content } : n))
      }
      cancelForm()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  const del = async (id: number) => {
    await newsApi.delete(id).catch(() => {})
    setNews(prev => prev.filter(n => n.id !== id))
  }

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
            className="relative flex h-[88vh] w-full max-w-xl flex-col rounded-2xl border border-emerald-500/25 bg-[#07130a] shadow-[0_0_50px_-12px_rgba(16,185,129,0.4)]"
          >
            <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 text-neutral-400 hover:text-white">
              <Icon name="X" size={16} />
            </button>

            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 sm:px-5">
              <h2 className="font-display text-lg text-white">Новости сервера</h2>
              {canManage && !creating && !editing && (
                <Button size="sm" onClick={startCreate} className="bg-emerald-500 text-black hover:bg-emerald-400 mr-8">
                  <Icon name="Plus" size={14} className="mr-1" />Написать
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {/* Form */}
              {(creating || editing) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-500/30 bg-black/30 p-4 space-y-3"
                >
                  <div className="text-sm font-semibold text-emerald-300">
                    {creating ? 'Новая запись' : 'Редактировать'}
                  </div>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="Заголовок"
                    className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60"
                  />
                  <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Текст новости..."
                    rows={4}
                    className="w-full rounded-xl border border-[#1a3a1a] bg-black/40 px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-emerald-500/60 resize-none"
                  />
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <div className="flex gap-2">
                    <Button size="sm" onClick={save} className="bg-emerald-500 text-black hover:bg-emerald-400">Сохранить</Button>
                    <Button size="sm" variant="outline" onClick={cancelForm} className="border-neutral-600 text-neutral-300">Отмена</Button>
                  </div>
                </motion.div>
              )}

              {/* List */}
              {loading && <div className="py-8 text-center text-neutral-500">Загрузка...</div>}
              {!loading && news.length === 0 && !creating && (
                <div className="py-12 text-center">
                  <Icon name="Newspaper" size={40} className="mx-auto mb-3 text-emerald-500/30" />
                  <p className="text-neutral-500">Новостей пока нет</p>
                </div>
              )}
              {news.map(n => (
                <motion.div key={n.id} layout
                  className="rounded-xl border border-[#1a3a1a] bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{n.title}</h3>
                      <p className="mt-1 text-sm text-neutral-400 whitespace-pre-wrap">{n.content}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                        <Icon name="User" size={11} />
                        <span>{n.author_name}</span>
                        <span>·</span>
                        <span>{new Date(n.created_at).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 gap-1">
                        <button onClick={() => startEdit(n)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <Icon name="Pencil" size={14} />
                        </button>
                        <button onClick={() => del(n.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}