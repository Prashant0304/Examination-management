import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { Department, Role, UserResponse } from '../../types';

export function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('FACULTY');
  const [usn, setUsn] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const [usersRes, deptRes] = await Promise.all([
        api.get<UserResponse[]>('/admin/users'),
        api.get<Department[]>('/admin/catalog/departments'),
      ]);
      setUsers(usersRes.data);
      setDepartments(deptRes.data);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not load users.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createUser(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/users', {
        fullName,
        email,
        password,
        role,
        usn: usn || null,
        departmentId: departmentId ? Number(departmentId) : null,
      });
      toast.push('success', `${role === 'STUDENT' ? 'Student' : 'User'} account created for ${fullName}.`);
      setFullName('');
      setEmail('');
      setPassword('');
      setUsn('');
      setDepartmentId('');
      load();
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not create user.');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(u: UserResponse) {
    try {
      await api.patch(`/admin/users/${u.id}/${u.active ? 'deactivate' : 'activate'}`);
      toast.push('success', `${u.fullName} ${u.active ? 'deactivated' : 'activated'}.`);
      load();
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not update user.');
    }
  }

  return (
    <AppShell title="Users">
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 32 }}>
        <form onSubmit={createUser} style={{ background: '#fff', border: '1px solid var(--color-line)', borderRadius: 3, padding: 20, alignSelf: 'start' }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Create account</h3>

          <label style={labelStyle}>Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />

          <label style={{ ...labelStyle, marginTop: 12 }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />

          <label style={{ ...labelStyle, marginTop: 12 }}>Temporary password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required minLength={8} />

          <label style={{ ...labelStyle, marginTop: 12 }}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={inputStyle}>
            <option value="FACULTY">Faculty</option>
            <option value="HOD">HOD</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>

          <label style={{ ...labelStyle, marginTop: 12 }}>Department</label>
          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={inputStyle}>
            <option value="">— none —</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {role === 'STUDENT' && (
            <>
              <label style={{ ...labelStyle, marginTop: 12 }}>USN</label>
              <input value={usn} onChange={(e) => setUsn(e.target.value)} style={inputStyle} />
            </>
          )}

          <button type="submit" disabled={submitting} style={{ ...primaryBtn, width: '100%', marginTop: 18, padding: '9px 0' }}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>All users ({users.length})</h3>
          <table>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--color-line)' }}>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Department</th>
                <th style={th}>Status</th>
                <th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-line)' }}>
                  <td style={td}>{u.fullName}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}>{u.role}</td>
                  <td style={td}>{u.departmentName ?? '—'}</td>
                  <td style={td}>{u.active ? 'Active' : 'Deactivated'}</td>
                  <td style={td}>
                    <button style={secondaryBtn} onClick={() => toggleActive(u)}>
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
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
const secondaryBtn: CSSProperties = { background: '#fff', color: 'var(--color-navy)', border: '1px solid var(--color-navy)', borderRadius: 2, padding: '6px 12px', fontSize: 12 };
