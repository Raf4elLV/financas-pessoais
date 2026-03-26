import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Local state: Set of "txId_yearMonth" strings
function makeKey(txId, yearMonth) { return `${txId}_${yearMonth}` }

export function usePaymentStatus(userId) {
  const [paidKeys, setPaidKeys] = useState(new Set())

  useEffect(() => {
    if (!userId) return
    supabase
      .from('payment_status')
      .select('transaction_id, year_month')
      .eq('user_id', userId)
      .then(({ data }) => {
        if (data) {
          setPaidKeys(new Set(data.map(r => makeKey(r.transaction_id, r.year_month))))
        }
      })
  }, [userId])

  const toggle = useCallback(async (txId, yearMonth) => {
    const key = makeKey(txId, yearMonth)
    const wasP = paidKeys.has(key)

    // Optimistic
    setPaidKeys(prev => {
      const next = new Set(prev)
      if (wasP) next.delete(key)
      else next.add(key)
      return next
    })

    if (wasP) {
      const { error } = await supabase
        .from('payment_status')
        .delete()
        .eq('user_id', userId)
        .eq('transaction_id', txId)
        .eq('year_month', yearMonth)
      if (error) {
        console.error('Erro ao desmarcar pagamento:', error)
        setPaidKeys(prev => { const n = new Set(prev); n.add(key); return n })
      }
    } else {
      const { error } = await supabase
        .from('payment_status')
        .insert({ user_id: userId, transaction_id: txId, year_month: yearMonth })
      if (error) {
        console.error('Erro ao marcar pagamento:', error)
        setPaidKeys(prev => { const n = new Set(prev); n.delete(key); return n })
      }
    }
  }, [userId, paidKeys])

  const isPaid = useCallback((txId, yearMonth) => {
    return paidKeys.has(makeKey(txId, yearMonth))
  }, [paidKeys])

  return { isPaid, toggle }
}
