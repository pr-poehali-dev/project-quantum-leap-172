import { useState, useEffect, useCallback } from 'react'
import { authApi, type User } from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tok = localStorage.getItem('mc_token')
    if (!tok) { setLoading(false); return }
    authApi.me()
      .then(setUser)
      .catch(() => { localStorage.removeItem('mc_token') })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const data = await authApi.login(username, password)
    localStorage.setItem('mc_token', data.token)
    setUser({ id: data.id, username: data.username, role: data.role, privilege: data.privilege })
  }, [])

  const register = useCallback(async (username: string, password: string) => {
    const data = await authApi.register(username, password)
    localStorage.setItem('mc_token', data.token)
    setUser({ id: data.id, username: data.username, role: data.role, privilege: data.privilege })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('mc_token')
    setUser(null)
  }, [])

  return { user, loading, login, register, logout }
}
