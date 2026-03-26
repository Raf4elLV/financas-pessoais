import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-earth-900/40 dark:bg-earth-900/60 backdrop-blur-sm" />
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-earth-800 rounded-2xl shadow-xl border border-earth-200 dark:border-earth-700 overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-earth-100 dark:border-earth-700">
          <h2 className="text-base font-semibold text-earth-800 dark:text-earth-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
