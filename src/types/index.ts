export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  studentId?: string;
  department?: string;
  createdAt: string;
}

export interface AttendanceSession {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  startTime: string;
  endTime: string;
  qrCode: string;
  isActive: boolean;
  location?: string;
  department?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  markedAt: string;
  location?: string;
  deviceInfo?: string;
}

export interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  sessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  users: User[];
}