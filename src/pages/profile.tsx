import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useProjects } from '../context/ProjectContext';
import { TECH_STACK_OPTIONS } from '../constants/skills';
import { api } from '../api/api';
import { PersonalCalendarPanel } from '../components/calendar/PersonalCalendarPanel';
import type { PersonalCalendarItem } from '../types/calendar';

interface ProfilePageProps {
  userId?: string | null;
}

interface ProfileState {
  _id?: string;
  name: string;
  email?: string;
  dept: string;
  year: string;
  isMentor: boolean;
  skills: string[];
  achievements: string[];
  personalCalendar: PersonalCalendarItem[];
}

const computeBadges = (profile: ProfileState, role?: string) => {
  const badges: { title: string; tone: string; desc: string; icon: string }[] = [];

  if ((profile.skills?.length || 0) >= 3) badges.push({ title: 'Skill Starter', tone: '#f97316', desc: 'Built a solid base skill stack.', icon: '🌱' });
  if ((profile.skills?.length || 0) >= 6) badges.push({ title: 'Stack Builder', tone: '#ef4444', desc: 'Comfortable across multiple tools.', icon: '🧱' });
  if ((profile.skills?.length || 0) >= 9) badges.push({ title: 'Tech Multiclass', tone: '#eab308', desc: 'Wide-ranging technical versatility.', icon: '🛠️' });
  if ((profile.achievements?.length || 0) >= 1) badges.push({ title: 'Showcase Ready', tone: '#38bdf8', desc: 'Has visible achievements on profile.', icon: '✨' });
  if ((profile.achievements?.length || 0) >= 3) badges.push({ title: 'Campus Grinder', tone: '#22c55e', desc: 'Consistent wins and progress logged.', icon: '🏆' });
  if (profile.year.toLowerCase().includes('4')) badges.push({ title: 'Senior Edge', tone: '#a78bfa', desc: 'Final-year experience unlocked.', icon: '🎓' });
  if ((role || '').toLowerCase() === 'admin') badges.push({ title: 'Community Admin', tone: '#f43f5e', desc: 'Trusted to manage the community.', icon: '🛡️' });

  if (profile.isMentor) badges.push({ title: 'Mentor Mode', tone: '#38bdf8', desc: 'Open to guiding projects that need a mentor.', icon: 'M' });
  return badges.slice(0, 6);
};

const Profile: React.FC<ProfilePageProps> = ({ userId }) => {
  const { user, updateUser } = useAuth();
  const { projects } = useProjects();
  const { followedAdmins, toggleAdminFollow } = useNotifications();
  const isOwnProfile = !userId || userId === user?._id;
  const isStudent = user?.role === 'student';
  const [profile, setProfile] = useState<ProfileState>({
    _id: user?._id,
    name: user?.name ?? '',
    email: user?.email ?? '',
    dept: user?.dept ?? '',
    year: user?.year ?? '',
    isMentor: Boolean(user?.isMentor),
    skills: user?.skills ?? [],
    achievements: user?.achievements ?? [],
    personalCalendar: user?.personalCalendar ?? [],
  });
  const [achievementDraft, setAchievementDraft] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!isOwnProfile);
  const [error, setError] = useState('');
  const commonCalendarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOwnProfile) {
      setProfile({
        _id: user?._id,
        name: user?.name ?? '',
        email: user?.email ?? '',
        dept: user?.dept ?? '',
        year: user?.year ?? '',
        isMentor: Boolean(user?.isMentor),
        skills: user?.skills ?? [],
        achievements: user?.achievements ?? [],
        personalCalendar: user?.personalCalendar ?? [],
      });
      setLoading(false);
      return;
    }

    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      const data = await api.getUserProfile(userId!);

      if (!active) return;

      if (data?._id) {
        setProfile({
          _id: data._id,
          name: data.name ?? '',
          email: data.email ?? '',
          dept: data.dept ?? '',
          year: data.year ?? '',
          isMentor: Boolean(data.isMentor),
          skills: Array.isArray(data.skills) ? data.skills : [],
          achievements: Array.isArray(data.achievements) ? data.achievements : [],
          personalCalendar: Array.isArray(data.personalCalendar) ? data.personalCalendar : [],
        });
        setError('');
      } else {
        setError(data.message || 'Failed to load profile');
      }

      setLoading(false);
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [isOwnProfile, user, userId]);

  useEffect(() => {
    if (!isOwnProfile || loading) return;

    const focusSection = sessionStorage.getItem('skillsync-focus-section');
    if (focusSection !== 'common-calendar') return;

    sessionStorage.removeItem('skillsync-focus-section');
    commonCalendarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [isOwnProfile, loading]);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 12,
    color: '#f0f0f0',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s',
    backdropFilter: 'blur(8px)',
  };

  const xp = profile.skills.length * 18 + profile.achievements.length * 30 + (profile.dept ? 10 : 0) + (profile.year ? 10 : 0);
  const level = Math.max(1, Math.floor(xp / 60) + 1);
  const nextLevelProgress = xp % 60;
  const profileRole = isOwnProfile ? user?.role : undefined;
  const showGamification = profileRole !== 'admin';
  const badges = computeBadges(profile, isOwnProfile ? user?.role : undefined);
  const mentorProjects = projects.filter(project =>
    (project.mentorRequests || []).some(request => request.mentorId === profile._id && request.accepted)
  );
  const accessibleProjectCalendar = isOwnProfile
    ? projects
        .filter(project => {
          if (project.teamLeadId === user?._id) return true;
          return (project.members || []).some(member => member.userId === user?._id);
        })
        .flatMap(project =>
          (project.calendarItems || []).map(item => ({
            id: `project-${project.id}-${item.id}`,
            title: item.title,
            description: item.description,
            eventDate: item.eventDate,
            createdAt: item.createdAt,
            sourceType: 'project' as const,
            sourceId: item.id,
            sourceLabel: 'Project task',
            projectId: project.id,
            projectTitle: project.title,
          }))
        )
    : [];
  const combinedCalendarItems = [...accessibleProjectCalendar, ...(profile.personalCalendar || [])].sort(
    (left, right) => new Date(left.eventDate).getTime() - new Date(right.eventDate).getTime()
  );

  const handleSave = async () => {
    await updateUser({
      name: profile.name.trim(),
      dept: profile.dept.trim(),
      year: profile.year.trim(),
      isMentor: profile.isMentor,
      skills: profile.skills,
      achievements: profile.achievements,
      personalCalendar: profile.personalCalendar,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addAchievement = () => {
    const next = achievementDraft.trim();
    if (!next) return;

    setProfile(prev => ({
      ...prev,
      achievements: [...prev.achievements, next],
    }));
    setAchievementDraft('');
  };

  const removeAchievement = (index: number) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, idx) => idx !== index),
    }));
  };

  const addPersonalCalendarItem = async (item: { title: string; description: string; eventDate: string }) => {
    const nextCalendar = [
      ...(profile.personalCalendar || []),
      {
        id: `personal-${Date.now()}`,
        title: item.title,
        description: item.description,
        eventDate: item.eventDate,
        createdAt: new Date().toISOString(),
        sourceType: 'custom' as const,
        sourceLabel: 'Personal event',
      },
    ];

    setProfile(prev => ({
      ...prev,
      personalCalendar: nextCalendar,
    }));

    await updateUser({
      personalCalendar: nextCalendar,
    });
  };

  const removePersonalCalendarItem = async (itemToRemove: PersonalCalendarItem) => {
    const nextCalendar = (profile.personalCalendar || []).filter(item => item.id !== itemToRemove.id);

    setProfile(prev => ({
      ...prev,
      personalCalendar: nextCalendar,
    }));

    await updateUser({
      personalCalendar: nextCalendar,
    });
  };

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
        <div className="container" style={{ padding: 0, maxWidth: 900 }}>
          <p style={{ color: '#606060' }}>Loading profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '60px 40px' }}>
      <div className="container" style={{ padding: 0, maxWidth: 900 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.5px' }}>
          {isOwnProfile ? 'My Profile' : `${profile.name || 'Teammate'} Profile`}
        </h1>
        <p style={{ color: '#606060', marginBottom: 44, fontSize: 14 }}>
          {isOwnProfile
            ? showGamification
              ? 'Level up your profile with skills, achievements, and badges.'
              : 'Manage your profile details, badges, and community presence.'
            : 'See this teammate’s profile, badges, and recent wins.'}
        </p>

        {error && (
          <div style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <div
          style={{
            background: 'linear-gradient(145deg, rgba(48,10,10,0.9), rgba(18,18,18,0.95))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: 30,
            marginBottom: 18,
            backdropFilter: 'blur(24px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#e03c52,#ff8c69)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                boxShadow: '0 0 26px rgba(224,60,82,0.4)',
                flexShrink: 0,
              }}
            >
              {(profile.name || 'U')
                .split(' ')
                .filter(Boolean)
                .map(part => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div style={{ minWidth: 220, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>{profile.name || 'Unnamed user'}</h2>
                {showGamification && <Badge status="done">Level {level}</Badge>}
              </div>
              <p style={{ color: '#9ca3af', fontSize: 14, margin: '0 0 8px' }}>
                {[profile.dept, profile.year].filter(Boolean).join(' · ') || 'Department and year not added'}
              </p>
              {profile.email && <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>{profile.email}</p>}
            </div>

            <div style={{ minWidth: 220 }}>
              {showGamification && (
                <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#fca5a5', marginBottom: 6 }}>
                <span>⚡ XP Progress</span>
                <span>{nextLevelProgress}/60</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ width: `${(nextLevelProgress / 60) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#e03c52,#ff8c69)' }} />
              </div>
                </>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: '#d1d5db', background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: 999 }}>
                  🧠 {profile.skills.length} skills
                </span>
                <span style={{ fontSize: 12, color: '#d1d5db', background: 'rgba(255,255,255,0.05)', padding: '5px 10px', borderRadius: 999 }}>
                  🏅 {profile.achievements.length} achievements
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, marginBottom: 16 }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              padding: 28,
              backdropFilter: 'blur(20px)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Core Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {([
                ['name', 'Full Name', 'Your full name'],
                ['dept', 'Department', 'e.g. CSE, ECE'],
                ['year', 'Year', 'e.g. 3rd Year'],
              ] as const).map(([key, label, placeholder]) => (
                <div key={key} style={key === 'name' ? { gridColumn: '1 / -1' } : {}}>
                  <label style={{ fontSize: 12, color: '#505050', marginBottom: 5, display: 'block', fontWeight: 500 }}>{label}</label>
                  {isOwnProfile ? (
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={profile[key]}
                      onChange={e => setProfile(prev => ({ ...prev, [key]: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.35)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
                    />
                  ) : (
                    <div style={{ ...inputStyle, color: '#d1d5db' }}>{profile[key] || 'Not added'}</div>
                  )}
                </div>
              ))}
            </div>
            {isOwnProfile && (
              <div
                style={{
                  marginTop: 16,
                  padding: '14px 16px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f3f4f6', marginBottom: 4 }}>Available as Mentor</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Turn this on if you want mentor-requested projects to show up on your profile.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, isMentor: !prev.isMentor }))}
                    style={{
                      width: 48,
                      height: 26,
                      borderRadius: 999,
                      border: 'none',
                      cursor: 'pointer',
                      background: profile.isMentor ? 'linear-gradient(135deg,#e03c52,#b82840)' : 'rgba(255,255,255,0.08)',
                      position: 'relative',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 3,
                        left: profile.isMentor ? 25 : 3,
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
            )}
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              padding: 28,
              backdropFilter: 'blur(20px)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Badge Cabinet ✨</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {badges.length === 0 && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Add more skills and achievements to unlock badges.</p>}
              {badges.map(badge => (
                <div key={badge.title} style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: badge.tone, boxShadow: `0 0 12px ${badge.tone}` }} />
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f3f4f6' }}>{badge.icon} {badge.title}</div>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isOwnProfile && isStudent && (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              padding: 28,
              marginBottom: 16,
              backdropFilter: 'blur(20px)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Followed Admins</h3>
            <p style={{ color: '#505050', fontSize: 13, marginBottom: 18 }}>
              News posts from followed admins show up in your notification bell.
            </p>

            {followedAdmins.length === 0 && (
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                You are not following any admins yet. Use the News Board to follow them.
              </p>
            )}

            {followedAdmins.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {followedAdmins.map(adminName => (
                  <button
                    key={adminName}
                    type="button"
                    onClick={() => toggleAdminFollow(adminName)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 999,
                      border: '1px solid rgba(224,60,82,0.24)',
                      background: 'rgba(224,60,82,0.1)',
                      color: '#fda4af',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13,
                    }}
                  >
                    {adminName} x
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isOwnProfile && (
          <section ref={commonCalendarRef}>
            <PersonalCalendarPanel
              items={combinedCalendarItems}
              isOwnProfile
              onAddCustomItem={addPersonalCalendarItem}
              onRemoveItem={removePersonalCalendarItem}
            />
          </section>
        )}

        {profile.isMentor && (
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20,
              padding: 28,
              marginBottom: 16,
              backdropFilter: 'blur(20px)',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Mentor Projects</h3>
            <p style={{ color: '#505050', fontSize: 13, marginBottom: 18 }}>
              Projects where this mentor has been accepted appear here.
            </p>

            {mentorProjects.length === 0 && <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>No mentored projects yet.</p>}

            {mentorProjects.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {mentorProjects.map(project => (
                  <div
                    key={project.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 15, color: '#fff', fontWeight: 700 }}>{project.title}</div>
                      <span style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(224,60,82,0.12)', border: '1px solid rgba(224,60,82,0.22)', fontSize: 11, color: '#fca5a5', fontWeight: 700 }}>
                        Mentor Needed
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Lead: {project.teamLead}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>{project.domain}</div>
                    <p style={{ margin: 0, fontSize: 13, color: '#9ca3af', lineHeight: 1.55 }}>{project.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: 28,
            marginBottom: 16,
            backdropFilter: 'blur(20px)',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Tech Stack 🧠</h3>
          <p style={{ color: '#505050', fontSize: 13, marginBottom: 18 }}>
            {isOwnProfile ? `Pick from the same options used in project requirements. ${profile.skills.length} selected.` : `${profile.skills.length} skills listed.`}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
            {TECH_STACK_OPTIONS.map(skill => {
              const active = profile.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  disabled={!isOwnProfile}
                  onClick={() =>
                    isOwnProfile &&
                    setProfile(prev => ({
                      ...prev,
                      skills: active ? prev.skills.filter(item => item !== skill) : [...prev.skills, skill],
                    }))
                  }
                  style={{
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 500,
                    background: active ? 'rgba(224,60,82,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${active ? 'rgba(224,60,82,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 999,
                    color: active ? '#f87171' : '#606060',
                    cursor: isOwnProfile ? 'pointer' : 'default',
                    fontFamily: 'inherit',
                    transition: 'all 0.18s',
                    opacity: isOwnProfile ? 1 : active ? 1 : 0.85,
                  }}
                >
                  {active ? '✓ ' : ''}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: 28,
            marginBottom: 20,
            backdropFilter: 'blur(20px)',
          }}
        >
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Achievements 🏆</h3>
          <p style={{ color: '#505050', fontSize: 13, marginBottom: 18 }}>
            {isOwnProfile ? 'Add hackathons, project wins, certifications, or standout milestones.' : 'A quick highlight reel of this teammate’s wins.'}
          </p>

          {isOwnProfile && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={achievementDraft}
                onChange={e => setAchievementDraft(e.target.value)}
                placeholder="e.g. Finalist at Smart India Hackathon"
                style={{ ...inputStyle, flex: 1, minWidth: 260 }}
              />
              <Button type="button" variant="glass" onClick={addAchievement}>
                Add Achievement
              </Button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {profile.achievements.length === 0 && (
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                {isOwnProfile ? 'No achievements added yet.' : 'No achievements listed yet.'}
              </p>
            )}
            {profile.achievements.map((achievement, index) => (
              <div
                key={`${achievement}-${index}`}
                style={{
                  padding: '14px 16px',
                  borderRadius: 16,
                  background: 'linear-gradient(145deg, rgba(224,60,82,0.08), rgba(255,255,255,0.03))',
                  border: '1px solid rgba(224,60,82,0.14)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 700, marginBottom: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      🌟 Achievement
                    </div>
                    <div style={{ fontSize: 13, color: '#f3f4f6', lineHeight: 1.55 }}>{achievement}</div>
                  </div>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => removeAchievement(index)}
                      style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isOwnProfile && (
          <Button size="lg" variant="accent" onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Profile →'}
          </Button>
        )}
      </div>
    </main>
  );
};

export default Profile;
