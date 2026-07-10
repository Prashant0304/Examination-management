import { createContext, useContext, useState, ReactNode } from 'react';
import { api, setTokens } from '../api/client';
import type { AuthResponse, Role } from '../types';

interface AuthUser {
  userId: number;
  fullName: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      const data = res.data;
      setTokens(data);
      const authUser: AuthUser = { userId: data.userId, fullName: data.fullName, role: data.role };
      setUser(authUser);
      return authUser;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setTokens(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
