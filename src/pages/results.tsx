import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useResults } from '../context/ResultContext';
import { api } from '../api/api';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

type StudentOption = {
  _id: string;
  name: string;
  email?: string;
  role?: string;
};

type ResultDraft = {
  title: string;
  description: string;
  category: string;
  resultDate: string;
  studentSearch: string;
  taggedStudents: { userId: string; name: string; email?: string }[];
};

const RESULT_TYPES = ['Exam', 'Hackathon', 'Interview', 'Shortlist', 'Placement', 'General'];

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

const createEmptyDraft = (): ResultDraft => ({
  title: '',
  description: '',
  category: 'General',
  resultDate: '',
  studentSearch: '',
  taggedStudents: [],
});

const AddResultModal: React.FC<{
  students: StudentOption[];
  onClose: () => void;
}> = ({ students, onClose }) => {
  const { user } = useAuth();
  const { addResult } = useResults();
  const [form, setForm] = useState<ResultDraft>(createEmptyDraft());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    const selectedIds = new Set(form.taggedStudents.map(student => student.userId));
    const query = form.studentSearch.trim().toLowerCase();

    return students.filter(student => {
      if (selectedIds.has(student._id)) return false;
      if (!query) return true;

      return student.name.toLowerCase().includes(query) || (student.email || '').toLowerCase().includes(query);
    });
  }, [form.studentSearch, form.taggedStudents, students]);

  const showStudentMatches = form.studentSearch.trim().length > 0;

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Result title is required.');
      return;
    }

    setSaving(true);
    const response = await addResult({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      resultDate: form.resultDate,
      postedBy: user?.name ?? 'Admin',
      taggedStudents: form.taggedStudents,
      createdAt: new Date().toISOString(),
    });
    setSaving(false);

    if (response?._id || response?.id) {
      onClose();
      return;
    }

    setError(response?.message || 'Failed to add result.');
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
          maxWidth: 720,
          background: 'linear-gradient(145deg, rgba(20,10,10,0.95), rgba(12,12,12,0.98))',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          padding: '36px 32px',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>Add Result</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#606060', fontSize: 22, cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 12 }}>
          <input
            type="text"
            value={form.title}
            placeholder="Result title"
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            style={inputStyle}
          />
          <input
            type="date"
            value={form.resultDate}
            onChange={e => setForm(prev => ({ ...prev, resultDate: e.target.value }))}
            style={inputStyle}
          />
          <select
            value={form.category}
            onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
            style={inputStyle}
          >
            {RESULT_TYPES.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={form.studentSearch}
              placeholder="Search students to tag"
              onChange={e => setForm(prev => ({ ...prev, studentSearch: e.target.value }))}
              style={inputStyle}
            />
            {showStudentMatches && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  zIndex: 5,
                  maxHeight: 220,
                  overflowY: 'auto',
                  background: 'rgba(10,10,10,0.96)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 14,
                  boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
                  padding: 6,
                }}
              >
                {filteredStudents.length === 0 && (
                  <div style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>No matching students found.</div>
                )}
                {filteredStudents.slice(0, 8).map(student => (
                  <button
                    key={student._id}
                    type="button"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        taggedStudents: [...prev.taggedStudents, { userId: student._id, name: student.name, email: student.email || '' }],
                        studentSearch: '',
                      }))
                    }
                    style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 2,
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: 'none',
                      background: 'transparent',
                      color: '#f0f0f0',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{student.name}</span>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{student.email || 'No email'}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <textarea
            rows={3}
            value={form.description}
            placeholder="Description, ranks, scores, or summary"
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            style={{ ...inputStyle, gridColumn: '1 / -1', resize: 'vertical' }}
          />

          <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {form.taggedStudents.length === 0 && <span style={{ fontSize: 12, color: '#6b7280' }}>No students tagged yet.</span>}
            {form.taggedStudents.map(student => (
              <button
                key={student.userId}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, taggedStudents: prev.taggedStudents.filter(item => item.userId !== student.userId) }))}
                style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid rgba(224,60,82,0.25)', background: 'rgba(224,60,82,0.12)', color: '#fca5a5', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {student.name} ×
              </button>
            ))}
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Tagged students are highlighted when they view this page.</div>
            <Button type="submit" variant="accent" size="md">
              {saving ? 'Saving...' : 'Add Result'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { results, deleteResult } = useResults();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [showOnlyTagged, setShowOnlyTagged] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    let active = true;

    const loadStudents = async () => {
      const data = await api.listUsers('student');

      if (active && Array.isArray(data) && data.length > 0) {
        setStudents(data);
        return;
      }

      const fallbackData = await api.listUsers();

      if (active && Array.isArray(fallbackData)) {
        setStudents(fallbackData.filter(student => (student.role || 'student') !== 'admin'));
      }
    };

    loadStudents();

    return () => {
      active = false;
    };
  }, [isAdmin]);

  const visibleResults = useMemo(() => {
    const base = [...results].sort((left, right) => {
      const leftTime = new Date(left.resultDate || left.createdAt || 0).getTime();
      const rightTime = new Date(right.resultDate || right.createdAt || 0).getTime();
      return rightTime - leftTime;
    });

    if (!showOnlyTagged || !user?._id) {
      return base;
    }

    return base.filter(item => item.taggedStudents.some(student => student.userId === user._id));
  }, [results, showOnlyTagged, user?._id]);

  return (
    <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
      {showAdd && <AddResultModal students={students} onClose={() => setShowAdd(false)} />}

      <div className="container" style={{ padding: 0, maxWidth: 1100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>Results</h1>
            <p style={{ color: '#606060', fontSize: 14, margin: 0 }}>
              {isAdmin ? 'Publish outcomes, shortlist updates, and tagged student results.' : 'See public results and the updates where you were tagged.'}
            </p>
          </div>

          {isAdmin && (
            <Button variant="accent" size="md" onClick={() => setShowAdd(true)}>
              + Add Result
            </Button>
          )}

          {!isAdmin && (
            <button
              type="button"
              onClick={() => setShowOnlyTagged(prev => !prev)}
              style={{
                padding: '8px 14px',
                background: showOnlyTagged ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.04)',
                color: showOnlyTagged ? '#fff' : '#d1d5db',
                border: `1px solid ${showOnlyTagged ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 999,
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {showOnlyTagged ? 'Showing Tagged Only' : 'Show My Tagged Results'}
            </button>
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
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Admin Results Panel</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Add result announcements and tag students from a modal, just like the News Board flow.</div>
            </div>
            <Button variant="accent" size="md" onClick={() => setShowAdd(true)}>
              Create Result
            </Button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleResults.length === 0 && (
            <div style={{ padding: '26px 22px', borderRadius: 18, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#6b7280', fontSize: 14 }}>
              {isAdmin ? 'No results posted yet.' : showOnlyTagged ? 'No tagged results found for your profile yet.' : 'No results posted yet.'}
            </div>
          )}

          {visibleResults.map(item => {
            const isTagged = Boolean(user?._id && item.taggedStudents.some(student => student.userId === user._id));

            return (
              <article
                key={item.id}
                style={{
                  padding: '20px 22px',
                  borderRadius: 18,
                  background: isTagged ? 'rgba(224,60,82,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isTagged ? 'rgba(224,60,82,0.22)' : 'rgba(255,255,255,0.06)'}`,
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <Badge status="in-progress">{item.category}</Badge>
                      {isTagged && <Badge status="done">Tagged You</Badge>}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px', color: '#fff' }}>{item.title}</h3>
                    {item.description && <p style={{ margin: '0 0 12px', fontSize: 14, color: '#9ca3af', lineHeight: 1.6 }}>{item.description}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {item.taggedStudents.length === 0 && <span style={{ fontSize: 12, color: '#6b7280' }}>No student tags on this result.</span>}
                      {item.taggedStudents.map(student => (
                        <span key={`${item.id}-${student.userId}`} style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12, color: '#d1d5db' }}>
                          {student.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end', minWidth: 140 }}>
                    {(item.formattedResultDate || formatDate(item.resultDate)) && (
                      <div style={{ fontSize: 12, color: '#fca5a5', fontWeight: 700 }}>{item.formattedResultDate || formatDate(item.resultDate)}</div>
                    )}
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Posted by {item.postedBy || 'Admin'}</div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          void deleteResult(item.id);
                        }}
                        style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.2)', borderRadius: 8, padding: '5px 10px', color: '#f87171', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default ResultsPage;
