export function StatusDot({ color }: { color: string }) {
  return (
    <span className="status-dot" style={{ background: color, boxShadow: `0 0 6px ${color}40` }} />
  )
}

export function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className="badge" style={{ borderColor: `${color}30`, color, background: `${color}08` }}>
      <StatusDot color={color} />
      {label}
    </span>
  )
}
