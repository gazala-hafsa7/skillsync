import React, { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

type NewsType = 'hackathon' | 'workshop' | 'startup' | 'general';

type NewsDraft = {
  type: NewsType;
  title: string;
  description: string;
  link: string;
  eventDate: string;
  eventDateInput: string;
  eventTimeInput: string;
  hot: boolean;
};

const TYPE_OPTIONS: { value: NewsType; label: string }[] = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'startup', label: 'Startup' },
  { value: 'general', label: 'General' },
];

const TYPE_STATUS_MAP: Record<NewsType, 'in-progress' | 'todo' | 'done' | 'on-hold'> = {
  hackathon: 'in-progress',
  workshop: 'todo',
  startup: 'done',
  general: 'on-hold',
};

const formatEventDate = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const buildEventDate = (dateValue: string, timeValue: string) => {
  const trimmedDate = dateValue.trim();
  if (!trimmedDate) {
    return '';
  }

  const match = trimmedDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return '';
  }

  const [, dayPart, monthPart, yearPart] = match;
  const day = Number(dayPart);
  const month = Number(monthPart);
  const year = Number(yearPart);
  const [hours = '00', minutes = '00'] = timeValue.split(':');

  if (month < 1 || month > 12 || day < 1) {
    return '';
  }

  const candidate = new Date(year, month - 1, day, Number(hours), Number(minutes));

  if (
    Number.isNaN(candidate.getTime()) ||
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return '';
  }

  return `${yearPart}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${timeValue || '00:00'}`;
};

const createEmptyDraft = (): NewsDraft => ({
  type: 'hackathon',
  title: '',
  description: '',
  link: '',
  eventDate: '',
  eventDateInput: '',
  eventTimeInput: '09:00',
  hot: false,
});

const createDraftFromItem = (item?: any): NewsDraft => {
  if (!item) {
    return createEmptyDraft();
  }

  const eventDate = item.eventDate ? new Date(item.eventDate) : null;
  const hasValidEventDate = Boolean(eventDate) && !Number.isNaN(eventDate?.getTime());

  return {
    type: item.type as NewsType,
    title: item.title || '',
    description: item.description || '',
    link: item.link || '',
    eventDate: item.eventDate || '',
    eventDateInput: hasValidEventDate
      ? `${String(eventDate!.getDate()).padStart(2, '0')}/${String(eventDate!.getMonth() + 1).padStart(2, '0')}/${eventDate!.getFullYear()}`
      : '',
    eventTimeInput: hasValidEventDate
      ? `${String(eventDate!.getHours()).padStart(2, '0')}:${String(eventDate!.getMinutes()).padStart(2, '0')}`
      : '09:00',
    hot: Boolean(item.hot),
  };
};

const NewsModal: React.FC<{ item?: any; onClose: () => void }> = ({ item, onClose }) => {
  const { addNews, updateNews } = useNews();
  const { user } = useAuth();
  const [form, setForm] = useState<NewsDraft>(() => createDraftFromItem(item));
  const [error, setError] = useState('');
  const isEditing = Boolean(item?.id);

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
      setError('Title is required.');
      return;
    }

    if (!form.description.trim()) {
      setError('Description is required.');
      return;
    }

    const eventDate = buildEventDate(form.eventDateInput, form.eventTimeInput);
    const payload = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      link: form.link.trim(),
      eventDate,
      hot: form.hot,
      postedBy: user?.name ?? 'Admin',
    };

    const data = isEditing ? await updateNews(item.id, payload) : await addNews(payload);

    if (data?.id || data?._id) {
      onClose();
      return;
    }

    setError(data?.message || `Failed to ${isEditing ? 'update' : 'post'} announcement`);
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
          maxWidth: 520,
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
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>{isEditing ? 'Edit Announcement' : 'Post Announcement'}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#606060', fontSize: 22, cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Type *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, type: opt.value }))}
                  style={{
                    flex: 1,
                    padding: '9px 8px',
                    borderRadius: 10,
                    border: 'none',
                    fontFamily: 'inherit',
                    background: form.type === opt.value ? 'rgba(224,60,82,0.8)' : 'rgba(255,255,255,0.04)',
                    color: form.type === opt.value ? '#fff' : '#606060',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>Title *</label>
            <input
              type="text"
              placeholder="e.g. HackIndia 2026 - Register Now!"
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
              placeholder="Details about the event..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>
              Link <span style={{ color: '#404040' }}>(optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://..."
              style={inputStyle}
              value={form.link}
              onChange={e => setForm(prev => ({ ...prev, link: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#606060', marginBottom: 6, display: 'block', fontWeight: 500 }}>
              Event Date <span style={{ color: '#404040' }}>(optional)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/YYYY"
                style={inputStyle}
                value={form.eventDateInput}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    eventDateInput: e.target.value,
                    eventDate: buildEventDate(e.target.value, prev.eventTimeInput),
                  }))
                }
                onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <input
                type="time"
                style={{ ...inputStyle, minWidth: 120 }}
                value={form.eventTimeInput}
                onChange={e =>
                  setForm(prev => ({
                    ...prev,
                    eventTimeInput: e.target.value,
                    eventDate: buildEventDate(prev.eventDateInput, e.target.value),
                  }))
                }
                onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#606060' }}>
              Type the date like `27/04/2026` so it does not auto-split into month fields.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, hot: !prev.hot }))}
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: form.hot ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.08)',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 3,
                  left: form.hot ? 23 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s',
                }}
              />
            </button>
            <span style={{ fontSize: 13, color: '#808080' }}>Mark as Hot</span>
          </div>

          <Button type="submit" variant="accent" size="lg" fullWidth>
            {isEditing ? 'Save Changes' : 'Post Announcement →'}
          </Button>
        </form>
      </div>
    </div>
  );
};

const NewsCard: React.FC<{
  item: any;
  canDelete: boolean;
  canEdit: boolean;
  canFollow: boolean;
  isFollowing: boolean;
  canSaveToCalendar: boolean;
  savedToCalendar: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFollow: () => void;
  onAddToCalendar: () => void;
}> = ({ item, canDelete, canEdit, canFollow, isFollowing, canSaveToCalendar, savedToCalendar, onEdit, onDelete, onToggleFollow, onAddToCalendar }) => {
  const [hov, setHov] = useState(false);
  const posterName = item.postedBy || 'Admin';
  const posterInitial = posterName.charAt(0).toUpperCase();
  const hasEventDate = Boolean(item.eventDate);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hov ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 16,
        padding: '22px 24px',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.25s ease',
        transform: hov ? 'translateX(4px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <Badge status={TYPE_STATUS_MAP[item.type as NewsType]}>{item.type}</Badge>
            {item.hot && (
              <span
                style={{
                  padding: '3px 9px',
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 999,
                  fontSize: 11,
                  color: '#f87171',
                  fontWeight: 700,
                }}
              >
                Hot
              </span>
            )}
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 14,
              padding: '10px 14px',
              background: 'rgba(224,60,82,0.1)',
              border: '1px solid rgba(224,60,82,0.18)',
              borderRadius: 14,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(224,60,82,0.95), rgba(184,40,64,0.95))',
                color: '#fff',
                fontWeight: 800,
                fontSize: 14,
                boxShadow: '0 10px 24px rgba(224,60,82,0.25)',
              }}
            >
              {posterInitial}
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Posted By Admin
              </div>
              <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>{posterName}</div>
            </div>
          </div>

          <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 7, letterSpacing: '-0.2px' }}>{item.title}</h3>
          <p style={{ fontSize: 14, color: '#606060', lineHeight: 1.7, marginBottom: hasEventDate || item.link ? 12 : 0 }}>{item.description}</p>
          {hasEventDate && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: item.link ? 12 : 0,
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12,
                fontSize: 12,
                color: '#fca5a5',
                fontWeight: 700,
              }}
            >
              Event Date: {item.formattedEventDate || formatEventDate(item.eventDate)}
            </div>
          )}
          {item.link && (
            <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#e03c52', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Learn more →
            </a>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: '#404040' }}>{item.date}</span>
          {canEdit && (
            <button
              onClick={onEdit}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '6px 10px',
                color: '#d1d5db',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Edit
            </button>
          )}
          {canFollow && (
            <button
              onClick={onToggleFollow}
              style={{
                background: isFollowing ? 'rgba(224,60,82,0.16)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isFollowing ? 'rgba(224,60,82,0.24)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                padding: '6px 10px',
                color: isFollowing ? '#fda4af' : '#d1d5db',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {isFollowing ? 'Following Admin' : 'Follow Admin'}
            </button>
          )}
          {canSaveToCalendar && hasEventDate && (
            <button
              onClick={onAddToCalendar}
              disabled={savedToCalendar}
              style={{
                background: savedToCalendar ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${savedToCalendar ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                padding: '6px 10px',
                color: savedToCalendar ? '#86efac' : '#d1d5db',
                fontSize: 12,
                cursor: savedToCalendar ? 'default' : 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {savedToCalendar ? 'Saved to Calendar' : 'Add to Calendar'}
            </button>
          )}
          {canSaveToCalendar && !hasEventDate && (
            <span style={{ fontSize: 11, color: '#6b7280', maxWidth: 140, textAlign: 'right' }}>
              Admin has not added an event date
            </span>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              style={{
                background: 'rgba(224,60,82,0.1)',
                border: '1px solid rgba(224,60,82,0.2)',
                borderRadius: 8,
                padding: '4px 10px',
                color: '#f87171',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(224,60,82,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(224,60,82,0.1)')}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const NewsBoard: React.FC = () => {
  const { news, deleteNews } = useNews();
  const { user, isAdmin, updateUser } = useAuth();
  const { isFollowingAdmin, toggleAdminFollow, followedAdmins } = useNotifications();
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const isStudent = user?.role === 'student';

  const categories = ['All', 'Hackathon', 'Workshop', 'Startup', 'General'];
  const filtered = filter === 'All' ? news : news.filter(item => item.type === filter.toLowerCase());
  const personalCalendar = user?.personalCalendar ?? [];

  const handleAddToCalendar = async (item: (typeof news)[number]) => {
    if (!user) return;
    if (!item.eventDate) return;

    const alreadySaved = personalCalendar.some(entry => entry.sourceType === 'news' && entry.sourceId === item.id);
    if (alreadySaved) return;

    await updateUser({
      personalCalendar: [
        ...personalCalendar,
        {
          id: `news-${item.id}`,
          title: item.title,
          description: item.description,
          eventDate: item.eventDate,
          createdAt: new Date().toISOString(),
          sourceType: 'news',
          sourceId: item.id,
          sourceLabel: item.type,
          link: item.link,
        },
      ],
    });
  };

  return (
    <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
      {showAdd && <NewsModal onClose={() => setShowAdd(false)} />}
      {editingItem && <NewsModal item={editingItem} onClose={() => setEditingItem(null)} />}

      <div className="container" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>News Board</h1>
            <p style={{ color: '#606060', fontSize: 14 }}>Campus events, hackathons, and announcements</p>
            <p style={{ color: '#8b8b8b', fontSize: 12, marginTop: 8 }}>New admin posts appear here automatically every few seconds.</p>
          </div>

          {isAdmin && (
            <Button variant="accent" size="md" onClick={() => setShowAdd(true)}>
              + Post Announcement
            </Button>
          )}

          {!isAdmin && user && (
            <span
              style={{
                fontSize: 12,
                color: '#404040',
                alignSelf: 'center',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '8px 14px',
                borderRadius: 10,
              }}
            >
              Only admins can post
            </span>
          )}
        </div>

        {isAdmin && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
              padding: '14px 16px',
              borderRadius: 16,
              background: 'rgba(224,60,82,0.08)',
              border: '1px solid rgba(224,60,82,0.18)',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Admin Posting Panel</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Use this to publish and update announcements on the board.</div>
            </div>
            <Button variant="accent" size="md" onClick={() => setShowAdd(true)}>
              Create Post
            </Button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 36, flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setFilter(category)}
              style={{
                padding: '7px 18px',
                background: filter === category ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                color: filter === category ? '#fff' : '#606060',
                border: `1px solid ${filter === category ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
                boxShadow: filter === category ? '0 0 16px rgba(224,60,82,0.3)' : 'none',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {isStudent && (
          <div
            style={{
              marginBottom: 24,
              padding: '14px 16px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Admin Update Notifications</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>
              Follow specific admins to get a notification when they publish a new post.
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#fca5a5' }}>
              {followedAdmins.length > 0 ? `Following: ${followedAdmins.join(', ')}` : 'You are not following any admins yet.'}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No announcements yet</h3>
            <p style={{ color: '#505050', fontSize: 14 }}>
              {isAdmin ? 'Post the first announcement for your campus!' : 'Check back soon for updates from your admin.'}
            </p>
            {isAdmin && (
              <div style={{ marginTop: 20 }}>
                <Button variant="accent" size="md" onClick={() => setShowAdd(true)}>
                  Create First Post
                </Button>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => (
            <NewsCard
              key={item.id}
              item={item}
              canDelete={isAdmin}
              canEdit={isAdmin}
              canFollow={isStudent}
              isFollowing={isFollowingAdmin(item.postedBy || '')}
              canSaveToCalendar={Boolean(user)}
              savedToCalendar={personalCalendar.some(entry => entry.sourceType === 'news' && entry.sourceId === item.id)}
              onEdit={() => setEditingItem(item)}
              onDelete={() => {
                void deleteNews(item.id);
              }}
              onToggleFollow={() => toggleAdminFollow(item.postedBy || '')}
              onAddToCalendar={() => {
                void handleAddToCalendar(item);
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
};

export default NewsBoard;
