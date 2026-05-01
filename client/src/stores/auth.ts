import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/services/api'
import type { User } from '@/types'

function readStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('carebridge_token')
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(readStoredToken())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  let initPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isDoctor = computed(() => user.value?.role === 'doctor')
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const response = await api.login(username, password)
      token.value = response.token
      user.value = response.user
      initialized.value = true
      window.localStorage.setItem('carebridge_token', response.token)
      return response.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      error.value = message
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    initialized.value = true
    window.localStorage.removeItem('carebridge_token')
  }

  async function checkAuth() {
    if (!token.value) {
      initialized.value = true
      return
    }

    try {
      const response = await api.getMe()
      user.value = response.user
    } catch {
      logout()
      return
    }

    initialized.value = true
  }

  async function ensureInitialized() {
    if (initialized.value) return

    if (!initPromise) {
      initPromise = checkAuth().finally(() => {
        initialized.value = true
        initPromise = null
      })
    }

    await initPromise
  }

  return {
    user,
    token,
    loading,
    error,
    initialized,
    isAuthenticated,
    isDoctor,
    isAdmin,
    login,
    logout,
    checkAuth,
    ensureInitialized
  }
})
