import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { INPUT_CLASS } from '../../utils/ui'

export default function PasswordInput({ value, onChange, placeholder, required, className, autoFocus, ...props }) {
  const [show, setShow] = useState(false)
  const base = className ?? INPUT_CLASS

  return (
    <div className="relative">
      <input
        {...props}
        className={`${base} pr-10`}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}
