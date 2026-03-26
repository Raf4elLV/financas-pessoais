import { useState, useCallback } from 'react'
import { loadBesteiras, saveBesteiras } from '../utils/storage'

export function useBesteiras(userId) {
  const [config, setConfig] = useState(() => loadBesteiras(userId))

  const saveConfig = useCallback((newConfig) => {
    setConfig(newConfig)
    saveBesteiras(userId, newConfig)
  }, [userId])

  const clearConfig = useCallback(() => {
    setConfig(null)
    saveBesteiras(userId, null)
  }, [userId])

  return { config, saveConfig, clearConfig }
}
