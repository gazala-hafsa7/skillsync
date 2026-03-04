import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';
import { SkillSyncLogo } from '../components/ui/Logo';

interface LoginProps { onNavigate?: (page: string) => void; }

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, color: '#f0f0f0', fontSize: 15,
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
    backdropFilter: 'blur(8px)',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (isSignup && !form.name) {
      setError('Please enter your name.');
      return;
    }
    login(form.email, form.password, role);
    onNavigate?.('home');
  };

  const AppleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
  const TwitterIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '40px 20px', position: 'relative',
    }}>
      <div style={{ position: 'absolute', width: 400, height: 300, top: '15%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(224,60,82,0.25) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%', maxWidth: 420, position: 'relative', zIndex: 1,
        background: 'linear-gradient(145deg, rgba(30,10,10,0.85) 0%, rgba(15,15,15,0.92) 100%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '40px 36px',
        backdropFilter: 'blur(32px)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
        animation: 'fadeUp 0.5s ease both', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -60, left: -40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(200,40,70,0.6) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center' }}>
          <SkillSyncLogo size={32} />
          <span style={{ fontSize: 17, fontWeight: 700 }}>SkillSync</span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 6, letterSpacing: '-0.4px' }}>
          {isSignup ? 'Create account' : 'Welcome back'}
        </h2>
        <p style={{ color: '#505050', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
          {isSignup ? 'Join the campus skill network' : 'Sign in to your account'}
        </p>

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4 }}>
          {(['student', 'admin'] as Role[]).map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              flex: 1, padding: '9px', borderRadius: 9, border: 'none',
              background: role === r ? 'rgba(224,60,82,0.8)' : 'transparent',
              color: role === r ? '#fff' : '#606060',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s', textTransform: 'capitalize',
            }}>{r}</button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(224,60,82,0.1)', border: '1px solid rgba(224,60,82,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', zIndex: 1 }}>
          {isSignup && (
            <div>
              <label style={{ fontSize: 12, color: '#505050', marginBottom: 5, display: 'block', fontWeight: 500 }}>Full Name</label>
              <input type="text" placeholder="Jane Smith" style={inputStyle}
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} />
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, color: '#505050', marginBottom: 5, display: 'block', fontWeight: 500 }}>Email</label>
            <input type="email" placeholder="you@college.edu" style={inputStyle}
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} required />
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#505050', marginBottom: 5, display: 'block', fontWeight: 500 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type="password" placeholder="••••••••••" style={{ ...inputStyle, paddingRight: 56 }}
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                onFocus={e => (e.target.style.borderColor = 'rgba(224,60,82,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')} required />
              <button type="submit" style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#e03c52,#b82840)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(224,60,82,0.5)', color: '#fff', fontSize: 16,
              }}>→</button>
            </div>
          </div>

          {!isSignup && (
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: 12, color: '#404040', cursor: 'pointer' }}>Forgot Password?</span>
            </div>
          )}

          {/* OR divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: '#404040' }}>OR</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[AppleIcon, GoogleIcon, TwitterIcon].map((Icon, i) => (
              <button key={i} type="button" style={{
                flex: 1, padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, color: '#a0a0a0', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              }}>
                <Icon />
              </button>
            ))}
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#404040', position: 'relative', zIndex: 1 }}>
          {isSignup ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <span onClick={() => setIsSignup(!isSignup)} style={{ color: '#e03c52', cursor: 'pointer', fontWeight: 600 }}>
            {isSignup ? 'Sign in' : 'Sign up'}
          </span>
        </p>
      </div>
    </main>
  );
};

export default Login;