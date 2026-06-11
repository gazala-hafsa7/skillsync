import { api } from '../api/api';
import React, { useState } from 'react';
import type { MentorRequest, ProjectMember } from '../context/ProjectContext';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { TECH_STACK_OPTIONS } from '../constants/skills';

const DOMAINS = ['AI/ML', 'Web Dev', 'Mobile', 'IoT', 'Blockchain', 'Cybersecurity', 'DevOps', 'UI/UX', 'Data Science', 'Other'];

const normalizeMembers = (members: any[]): ProjectMember[] =>
  (members || []).map(member =>
    typeof member === 'string'
      ? { userId: member, name: 'Member', email: '' }
      : member
  );

const getCompatibility = (userSkills: string[], projectSkills: string[]) => {
  if (userSkills.length === 0 || projectSkills.length === 0) return null;

  const normalizedUserSkills = new Set(userSkills.map(skill => skill.toLowerCase()));
  const matchedSkills = projectSkills.filter(skill => normalizedUserSkills.has(skill.toLowerCase()));

  return {
    percent: Math.round((matchedSkills.length / projectSkills.length) * 100),
    matchedSkills,
  };
};

const getCompatibilityScore = (userSkills: string[], projectSkills: string[]) => {
  const compatibility = getCompatibility(userSkills, projectSkills);

  if (!compatibility) {
    return {
      percent: 0,
      matchedCount: 0,
    };
  }

  return {
    percent: compatibility.percent,
    matchedCount: compatibility.matchedSkills.length,
  };
};

const createProjectDraft = (project?: any) => ({
  title: project?.title ?? '',
  description: project?.description ?? '',
  domain: project?.domain ?? '',
  needsMentor: Boolean(project?.needsMentor),
  maxTeamSize: project?.maxTeamSize ?? 4,
  tags: Array.isArray(project?.tags) ? project.tags : ([] as string[]),
  status: 'open' as const,
});

const ProjectModal: React.FC<{ project?: any; onClose: () => void }> = ({ project, onClose }) => {
  const { user } = useAuth();
  const { updateProject } = useProjects();
  const [form, setForm] = useState(() => createProjectDraft(project));
  const [error, setError] = useState('');
  const isEditing = Boolean(project?.id);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#f0f0f0',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Project title is required.');
      return;
    }
    if (!form.domain) {
      setError('Please select a domain.');
      return;
    }
    if (!form.description.trim()) {
      setError('Please add a description.');
      return;
    }
    if (!user) return;

    try {
      const basePayload = {
        title: form.title,
        description: form.description,
        domain: form.domain,
        needsMentor: form.needsMentor,
        maxTeamSize: form.maxTeamSize,
        tags: form.tags,
        status: 'open' as const,
      };
      const data = isEditing
        ? await updateProject(project.id, basePayload)
        : await api.createProject({
            ...basePayload,
            teamLead: user.name,
            teamLeadId: user._id,
          });

      if (data?._id || data?.id) {
        onClose();
        return;
      }

      setError(data?.message || `Failed to ${isEditing ? 'update' : 'create'} project`);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${isEditing ? 'update' : 'create'} project`);
    }
  };

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item: string) => item !== tag) : [...prev.tags, tag],
    }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, rgba(20,10,10,0.95), rgba(12,12,12,0.98))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          padding: '36px 32px',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
          animation: 'fadeUp 0.3s ease both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>{isEditing ? 'Edit Project' : 'Create Project'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#606060', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>
            ×</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Project Title *</label>
            <input
              type="text"
              placeholder="e.g. AI Campus Assistant"
              style={inputStyle}
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Description *</label>
            <textarea
              placeholder="Describe your project, goals, and what you're building..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Domain *</label>
              <select
                style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.domain}
                onChange={e => setForm(prev => ({ ...prev, domain: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <option value="" style={{ background: '#111' }}>Select domain</option>
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain} style={{ background: '#111' }}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>
                Max Team Size: <span style={{ color: '#e03c52', fontWeight: 700 }}>{form.maxTeamSize}</span>
              </label>
              <input
                type="range"
                min={2}
                max={10}
                value={form.maxTeamSize}
                onChange={e => setForm(prev => ({ ...prev, maxTeamSize: Number(e.target.value) }))}
                style={{ width: '100%', accentColor: '#e03c52', marginTop: 10 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#404040', marginTop: 2 }}>
                <span>2</span>
                <span>10</span>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 16px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f3f4f6', marginBottom: 4 }}>Request a Mentor</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Enable this if your project would benefit from a mentor reviewing or guiding the team.</div>
              </div>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, needsMentor: !prev.needsMentor }))}
                style={{
                  width: 48,
                  height: 26,
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  background: form.needsMentor ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.08)',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 3,
                    left: form.needsMentor ? 25 : 3,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Team Lead</label>
            <div style={{ ...inputStyle, color: '#808080', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e03c52,#ff8c69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {user?.name?.slice(0, 2).toUpperCase()}
              </div>
              <span style={{ color: '#c0c0c0' }}>{user?.name}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#e03c52', background: 'rgba(224,60,82,0.1)', padding: '2px 8px', borderRadius: 999 }}>You</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 10, display: 'block', fontWeight: 500 }}>
              Tech Stack <span style={{ color: '#404040' }}>(select all that apply)</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {TECH_STACK_OPTIONS.map(tag => {
                const active = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '5px 13px',
                      fontSize: 12,
                      fontWeight: 500,
                      background: active ? 'rgba(224,60,82,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${active ? 'rgba(224,60,82,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 999,
                      color: active ? '#f87171' : '#606060',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.18s',
                    }}
                  >
                    {active ? '' : ''}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" variant="accent" size="lg" fullWidth>
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </form>
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{
  project: any;
  onJoin: () => void;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onSendMentorRequest: (message: string) => Promise<any>;
  onAcceptMentorRequest: (mentorId: string) => Promise<any>;
  onReplyToMentorRequest: (mentorId: string, reply: string) => Promise<any>;
  currentUserId: string;
  currentUserIsMentor: boolean;
  currentUserSkills: string[];
}> = ({ project, onJoin, isOwner, onEdit, onDelete, onSendMentorRequest, onAcceptMentorRequest, onReplyToMentorRequest, currentUserId, currentUserIsMentor, currentUserSkills }) => {
  const [hov, setHov] = useState(false);
  const [mentorMessage, setMentorMessage] = useState('');
  const [mentorError, setMentorError] = useState('');
  const [mentorSending, setMentorSending] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyError, setReplyError] = useState('');
  const members = normalizeMembers(project.members);
  const mentorRequests: MentorRequest[] = project.mentorRequests || [];
  const totalTeamCount = members.length + 1;
  const isMember = members.some(member => member.userId === currentUserId);
  const isFull = totalTeamCount >= project.maxTeamSize;
  const openSpots = Math.max(project.maxTeamSize - totalTeamCount, 0);
  const compatibility = getCompatibility(currentUserSkills, project.tags);
  const canOpenChat = isOwner || isMember;
  const hasMentorRequest = mentorRequests.some(request => request.mentorId === currentUserId);
  const currentMentorRequest = mentorRequests.find(request => request.mentorId === currentUserId);
  const canRequestAsMentor = currentUserIsMentor && project.needsMentor && !isOwner && !isMember;

  const statusMap: Record<string, any> = {
    open: 'todo',
    'in-progress': 'in-progress',
    completed: 'done',
  };

  const handleSendMentorRequest = async () => {
    const nextMessage = mentorMessage.trim();
    if (!nextMessage) {
      setMentorError('Write a short mentor intro for the team lead.');
      return;
    }

    setMentorSending(true);
    const response = await onSendMentorRequest(nextMessage);
    setMentorSending(false);

    if (response?._id || response?.id) {
      setMentorMessage('');
      setMentorError('');
      return;
    }

    setMentorError(response?.message || 'Failed to send mentor request.');
  };

  const handleReplyToRequest = async (mentorId: string) => {
    const reply = (replyDrafts[mentorId] || '').trim();
    if (!reply) {
      setReplyError('Write a reply before sending.');
      return;
    }

    const response = await onReplyToMentorRequest(mentorId, reply);

    if (response?._id || response?.id) {
      setReplyDrafts(prev => ({ ...prev, [mentorId]: '' }));
      setReplyError('');
      return;
    }

    setReplyError(response?.message || 'Failed to send reply.');
  };

  const handleAcceptMentorRequest = async (mentorId: string) => {
    const response = await onAcceptMentorRequest(mentorId);

    if (response?._id || response?.id) {
      setReplyError('');
      return;
    }

    setReplyError(response?.message || 'Failed to accept mentor request.');
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 18,
        padding: '24px 22px',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.2px', lineHeight: 1.3 }}>{project.title}</h3>
        <Badge status={statusMap[project.status]}>{project.status}</Badge>
      </div>

      <p style={{ fontSize: 13, color: '#606060', lineHeight: 1.65, marginBottom: 14 }}>{project.description}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: '#404040', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Domain</span>
        <span style={{ padding: '3px 10px', fontSize: 12, fontWeight: 600, background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.2)', borderRadius: 999, color: '#f87171' }}>
          {project.domain}
        </span>
        {project.needsMentor && (
          <span style={{ padding: '3px 10px', fontSize: 12, fontWeight: 600, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 999, color: '#7dd3fc' }}>
            Mentor Needed
          </span>
        )}
      </div>

      {project.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {project.tags.map((tag: string) => (
            <span key={tag} style={{ padding: '3px 10px', fontSize: 11, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 999, color: '#707070' }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {!isOwner && compatibility && (
        <div
          style={{
            marginBottom: 16,
            padding: '10px 12px',
            borderRadius: 12,
            background: 'rgba(224,60,82,0.08)',
            border: '1px solid rgba(224,60,82,0.18)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Compatibility
            </span>
            <span style={{ fontSize: 14, color: '#fff', fontWeight: 700 }}>{compatibility.percent}% match</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>
            {compatibility.matchedSkills.length > 0
              ? `You match ${compatibility.matchedSkills.length} of ${project.tags.length} required skill${project.tags.length === 1 ? '' : 's'}.`
              : "No overlap with this project's required skills yet."}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#e03c52,#ff8c69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
            {project.teamLead.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 12, color: '#808080' }}>
            Lead: <span style={{ color: '#c0c0c0' }}>{project.teamLead}</span>
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#505050' }}>
          Team {totalTeamCount}/{project.maxTeamSize} ·{' '}
          <span style={{ color: isFull ? '#f87171' : '#4ade80' }}>
            {isFull ? 'Full' : `${openSpots} spot${openSpots !== 1 ? 's' : ''} open`}
          </span>
        </span>
        <span style={{ fontSize: 11, color: '#404040', marginLeft: 'auto' }}>{project.createdAt}</span>
      </div>

      {isOwner && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: 12, color: '#f3f4f6', fontWeight: 700, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Joined Members
          </div>
          {members.length === 0 && <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>No one has joined yet.</p>}
          {members.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map(member => (
                <div
                  key={member.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#e03c52,#ff8c69)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.hash = `profile/${member.userId}`;
                      }}
                      style={{
                        fontSize: 13,
                        color: '#e5e7eb',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {member.name}
                    </button>
                    {member.email && <div style={{ fontSize: 11, color: '#6b7280' }}>{member.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isOwner && project.needsMentor && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.16)',
          }}
        >
          <div style={{ fontSize: 12, color: '#f3f4f6', fontWeight: 700, marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Mentor Requests
          </div>
          {mentorRequests.length === 0 && <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>No mentor requests yet.</p>}
          {mentorRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mentorRequests.map(request => (
                <div
                  key={request.mentorId}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (request.mentorId) {
                        window.location.hash = `profile/${request.mentorId}`;
                      }
                    }}
                    style={{
                      fontSize: 13,
                      color: '#fff',
                      fontWeight: 700,
                      marginBottom: 4,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: request.mentorId ? 'pointer' : 'default',
                      textAlign: 'left',
                    }}
                  >
                    {request.mentorName}
                  </button>
                  {request.mentorEmail && <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{request.mentorEmail}</div>}
                  <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.55, marginBottom: request.reply ? 10 : 8 }}>{request.message}</div>
                  {request.accepted && (
                    <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 12, color: '#86efac', lineHeight: 1.5, marginBottom: 8 }}>
                      Mentor request accepted
                    </div>
                  )}
                  {request.reply && (
                    <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(224,60,82,0.08)', border: '1px solid rgba(224,60,82,0.14)', fontSize: 12, color: '#fca5a5', lineHeight: 1.5, marginBottom: 8 }}>
                      Reply: {request.reply}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    {!request.accepted && (
                      <Button type="button" size="sm" variant="accent" onClick={() => void handleAcceptMentorRequest(request.mentorId)}>
                        Accept Mentor
                      </Button>
                    )}
                    <input
                      type="text"
                      value={replyDrafts[request.mentorId] || ''}
                      onChange={e => setReplyDrafts(prev => ({ ...prev, [request.mentorId]: e.target.value }))}
                      placeholder="Reply to mentor"
                      style={{
                        flex: 1,
                        minWidth: 170,
                        padding: '9px 12px',
                        background: 'rgba(0,0,0,0.35)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        color: '#f0f0f0',
                        fontSize: 12,
                        fontFamily: 'inherit',
                        outline: 'none',
                      }}
                    />
                    <Button type="button" size="sm" variant="glass" onClick={() => void handleReplyToRequest(request.mentorId)}>
                      Send Reply
                    </Button>
                  </div>
                </div>
              ))}
              {replyError && <div style={{ fontSize: 12, color: '#f87171' }}>{replyError}</div>}
            </div>
          )}
        </div>
      )}

      {canRequestAsMentor && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(56,189,248,0.08)',
            border: '1px solid rgba(56,189,248,0.16)',
          }}
        >
          <div style={{ fontSize: 12, color: '#f3f4f6', fontWeight: 700, marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Mentor Contact
          </div>
          {!hasMentorRequest ? (
            <>
              <textarea
                rows={2}
                value={mentorMessage}
                onChange={e => setMentorMessage(e.target.value)}
                placeholder="Send one message to the team lead about how you can mentor this project"
                style={{
                  width: '100%',
                  resize: 'vertical',
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  color: '#f0f0f0',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  outline: 'none',
                  marginBottom: 8,
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                {mentorError ? <div style={{ fontSize: 12, color: '#f87171' }}>{mentorError}</div> : <div style={{ fontSize: 12, color: '#94a3b8' }}>This opens a direct reply line from the team lead.</div>}
                <Button type="button" size="sm" variant="glass" onClick={() => void handleSendMentorRequest()}>
                  {mentorSending ? 'Sending...' : 'Send Mentor Request'}
                </Button>
              </div>
            </>
          ) : (
            <div>
              <div style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.55, marginBottom: currentMentorRequest?.reply ? 8 : 0 }}>
                Your request: {currentMentorRequest?.message || 'No message added.'}
              </div>
              {currentMentorRequest?.accepted && (
                <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', fontSize: 12, color: '#86efac', lineHeight: 1.5, marginBottom: currentMentorRequest?.reply ? 8 : 0 }}>
                  Team lead accepted your mentor request.
                </div>
              )}
              {currentMentorRequest?.reply && (
                <div style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(224,60,82,0.08)', border: '1px solid rgba(224,60,82,0.14)', fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>
                  Team lead reply: {currentMentorRequest.reply}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {canOpenChat && (
          <Button
            size="sm"
            variant="glass"
            onClick={() => {
              window.location.hash = `project-chat/${project.id}`;
            }}
          >
            Project Chat
          </Button>
        )}
        {!isOwner && (
          <Button size="sm" variant="accent" onClick={onJoin} disabled={isMember || isFull}>
            {isMember ? 'Joined' : isFull ? 'Full' : 'Join Team'}
          </Button>
        )}
        {isMember && !isOwner && (
          <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>Joined</span>
        )}
        {isOwner && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 12, color: '#e03c52', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(224,60,82,0.08)', padding: '6px 12px', borderRadius: 8 }}>
              Your Project
            </span>
            <Button size="sm" variant="glass" onClick={onEdit}>
              Edit
            </Button>
            <Button size="sm" variant="danger" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}
        {isFull && !isOwner && <span style={{ fontSize: 13, color: '#606060' }}>Team is full</span>}
      </div>
    </div>
  );
};

const STATUS_FILTERS = [
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
] as const;
const PROJECT_VIEWS = [
  { id: 'explore', label: 'Explore' },
  { id: 'joined', label: 'Joined Projects' },
  { id: 'owned', label: 'Your Projects' },
  { id: 'mentor', label: 'Mentor Projects' },
] as const;
const EXPLORE_SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'recent', label: 'Recently Added' },
] as const;

const Projects: React.FC = () => {
  const { projects, joinProject, deleteProject, sendMentorRequest, acceptMentorRequest, replyToMentorRequest } = useProjects();
  const { user } = useAuth();
  const [showSorts, setShowSorts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projectView, setProjectView] = useState<(typeof PROJECT_VIEWS)[number]['id']>('explore');
  const [exploreSort, setExploreSort] = useState<(typeof EXPLORE_SORTS)[number]['id']>('recommended');
  const currentUserId = user?._id ?? '';

  const joinedProjects = projects.filter(project =>
    normalizeMembers(project.members).some(member => member.userId === currentUserId)
  );

  const ownedProjects = projects.filter(project => project.teamLeadId === currentUserId);
  const mentorProjects = projects.filter(project => project.needsMentor);

  const filtered = projects.filter(project => {
    const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(project.status);
    const domainMatch = selectedDomains.length === 0 || selectedDomains.includes(project.domain);
    return statusMatch && domainMatch;
  });

  const recommendedProjects = [...filtered].sort((a, b) => {
    const left = getCompatibilityScore(user?.skills ?? [], a.tags);
    const right = getCompatibilityScore(user?.skills ?? [], b.tags);

    if (right.percent !== left.percent) return right.percent - left.percent;
    if (right.matchedCount !== left.matchedCount) return right.matchedCount - left.matchedCount;
    return (a.title || '').localeCompare(b.title || '');
  });

  const recentProjects = [...filtered].sort((a, b) => {
    const left = new Date(a.createdAt ?? 0).getTime();
    const right = new Date(b.createdAt ?? 0).getTime();

    if (Number.isNaN(right) && Number.isNaN(left)) return (a.title || '').localeCompare(b.title || '');
    if (Number.isNaN(right)) return -1;
    if (Number.isNaN(left)) return 1;
    if (right !== left) return right - left;
    return (a.title || '').localeCompare(b.title || '');
  });

  const exploreProjects = exploreSort === 'recommended' ? recommendedProjects : recentProjects;

  const visibleProjects =
    projectView === 'joined'
      ? joinedProjects
      : projectView === 'owned'
        ? ownedProjects
        : projectView === 'mentor'
          ? mentorProjects
        : exploreProjects;

  const emptyStateTitle =
    projectView === 'joined'
      ? 'No joined projects yet'
      : projectView === 'owned'
        ? 'No owned projects yet'
        : projectView === 'mentor'
          ? 'No mentor-requested projects yet'
        : 'No projects yet';

  const emptyStateCopy =
    projectView === 'joined'
      ? 'Projects you join will show up here.'
      : projectView === 'owned'
        ? 'Create a project to manage it from here.'
        : projectView === 'mentor'
          ? 'Projects asking for a mentor will show up here for mentor-enabled users.'
        : user
          ? 'Create the first project and start building your team!'
          : 'Log in to create a project.';

  const usedDomains = Array.from(new Set(projects.map(project => project.domain)));
  const activeFilterCount = selectedStatuses.length + selectedDomains.length;

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(item => item !== status) : [...prev, status]
    );
  };

  const toggleDomainFilter = (domain: string) => {
    setSelectedDomains(prev =>
      prev.includes(domain) ? prev.filter(item => item !== domain) : [...prev, domain]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedDomains([]);
  };

  return (
    <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
      {showCreate && <ProjectModal onClose={() => setShowCreate(false)} />}
      {editingProject && <ProjectModal project={editingProject} onClose={() => setEditingProject(null)} />}

      <div className="container" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Projects</h1>
            <p style={{ color: '#606060', fontSize: 14 }}>
              {projects.length === 0 ? 'No projects yet - be the first to create one!' : `${projects.length} project${projects.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          {user && (
            <Button variant="accent" size="md" onClick={() => setShowCreate(true)}>
              + Create Project
            </Button>
          )}
          {!user && <span style={{ fontSize: 13, color: '#505050', alignSelf: 'center' }}>Log in to create a project</span>}
        </div>

        {user && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {PROJECT_VIEWS.filter(view => {
              if (view.id === 'owned') return ownedProjects.length > 0;
              if (view.id === 'mentor') return Boolean(user?.isMentor);
              return true;
            }).map(view => (
              <button
                key={view.id}
                onClick={() => setProjectView(view.id)}
                style={{
                  padding: '7px 16px',
                  background: projectView === view.id ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                  color: projectView === view.id ? '#fff' : '#606060',
                  border: `1px solid ${projectView === view.id ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s',
                  boxShadow: projectView === view.id ? '0 0 16px rgba(224,60,82,0.3)' : 'none',
                }}
              >
                {view.label}
              </button>
            ))}
          </div>
        )}

        {projectView === 'explore' && projects.length > 0 && (
          <section style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSorts(prev => !prev);
                      setShowFilters(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      background: showSorts ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      border: `1px solid ${showSorts ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      boxShadow: showSorts ? '0 0 16px rgba(224,60,82,0.25)' : 'none',
                    }}
                  >
                    Sort by
                  </button>

                  {showSorts && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: 220,
                        padding: 12,
                        borderRadius: 18,
                        background: 'linear-gradient(145deg, rgba(20,10,10,0.98), rgba(12,12,12,0.98))',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 28px 50px rgba(0,0,0,0.45)',
                        zIndex: 31,
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#808080', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                        Sort by
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {EXPLORE_SORTS.map(option => {
                          const active = exploreSort === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setExploreSort(option.id);
                                setShowSorts(false);
                              }}
                              style={{
                                padding: '9px 12px',
                                background: active ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                                color: active ? '#fff' : '#c0c0c0',
                                border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                                borderRadius: 12,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                textAlign: 'left',
                              }}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowFilters(prev => !prev);
                      setShowSorts(false);
                    }}
                    style={{
                      padding: '8px 14px',
                      background: showFilters || activeFilterCount > 0 ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                      color: '#fff',
                      border: `1px solid ${showFilters || activeFilterCount > 0 ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s',
                      boxShadow: showFilters || activeFilterCount > 0 ? '0 0 16px rgba(224,60,82,0.25)' : 'none',
                    }}
                  >
                    {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
                  </button>

                  {showFilters && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: 'min(420px, calc(100vw - 48px))',
                        padding: 16,
                        borderRadius: 18,
                        background: 'linear-gradient(145deg, rgba(20,10,10,0.98), rgba(12,12,12,0.98))',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 28px 50px rgba(0,0,0,0.45)',
                        zIndex: 30,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Filter projects</div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>Select one or more options.</div>
                        </div>
                        <button
                          type="button"
                          onClick={clearFilters}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: activeFilterCount > 0 ? '#fca5a5' : '#6b7280',
                            cursor: activeFilterCount > 0 ? 'pointer' : 'default',
                            fontSize: 12,
                            fontWeight: 600,
                            padding: 0,
                          }}
                          disabled={activeFilterCount === 0}
                        >
                          Clear all
                        </button>
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, color: '#808080', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Status</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {STATUS_FILTERS.map(option => {
                            const active = selectedStatuses.includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => toggleStatusFilter(option.id)}
                                style={{
                                  padding: '7px 14px',
                                  background: active ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                                  color: active ? '#fff' : '#c0c0c0',
                                  border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: 11, color: '#808080', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8 }}>Domain</div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {usedDomains.map(domain => {
                            const active = selectedDomains.includes(domain);
                            return (
                              <button
                                key={domain}
                                type="button"
                                onClick={() => toggleDomainFilter(domain)}
                                style={{
                                  padding: '6px 12px',
                                  background: active ? 'rgba(224,60,82,0.14)' : 'rgba(255,255,255,0.03)',
                                  color: active ? '#f87171' : '#a3a3a3',
                                  border: `1px solid ${active ? 'rgba(224,60,82,0.35)' : 'rgba(255,255,255,0.06)'}`,
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit',
                                }}
                              >
                                {domain}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {visibleProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{emptyStateTitle}</h3>
            <p style={{ color: '#505050', fontSize: 14, marginBottom: 28 }}>
              {projectView === 'explore' && activeFilterCount > 0 ? 'No projects match your current filters.' : emptyStateCopy}
            </p>
            {user && projectView !== 'joined' && (
              <Button variant="accent" onClick={() => setShowCreate(true)}>
                {projectView === 'owned' ? '+ Create Project' : '+ Create First Project'}
              </Button>
            )}
          </div>
        )}

        {visibleProjects.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.3px' }}>
              {projectView === 'joined' ? 'Joined Projects' : projectView === 'owned' ? 'Your Projects' : 'Projects'}
            </h2>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
          {visibleProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUserId={currentUserId}
              currentUserIsMentor={Boolean(user?.isMentor)}
              currentUserSkills={user?.skills ?? []}
              isOwner={currentUserId === project.teamLeadId}
              onJoin={() => user && joinProject(project.id)}
              onEdit={() => setEditingProject(project)}
              onSendMentorRequest={(message: string) => sendMentorRequest(project.id, message)}
              onAcceptMentorRequest={(mentorId: string) => acceptMentorRequest(project.id, mentorId)}
              onReplyToMentorRequest={(mentorId: string, reply: string) => replyToMentorRequest(project.id, mentorId, reply)}
              onDelete={() => user && deleteProject(project.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Projects;

