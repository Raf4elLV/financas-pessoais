const TYPE_CONFIG = {
  income: {
    label: 'Receita',
    className: 'bg-positive-light dark:bg-positive-darkbg text-positive dark:text-positive-dark',
  },
  fixed_expense: {
    label: 'Despesa Fixa',
    className: 'bg-earth-100 dark:bg-earth-700 text-earth-600 dark:text-earth-300',
  },
  variable_expense: {
    label: 'Despesa Variável',
    className: 'bg-negative-light dark:bg-negative-darkbg text-negative dark:text-negative-dark',
  },
}

export default function Badge({ type, className = '' }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.variable_expense
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.label}
    </span>
  )
}
