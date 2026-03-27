import { useState } from 'react'
import { Plus } from 'lucide-react'
import { getWelcomeMessage } from '../../utils/welcome'
import SummaryCards from './SummaryCards'
import PeriodFilter from './PeriodFilter'
import FinancialChart from './FinancialChart'
import ForecastCard from './ForecastCard'
import InvestmentGoalCard from './InvestmentGoalCard'
import BesteirasCard from './BesteirasCard'
import UpcomingCard from './UpcomingCard'
import TransactionForm from '../Transactions/TransactionForm'
import OnboardingTutorial from '../Onboarding/OnboardingTutorial'
import { getTransactionsForPeriod, calcTotals } from '../../utils/calculations'

function getDefaultPeriodRef(type) {
  const now = new Date()
  if (type === 'month') return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  if (type === 'year') return String(now.getFullYear())
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  return monday.toISOString().split('T')[0]
}

function todayFormatted() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase())
}

export default function Dashboard({ transactionsState, categoriesState, goalsState, besteirasState, paymentStatus, setActivePage, currentUser, toggleTheme, onMarkOnboarded }) {
  const { transactions, addTransaction } = transactionsState
  const { categories, getCategoriesByType } = categoriesState
  const { goals } = goalsState
  const { config: besteirasConfig, saveConfig: saveBesteirasConfig } = besteirasState
  const { isPaid, toggle } = paymentStatus

  const [periodType, setPeriodType] = useState('month')
  const [periodRef, setPeriodRef] = useState(() => getDefaultPeriodRef('month'))
  const [formOpen, setFormOpen] = useState(false)

  const [greeting] = useState(() => {
    if (!currentUser) return 'Dashboard'
    return getWelcomeMessage(currentUser.name.split(' ')[0], currentUser.id)
  })

  const filtered = getTransactionsForPeriod(transactions, periodType, periodRef)
  const totals = calcTotals(filtered)

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <OnboardingTutorial
        userId={currentUser.id}
        userName={currentUser.name.split(' ')[0]}
        isOnboarded={currentUser.onboarded}
        toggleTheme={toggleTheme}
        onDismiss={onMarkOnboarded}
      />
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100">{greeting}</h1>
          <p className="text-xs text-earth-400 dark:text-earth-500 mt-0.5 capitalize">{todayFormatted()}</p>
        </div>
        <button
          id="btn-nova-transacao"
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-earth-500 hover:bg-earth-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus size={15} />
          Nova Transação
        </button>
      </div>

      {/* Filtro de período */}
      <PeriodFilter
        periodType={periodType}
        setPeriodType={(t) => { setPeriodType(t); setPeriodRef(getDefaultPeriodRef(t)) }}
        periodRef={periodRef}
        setPeriodRef={setPeriodRef}
      />

      {/* Cards de resumo */}
      <SummaryCards totals={totals} />

      {/* Gráfico + coluna direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <div className="lg:col-span-2 h-full">
          <FinancialChart transactions={transactions} periodType={periodType} periodRef={periodRef} />
        </div>
        <div className="flex flex-col gap-4 h-full">
          <ForecastCard transactions={transactions} />
          <BesteirasCard
            config={besteirasConfig}
            transactions={transactions}
            categories={categories}
            onSaveConfig={saveBesteirasConfig}
          />
        </div>
      </div>

      {/* Calendário do mês + Metas lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div id="card-lembretes">
          <UpcomingCard
            transactions={transactions}
            categories={categories}
            isPaid={isPaid}
            onToggle={toggle}
          />
        </div>
        <InvestmentGoalCard goals={goals} goalsState={goalsState} setActivePage={setActivePage} />
      </div>

      <TransactionForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={addTransaction}
        categories={categories}
        getCategoriesByType={getCategoriesByType}
      />
    </div>
  )
}
