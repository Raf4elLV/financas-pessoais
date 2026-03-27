import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// camelCase ↔ snake_case
function toRow(tx, userId) {
  return {
    id:                tx.id,
    user_id:           userId,
    description:       tx.description,
    amount:            tx.amount,
    type:              tx.type,
    category_id:       tx.categoryId    || null,
    date:              tx.date,
    recurrent:         tx.recurrent     || false,
    recurrence_day:    tx.recurrenceDay || null,
    installments:      tx.installments  || null,
    installment_index: tx.installmentIndex || null,
    end_date:          tx.endDate       || null,
    notes:             tx.notes         || null,
    paid:              tx.paid          || false,
  }
}

function fromRow(row) {
  return {
    id:               row.id,
    description:      row.description,
    amount:           parseFloat(row.amount),
    type:             row.type,
    categoryId:       row.category_id       || null,
    date:             row.date,
    recurrent:        row.recurrent         || false,
    recurrenceDay:    row.recurrence_day    || null,
    installments:     row.installments      || null,
    installmentIndex: row.installment_index || null,
    endDate:          row.end_date          || null,
    notes:            row.notes             || null,
    paid:             row.paid              || false,
    createdAt:        row.created_at,
  }
}

export function useTransactions(userId) {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setTransactions(data ? data.map(fromRow) : [])
        setLoading(false)
      })
  }, [userId])

  const addTransaction = useCallback(async (tx) => {
    const newTx = {
      id:        crypto.randomUUID(),
      notes:     null,
      endDate:   null,
      recurrenceDay: null,
      createdAt: new Date().toISOString(),
      ...tx,
      amount: parseFloat(tx.amount),
    }
    // Optimistic update
    setTransactions(prev => [newTx, ...prev])
    const { error } = await supabase.from('transactions').insert(toRow(newTx, userId))
    if (error) {
      console.error('Erro ao salvar transação:', error)
      setTransactions(prev => prev.filter(t => t.id !== newTx.id))
    }
    return newTx
  }, [userId])

  const updateTransaction = useCallback(async (id, updates) => {
    setTransactions(prev => prev.map(tx =>
      tx.id === id
        ? { ...tx, ...updates, amount: updates.amount !== undefined ? parseFloat(updates.amount) : tx.amount }
        : tx
    ))
    const patch = {}
    if (updates.description       !== undefined) patch.description       = updates.description
    if (updates.amount            !== undefined) patch.amount            = parseFloat(updates.amount)
    if (updates.type              !== undefined) patch.type              = updates.type
    if (updates.categoryId        !== undefined) patch.category_id       = updates.categoryId
    if (updates.date              !== undefined) patch.date              = updates.date
    if (updates.recurrent         !== undefined) patch.recurrent         = updates.recurrent
    if (updates.recurrenceDay     !== undefined) patch.recurrence_day    = updates.recurrenceDay
    if (updates.installments      !== undefined) patch.installments      = updates.installments
    if (updates.installmentIndex  !== undefined) patch.installment_index = updates.installmentIndex
    if (updates.endDate           !== undefined) patch.end_date          = updates.endDate
    if (updates.notes             !== undefined) patch.notes             = updates.notes
    if (updates.paid              !== undefined) patch.paid              = updates.paid
    const { error } = await supabase.from('transactions').update(patch).eq('id', id).eq('user_id', userId)
    if (error) console.error('Erro ao atualizar transação:', error)
  }, [userId])

  const removeTransaction = useCallback(async (id) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id))
    const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('Erro ao remover transação:', error)
  }, [userId])

  const endRecurrence = useCallback(async (id) => {
    const today = new Date().toISOString().split('T')[0]
    await updateTransaction(id, { endDate: today })
  }, [updateTransaction])

  const togglePaid = useCallback(async (id) => {
    const tx = transactions.find(t => t.id === id)
    if (!tx) return
    const newPaid = !tx.paid
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, paid: newPaid } : t))
    const { error } = await supabase.from('transactions').update({ paid: newPaid }).eq('id', id).eq('user_id', userId)
    if (error) {
      console.error('Erro ao atualizar status de pagamento:', error)
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, paid: !newPaid } : t))
    }
  }, [transactions, userId])

  return { transactions, loading, addTransaction, updateTransaction, removeTransaction, endRecurrence, togglePaid }
}
