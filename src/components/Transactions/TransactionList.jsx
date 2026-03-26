import { useState } from 'react'
import { Plus, Pencil, Trash2, RepeatIcon, CreditCard, ListFilter, ArrowUpDown } from 'lucide-react'
import Card from '../UI/Card'
import Badge from '../UI/Badge'
import EmptyState from '../UI/EmptyState'
import TransactionForm from './TransactionForm'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { transactionOccursInMonth } from '../../utils/calculations'

const TYPE_FILTERS = [
  { value: 'all',              label: 'Todos' },
  { value: 'income',           label: 'Receitas' },
  { value: 'fixed_expense',    label: 'Fixas' },
  { value: 'variable_expense', label: 'Variáveis' },
  { value: 'recurring',        label: 'Recorrentes' },
  { value: 'installment',      label: 'Parceladas' },
]

function currentInstallmentNumber(tx) {
  const [sy, sm] = tx.date.slice(0, 7).split('-').map(Number)
  const now = new Date()
  const diff = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm) + 1
  return Math.min(Math.max(1, diff), tx.installments)
}

export default function TransactionList({ transactionsState, categoriesState }) {
  const { transactions, addTransaction, updateTransaction, removeTransaction } = transactionsState
  const { categories, getCategoriesByType, getCategoryById } = categoriesState

  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = transactions.filter(tx => {
    if (typeFilter === 'recurring' && !tx.isRecurring) return false
    if (typeFilter === 'installment' && !tx.isInstallment) return false
    if (typeFilter !== 'all' && typeFilter !== 'recurring' && typeFilter !== 'installment' && tx.type !== typeFilter) return false
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function handleEdit(tx) {
    setEditData(tx)
    setFormOpen(true)
  }

  function handleSave(data) {
    if (editData) {
      updateTransaction(editData.id, data)
    } else {
      addTransaction(data)
    }
    setEditData(null)
  }

  function handleClose() {
    setFormOpen(false)
    setEditData(null)
  }

  const cat = (id) => getCategoryById(id)

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100">Transações</h1>
          <p className="text-xs text-earth-400 dark:text-earth-500 mt-0.5">{transactions.length} registros</p>
        </div>
        <button
          onClick={() => { setEditData(null); setFormOpen(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-earth-500 hover:bg-earth-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={15} />
          Nova Transação
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 px-3 py-2 text-sm rounded-xl border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-100 placeholder-earth-400 focus:outline-none focus:border-earth-400 transition-colors"
          placeholder="Buscar por descrição..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex rounded-xl border border-earth-200 dark:border-earth-700 overflow-hidden bg-earth-50 dark:bg-earth-800">
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors
                ${typeFilter === f.value
                  ? 'bg-earth-500 text-white'
                  : 'text-earth-500 dark:text-earth-400 hover:text-earth-700 dark:hover:text-earth-200'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ListFilter}
          title="Nenhuma transação encontrada"
          description="Adicione sua primeira transação clicando em 'Nova Transação'"
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-earth-100 dark:divide-earth-700">
            {filtered.map(tx => {
              const category = cat(tx.categoryId)
              const isExpense = tx.type !== 'income'
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-earth-50 dark:hover:bg-earth-700/50 transition-colors group">
                  {/* Indicador de cor */}
                  <div className={`w-1.5 h-8 rounded-full shrink-0 ${
                    tx.type === 'income'           ? 'bg-positive dark:bg-positive-dark' :
                    tx.type === 'fixed_expense'    ? 'bg-earth-300 dark:bg-earth-500' :
                                                    'bg-negative dark:bg-negative-dark'
                  }`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-earth-800 dark:text-earth-100 truncate">{tx.description}</p>
                      {tx.isInstallment ? (
                        <span className="flex items-center gap-1 text-xs bg-earth-100 dark:bg-earth-700 text-earth-500 dark:text-earth-400 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                          <CreditCard size={10} />
                          {currentInstallmentNumber(tx)}/{tx.installments}x
                        </span>
                      ) : tx.isRecurring && (
                        <RepeatIcon size={11} className="text-earth-400 dark:text-earth-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-earth-400 dark:text-earth-500">{formatDate(tx.date)}</span>
                      {category && (
                        <span className="text-xs text-earth-400 dark:text-earth-500">· {category.name}</span>
                      )}
                    </div>
                  </div>

                  <Badge type={tx.type} className="shrink-0 hidden sm:inline-flex" />

                  <span className={`text-sm font-semibold shrink-0 ${
                    tx.type === 'income' ? 'text-positive dark:text-positive-dark' : 'text-earth-700 dark:text-earth-300'
                  }`}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                  </span>

                  {/* Ações */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="p-1.5 rounded-lg text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => removeTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-earth-400 hover:text-negative dark:hover:text-negative-dark hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <TransactionForm
        isOpen={formOpen}
        onClose={handleClose}
        onSave={handleSave}
        categories={categoriesState.categories}
        getCategoriesByType={getCategoriesByType}
        editData={editData}
      />
    </div>
  )
}
