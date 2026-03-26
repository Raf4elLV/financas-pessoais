import { Check, X } from 'lucide-react'

function Req({ met, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-positive dark:text-positive-dark' : 'text-earth-400 dark:text-earth-500'}`}>
      {met ? <Check size={11} className="shrink-0" /> : <X size={11} className="shrink-0" />}
      <span>{text}</span>
    </div>
  )
}

/**
 * Mostra requisitos abaixo de campos de senha.
 *
 * Modo padrão (showConfirm=false): exibe "No mínimo 6 caracteres"
 * Modo confirmação (showConfirm=true): exibe "Senhas coincidem" quando confirmValue tem conteúdo
 */
export default function PasswordRequirements({ value = '', confirmValue, showConfirm = false }) {
  if (showConfirm) {
    if (typeof confirmValue !== 'string' || confirmValue.length === 0) return null
    return (
      <div className="mt-1.5">
        <Req met={value === confirmValue} text="Senhas coincidem" />
      </div>
    )
  }

  return (
    <div className="mt-1.5">
      <Req met={value.length >= 6} text="No mínimo 6 caracteres" />
    </div>
  )
}
