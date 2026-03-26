'use server'

import { revalidatePath } from 'next/cache';
import db from './db';
import { randomUUID } from 'crypto';

// Admin operations
export async function verifyAdminPassword(password: string) {
  const secret = process.env.ADMIN_PASSWORD || 'admin123';
  return password === secret;
}

export async function addClinic(name: string, secret: string) {
  if (!name || !secret) throw new Error("Missing data");
  
  const id = randomUUID();
  const recipientSecret = randomUUID().split('-')[0];
  
  await db.execute({
    sql: 'INSERT INTO clinics (id, name, patient_count, recipient_secret) VALUES (?, ?, ?, ?)',
    args: [id, name, 0, recipientSecret]
  });
  
  revalidatePath('/');
  revalidatePath('/admin');
  return { id, recipientSecret };
}

export async function deleteClinic(id: string) {
  await db.execute({
    sql: 'DELETE FROM clinics WHERE id = ?',
    args: [id]
  });
  revalidatePath('/');
  revalidatePath('/admin');
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
  if (!check || check.recipient_secret !== secret) throw new Error("Unauthorized");
  
  await db.execute({
    sql: 'UPDATE clinics SET patient_count = MAX(0, patient_count - 1) WHERE id = ?',
    args: [id]
  });
  revalidatePath('/');
  revalidatePath(`/clinic/${id}`);
}

// Queries
export async function getClinics() {
  const result = await db.execute('SELECT * FROM clinics ORDER BY created_at DESC');
  // Ensure we return ONLY plain objects (this fixes the serialization error)
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
