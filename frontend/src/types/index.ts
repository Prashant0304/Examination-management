export type Role = 'ADMIN' | 'HOD' | 'FACULTY' | 'STUDENT';

export type MarkStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'HOD_APPROVED'
  | 'ADMIN_APPROVED'
  | 'REJECTED'
  | 'REOPENED';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  role: Role;
  fullName: string;
  userId: number;
}

export interface MarksResponse {
  id: number;
  studentId: number;
  studentName: string;
  usn: string | null;
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  examCycleId: number;
  iaMarks: number | null;
  externalMarks: number | null;
  totalMarks: number | null;
  status: MarkStatus;
  rejectionReason: string | null;
}

export interface UserResponse {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  departmentId: number | null;
  departmentName: string | null;
  usn: string | null;
  active: boolean;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  department: Department;
  semester: number;
  credits: number;
  iaMaxMarks: number;
  externalMaxMarks: number;
}

export interface ExamCycle {
  id: number;
  name: string;
  semester: number;
  year: number;
  status: 'OPEN' | 'CLOSED';
}

export interface FacultyAssignment {
  subjectId: number;
  subjectCode: string;
  subjectName: string;
  examCycleId: number;
  examCycleName: string;
  examCycleStatus: 'OPEN' | 'CLOSED';
}

export interface AdminStats {
  totalUsers: number;
  totalFaculty: number;
  totalStudents: number;
  totalSubjects: number;
  openExamCycles: number;
  pendingHodApproval: number;
  pendingAdminApproval: number;
  finalizedRecords: number;
}
