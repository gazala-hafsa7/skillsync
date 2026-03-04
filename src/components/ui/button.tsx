import React, { useState } from 'react';

type Variant = 'accent' | 'glass' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'accent', size = 'md', fullWidth, children, style, ...props
}) => {
  const [hov, setHov] = useState(false);

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'inherit', fontWeight: 600, border: 'none',
    cursor: 'pointer', transition: 'all 0.22s ease', whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined,
  };

  const sizes: Record<Size, React.CSSProperties> = {
    sm: { padding: '8px 18px',  fontSize: 13, borderRadius: 10 },
    md: { padding: '12px 24px', fontSize: 15, borderRadius: 12 },
    lg: { padding: '14px 32px', fontSize: 16, borderRadius: 14 },
  };

  const variants: Record<Variant, React.CSSProperties> = {
    accent: {
      background: hov
        ? 'linear-gradient(135deg, #ff5566, #cc2233)'
        : 'linear-gradient(135deg, #e03c52, #b82840)',
      color: '#fff',
      boxShadow: hov ? '0 0 28px rgba(224,60,82,0.5)' : '0 0 16px rgba(224,60,82,0.25)',
    },
    glass: {
      background: hov ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.05)',
      color: '#f0f0f0',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(12px)',
    },
    ghost: {
      background: 'transparent',
      color: hov ? '#f0f0f0' : '#a0a0a0',
    },
    danger: {
      background: hov ? 'rgba(224,60,82,0.2)' : 'rgba(224,60,82,0.1)',
      color: '#e03c52',
      border: '1px solid rgba(224,60,82,0.3)',
    },
  };

  return (
    <button
      style={{
        ...base,
        ...sizes[size],
        ...variants[variant],
        ...(hov ? { transform: 'translateY(-1px)' } : {}),
        ...style,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      {...props}
    >
      {children}
    </button>
  );
};