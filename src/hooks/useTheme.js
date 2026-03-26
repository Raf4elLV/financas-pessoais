import { useState, useEffect } from 'react'
import { loadSettings, saveSettings } from '../utils/storage'

export function useTheme(userId) {
  const [theme, setTheme] = useState(() => loadSettings(userId).theme || 'light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    saveSettings(userId, { theme })
  }, [theme, userId])

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return { theme, toggleTheme }
}
