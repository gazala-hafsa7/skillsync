import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ProjectsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const NewsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" />
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
  </svg>
);

const ResultsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 6h13" />
    <path d="M8 12h13" />
    <path d="M8 18h13" />
    <path d="M3 6h.01" />
    <path d="M3 12h.01" />
    <path d="M3 18h.01" />
  </svg>
);

const BellIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
    <path d="M9 17a3 3 0 0 0 6 0" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 2v4M16 2v4" />
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

interface NavbarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage = 'home', onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead, markAsRead, removeNotification } = useNotifications();
  const isStudent = user?.role === 'student';

  const openCommonCalendar = () => {
    sessionStorage.setItem('skillsync-focus-section', 'common-calendar');
    onNavigate?.('profile');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = () => setShowNotifications(false);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const openNotification = (notification: { id: string; link?: string }) => {
    markAsRead(notification.id);
    setShowNotifications(false);

    if (!notification.link) return;

    if (notification.link.startsWith('project-chat/')) {
      window.location.hash = `#${notification.link}`;
      return;
    }

    onNavigate?.(notification.link);
  };

  const links = [
    { id: 'home', label: 'Home', Icon: HomeIcon },
    { id: 'projects', label: 'Projects', Icon: ProjectsIcon },
    { id: 'newsboard', label: 'News Board', Icon: NewsIcon },
    { id: 'results', label: 'Results', Icon: ResultsIcon },
  ];

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: '0 40px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(8,8,8,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        <div onClick={() => onNavigate?.('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32 }}>
            <svg viewBox="0 0 100 100" width="32" height="32">
              <circle cx="50" cy="50" r="46" fill="none" stroke="url(#lg)" strokeWidth="6" />
              <path
                d="M58,22 C58,22 35,28 35,45 C35,58 58,55 58,68 C58,82 35,85 35,85"
                fill="none"
                stroke="url(#lg)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff7088" />
                  <stop offset="100%" stopColor="#e03c52" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700 }}>SkillSync</span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {links.map(({ id, label, Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate?.(id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 16px',
                  background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: active ? '#fff' : '#aaa',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                <Icon /> {label}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user ? (
            <>
              {isStudent && (
                <div style={{ position: 'relative' }} onClick={event => event.stopPropagation()}>
                  <button
                    onClick={() => setShowNotifications(prev => !prev)}
                    style={{
                      position: 'relative',
                      width: 40,
                      height: 40,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <BellIcon />
                    {unreadCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: -4,
                          right: -4,
                          minWidth: 18,
                          height: 18,
                          padding: '0 5px',
                          borderRadius: 999,
                          background: '#e03c52',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 700,
                          display: 'grid',
                          placeItems: 'center',
                          border: '2px solid rgba(8,8,8,0.95)',
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 48,
                        right: 0,
                        width: 360,
                        maxHeight: 420,
                        overflowY: 'auto',
                        background: 'linear-gradient(145deg, rgba(20,10,10,0.97), rgba(12,12,12,0.99))',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 18,
                        boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                        padding: 14,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Notifications</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                          </div>
                        </div>
                        {notifications.length > 0 && (
                          <button
                            onClick={markAllAsRead}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f87171',
                              fontSize: 12,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {notifications.length === 0 && (
                        <div style={{ padding: '20px 8px', color: '#6b7280', fontSize: 13 }}>
                          Follow admins and join projects to start getting updates here.
                        </div>
                      )}

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {notifications.map(notification => (
                          <div
                            key={notification.id}
                            style={{
                              padding: '12px 12px 10px',
                              borderRadius: 14,
                              background: notification.read ? 'rgba(255,255,255,0.03)' : 'rgba(224,60,82,0.09)',
                              border: `1px solid ${notification.read ? 'rgba(255,255,255,0.06)' : 'rgba(224,60,82,0.18)'}`,
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                              <button
                                onClick={() => openNotification(notification)}
                                style={{
                                  flex: 1,
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  textAlign: 'left',
                                  color: 'inherit',
                                  cursor: notification.link ? 'pointer' : 'default',
                                }}
                              >
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#f3f4f6', marginBottom: 4 }}>
                                  {notification.title}
                                </div>
                                <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.45 }}>
                                  {notification.message}
                                </div>
                              </button>
                              <button
                                onClick={() => removeNotification(notification.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#6b7280',
                                  cursor: 'pointer',
                                  fontSize: 16,
                                  lineHeight: 1,
                                  padding: 0,
                                }}
                              >
                                x
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={openCommonCalendar}
                title="Open Common Calendar"
                style={{
                  width: 40,
                  height: 40,
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <CalendarIcon />
              </button>

              <button
                onClick={() => onNavigate?.('profile')}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Profile
              </button>

              <span style={{ color: '#ccc', fontSize: 13 }}>Hi, {user.name}</span>

              <button
                onClick={logout}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate?.('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#aaa',
                  cursor: 'pointer',
                }}
              >
                Log In
              </button>

              <button
                onClick={() => onNavigate?.('login')}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg,#e03c52,#b82840)',
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      <div style={{ height: 60 }} />
    </>
  );
};
