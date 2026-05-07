export function Skeleton({ width, height, style }: { width?: string | number; height?: string | number; style?: React.CSSProperties }) {
  return (
    <div
      className="skeleton"
      style={{ width: width || "100%", height: height || 16, ...style }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: "var(--space-xl)" }}>
      <Skeleton height={14} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={32} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="30%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: "var(--space-xl)" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--hairline)" }}>
          <Skeleton height={14} width="25%" />
          <Skeleton height={14} width="20%" />
          <Skeleton height={14} width="15%" />
          <Skeleton height={14} width="10%" />
          <Skeleton height={14} width="20%" />
        </div>
      ))}
    </div>
  );
}
