import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 1000,
          maxWidth: 360,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: '12px 16px',
              borderRadius: 3,
              fontSize: 13,
              fontWeight: 500,
              boxShadow: 'var(--shadow-card)',
              borderLeft: `4px solid ${
                t.kind === 'success' ? 'var(--color-success)' : t.kind === 'error' ? 'var(--color-danger)' : 'var(--color-info)'
              }`,
              background:
                t.kind === 'success' ? 'var(--color-success-bg)' : t.kind === 'error' ? 'var(--color-danger-bg)' : 'var(--color-info-bg)',
              color:
                t.kind === 'success' ? 'var(--color-success)' : t.kind === 'error' ? 'var(--color-danger)' : 'var(--color-info)',
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
