// Formatação monetária BRL
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

// Formata número como "1.234,56"
export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Formata data YYYY-MM-DD → "15 jan. 2025"
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Formata data YYYY-MM-DD → "jan/2025"
export function formatMonthYear(dateStr) {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

// Retorna "YYYY-MM-DD" de hoje
export function today() {
  return new Date().toISOString().split('T')[0]
}

// Retorna "YYYY-MM" do mês atual
export function currentYearMonth() {
  return today().slice(0, 7)
}

// Adiciona N meses a uma data "YYYY-MM-DD", retorna "YYYY-MM-DD"
export function addMonths(dateStr, n) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1 + n, day)
  return d.toISOString().split('T')[0]
}

// Retorna nome do mês abreviado a partir de "YYYY-MM"
export function monthLabel(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'short' })
    .replace('.', '')
    .charAt(0).toUpperCase() +
    d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').slice(1)
}

// Rótulo de período para o gráfico
export function periodLabel(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

// Nomes dos meses em português
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
