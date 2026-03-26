import { useState } from 'react'
import { ShoppingBag, Settings, Check } from 'lucide-react'
import Card from '../UI/Card'
import Modal from '../UI/Modal'
import CurrencyInput from '../UI/CurrencyInput'
import { formatCurrency } from '../../utils/formatters'
import { transactionOccursInMonth } from '../../utils/calculations'
import { LABEL_CLASS, BTN_PRIMARY, BTN_SECONDARY } from '../../utils/ui'

function BesteirasModal({ isOpen, onClose, config, categories, onSave }) {
  const varCategories = categories.filter(c => c.type === 'variable_expense')

  const [limit, setLimit] = useState(config?.monthlyLimit || 0)
  const [selectedIds, setSelectedIds] = useState(() => {
    if (config?.categoryIds) return new Set(config.categoryIds)
    const lazer = varCategories.find(c => c.name.toLowerCase().includes('lazer'))
    return new Set(lazer ? [lazer.id] : varCategories.slice(0, 1).map(c => c.id))
  })

  function toggleCat(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSave(e) {
    e.preventDefault()
    if (!limit || selectedIds.size === 0) return
    onSave({ monthlyLimit: limit, categoryIds: [...selectedIds] })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurar Gasto Livre" size="sm">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className={LABEL_CLASS}>Limite mensal</label>
          <CurrencyInput value={limit} onChange={setLimit} required />
        </div>

        <div>
          <label className={`${LABEL_CLASS} mb-2`}>
            Categorias que contam como gasto livre
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
            {varCategories.map(cat => (
              <label key={cat.id} className="flex items-center gap-2.5 cursor-pointer group">
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors
                  ${selectedIds.has(cat.id)
                    ? 'bg-earth-500 border-earth-500'
                    : 'border-earth-300 dark:border-earth-600 group-hover:border-earth-400'
                  }`}
                >
                  {selectedIds.has(cat.id) && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedIds.has(cat.id)}
                  onChange={() => toggleCat(cat.id)}
                />
                <span className="text-xs text-earth-700 dark:text-earth-300">{cat.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>Cancelar</button>
          <button type="submit" className={BTN_PRIMARY}>Salvar</button>
        </div>
      </form>
    </Modal>
  )
}

export default function BesteirasCard({ config, transactions, categories, onSaveConfig }) {
  const [modalOpen, setModalOpen] = useState(false)

  // Calcular gasto do mês atual nas categorias selecionadas
  const currentYM = new Date().toISOString().slice(0, 7)
  const validCategoryIds = new Set(
    (config?.categoryIds || []).filter(id => categories.some(c => c.id === id))
  )

  const spent = config
    ? transactions
        .filter(tx => validCategoryIds.has(tx.categoryId) && transactionOccursInMonth(tx, currentYM))
        .reduce((sum, tx) => sum + tx.amount, 0)
    : 0

  const pct = config?.monthlyLimit > 0 ? (spent / config.monthlyLimit) * 100 : 0
  const remaining = config ? Math.max(0, config.monthlyLimit - spent) : 0
  const isWarning = pct >= 80 && pct < 100
  const isOver = pct >= 100

  const barColor = isOver
    ? 'bg-negative dark:bg-negative-dark'
    : isWarning
    ? 'bg-negative dark:bg-negative-dark opacity-70'
    : 'bg-earth-400 dark:bg-earth-500'

  // Nomes das categorias selecionadas
  const selectedCatNames = config
    ? categories.filter(c => validCategoryIds.has(c.id)).map(c => c.name).join(', ')
    : ''

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={15} className="text-earth-500 dark:text-earth-400" />
            <p className="text-sm font-medium text-earth-700 dark:text-earth-300">Gasto Livre</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="p-1.5 rounded-lg text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
            title="Configurar"
          >
            <Settings size={13} />
          </button>
        </div>

        {!config ? (
          <div className="text-center py-6">
            <p className="text-xs text-earth-400 dark:text-earth-500 mb-3">
              Defina um limite mensal para gastos com lazer e besteiras
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 transition-colors"
            >
              + Configurar limite
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Valor restante em destaque */}
            <div>
              <p className="text-xs text-earth-500 dark:text-earth-400 mb-0.5">Ainda posso gastar</p>
              <p className={`text-2xl font-bold tracking-tight ${
                isOver ? 'text-negative dark:text-negative-dark' : 'text-earth-800 dark:text-earth-100'
              }`}>
                {isOver ? '−' : ''}{formatCurrency(isOver ? spent - config.monthlyLimit : remaining)}
              </p>
              {isOver && (
                <p className="text-xs text-negative dark:text-negative-dark mt-0.5">Limite excedido</p>
              )}
            </div>

            {/* Barra de progresso */}
            <div>
              <div className="flex justify-between text-xs text-earth-400 dark:text-earth-500 mb-1.5">
                <span>Gasto: {formatCurrency(spent)}</span>
                <span>Limite: {formatCurrency(config.monthlyLimit)}</span>
              </div>
              <div className="h-2 rounded-full bg-earth-100 dark:bg-earth-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <p className="text-right text-xs text-earth-400 dark:text-earth-500 mt-1">
                {Math.round(pct)}% usado
              </p>
            </div>

            {/* Categorias */}
            {selectedCatNames && (
              <p className="text-xs text-earth-400 dark:text-earth-500 truncate">
                Categorias: {selectedCatNames}
              </p>
            )}
          </div>
        )}
      </Card>

      <BesteirasModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        config={config}
        categories={categories}
        onSave={onSaveConfig}
      />
    </>
  )
}
