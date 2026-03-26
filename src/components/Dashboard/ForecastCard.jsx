import { TrendingUp, TrendingDown, Zap } from 'lucide-react'
import Card from '../UI/Card'
import { formatCurrency, MONTH_NAMES } from '../../utils/formatters'
import { calcForecast } from '../../utils/calculations'

export default function ForecastCard({ transactions, className = '' }) {
  const { forecastIncome, forecastFixed, forecastBalance, nextYM } = calcForecast(transactions)
  const positive = forecastBalance >= 0

  const nextMonthName = (() => {
    const [, m] = nextYM.split('-').map(Number)
    return MONTH_NAMES[m - 1]
  })()

  return (
    <Card className={`h-full ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Zap size={15} className="text-earth-500 dark:text-earth-400" />
        <p className="text-sm font-medium text-earth-700 dark:text-earth-300">
          Previsão — {nextMonthName}
        </p>
      </div>

      <div className="space-y-2.5">
        <Row label="Receita prevista"  value={forecastIncome} isPositive />
        <Row label="Despesas fixas"    value={forecastFixed}  isNegative />

        <div className="border-t border-earth-100 dark:border-earth-700 pt-2.5 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-earth-700 dark:text-earth-300">Saldo projetado</span>
            <div className="flex items-center gap-1.5">
              {positive
                ? <TrendingUp size={13} className="text-positive dark:text-positive-dark" />
                : <TrendingDown size={13} className="text-negative dark:text-negative-dark" />
              }
              <span className={`text-sm font-bold ${positive
                ? 'text-positive dark:text-positive-dark'
                : 'text-negative dark:text-negative-dark'
              }`}>
                {formatCurrency(forecastBalance)}
              </span>
            </div>
          </div>
        </div>

        {forecastIncome === 0 && forecastFixed === 0 && (
          <p className="text-xs text-earth-400 dark:text-earth-500 pt-1">
            Adicione receitas e despesas fixas recorrentes para calcular a previsão.
          </p>
        )}
      </div>
    </Card>
  )
}

function Row({ label, value, isPositive, isNegative }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-earth-500 dark:text-earth-400">{label}</span>
      <span className={`text-xs font-medium ${
        isPositive ? 'text-positive dark:text-positive-dark' :
        isNegative ? 'text-negative dark:text-negative-dark' :
        'text-earth-700 dark:text-earth-300'
      }`}>
        {isNegative && value > 0 ? '−' : ''}{formatCurrency(value)}
      </span>
    </div>
  )
}
