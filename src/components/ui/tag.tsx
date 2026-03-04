import React from 'react';

interface TagProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}

export const Tag: React.FC<TagProps> = ({ children, color = '#a0a0a0', style }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 13px', borderRadius: 999,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    color, fontSize: 12, fontWeight: 500,
    backdropFilter: 'blur(8px)',
    ...style,
  }}>
    {children}
  </span>
);