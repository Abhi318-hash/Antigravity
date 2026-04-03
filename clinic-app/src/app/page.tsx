'use client'

import { getClinics } from '@/lib/actions';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Users, LayoutDashboard, Settings, Activity, Zap, Hospital, MapPin, Search as SearchIcon, Stethoscope, Star, Heart, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function HomeContent() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem('qpulse_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

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

  // Handle addFavorite from QR scan
  useEffect(() => {
    const addId = searchParams.get('addFavorite');
    if (addId && !favorites.includes(addId)) {
      const newFavs = [...favorites, addId];
      setFavorites(newFavs);
      localStorage.setItem('qpulse_favorites', JSON.stringify(newFavs));
      // Clear the param from URL without a full refresh
      const params = new URLSearchParams(searchParams.toString());
      params.delete('addFavorite');
      router.replace(`/?${params.toString()}`);
    }
  }, [searchParams, favorites, router]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(favId => favId !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem('qpulse_favorites', JSON.stringify(newFavs));
  };

  const filteredClinics = clinics.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  const favoriteClinics = clinics.filter(c => favorites.includes(c.id));
  const otherClinics = filteredClinics.filter(c => !favorites.includes(c.id));

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

      {/* Favorites Section */}
      {favorites.length > 0 && !search && (
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Heart size={20} fill="var(--accent-primary)" color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-primary)' }}>Your Favorites</h2>
          </div>
          <div className="grid-clinics">
            {favoriteClinics.map(clinic => (
              <ClinicCard key={clinic.id} clinic={clinic} isFavorite={true} onFavoriteToggle={toggleFavorite} />
            ))}
          </div>
          <div style={{ margin: '2.5rem 0', height: '1px', background: 'linear-gradient(90deg, transparent, var(--glass-border), transparent)' }}></div>
        </section>
      )}

      <div className="grid-clinics">
        {loading ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading pulses...</p>
          </div>
        ) : otherClinics.length === 0 && favoriteClinics.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No clinics match your search pulse.</p>
          </div>
        ) : (
          otherClinics.map((clinic) => (
            <ClinicCard key={clinic.id} clinic={clinic} isFavorite={favorites.includes(clinic.id)} onFavoriteToggle={toggleFavorite} />
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

function ClinicCard({ clinic, isFavorite, onFavoriteToggle }: { clinic: any, isFavorite: boolean, onFavoriteToggle: (id: string, e: React.MouseEvent) => void }) {
  const [showQR, setShowQR] = useState(false);
  const patientUrl = typeof window !== 'undefined' ? `${window.location.origin}/?addFavorite=${clinic.id}` : '';

  return (
    <div className="glass-card" style={{ overflow: 'hidden', borderTop: `4px solid ${clinic.is_open ? 'var(--accent-primary)' : 'var(--danger)'}`, position: 'relative' }}>
      <button 
        onClick={(e) => onFavoriteToggle(clinic.id, e)}
        style={{ position: 'absolute', top: '1rem', right: '3.5rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, padding: '0.5rem' }}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star size={20} fill={isFavorite ? "var(--accent-primary)" : "none"} color={isFavorite ? "var(--accent-primary)" : "var(--text-secondary)"} style={{ transition: 'all 0.2s' }} />
      </button>

      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowQR(!showQR); }}
        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10, padding: '0.5rem' }}
        title="Show QR Code"
      >
        <QrCode size={20} color={showQR ? "var(--accent-primary)" : "var(--text-secondary)"} style={{ transition: 'all 0.2s' }} />
      </button>

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

      {showQR && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', animation: 'slideDown 0.3s ease-out' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Scan this QR on another phone to add it to favorites!</p>
          <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', display: 'inline-block' }}>
            <QRCodeSVG value={patientUrl} size={150} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
