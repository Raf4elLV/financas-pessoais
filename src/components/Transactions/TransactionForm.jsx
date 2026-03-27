import { useState, useEffect } from 'react'
import { RepeatIcon, TrendingUp, Lock, ShoppingBag, CreditCard } from 'lucide-react'
import Modal from '../UI/Modal'
import CurrencyInput from '../UI/CurrencyInput'
import { today, formatCurrency } from '../../utils/formatters'
import { INPUT_CLASS, LABEL_CLASS, BTN_PRIMARY, BTN_SECONDARY } from '../../utils/ui'
import { computeInstallmentEndDate } from '../../utils/calculations'

const TYPE_OPTIONS = [
  { value: 'income',           label: 'Receita',           Icon: TrendingUp  },
  { value: 'fixed_expense',    label: 'Despesa Fixa',      Icon: Lock        },
  { value: 'variable_expense', label: 'Despesa Variável',  Icon: ShoppingBag },
]

const VAR_MODES = [
  { value: 'avulsa',     label: 'Avulsa',      Icon: ShoppingBag },
  { value: 'recorrente', label: 'Recorrente',  Icon: RepeatIcon  },
  { value: 'parcelada',  label: 'Parcelada',   Icon: CreditCard  },
]

function emptyForm() {
  return {
    type: 'variable_expense',
    description: '',
    amount: 0,
    date: today(),
    categoryId: '',
    recurrent: false,
    isInstallment: false,
    installments: 2,
    notes: '',
  }
}

function formatInstallmentEnd(startDate, installments) {
  const endDate = computeInstallmentEndDate(startDate, installments)
  const [y, m] = endDate.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export default function TransactionForm({ isOpen, onClose, onSave, categories, getCategoriesByType, editData }) {
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (isOpen) {
      setForm(editData
        ? { installments: 2, ...editData }
        : emptyForm()
      )
    }
  }, [isOpen, editData])

  const filteredCategories = getCategoriesByType(form.type)
  const isFixed = form.type === 'fixed_expense'
  const isIncome = form.type === 'income'
  const isVariable = form.type === 'variable_expense'

  // Derived mode for variable expenses
  const varMode = form.isInstallment ? 'parcelada' : form.recurrent ? 'recorrente' : 'avulsa'

  function set(field, value) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'type') {
        next.categoryId = ''
        next.recurrent = value === 'fixed_expense'
        next.isInstallment = false
        next.installments = 2
      }
      return next
    })
  }

  function setVarMode(mode) {
    setForm(prev => ({
      ...prev,
      recurrent: mode === 'recorrente',
      isInstallment: mode === 'parcelada',
      installments: mode === 'parcelada' ? (prev.installments || 2) : 2,
      categoryId: mode === 'parcelada' ? 'cat-cartao' : prev.categoryId,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.description.trim() || !form.amount || !form.date || !form.categoryId) return

    const installmentCount = Math.max(2, parseInt(form.installments) || 2)
    const doInstallment = isVariable && form.isInstallment && installmentCount >= 2

    onSave({
      ...form,
      recurrent: isFixed ? true : (doInstallment ? true : form.recurrent),
      isInstallment: doInstallment || undefined,
      installments: doInstallment ? installmentCount : undefined,
      endDate: doInstallment ? computeInstallmentEndDate(form.date, installmentCount) : undefined,
      recurrenceDay: null,
      notes: form.notes || null,
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Editar Transação' : 'Nova Transação'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <div>
          <label className={LABEL_CLASS}>Tipo</label>
          <div className="flex rounded-xl border border-earth-200 dark:border-earth-600 overflow-hidden">
            {TYPE_OPTIONS.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('type', value)}
                className={`flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors
                  ${form.type === value
                    ? 'bg-earth-500 text-white'
                    : 'bg-earth-50 dark:bg-earth-700 text-earth-500 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-600'
                  }`}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição + Valor + Data */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={LABEL_CLASS}>Descrição</label>
            <input
              className={INPUT_CLASS}
              placeholder={isFixed ? 'Ex: Aluguel' : isVariable && form.isInstallment ? 'Ex: TV nova' : 'Ex: Supermercado'}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>{form.isInstallment ? 'Valor por parcela' : 'Valor'}</label>
            <CurrencyInput
              value={form.amount}
              onChange={v => set('amount', v)}
              required
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>
              {isFixed ? 'Início da cobrança' : form.isInstallment ? 'Mês da 1ª parcela' : 'Data'}
            </label>
            <input
              className={INPUT_CLASS}
              type="date"
              value={form.date}
              onChange={e => set('date', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className={LABEL_CLASS}>Categoria</label>
          <select
            className={INPUT_CLASS}
            value={form.categoryId}
            onChange={e => set('categoryId', e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Recorrência / Parcelamento */}
        {isFixed ? (
          <div className="flex items-center gap-2.5 py-1 px-3 bg-earth-50 dark:bg-earth-700 rounded-xl">
            <RepeatIcon size={13} className="text-earth-500 dark:text-earth-400 shrink-0" />
            <span className="text-xs text-earth-600 dark:text-earth-400">
              Recorrente todo mês · Dia {form.date ? parseInt(form.date.split('-')[2]) : '—'} de cada mês
            </span>
          </div>
        ) : isVariable ? (
          <div className="space-y-2">
            <div className="flex rounded-xl border border-earth-200 dark:border-earth-600 overflow-hidden">
              {VAR_MODES.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVarMode(value)}
                  className={`flex-1 py-2 flex items-center justify-center gap-1.5 text-xs font-medium transition-colors
                    ${varMode === value
                      ? 'bg-earth-500 text-white'
                      : 'bg-earth-50 dark:bg-earth-700 text-earth-500 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-600'
                    }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            {varMode === 'recorrente' && (
              <p className="text-xs text-earth-400 dark:text-earth-500 px-1">
                Dia {form.date ? parseInt(form.date.split('-')[2]) : '—'} de cada mês, sem data de término
              </p>
            )}

            {varMode === 'parcelada' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className={`${LABEL_CLASS} shrink-0 mb-0`}>Nº de parcelas</label>
                  <input
                    type="number"
                    min={2}
                    max={120}
                    value={form.installments}
                    onChange={e => {
                      const raw = e.target.value
                      if (raw === '') { set('installments', ''); return }
                      const n = parseInt(raw)
                      if (!isNaN(n)) set('installments', n)
                    }}
                    onBlur={() => set('installments', Math.max(2, Math.min(120, parseInt(form.installments) || 2)))}
                    className={`${INPUT_CLASS} w-20`}
                  />
                  {form.amount > 0 && parseInt(form.installments) >= 2 && (
                    <span className="text-xs text-earth-400 dark:text-earth-500 ml-auto">
                      Total: {formatCurrency(form.amount * parseInt(form.installments))}
                    </span>
                  )}
                </div>
                {form.date && parseInt(form.installments) >= 2 && (
                  <p className="text-xs text-earth-400 dark:text-earth-500 px-1">
                    {parseInt(form.installments)}x de {formatCurrency(form.amount || 0)} · Até {formatInstallmentEnd(form.date, parseInt(form.installments))}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* income: simple recurring toggle */
          <div className="flex items-center gap-3 py-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={form.recurrent}
                onChange={e => set('recurrent', e.target.checked)}
              />
              <div className="w-9 h-5 rounded-full peer bg-earth-200 dark:bg-earth-600 peer-checked:bg-earth-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </label>
            <span className="text-xs text-earth-600 dark:text-earth-400">Recorrente (mensal)</span>
            {form.recurrent && (
              <span className="text-xs text-earth-400 dark:text-earth-500 ml-auto">
                Dia {form.date ? parseInt(form.date.split('-')[2]) : '—'} de cada mês
              </span>
            )}
          </div>
        )}

        {/* Observações */}
        <div>
          <label className={LABEL_CLASS}>Observações (opcional)</label>
          <textarea
            className={`${INPUT_CLASS} resize-none`}
            rows={2}
            placeholder="Notas adicionais..."
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            Cancelar
          </button>
          <button type="submit" className={BTN_PRIMARY}>
            {editData ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
