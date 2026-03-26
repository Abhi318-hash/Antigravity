import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'clinic.db');
const db = new Database(dbPath);

db.exec(`
  INSERT OR IGNORE INTO clinics (id, name, patient_count, recipient_secret)
  VALUES ('test-clinic', 'Main Street Wellness', 5, 'secret-123')
`);

console.log('Seeded database with test clinic.');
process.exit(0);
