import { useState, useCallback } from 'react'
import { loadGoals, saveGoals } from '../utils/storage'

export function useInvestmentGoals(userId) {
  const [goals, setGoals] = useState(() => loadGoals(userId))

  const addGoal = useCallback((goal) => {
    const newGoal = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      startDate: new Date().toISOString().split('T')[0],
      ...goal,
      targetAmount: parseFloat(goal.targetAmount),
      currentAmount: parseFloat(goal.currentAmount || 0),
      monthlyContribution: parseFloat(goal.monthlyContribution),
    }
    setGoals(prev => {
      const next = [...prev, newGoal]
      saveGoals(userId, next)
      return next
    })
    return newGoal
  }, [userId])

  const updateGoal = useCallback((id, updates) => {
    setGoals(prev => {
      const next = prev.map(g => {
        if (g.id !== id) return g
        const updated = { ...g, ...updates }
        if (updates.targetAmount !== undefined) updated.targetAmount = parseFloat(updates.targetAmount)
        if (updates.currentAmount !== undefined) updated.currentAmount = parseFloat(updates.currentAmount)
        if (updates.monthlyContribution !== undefined) updated.monthlyContribution = parseFloat(updates.monthlyContribution)
        return updated
      })
      saveGoals(userId, next)
      return next
    })
  }, [userId])

  const removeGoal = useCallback((id) => {
    setGoals(prev => {
      const next = prev.filter(g => g.id !== id)
      saveGoals(userId, next)
      return next
    })
  }, [userId])

  return { goals, addGoal, updateGoal, removeGoal }
}
