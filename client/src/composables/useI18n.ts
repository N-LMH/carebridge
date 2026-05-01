import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { translateMessage } from '@/i18n/messages'
import type { Locale } from '@/types'

export function useI18n() {
  const localeStore = useLocaleStore()

  const locale = computed(() => localeStore.locale)
  const isEnglish = computed(() => localeStore.locale === 'en')

  function t(path: string, params?: Record<string, string | number>) {
    return translateMessage(path, localeStore.locale as Locale, params)
  }

  return {
    locale,
    isEnglish,
    setLocale: localeStore.setLocale,
    toggleLocale: localeStore.toggleLocale,
    t
  }
}
