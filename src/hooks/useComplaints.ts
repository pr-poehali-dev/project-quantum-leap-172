import { useState, useEffect, useCallback } from 'react'
import { complaintsApi, type User } from '@/lib/api'
import { canReviewComplaints } from '@/lib/permissions'

export function useComplaints(user: User | null) {
  const [count, setCount] = useState(0)

  const refresh = useCallback(() => {
    if (!user || !canReviewComplaints(user.role)) { setCount(0); return }
    complaintsApi.list()
      .then(items => setCount(items.filter(c => c.status === 'open').length))
      .catch(() => {})
  }, [user])

  // первичная загрузка и опрос каждые 60 секунд
  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 60_000)
    return () => clearInterval(t)
  }, [refresh])

  return count
}
