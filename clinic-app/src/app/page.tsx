import { getClinics } from '@/lib/actions';
import Link from 'next/link';
import { Users, LayoutDashboard, Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const clinics = await getClinics();

  return (
    <main className="container fade-in">
      <header className="header">
        <h1 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', background: 'linear-gradient(to right, #ffffff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Clinic Live Queue
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
          Real-time patient count across all locations
        </p>
      </header>

      <div className="grid-clinics">
        {clinics.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No clinics registered yet. Set up one in Admin panel.</p>
          </div>
        ) : (
          clinics.map((clinic: any) => (
            <div key={clinic.id} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>{clinic.name}</h2>
                <div className="badge badge-live">Live</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem 0' }}>
                <span style={{ fontSize: '4.5rem', fontWeight: 'bold', color: 'var(--accent-primary)', textShadow: '0 0 20px rgba(0, 210, 255, 0.3)' }}>
                  {clinic.patient_count}
                </span>
                <span style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600' }}>
                  Patients Waiting
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
          | Managed by Clinic Network
        </span>
      </footer>
    </main>
  );
}
