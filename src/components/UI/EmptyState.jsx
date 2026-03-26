export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-earth-100 dark:bg-earth-700 flex items-center justify-center mb-4">
          <Icon size={22} className="text-earth-400 dark:text-earth-500" />
        </div>
      )}
      <p className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-1">{title}</p>
      {description && (
        <p className="text-xs text-earth-400 dark:text-earth-500 mb-4 max-w-xs">{description}</p>
      )}
      {action}
    </div>
  )
}
