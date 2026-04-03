'use client'

import { useState, useEffect } from 'react';
import { addClinic, hideClinic, unhideClinic, getClinicsAdmin, verifyAdminPassword } from '@/lib/actions';
import { EyeOff, Eye, Plus, Copy, CheckCircle, Loader2, QrCode, User, ShieldCheck, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminPage() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [newClinicName, setNewClinicName] = useState('');
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadClinics();
    }
  }, [isAdmin]);

  const loadClinics = async () => {
    const data = await getClinicsAdmin();
    setClinics(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        setIsAdmin(true);
      } else {
        alert('Incorrect admin password.');
      }
    } catch {
      alert('Verification error.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName) return;
    setLoading(true);
    try {
      await addClinic(newClinicName, newDoctorName, newLocation);
      setNewClinicName('');
      setNewDoctorName('');
      setNewLocation('');
      await loadClinics();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (clinic: any) => {
    setTogglingId(clinic.id);
    try {
      if (clinic.is_hidden) {
        await unhideClinic(clinic.id);
      } else {
        await hideClinic(clinic.id);
      }
      await loadClinics();
    } catch (err) {
      console.error('Toggle visibility failed:', err);
      alert('Failed to update clinic visibility. Please try again.');
    } finally {
      setTogglingId(null);
    }
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
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'linear-gradient(to right, #ffffff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Q-PULSE Admin
          </h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="password"
              className="input-field"
              placeholder="Enter Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginLoading}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loginLoading}>
              {loginLoading ? <Loader2 className="animate-spin" size={18} /> : 'Login'}
            </button>
          </form>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'center' }}>
            Contact your system administrator for access.
          </p>
        </div>
      </div>
    );
  }

  const visibleClinics = clinics.filter(c => !c.is_hidden);
  const hiddenClinics = clinics.filter(c => c.is_hidden);

  return (
    <div className="container fade-in">
      <header className="header" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ background: 'linear-gradient(to right, #00d2ff, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Q-PULSE Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {visibleClinics.length} active · {hiddenClinics.length} hidden
          </p>
        </div>
        <button type="button" onClick={() => window.location.href = '/'} className="btn btn-outline">Exit</button>
      </header>

      {/* Add New Clinic */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Add New Clinic</h2>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <input
              className="input-field"
              placeholder="Clinic Name (e.g. Westside Care)"
              value={newClinicName}
              onChange={(e) => setNewClinicName(e.target.value)}
              disabled={loading}
            />
            <input
              className="input-field"
              placeholder="Doctor Name (e.g. Dr. Smith)"
              value={newDoctorName}
              onChange={(e) => setNewDoctorName(e.target.value)}
              disabled={loading}
            />
            <input
              className="input-field"
              placeholder="Location (e.g. Downtown)"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={loading}>
            <Plus size={18} /> Register Clinic
          </button>
        </form>
      </div>

      {/* Active Clinics */}
      <h2 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        Active Clinics
      </h2>
      <div className="grid-clinics" style={{ marginBottom: '2.5rem' }}>
        {visibleClinics.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', gridColumn: '1/-1' }}>No active clinics.</p>
        )}
        {visibleClinics.map(clinic => (
          <ClinicCard
            key={clinic.id}
            clinic={clinic}
            copiedId={copiedId}
            togglingId={togglingId}
            onCopyLink={copyLink}
            onToggle={handleToggleVisibility}
          />
        ))}
      </div>

      {/* Hidden Clinics */}
      {hiddenClinics.length > 0 && (
        <>
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Hidden from Users
          </h2>
          <div className="grid-clinics">
            {hiddenClinics.map(clinic => (
              <ClinicCard
                key={clinic.id}
                clinic={clinic}
                copiedId={copiedId}
                togglingId={togglingId}
                onCopyLink={copyLink}
                onToggle={handleToggleVisibility}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ClinicCard({ clinic, copiedId, togglingId, onCopyLink, onToggle }: any) {
  const isHidden = !!clinic.is_hidden;
  const isToggling = togglingId === clinic.id;
  const [showQR, setShowQR] = useState(false);

  const patientUrl = typeof window !== 'undefined' ? `${window.location.origin}/?addFavorite=${clinic.id}` : '';
  const staffUrl = typeof window !== 'undefined' ? `${window.location.origin}/clinic/${clinic.id}?secret=${clinic.recipient_secret}` : '';

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.5rem',
        opacity: isHidden ? 0.55 : 1,
        border: isHidden ? '1px solid rgba(255,255,255,0.06)' : undefined,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{clinic.name}</h3>
            {isHidden && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Hidden
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
            {clinic.doctor_name} · {clinic.location}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="btn"
            style={{
              background: showQR ? 'rgba(0,210,255,0.1)' : 'rgba(255,255,255,0.06)',
              color: showQR ? 'var(--accent-primary)' : 'var(--text-secondary)',
              padding: '0.4rem',
              minWidth: 'auto',
              border: '1px solid ' + (showQR ? 'rgba(0,210,255,0.2)' : 'rgba(255,255,255,0.08)'),
            }}
            title="Show QR Codes"
          >
            <QrCode size={15} />
          </button>
          <button
            type="button"
            onClick={() => onToggle(clinic)}
            disabled={isToggling}
            className="btn"
            style={{
              background: isHidden ? 'rgba(0,210,255,0.1)' : 'rgba(255,255,255,0.06)',
              color: isHidden ? 'var(--accent-primary)' : 'var(--text-secondary)',
              padding: '0.4rem',
              minWidth: 'auto',
              border: '1px solid ' + (isHidden ? 'rgba(0,210,255,0.2)' : 'rgba(255,255,255,0.08)'),
            }}
            title={isHidden ? 'Show to users' : 'Hide from users'}
          >
            {isToggling
              ? <Loader2 size={15} className="animate-spin" />
              : isHidden
                ? <Eye size={15} />
                : <EyeOff size={15} />
            }
          </button>
        </div>
      </div>

      {showQR && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', animation: 'slideDown 0.3s ease-out' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <User size={10} /> Patient QR
            </p>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', display: 'inline-block' }}>
              <QRCodeSVG value={patientUrl} size={80} />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={10} /> Staff QR
            </p>
            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', display: 'inline-block' }}>
              <QRCodeSVG value={staffUrl} size={80} />
            </div>
          </div>
          <button 
            onClick={() => window.print()} 
            className="btn btn-outline" 
            style={{ gridColumn: '1 / -1', fontSize: '0.7rem', padding: '0.3rem', minHeight: 'auto', marginTop: '0.5rem' }}
          >
            <Printer size={12} /> Print Tags
          </button>
        </div>
      )}

      {/* Access link */}
      <div style={{ fontSize: '0.78rem', padding: '0.7rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          <span>Recipient Secret:</span>
          <code style={{ color: 'var(--accent-primary)', fontSize: '0.75rem' }}>{clinic.recipient_secret}</code>
        </div>
        <button
          type="button"
          onClick={() => onCopyLink(clinic.id, clinic.recipient_secret)}
          className="btn btn-outline"
          style={{ width: '100%', fontSize: '0.72rem', padding: '0.4rem', minHeight: 'auto' }}
        >
          {copiedId === clinic.id ? <><CheckCircle size={12} /> Link Copied</> : <><Copy size={12} /> Access Link</>}
        </button>
      </div>
    </div>
  );
}
