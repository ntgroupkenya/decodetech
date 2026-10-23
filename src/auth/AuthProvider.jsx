import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { AuthContext } from './AuthContext'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    api('/auth/me')
      .then((data) => !cancelled && setUser(data.user))
      .catch(() => {})
      .finally(() => !cancelled && setReady(true))
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await api('/auth/login', { method: 'POST', body: { username, password } })
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (fields) => {
    const data = await api('/auth/signup', { method: 'POST', body: fields })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST', body: {} })
    } catch {
      // session may already be gone
    }
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, ready, login, signup, logout, setUser }), [user, ready, login, signup, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
