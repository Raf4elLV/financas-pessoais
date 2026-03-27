/**
 * Verifica se uma transação recorrente ocorre em um dado mês (YYYY-MM).
 */
export function transactionOccursInMonth(tx, yearMonth) {
  const txYearMonth = tx.date.slice(0, 7)
  if (!tx.recurrent) return txYearMonth === yearMonth
  if (txYearMonth > yearMonth) return false
  if (tx.endDate && yearMonth > tx.endDate.slice(0, 7)) return false
  return true
}

/**
 * Calcula a data de ocorrência de uma transação recorrente em um mês específico.
 * Retorna string "YYYY-MM-DD" ou null se não ocorre naquele mês.
 */
export function getRecurringOccurrenceDate(tx, yearMonth) {
  if (!transactionOccursInMonth(tx, yearMonth)) return null
  const occDay = tx.recurrenceDay || parseInt(tx.date.split('-')[2])
  const [y, m] = yearMonth.split('-').map(Number)
  const maxDay = new Date(y, m, 0).getDate()
  const clampedDay = Math.min(occDay, maxDay)
  return `${yearMonth}-${String(clampedDay).padStart(2, '0')}`
}

/**
 * Filtra transações para um período (semana, mês ou ano).
 */
export function getTransactionsForPeriod(transactions, periodType, periodRef) {
  if (periodType === 'month') {
    return transactions.filter(tx => transactionOccursInMonth(tx, periodRef))
  }

  if (periodType === 'year') {
    const months = Array.from({ length: 12 }, (_, i) =>
      `${periodRef}-${String(i + 1).padStart(2, '0')}`
    )
    const seen = new Set()
    const result = []
    for (const month of months) {
      for (const tx of transactions) {
        if (!seen.has(tx.id + month) && transactionOccursInMonth(tx, month)) {
          result.push({ ...tx, _occurrenceMonth: month })
          seen.add(tx.id + month)
        }
      }
    }
    return result
  }

  if (periodType === 'week') {
    const start = new Date(periodRef + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const endStr = end.toISOString().split('T')[0]

    return transactions.filter(tx => {
      if (!tx.recurrent) return tx.date >= periodRef && tx.date <= endStr
      // Semana pode cruzar dois meses
      const months = new Set()
      const d = new Date(periodRef + 'T00:00:00')
      while (d.toISOString().split('T')[0] <= endStr) {
        months.add(d.toISOString().slice(0, 7))
        d.setDate(d.getDate() + 1)
      }
      for (const ym of months) {
        const occDate = getRecurringOccurrenceDate(tx, ym)
        if (occDate && occDate >= periodRef && occDate <= endStr) return true
      }
      return false
    })
  }

  return transactions
}

/**
 * Calcula totais de um conjunto de transações.
 */
export function calcTotals(transactions) {
  let income = 0, fixedExpense = 0, variableExpense = 0
  for (const tx of transactions) {
    if (tx.type === 'income') income += tx.amount
    else if (tx.type === 'fixed_expense') fixedExpense += tx.amount
    else if (tx.type === 'variable_expense') variableExpense += tx.amount
  }
  return {
    income,
    fixedExpense,
    variableExpense,
    totalExpense: fixedExpense + variableExpense,
    balance: income - fixedExpense - variableExpense,
  }
}

// Helper interno: monta dado de uma fatia de transações para o gráfico
function _chartEntry(label, txs, day = 0) {
  const t = calcTotals(txs)
  return {
    label,
    day,
    income: t.income,
    fixedExpense: -t.fixedExpense,
    variableExpense: -t.variableExpense,
    balance: t.balance,
  }
}

// Helper interno: adiciona campo cumulative (resultado acumulado ao longo do intervalo)
function _addCumulative(data) {
  let cum = 0
  return data.map(d => {
    cum += d.balance
    return { ...d, cumulative: cum }
  })
}

// Helper interno: filtra transações de uma semana (startStr..endStr)
function _txsInWeek(transactions, startStr, endStr) {
  return transactions.filter(tx => {
    if (!tx.recurrent) return tx.date >= startStr && tx.date <= endStr
    const months = new Set()
    const d = new Date(startStr + 'T00:00:00')
    while (d.toISOString().split('T')[0] <= endStr) {
      months.add(d.toISOString().slice(0, 7))
      d.setDate(d.getDate() + 1)
    }
    for (const ym of months) {
      const occ = getRecurringOccurrenceDate(tx, ym)
      if (occ && occ >= startStr && occ <= endStr) return true
    }
    return false
  })
}

/**
 * Dados DIÁRIOS para uma semana (7 barras). periodRef = 'YYYY-MM-DD' (segunda-feira).
 */
export function calcDailyChartData(transactions, weekStartDate) {
  const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const raw = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStartDate + 'T00:00:00')
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    const txs = transactions.filter(tx => {
      if (!tx.recurrent) return tx.date === dateStr
      const occ = getRecurringOccurrenceDate(tx, dateStr.slice(0, 7))
      return occ === dateStr
    })
    return _chartEntry(`${DAYS[d.getDay()]} ${d.getDate()}`, txs, d.getDate())
  })
  return _addCumulative(raw)
}

/**
 * Dados DIÁRIOS para um mês (28-31 barras). periodRef = 'YYYY-MM'.
 * 1 ponto por dia; label exibido apenas nos dias 1, 7, 14, 21 e último.
 */
export function calcDailyForMonthChartData(transactions, yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  // Garante zero-padding independente de como yearMonth foi passado ('2026-4' ou '2026-04')
  const ym          = `${y}-${String(m).padStart(2, '0')}`
  const daysInMonth = new Date(y, m, 0).getDate()
  const labelDays   = new Set([1, 7, 14, 21, daysInMonth])

  const raw = Array.from({ length: daysInMonth }, (_, i) => {
    const day       = i + 1
    const dayPad    = String(day).padStart(2, '0')
    const dateStr   = `${ym}-${dayPad}`
    const dateLabel = `${dayPad}/${String(m).padStart(2, '0')}`   // ex: "05/03" — para o tooltip
    const txs = transactions.filter(tx => {
      if (!tx.recurrent) return tx.date === dateStr
      const occ = getRecurringOccurrenceDate(tx, ym)
      return occ === dateStr
    })
    // Nos dias âncora exibe o número no eixo; nos outros deixa vazio
    const label = labelDays.has(day) ? dayPad : ''
    return { ..._chartEntry(label, txs, day), dateLabel }
  })
  return _addCumulative(raw)
}

/**
 * Dados SEMANAIS para um mês (4-5 barras). periodRef = 'YYYY-MM'.
 * @deprecated — substituído por calcDailyForMonthChartData
 */
export function calcWeeklyForMonthChartData(transactions, yearMonth) {
  const [y, m] = yearMonth.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const lastDay  = new Date(y, m, 0)

  // Encontra a segunda-feira da semana que contém o dia 1
  const firstMonday = new Date(firstDay)
  firstMonday.setDate(firstDay.getDate() - ((firstDay.getDay() + 6) % 7))

  const weeks = []
  let cur = new Date(firstMonday)
  while (cur <= lastDay) {
    const startStr = cur.toISOString().split('T')[0]
    const end = new Date(cur); end.setDate(cur.getDate() + 6)
    const endStr = end.toISOString().split('T')[0]
    // Label: primeiro dia útil da semana que cai no mês
    const labelDay = new Date(Math.max(cur.getTime(), firstDay.getTime()))
    const label = `${String(labelDay.getDate()).padStart(2, '0')}/${String(labelDay.getMonth() + 1).padStart(2, '0')}`
    weeks.push({ startStr, endStr, label, day: labelDay.getDate() })
    cur.setDate(cur.getDate() + 7)
  }

  const raw = weeks.map(({ startStr, endStr, label, day }) =>
    _chartEntry(label, _txsInWeek(transactions, startStr, endStr), day)
  )
  return _addCumulative(raw)
}

/**
 * Dados MENSAIS para um ano (12 barras). periodRef = 'YYYY'.
 */
export function calcYearlyChartData(transactions, year) {
  const SHORTS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const raw = Array.from({ length: 12 }, (_, i) => {
    const ym = `${year}-${String(i + 1).padStart(2, '0')}`
    const txs = transactions.filter(tx => transactionOccursInMonth(tx, ym))
    return _chartEntry(SHORTS[i], txs, i + 1)
  })
  return _addCumulative(raw)
}

/**
 * Calcula dados semanais para o gráfico (últimas N semanas) — usado como fallback.
 * Despesas são retornadas como valores negativos para o gráfico.
 */
export function calcWeeklyChartData(transactions, nWeeks = 13) {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const currentMonday = new Date(now)
  currentMonday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))
  currentMonday.setHours(0, 0, 0, 0)

  const weeks = []
  for (let i = nWeeks - 1; i >= 0; i--) {
    const start = new Date(currentMonday)
    start.setDate(currentMonday.getDate() - i * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    weeks.push({
      startStr: start.toISOString().split('T')[0],
      endStr: end.toISOString().split('T')[0],
      startDate: start,
    })
  }

  const raw = weeks.map(({ startStr, endStr, startDate }, idx) => {
    const txsInWeek = _txsInWeek(transactions, startStr, endStr)
    const label = startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      .replace(/\.$/, '')
    return _chartEntry(label, txsInWeek, idx + 1)
  })
  return _addCumulative(raw)
}

/**
 * Previsão do próximo mês: receita recorrente − despesas fixas recorrentes.
 */
export function calcForecast(transactions) {
  const now = new Date()
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nextYM = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`

  const incomeTxs = transactions.filter(
    tx => tx.type === 'income' && tx.recurrent && transactionOccursInMonth(tx, nextYM)
  )
  const forecastIncome = incomeTxs.reduce((s, tx) => s + tx.amount, 0)

  const fixedTxs = transactions.filter(
    tx => tx.type === 'fixed_expense' && tx.recurrent && transactionOccursInMonth(tx, nextYM)
  )
  const forecastFixed = fixedTxs.reduce((s, tx) => s + tx.amount, 0)

  return {
    forecastIncome,
    forecastFixed,
    forecastBalance: forecastIncome - forecastFixed,
    nextYM,
  }
}

/**
 * Retorna transações recorrentes do mês atual com data de ocorrência calculada.
 */
export function getUpcomingRecurring(transactions, yearMonth) {
  return transactions
    .filter(tx => tx.recurrent && transactionOccursInMonth(tx, yearMonth))
    .map(tx => {
      const occDate = getRecurringOccurrenceDate(tx, yearMonth)
      return { ...tx, occDate }
    })
    .filter(tx => tx.occDate)
    .sort((a, b) => a.occDate.localeCompare(b.occDate))
}

/**
 * Retorna o número da parcela atual de uma compra parcelada em um dado mês (YYYY-MM).
 */
export function getInstallmentNumber(tx, yearMonth) {
  const [sy, sm] = tx.date.slice(0, 7).split('-').map(Number)
  const [ty, tm] = yearMonth.split('-').map(Number)
  const diff = (ty - sy) * 12 + (tm - sm) + 1
  return Math.min(Math.max(1, diff), tx.installments)
}

/**
 * Calcula a data de término de uma compra parcelada.
 * Retorna 'YYYY-MM-DD' (último dia do mês da última parcela).
 */
export function computeInstallmentEndDate(startDate, installments) {
  const [y, m] = startDate.split('-').map(Number)
  const totalMonths = m + (installments - 1)
  const endYear = y + Math.floor((totalMonths - 1) / 12)
  const endMonth = ((totalMonths - 1) % 12) + 1
  const lastDay = new Date(endYear, endMonth, 0).getDate()
  return `${endYear}-${String(endMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
}

/**
 * Calcula progresso de uma meta de investimento.
 */
export function calcGoalProgress(goal) {
  const { targetAmount, currentAmount, monthlyContribution } = goal
  const remaining = Math.max(0, targetAmount - currentAmount)
  const progressPct = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0

  let monthsToGoal = null
  let estimatedDate = null

  if (monthlyContribution > 0 && remaining > 0) {
    monthsToGoal = Math.ceil(remaining / monthlyContribution)
    const now = new Date()
    const target = new Date(now.getFullYear(), now.getMonth() + monthsToGoal, 1)
    estimatedDate = target.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  } else if (remaining <= 0) {
    monthsToGoal = 0
    estimatedDate = 'Meta atingida!'
  }

  return { remaining, progressPct, monthsToGoal, estimatedDate }
}
