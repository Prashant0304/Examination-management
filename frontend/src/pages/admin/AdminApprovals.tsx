import { CSSProperties, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { StatusStamp } from '../../components/StatusStamp';
import { Spinner } from '../../components/Spinner';
import { PromptDialog } from '../../components/PromptDialog';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { MarksResponse } from '../../types';

export function AdminApprovals() {
  const toast = useToast();
  const [rows, setRows] = useState<MarksResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<MarksResponse | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get<MarksResponse[]>('/admin/marks/pending');
      setRows(res.data);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not load pending marks.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function approve(row: MarksResponse) {
    try {
      await api.post(`/admin/marks/${row.id}/approve`, {});
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.push('success', `Finalized ${row.studentName} — ${row.subjectCode}.`);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not finalize.');
    }
  }

  async function confirmReject(reason: string) {
    if (!rejectTarget) return;
    try {
      await api.post(`/admin/marks/${rejectTarget.id}/reject`, { reason });
      setRows((prev) => prev.filter((r) => r.id !== rejectTarget.id));
      toast.push('info', `Sent back ${rejectTarget.studentName}'s marks to faculty.`);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not reject.');
    } finally {
      setRejectTarget(null);
    }
  }

  return (
    <AppShell title="Final Approvals">
      {loading && <Spinner label="Loading pending marks…" />}
      {!loading && rows.length === 0 && (
        <p style={{ color: 'var(--color-ink-soft)' }}>No records awaiting final approval.</p>
      )}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-line)' }}>
              <th style={th}>USN</th>
              <th style={th}>Student</th>
              <th style={th}>Subject</th>
              <th style={th}>Total</th>
              <th style={th}>Status</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--color-line)' }}>
                <td style={td} className="mono-num">{row.usn}</td>
                <td style={td}>{row.studentName}</td>
                <td style={td}>{row.subjectCode} — {row.subjectName}</td>
                <td style={td} className="mono-num">{row.totalMarks}</td>
                <td style={td}><StatusStamp status={row.status} /></td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={primaryBtn} onClick={() => approve(row)}>Finalize</button>
                    <button style={dangerBtn} onClick={() => setRejectTarget(row)}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {rejectTarget && (
        <PromptDialog
          title={`Reject ${rejectTarget.studentName}'s marks?`}
          description="This sends the record back to the faculty member for correction."
          confirmLabel="Reject"
          requireReason
          danger
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}
    </AppShell>
  );
}

const th: CSSProperties = { padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--color-ink-soft)' };
const td: CSSProperties = { padding: '8px 10px', fontSize: 14 };
const primaryBtn: CSSProperties = { background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: 2, padding: '7px 14px', fontSize: 13 };
const dangerBtn: CSSProperties = { background: '#fff', color: 'var(--color-danger)', border: '1px solid var(--color-danger)', borderRadius: 2, padding: '7px 14px', fontSize: 13 };
