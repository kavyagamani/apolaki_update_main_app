import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import api from '../services/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const sessionToken = ref(localStorage.getItem('sessionToken') || null)
  const loading = ref(false)
  const error = ref(null)
  const connectedProviders = ref([])

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'customer')

  const hasRole = (...roles) => roles.includes(userRole.value)

  const login = async (email, password) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/login', { email, password })
      setAuthTokens(response.data)
      user.value = response.data.user
      connectedProviders.value = response.data.user.providers || []
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  const signup = async (email, password, firstName, lastName, phone) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        firstName,
        lastName,
        phone
      })
      setAuthTokens(response.data)
      user.value = response.data.user
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Signup failed'
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      user.value = null
      token.value = null
      refreshToken.value = null
      sessionToken.value = null
      connectedProviders.value = []
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('sessionToken')
      localStorage.removeItem('user')
    }
  }

  const setAuthTokens = (authData) => {
    token.value = authData.token
    refreshToken.value = authData.refreshToken
    sessionToken.value = authData.sessionToken
    localStorage.setItem('token', authData.token)
    localStorage.setItem('refreshToken', authData.refreshToken)
    localStorage.setItem('sessionToken', authData.sessionToken)
    if (authData.user) {
      localStorage.setItem('user', JSON.stringify(authData.user))
    }
  }

  const refreshAuthToken = async () => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })
      setAuthTokens(response.data)
      return true
    } catch (err) {
      error.value = 'Session expired. Please log in again.'
      await logout()
      return false
    }
  }

  const getProfile = async () => {
    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
      connectedProviders.value = response.data.user.providers || []
      return response.data.user
    } catch (err) {
      error.value = 'Failed to fetch profile'
      return null
    }
  }

  const disconnectProvider = async (provider) => {
    try {
      await api.delete(`/auth/providers/${provider}`)
      connectedProviders.value = connectedProviders.value.filter(p => p.provider !== provider)
      return true
    } catch (err) {
      error.value = `Failed to disconnect ${provider}`
      return false
    }
  }

  const restoreSession = () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      user.value = JSON.parse(storedUser)
    }
  }

  const handleOAuthCallback = async (params) => {
    const { token: newToken, refreshToken: newRefreshToken, sessionToken: newSessionToken } = params
    if (newToken) {
      token.value = newToken
      refreshToken.value = newRefreshToken
      sessionToken.value = newSessionToken
      localStorage.setItem('token', newToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      localStorage.setItem('sessionToken', newSessionToken)
      await getProfile()
      return true
    }
    return false
  }

  const verifyOtp = async (email, otp) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/verify-otp', { email, otp })
      setAuthTokens(response.data)
      user.value = response.data.user
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'OTP verification failed'
      return false
    } finally {
      loading.value = false
    }
  }

  const sendWhatsAppOtp = async (phone) => {
    loading.value = true
    error.value = null
    try {
      await api.post('/auth/whatsapp/send-otp', { phone })
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to send WhatsApp OTP'
      return false
    } finally {
      loading.value = false
    }
  }

  const verifyWhatsAppOtp = async (phone, otp) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.post('/auth/whatsapp/verify-otp', { phone, otp })
      setAuthTokens(response.data)
      user.value = response.data.user
      connectedProviders.value = response.data.user?.providers || []
      return true
    } catch (err) {
      error.value = err.response?.data?.error || 'WhatsApp OTP verification failed'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    refreshToken,
    sessionToken,
    loading,
    error,
    isAuthenticated,
    userRole,
    hasRole,
    connectedProviders,
    login,
    signup,
    logout,
    getProfile,
    disconnectProvider,
    refreshAuthToken,
    setAuthTokens,
    restoreSession,
    handleOAuthCallback,
    verifyOtp,
    sendWhatsAppOtp,
    verifyWhatsAppOtp
  }
})

