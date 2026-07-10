import { FormEvent, useState } from 'react';

interface PromptDialogProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  requireReason?: boolean;
  danger?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/**
 * A single reusable dialog used for both plain confirmations (requireReason=false)
 * and reason-required actions like rejections (requireReason=true).
 */
export function PromptDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  requireReason = false,
  danger = false,
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [reason, setReason] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (requireReason && !reason.trim()) return;
    onConfirm(reason.trim());
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(27,26,23,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
      }}
      onClick={onCancel}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 400,
          background: '#fff',
          borderRadius: 3,
          borderTop: `4px solid ${danger ? 'var(--color-danger)' : 'var(--color-brass)'}`,
          padding: '24px 24px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ fontSize: 16, marginBottom: description ? 6 : 16 }}>{title}</h3>
        {description && (
          <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginTop: 0, marginBottom: 16 }}>
            {description}
          </p>
        )}

        {requireReason && (
          <textarea
            autoFocus
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (required)…"
            rows={3}
            style={{
              width: '100%',
              padding: '9px 11px',
              fontSize: 13,
              border: '1px solid var(--color-line)',
              borderRadius: 2,
              fontFamily: 'var(--font-body)',
              resize: 'vertical',
              marginBottom: 16,
            }}
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#fff',
              color: 'var(--color-ink-soft)',
              border: '1px solid var(--color-line)',
              borderRadius: 2,
              padding: '8px 16px',
              fontSize: 13,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: danger ? 'var(--color-danger)' : 'var(--color-navy)',
              color: '#fff',
              border: 'none',
              borderRadius: 2,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
