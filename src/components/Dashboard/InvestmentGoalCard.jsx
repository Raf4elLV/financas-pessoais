import { useState } from 'react'
import { Target, Plus, TrendingUp } from 'lucide-react'
import Card from '../UI/Card'
import InvestModal from '../Goals/InvestModal'
import { formatCurrency } from '../../utils/formatters'
import { calcGoalProgress } from '../../utils/calculations'

function GoalItem({ goal, onInvest }) {
  const { progressPct, estimatedDate } = calcGoalProgress(goal)
  const done = progressPct >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-earth-700 dark:text-earth-300 truncate">{goal.name}</span>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <span className="text-xs text-earth-500 dark:text-earth-400">{Math.round(progressPct)}%</span>
          {!done && (
            <button
              onClick={() => onInvest(goal)}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-earth-500 dark:text-earth-400 border border-earth-200 dark:border-earth-600 rounded-lg hover:bg-earth-50 dark:hover:bg-earth-700 hover:border-earth-400 dark:hover:border-earth-400 hover:text-earth-700 dark:hover:text-earth-200 transition-colors shrink-0"
              title="Registrar aporte"
            >
              <TrendingUp size={11} />
              Aporte
            </button>
          )}
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-earth-100 dark:bg-earth-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${done ? 'bg-positive dark:bg-positive-dark' : 'bg-earth-400 dark:bg-earth-500'}`}
          style={{ width: `${Math.min(100, progressPct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-earth-400 dark:text-earth-500">
        <span>{formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}</span>
        {estimatedDate && <span>{done ? '✓ Atingida' : estimatedDate}</span>}
      </div>
    </div>
  )
}

export default function InvestmentGoalCard({ goals, goalsState, setActivePage }) {
  const { updateGoal } = goalsState
  const [investGoal, setInvestGoal] = useState(null)

  function handleConfirmInvest(id, amount) {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    updateGoal(id, { currentAmount: goal.currentAmount + amount })
  }

  const visibleGoals = goals.slice(0, 3)
  const totalInvested = goals.reduce((s, g) => s + g.currentAmount, 0)
  const totalTarget   = goals.reduce((s, g) => s + g.targetAmount, 0)
  const overallPct    = totalTarget > 0 ? Math.min(100, (totalInvested / totalTarget) * 100) : 0

  return (
    <>
      <Card className="h-full flex flex-col">
        {/* Cabeçalho */}
        <div className="flex items-center gap-2 mb-4 shrink-0">
          <Target size={15} className="text-earth-500 dark:text-earth-400" />
          <p className="text-sm font-medium text-earth-700 dark:text-earth-300">Metas de Investimento</p>
        </div>

        {goals.length === 0 ? (
          /* Sem metas: CTA centralizado + filler */
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-earth-100 dark:bg-earth-700 flex items-center justify-center">
              <Target size={22} className="text-earth-400 dark:text-earth-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-earth-600 dark:text-earth-400">Nenhuma meta ainda</p>
              <p className="text-xs text-earth-400 dark:text-earth-500 mt-0.5">
                Defina objetivos e acompanhe seu progresso
              </p>
            </div>
            <button
              onClick={() => setActivePage('goals')}
              className="flex items-center gap-1.5 text-xs font-medium text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 transition-colors px-3 py-1.5 rounded-xl border border-earth-200 dark:border-earth-600 hover:border-earth-300 dark:hover:border-earth-500"
            >
              <Plus size={13} /> Criar primeira meta
            </button>
          </div>
        ) : (
          <>
            {/* Lista de metas */}
            <div className="space-y-4 shrink-0">
              {visibleGoals.map(goal => (
                <GoalItem key={goal.id} goal={goal} onInvest={setInvestGoal} />
              ))}
            </div>

            {/* Espaço flexível */}
            <div className="flex-1" />

            {/* Resumo geral — preenche o espaço vazio */}
            <div className="mt-4 pt-4 border-t border-earth-100 dark:border-earth-700 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs text-earth-400 dark:text-earth-500">
                <span>Total acumulado</span>
                <span className="font-medium text-earth-600 dark:text-earth-300">
                  {formatCurrency(totalInvested)} / {formatCurrency(totalTarget)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-earth-100 dark:bg-earth-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-earth-400 dark:bg-earth-500 transition-all"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-earth-400 dark:text-earth-500">
                  {Math.round(overallPct)}% do total
                </span>
                {goals.length > 3 ? (
                  <button
                    onClick={() => setActivePage('goals')}
                    className="text-xs text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
                  >
                    +{goals.length - 3} mais →
                  </button>
                ) : (
                  <button
                    onClick={() => setActivePage('goals')}
                    className="flex items-center gap-1 text-xs text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
                  >
                    <Plus size={11} /> Nova meta
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <InvestModal
        isOpen={!!investGoal}
        onClose={() => setInvestGoal(null)}
        goal={investGoal}
        onConfirm={handleConfirmInvest}
      />
    </>
  )
}
