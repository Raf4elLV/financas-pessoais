import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, RepeatIcon, CreditCard, Calendar, TrendingUp, TrendingDown, Circle, CheckCircle2, Clock } from 'lucide-react'
import Card from '../UI/Card'
import Badge from '../UI/Badge'
import EmptyState from '../UI/EmptyState'
import TransactionForm from './TransactionForm'
import { formatCurrency, formatDate } from '../../utils/formatters'

function currentInstallmentNumber(tx) {
  const [sy, sm] = tx.date.slice(0, 7).split('-').map(Number)
  const now = new Date()
  const diff = (now.getFullYear() - sy) * 12 + (now.getMonth() + 1 - sm) + 1
  return Math.min(Math.max(1, diff), tx.installments)
}

// ── Summary / filter card ────────────────────────────────────────────────────
function SummaryCard({ label, amount, count, isIncome, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`p-3 rounded-xl border text-left transition-all w-full cursor-pointer ${
        active
          ? 'border-earth-500 bg-earth-500 shadow-md'
          : 'border-earth-200 dark:border-earth-700 bg-white dark:bg-earth-800 hover:border-earth-400 dark:hover:border-earth-500 hover:shadow-sm'
      }`}
    >
      <p className={`text-xs font-medium ${active ? 'text-earth-100' : 'text-earth-400 dark:text-earth-500'}`}>
        {label}
      </p>
      <p className={`text-sm font-bold mt-1 ${
        active
          ? 'text-white'
          : isIncome
          ? 'text-positive dark:text-positive-dark'
          : 'text-earth-700 dark:text-earth-200'
      }`}>
        {formatCurrency(amount)}
      </p>
      <p className={`text-xs mt-0.5 ${active ? 'text-earth-200' : 'text-earth-400 dark:text-earth-500'}`}>
        {count} {count === 1 ? 'item' : 'itens'}
      </p>
    </button>
  )
}

export default function TransactionList({ transactionsState, categoriesState }) {
  const { transactions, addTransaction, updateTransaction, removeTransaction, togglePaid } = transactionsState
  const { categories, getCategoriesByType, getCategoryById } = categoriesState

  const [formOpen, setFormOpen]     = useState(false)
  const [editData, setEditData]     = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [catFilter, setCatFilter]   = useState('all')
  const [search, setSearch]         = useState('')
  const [timeFilter, setTimeFilter] = useState('all') // 'all' | '7days' | 'month' | 'future' | 'custom'
  const [dateFrom, setDateFrom]     = useState('')
  const [dateTo, setDateTo]         = useState('')

  // Stable today string — re-computes only when component mounts
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  function handleTypeFilter(val) {
    setTypeFilter(prev => prev === val ? 'all' : val)
    setCatFilter('all')
  }

  // ── Aplica filtro de período ───────────────────────────────────────────────
  // 'all'    → passado até hoje (sem futuras)
  // '7days'  → últimos 7 dias até hoje (sem futuras)
  // 'month'  → mês inteiro (passado + futuras — serão separados na exibição)
  // 'future' → somente futuras (após hoje)
  // 'custom' → intervalo livre
  const timeFiltered = useMemo(() => transactions.filter(tx => {
    if (timeFilter === 'all') {
      return tx.date <= today
    }
    if (timeFilter === '7days') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      return tx.date >= cutoff.toISOString().split('T')[0] && tx.date <= today
    }
    if (timeFilter === 'month') {
      const now = new Date()
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      return tx.date.startsWith(monthStr)
    }
    if (timeFilter === 'future') {
      return tx.date > today
    }
    if (timeFilter === 'custom') {
      if (dateFrom && tx.date < dateFrom) return false
      if (dateTo   && tx.date > dateTo)   return false
    }
    return true
  }), [transactions, timeFilter, dateFrom, dateTo, today])

  // ── Totais por tipo ────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const sum = (fn) => timeFiltered.filter(fn).reduce((s, t) => s + t.amount, 0)
    const cnt = (fn) => timeFiltered.filter(fn).length
    const incomeAmt  = sum(t => t.type === 'income')
    const expenseAmt = sum(t => t.type !== 'income')
    return {
      all:          { amount: incomeAmt - expenseAmt, count: timeFiltered.length },
      income:       { amount: sum(t => t.type === 'income'),           count: cnt(t => t.type === 'income') },
      fixed:        { amount: sum(t => t.type === 'fixed_expense'),    count: cnt(t => t.type === 'fixed_expense') },
      variable:     { amount: sum(t => t.type === 'variable_expense'), count: cnt(t => t.type === 'variable_expense') },
      recurring:    { amount: sum(t => t.recurrent),                   count: cnt(t => t.recurrent) },
      installments: { amount: sum(t => !!t.installments),              count: cnt(t => !!t.installments) },
    }
  }, [timeFiltered])

  // ── Subcategorias usadas ───────────────────────────────────────────────────
  const subcategories = useMemo(() => {
    if (typeFilter === 'all' || typeFilter === 'recurring' || typeFilter === 'installment') return []
    const usedIds = new Set(timeFiltered.filter(t => t.type === typeFilter).map(t => t.categoryId))
    return categories.filter(c => c.type === typeFilter && usedIds.has(c.id))
  }, [typeFilter, categories, timeFiltered])

  // ── Lista com type/category/search aplicados ───────────────────────────────
  const filtered = useMemo(() => timeFiltered.filter(tx => {
    if (typeFilter === 'recurring'   && !tx.recurrent)    return false
    if (typeFilter === 'installment' && !tx.installments) return false
    if (typeFilter !== 'all' && typeFilter !== 'recurring' && typeFilter !== 'installment' && tx.type !== typeFilter) return false
    if (catFilter !== 'all' && tx.categoryId !== catFilter) return false
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [timeFiltered, typeFilter, catFilter, search])

  // ── Total da lista (para modo não-secionado) ───────────────────────────────
  const filteredTotal = useMemo(() => filtered.reduce((s, tx) => {
    return s + (tx.type === 'income' ? tx.amount : -tx.amount)
  }, 0), [filtered])

  // ── Ordenação: despesas antes de receitas; fixas pagas vão pro final ─────
  const TYPE_RANK = { fixed_expense: 0, variable_expense: 1, income: 2 }
  const displayList = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const rankA = TYPE_RANK[a.type] ?? 1
      const rankB = TYPE_RANK[b.type] ?? 1
      if (rankA !== rankB) return rankA - rankB
      if (a.type === 'fixed_expense' && a.paid !== b.paid) return a.paid ? 1 : -1
      return 0
    })
  }, [filtered])

  // ── Modo de exibição com seções (Este Mês) ────────────────────────────────
  const showSections = timeFilter === 'month'
  const pastList   = useMemo(() => showSections ? displayList.filter(t => t.date <= today) : [], [showSections, displayList, today])
  const futureList = useMemo(() => showSections ? displayList.filter(t => t.date >  today) : [], [showSections, displayList, today])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleEdit(tx)  { setEditData(tx); setFormOpen(true) }
  function handleClose()   { setFormOpen(false); setEditData(null) }
  function handleSave(data) {
    editData ? updateTransaction(editData.id, data) : addTransaction(data)
    setEditData(null)
  }

  const cat = (id) => getCategoryById(id)

  // ── Render de linhas individuais ───────────────────────────────────────────
  function renderRows(list) {
    return list.map(tx => {
      const category = cat(tx.categoryId)
      const isPaid   = tx.paid || false
      return (
        <div
          key={tx.id}
          className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-3.5 transition-all duration-300 group ${
            isPaid
              ? 'bg-earth-50/60 dark:bg-earth-800/30 hover:bg-earth-50 dark:hover:bg-earth-700/30 opacity-60'
              : 'hover:bg-earth-50 dark:hover:bg-earth-700/50 opacity-100'
          }`}
        >
          {/* Indicador de cor */}
          <div className={`w-1.5 h-8 rounded-full shrink-0 ${
            isPaid                             ? 'bg-positive/40 dark:bg-positive-dark/40' :
            tx.type === 'income'              ? 'bg-positive dark:bg-positive-dark' :
            tx.type === 'fixed_expense'       ? 'bg-earth-300 dark:bg-earth-500' :
                                                'bg-negative dark:bg-negative-dark'
          }`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className={`text-sm font-medium truncate ${
                isPaid
                  ? 'line-through text-earth-400 dark:text-earth-500'
                  : 'text-earth-800 dark:text-earth-100'
              }`}>{tx.description}</p>
              {tx.installments ? (
                <span className="flex items-center gap-1 text-xs bg-earth-100 dark:bg-earth-700 text-earth-500 dark:text-earth-400 px-1.5 py-0.5 rounded-md font-medium shrink-0">
                  <CreditCard size={10} />
                  {currentInstallmentNumber(tx)}/{tx.installments}x
                </span>
              ) : tx.recurrent && (
                <RepeatIcon size={11} className="text-earth-400 dark:text-earth-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-earth-400 dark:text-earth-500">{formatDate(tx.date)}</span>
              {category && (
                <span className="text-xs text-earth-400 dark:text-earth-500">· {category.name}</span>
              )}
              {isPaid && (
                <span className="text-xs text-positive dark:text-positive-dark font-medium">· Pago</span>
              )}
            </div>
          </div>

          <Badge type={tx.type} className="shrink-0 hidden sm:inline-flex" />

          <span className={`text-sm font-semibold shrink-0 ${
            isPaid
              ? 'text-earth-400 dark:text-earth-500'
              : tx.type === 'income'
              ? 'text-positive dark:text-positive-dark'
              : 'text-earth-700 dark:text-earth-300'
          }`}>
            {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
          </span>

          {/* Check de pagamento — apenas despesas fixas */}
          {tx.type === 'fixed_expense' && (
            <button
              onClick={() => togglePaid(tx.id)}
              title={isPaid ? 'Marcar como não pago' : 'Marcar como pago'}
              className="shrink-0 transition-colors text-earth-300 dark:text-earth-600 hover:text-positive dark:hover:text-positive-dark"
            >
              {isPaid
                ? <CheckCircle2 size={18} className="text-positive dark:text-positive-dark" />
                : <Circle size={18} />
              }
            </button>
          )}

          {/* Ações — sempre visíveis no mobile (touch não tem hover); ocultadas até hover no desktop */}
          <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => handleEdit(tx)}
              className="p-2 rounded-xl text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
              aria-label="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => removeTransaction(tx.id)}
              className="p-2 rounded-xl text-earth-400 hover:text-negative dark:hover:text-negative-dark hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
              aria-label="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )
    })
  }

  // ── Render de um bloco (seção com cabeçalho + card) ───────────────────────
  function renderSection(list, label, icon) {
    if (list.length === 0) return null
    const total = list.reduce((s, tx) => s + (tx.type === 'income' ? tx.amount : -tx.amount), 0)
    return (
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            {icon}
            <p className="text-xs font-semibold text-earth-500 dark:text-earth-400 uppercase tracking-wider">
              {label}
            </p>
            <span className="text-xs text-earth-400 dark:text-earth-500">
              · {list.length} {list.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <span className={`text-xs font-semibold ${
            total >= 0
              ? 'text-positive dark:text-positive-dark'
              : 'text-negative dark:text-negative-dark'
          }`}>
            {total >= 0 ? '+' : ''}{formatCurrency(total)}
          </span>
        </div>
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-earth-100 dark:divide-earth-700">
            {renderRows(list)}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* ── Cabeçalho ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100">Transações</h1>
          <p className="text-xs text-earth-400 dark:text-earth-500 mt-0.5">{transactions.length} registros no total</p>
        </div>
        <button
          onClick={() => { setEditData(null); setFormOpen(true) }}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-earth-500 hover:bg-earth-600 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Nova Transação</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* ── Cards de filtro por tipo ────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-earth-400 dark:text-earth-500 font-medium mb-2">Filtrar por tipo</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <SummaryCard
            label="Todos"
            amount={totals.all.amount}
            count={totals.all.count}
            isIncome={totals.all.amount >= 0}
            active={typeFilter === 'all'}
            onClick={() => handleTypeFilter('all')}
          />
          <SummaryCard
            label="Receitas"
            amount={totals.income.amount}
            count={totals.income.count}
            isIncome
            active={typeFilter === 'income'}
            onClick={() => handleTypeFilter('income')}
          />
          <SummaryCard
            label="Desp. Fixas"
            amount={totals.fixed.amount}
            count={totals.fixed.count}
            active={typeFilter === 'fixed_expense'}
            onClick={() => handleTypeFilter('fixed_expense')}
          />
          <SummaryCard
            label="Desp. Variáveis"
            amount={totals.variable.amount}
            count={totals.variable.count}
            active={typeFilter === 'variable_expense'}
            onClick={() => handleTypeFilter('variable_expense')}
          />
          <SummaryCard
            label="Recorrentes"
            amount={totals.recurring.amount}
            count={totals.recurring.count}
            active={typeFilter === 'recurring'}
            onClick={() => handleTypeFilter('recurring')}
          />
          <SummaryCard
            label="Parceladas"
            amount={totals.installments.amount}
            count={totals.installments.count}
            active={typeFilter === 'installment'}
            onClick={() => handleTypeFilter('installment')}
          />
        </div>
      </div>

      {/* ── Filtro de período ───────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-earth-400 dark:text-earth-500 font-medium mb-2">Filtrar por período</p>
        <div className="flex flex-wrap gap-2 items-center">
          {[
            { value: 'all',    label: 'Todas as transações' },
            { value: '7days',  label: 'Últimos 7 dias' },
            { value: 'month',  label: 'Este mês' },
            { value: 'future', label: 'Futuras' },
            { value: 'custom', label: 'Personalizado' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                timeFilter === f.value
                  ? 'bg-earth-500 text-white'
                  : 'bg-earth-100 dark:bg-earth-700 text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
              }`}
            >
              {f.value === 'custom' && <Calendar size={11} />}
              {f.value === 'future' && <Clock size={11} />}
              {f.label}
            </button>
          ))}
          {timeFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="flex-1 sm:flex-none px-2 py-2 text-sm rounded-lg border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-100 focus:outline-none focus:border-earth-400"
              />
              <span className="text-xs text-earth-400">até</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="flex-1 sm:flex-none px-2 py-2 text-sm rounded-lg border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-100 focus:outline-none focus:border-earth-400"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Busca ──────────────────────────────────────────────────────────── */}
      <input
        className="w-full px-3 py-2 text-base sm:text-sm rounded-xl border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-100 placeholder-earth-400 focus:outline-none focus:border-earth-400 transition-colors"
        placeholder="Buscar por descrição..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* ── Filtro de subcategoria ──────────────────────────────────────────── */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              catFilter === 'all'
                ? 'bg-earth-700 dark:bg-earth-300 text-white dark:text-earth-900'
                : 'bg-earth-100 dark:bg-earth-700 text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
            }`}
          >
            Todas as categorias
          </button>
          {subcategories.map(c => {
            const count  = timeFiltered.filter(t => t.categoryId === c.id).length
            const amount = timeFiltered.filter(t => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0)
            return (
              <button
                key={c.id}
                onClick={() => setCatFilter(prev => prev === c.id ? 'all' : c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  catFilter === c.id
                    ? 'bg-earth-500 text-white'
                    : 'bg-earth-100 dark:bg-earth-700 text-earth-600 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
                }`}
              >
                {c.name}
                <span className={`text-xs ${catFilter === c.id ? 'text-earth-200' : 'text-earth-400 dark:text-earth-400'}`}>
                  {count} · {formatCurrency(amount)}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Lista ──────────────────────────────────────────────────────────── */}
      {showSections ? (
        // Modo "Este Mês" — duas seções: realizadas + futuras
        pastList.length === 0 && futureList.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nenhuma transação encontrada"
            description="Tente ajustar os filtros ou adicione uma nova transação"
          />
        ) : (
          <div className="space-y-5">
            {renderSection(
              pastList,
              'Realizadas',
              <TrendingDown size={13} className="text-earth-400 dark:text-earth-500" />
            )}
            {renderSection(
              futureList,
              'Futuras',
              <Clock size={13} className="text-earth-400 dark:text-earth-500" />
            )}
          </div>
        )
      ) : (
        // Modo lista única
        filtered.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nenhuma transação encontrada"
            description="Tente ajustar os filtros ou adicione uma nova transação"
          />
        ) : (
          <Card className="p-0 overflow-hidden">
            {/* Barra de resumo */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-earth-100 dark:border-earth-700 bg-earth-50 dark:bg-earth-800/50">
              <span className="text-xs text-earth-400 dark:text-earth-500">
                {filtered.length} {filtered.length === 1 ? 'transação' : 'transações'} exibidas
              </span>
              <div className="flex items-center gap-1.5">
                {filteredTotal >= 0
                  ? <TrendingUp size={12} className="text-positive dark:text-positive-dark" />
                  : <TrendingDown size={12} className="text-negative dark:text-negative-dark" />
                }
                <span className={`text-xs font-semibold ${
                  filteredTotal >= 0
                    ? 'text-positive dark:text-positive-dark'
                    : 'text-negative dark:text-negative-dark'
                }`}>
                  {filteredTotal >= 0 ? '+' : ''}{formatCurrency(filteredTotal)}
                </span>
              </div>
            </div>
            <div className="divide-y divide-earth-100 dark:divide-earth-700">
              {renderRows(displayList)}
            </div>
          </Card>
        )
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
