import { useState } from 'react'
import { Wallet, ArrowLeft, Mail } from 'lucide-react'

const INPUT_CLASS = 'w-full px-3.5 py-2.5 text-sm rounded-xl border border-earth-200 dark:border-earth-600 bg-earth-50 dark:bg-earth-700 text-earth-800 dark:text-earth-100 placeholder-earth-400 focus:outline-none focus:border-earth-400 dark:focus:border-earth-500 transition-colors'

export default function ForgotPasswordScreen({ onForgotPassword, onGoToLogin }) {
  const [email,   setEmail]   = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await onForgotPassword(email)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-earth-50 dark:bg-earth-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-earth-500 flex items-center justify-center mb-3">
            <Wallet size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100 tracking-tight">Recuperar senha</h1>
          <p className="text-sm text-earth-400 dark:text-earth-500 mt-1">
            {sent ? 'Verifique seu e-mail' : 'Enviaremos um link de redefinição'}
          </p>
        </div>

        <div className="bg-white dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 p-6 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Mail size={26} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-earth-800 dark:text-earth-100">E-mail enviado!</p>
                <p className="text-xs text-earth-500 dark:text-earth-400 mt-1 leading-relaxed">
                  Enviamos um link para <span className="font-medium">{email}</span>. Clique no link para redefinir sua senha.
                </p>
              </div>
              <p className="text-xs text-earth-400 dark:text-earth-500">
                Não recebeu?{' '}
                <button onClick={() => setSent(false)} className="text-earth-600 dark:text-earth-300 font-medium hover:underline">
                  Tentar novamente
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-earth-600 dark:text-earth-400 mb-1">E-mail</label>
                <input
                  className={INPUT_CLASS}
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
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
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
          )}

          <button
            onClick={onGoToLogin}
            className="flex items-center justify-center gap-1.5 w-full mt-4 text-xs text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
          >
            <ArrowLeft size={12} /> Voltar ao login
          </button>
        </div>
      </div>
    </div>
  )
}
