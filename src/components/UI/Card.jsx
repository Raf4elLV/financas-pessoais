export default function Card({ children, className = '', onClick }) {
  const base = 'bg-white dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 p-5'
  const interactive = onClick ? 'cursor-pointer hover:border-earth-300 dark:hover:border-earth-600 transition-colors' : ''

  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}
