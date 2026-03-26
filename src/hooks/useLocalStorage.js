import { useState, useCallback } from 'react'

export function useLocalStorage(key, defaultValue, loadFn, saveFn) {
  const [value, setValue] = useState(() => {
    const stored = loadFn()
    return stored !== null ? stored : defaultValue
  })

  const set = useCallback((newValue) => {
    const resolved = typeof newValue === 'function' ? newValue(value) : newValue
    setValue(resolved)
    saveFn(resolved)
  }, [value, saveFn])

  return [value, set]
}
