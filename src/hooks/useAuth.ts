import { useState, useEffect, useCallback } from 'react'
import { getUser, setAuth, clearAuth } from '@/lib/auth'
import api from '@/lib/api'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser().then(u => { setUser(u); setLoading(false) })
  }, [])

  const login = useCallback(async (loginVal: string, password: string) => {
    const res = await api.post('/api/auth/login', { login: loginVal, password })
    await setAuth(res.data.token, res.data.user)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const register = useCallback(async (data: any) => {
    const res = await api.post('/api/auth/register', data)
    await setAuth(res.data.token, res.data.user)
    setUser(res.data.user)
    return res.data.user
  }, [])

  const logout = useCallback(async () => {
    await clearAuth()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me')
      const u = res.data
      const { SecureStore } = await import('expo-secure-store')
      await SecureStore.setItemAsync('td_user', JSON.stringify(u))
      setUser(u)
    } catch {}
  }, [])

  return { user, loading, login, register, logout, refreshUser, isLoggedIn: !!user }
}
