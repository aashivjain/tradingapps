const colorMap = {
  cyan: {
    bg: 'bg-neon-cyan/10',
    text: 'text-neon-cyan',
    border: 'border-neon-cyan/30'
  },
  lime: {
    bg: 'bg-neon-lime/10',
    text: 'text-neon-lime',
    border: 'border-neon-lime/30'
  },
  magenta: {
    bg: 'bg-neon-magenta/10',
    text: 'text-neon-magenta',
    border: 'border-neon-magenta/30'
  },
  purple: {
    bg: 'bg-neon-purple/10',
    text: 'text-neon-purple',
    border: 'border-neon-purple/30'
  }
}

export default function PnLDisplay({ label, value, change, color = 'cyan' }) {
  const colors = colorMap[color] || colorMap.cyan
  const isPositive = typeof change === 'string' && change.startsWith('+')
  const isNegative = typeof change === 'string' && change.startsWith('-')

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4`}>
      <p className="text-text-secondary text-sm font-medium mb-2">{label}</p>
      <p className={`${colors.text} text-2xl font-bold`}>{value}</p>
      <p className="text-text-secondary text-xs mt-2">
        {change !== '—' && (
          <span className={isPositive ? 'text-neon-lime' : isNegative ? 'text-neon-magenta' : ''}>
            {change}
          </span>
        )}
        {change === '—' && <span>—</span>}
      </p>
    </div>
  )
}
