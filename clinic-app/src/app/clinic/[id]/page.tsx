'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClinic, incrementPatient, decrementPatient, toggleClinicStatus, updateDoctorName } from '@/lib/actions';
import { Plus, Minus, AlertCircle, Home, Power, PowerOff, UserCog, Check, X, MapPin, Stethoscope, Edit2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ClinicRecipientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secret, setSecret] = useState(searchParams.get('secret') || '');
  const [tempSecret, setTempSecret] = useState('');

  // Doctor name editing state
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [savingDoctor, setSavingDoctor] = useState(false);

  const loadClinic = async () => {
    if (!secret) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getClinic(id);
      if (!data) {
        setError('Clinic not found.');
      } else if (data.recipient_secret !== secret) {
        setError('Invalid access secret.');
      } else {
        setClinic(data);
        setError('');
      }
    } catch {
      setError('Failed to fetch clinic data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClinic(); }, [secret]);

  const handleUpdate = async (type: 'inc' | 'dec') => {
    if (!clinic || !secret) return;
    try {
      if (type === 'inc') {
        await incrementPatient(id, secret);
        setClinic({ ...clinic, patient_count: clinic.patient_count + 1 });
      } else {
        await decrementPatient(id, secret);
        setClinic({ ...clinic, patient_count: Math.max(0, clinic.patient_count - 1) });
      }
    } catch {
      alert('Unauthorized or server error.');
    }
  };

  const handleToggleStatus = async () => {
    if (!clinic || !secret) return;
    try {
      const nextStatus = await toggleClinicStatus(id, secret);
      setClinic({ ...clinic, is_open: nextStatus });
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleEditDoctor = () => {
    setNewDoctorName(clinic.doctor_name || '');
    setEditingDoctor(true);
  };

  const handleSaveDoctorName = async () => {
    if (!newDoctorName.trim()) return;
    setSavingDoctor(true);
    try {
      await updateDoctorName(id, secret, newDoctorName.trim());
      setClinic({ ...clinic, doctor_name: newDoctorName.trim() });
      setEditingDoctor(false);
    } catch {
      alert('Failed to update doctor name.');
    } finally {
      setSavingDoctor(false);
    }
  };

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecret(tempSecret);
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      </div>
    );
  }

  if (!secret || error) {
    return (
      <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          {error && <><AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} /><p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p></>}
          <h2 style={{ marginBottom: '1rem' }}>Enter Access Code</h2>
          <form onSubmit={handleSecretSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="text" className="input-field" placeholder="Recipient secret" value={tempSecret} onChange={(e) => setTempSecret(e.target.value)} />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Access Terminal</button>
          </form>
          <Link href="/" className="btn btn-outline" style={{ display: 'flex', gap: '0.4rem', marginTop: '1.5rem', width: '100%' }}>
            <Home size={18} /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const isOpen = !!clinic.is_open;

  return (
    <div className="container fade-in" style={{ maxWidth: '700px' }}>
      {/* Header */}
      <header className="header" style={{ textAlign: 'left', paddingBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #00d2ff, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              {clinic.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Q-PULSE Recipient Terminal
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleToggleStatus}
              className="btn"
              style={{
                background: isOpen ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                border: `1px solid ${isOpen ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 77, 77, 0.3)'}`,
                color: isOpen ? 'var(--success)' : 'var(--danger)',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {isOpen ? <><Power size={15} /> Open</> : <><PowerOff size={15} /> Closed</>}
            </button>
            <Link href="/" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>Exit</Link>
          </div>
        </div>
      </header>

      {/* Clinic Info Card */}
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
            Clinic Info
          </h3>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            background: isOpen ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255,77,77,0.1)',
            color: isOpen ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${isOpen ? 'rgba(0,230,118,0.2)' : 'rgba(255,77,77,0.2)'}`,
            textTransform: 'uppercase'
          }}>
            {isOpen ? '● Live' : '● Closed'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Location row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={14} color="var(--accent-primary)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</p>
              <p style={{ margin: 0, fontWeight: 600 }}>{clinic.location || 'Not set'}</p>
            </div>
          </div>

          {/* Doctor row — editable */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Stethoscope size={14} color="var(--accent-primary)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Primary Doctor <span style={{ color: 'var(--accent-primary)', fontSize: '0.65rem' }}>(editable)</span>
              </p>
              {editingDoctor ? (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="input-field"
                    value={newDoctorName}
                    onChange={(e) => setNewDoctorName(e.target.value)}
                    placeholder="e.g. Dr. Smith"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem', flex: 1 }}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveDoctorName(); if (e.key === 'Escape') setEditingDoctor(false); }}
                  />
                  <button type="button" onClick={handleSaveDoctorName} disabled={savingDoctor} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', minWidth: 'auto' }}>
                    {savingDoctor ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button type="button" onClick={() => setEditingDoctor(false)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', minWidth: 'auto' }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>{clinic.doctor_name || 'Not set'}</p>
                  <button type="button" onClick={handleEditDoctor} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', padding: '2px' }}>
                    <Edit2 size={13} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Permissions notice */}
          <div style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', background: 'rgba(0,210,255,0.04)', border: '1px solid rgba(0,210,255,0.1)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <UserCog size={12} style={{ display: 'inline', marginRight: '0.4rem', verticalAlign: 'middle' }} />
            You can edit: <strong style={{ color: 'var(--text-primary)' }}>Doctor Name</strong> and <strong style={{ color: 'var(--text-primary)' }}>Clinic Status</strong>. Location and clinic name are managed by the administrator.
          </div>
        </div>
      </div>

      {/* Patient Count Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem' }}>
        <h2 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '4px', fontSize: '0.85rem' }}>
          Patient Queue
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => handleUpdate('dec')}
            className="btn glass-card"
            style={{ width: '72px', height: '72px', borderRadius: '50%', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}
          >
            <Minus size={28} />
          </button>

          <div style={{ fontSize: '7rem', fontWeight: 'bold', minWidth: '140px', textAlign: 'center', lineHeight: 1, textShadow: '0 0 40px rgba(0, 210, 255, 0.25)', color: isOpen ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {clinic.patient_count}
          </div>

          <button
            type="button"
            onClick={() => handleUpdate('inc')}
            className="btn btn-primary"
            style={{ width: '90px', height: '90px', borderRadius: '50%', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Plus size={38} />
          </button>
        </div>

        {!isOpen && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
            Clinic is closed — users see this queue as unavailable.
          </p>
        )}
      </div>
    </div>
  );
}
