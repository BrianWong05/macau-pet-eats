import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import zhTranslation from '@/locales/zh/translation.json'
import enTranslation from '@/locales/en/translation.json'
import ptTranslation from '@/locales/pt/translation.json'

const resources = {
  zh: { translation: zhTranslation },
  en: { translation: enTranslation },
  pt: { translation: ptTranslation },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'zh', // Traditional Chinese as default
    lng: 'zh', // Default language
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'macau-pet-eats-lang',
    },
  })

export default i18n

// Export supported languages (without flags)
export const supportedLanguages = [
  { code: 'zh', name: '繁體中文' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
] as const

export type SupportedLanguage = typeof supportedLanguages[number]['code']
