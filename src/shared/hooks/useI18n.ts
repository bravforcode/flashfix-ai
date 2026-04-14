import { useStore } from '@/core/state/useStore'
import { TRANSLATIONS } from '@/shared/i18n/translations'

/**
 * Custom Hook for Internationalization
 * Provides access to the current language and its translations.
 */
export const useI18n = () => {
  const lang = useStore((state) => state.lang)
  const setLang = useStore((state) => state.setLang)
  
  const t = (key: keyof typeof TRANSLATIONS.th) => {
    return TRANSLATIONS[lang][key] || TRANSLATIONS.en[key] || key
  }

  return { t, lang, setLang }
}
