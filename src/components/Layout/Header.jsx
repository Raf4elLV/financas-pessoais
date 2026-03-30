import { Sun, Moon, Wallet, LogOut, Menu } from 'lucide-react'
import AvatarDisplay from '../Auth/AvatarDisplay'

export default function Header({ theme, toggleTheme, currentUser, logout, onMenuToggle, onOpenProfile }) {
  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-4 border-b border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-900 shrink-0">
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={onMenuToggle}
          className="p-2.5 rounded-xl text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 active:bg-earth-100 dark:active:bg-earth-800 transition-colors"
          title="Alternar menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <div className="w-7 h-7 rounded-lg bg-earth-500 flex items-center justify-center">
            <Wallet size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-earth-800 dark:text-earth-100 tracking-tight hidden sm:block">
            Finanças Pessoais
          </span>
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {currentUser && (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-800 active:bg-earth-100 dark:active:bg-earth-800 transition-colors"
            title="Meu perfil"
          >
            <AvatarDisplay user={currentUser} size={28} />
            <span className="text-xs font-medium text-earth-700 dark:text-earth-300 hidden sm:block">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        )}

        <button
          id="btn-toggle-theme"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 active:bg-earth-100 dark:active:bg-earth-800 transition-colors"
          title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {logout && (
          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-earth-400 hover:text-negative dark:hover:text-negative-dark hover:bg-earth-100 dark:hover:bg-earth-800 active:bg-earth-100 dark:active:bg-earth-800 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  )
}
