import { useMemo } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import Card from '../UI/Card'
import { formatCurrency } from '../../utils/formatters'
import {
  calcDailyChartData,
  calcDailyForMonthChartData,
  calcYearlyChartData,
  calcWeeklyChartData,
} from '../../utils/calculations'

const TITLES = {
  week:  'Evolução Diária',
  month: 'Evolução Mensal',
  year:  'Evolução Anual',
}

function CustomTooltip({ active, label, labelMap, chartData }) {
  if (!active) return null
  const point = chartData?.find(d => d.day === label)
  if (!point) return null

  const income   = point.income ?? 0
  const fixed    = Math.abs(point.fixedExpense ?? 0)
  const variable = Math.abs(point.variableExpense ?? 0)
  const expense  = fixed + variable
  const net      = income - expense

  if (income === 0 && expense === 0) return null

  // Usa a data completa (ex: "05/03") quando disponível, senão fallback para o label do eixo
  const header = point.dateLabel ?? labelMap?.[label] ?? String(label)

  return (
    <div className="bg-white dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-2xl p-3.5 shadow-xl text-xs min-w-[170px]">
      <p className="font-semibold text-earth-700 dark:text-earth-200 mb-2.5">
        {header}
      </p>

      {income > 0 && (
        <div className="flex items-center justify-between gap-6 mb-1.5">
          <span className="flex items-center gap-1.5 text-earth-400 dark:text-earth-500">
            <span className="w-2 h-2 rounded-full bg-[#6BAF6B] inline-block" />
            Receitas
          </span>
          <span className="font-medium text-positive dark:text-positive-dark">
            +{formatCurrency(income)}
          </span>
        </div>
      )}

      {fixed > 0 && (
        <div className="flex items-center justify-between gap-6 mb-1.5">
          <span className="flex items-center gap-1.5 text-earth-400 dark:text-earth-500">
            <span className="w-2 h-2 rounded-full bg-[#C9B9AA] inline-block" />
            Desp. Fixas
          </span>
          <span className="font-medium text-earth-600 dark:text-earth-400">
            −{formatCurrency(fixed)}
          </span>
        </div>
      )}

      {variable > 0 && (
        <div className="flex items-center justify-between gap-6 mb-1.5">
          <span className="flex items-center gap-1.5 text-earth-400 dark:text-earth-500">
            <span className="w-2 h-2 rounded-full bg-[#C47A6A] inline-block" />
            Desp. Variáveis
          </span>
          <span className="font-medium text-earth-600 dark:text-earth-400">
            −{formatCurrency(variable)}
          </span>
        </div>
      )}

      <div className={`flex items-center justify-between mt-2.5 pt-2.5 border-t ${
        net >= 0
          ? 'border-earth-100 dark:border-earth-700'
          : 'border-earth-100 dark:border-earth-700'
      }`}>
        <span className="font-semibold text-earth-600 dark:text-earth-300">Resultado</span>
        <span className={`font-bold ${net >= 0 ? 'text-positive dark:text-positive-dark' : 'text-negative dark:text-negative-dark'}`}>
          {net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(net))}
        </span>
      </div>
    </div>
  )
}

export default function FinancialChart({ transactions, periodType = 'month', periodRef }) {
  const rawData = useMemo(() => {
    if (periodType === 'week')  return calcDailyChartData(transactions, periodRef)
    if (periodType === 'month') return calcDailyForMonthChartData(transactions, periodRef)
    if (periodType === 'year')  return calcYearlyChartData(transactions, periodRef)
    return calcWeeklyChartData(transactions, 13)
  }, [transactions, periodType, periodRef])

  // Merge expenses into one key for the bar; keep originals for tooltip
  const chartData = useMemo(() =>
    rawData.map(d => ({
      ...d,
      totalExpense: d.fixedExpense + d.variableExpense, // negative number
    }))
  , [rawData])

  // Period summary
  const summary = useMemo(() => {
    const income  = rawData.reduce((s, d) => s + d.income, 0)
    const expense = rawData.reduce((s, d) => s + Math.abs(d.fixedExpense) + Math.abs(d.variableExpense), 0)
    return { income, expense, balance: income - expense }
  }, [rawData])

  const title = TITLES[periodType] || 'Evolução'

  const { xTicks, labelMap, xDomain } = useMemo(() => {
    const allDays  = rawData.map(d => d.day)
    const labelMap = Object.fromEntries(rawData.map(d => [d.day, d.label]))
    if (!rawData.length) return { xTicks: [], labelMap, xDomain: ['auto', 'auto'] }
    const min  = Math.min(...allDays)
    const max  = Math.max(...allDays)
    const step = allDays.length > 1 ? (max - min) / (allDays.length - 1) : 1
    // Sempre inclui todos os dias como ticks para que o Recharts posicione
    // as barras em todos os pontos; o tickFormatter omite o texto nos dias sem label.
    return { xTicks: allDays, labelMap, xDomain: [min - step / 2, max + step / 2] }
  }, [rawData])

  const hasData = rawData.some(d => d.income > 0 || d.fixedExpense < 0 || d.variableExpense < 0)

  const tickFmt = (v) => {
    const abs = Math.abs(v)
    if (abs === 0) return 'R$0'
    const s = abs >= 1000 ? `${(abs / 1000).toFixed(0)}k` : String(abs)
    return `${v < 0 ? '-' : ''}R$${s}`
  }

  const balanceColor = summary.balance >= 0 ? 'text-positive dark:text-positive-dark' : 'text-negative dark:text-negative-dark'

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <p className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3 shrink-0">{title}</p>

      {/* Summary pills */}
      <div className="grid grid-cols-3 gap-2 mb-4 shrink-0">
        <div className="bg-earth-50 dark:bg-earth-700/50 rounded-xl px-3 py-2.5">
          <p className="text-xs text-earth-400 dark:text-earth-500 mb-0.5">Receitas</p>
          <p className="text-sm font-bold text-positive dark:text-positive-dark leading-tight">
            +{formatCurrency(summary.income)}
          </p>
        </div>
        <div className="bg-earth-50 dark:bg-earth-700/50 rounded-xl px-3 py-2.5">
          <p className="text-xs text-earth-400 dark:text-earth-500 mb-0.5">Despesas</p>
          <p className="text-sm font-bold text-negative dark:text-negative-dark leading-tight">
            −{formatCurrency(summary.expense)}
          </p>
        </div>
        <div className="bg-earth-50 dark:bg-earth-700/50 rounded-xl px-3 py-2.5">
          <p className="text-xs text-earth-400 dark:text-earth-500 mb-0.5">Resultado</p>
          <p className={`text-sm font-bold leading-tight ${balanceColor}`}>
            {summary.balance >= 0 ? '+' : '−'}{formatCurrency(Math.abs(summary.balance))}
          </p>
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0 relative">
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-xs text-earth-300 dark:text-earth-600">Sem transações neste período</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barGap={3}>
            <defs>
              <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#6BAF6B" stopOpacity={1}   />
                <stop offset="100%" stopColor="#7DAB7D" stopOpacity={0.7} />
              </linearGradient>
              <linearGradient id="gradExpense" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%"   stopColor="#C47A6A" stopOpacity={1}   />
                <stop offset="100%" stopColor="#D4896A" stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#E5DDD5"
              strokeOpacity={0.35}
              vertical={false}
            />
            <ReferenceLine y={0} stroke="#C9B9AA" strokeWidth={1.5} />

            <XAxis
              dataKey="day"
              type="number"
              scale="linear"
              domain={xDomain}
              ticks={xTicks}
              tickFormatter={(v) => labelMap[v] ?? ''}
              tick={{ fontSize: 10, fill: '#A89078' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#A89078' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={tickFmt}
              width={50}
              domain={hasData ? ['auto', 'auto'] : [-10, 10]}
            />

            <Tooltip
              content={<CustomTooltip labelMap={labelMap} chartData={chartData} />}
              cursor={{ fill: '#A89078', fillOpacity: 0.06, radius: 8 }}
            />

            <Bar dataKey="income"       fill="url(#gradIncome)"  radius={[3, 3, 0, 0]} barSize={periodType === 'month' ? 5 : 13} />
            <Bar dataKey="totalExpense" fill="url(#gradExpense)" radius={[0, 0, 3, 3]} barSize={periodType === 'month' ? 5 : 13} />

            <Line
              dataKey="cumulative"
              name="Resultado"
              type="monotone"
              stroke="#5B8CB8"
              strokeWidth={2.5}
              dot={{ fill: '#5B8CB8', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#5B8CB8', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-3 shrink-0">
        <span className="flex items-center gap-1.5 text-xs text-earth-400 dark:text-earth-500">
          <span className="w-2.5 h-2.5 rounded-[3px] inline-block bg-[#6BAF6B]" />
          Receitas
        </span>
        <span className="flex items-center gap-1.5 text-xs text-earth-400 dark:text-earth-500">
          <span className="w-2.5 h-2.5 rounded-[3px] inline-block bg-[#C47A6A]" />
          Despesas
        </span>
        <span className="flex items-center gap-1.5 text-xs text-earth-400 dark:text-earth-500">
          <span className="inline-block w-5 h-0.5 rounded bg-[#5B8CB8]" />
          Resultado
        </span>
      </div>
    </Card>
  )
}
