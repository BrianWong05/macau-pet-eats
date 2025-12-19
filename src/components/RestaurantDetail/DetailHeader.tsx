import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, LogOut, User, Upload } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

interface DetailHeaderProps {
  isScrolled: boolean
  onLoginClick: () => void
}

export function DetailHeader({ isScrolled, onLoginClick }: DetailHeaderProps) {
  const { t } = useTranslation(['restaurant', 'common', 'profile', 'auth'])
  const { user, username, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isScrolled ? 'text-neutral-600 hover:bg-neutral-100' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
        >
          <ArrowLeft size={20} />
          <span className="font-medium hidden sm:block">{t('restaurant:backToList')}</span>
        </button>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <span className={`text-sm font-medium hidden sm:block ${isScrolled ? 'text-neutral-700' : 'text-white drop-shadow-md'}`}>
                {username || user.email}
              </span>
              <Link
                to="/profile"
                className={`p-2 rounded-full transition-all ${isScrolled ? 'bg-white shadow-sm text-neutral-600 hover:text-primary-600' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
                title={t('profile:title') || 'Profile'}
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => signOut()}
                className={`p-2 rounded-full transition-all ${isScrolled ? 'bg-white shadow-sm text-neutral-600 hover:text-red-600' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
                title={t('auth:logout') || 'Logout'}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all font-medium ${isScrolled ? 'bg-white text-neutral-700' : 'bg-white/90 backdrop-blur-sm text-neutral-700'}`}
            >
              <User size={18} />
              <span>{t('auth:login') || 'Login'}</span>
            </button>
          )}
          <Link
            to="/submit"
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all font-medium ${isScrolled ? 'bg-white text-neutral-700' : 'bg-white/90 backdrop-blur-sm text-neutral-700'}`}
          >
            <Upload size={18} />
            <span className="hidden sm:inline">{t('common:nav.submit')}</span>
          </Link>
          <div className={isScrolled ? '' : 'bg-white/20 backdrop-blur-sm rounded-lg'}>
             <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
