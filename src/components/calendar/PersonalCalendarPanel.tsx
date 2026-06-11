import React, { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import type { PersonalCalendarItem } from '../../types/calendar';

interface PersonalCalendarPanelProps {
  items: PersonalCalendarItem[];
  isOwnProfile: boolean;
  onAddCustomItem?: (item: { title: string; description: string; eventDate: string }) => Promise<void>;
  onRemoveItem?: (item: PersonalCalendarItem) => Promise<void>;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const sourceToneMap: Record<PersonalCalendarItem['sourceType'], { label: string; color: string; border: string }> = {
  custom: { label: 'Personal', color: '#e5e7eb', border: 'rgba(255,255,255,0.1)' },
  news: { label: 'News Board', color: '#fca5a5', border: 'rgba(224,60,82,0.2)' },
  project: { label: 'Project', color: '#93c5fd', border: 'rgba(59,130,246,0.2)' },
};

export const PersonalCalendarPanel: React.FC<PersonalCalendarPanelProps> = ({ items, isOwnProfile, onAddCustomItem, onRemoveItem }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
  });

  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime()),
    [items]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddCustomItem) return;
    if (!form.title.trim() || !form.eventDate) return;

    await onAddCustomItem({
      title: form.title.trim(),
      description: form.description.trim(),
      eventDate: form.eventDate,
    });

    setForm({
      title: '',
      description: '',
      eventDate: '',
    });
  };

  return (
    <section
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: 28,
        marginBottom: 16,
        backdropFilter: 'blur(20px)',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Common Calendar</h3>
      <p style={{ color: '#505050', fontSize: 13, marginBottom: 18 }}>
        {isOwnProfile
          ? 'Your combined calendar includes project tasks, saved news posts, and personal events.'
          : 'Combined calendar view is only available on your own profile.'}
      </p>

      {isOwnProfile && onAddCustomItem && (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 10, marginBottom: 18 }}>
          <input
            type="text"
            value={form.title}
            placeholder="Add personal event"
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            style={{
              width: '100%',
              padding: '11px 14px',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: '#f0f0f0',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <input
            type="datetime-local"
            value={form.eventDate}
            onChange={e => setForm(prev => ({ ...prev, eventDate: e.target.value }))}
            style={{
              width: '100%',
              padding: '11px 14px',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: '#f0f0f0',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <textarea
            rows={2}
            value={form.description}
            placeholder="Optional note"
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            style={{
              gridColumn: '1 / -1',
              width: '100%',
              resize: 'vertical',
              padding: '11px 14px',
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              color: '#f0f0f0',
              fontSize: 14,
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="glass">
              Add Personal Event
            </Button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sortedItems.length === 0 && (
          <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
            {isOwnProfile ? 'No calendar items yet.' : 'No visible calendar items.'}
          </p>
        )}

        {sortedItems.map(item => {
          const tone = sourceToneMap[item.sourceType];
          const canDelete = isOwnProfile && item.sourceType !== 'project' && Boolean(onRemoveItem);

          return (
            <div
              key={item.id}
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>{item.title}</div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 999,
                        border: `1px solid ${tone.border}`,
                        color: tone.color,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {tone.label}
                    </span>
                  </div>
                  {item.description && <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9ca3af', lineHeight: 1.55 }}>{item.description}</p>}
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {item.sourceType === 'project' && item.projectTitle ? `From ${item.projectTitle}` : item.sourceLabel || 'Saved item'}
                  </div>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: '#e03c52' }}>
                      Open Link
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatDate(item.eventDate)}</div>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        void onRemoveItem?.(item);
                      }}
                      style={{
                        background: 'rgba(224,60,82,0.1)',
                        border: '1px solid rgba(224,60,82,0.2)',
                        borderRadius: 8,
                        padding: '4px 10px',
                        color: '#f87171',
                        fontSize: 12,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
