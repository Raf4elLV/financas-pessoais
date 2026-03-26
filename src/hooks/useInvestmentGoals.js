import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function fromRow(row) {
  return {
    id:                  row.id,
    name:                row.name,
    targetAmount:        parseFloat(row.target_amount),
    currentAmount:       parseFloat(row.current_amount),
    monthlyContribution: parseFloat(row.monthly_contribution),
    startDate:           row.start_date,
    createdAt:           row.created_at,
  }
}

export function useInvestmentGoals(userId) {
  const [goals, setGoals] = useState([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('investment_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => setGoals(data ? data.map(fromRow) : []))
  }, [userId])

  const addGoal = useCallback(async (goal) => {
    const newGoal = {
      id:                  crypto.randomUUID(),
      startDate:           new Date().toISOString().split('T')[0],
      createdAt:           new Date().toISOString(),
      ...goal,
      targetAmount:        parseFloat(goal.targetAmount),
      currentAmount:       parseFloat(goal.currentAmount || 0),
      monthlyContribution: parseFloat(goal.monthlyContribution),
    }
    setGoals(prev => [...prev, newGoal])
    const { error } = await supabase.from('investment_goals').insert({
      id:                   newGoal.id,
      user_id:              userId,
      name:                 newGoal.name,
      target_amount:        newGoal.targetAmount,
      current_amount:       newGoal.currentAmount,
      monthly_contribution: newGoal.monthlyContribution,
      start_date:           newGoal.startDate,
    })
    if (error) {
      console.error('Erro ao salvar meta:', error)
      setGoals(prev => prev.filter(g => g.id !== newGoal.id))
    }
    return newGoal
  }, [userId])

  const updateGoal = useCallback(async (id, updates) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g
      const u = { ...g, ...updates }
      if (updates.targetAmount        !== undefined) u.targetAmount        = parseFloat(updates.targetAmount)
      if (updates.currentAmount       !== undefined) u.currentAmount       = parseFloat(updates.currentAmount)
      if (updates.monthlyContribution !== undefined) u.monthlyContribution = parseFloat(updates.monthlyContribution)
      return u
    }))
    const patch = {}
    if (updates.name                !== undefined) patch.name                 = updates.name
    if (updates.targetAmount        !== undefined) patch.target_amount        = parseFloat(updates.targetAmount)
    if (updates.currentAmount       !== undefined) patch.current_amount       = parseFloat(updates.currentAmount)
    if (updates.monthlyContribution !== undefined) patch.monthly_contribution = parseFloat(updates.monthlyContribution)
    const { error } = await supabase.from('investment_goals').update(patch).eq('id', id).eq('user_id', userId)
    if (error) console.error('Erro ao atualizar meta:', error)
  }, [userId])

  const removeGoal = useCallback(async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    const { error } = await supabase.from('investment_goals').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('Erro ao remover meta:', error)
  }, [userId])

  return { goals, addGoal, updateGoal, removeGoal }
}
