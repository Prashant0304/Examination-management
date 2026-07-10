import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { PromptDialog } from '../../components/PromptDialog';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { ExamCycle } from '../../types';

export function AdminExamCycles() {
  const toast = useToast();
  const [cycles, setCycles] = useState<ExamCycle[]>([]);
  const [name, setName] = useState('');
  const [semester, setSemester] = useState('1');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [submitting, setSubmitting] = useState(false);
  const [closeTarget, setCloseTarget] = useState<ExamCycle | null>(null);

  async function load() {
    try {
      const res = await api.get<ExamCycle[]>('/admin/catalog/exam-cycles');
      setCycles(res.data);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not load exam cycles.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/catalog/exam-cycles', { name, semester: Number(semester), year: Number(year) });
      toast.push('success', `Exam cycle "${name}" opened.`);
      setName('');
      load();
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not create exam cycle.');
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmClose() {
    if (!closeTarget) return;
    try {
      await api.patch(`/admin/catalog/exam-cycles/${closeTarget.id}/close`);
      toast.push('success', `Closed "${closeTarget.name}". No further edits are possible.`);
      load();
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not close exam cycle.');
    } finally {
      setCloseTarget(null);
    }
  }

  return (
    <AppShell title="Exam Cycles">
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32 }}>
        <form onSubmit={create} style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 3, padding: 20, alignSelf: 'start' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Open a new cycle</h3>

          <label style={labelStyle}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Odd Semester 2026" required />

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Semester</label>
              <input type="number" min={1} max={8} value={semester} onChange={(e) => setSemester(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Year</label>
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} style={inputStyle} required />
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{ ...primaryBtn, width: '100%', marginTop: 18, padding: '9px 0' }}>
            {submitting ? 'Creating…' : 'Open exam cycle'}
          </button>
        </form>

        <div>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>All exam cycles ({cycles.length})</h3>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-line)' }}>
                <th style={th}>Name</th>
                <th style={th}>Semester</th>
                <th style={th}>Year</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {cycles.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={td}>{c.name}</td>
                  <td style={td} className="mono-num">{c.semester}</td>
                  <td style={td} className="mono-num">{c.year}</td>
                  <td style={td}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        padding: '3px 9px',
                        borderRadius: 2,
                        border: `1.5px solid ${c.status === 'OPEN' ? 'var(--color-success)' : 'var(--color-ink-soft)'}`,
                        color: c.status === 'OPEN' ? 'var(--color-success)' : 'var(--color-ink-soft)',
                        background: c.status === 'OPEN' ? 'var(--color-success-bg)' : 'var(--color-paper-dim)',
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={td}>
                    {c.status === 'OPEN' && (
                      <button style={dangerBtn} onClick={() => setCloseTarget(c)}>Close</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {closeTarget && (
        <PromptDialog
          title={`Close "${closeTarget.name}"?`}
          description="Once closed, faculty can no longer enter or edit marks for this cycle. This cannot be undone from here."
          confirmLabel="Close cycle"
          danger
          onConfirm={confirmClose}
          onCancel={() => setCloseTarget(null)}
        />
      )}
    </AppShell>
  );
}

const th: CSSProperties = { padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--color-ink-soft)' };
const td: CSSProperties = { padding: '8px 10px', fontSize: 14 };
const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const inputStyle: CSSProperties = { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid var(--color-line)', borderRadius: 2 };
const primaryBtn: CSSProperties = { background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: 2, padding: '7px 14px', fontSize: 13 };
const dangerBtn: CSSProperties = { background: '#fff', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 2, padding: '6px 12px', fontSize: 12 };
