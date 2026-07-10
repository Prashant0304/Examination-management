import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { Department, Subject } from '../../types';

export function AdminSubjects() {
  const toast = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('1');
  const [credits, setCredits] = useState('4');
  const [iaMax, setIaMax] = useState('50');
  const [externalMax, setExternalMax] = useState('50');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const [subjRes, deptRes] = await Promise.all([
        api.get<Subject[]>('/admin/catalog/subjects'),
        api.get<Department[]>('/admin/catalog/departments'),
      ]);
      setSubjects(subjRes.data);
      setDepartments(deptRes.data);
      if (deptRes.data.length > 0 && !departmentId) setDepartmentId(String(deptRes.data[0].id));
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not load subjects.');
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
      await api.post('/admin/catalog/subjects', {
        code,
        name,
        departmentId: Number(departmentId),
        semester: Number(semester),
        credits: Number(credits),
        iaMaxMarks: Number(iaMax),
        externalMaxMarks: Number(externalMax),
      });
      toast.push('success', `Subject "${code}" created.`);
      setCode('');
      setName('');
      load();
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not create subject.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Subjects">
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32 }}>
        <form onSubmit={create} style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 3, padding: 20, alignSelf: 'start' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>New subject</h3>

          <label style={labelStyle}>Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} placeholder="CS301" required />

          <label style={{ ...labelStyle, marginTop: 12 }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Data Structures" required />

          <label style={{ ...labelStyle, marginTop: 12 }}>Department</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={inputStyle} required>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Semester</label>
              <input type="number" min={1} max={8} value={semester} onChange={(e) => setSemester(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Credits</label>
              <input type="number" min={0} value={credits} onChange={(e) => setCredits(e.target.value)} style={inputStyle} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>IA max</label>
              <input type="number" min={0} value={iaMax} onChange={(e) => setIaMax(e.target.value)} style={inputStyle} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>External max</label>
              <input type="number" min={0} value={externalMax} onChange={(e) => setExternalMax(e.target.value)} style={inputStyle} required />
            </div>
          </div>

          <button type="submit" disabled={submitting} style={{ ...primaryBtn, width: '100%', marginTop: 18, padding: '9px 0' }}>
            {submitting ? 'Creating…' : 'Create subject'}
          </button>
        </form>

        <div>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>All subjects ({subjects.length})</h3>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-line)' }}>
                <th style={th}>Code</th>
                <th style={th}>Name</th>
                <th style={th}>Dept</th>
                <th style={th}>Sem</th>
                <th style={th}>IA / Ext max</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={td} className="mono-num">{s.code}</td>
                  <td style={td}>{s.name}</td>
                  <td style={td}>{s.department?.code}</td>
                  <td style={td} className="mono-num">{s.semester}</td>
                  <td style={td} className="mono-num">{s.iaMaxMarks} / {s.externalMaxMarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

const th: CSSProperties = { padding: '8px 10px', fontSize: 13, fontWeight: 600, color: 'var(--color-ink-soft)' };
const td: CSSProperties = { padding: '8px 10px', fontSize: 14 };
const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const inputStyle: CSSProperties = { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid var(--color-line)', borderRadius: 2 };
const primaryBtn: CSSProperties = { background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: 2, padding: '7px 14px', fontSize: 13 };
