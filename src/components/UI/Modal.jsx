import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  // Fecha com Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  /*
   * iOS Safari ignora overflow:hidden no body para bloquear o scroll.
   * A solução compatível é fixar o body com position:fixed e compensar
   * a posição do scroll para evitar que a página "pule" para o topo.
   */
  useEffect(() => {
    if (!isOpen) return
    const scrollY = window.scrollY
    const body = document.body
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.width = ''
      body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-earth-900/40 dark:bg-earth-900/60 backdrop-blur-sm" />
      <div className={`
        relative w-full ${sizes[size]}
        bg-white dark:bg-earth-800
        rounded-t-2xl sm:rounded-2xl
        shadow-xl border border-earth-200 dark:border-earth-700
        overflow-hidden
        flex flex-col
        max-h-[92svh] max-h-[92vh]
      `}>
        {/* Cabeçalho fixo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-earth-100 dark:border-earth-700 shrink-0">
          <h2 className="text-base font-semibold text-earth-800 dark:text-earth-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-1 rounded-xl text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        {/* Conteúdo rolável — necessário quando o teclado virtual reduz a viewport no iOS */}
        <div className="px-5 py-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
