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
      patient_count INTEGER DEFAULT 0,
      recipient_secret TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Ensure the table exists
initDb();

export default db;

export interface Clinic {
  id: string;
  name: string;
  patient_count: number;
  recipient_secret: string;
  created_at: string;
}
