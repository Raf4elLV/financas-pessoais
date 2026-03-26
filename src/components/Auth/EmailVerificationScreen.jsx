import { Mail, Wallet } from 'lucide-react'

export default function EmailVerificationScreen({ email, onGoToLogin }) {
  return (
    <div className="min-h-screen bg-earth-50 dark:bg-earth-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-earth-500 flex items-center justify-center mb-3">
            <Wallet size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100 tracking-tight">Confirme seu e-mail</h1>
        </div>

        <div className="bg-white dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 p-6 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-earth-100 dark:bg-earth-700 flex items-center justify-center">
            <Mail size={26} className="text-earth-500 dark:text-earth-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-earth-800 dark:text-earth-100">Verifique sua caixa de entrada</p>
            <p className="text-xs text-earth-500 dark:text-earth-400 mt-1.5 leading-relaxed">
              Enviamos um link de confirmação para{' '}
              <span className="font-medium text-earth-700 dark:text-earth-300">{email}</span>.
              Clique no link para ativar sua conta.
            </p>
          </div>
          <p className="text-xs text-earth-400 dark:text-earth-500 leading-relaxed">
            Depois de confirmar, volte aqui e faça login normalmente.
          </p>
          <button
            onClick={onGoToLogin}
            className="w-full py-2.5 text-sm font-medium text-white bg-earth-500 hover:bg-earth-600 rounded-xl transition-colors"
          >
            Ir para o login
          </button>
        </div>
      </div>
    </div>
  )
}
