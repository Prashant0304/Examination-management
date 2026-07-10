import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import { AppShell } from '../../components/AppShell';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/client';
import type { ExamCycle, Subject, UserResponse } from '../../types';

export function AdminAssignments() {
  const toast = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [cycles, setCycles] = useState<ExamCycle[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);

  const faculty = users.filter((u) => u.role === 'FACULTY');
  const students = users.filter((u) => u.role === 'STUDENT');

  const [facultyId, setFacultyId] = useState('');
  const [facSubjectId, setFacSubjectId] = useState('');
  const [facCycleId, setFacCycleId] = useState('');
  const [assigningFaculty, setAssigningFaculty] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [stuSubjectId, setStuSubjectId] = useState('');
  const [stuCycleId, setStuCycleId] = useState('');
  const [enrollingStudent, setEnrollingStudent] = useState(false);

  async function load() {
    try {
      const [subjRes, cycleRes, usersRes] = await Promise.all([
        api.get<Subject[]>('/admin/catalog/subjects'),
        api.get<ExamCycle[]>('/admin/catalog/exam-cycles'),
        api.get<UserResponse[]>('/admin/users'),
      ]);
      setSubjects(subjRes.data);
      setCycles(cycleRes.data);
      setUsers(usersRes.data);
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not load catalog data.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function assignFaculty(e: FormEvent) {
    e.preventDefault();
    setAssigningFaculty(true);
    try {
      await api.post('/admin/catalog/faculty-assignments', {
        facultyId: Number(facultyId),
        subjectId: Number(facSubjectId),
        examCycleId: Number(facCycleId),
      });
      toast.push('success', 'Faculty assigned to subject.');
      setFacultyId('');
      setFacSubjectId('');
      setFacCycleId('');
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not assign faculty.');
    } finally {
      setAssigningFaculty(false);
    }
  }

  async function enrollStudent(e: FormEvent) {
    e.preventDefault();
    setEnrollingStudent(true);
    try {
      await api.post('/admin/catalog/student-enrollments', {
        studentId: Number(studentId),
        subjectId: Number(stuSubjectId),
        examCycleId: Number(stuCycleId),
      });
      toast.push('success', 'Student enrolled in subject.');
      setStudentId('');
      setStuSubjectId('');
      setStuCycleId('');
    } catch (err: any) {
      toast.push('error', err?.response?.data?.message || 'Could not enroll student.');
    } finally {
      setEnrollingStudent(false);
    }
  }

  return (
    <AppShell title="Assignments &amp; Enrollment">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <form onSubmit={assignFaculty} style={panelStyle}>
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>Assign faculty to a subject</h3>
          <p style={{ fontSize: 12.5, color: 'var(--color-ink-soft)', marginTop: 0, marginBottom: 16 }}>
            This is what makes the subject/cycle appear in that faculty member's mark entry screen.
          </p>

          <label style={labelStyle}>Faculty</label>
          <select value={facultyId} onChange={(e) => setFacultyId(e.target.value)} style={inputStyle} required>
            <option value="">Select faculty…</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>{f.fullName} ({f.departmentName ?? 'no dept'})</option>
            ))}
          </select>

          <label style={{ ...labelStyle, marginTop: 12 }}>Subject</label>
          <select value={facSubjectId} onChange={(e) => setFacSubjectId(e.target.value)} style={inputStyle} required>
            <option value="">Select subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
            ))}
          </select>

          <label style={{ ...labelStyle, marginTop: 12 }}>Exam cycle</label>
          <select value={facCycleId} onChange={(e) => setFacCycleId(e.target.value)} style={inputStyle} required>
            <option value="">Select cycle…</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
            ))}
          </select>

          <button type="submit" disabled={assigningFaculty} style={{ ...primaryBtn, width: '100%', marginTop: 18, padding: '9px 0' }}>
            {assigningFaculty ? 'Assigning…' : 'Assign faculty'}
          </button>
        </form>

        <form onSubmit={enrollStudent} style={panelStyle}>
          <h3 style={{ fontSize: 15, marginBottom: 6 }}>Enroll a student in a subject</h3>
          <p style={{ fontSize: 12.5, color: 'var(--color-ink-soft)', marginTop: 0, marginBottom: 16 }}>
            This is what makes the student appear on the faculty roster for that subject/cycle.
          </p>

          <label style={labelStyle}>Student</label>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} style={inputStyle} required>
            <option value="">Select student…</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.fullName} {s.usn ? `(${s.usn})` : ''}</option>
            ))}
          </select>

          <label style={{ ...labelStyle, marginTop: 12 }}>Subject</label>
          <select value={stuSubjectId} onChange={(e) => setStuSubjectId(e.target.value)} style={inputStyle} required>
            <option value="">Select subject…</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
            ))}
          </select>

          <label style={{ ...labelStyle, marginTop: 12 }}>Exam cycle</label>
          <select value={stuCycleId} onChange={(e) => setStuCycleId(e.target.value)} style={inputStyle} required>
            <option value="">Select cycle…</option>
            {cycles.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
            ))}
          </select>

          <button type="submit" disabled={enrollingStudent} style={{ ...primaryBtn, width: '100%', marginTop: 18, padding: '9px 0' }}>
            {enrollingStudent ? 'Enrolling…' : 'Enroll student'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

const panelStyle: CSSProperties = { background: '#fff', border: '1px solid var(--color-line)', borderRadius: 3, padding: 20, alignSelf: 'start' };
const labelStyle: CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 };
const inputStyle: CSSProperties = { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid var(--color-line)', borderRadius: 2 };
const primaryBtn: CSSProperties = { background: 'var(--color-navy)', color: '#fff', border: 'none', borderRadius: 2, padding: '7px 14px', fontSize: 13 };
