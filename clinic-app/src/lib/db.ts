import Database from 'better-sqlite3';
import { join } from 'path';

// Store DB in the root of the project for persistence
const dbPath = join(process.cwd(), 'clinic.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    patient_count INTEGER DEFAULT 0,
    recipient_secret TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

export default db;

export interface Clinic {
  id: string;
  name: string;
  patient_count: number;
  recipient_secret: string;
  created_at: string;
}
