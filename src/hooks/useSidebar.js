import { useState } from 'react'

const STORAGE_KEY = 'fin_sidebar_open'

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (window.innerWidth < 1024) return false
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored !== null ? JSON.parse(stored) : true
    } catch {
      return true
    }
  })

  const toggle = () => setIsOpen(prev => {
    const next = !prev
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
    return next
  })

  const close = () => setIsOpen(false)

  return { isOpen, toggle, close }
}
