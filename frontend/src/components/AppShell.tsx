import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrator',
  HOD: 'Head of Department',
  FACULTY: 'Faculty',
  STUDENT: 'Student',
};

interface NavItem {
  to: string;
  label: string;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  ADMIN: [
    { to: '/admin', label: 'Overview' },
    { to: '/admin/approvals', label: 'Final Approvals' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/departments', label: 'Departments' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/exam-cycles', label: 'Exam Cycles' },
    { to: '/admin/assignments', label: 'Assignments & Enrollment' },
  ],
  HOD: [{ to: '/hod', label: 'Pending Approvals' }],
  FACULTY: [{ to: '/faculty', label: 'Mark Entry' }],
  STUDENT: [{ to: '/student', label: 'My Marks' }],
};

export function AppShell({ children, title }: { children: ReactNode; title: string }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return <>{children}</>;

  const navItems = NAV_BY_ROLE[user.role];

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <aside
        style={{
          width: 240,
          background: 'var(--color-navy)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '22px 20px', borderBottom: '3px solid var(--color-brass)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, lineHeight: 1.25 }}>
            Register of Examinations
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.65, marginTop: 4 }}>
            IA &amp; External Marks
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              style={({ isActive }) => ({
                display: 'block',
                padding: '9px 12px',
                marginBottom: 2,
                borderRadius: 2,
                fontSize: 13.5,
                textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--color-brass)' : '3px solid transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: 12.5 }}>
          <div style={{ fontWeight: 600 }}>{user.fullName}</div>
          <div style={{ opacity: 0.65, marginBottom: 12 }}>{ROLE_LABEL[user.role]}</div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.35)',
              color: '#fff',
              borderRadius: 2,
              padding: '7px 0',
              fontSize: 12.5,
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px 40px', overflowX: 'auto' }}>
        <h1 style={{ fontSize: 22, marginBottom: 24 }}>{title}</h1>
        {children}
      </main>
    </div>
  );
}
