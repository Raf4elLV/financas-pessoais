import { formatPhone } from '../../utils/masks'
import { INPUT_CLASS } from '../../utils/ui'

/**
 * Input de telefone com máscara automática "(11) 99999-9999".
 * Props:
 *   value     – string de dígitos ou formatada
 *   onChange  – callback(string) com valor formatado
 *   required  – bool
 */
export default function PhoneInput({ value, onChange, required }) {
  function handleChange(e) {
    onChange(formatPhone(e.target.value))
  }

  return (
    <input
      className={INPUT_CLASS}
      type="tel"
      placeholder="(11) 99999-9999"
      value={value}
      onChange={handleChange}
      required={required}
    />
  )
}
