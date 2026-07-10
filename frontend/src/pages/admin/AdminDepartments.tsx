import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { Department } from '../../types';

export function AdminDepartments() {
  const toast = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const res = await api.get<Department[]>('/admin/catalog/departments');
      setDepartments(res.data);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not load departments.');
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
      await api.post('/admin/catalog/departments', { name, code: code.toUpperCase() });
      toast.push('success', `Department "${name}" created.`);
      setName('');
      setCode('');
      load();
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not create department.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell title="Departments">
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 32 }}>
        <form onSubmit={create} style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 3, padding: 20, alignSelf: 'start' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>New department</h3>
          <label style={labelStyle}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Computer Science" required />
          <label style={{ ...labelStyle, marginTop: 12 }}>Code</label>
          <input value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} placeholder="CSE" required />
          <button type="submit" disabled={submitting} style={{ ...primaryBtn, width: '100%', marginTop: 18, padding: '9px 0' }}>
            {submitting ? 'Creating…' : 'Create department'}
          </button>
        </form>

        <div>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>All departments ({departments.length})</h3>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-line)' }}>
                <th style={th}>Code</th>
                <th style={th}>Name</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={td} className="mono-num">{d.code}</td>
                  <td style={td}>{d.name}</td>
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
