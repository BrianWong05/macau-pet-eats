import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, User, Upload } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/contexts/AuthContext'

interface HomeHeaderProps {
  isScrolled: boolean
  onLoginClick: () => void
}

export function HomeHeader({ isScrolled, onLoginClick }: HomeHeaderProps) {
  const { t } = useTranslation()
  const { user, username, signOut } = useAuth()

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img 
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Logo" 
            className={`w-10 h-10 rounded-xl transition-all ${isScrolled ? '' : 'shadow-sm'}`}
          />
          <span className={`font-bold text-lg hidden sm:block ${isScrolled ? 'text-neutral-900' : 'text-neutral-900'}`}>
            {t('common.appName')}
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium hidden sm:block ${isScrolled ? 'text-neutral-700' : 'text-neutral-700'}`}>
                {username || user.email}
              </span>
              <Link
                to="/profile"
                className={`p-2 rounded-full shadow-sm hover:shadow-md transition-all ${isScrolled ? 'bg-white text-neutral-600 hover:text-primary-600' : 'bg-white/80 backdrop-blur-sm text-neutral-600 hover:text-primary-600'}`}
                title={t('profile.title') || 'Profile'}
              >
                <User size={20} />
              </Link>
              <button
                onClick={() => signOut()}
                className={`p-2 rounded-full shadow-sm hover:shadow-md transition-all ${isScrolled ? 'bg-white text-neutral-600 hover:text-red-600' : 'bg-white/80 backdrop-blur-sm text-neutral-600 hover:text-red-600'}`}
                title={t('auth.logout') || 'Logout'}
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all font-medium ${isScrolled ? 'bg-white text-neutral-700' : 'bg-white/80 backdrop-blur-sm text-neutral-700'}`}
            >
              <User size={18} />
              <span>{t('auth.login') || 'Login'}</span>
            </button>
          )}
          <Link
            to="/submit"
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all font-medium ${isScrolled ? 'bg-white text-neutral-700' : 'bg-white/80 backdrop-blur-sm text-neutral-700'}`}
          >
            <Upload size={18} />
            <span className="hidden sm:inline">{t('nav.submit')}</span>
          </Link>
          <div className={isScrolled ? '' : 'bg-white/80 backdrop-blur-sm rounded-lg'}>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  )
}
