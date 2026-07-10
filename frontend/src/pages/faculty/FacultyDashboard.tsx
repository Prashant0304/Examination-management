import { CSSProperties, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { StatusStamp } from '../../components/StatusStamp';
import { Spinner } from '../../components/Spinner';
import { PromptDialog } from '../../components/PromptDialog';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { FacultyAssignment, MarksResponse } from '../../types';

export function FacultyDashboard() {
  const toast = useToast();
  const [assignments, setAssignments] = useState<FacultyAssignment[]>([]);
  const [selected, setSelected] = useState<FacultyAssignment | null>(null);
  const [rows, setRows] = useState<MarksResponse[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [confirmMark, setConfirmMark] = useState<MarksResponse | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<FacultyAssignment[]>('/faculty/marks/assignments');
        setAssignments(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      } catch (err: any) {
        toast.push('error', err?.response?.data?.message || 'Could not load your subject assignments.');
      } finally {
        setLoadingAssignments(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadRoster(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  async function loadRoster(assignment: FacultyAssignment) {
    setLoadingRoster(true);
    try {
      const res = await api.get<MarksResponse[]>(
        `/faculty/marks/roster/${assignment.subjectId}/cycle/${assignment.examCycleId}`
      );
      setRows(res.data);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not load the class roster.');
    } finally {
      setLoadingRoster(false);
    }
  }

  async function saveMark(row: MarksResponse, ia: number, ext: number) {
    if (!selected) return;
    try {
      const res = await api.post<MarksResponse>('/faculty/marks', {
        studentId: row.studentId,
        subjectId: selected.subjectId,
        examCycleId: selected.examCycleId,
        iaMarks: ia,
        externalMarks: ext,
      });
      setRows((prev) => prev.map((r) => (r.studentId === row.studentId ? res.data : r)));
      toast.push('success', `Saved marks for ${row.studentName}.`);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not save marks.');
    }
  }

  async function doSubmit(row: MarksResponse) {
    if (!row.id) {
      toast.push('error', 'Save marks before submitting.');
      return;
    }
    setConfirmMark(row);
  }

  async function confirmSubmit() {
    if (!confirmMark?.id) return;
    try {
      const res = await api.post<MarksResponse>(`/faculty/marks/${confirmMark.id}/submit`);
      setRows((prev) => prev.map((r) => (r.studentId === res.data.studentId ? res.data : r)));
      toast.push('success', `Submitted ${confirmMark.studentName}'s marks for HOD review.`);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not submit for approval.');
    } finally {
      setConfirmMark(null);
    }
  }

  return (
    <AppShell title="Mark Entry">
      {loadingAssignments && <Spinner label="Loading your assignments…" />}

      {!loadingAssignments && assignments.length === 0 && (
        <p style={{ color: 'var(--color-ink-soft)' }}>
          You have no subject assignments yet. Contact your administrator.
        </p>
      )}

      {assignments.length > 0 && (
        <>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Subject / Exam cycle</label>
            <select
              value={selected ? `${selected.subjectId}-${selected.examCycleId}` : ''}
              onChange={(e) => {
                const [subjectId, examCycleId] = e.target.value.split('-').map(Number);
                const found = assignments.find((a) => a.subjectId === subjectId && a.examCycleId === examCycleId);
                setSelected(found ?? null);
              }}
              style={{ ...inputStyle, width: 340 }}
            >
              {assignments.map((a) => (
                <option key={`${a.subjectId}-${a.examCycleId}`} value={`${a.subjectId}-${a.examCycleId}`}>
                  {a.subjectCode} — {a.subjectName} ({a.examCycleName}
                  {a.examCycleStatus === 'CLOSED' ? ', closed' : ''})
                </option>
              ))}
            </select>
          </div>

          {loadingRoster && <Spinner label="Loading class roster…" />}

          {!loadingRoster && rows.length === 0 && (
            <p style={{ color: 'var(--color-ink-soft)' }}>No students enrolled in this subject/cycle yet.</p>
          )}

          {!loadingRoster && rows.length > 0 && (
            <table>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-line)' }}>
                  <th style={th}>USN</th>
                  <th style={th}>Student</th>
                  <th style={th}>IA</th>
                  <th style={th}>External</th>
                  <th style={th}>Total</th>
                  <th style={th}>Status</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <MarkRow key={row.studentId} row={row} onSave={saveMark} onSubmit={doSubmit} />
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {confirmMark && (
        <PromptDialog
          title="Submit for HOD review?"
          description={`Once submitted, ${confirmMark.studentName}'s marks can no longer be edited unless HOD or Admin sends them back.`}
          confirmLabel="Submit"
          onConfirm={confirmSubmit}
          onCancel={() => setConfirmMark(null)}
        />
      )}
    </AppShell>
  );
}

function MarkRow({
  row,
  onSave,
  onSubmit,
}: {
  row: MarksResponse;
  onSave: (row: MarksResponse, ia: number, ext: number) => void;
  onSubmit: (row: MarksResponse) => void;
}) {
  const [ia, setIa] = useState(row.iaMarks?.toString() ?? '');
  const [ext, setExt] = useState(row.externalMarks?.toString() ?? '');
  const editable = row.status === 'DRAFT' || row.status === 'REJECTED' || row.status === 'REOPENED';

  return (
    <tr style={{ borderBottom: '1px solid var(--color-line)' }}>
      <td style={td} className="mono-num">{row.usn}</td>
      <td style={td}>{row.studentName}</td>
      <td style={td}>
        <input disabled={!editable} value={ia} onChange={(e) => setIa(e.target.value)} style={{ ...inputStyle, width: 64 }} />
      </td>
      <td style={td}>
        <input disabled={!editable} value={ext} onChange={(e) => setExt(e.target.value)} style={{ ...inputStyle, width: 64 }} />
      </td>
      <td style={td} className="mono-num">{row.totalMarks ?? '—'}</td>
      <td style={td}><StatusStamp status={row.status} /></td>
      <td style={td}>
        {editable && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={secondaryBtn} onClick={() => onSave(row, Number(ia), Number(ext))}>Save</button>
            <button style={primaryBtn} onClick={() => onSubmit(row)}>Submit</button>
          </div>
        )}
        {row.status === 'REJECTED' && row.rejectionReason && (
          <div style={{ fontSize: 12, color: 'var(--color-danger)', marginTop: 4 }}>{row.rejectionReason}</div>
        )}
      </td>
    </tr>
  );
}

const th: CSSProperties = { padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--color-ink-soft)' };
const td: CSSProperties = { padding: '8px 10px', fontSize: 14 };
const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 };
const inputStyle: CSSProperties = { padding: '8px 10px', fontSize: 13, border: '1px solid var(--color-line)', borderRadius: 2 };
const primaryBtn: CSSProperties = { background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: 2, padding: '7px 14px', fontSize: 13 };
const secondaryBtn: CSSProperties = { background: '#fff', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: 2, padding: '7px 14px', fontSize: 13 };
