import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

type NewsType = 'hackathon' | 'workshop' | 'startup' | 'general';

const TYPE_OPTIONS: { value: NewsType; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop',  label: 'Workshop' },
  { value: 'startup',   label: 'Startup' },
  { value: 'general',   label: 'General' },
];

const TYPE_STATUS_MAP: Record<NewsType, any> = {
  hackathon: 'in-progress',
  workshop:  'todo',
  startup:   'done',
  general:   'on-hold',
};

/* ── Add News Modal (Admin only) ── */
const AddNewsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addNews } = useNews();
  const { user } = useAuth();
  const [form, setForm] = useState({ type: 'hackathon' as NewsType, title: '', description: '', link: '', hot: false });
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#f0f0f0', fontSize: 14,
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    addNews({ ...form, postedBy: user?.name ?? 'Admin' });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'linear-gradient(145deg, rgba(20,10,10,0.95), rgba(12,12,12,0.98))',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: '36px 32px',
        backdropFilter: 'blur(32px)', boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
        animation: 'fadeUp 0.3s ease both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>Post Announcement</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#606060', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Type */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Type *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setForm(p => ({ ...p, type: opt.value }))} style={{
                  flex: 1, padding: '9px 8px', borderRadius: 10, border: 'none', fontFamily: 'inherit',
                  background: form.type === opt.value ? 'rgba(224,60,82,0.8)' : 'rgba(255,255,255,0.04)',
                  color: form.type === opt.value ? '#fff' : '#606060',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                }}>{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Title *</label>
            <input type="text" placeholder="e.g. HackIndia 2026 — Register Now!" style={inputStyle}
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Description *</label>
            <textarea placeholder="Details about the event..." rows={3} style={{ ...inputStyle, resize: 'vertical' }}
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </div>

          {/* Link */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Link <span style={{ color: '#404040' }}>(optional)</span></label>
            <input type="url" placeholder="https://..." style={inputStyle}
              value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </div>

          {/* Hot toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={() => setForm(p => ({ ...p, hot: !p.hot }))} style={{
              width: 44, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
              background: form.hot ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.08)',
              transition: 'all 0.2s', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', top: 3, left: form.hot ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: 13, color: '#808080' }}>Mark as 🔥 Hot</span>
          </div>

          <Button type="submit" variant="accent" size="lg" fullWidth>Post Announcement →</Button>
        </form>
      </div>
    </div>
  );
};

/* ── News Item Card ── */
const NewsCard: React.FC<{ item: any; canDelete: boolean; onDelete: () => void }> = ({ item, canDelete, onDelete }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 16, padding: '22px 24px', backdropFilter: 'blur(20px)',
        transition: 'all 0.25s ease', transform: hov ? 'translateX(4px)' : 'none',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <Badge status={TYPE_STATUS_MAP[item.type as NewsType]}>{item.type}</Badge>
            {item.hot && <span style={{ padding: '3px 9px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 999, fontSize: 11, color: '#f87171', fontWeight: 700 }}>🔥 Hot</span>}
            <span style={{ fontSize: 11, color: '#404040', marginLeft: 'auto' }}>by {item.postedBy}</span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 7, letterSpacing: '-0.2px' }}>{item.title}</h3>
          <p style={{ fontSize: 14, color: '#606060', lineHeight: 1.7, marginBottom: item.link ? 12 : 0 }}>{item.description}</p>
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#e03c52', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Learn more →
            </a>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: '#404040' }}>{item.date}</span>
          {canDelete && (
            <button onClick={onDelete} style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.2)', borderRadius: 8, padding: '4px 10px', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,60,82,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(224,60,82,0.1)')}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Main News Board ── */
const NewsBoard: React.FC = () => {
  const { news, deleteNews } = useNews();
  const { user, isAdmin } = useAuth();
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const CATS = ['All', 'Hackathon', 'Workshop', 'Startup', 'General'];
  const filtered = filter === 'All' ? news : news.filter(n => n.type === filter.toLowerCase());

  return (
    <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
      {showAdd && <AddNewsModal onClose={() => setShowAdd(false)} />}

      <div className="container" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>News Board</h1>
            <p style={{ color: '#606060', fontSize: 14 }}>Campus events, hackathons, and announcements</p>
          </div>
          {isAdmin && (
            <Button variant="accent" size="md" onClick={() => setShowAdd(true)}>
              + Post Announcement
            </Button>
          )}
          {!isAdmin && user && (
            <span style={{ fontSize: 12, color: '#404040', alignSelf: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '8px 14px', borderRadius: 10 }}>
              🔒 Only admins can post
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: '7px 18px', background: filter === c ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
              color: filter === c ? '#fff' : '#606060', border: `1px solid ${filter === c ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              boxShadow: filter === c ? '0 0 16px rgba(224,60,82,0.3)' : 'none',
            }}>{c}</button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No announcements yet</h3>
            <p style={{ color: '#505050', fontSize: 14 }}>
              {isAdmin ? 'Post the first announcement for your campus!' : 'Check back soon for updates from your admin.'}
            </p>
          </div>
        )}

        {/* News list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => (
            <NewsCard key={item.id} item={item}
              canDelete={isAdmin}
              onDelete={() => deleteNews(item.id)} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default NewsBoard;