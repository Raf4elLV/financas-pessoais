import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MONTH_NAMES } from '../../utils/formatters'

export default function PeriodFilter({ periodType, setPeriodType, periodRef, setPeriodRef }) {
  const types = [
    { id: 'week',  label: 'Semana' },
    { id: 'month', label: 'Mês' },
    { id: 'year',  label: 'Ano' },
  ]

  function navigate(dir) {
    if (periodType === 'month') {
      const [y, m] = periodRef.split('-').map(Number)
      const d = new Date(y, m - 1 + dir, 1)
      setPeriodRef(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    } else if (periodType === 'year') {
      setPeriodRef(String(parseInt(periodRef) + dir))
    } else if (periodType === 'week') {
      const d = new Date(periodRef + 'T00:00:00')
      d.setDate(d.getDate() + dir * 7)
      setPeriodRef(d.toISOString().split('T')[0])
    }
  }

  function getLabel() {
    if (periodType === 'month') {
      const [y, m] = periodRef.split('-').map(Number)
      return `${MONTH_NAMES[m - 1]} ${y}`
    }
    if (periodType === 'year') return periodRef
    if (periodType === 'week') {
      const start = new Date(periodRef + 'T00:00:00')
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      const fmt = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      return `${fmt(start)} – ${fmt(end)}`
    }
    return ''
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Tipo de período */}
      <div className="flex rounded-xl border border-earth-200 dark:border-earth-700 overflow-hidden bg-earth-50 dark:bg-earth-800">
        {types.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => {
              setPeriodType(id)
              const now = new Date()
              if (id === 'month') {
                setPeriodRef(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
              } else if (id === 'year') {
                setPeriodRef(String(now.getFullYear()))
              } else {
                const day = now.getDay()
                const monday = new Date(now)
                monday.setDate(now.getDate() - ((day + 6) % 7))
                setPeriodRef(monday.toISOString().split('T')[0])
              }
            }}
            className={`px-3 py-2 text-xs font-medium transition-colors
              ${periodType === id
                ? 'bg-earth-500 text-white'
                : 'text-earth-500 dark:text-earth-400 hover:text-earth-700 dark:hover:text-earth-200'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Navegação */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
          aria-label="Período anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-earth-700 dark:text-earth-300 min-w-[110px] sm:min-w-[140px] text-center tabular-nums">
          {getLabel()}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-xl text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
          aria-label="Próximo período"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
