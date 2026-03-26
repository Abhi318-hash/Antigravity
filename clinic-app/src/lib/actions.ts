'use server'

import { revalidatePath } from 'next/cache';
import db from './db';
import { randomUUID } from 'crypto';

// Admin operations
export async function addClinic(name: string, secret: string) {
  // Simple check for demo: you'd normally check against an ENV secret
  if (!name || !secret) throw new Error("Missing data");
  
  const id = randomUUID();
  const recipientSecret = randomUUID().split('-')[0]; // Simple 8-char secret for each clinic
  
  const stmt = db.prepare('INSERT INTO clinics (id, name, patient_count, recipient_secret) VALUES (?, ?, ?, ?)');
  stmt.run(id, name, 0, recipientSecret);
  
  revalidatePath('/');
  revalidatePath('/admin');
  return { id, recipientSecret };
}

export async function deleteClinic(id: string) {
  const stmt = db.prepare('DELETE FROM clinics WHERE id = ?');
  stmt.run(id);
  revalidatePath('/');
  revalidatePath('/admin');
}

// Recipient operations
export async function incrementPatient(id: string, secret: string) {
  const check = db.prepare('SELECT recipient_secret FROM clinics WHERE id = ?').get(id) as { recipient_secret: string } | undefined;
  if (!check || check.recipient_secret !== secret) throw new Error("Unauthorized");
  
  const stmt = db.prepare('UPDATE clinics SET patient_count = patient_count + 1 WHERE id = ?');
  stmt.run(id);
  revalidatePath('/');
  revalidatePath(`/clinic/${id}`);
}

export async function decrementPatient(id: string, secret: string) {
  const check = db.prepare('SELECT recipient_secret FROM clinics WHERE id = ?').get(id) as { recipient_secret: string } | undefined;
  if (!check || check.recipient_secret !== secret) throw new Error("Unauthorized");
  
  const stmt = db.prepare('UPDATE clinics SET patient_count = MAX(0, patient_count - 1) WHERE id = ?');
  stmt.run(id);
  revalidatePath('/');
  revalidatePath(`/clinic/${id}`);
}

// Queries
export async function getClinics() {
  return db.prepare('SELECT * FROM clinics ORDER BY created_at DESC').all() as any[];
}

export async function getClinic(id: string) {
  return db.prepare('SELECT * FROM clinics WHERE id = ?').get(id) as any;
}
