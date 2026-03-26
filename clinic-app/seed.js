const Database = require('better-sqlite3');
const db = new Database('clinic.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    patient_count INTEGER DEFAULT 0,
    recipient_secret TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  
  INSERT OR IGNORE INTO clinics (id, name, patient_count, recipient_secret)
  VALUES ('test-clinic', 'Main Street Wellness', 5, 'secret-123');
`);

console.log('Successfully seeded database with test-clinic');
db.close();
process.exit(0);
