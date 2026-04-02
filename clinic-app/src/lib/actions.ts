'use server'

import { revalidatePath } from 'next/cache';
import db from './db';
import { randomUUID } from 'crypto';

// Admin operations
export async function verifyAdminPassword(password: string) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false; // Deny access if env var is not configured
  return password === secret;
}

export async function addClinic(name: string, doctorName: string, location: string) {
  if (!name) throw new Error("Missing data");
  
  const id = randomUUID();
  const recipientSecret = randomUUID().split('-')[0];
  
  await db.execute({
    sql: 'INSERT INTO clinics (id, name, doctor_name, location, is_open, patient_count, recipient_secret) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [id, name, doctorName || 'TBD', location || 'General', 1, 0, recipientSecret]
  });
  
  revalidatePath('/');
  revalidatePath('/admin');
  return { id, recipientSecret };
}

export async function hideClinic(id: string) {
  try {
    await db.execute({
      sql: 'UPDATE clinics SET is_hidden = 1 WHERE id = ?',
      args: [id]
    });
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (err) {
    console.error(`DB Error hiding clinic ${id}:`, err);
    throw err;
  }
}

export async function unhideClinic(id: string) {
  try {
    await db.execute({
      sql: 'UPDATE clinics SET is_hidden = 0 WHERE id = ?',
      args: [id]
    });
    revalidatePath('/');
    revalidatePath('/admin');
  } catch (err) {
    console.error(`DB Error unhiding clinic ${id}:`, err);
    throw err;
  }
}

export async function updateDoctorName(id: string, secret: string, doctorName: string) {
  const result = await db.execute({
    sql: 'SELECT recipient_secret FROM clinics WHERE id = ?',
    args: [id]
  });
  const check = result.rows[0];
  if (!check || check.recipient_secret !== (secret as any)) throw new Error('Unauthorized');

  await db.execute({
    sql: 'UPDATE clinics SET doctor_name = ? WHERE id = ?',
    args: [doctorName.trim(), id]
  });
  revalidatePath('/');
  revalidatePath(`/clinic/${id}`);
}

// Recipient operations
export async function incrementPatient(id: string, secret: string) {
  const result = await db.execute({
    sql: 'SELECT recipient_secret FROM clinics WHERE id = ?',
    args: [id]
  });
  const check = result.rows[0];
  if (!check || check.recipient_secret !== secret) throw new Error("Unauthorized");
  
  await db.execute({
    sql: 'UPDATE clinics SET patient_count = patient_count + 1 WHERE id = ?',
    args: [id]
  });
  revalidatePath('/');
  revalidatePath(`/clinic/${id}`);
}

export async function decrementPatient(id: string, secret: string) {
  const result = await db.execute({
    sql: 'SELECT recipient_secret FROM clinics WHERE id = ?',
    args: [id]
  });
  const check = result.rows[0];
  if (!check || check.recipient_secret !== (secret as any)) throw new Error("Unauthorized");
  
  await db.execute({
    sql: 'UPDATE clinics SET patient_count = MAX(0, patient_count - 1) WHERE id = ?',
    args: [id]
  });
  revalidatePath('/');
  revalidatePath(`/clinic/${id}`);
}

export async function toggleClinicStatus(id: string, secret: string) {
  const result = await db.execute({
    sql: 'SELECT recipient_secret, is_open FROM clinics WHERE id = ?',
    args: [id]
  });
  const check = result.rows[0];
  if (!check || check.recipient_secret !== (secret as any)) throw new Error("Unauthorized");
  
  const nextStatus = check.is_open ? 0 : 1;
  await db.execute({
    sql: 'UPDATE clinics SET is_open = ? WHERE id = ?',
    args: [nextStatus, id]
  });
  revalidatePath('/');
  revalidatePath(`/clinic/${id}`);
  return nextStatus;
}

// Queries
export async function getClinics() {
  // Public view: only show visible (non-hidden) clinics
  const result = await db.execute('SELECT * FROM clinics WHERE is_hidden = 0 ORDER BY created_at DESC');
  return JSON.parse(JSON.stringify(result.rows));
}

export async function getClinicsAdmin() {
  // Admin view: show all clinics including hidden ones
  const result = await db.execute('SELECT * FROM clinics ORDER BY created_at DESC');
  return JSON.parse(JSON.stringify(result.rows));
}

export async function getClinic(id: string) {
  const result = await db.execute({
    sql: 'SELECT * FROM clinics WHERE id = ?',
    args: [id]
  });
  // Ensure we return ONLY plain objects (this fixes the serialization error)
  return result.rows[0] ? JSON.parse(JSON.stringify(result.rows[0])) : null;
}
