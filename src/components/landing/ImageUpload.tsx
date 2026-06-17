import { useState, useRef } from 'react'
import Icon from '@/components/ui/icon'
import { settingsApi } from '@/lib/api'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
  size?: number
}

export function ImageUpload({ value, onChange, label, size = 64 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pick = () => inputRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    if (file.size > 5 * 1024 * 1024) { setError('Файл больше 5 МБ'); return }
    setLoading(true)
    try {
      const dataUrl: string = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(reader.result as string)
        reader.onerror = rej
        reader.readAsDataURL(file)
      })
      const { url } = await settingsApi.upload(file.type, dataUrl)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {label && <label className="mb-1 block text-xs text-neutral-400">{label}</label>}
      <div className="flex items-center gap-3">
        <div
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1a3a1a] bg-black/40"
          style={{ width: size, height: size }}
        >
          {value
            ? <img src={value} alt="" className="h-full w-full object-cover" />
            : <Icon name="ImageOff" size={20} className="text-neutral-600" />}
        </div>
        <div className="flex-1">
          <button onClick={pick} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
          >
            <Icon name={loading ? 'Loader' : 'Upload'} size={13} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Загрузка...' : 'Загрузить (JPG/PNG, до 5 МБ)'}
          </button>
          {value && (
            <button onClick={() => onChange('')} className="ml-2 text-xs text-red-400 hover:underline">Удалить</button>
          )}
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
    </div>
  )
}
