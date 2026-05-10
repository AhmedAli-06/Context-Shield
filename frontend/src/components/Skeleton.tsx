export function Skeleton({
  width,
  height,
  style,
}: {
  width?: string | number
  height?: string | number
  style?: React.CSSProperties
}) {
  return (
    <div className="skeleton" style={{ width: width || '100%', height: height || 16, ...style }} />
  )
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 'var(--space-xl)' }}>
      <Skeleton height={14} width="40%" style={{ marginBottom: 12 }} />
      <Skeleton height={32} width="60%" style={{ marginBottom: 8 }} />
      <Skeleton height={12} width="30%" />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ padding: 'var(--space-xl)' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: 16,
            padding: '12px 0',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <Skeleton height={14} width="25%" />
          <Skeleton height={14} width="20%" />
          <Skeleton height={14} width="15%" />
          <Skeleton height={14} width="10%" />
          <Skeleton height={14} width="20%" />
        </div>
      ))}
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <Skeleton height={28} width="160px" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="240px" />
        </div>
        <Skeleton height={32} width="100px" />
      </div>
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card">
            <Skeleton height={12} width="50%" style={{ marginBottom: 12 }} />
            <Skeleton height={36} width="40%" style={{ marginBottom: 8 }} />
            <Skeleton height={10} width="60%" />
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <Skeleton height={14} width="140px" />
          </div>
          <div className="card-body">
            <Skeleton height={200} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <Skeleton height={14} width="140px" />
          </div>
          <div className="card-body">
            <Skeleton height={200} />
          </div>
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 'var(--space-xl)' }}>
        <div className="card">
          <div className="card-header">
            <Skeleton height={14} width="160px" />
          </div>
          <div className="card-body">
            <Skeleton height={160} />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton height={14} width="120px" />
              <Skeleton height={28} width="80px" />
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ padding: 'var(--space-xl)' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: '12px 0',
                    borderBottom: '1px solid var(--hairline)',
                  }}
                >
                  <Skeleton height={14} width="20%" />
                  <Skeleton height={14} width="15%" />
                  <Skeleton height={14} width="12%" />
                  <Skeleton height={14} width="10%" />
                  <Skeleton height={14} width="15%" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AssetsSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Skeleton height={28} width="120px" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="220px" />
      </div>
      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="card">
            <Skeleton height={12} width="50%" style={{ marginBottom: 12 }} />
            <Skeleton height={32} width="40%" style={{ marginBottom: 8 }} />
            <Skeleton height={10} width="55%" />
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-header">
          <Skeleton height={14} width="100px" />
          <Skeleton height={36} width="220px" />
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <SkeletonTable rows={8} />
        </div>
      </div>
    </div>
  )
}

export function EventsSkeleton() {
  return (
    <div>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Skeleton height={28} width="100px" style={{ marginBottom: 8 }} />
        <Skeleton height={14} width="200px" />
      </div>
      <div className="card">
        <div className="card-header">
          <Skeleton height={14} width="100px" />
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} height={30} width="70px" />
            ))}
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <SkeletonTable rows={8} />
        </div>
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <Skeleton height={28} width="140px" style={{ marginBottom: 8 }} />
          <Skeleton height={14} width="260px" />
        </div>
        <Skeleton height={36} width="120px" />
      </div>
      <div className="grid-2">
        <div>
          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <Skeleton height={14} width="80px" style={{ marginBottom: 8 }} />
            <Skeleton height={12} width="120px" style={{ marginBottom: 'var(--space-xl)' }} />
            <div className="card">
              <div className="card-body">
                <Skeleton height={48} style={{ marginBottom: 'var(--space-xl)' }} />
                <Skeleton height={48} style={{ marginBottom: 'var(--space-xl)' }} />
                <Skeleton height={48} style={{ marginBottom: 'var(--space-xl)' }} />
                <Skeleton height={48} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ marginBottom: 'var(--space-xxl)' }}>
            <Skeleton height={14} width="90px" style={{ marginBottom: 8 }} />
            <Skeleton height={12} width="140px" style={{ marginBottom: 'var(--space-xl)' }} />
            <div className="card">
              <Skeleton height={200} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
