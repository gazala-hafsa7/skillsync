import React, { useState, useEffect } from 'react';

/* SVG icons matching the "welcome back" login page icon style */
const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const ProjectsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const NewsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>
  </svg>
);

interface NavbarProps {
  activePage?: string;
  onNavigate?: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage = 'home', onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  const links = [
    { id: 'home',      label: 'Home',       Icon: HomeIcon },
    { id: 'projects',  label: 'Projects',   Icon: ProjectsIcon },
    { id: 'newsboard', label: 'News Board', Icon: NewsIcon },
  ];

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 40px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,8,8,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Logo */}
        <div onClick={() => onNavigate?.('home')} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
         <div style={{ width:32, height:32, flexShrink:0 }}>
  <svg viewBox="0 0 100 100" width="32" height="32" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="none" stroke="url(#lg)" strokeWidth="6"/>
    <path d="M 58,22 C 58,22 35,28 35,45 C 35,58 58,55 58,68 C 58,82 35,85 35,85" 
      fill="none" stroke="url(#lg)" strokeWidth="6" strokeLinecap="round"/>
    <defs>
      <linearGradient id="lg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff7088"/>
        <stop offset="100%" stopColor="#e03c52"/>
      </linearGradient>
    </defs>
  </svg>
</div>
          <span style={{ fontSize:17, fontWeight:700, letterSpacing:'-0.3px' }}>SkillSync</span>
        </div>

        {/* Nav links with icons */}
        <div className="hide-mobile" style={{ display:'flex', gap:6, alignItems:'center', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'4px 6px' }}>
          {links.map(({ id, label, Icon }) => {
            const active = activePage === id;
            return (
              <button key={id} onClick={() => onNavigate?.(id)} style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'7px 16px', borderRadius:10, border:'none',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? '#f0f0f0' : '#707070',
                fontSize:14, fontWeight:500, cursor:'pointer',
                transition:'all 0.2s ease', fontFamily:'inherit',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#d0d0d0'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = '#707070'; }}
              >
                <Icon />{label}
              </button>
            );
          })}
        </div>

        {/* Auth buttons */}
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <button onClick={() => onNavigate?.('login')} style={{
            background:'none', border:'none', color:'#a0a0a0', fontWeight:500,
            fontSize:14, cursor:'pointer', fontFamily:'inherit', padding:'6px 12px',
            transition:'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.color = '#f0f0f0')}
            onMouseLeave={e => (e.currentTarget.style.color = '#a0a0a0')}
          >
            Log In
          </button>
          <button onClick={() => onNavigate?.('profile')} style={{
            padding:'8px 20px',
            background:'linear-gradient(135deg,#e03c52,#b82840)',
            border:'none', borderRadius:10, color:'#fff',
            fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:'inherit',
            transition:'all 0.2s ease',
            boxShadow:'0 0 16px rgba(224,60,82,0.3)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(224,60,82,0.5)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(224,60,82,0.3)'; (e.currentTarget as HTMLButtonElement).style.transform = 'none'; }}
          >
            Get Started
          </button>
        </div>
      </nav>
      <div style={{ height:60 }} />
    </>
  );
};