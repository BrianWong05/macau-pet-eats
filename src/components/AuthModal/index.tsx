import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMode = 'login' | 'signup'

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { t } = useTranslation(['auth', 'common'])
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
    // Redirect happens automatically
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const authFn = mode === 'login' ? signInWithEmail : signUpWithEmail
    const { error } = await authFn(email, password)

    if (error) {
      setError(error.message)
      setIsLoading(false)
    } else {
      onClose()
    }
  }

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setError(null)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
          aria-label={t('common:close')}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">
            {mode === 'login' ? t('auth:loginTitle') : t('auth:signupTitle')}
          </h2>
          <p className="text-neutral-500 mt-1">
            {mode === 'login' ? t('auth:loginSubtitle') : t('auth:signupSubtitle')}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-700 rounded-xl text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-neutral-200 rounded-xl font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>{t('auth:continueWithGoogle')}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-sm text-neutral-400">{t('auth:or')}</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">{t('auth:email')}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth:emailPlaceholder')}
                required
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">{t('auth:password')}</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth:passwordPlaceholder')}
                required
                minLength={6}
                className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold rounded-xl transition-colors"
          >
            {isLoading 
              ? t('common:loading')
              : mode === 'login' ? t('auth:loginButton') : t('auth:signupButton')
            }
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center mt-6 text-sm text-neutral-600">
          {mode === 'login' ? t('auth:noAccount') : t('auth:hasAccount')}{' '}
          <button
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            {mode === 'login' ? t('auth:signupLink') : t('auth:loginLink')}
          </button>
        </p>
      </div>
    </div>
  )
}
