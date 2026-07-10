import { CSSProperties, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_HOME: Record<string, string> = {
  ADMIN: '/admin',
  HOD: '/hod',
  FACULTY: '/faculty',
  STUDENT: '/student',
};

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const authUser = await login(email, password);
      navigate(ROLE_HOME[authUser.role] || '/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-paper)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: 380,
          background: '#fff',
          border: '1px solid var(--color-line)',
          borderTop: '4px solid var(--color-brass)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-card)',
          padding: '36px 32px',
        }}
      >
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>Register of Examinations</h1>
        <p style={{ color: 'var(--color-ink-soft)', fontSize: 13, marginTop: 0, marginBottom: 28 }}>
          Sign in with your university credentials
        </p>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Email
        </label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, margin: '16px 0 6px' }}>
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <div
            style={{
              marginTop: 16,
              padding: '10px 12px',
              background: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: 13,
              borderRadius: 2,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            marginTop: 24,
            width: '100%',
            background: 'var(--color-navy)',
            color: '#fff',
            border: 'none',
            borderRadius: 2,
            padding: '11px 0',
            fontSize: 14,
            fontWeight: 600,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '9px 11px',
  fontSize: 14,
  border: '1px solid var(--color-line)',
  borderRadius: 2,
  fontFamily: 'var(--font-body)',
};
