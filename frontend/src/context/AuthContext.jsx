import { useEffect, useMemo, useState } from 'react'
import api from '../api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('access_token')))

  useEffect(() => {
    if (!localStorage.getItem('access_token')) return
    let active = true
    api.get('/users/me')
      .then(({ data }) => { if (active) setUser(data) })
      .catch(() => {
        localStorage.removeItem('access_token')
        if (active) setUser(null)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function login(email, password) {
    const body = new URLSearchParams({ username: email, password })
    const { data } = await api.post('/auth/login', body, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    localStorage.setItem('access_token', data.access_token)
    try {
      const profile = await api.get('/users/me')
      setUser(profile.data)
      return profile.data
    } catch (error) {
      localStorage.removeItem('access_token')
      throw error
    }
  }

  async function register({ email, username, password }) {
    await api.post('/auth/register', { email, username, password })
    return login(email, password)
  }

  function logout() {
    localStorage.removeItem('access_token')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
