'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: string
  department?: string
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      fetchUser(savedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await axios.get('http://localhost:8001/users/me', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      localStorage.removeItem('token')
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login with:', username)
      const response = await axios.post('http://localhost:8001/login', {
        username,
        password
      })
      
      console.log('Login response:', response.data)
      const { access_token } = response.data
      setToken(access_token)
      localStorage.setItem('token', access_token)
      
      await fetchUser(access_token)
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        if (error.response.status === 401) {
          throw new Error('Invalid username or password')
        } else if (error.response.status === 500) {
          throw new Error('Server error. Please try again later.')
        }
      } else if (error.request) {
        console.error('No response received:', error.request)
        throw new Error('Cannot connect to server. Please check your connection.')
      } else {
        console.error('Request error:', error.message)
        throw new Error('Login failed. Please try again.')
      }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
