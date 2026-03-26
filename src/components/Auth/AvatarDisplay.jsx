const AVATAR_COLORS = [
  'bg-earth-400', 'bg-earth-500', 'bg-earth-600',
  'bg-positive',  'bg-negative',
]

function colorFromId(id = '') {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

export default function AvatarDisplay({ user, size = 32, className = '' }) {
  const style = { width: size, height: size, fontSize: size * 0.36 }

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={style}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 text-white font-semibold ${colorFromId(user?.id)} ${className}`}
      style={style}
    >
      {initials(user?.name)}
    </div>
  )
}
