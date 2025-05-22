'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { makeGet } from '@/lib/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token')

      if (savedToken) {
        try {
          const res = await makeGet('/auth/me')
          console.log(res)
          if (!res) throw new Error('Token invalid')

          const data = res
          setUser(data.user)
          setToken(savedToken)
        } catch (err) {
          console.error('Auth error:', err)
          logout() // Clear everything if token invalid
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (user, token) => {
    setUser(user)
    setToken(token)
    localStorage.setItem('token', token)
    localStorage.setItem('who', user.role)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
