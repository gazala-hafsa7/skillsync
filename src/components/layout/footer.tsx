import React from 'react';

export const Footer: React.FC = () => (
  <footer style={{
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '28px 40px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    flexWrap: 'wrap', gap: 16,
    background: 'rgba(255,255,255,0.01)',
  }}>
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:28, height:28 }}>
  <svg viewBox="0 0 100 100" width="28" height="28" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="none" stroke="url(#lg3)" strokeWidth="6"/>
    <path d="M 58,22 C 58,22 35,28 35,45 C 35,58 58,55 58,68 C 58,82 35,85 35,85"
      fill="none" stroke="url(#lg3)" strokeWidth="6" strokeLinecap="round"/>
    <defs>
      <linearGradient id="lg3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff7088"/>
        <stop offset="100%" stopColor="#e03c52"/>
      </linearGradient>
    </defs>
  </svg>
</div>
      <span style={{ fontWeight:700, fontSize:15 }}>SkillSync</span>
    </div>
    <p style={{ color:'#404040', fontSize:13 }}>© 2026 SkillSync. Built for campuses everywhere.</p>
    <div style={{ display:'flex', gap:20 }}>
      {['Privacy','Terms','Contact'].map(l => (
        <span key={l} style={{ color:'#404040', fontSize:13, cursor:'pointer', transition:'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#808080')}
          onMouseLeave={e => (e.currentTarget.style.color = '#404040')}
        >{l}</span>
      ))}
    </div>
  </footer>
);