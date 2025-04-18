import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from './ValidateLogin'  // đường dẫn tới file authService

// 1. Tạo Context
const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser())

  // Sync khi storage thay đổi (ví dụ user đăng nhập từ tab khác)
  useEffect(() => {
    const handleStorage = () => setUser(authService.getCurrentUser())
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const login = async (...args) => {
    const result = await authService.login(...args)
    if (result.success) setUser(authService.getCurrentUser())
    return result
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 2. Custom Hook
export const useAuth = () => {
  return useContext(AuthContext)
}