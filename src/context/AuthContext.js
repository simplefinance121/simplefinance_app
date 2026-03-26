import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (userData, tokenValue) => {
    setUser(userData)
    setToken(tokenValue)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
  }

  // Save/load remembered credentials
  const saveCredentials = async (email, password) => {
    await AsyncStorage.setItem('remembered_email', email)
    await AsyncStorage.setItem('remembered_password', password)
    await AsyncStorage.setItem('remember_me', 'true')
  }

  const clearCredentials = async () => {
    await AsyncStorage.removeItem('remembered_email')
    await AsyncStorage.removeItem('remembered_password')
    await AsyncStorage.setItem('remember_me', 'false')
  }

  const getRememberedCredentials = async () => {
    const rememberMe = await AsyncStorage.getItem('remember_me')
    if (rememberMe !== 'true') return null
    const email = await AsyncStorage.getItem('remembered_email')
    const password = await AsyncStorage.getItem('remembered_password')
    if (email && password) return { email, password }
    return null
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout, updateUser,
      saveCredentials, clearCredentials, getRememberedCredentials,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
