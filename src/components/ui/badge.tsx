import React from 'react';

/* ── Status badge styles matching pill design from screenshot ── */
type StatusType =
  | 'in-progress' | 'todo' | 'in-review' | 'design-review'
  | 'rework' | 'done' | 'not-started' | 'blocked'
  | 'on-hold' | 'archived' | 'skill' | 'category';

interface BadgeProps {
  status?: StatusType;
  children: React.ReactNode;
  icon?: string;
  style?: React.CSSProperties;
}

const STATUS_STYLES: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  'in-progress':   { bg: 'linear-gradient(135deg,rgba(20,180,160,0.25),rgba(20,180,160,0.1))',  border: 'rgba(20,180,160,0.4)',  color: '#2de4cc', icon: '◐' },
  'todo':          { bg: 'linear-gradient(135deg,rgba(90,100,200,0.25),rgba(90,100,200,0.1))',  border: 'rgba(90,100,200,0.4)',  color: '#8899ff', icon: '+' },
  'in-review':     { bg: 'linear-gradient(135deg,rgba(160,140,30,0.25),rgba(160,140,30,0.1))',  border: 'rgba(160,140,30,0.4)',  color: '#d4b83a', icon: '📋' },
  'design-review': { bg: 'linear-gradient(135deg,rgba(120,60,200,0.25),rgba(120,60,200,0.1))',  border: 'rgba(120,60,200,0.4)',  color: '#c084fc', icon: '⊞' },
  'rework':        { bg: 'linear-gradient(135deg,rgba(180,50,50,0.25),rgba(180,50,50,0.1))',    border: 'rgba(180,50,50,0.4)',   color: '#f87171', icon: '↺' },
  'done':          { bg: 'linear-gradient(135deg,rgba(20,140,60,0.35),rgba(20,140,60,0.15))',   border: 'rgba(20,140,60,0.5)',   color: '#4ade80', icon: '✓' },
  'not-started':   { bg: 'linear-gradient(135deg,rgba(160,40,80,0.25),rgba(160,40,80,0.1))',    border: 'rgba(160,40,80,0.4)',   color: '#fb7185', icon: '—' },
  'blocked':       { bg: 'linear-gradient(135deg,rgba(180,40,40,0.25),rgba(180,40,40,0.1))',    border: 'rgba(180,40,40,0.4)',   color: '#f87171', icon: '✕' },
  'on-hold':       { bg: 'linear-gradient(135deg,rgba(30,80,160,0.25),rgba(30,80,160,0.1))',    border: 'rgba(30,80,160,0.4)',   color: '#60a5fa', icon: '⏹' },
  'archived':      { bg: 'linear-gradient(135deg,rgba(80,80,80,0.25),rgba(80,80,80,0.1))',      border: 'rgba(80,80,80,0.4)',    color: '#9ca3af', icon: '↘' },
  'skill':         { bg: 'linear-gradient(135deg,rgba(224,60,82,0.15),rgba(224,60,82,0.05))',   border: 'rgba(224,60,82,0.25)',  color: '#f87171', icon: '' },
  'category':      { bg: 'linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))',border:'rgba(255,255,255,0.1)', color: '#a0a0a0', icon: '' },
};

export const Badge: React.FC<BadgeProps> = ({ status = 'category', children, icon, style }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES['category'];
  const displayIcon = icon ?? s.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px', borderRadius: 999,
      background: s.bg, border: `1px solid ${s.border}`,
      color: s.color, fontSize: 13, fontWeight: 600,
      backdropFilter: 'blur(8px)',
      whiteSpace: 'nowrap',
      ...style,
    }}>
      {displayIcon && <span style={{ fontSize: 12 }}>{displayIcon}</span>}
      {children}
    </span>
  );
};

/* ── Floating skill tag with className support ── */
interface SkillTagProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: string;
  className?: string;  // ← supports hide-mobile and any other class
}

export const SkillTag: React.FC<SkillTagProps> = ({ children, style, delay, className }) => (
  <span className={className} style={{
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '8px 18px', borderRadius: 999,
    background: 'rgba(15,15,15,0.85)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#a0a0a0', fontSize: 13, fontWeight: 500,
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    animation: `float 3.5s ease-in-out ${delay ?? '0s'} infinite`,
    ...style,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: '50%',
      background: 'linear-gradient(135deg, #e03c52, #ff6b6b)',
      flexShrink: 0,
    }} />
    {children}
  </span>
);
    