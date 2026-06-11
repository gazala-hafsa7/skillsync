import React, { useMemo, useState } from 'react';
import { Button } from '../ui/button';
import type { ProjectCalendarItem } from '../../types/calendar';

interface ProjectCalendarPanelProps {
  items: ProjectCalendarItem[];
  onAddItem: (item: { title: string; description: string; eventDate: string }) => Promise<any>;
}

const formatEventDate = (value: string) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const buildEventDate = (dateValue: string, timeValue: string) => {
  const match = dateValue.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
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

  const paddedMonth = String(month).padStart(2, '0');
  const paddedDay = String(day).padStart(2, '0');

  return `${yearPart}-${paddedMonth}-${paddedDay}T${timeValue || '00:00'}`;
};

export const ProjectCalendarPanel: React.FC<ProjectCalendarPanelProps> = ({ items, onAddItem }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventDateInput: '',
    eventTimeInput: '09:00',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const sortedItems = useMemo(
    () =>
      [...items].sort((left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime()),
    [items]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventDate = buildEventDate(form.eventDateInput, form.eventTimeInput);

    if (!form.title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (!eventDate) {
      setError('Enter a valid date as DD/MM/YYYY and choose a time.');
      return;
    }

    setSaving(true);
    const response = await onAddItem({
      title: form.title.trim(),
      description: form.description.trim(),
      eventDate,
    });
    setSaving(false);

    if (Array.isArray(response)) {
      setForm({ title: '', description: '', eventDate: '', eventDateInput: '', eventTimeInput: '09:00' });
      setError('');
      return;
    }

    setError(response?.message || 'Failed to add project task.');
  };

  return (
    <section
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        padding: 24,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px' }}>Project Task Calendar</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
          Shared project deadlines and milestones. These also show up in your combined calendar on your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 10, marginBottom: 18 }}>
        <input
          type="text"
          value={form.title}
          placeholder="Task title"
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
          type="text"
          inputMode="numeric"
          value={form.eventDateInput}
          placeholder="DD/MM/YYYY"
          onChange={e => setForm(prev => ({ ...prev, eventDateInput: e.target.value, eventDate: buildEventDate(e.target.value, prev.eventTimeInput) }))}
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
          type="time"
          value={form.eventTimeInput}
          onChange={e => setForm(prev => ({ ...prev, eventTimeInput: e.target.value, eventDate: buildEventDate(prev.eventDateInput, e.target.value) }))}
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
          placeholder="Description or notes"
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
        <div style={{ gridColumn: '1 / -1', fontSize: 12, color: '#6b7280', marginTop: -2 }}>
          Enter the date as `27/04/2026` so typing stays in one field instead of jumping between day and month.
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {error ? <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div> : <div style={{ fontSize: 12, color: '#6b7280' }}>Any project member can add a task.</div>}
          <Button type="submit" variant="accent" size="md">
            {saving ? 'Saving...' : 'Add Task'}
          </Button>
        </div>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sortedItems.length === 0 && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>No project calendar items yet.</p>}
        {sortedItems.map(item => (
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
                <div style={{ fontSize: 15, color: '#fff', fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                {item.description && <p style={{ margin: '0 0 8px', fontSize: 13, color: '#9ca3af', lineHeight: 1.55 }}>{item.description}</p>}
                <div style={{ fontSize: 12, color: '#6b7280' }}>Added by {item.createdByName}</div>
              </div>
              <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatEventDate(item.eventDate)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
