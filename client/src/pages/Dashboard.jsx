import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatDate, getStatusConfig } from '../utils/formatters';

const StatCard = ({ emoji, num, label, chip, chipColor, chipBg }) => (
  <div style={{
    background: 'var(--bg-card)', border: '0.5px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '1.1rem 1.25rem',
    borderTop: '3px solid var(--primary)', boxShadow: 'var(--shadow-sm)',
  }}>
    <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
    <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 2 }}>{num}</div>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
    {chip && (
      <div style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: chipBg, color: chipColor }}>
        {chip}
      </div>
    )}
  </div>
);

const AppRow = ({ app, index }) => {
  const cfg = getStatusConfig(app.status);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '9px 12px', background: 'var(--bg-card)',
      border: '0.5px solid var(--border)', borderRadius: 'var(--radius-md)',
      borderLeft: `3px solid ${cfg.color}`,
    }}>
      <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--border-mid)', width: 24, textAlign: 'center', flexShrink: 0 }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{app.company}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{app.role}</div>
      </div>
      <div style={{ display: 'inline-flex', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
        {cfg.emoji} {cfg.label}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{formatDate(app.applied_date)}</div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary,  setSummary]  = useState(null);
  const [apps,     setApps]     = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, appRes] = await Promise.allSettled([
        api.get('/analytics/summary'),
        api.get('/applications'),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data.data.summary);
      if (appRes.status === 'fulfilled') setApps(appRes.value.data.data.applications);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const featured = apps.find(a =>
    a.status === 'interview' || a.status === 'offer' || a.status === 'phone_screen'
  );

  const recentApps = apps.slice(0, 6);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <>
      {/* ── Greeting ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
            {summary?.total > 0
              ? `You have ${summary.total} applications — ${summary.interview || 0} interview${summary.interview !== 1 ? 's' : ''} in progress`
              : 'Start tracking your job search below'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/applications')}>
          + Add application
        </button>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        <StatCard emoji="📨" num={summary?.total || 0} label="Applications"
          chip="+3 this week" chipBg="var(--primary-light)" chipColor="var(--primary)" />
        <StatCard emoji="💬" num={summary?.response_rate ? `${summary.response_rate}%` : '0%'} label="Response rate"
          chip="vs industry avg" chipBg="#EFF6FF" chipColor="#1D4ED8" />
        <StatCard emoji="🎯" num={summary?.interview || 0} label="Interviews"
          chip={summary?.phone_screen ? `+${summary.phone_screen} phone screen` : 'None active'} chipBg="var(--warning-light)" chipColor="var(--warning)" />
        <StatCard emoji="🎉" num={summary?.offers || 0} label="Offers received"
          chip={summary?.offers > 0 ? 'Congratulations!' : 'Keep going!'} chipBg="var(--success-light)" chipColor="var(--success)" />
      </div>

      {/* ── Main grid ────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem' }}>

        {/* Left — applications list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span className="section-title">Recent applications</span>
            <Link to="/applications" style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>View all →</Link>
          </div>

          {apps.length === 0 ? (
            <div className="empty-state" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '3rem' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <h3>No applications yet</h3>
              <p>Start tracking your job search by adding your first application</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/applications')}>
                + Add first application
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {recentApps.map((app, i) => <AppRow key={app.id} app={app} index={i} />)}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Featured / action needed */}
          {featured && (
            <div>
              <span className="section-title-full">Action needed</span>
              <div style={{
                background: 'var(--bg-card)', border: '0.5px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '1rem',
                borderTop: `3px solid ${getStatusConfig(featured.status).color}`,
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, background: getStatusConfig(featured.status).bg, color: getStatusConfig(featured.status).color, padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 8 }}>
                  {getStatusConfig(featured.status).emoji} {getStatusConfig(featured.status).label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.3px', marginBottom: 2 }}>{featured.company}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{featured.role}</div>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}
                  onClick={() => navigate('/ai')}>
                  ✨ Prepare with AI →
                </button>
              </div>
            </div>
          )}

          {/* Pipeline summary */}
          <div>
            <span className="section-title-full">Pipeline</span>
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {[
                { key: 'applied',      label: 'Applied',      emoji: '📨' },
                { key: 'phone_screen', label: 'Phone screen', emoji: '📞' },
                { key: 'interview',    label: 'Interview',    emoji: '🎯' },
                { key: 'offer',        label: 'Offer',        emoji: '🎉' },
                { key: 'rejected',     label: 'Rejected',     emoji: '❌' },
              ].map((s, i, arr) => {
                const count = summary?.[s.key] || 0;
                const total = summary?.total || 1;
                const pct   = Math.round((count / total) * 100);
                const cfg   = getStatusConfig(s.key);
                return (
                  <div key={s.key} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    borderBottom: i < arr.length - 1 ? '0.5px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontSize: 14 }}>{s.emoji}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>{s.label}</span>
                    <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginRight: 6 }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: cfg.color, borderRadius: 99 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-primary)', width: 20, textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Assistant CTA */}
          <div style={{
            background: '#134E2A',
            borderRadius: 'var(--radius-lg)',
            padding: '1.1rem',
          }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 5 }}>✨ AI Assistant</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 12 }}>
              Get tailored interview questions and cover letter tips for any role.
            </div>
            <button
              onClick={() => navigate('/ai')}
              style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', padding: '7px 12px', borderRadius: 6, fontSize: 12, fontWeight: 800, width: '100%', cursor: 'pointer' }}>
              Open AI Assistant →
            </button>
          </div>

        </div>
      </div>

      {/* Onboarding banner for new users */}
      {apps.length === 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '0.5px solid var(--border)',
          borderTop: '3px solid var(--primary)',
          borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginTop: '1.5rem',
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Getting started
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {[
              { step: '01', title: 'Add an application', desc: 'Log a job you applied to', link: '/applications' },
              { step: '02', title: 'Track the status',   desc: 'Update as you progress',  link: '/applications' },
              { step: '03', title: 'Prep with AI',       desc: 'Get interview questions',  link: '/ai'          },
              { step: '04', title: 'Review analytics',   desc: 'See your response rate',   link: '/analytics'   },
            ].map(item => (
              <div key={item.step}
                onClick={() => navigate(item.link)}
                style={{
                  background: 'var(--bg)', border: '0.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--border-mid)', marginBottom: 6 }}>{item.step}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}