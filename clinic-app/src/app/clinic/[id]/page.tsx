'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClinic, incrementPatient, decrementPatient } from '@/lib/actions';
import { Plus, Minus, Check, AlertCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function ClinicRecipientPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [clinic, setClinic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [secret, setSecret] = useState(searchParams.get('secret') || '');
  const [tempSecret, setTempSecret] = useState('');

  const loadClinic = async () => {
    if (!secret) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const data = await getClinic(params.id);
      if (!data) {
        setError("Clinic not found.");
      } else if (data.recipient_secret !== secret) {
        setError("Invalid access secret.");
      } else {
        setClinic(data);
        setError('');
      }
    } catch (err) {
      setError("Failed to fetch clinic data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClinic();
  }, [secret]);

  const handleUpdate = async (type: 'inc' | 'dec') => {
    if (!clinic || !secret) return;
    try {
      if (type === 'inc') {
        await incrementPatient(params.id, secret);
        setClinic({ ...clinic, patient_count: clinic.patient_count + 1 });
      } else {
        await decrementPatient(params.id, secret);
        setClinic({ ...clinic, patient_count: Math.max(0, clinic.patient_count - 1) });
      }
    } catch (err) {
      console.error(err);
      alert("Unauthorized or server error.");
    }
  };

  const handleSecretSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecret(tempSecret);
  };

  if (loading) {
    return <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>Loading...</div>;
  }

  if (!secret || error) {
    return (
      <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          {error ? <><AlertCircle size={40} color="var(--danger)" style={{ marginBottom: '1rem' }} /><p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p></> : null}
          <h2 style={{ marginBottom: '1rem' }}>Enter Access Code</h2>
          <form onSubmit={handleSecretSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Admin-provided secret" 
              value={tempSecret}
              onChange={(e) => setTempSecret(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Access</button>
          </form>
          <Link href="/" className="btn btn-outline" style={{ display: 'flex', gap: '0.4rem', marginTop: '1.5rem', width: '100%' }}>
            <Home size={18} /> Back to Live View
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <header className="header" style={{ textAlign: 'left', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem' }}>{clinic.name}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Reception Terminal - Quick Count Update</p>
          </div>
          <Link href="/" className="btn btn-outline">Exit Terminal</Link>
        </div>
      </header>

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '4px' }}>
          Waitlist Count
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '3rem', marginBottom: '3rem' }}>
          <button 
            onClick={() => handleUpdate('dec')} 
            className="btn glass-card" 
            style={{ width: '80px', height: '80px', borderRadius: '50%', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Minus size={32} />
          </button>
          
          <div style={{ fontSize: '8rem', fontWeight: 'bold', minWidth: '150px', textAlign: 'center', textShadow: '0 0 40px rgba(0, 210, 255, 0.2)' }}>
            {clinic.patient_count}
          </div>
          
          <button 
            onClick={() => handleUpdate('inc')} 
            className="btn btn-primary" 
            style={{ width: '100px', height: '100px', borderRadius: '50%', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Plus size={40} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: '600' }}>
          <Check size={20} /> Changes Saved Successfully
        </div>
      </div>
    </div>
  );
}
