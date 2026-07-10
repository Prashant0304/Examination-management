import { CSSProperties, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { StatusStamp } from '../../components/StatusStamp';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { MarksResponse } from '../../types';

export function StudentDashboard() {
  const toast = useToast();
  const [rows, setRows] = useState<MarksResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<MarksResponse[]>('/student/marks/me');
        setRows(res.data);
      } catch (err: any) {
        toast.push('error', err?.response?.data?.message || 'Could not load your marks.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell title="My Marks">
      {loading && <Spinner label="Loading your marks…" />}
      {!loading && rows.length === 0 && <p style={{ color: 'var(--color-ink-soft)' }}>No marks on record yet.</p>}

      {rows.length > 0 && (
        <table>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-line)' }}>
              <th style={th}>Subject</th>
              <th style={th}>IA</th>
              <th style={th}>External</th>
              <th style={th}>Total</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--color-line)' }}>
                <td style={td}>{row.subjectCode} — {row.subjectName}</td>
                <td style={td} className="mono-num">
                  {row.status === 'ADMIN_APPROVED' ? row.iaMarks : '—'}
                </td>
                <td style={td} className="mono-num">
                  {row.status === 'ADMIN_APPROVED' ? row.externalMarks : '—'}
                </td>
                <td style={td} className="mono-num">
                  {row.status === 'ADMIN_APPROVED' ? row.totalMarks : '—'}
                </td>
                <td style={td}><StatusStamp status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p style={{ fontSize: 12, color: 'var(--color-ink-soft)', marginTop: 20 }}>
        Marks are shown only once finalized by the administration. Records still in review
        display their current approval stage instead.
      </p>
    </AppShell>
  );
}

const th: CSSProperties = { padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--color-ink-soft)' };
const td: CSSProperties = { padding: '8px 10px', fontSize: 14 };
