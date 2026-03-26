/**
 * Funções puras de formatação / máscara para inputs.
 * Sem efeitos colaterais — recebem string/number, retornam string formatada.
 */

// ─── Moeda BRL ──────────────────────────────────────────────────────────────

/** Converte valor numérico → display "R$ 1.234,56". Retorna '' para 0/null/undefined. */
export function currencyToDisplay(value) {
  if (!value) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

/**
 * Processa o evento de digitação em um campo de moeda.
 * Retorna { display: string, value: number }.
 * Uso: onChange(e) → { display, value } → setDisplay(display); onChange(value)
 */
export function parseCurrencyInput(rawInput) {
  const digits = String(rawInput).replace(/\D/g, '').slice(0, 12)
  if (!digits) return { display: '', value: 0 }
  const value = parseInt(digits, 10) / 100
  const display = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  return { display, value }
}

// ─── Telefone BR ─────────────────────────────────────────────────────────────

/** Converte string de dígitos → máscara "(11) 99999-9999" ou "(11) 9999-9999". */
export function formatPhone(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2)  return `(${digits}`
  if (digits.length <= 6)  return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/** Extrai apenas dígitos de uma string de telefone. */
export function stripPhone(formatted) {
  return String(formatted).replace(/\D/g, '')
}
