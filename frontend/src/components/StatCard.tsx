export function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: 'brass' | 'success' | 'warning' | 'danger' }) {
  const accentColor = {
    brass: 'var(--color-brass)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
  }[accent ?? 'brass'];

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--color-line)',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 3,
        padding: '16px 18px',
        minWidth: 150,
      }}
    >
      <div style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-navy)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 4 }}>{label}</div>
    </div>
  );
}
