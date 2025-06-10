import { useState, useEffect } from 'react';
import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';

export const useDatabase = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });

        // Try to load existing database from localStorage
        const savedDb = localStorage.getItem('attendanceDb');
        let database: Database;

        if (savedDb) {
          const dbArray = new Uint8Array(JSON.parse(savedDb));
          database = new SQL.Database(dbArray);
        } else {
          database = new SQL.Database();
          initializeTables(database);
        }

        setDb(database);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsLoading(false);
      }
    };

    initDatabase();
  }, []);

  const saveDatabase = () => {
    if (db) {
      const data = db.export();
      const buffer = Array.from(data);
      localStorage.setItem('attendanceDb', JSON.stringify(buffer));
    }
  };

  const initializeTables = (database: Database) => {
    // Users table
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('admin', 'student')),
        student_id TEXT,
        department TEXT,
        created_at TEXT NOT NULL
      )
    `);

    // Attendance sessions table
    database.run(`
      CREATE TABLE IF NOT EXISTS attendance_sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        created_by TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        qr_code TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        location TEXT,
        department TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (created_by) REFERENCES users (id)
      )
    `);

    // Attendance records table
    database.run(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        marked_at TEXT NOT NULL,
        location TEXT,
        device_info TEXT,
        FOREIGN KEY (session_id) REFERENCES attendance_sessions (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(session_id, user_id)
      )
    `);

    // Insert default admin user
    database.run(`
      INSERT OR IGNORE INTO users (id, name, email, role, created_at)
      VALUES ('admin-1', 'Administrator', 'admin@attendance.app', 'admin', datetime('now'))
    `);
  };

  return { db, isLoading, saveDatabase };
};