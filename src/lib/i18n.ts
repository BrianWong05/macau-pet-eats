import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh',
    supportedLngs: ['zh', 'en', 'pt'],
    
    // Load 'common' namespace by default (buttons, nav, errors)
    defaultNS: 'common',
    
    // All available namespaces (loaded on-demand)
    ns: [
      'common',
      'home',
      'explore',
      'search',
      'restaurant',
      'submit',
      'profile',
      'admin',
      'auth',
      'feedback'
    ],
    
    backend: {
      // Load from public/locales/{lng}/{namespace}.json
      loadPath: `${import.meta.env.BASE_URL}locales/{{lng}}/{{ns}}.json`,
    },
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'macau-pet-eats-lang',
    },
    
    react: {
      useSuspense: true, // Use Suspense for loading states
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
