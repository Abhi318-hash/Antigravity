import { createClient } from "@libsql/client";

// For production, use Turso. For local dev, you can still use a local file.
const url = process.env.TURSO_URL || "file:clinic.db";
const authToken = process.env.TURSO_TOKEN;

// Initialize the client
const db = createClient({
  url: url,
  authToken: authToken,
});

// Initialize schema (this might run multiple times, ideally use a migration tool like Drizzle)
async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS clinics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      doctor_name TEXT DEFAULT 'TBD',
      location TEXT DEFAULT 'General',
      is_open BOOLEAN DEFAULT 1,
      is_hidden BOOLEAN DEFAULT 0,
      patient_count INTEGER DEFAULT 0,
      recipient_secret TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration for existing tables (non-destructive)
  try {
    await db.execute(`ALTER TABLE clinics ADD COLUMN doctor_name TEXT DEFAULT 'TBD'`);
  } catch (e) { /* Already exists */ }
  try {
    await db.execute(`ALTER TABLE clinics ADD COLUMN location TEXT DEFAULT 'General'`);
  } catch (e) { /* Already exists */ }
  try {
    await db.execute(`ALTER TABLE clinics ADD COLUMN is_open BOOLEAN DEFAULT 1`);
  } catch (e) { /* Already exists */ }
  try {
    await db.execute(`ALTER TABLE clinics ADD COLUMN is_hidden BOOLEAN DEFAULT 0`);
  } catch (e) { /* Already exists */ }
}

// Ensure the table exists
initDb();

export default db;

export interface Clinic {
  id: string;
  name: string;
  doctor_name: string;
  location: string;
  is_open: number; // 0 or 1
  is_hidden: number; // 0 or 1
  patient_count: number;
  recipient_secret: string;
  created_at: string;
}
