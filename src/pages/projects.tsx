import React, { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

const DOMAINS = ['AI/ML', 'Web Dev', 'Mobile', 'IoT', 'Blockchain', 'Cybersecurity', 'DevOps', 'UI/UX', 'Data Science', 'Other'];
const ALL_TAGS = ['React', 'Vue.js', 'Node.js', 'Python', 'Django', 'Flutter', 'Swift', 'AWS', 'Docker', 'TensorFlow', 'MongoDB', 'PostgreSQL', 'Figma', 'Go', 'Rust'];

/* ── Create Project Modal ── */
const CreateProjectModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addProject } = useProjects();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', domain: '', maxTeamSize: 4, tags: [] as string[], status: 'open' as const,
  });
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#f0f0f0', fontSize: 14,
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Project title is required.'); return; }
    if (!form.domain) { setError('Please select a domain.'); return; }
    if (!form.description.trim()) { setError('Please add a description.'); return; }
    if (!user) return;

    addProject({
      title: form.title,
      description: form.description,
      domain: form.domain,
      teamLead: user.name,
      teamLeadId: user.id,
      maxTeamSize: form.maxTeamSize,
      tags: form.tags,
      status: 'open',
    });
    onClose();
  };

  const toggleTag = (tag: string) => {
    setForm(p => ({
      ...p,
      tags: p.tags.includes(tag) ? p.tags.filter(t => t !== tag) : [...p.tags, tag],
    }));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
        background: 'linear-gradient(145deg, rgba(20,10,10,0.95), rgba(12,12,12,0.98))',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22,
        padding: '36px 32px', backdropFilter: 'blur(32px)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
        animation: 'fadeUp 0.3s ease both',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>Create Project</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#606060', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Title */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Project Title *</label>
            <input type="text" placeholder="e.g. AI Campus Assistant" style={inputStyle}
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Description *</label>
            <textarea placeholder="Describe your project, goals, and what you're building..." rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
          </div>

          {/* Domain + Team Size row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Domain *</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.domain} onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}>
                <option value="" style={{ background: '#111' }}>Select domain</option>
                {DOMAINS.map(d => <option key={d} value={d} style={{ background: '#111' }}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                Max Team Size: <span style={{ color: '#e03c52', fontWeight: 700 }}>{form.maxTeamSize}</span>
              </label>
              <input type="range" min={2} max={10} value={form.maxTeamSize}
                onChange={e => setForm(p => ({ ...p, maxTeamSize: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#e03c52', marginTop: 10 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#404040', marginTop: 2 }}>
                <span>2</span><span>10</span>
              </div>
            </div>
          </div>

          {/* Team Lead (read-only) */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Team Lead</label>
            <div style={{ ...inputStyle, color: '#808080', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e03c52,#ff8c69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user?.avatar}
              </div>
              <span style={{ color: '#c0c0c0' }}>{user?.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#e03c52', background: 'rgba(224,60,82,0.1)', padding: '2px 8px', borderRadius: 999 }}>You</span>
            </div>
          </div>

          {/* Tech Tags */}
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 10, display: 'block', fontWeight: 500 }}>
              Tech Stack <span style={{ color: '#404040' }}>(select all that apply)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ALL_TAGS.map(tag => {
                const active = form.tags.includes(tag);
                return (
                  <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                    padding: '5px 13px', fontSize: 12, fontWeight: 500,
                    background: active ? 'rgba(224,60,82,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'rgba(224,60,82,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 999, color: active ? '#f87171' : '#606060',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                  }}>{active && '✓ '}{tag}</button>
                );
              })}
            </div>
          </div>

          <Button type="submit" variant="accent" size="lg" fullWidth>Create Project →</Button>
        </form>
      </div>
    </div>
  );
};

/* ── Project Card ── */
const ProjectCard: React.FC<{ project: any; onJoin: () => void; isOwner: boolean; onDelete: () => void; currentUserId: string }> = ({ project, onJoin, isOwner, onDelete, currentUserId }) => {
  const [hov, setHov] = useState(false);
  const isMember = project.members.some((m: any) => m.id === currentUserId);
  const isFull = project.members.length >= project.maxTeamSize;
  const openSpots = project.maxTeamSize - project.members.length;

  const statusMap: Record<string, any> = {
    'open': 'todo', 'in-progress': 'in-progress', 'completed': 'done',
  };

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 18, padding: '24px 22px',
        backdropFilter: 'blur(20px)', transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
      }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.3 }}>{project.title}</h3>
        <Badge status={statusMap[project.status]}>{project.status}</Badge>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#606060', lineHeight: 1.65, marginBottom: 14 }}>{project.description}</p>

      {/* Domain */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: '#404040', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Domain</span>
        <span style={{ padding: '3px 10px', fontSize: 12, fontWeight: 600, background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.2)', borderRadius: 999, color: '#f87171' }}>{project.domain}</span>
      </div>

      {/* Tags */}
      {project.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {project.tags.map((t: string) => (
            <span key={t} style={{ padding: '3px 10px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 999, color: '#707070' }}>{t}</span>
          ))}
        </div>
      )}

      {/* Team info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#e03c52,#ff8c69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
            {project.teamLead.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: '#808080' }}>Lead: <span style={{ color: '#c0c0c0' }}>{project.teamLead}</span></span>
        </div>
        <span style={{ fontSize: 12, color: '#505050' }}>
          👥 {project.members.length}/{project.maxTeamSize} · {' '}
          <span style={{ color: isFull ? '#f87171' : '#4ade80' }}>
            {isFull ? 'Full' : `${openSpots} spot${openSpots !== 1 ? 's' : ''} open`}
          </span>
        </span>
        <span style={{ fontSize: 11, color: '#404040', marginLeft: 'auto' }}>{project.createdAt}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        {!isOwner && !isMember && !isFull && (
          <Button size="sm" variant="accent" onClick={onJoin}>Join Team</Button>
        )}
        {isMember && !isOwner && (
          <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>✓ Joined</span>
        )}
        {isOwner && (
          <>
            <span style={{ fontSize: 12, color: '#e03c52', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(224,60,82,0.08)', padding: '6px 12px', borderRadius: 8 }}>👑 Your Project</span>
            <Button size="sm" variant="danger" onClick={onDelete} style={{ marginLeft: 'auto' }}>Delete</Button>
          </>
        )}
        {isFull && !isOwner && (
          <span style={{ fontSize: 13, color: '#606060' }}>Team is full</span>
        )}
      </div>
    </div>
  );
};

/* ── Main Projects Page ── */
const FILTERS = ['All', 'Open', 'In Progress', 'Completed'];

const Projects: React.FC = () => {
  const { projects, joinProject, deleteProject } = useProjects();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);

  const filtered = projects.filter(p => {
    const statusMatch = filter === 'All' || p.status === filter.toLowerCase().replace(' ', '-');
    const domainMatch = domainFilter === 'All' || p.domain === domainFilter;
    return statusMatch && domainMatch;
  });

  const usedDomains = ['All', ...Array.from(new Set(projects.map(p => p.domain)))];

  return (
    <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}

      <div className="container" style={{ padding: 0 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Projects</h1>
            <p style={{ color: '#606060', fontSize: 14 }}>
              {projects.length === 0 ? 'No projects yet — be the first to create one!' : `${projects.length} project${projects.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          {user && (
            <Button variant="accent" size="md" onClick={() => setShowCreate(true)}>
              + Create Project
            </Button>
          )}
          {!user && (
            <span style={{ fontSize: 13, color: '#505050', alignSelf: 'center' }}>Log in to create a project</span>
          )}
        </div>

        {/* Filters */}
        {projects.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '7px 16px', background: filter === f ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                  color: filter === f ? '#fff' : '#606060', border: `1px solid ${filter === f ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                  boxShadow: filter === f ? '0 0 16px rgba(224,60,82,0.3)' : 'none',
                }}>{f}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
              {usedDomains.map(d => (
                <button key={d} onClick={() => setDomainFilter(d)} style={{
                  padding: '5px 14px', background: domainFilter === d ? 'rgba(224,60,82,0.12)' : 'rgba(255,255,255,0.03)',
                  color: domainFilter === d ? '#f87171' : '#505050', border: `1px solid ${domainFilter === d ? 'rgba(224,60,82,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                }}>{d}</button>
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No projects yet</h3>
            <p style={{ color: '#505050', fontSize: 14, marginBottom: 28 }}>
              {user ? 'Create the first project and start building your team!' : 'Log in to create a project.'}
            </p>
            {user && <Button variant="accent" onClick={() => setShowCreate(true)}>+ Create First Project</Button>}
          </div>
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {filtered.map(p => (
            <ProjectCard
              key={p.id} project={p}
              currentUserId={user?.id ?? ''}
              isOwner={user?.id === p.teamLeadId}
              onJoin={() => user && joinProject(p.id, user.id, user.name)}
              onDelete={() => user && deleteProject(p.id, user.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Projects;