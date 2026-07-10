import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login } from './pages/auth/Login';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { HodDashboard } from './pages/hod/HodDashboard';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminApprovals } from './pages/admin/AdminApprovals';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminSubjects } from './pages/admin/AdminSubjects';
import { AdminExamCycles } from './pages/admin/AdminExamCycles';
import { AdminAssignments } from './pages/admin/AdminAssignments';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/faculty"
              element={
                <ProtectedRoute allow={['FACULTY', 'ADMIN']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hod"
              element={
                <ProtectedRoute allow={['HOD', 'ADMIN']}>
                  <HodDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute allow={['STUDENT', 'ADMIN']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/admin" element={<ProtectedRoute allow={['ADMIN']}><AdminOverview /></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute allow={['ADMIN']}><AdminApprovals /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allow={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/departments" element={<ProtectedRoute allow={['ADMIN']}><AdminDepartments /></ProtectedRoute>} />
            <Route path="/admin/subjects" element={<ProtectedRoute allow={['ADMIN']}><AdminSubjects /></ProtectedRoute>} />
            <Route path="/admin/exam-cycles" element={<ProtectedRoute allow={['ADMIN']}><AdminExamCycles /></ProtectedRoute>} />
            <Route path="/admin/assignments" element={<ProtectedRoute allow={['ADMIN']}><AdminAssignments /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
