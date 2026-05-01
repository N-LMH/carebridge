import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Locale } from '@/types'

const STORAGE_KEY = 'carebridge-locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'zh' || saved === 'en') return saved

  return 'zh'
}

export const useLocaleStore = defineStore('locale', () => {
  const locale = ref<Locale>(getInitialLocale())

  watch(locale, (value) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, value)
    }
  })

  function setLocale(value: Locale) {
    locale.value = value
  }

  function toggleLocale() {
    locale.value = locale.value === 'zh' ? 'en' : 'zh'
  }

  return {
    locale,
    setLocale,
    toggleLocale
  }
})
