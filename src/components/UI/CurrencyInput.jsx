import { useState, useEffect } from 'react'
import { parseCurrencyInput, currencyToDisplay } from '../../utils/masks'
import { INPUT_CLASS } from '../../utils/ui'

/**
 * Input de moeda controlado.
 * Props:
 *   value       – número (ex: 1234.56)
 *   onChange    – callback(number) chamado a cada mudança
 *   placeholder – string opcional (ex: "R$ 0,00")
 *   required    – bool
 *   id          – string opcional
 */
export default function CurrencyInput({ value, onChange, placeholder = 'R$ 0,00', required, id }) {
  const [display, setDisplay] = useState(() => (value ? currencyToDisplay(value) : ''))

  // Sincroniza display quando value muda externamente (ex: reset de formulário)
  useEffect(() => {
    setDisplay(value ? currencyToDisplay(value) : '')
  }, [value])

  function handleChange(e) {
    const { display: d, value: v } = parseCurrencyInput(e.target.value)
    setDisplay(d)
    onChange(v)
  }

  return (
    <input
      id={id}
      className={INPUT_CLASS}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      required={required}
    />
  )
}
