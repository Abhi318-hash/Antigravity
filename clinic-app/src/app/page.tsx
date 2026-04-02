'use client'

import { getClinics } from '@/lib/actions';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Users, LayoutDashboard, Settings, Activity, Zap, Hospital, MapPin, Search as SearchIcon, Stethoscope } from 'lucide-react';

export default function Home() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getClinics();
      setClinics(data);
      setLoading(false);
    }
    load();
    // Poll for updates every 10 seconds
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredClinics = clinics.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container fade-in">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <Activity size={48} className="pulse-primary" style={{ color: 'var(--accent-primary)' }} />
          <h1 style={{ fontSize: '4.5rem', fontWeight: '900', margin: 0, background: 'linear-gradient(to right, #00d2ff, #3a7bd5, #ffffff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-2px' }}>
            Q-PULSE
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.4rem', fontWeight: '300', letterSpacing: '1px' }}>
          "Skip the wait, stay in the pulse"
        </p>

        <div style={{ marginTop: '3rem', maxWidth: '600px', margin: '3rem auto 0', position: 'relative' }}>
          <SearchIcon style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
          <input 
            type="text"
            className="input-field"
            placeholder="Search by Clinic, Doctor, or Location..."
            style={{ paddingLeft: '3rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid-clinics">
        {loading ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading pulses...</p>
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No clinics match your search pulse.</p>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <div key={clinic.id} className="glass-card" style={{ overflow: 'hidden', borderTop: `4px solid ${clinic.is_open ? 'var(--accent-primary)' : 'var(--danger)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                    <Hospital size={20} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '600', margin: 0 }}>{clinic.name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      <MapPin size={12} /> {clinic.location}
                    </div>
                  </div>
                </div>
                <div className={`badge ${clinic.is_open ? 'badge-live' : ''}`} style={!clinic.is_open ? { background: 'rgba(255, 77, 77, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255, 77, 77, 0.2)' } : {}}>
                  {clinic.is_open ? 'Live' : 'Closed'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <Stethoscope size={16} color="var(--accent-secondary)" />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Primary: {clinic.doctor_name}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ fontSize: '4.5rem', fontWeight: 'bold', color: clinic.is_open ? 'var(--accent-primary)' : 'var(--text-secondary)', textShadow: clinic.is_open ? '0 0 20px rgba(0, 210, 255, 0.3)' : 'none' }}>
                    {clinic.is_open ? clinic.patient_count : '--'}
                  </span>
                  {clinic.is_open && <Zap size={24} style={{ position: 'absolute', top: 0, right: '-20px', color: 'var(--accent-primary)' }} className="pulse-secondary" />}
                </div>
                <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  {clinic.is_open ? 'Current Q-Pulse' : 'Clinic Closed'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <footer style={{ marginTop: '5rem', borderTop: '1px solid var(--glass-border)', padding: '2rem 0', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <Link href="/admin" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
          <Settings size={16} /> Admin Portal
        </Link>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
          | Powered by Q-PULSE Network
        </span>
      </footer>
    </main>
  );
}
