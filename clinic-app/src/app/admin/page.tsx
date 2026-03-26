'use client'

import { useState, useEffect } from 'react';
import { addClinic, deleteClinic, getClinics } from '@/lib/actions';
import { Trash2, Plus, Key, Copy, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [newClinicName, setNewClinicName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadClinics();
    }
  }, [isAdmin]);

  const loadClinics = async () => {
    const data = await getClinics();
    setClinics(data);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simplified login for demo
    if (password === 'admin123') {
      setIsAdmin(true);
    } else {
      alert("Incorrect admin password.");
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName) return;
    setLoading(true);
    try {
      await addClinic(newClinicName, 'dummy_secret');
      setNewClinicName('');
      await loadClinics();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will remove all patient data.")) return;
    await deleteClinic(id);
    await loadClinics();
  };

  const copyLink = (id: string, secret: string) => {
    const url = `${window.location.origin}/clinic/${id}?secret=${secret}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="container" style={{ display: 'grid', placeItems: 'center', minHeight: '80vh' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Admin Access</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="password" 
              className="input-field" 
              placeholder="Enter Admin Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Login</button>
          </form>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>
            Default for demo: <code>admin123</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <header className="header" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage all clinics and patient access codes.</p>
        </div>
        <button onClick={() => window.location.href = '/'} className="btn btn-outline">Exit</button>
      </header>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add New Clinic</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '1rem' }}>
          <input 
            className="input-field" 
            placeholder="Clinic Name (e.g. Westside Care)" 
            value={newClinicName}
            onChange={(e) => setNewClinicName(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Plus size={18} /> Add
          </button>
        </form>
      </div>

      <div className="grid-clinics">
        {clinics.map(clinic => (
          <div key={clinic.id} className="glass-card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ fontSize: '1.3rem' }}>{clinic.name}</h3>
              <button 
                onClick={() => handleDelete(clinic.id)} 
                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>Recipient Secret:</span>
                  <code style={{ color: 'var(--accent-primary)' }}>{clinic.recipient_secret}</code>
                </div>
                <button 
                  onClick={() => copyLink(clinic.id, clinic.recipient_secret)} 
                  className="btn btn-outline" 
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                >
                  {copiedId === clinic.id ? <><CheckCircle size={14} /> Link Copied</> : <><Copy size={14} /> Access Link</>}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
