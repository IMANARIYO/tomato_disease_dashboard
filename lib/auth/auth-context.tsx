"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User, AuthResponse, LoginCredentials, SignupCredentials } from "@/types"
import apiClient from "@/lib/api/axios"
import { toast } from "react-hot-toast"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => void
  hasRole: (roles: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth on mount
    const storedToken = localStorage.getItem("access_token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/login", credentials)
      const { access_token, user: userData } = response.data.data

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("user", JSON.stringify(userData))

      setToken(access_token)
      setUser(userData)

      toast.success("Login successful!")
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      throw error
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/signup", credentials)
      const { access_token, user: userData } = response.data.data

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("user", JSON.stringify(userData))

      setToken(access_token)
      setUser(userData)

      toast.success("Account created successfully!")
    } catch (error: any) {
      const message = error.response?.data?.message || "Signup failed"
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    toast.success("Logged out successfully")
  }

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(user.role)
  }

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    signup,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
