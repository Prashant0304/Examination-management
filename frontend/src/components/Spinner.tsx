export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-ink-soft)', fontSize: 13, padding: '20px 0' }}>
      <span
        style={{
          width: 14,
          height: 14,
          border: '2px solid var(--color-line)',
          borderTopColor: 'var(--color-brass)',
          borderRadius: '50%',
          display: 'inline-block',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
