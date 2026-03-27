import { Bell, Circle, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'
import { getUpcomingRecurring, getRecurringOccurrenceDate } from '../../utils/calculations'

function daysUntil(dateStr, today) {
  const d1 = new Date(today + 'T00:00:00')
  const d2 = new Date(dateStr + 'T00:00:00')
  return Math.round((d2 - d1) / 86400000)
}

function CountdownBadge({ days }) {
  if (days < 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold text-red-500 dark:text-red-400">
        <AlertCircle size={11} />
        Atrasado {Math.abs(days)} {Math.abs(days) === 1 ? 'dia' : 'dias'}
      </span>
    )
  }
  if (days === 0) {
    return <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">Vence hoje!</span>
  }
  if (days === 1) {
    return <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Vence amanhã</span>
  }
  return <span className="text-xs text-earth-400 dark:text-earth-500">Restam {days} dias</span>
}

function UpcomingItem({ tx, categoryName, days, onToggle }) {
  const isOverdue = days < 0
  const isUrgent  = days <= 1

  return (
    <div className={`flex items-center gap-3 py-2.5 px-2 rounded-xl transition-colors ${
      isOverdue ? 'bg-red-50 dark:bg-red-900/20' :
      days === 0 ? 'bg-amber-50 dark:bg-amber-900/20' :
      days === 1 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
    }`}>
      {/* Botão de confirmar pagamento */}
      <button
        onClick={() => onToggle(tx.id)}
        title="Confirmar pagamento"
        className={`shrink-0 transition-colors ${
          isUrgent || isOverdue
            ? 'text-red-300 dark:text-red-700 hover:text-positive dark:hover:text-positive-dark'
            : 'text-earth-300 dark:text-earth-600 hover:text-positive dark:hover:text-positive-dark'
        }`}
      >
        <Circle size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-earth-700 dark:text-earth-300 truncate">
          {tx.description}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {categoryName && (
            <span className="text-xs text-earth-400 dark:text-earth-500">{categoryName} ·</span>
          )}
          <CountdownBadge days={days} />
        </div>
      </div>

      <span className="text-xs font-semibold text-earth-600 dark:text-earth-300 shrink-0">
        −{formatCurrency(tx.amount)}
      </span>
    </div>
  )
}

export default function UpcomingCard({ transactions, categories, isPaid, onToggle }) {
  const now       = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today     = now.toISOString().split('T')[0]

  const allRecurring = getUpcomingRecurring(transactions, currentYM).filter(tx => !tx.isInstallment)

  // Apenas despesas não pagas com vencimento em até 7 dias (incluindo atrasadas)
  const upcoming = allRecurring
    .filter(tx => tx.type !== 'income' && !isPaid(tx.id, currentYM))
    .filter(tx => tx.occDate && daysUntil(tx.occDate, today) <= 7)
    .sort((a, b) => a.occDate.localeCompare(b.occDate))

  const getCatName = (id) => categories.find(c => c.id === id)?.name || ''
  const overdueCount = upcoming.filter(tx => daysUntil(tx.occDate, today) < 0).length

  // Nenhuma transação recorrente cadastrada
  if (allRecurring.length === 0) {
    return (
      <Card id="card-lembretes">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={15} className="text-earth-500 dark:text-earth-400" />
          <p className="text-sm font-medium text-earth-700 dark:text-earth-300">Lembretes</p>
        </div>
        <p className="text-xs text-earth-400 dark:text-earth-500 text-center py-4">
          Adicione transações recorrentes para receber lembretes de vencimento aqui
        </p>
      </Card>
    )
  }

  return (
    <Card id="card-lembretes">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-earth-500 dark:text-earth-400" />
          <p className="text-sm font-medium text-earth-700 dark:text-earth-300">Lembretes</p>
        </div>
        <div className="flex items-center gap-1.5">
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
              <AlertCircle size={10} />
              {overdueCount} atrasada{overdueCount !== 1 ? 's' : ''}
            </span>
          )}
          {upcoming.length > overdueCount && (
            <span className="flex items-center gap-1 text-xs font-medium text-earth-500 dark:text-earth-400 bg-earth-100 dark:bg-earth-700 px-2 py-0.5 rounded-full">
              <Clock size={10} />
              {upcoming.length - overdueCount} próxima{(upcoming.length - overdueCount) !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {upcoming.length === 0 ? (
        <p className="text-xs text-earth-400 dark:text-earth-500 text-center py-3">
          Você não possui contas a pagar nos próximos dias
        </p>
      ) : (
        <div className="space-y-0.5">
          {upcoming.map(tx => (
            <UpcomingItem
              key={tx.id}
              tx={tx}
              categoryName={getCatName(tx.categoryId)}
              days={daysUntil(tx.occDate, today)}
              onToggle={(id) => onToggle(id, currentYM)}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
