import { useState, useCallback } from 'react'
import { loadPaymentStatus, savePaymentStatus } from '../utils/storage'

export function usePaymentStatus(userId) {
  const [status, setStatus] = useState(() => loadPaymentStatus(userId))

  const toggle = useCallback((txId, yearMonth) => {
    const key = `${txId}_${yearMonth}`
    setStatus(prev => {
      const next = { ...prev, [key]: !prev[key] }
      savePaymentStatus(userId, next)
      return next
    })
  }, [userId])

  const isPaid = useCallback((txId, yearMonth) => {
    return !!status[`${txId}_${yearMonth}`]
  }, [status])

  return { isPaid, toggle }
}
