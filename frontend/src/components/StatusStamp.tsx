import type { MarkStatus } from '../types';

const STAMP_CONFIG: Record<MarkStatus, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:          { label: 'Draft',          color: 'var(--color-ink-soft)', bg: 'var(--color-paper-dim)', border: 'var(--color-line)' },
  SUBMITTED:      { label: 'Submitted',      color: 'var(--color-info)',     bg: 'var(--color-info-bg)',    border: 'var(--color-info)' },
  HOD_APPROVED:   { label: 'HOD Approved',   color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)', border: 'var(--color-warning)' },
  ADMIN_APPROVED: { label: 'Finalized',      color: 'var(--color-success)',  bg: 'var(--color-success-bg)', border: 'var(--color-success)' },
  REJECTED:       { label: 'Rejected',       color: 'var(--color-danger)',   bg: 'var(--color-danger-bg)',  border: 'var(--color-danger)' },
  REOPENED:       { label: 'Reopened',       color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)', border: 'var(--color-warning)' },
};

/**
 * Renders a mark's status as a rotated wax-seal-style stamp rather than a
 * generic colored pill - reinforcing the "official record" feel of the
 * approval workflow. Rotation is fixed per status so it stays legible
 * and doesn't read as decorative jitter.
 */
export function StatusStamp({ status }: { status: MarkStatus }) {
  const cfg = STAMP_CONFIG[status];
  const rotation = status === 'ADMIN_APPROVED' ? '-4deg' : status === 'REJECTED' ? '3deg' : '0deg';

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: cfg.color,
        background: cfg.bg,
        border: `1.5px solid ${cfg.border}`,
        borderRadius: '2px',
        padding: '3px 9px',
        transform: `rotate(${rotation})`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  );
}
