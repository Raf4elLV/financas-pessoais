import { useState, useCallback } from 'react'
import { loadTransactions, saveTransactions } from '../utils/storage'

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState(() => loadTransactions(userId))

  const addTransaction = useCallback((tx) => {
    const newTx = {
      id: crypto.randomUUID(),
      notes: null,
      endDate: null,
      recurrenceDay: null,
      createdAt: new Date().toISOString(),
      ...tx,
      amount: parseFloat(tx.amount),
    }
    setTransactions(prev => {
      const next = [newTx, ...prev]
      saveTransactions(userId, next)
      return next
    })
    return newTx
  }, [userId])

  const updateTransaction = useCallback((id, updates) => {
    setTransactions(prev => {
      const next = prev.map(tx =>
        tx.id === id
          ? { ...tx, ...updates, amount: updates.amount !== undefined ? parseFloat(updates.amount) : tx.amount }
          : tx
      )
      saveTransactions(userId, next)
      return next
    })
  }, [userId])

  const removeTransaction = useCallback((id) => {
    setTransactions(prev => {
      const next = prev.filter(tx => tx.id !== id)
      saveTransactions(userId, next)
      return next
    })
  }, [userId])

  const endRecurrence = useCallback((id) => {
    const today = new Date().toISOString().split('T')[0]
    updateTransaction(id, { endDate: today })
  }, [updateTransaction])

  return { transactions, addTransaction, updateTransaction, removeTransaction, endRecurrence }
}
