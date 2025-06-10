import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useDatabase } from '../hooks/useDatabase';
import type { AppState, User, AttendanceSession, AttendanceRecord } from '../types';

interface AppContextType extends AppState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<string>;
  createSession: (sessionData: Omit<AttendanceSession, 'id' | 'createdAt' | 'qrCode'>) => Promise<string>;
  markAttendance: (sessionId: string, userId: string) => Promise<boolean>;
  getSessionAttendance: (sessionId: string) => AttendanceRecord[];
  getUserSessions: (userId: string) => AttendanceSession[];
  updateSessionStatus: (sessionId: string, isActive: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  sessions: [],
  attendanceRecords: [],
  users: []
};

type Action = 
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SESSIONS'; payload: AttendanceSession[] }
  | { type: 'SET_ATTENDANCE_RECORDS'; payload: AttendanceRecord[] }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'ADD_SESSION'; payload: AttendanceSession }
  | { type: 'ADD_ATTENDANCE_RECORD'; payload: AttendanceRecord }
  | { type: 'UPDATE_SESSION'; payload: { id: string; updates: Partial<AttendanceSession> } };

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload, isAuthenticated: !!action.payload };
    case 'SET_SESSIONS':
      return { ...state, sessions: action.payload };
    case 'SET_ATTENDANCE_RECORDS':
      return { ...state, attendanceRecords: action.payload };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    case 'ADD_ATTENDANCE_RECORD':
      return { ...state, attendanceRecords: [...state.attendanceRecords, action.payload] };
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        )
      };
    default:
      return state;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { db, isLoading, saveDatabase } = useDatabase();

  // Load data from database when available
  useEffect(() => {
    if (db && !isLoading) {
      loadUsers();
      loadSessions();
      loadAttendanceRecords();
      
      // Check for saved login
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
      }
    }
  }, [db, isLoading]);

  const loadUsers = () => {
    if (!db) return;
    
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
    const users: User[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      users.push({
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        role: row.role as 'admin' | 'student',
        studentId: row.student_id as string,
        department: row.department as string,
        createdAt: row.created_at as string
      });
    }
    
    stmt.free();
    dispatch({ type: 'SET_USERS', payload: users });
  };

  const loadSessions = () => {
    if (!db) return;
    
    const stmt = db.prepare('SELECT * FROM attendance_sessions ORDER BY created_at DESC');
    const sessions: AttendanceSession[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      sessions.push({
        id: row.id as string,
        title: row.title as string,
        description: row.description as string,
        createdBy: row.created_by as string,
        startTime: row.start_time as string,
        endTime: row.end_time as string,
        qrCode: row.qr_code as string,
        isActive: Boolean(row.is_active),
        location: row.location as string,
        department: row.department as string,
        createdAt: row.created_at as string
      });
    }
    
    stmt.free();
    dispatch({ type: 'SET_SESSIONS', payload: sessions });
  };

  const loadAttendanceRecords = () => {
    if (!db) return;
    
    const stmt = db.prepare('SELECT * FROM attendance_records ORDER BY marked_at DESC');
    const records: AttendanceRecord[] = [];
    
    while (stmt.step()) {
      const row = stmt.getAsObject();
      records.push({
        id: row.id as string,
        sessionId: row.session_id as string,
        userId: row.user_id as string,
        markedAt: row.marked_at as string,
        location: row.location as string,
        deviceInfo: row.device_info as string
      });
    }
    
    stmt.free();
    dispatch({ type: 'SET_ATTENDANCE_RECORDS', payload: records });
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!db) return false;
    
    // Simple authentication - in production, use proper password hashing
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    
    if (stmt.step()) {
      const row = stmt.getAsObject();
      const user: User = {
        id: row.id as string,
        name: row.name as string,
        email: row.email as string,
        role: row.role as 'admin' | 'student',
        studentId: row.student_id as string,
        department: row.department as string,
        createdAt: row.created_at as string
      };
      
      stmt.free();
      dispatch({ type: 'SET_USER', payload: user });
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    
    stmt.free();
    return false;
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    localStorage.removeItem('currentUser');
  };

  const createUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<string> => {
    if (!db) throw new Error('Database not available');
    
    const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    
    db.run(
      'INSERT INTO users (id, name, email, role, student_id, department, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userData.name, userData.email, userData.role, userData.studentId || null, userData.department || null, createdAt]
    );
    
    saveDatabase();
    loadUsers();
    return id;
  };

  const createSession = async (sessionData: Omit<AttendanceSession, 'id' | 'createdAt' | 'qrCode'>): Promise<string> => {
    if (!db) throw new Error('Database not available');
    
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date().toISOString();
    const qrCode = JSON.stringify({ sessionId: id, timestamp: Date.now() });
    
    db.run(
      'INSERT INTO attendance_sessions (id, title, description, created_by, start_time, end_time, qr_code, is_active, location, department, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, sessionData.title, sessionData.description, sessionData.createdBy, sessionData.startTime, sessionData.endTime, qrCode, 1, sessionData.location || null, sessionData.department || null, createdAt]
    );
    
    saveDatabase();
    loadSessions();
    return id;
  };

  const markAttendance = async (sessionId: string, userId: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      const id = `attendance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const markedAt = new Date().toISOString();
      
      db.run(
        'INSERT INTO attendance_records (id, session_id, user_id, marked_at, device_info) VALUES (?, ?, ?, ?, ?)',
        [id, sessionId, userId, markedAt, navigator.userAgent]
      );
      
      saveDatabase();
      loadAttendanceRecords();
      return true;
    } catch (error) {
      console.error('Error marking attendance:', error);
      return false;
    }
  };

  const getSessionAttendance = (sessionId: string): AttendanceRecord[] => {
    return state.attendanceRecords.filter(record => record.sessionId === sessionId);
  };

  const getUserSessions = (userId: string): AttendanceSession[] => {
    return state.sessions.filter(session => session.createdBy === userId);
  };

  const updateSessionStatus = (sessionId: string, isActive: boolean) => {
    if (!db) return;
    
    db.run('UPDATE attendance_sessions SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, sessionId]);
    saveDatabase();
    dispatch({ type: 'UPDATE_SESSION', payload: { id: sessionId, updates: { isActive } } });
  };

  const contextValue: AppContextType = {
    ...state,
    login,
    logout,
    createUser,
    createSession,
    markAttendance,
    getSessionAttendance,
    getUserSessions,
    updateSessionStatus
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};