import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Target, TrendingUp, Landmark } from 'lucide-react'
import Card from '../UI/Card'
import Modal from '../UI/Modal'
import EmptyState from '../UI/EmptyState'
import CurrencyInput from '../UI/CurrencyInput'
import InvestModal from './InvestModal'
import { formatCurrency } from '../../utils/formatters'
import { calcGoalProgress } from '../../utils/calculations'
import { INPUT_CLASS, LABEL_CLASS, BTN_PRIMARY, BTN_SECONDARY } from '../../utils/ui'

const CUSTODY_SUGGESTIONS = [
  'Nubank', 'XP Investimentos', 'BTG Pactual', 'Rico', 'Inter',
  'Itaú', 'Bradesco', 'Santander', 'Caixa Econômica', 'Banco do Brasil',
  'Poupança', 'Renda Fixa', 'Tesouro Direto', 'Dinheiro Físico',
]

function emptyGoalForm() {
  return { name: '', targetAmount: 0, currentAmount: 0, monthlyContribution: 0, custody: '' }
}

function GoalForm({ isOpen, onClose, onSave, editData }) {
  const [form, setForm] = useState(emptyGoalForm)

  useEffect(() => {
    if (isOpen) {
      setForm(editData
        ? {
            name: editData.name,
            targetAmount: editData.targetAmount,
            currentAmount: editData.currentAmount,
            monthlyContribution: editData.monthlyContribution,
            custody: editData.custody || '',
          }
        : emptyGoalForm()
      )
    }
  }, [isOpen, editData])

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, custody: form.custody.trim() || null })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Editar Meta' : 'Nova Meta'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LABEL_CLASS}>Nome da meta</label>
          <input className={INPUT_CLASS} placeholder="Ex: Reserva de emergência" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS}>Valor alvo</label>
            <CurrencyInput value={form.targetAmount} onChange={v => setForm(p => ({ ...p, targetAmount: v }))} required />
          </div>
          <div>
            <label className={LABEL_CLASS}>Já tenho</label>
            <CurrencyInput value={form.currentAmount} onChange={v => setForm(p => ({ ...p, currentAmount: v }))} />
          </div>
        </div>
        <div>
          <label className={LABEL_CLASS}>Aporte mensal</label>
          <CurrencyInput value={form.monthlyContribution} onChange={v => setForm(p => ({ ...p, monthlyContribution: v }))} required />
        </div>
        <div>
          <label className={LABEL_CLASS}>Guardando em (custódia)</label>
          <input
            className={INPUT_CLASS}
            placeholder="Ex: Nubank, XP, Poupança..."
            list="custody-suggestions"
            value={form.custody}
            onChange={e => setForm(p => ({ ...p, custody: e.target.value }))}
          />
          <datalist id="custody-suggestions">
            {CUSTODY_SUGGESTIONS.map(s => <option key={s} value={s} />)}
          </datalist>
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" className={BTN_PRIMARY}>{editData ? 'Salvar' : 'Criar Meta'}</button>
        </div>
      </form>
    </Modal>
  )
}


function GoalCard({ goal, onEdit, onRemove, onInvest }) {
  const { progressPct, remaining, estimatedDate } = calcGoalProgress(goal)
  const done = progressPct >= 100

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-earth-100 dark:bg-earth-700 flex items-center justify-center shrink-0">
            <Target size={15} className="text-earth-500 dark:text-earth-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-earth-800 dark:text-earth-100">{goal.name}</p>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-earth-400 dark:text-earth-500">Meta: {formatCurrency(goal.targetAmount)}</p>
              {goal.custody && (
                <>
                  <span className="text-earth-300 dark:text-earth-600">·</span>
                  <span className="flex items-center gap-1 text-xs text-earth-400 dark:text-earth-500">
                    <Landmark size={10} />
                    {goal.custody}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {!done && (
            <button
              onClick={() => onInvest(goal)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-earth-500 dark:text-earth-400 border border-earth-200 dark:border-earth-600 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 hover:border-earth-400 dark:hover:border-earth-400 hover:text-earth-700 dark:hover:text-earth-200 transition-colors"
              title="Registrar aporte"
            >
              <TrendingUp size={11} />
              Aporte
            </button>
          )}
          <button onClick={() => onEdit(goal)} className="p-1.5 rounded-lg text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"><Pencil size={13} /></button>
          <button onClick={() => onRemove(goal.id)} className="p-1.5 rounded-lg text-earth-400 hover:text-negative dark:hover:text-negative-dark hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-earth-500 dark:text-earth-400 mb-1.5">
          <span>{formatCurrency(goal.currentAmount)} investido</span>
          <span className="font-medium">{Math.round(progressPct)}%</span>
        </div>
        <div className="h-2 rounded-full bg-earth-100 dark:bg-earth-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${done ? 'bg-positive dark:bg-positive-dark' : 'bg-earth-400 dark:bg-earth-500'}`}
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-earth-100 dark:border-earth-700">
        <Stat label="Falta" value={formatCurrency(remaining)} />
        <Stat label="Aporte/mês" value={formatCurrency(goal.monthlyContribution)} />
        <Stat label={done ? 'Status' : 'Previsão'} value={done ? '✓ Atingida' : estimatedDate || '—'} highlight={done} />
      </div>
    </Card>
  )
}

function Stat({ label, value, highlight }) {
  return (
    <div className="text-center">
      <p className="text-xs text-earth-400 dark:text-earth-500 mb-0.5">{label}</p>
      <p className={`text-xs font-semibold ${highlight ? 'text-positive dark:text-positive-dark' : 'text-earth-700 dark:text-earth-300'}`}>{value}</p>
    </div>
  )
}

export default function GoalManager({ goalsState }) {
  const { goals, addGoal, updateGoal, removeGoal } = goalsState
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [investGoal, setInvestGoal] = useState(null)

  function handleEdit(goal) {
    setEditData(goal)
    setFormOpen(true)
  }

  function handleSave(data) {
    if (editData) updateGoal(editData.id, data)
    else addGoal(data)
    setEditData(null)
  }

  function handleClose() {
    setFormOpen(false)
    setEditData(null)
  }

  function handleConfirmInvest(id, amount) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    updateGoal(id, { currentAmount: goal.currentAmount + amount })
  }

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100">Metas de Investimento</h1>
          <p className="text-xs text-earth-400 dark:text-earth-500 mt-0.5">{goals.length} meta(s) cadastrada(s)</p>
        </div>
        <button
          onClick={() => { setEditData(null); setFormOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-earth-500 hover:bg-earth-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={15} />
          Nova Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta cadastrada"
          description="Crie metas de investimento para acompanhar seu progresso financeiro"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} onRemove={removeGoal} onInvest={setInvestGoal} />
          ))}
        </div>
      )}

      <GoalForm isOpen={formOpen} onClose={handleClose} onSave={handleSave} editData={editData} />
      <InvestModal
        isOpen={!!investGoal}
        onClose={() => setInvestGoal(null)}
        goal={investGoal}
        onConfirm={handleConfirmInvest}
      />
    </div>
  )
}
