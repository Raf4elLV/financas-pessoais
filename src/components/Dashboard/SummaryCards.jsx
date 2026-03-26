import { TrendingUp, TrendingDown, Lock, BarChart2 } from 'lucide-react'
import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'

function SummaryCard({ label, value, icon: Icon, variant = 'neutral' }) {
  const variants = {
    income:   'text-positive dark:text-positive-dark',
    expense:  'text-negative dark:text-negative-dark',
    fixed:    'text-earth-600 dark:text-earth-300',
    neutral:  'text-earth-800 dark:text-earth-100',
    positive: 'text-positive dark:text-positive-dark',
    negative: 'text-negative dark:text-negative-dark',
  }

  const iconBg = {
    income:   'bg-positive-light dark:bg-positive-darkbg text-positive dark:text-positive-dark',
    expense:  'bg-negative-light dark:bg-negative-darkbg text-negative dark:text-negative-dark',
    fixed:    'bg-earth-100 dark:bg-earth-700 text-earth-500 dark:text-earth-400',
    neutral:  'bg-earth-100 dark:bg-earth-700 text-earth-500 dark:text-earth-400',
    positive: 'bg-positive-light dark:bg-positive-darkbg text-positive dark:text-positive-dark',
    negative: 'bg-negative-light dark:bg-negative-darkbg text-negative dark:text-negative-dark',
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-earth-500 dark:text-earth-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg[variant]}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className={`text-xl font-semibold tracking-tight ${variants[variant]}`}>
        {formatCurrency(value)}
      </p>
    </Card>
  )
}

export default function SummaryCards({ totals }) {
  const balanceVariant = totals.balance >= 0 ? 'positive' : 'negative'
  const BalanceIcon = totals.balance >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard label="Receitas"         value={totals.income}        icon={TrendingUp}   variant="income" />
      <SummaryCard label="Despesas Fixas"   value={totals.fixedExpense}  icon={Lock}         variant="fixed" />
      <SummaryCard label="Despesas Variáveis" value={totals.variableExpense} icon={BarChart2} variant="expense" />
      <SummaryCard label="Saldo"            value={totals.balance}       icon={BalanceIcon}  variant={balanceVariant} />
    </div>
  )
}
