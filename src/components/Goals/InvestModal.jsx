import { useState, useEffect } from 'react'
import Modal from '../UI/Modal'
import CurrencyInput from '../UI/CurrencyInput'
import { formatCurrency } from '../../utils/formatters'
import { calcGoalProgress } from '../../utils/calculations'
import { LABEL_CLASS, BTN_PRIMARY, BTN_SECONDARY } from '../../utils/ui'

export default function InvestModal({ isOpen, onClose, goal, onConfirm }) {
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    if (isOpen) setAmount(0)
  }, [isOpen])

  if (!goal) return null

  const { progressPct } = calcGoalProgress(goal)
  const newAmount = goal.currentAmount + amount
  const newPct = goal.targetAmount > 0 ? Math.min(100, (newAmount / goal.targetAmount) * 100) : 0

  function handleSubmit(e) {
    e.preventDefault()
    if (amount <= 0) return
    onConfirm(goal.id, amount)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Aporte" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-earth-600 dark:text-earth-400">{goal.name}</p>

        <div>
          <label className={LABEL_CLASS}>Valor aportado</label>
          <CurrencyInput value={amount} onChange={setAmount} required />
        </div>

        {amount > 0 && (
          <div className="bg-earth-50 dark:bg-earth-800 rounded-xl p-3 space-y-2 text-xs">
            <div className="flex justify-between text-earth-500 dark:text-earth-400">
              <span>Atual</span>
              <span>
                {formatCurrency(goal.currentAmount)} →{' '}
                <span className="font-semibold text-earth-700 dark:text-earth-200">{formatCurrency(newAmount)}</span>
              </span>
            </div>
            <div className="flex justify-between text-earth-500 dark:text-earth-400">
              <span>Progresso</span>
              <span>
                {Math.round(progressPct)}% →{' '}
                <span className="font-semibold text-earth-700 dark:text-earth-200">{Math.round(newPct)}%</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-earth-200 dark:bg-earth-700 overflow-hidden mt-1">
              <div className="h-full rounded-full bg-earth-400 dark:bg-earth-500 transition-all" style={{ width: `${newPct}%` }} />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" className={BTN_PRIMARY} disabled={amount <= 0}>Confirmar Aporte</button>
        </div>
      </form>
    </Modal>
  )
}
