import { Bell, ArrowDownLeft, ArrowUpRight, Check, CreditCard, TrendingUp, TrendingDown } from 'lucide-react'
import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'
import {
  getUpcomingRecurring,
  transactionOccursInMonth,
  getInstallmentNumber,
  getRecurringOccurrenceDate,
} from '../../utils/calculations'

function nextMonthYM(yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}

function daysUntil(dateStr, today) {
  const d1 = new Date(today + 'T00:00:00')
  const d2 = new Date(dateStr + 'T00:00:00')
  return Math.round((d2 - d1) / 86400000)
}

function urgencyLabel(occDate, today, isScheduled) {
  const day = parseInt(occDate.split('-')[2])
  if (isScheduled) return `próximo mês · dia ${day}`
  const days = daysUntil(occDate, today)
  if (days <= -2) return `atrasado há ${Math.abs(days)} dias`
  if (days === -1) return 'atrasado ontem'
  if (days === 0)  return 'vence hoje!'
  if (days === 1)  return 'vence amanhã'
  if (days <= 7)   return `vence em ${days} dias`
  return `dia ${day}`
}

function urgencyBg(occDate, today, isScheduled) {
  if (isScheduled) return ''
  const days = daysUntil(occDate, today)
  if (days < 0) return 'bg-red-50 dark:bg-red-900/20'
  if (days === 0) return 'bg-amber-50 dark:bg-amber-900/20'
  if (days === 1) return 'bg-yellow-50 dark:bg-yellow-900/10'
  return ''
}

function UpcomingItem({ tx, categoryName, isScheduled, onToggle, today }) {
  const isIncome = tx.type === 'income'
  const label = tx.occDate ? urgencyLabel(tx.occDate, today, isScheduled) : ''
  const bg    = tx.occDate ? urgencyBg(tx.occDate, today, isScheduled) : ''

  return (
    <div className={`flex items-center gap-3 py-2.5 px-2 rounded-xl transition-colors ${bg} ${isScheduled ? 'opacity-50' : ''}`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(tx.id)}
        title={isScheduled ? 'Desmarcar' : isIncome ? 'Confirmar recebimento' : 'Confirmar pagamento'}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
          ${isScheduled
            ? 'border-earth-300 dark:border-earth-600 bg-earth-300 dark:bg-earth-600'
            : isIncome
            ? 'border-positive dark:border-positive-dark hover:bg-positive-light dark:hover:bg-positive-darkbg'
            : 'border-earth-300 dark:border-earth-600 hover:border-earth-400 dark:hover:border-earth-500'
          }`}
      >
        {isScheduled && <Check size={10} className="text-white" strokeWidth={3} />}
      </button>

      {/* Ícone */}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
        isIncome
          ? 'bg-positive-light dark:bg-positive-darkbg text-positive dark:text-positive-dark'
          : 'bg-earth-100 dark:bg-earth-700 text-earth-500 dark:text-earth-400'
      }`}>
        {isIncome ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
      </div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-earth-700 dark:text-earth-300">
          {tx.description}
        </p>
        <p className={`text-xs truncate ${
          !isScheduled && daysUntil(tx.occDate, today) < 0
            ? 'text-red-500 dark:text-red-400 font-medium'
            : !isScheduled && daysUntil(tx.occDate, today) === 0
            ? 'text-amber-500 dark:text-amber-400 font-medium'
            : 'text-earth-400 dark:text-earth-500'
        }`}>
          {categoryName} · {label}
        </p>
      </div>

      {/* Valor */}
      <span className={`text-xs font-semibold shrink-0 ${
        isIncome ? 'text-positive dark:text-positive-dark' : 'text-earth-600 dark:text-earth-300'
      }`}>
        {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
      </span>
    </div>
  )
}

export default function UpcomingCard({ transactions, categories, isPaid, onToggle }) {
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const today     = now.toISOString().split('T')[0]
  const nxtYM     = nextMonthYM(currentYM)

  // Recurring non-installment transactions for this month
  const allRecurring = getUpcomingRecurring(transactions, currentYM).filter(tx => !tx.isInstallment)

  // Confirmed → show next month; pending → show current
  const items = allRecurring.map(tx => {
    const paid = isPaid(tx.id, currentYM)
    if (paid) {
      const nextOcc = getRecurringOccurrenceDate(tx, nxtYM)
      return { ...tx, occDate: nextOcc, isScheduled: true }
    }
    return { ...tx, isScheduled: false }
  }).filter(tx => tx.occDate)

  const income   = items.filter(tx => tx.type === 'income')
  const expenses = items.filter(tx => tx.type !== 'income')

  // Installment purchases active this month
  const installments = transactions.filter(
    tx => tx.isInstallment && transactionOccursInMonth(tx, currentYM)
  )
  const faturaTotal = installments.reduce((sum, tx) => sum + tx.amount, 0)

  // Saldo confirmado do mês
  const confirmedIncome = allRecurring
    .filter(tx => tx.type === 'income' && isPaid(tx.id, currentYM))
    .reduce((s, tx) => s + tx.amount, 0)
  const confirmedFixed = allRecurring
    .filter(tx => tx.type !== 'income' && isPaid(tx.id, currentYM))
    .reduce((s, tx) => s + tx.amount, 0)
  const monthBalance = confirmedIncome - confirmedFixed - faturaTotal

  const getCatName  = (id) => categories.find(c => c.id === id)?.name || ''
  const pendingCount = items.filter(tx => !tx.isScheduled).length

  const hasItems  = allRecurring.length > 0
  const hasFatura = installments.length > 0

  if (!hasItems && !hasFatura) {
    return (
      <Card>
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
    <Card>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-earth-500 dark:text-earth-400" />
          <p className="text-sm font-medium text-earth-700 dark:text-earth-300">Lembretes</p>
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-medium text-earth-500 dark:text-earth-400 bg-earth-100 dark:bg-earth-700 px-2 py-0.5 rounded-full">
            {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        {/* Entradas */}
        {income.length > 0 && (
          <>
            <p className="text-xs font-semibold text-positive dark:text-positive-dark uppercase tracking-wider pt-1 pb-1 px-2">
              Entradas
            </p>
            {income.map(tx => (
              <UpcomingItem
                key={tx.id}
                tx={tx}
                categoryName={getCatName(tx.categoryId)}
                isScheduled={tx.isScheduled}
                onToggle={(id) => onToggle(id, currentYM)}
                today={today}
              />
            ))}
          </>
        )}

        {/* Saídas fixas */}
        {expenses.length > 0 && (
          <>
            <p className="text-xs font-semibold text-earth-500 dark:text-earth-400 uppercase tracking-wider pt-2 pb-1 px-2">
              Saídas Fixas
            </p>
            {expenses.map(tx => (
              <UpcomingItem
                key={tx.id}
                tx={tx}
                categoryName={getCatName(tx.categoryId)}
                isScheduled={tx.isScheduled}
                onToggle={(id) => onToggle(id, currentYM)}
                today={today}
              />
            ))}
          </>
        )}

        {/* Fatura do Cartão */}
        {hasFatura && (
          <div className={`${hasItems ? 'pt-3 mt-1 border-t border-earth-100 dark:border-earth-700' : 'pt-1'}`}>
            <div className="flex items-center gap-2 mb-2 px-2">
              <CreditCard size={13} className="text-earth-400 dark:text-earth-500 shrink-0" />
              <p className="text-xs font-semibold text-earth-500 dark:text-earth-400 uppercase tracking-wider flex-1">
                Fatura do Cartão
              </p>
              <span className="text-xs font-bold text-earth-700 dark:text-earth-200">
                −{formatCurrency(faturaTotal)}
              </span>
            </div>
            <div className="bg-earth-50 dark:bg-earth-700/40 rounded-xl overflow-hidden">
              {installments.map((tx, i) => (
                <div
                  key={tx.id}
                  className={`flex items-center gap-3 px-3 py-2 ${
                    i < installments.length - 1 ? 'border-b border-earth-100 dark:border-earth-700' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-earth-700 dark:text-earth-300 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-earth-400 dark:text-earth-500">
                      parcela {getInstallmentNumber(tx, currentYM)}/{tx.installments}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-earth-600 dark:text-earth-300 shrink-0">
                    −{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saldo confirmado do mês */}
        {(hasItems || hasFatura) && (
          <div className="pt-3 mt-1 border-t border-earth-100 dark:border-earth-700 space-y-1.5">
            <p className="text-xs font-semibold text-earth-500 dark:text-earth-400 uppercase tracking-wider px-2 pb-0.5">
              Saldo do Mês
            </p>
            {hasItems && confirmedIncome > 0 && (
              <div className="flex justify-between text-xs px-2">
                <span className="text-earth-400 dark:text-earth-500">Receitas confirmadas</span>
                <span className="text-positive dark:text-positive-dark font-medium">+{formatCurrency(confirmedIncome)}</span>
              </div>
            )}
            {hasItems && confirmedFixed > 0 && (
              <div className="flex justify-between text-xs px-2">
                <span className="text-earth-400 dark:text-earth-500">Saídas confirmadas</span>
                <span className="text-earth-600 dark:text-earth-300 font-medium">−{formatCurrency(confirmedFixed)}</span>
              </div>
            )}
            {hasFatura && (
              <div className="flex justify-between text-xs px-2">
                <span className="text-earth-400 dark:text-earth-500">Fatura cartão</span>
                <span className="text-earth-600 dark:text-earth-300 font-medium">−{formatCurrency(faturaTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 px-2 border-t border-earth-100 dark:border-earth-700">
              <span className="text-xs font-semibold text-earth-600 dark:text-earth-300">Total confirmado</span>
              <div className="flex items-center gap-1.5">
                {monthBalance >= 0
                  ? <TrendingUp size={12} className="text-positive dark:text-positive-dark" />
                  : <TrendingDown size={12} className="text-negative dark:text-negative-dark" />
                }
                <span className={`text-sm font-bold ${
                  monthBalance >= 0
                    ? 'text-positive dark:text-positive-dark'
                    : 'text-negative dark:text-negative-dark'
                }`}>
                  {monthBalance >= 0 ? '+' : '−'}{formatCurrency(Math.abs(monthBalance))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
