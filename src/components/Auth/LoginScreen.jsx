import { useState } from 'react'
import { Wallet, Sun, Moon } from 'lucide-react'
import PasswordInput from '../UI/PasswordInput'

const INPUT_CLASS = 'w-full px-3.5 py-2.5 text-sm rounded-xl border border-earth-200 dark:border-earth-600 bg-earth-50 dark:bg-earth-700 text-earth-800 dark:text-earth-100 placeholder-earth-400 focus:outline-none focus:border-earth-400 dark:focus:border-earth-500 transition-colors'

export default function LoginScreen({ onLogin, onGoToRegister, onGoToForgotPassword }) {
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)

  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  function toggleTheme() {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await onLogin({ email, password })
    setLoading(false)
    if (!result.ok) setError(result.error)
  }

  return (
    <div className="min-h-screen relative bg-earth-50 dark:bg-earth-900 flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
        title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-earth-500 flex items-center justify-center mb-3">
            <Wallet size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100 tracking-tight">Finanças Pessoais</h1>
          <p className="text-sm text-earth-400 dark:text-earth-500 mt-1">Bem-vindo de volta</p>
        </div>

        <div className="bg-white dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-earth-600 dark:text-earth-400 mb-1">E-mail</label>
              <input
                className={INPUT_CLASS}
                type="email"
                name="email"
                autoComplete="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-earth-600 dark:text-earth-400">Senha</label>
                <button
                  type="button"
                  onClick={onGoToForgotPassword}
                  className="text-xs text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <PasswordInput
                className={INPUT_CLASS}
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-negative dark:text-negative-dark bg-negative-light dark:bg-negative-darkbg px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white bg-earth-500 hover:bg-earth-600 disabled:opacity-60 rounded-xl transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-xs text-earth-400 dark:text-earth-500 mt-5">
            Não tem conta?{' '}
            <button onClick={onGoToRegister} className="text-earth-600 dark:text-earth-300 font-medium hover:underline">
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
