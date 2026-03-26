import { useState } from 'react'
import { Wallet, KeyRound } from 'lucide-react'
import PasswordInput from '../UI/PasswordInput'
import PasswordRequirements from '../UI/PasswordRequirements'

export default function ResetPasswordScreen({ onResetPassword }) {
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [error,     setError]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [done,      setDone]      = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6)   { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (password !== confirm)  { setError('As senhas não coincidem.'); return }
    setError('')
    setLoading(true)
    const result = await onResetPassword(password)
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setDone(true)
  }

  return (
    <div className="min-h-screen bg-earth-50 dark:bg-earth-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-earth-500 flex items-center justify-center mb-3">
            <Wallet size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100 tracking-tight">Nova senha</h1>
          <p className="text-sm text-earth-400 dark:text-earth-500 mt-1">Escolha uma senha forte</p>
        </div>

        <div className="bg-white dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 p-6 shadow-sm">
          {done ? (
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <KeyRound size={26} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-earth-800 dark:text-earth-100">Senha alterada!</p>
              <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed">
                Sua senha foi redefinida com sucesso. Você já pode usar o aplicativo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-earth-600 dark:text-earth-400 mb-1">Nova senha</label>
                <PasswordInput
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoFocus
                />
                <PasswordRequirements value={password} />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth-600 dark:text-earth-400 mb-1">Confirmar senha</label>
                <PasswordInput
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repita a senha"
                />
                <PasswordRequirements value={password} confirmValue={confirm} showConfirm />
              </div>
              {error && (
                <p className="text-xs text-negative dark:text-negative-dark bg-negative-light dark:bg-negative-darkbg px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading || password.length < 6 || password !== confirm}
                className="w-full py-2.5 text-sm font-medium text-white bg-earth-500 hover:bg-earth-600 disabled:opacity-60 rounded-xl transition-colors"
              >
                {loading ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
