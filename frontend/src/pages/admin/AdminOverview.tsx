import { useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { StatCard } from '../../components/StatCard';
import { Spinner } from '../../components/Spinner';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { AdminStats } from '../../types';

export function AdminOverview() {
  const toast = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<AdminStats>('/admin/stats');
        setStats(res.data);
      } catch (err: any) {
        toast.push('error', err?.response?.data?.message || 'Could not load statistics.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppShell title="Overview">
      {loading && <Spinner label="Loading statistics…" />}
      {stats && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 32 }}>
            <StatCard label="Total users" value={stats.totalUsers} accent="brass" />
            <StatCard label="Faculty" value={stats.totalFaculty} accent="brass" />
            <StatCard label="Students" value={stats.totalStudents} accent="brass" />
            <StatCard label="Subjects" value={stats.totalSubjects} accent="brass" />
            <StatCard label="Open exam cycles" value={stats.openExamCycles} accent="brass" />
          </div>

          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Approval pipeline</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <StatCard label="Awaiting HOD review" value={stats.pendingHodApproval} accent="warning" />
            <StatCard label="Awaiting final approval" value={stats.pendingAdminApproval} accent="warning" />
            <StatCard label="Finalized records" value={stats.finalizedRecords} accent="success" />
          </div>
        </>
      )}
    </AppShell>
  );
}
