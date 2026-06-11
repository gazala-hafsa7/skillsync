import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';
import { SkillSyncLogo } from '../components/ui/Logo';
interface LoginProps { onNavigate?: (page: string) => void; }

const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, register } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<Role>('student');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const studentEmailPattern = /^1604\S*@mjcollege\.ac\.in$/i;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12, color: '#f0f0f0', fontSize: 15,
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s',
    backdropFilter: 'blur(8px)',
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (isSignup && role === 'admin') {
    setError('Admin accounts are created manually. Please use admin sign in only.');
    return;
  }

  if (isSignup && role === 'student' && !studentEmailPattern.test(form.email.trim())) {
    setError('Student email must start with 1604 and end with @mjcollege.ac.in');
    return;
  }

  try {
    const data = isSignup
      ? await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role,
        })
      : await login(form.email, form.password, role);

    if (data.token) {
      onNavigate?.('home');
    } else {
      setError(data.message || "Invalid credentials");
    }

  } catch (err) {
    console.error(err);
    setError("Something went wrong");
  }
};

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
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => onNavigate?.('home')}
        style={{
        background: 'none',
        border: 'none',
        color: '#a0a0a0',
        cursor: 'pointer',
        fontSize: 13,
        padding: 0,
        fontFamily: 'inherit'
      }}
   >
    ← Back to home
   </button>
  </div>
        {/* Logo */}
        <div
          onClick={() => onNavigate?.('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, justifyContent: 'center', cursor: 'pointer' }}
        >
          <SkillSyncLogo size={32} />
          <span style={{ fontSize: 17, fontWeight: 700 }}>SkillSync</span>
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 6, letterSpacing: '-0.4px' }}>
          {isSignup ? 'Create account' : 'Welcome back'}
        </h2>
        <p style={{ color: '#505050', textAlign: 'center', marginBottom: 24, fontSize: 14 }}>
          {isSignup ? 'Join the campus skill network' : role === 'admin' ? 'Sign in with your manually created admin account' : 'Sign in to your account'}
        </p>

        {/* Role toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4 }}>
          {(['student', 'admin'] as Role[]).map(r => (
            <button key={r} onClick={() => setRole(r)} disabled={isSignup && r === 'admin'} style={{
              flex: 1, padding: '9px', borderRadius: 9, border: 'none',
              background: role === r ? 'rgba(224,60,82,0.8)' : 'transparent',
              color: isSignup && r === 'admin' ? '#3f3f46' : role === r ? '#fff' : '#606060',
              fontSize: 13, fontWeight: 600, cursor: isSignup && r === 'admin' ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s', textTransform: 'capitalize',
              opacity: isSignup && r === 'admin' ? 0.5 : 1,
            }}>{r}</button>
          ))}
        </div>

        {isSignup && (
          <p style={{ color: '#6b7280', textAlign: 'center', marginTop: -12, marginBottom: 20, fontSize: 12 }}>
            Student signup only. Admin accounts must be added manually.
          </p>
        )}

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

        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#404040', position: 'relative', zIndex: 1 }}>
          {isSignup ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <span
            onClick={() => {
              const nextIsSignup = !isSignup;
              setIsSignup(nextIsSignup);
              if (nextIsSignup) {
                setRole('student');
              }
            }}
            style={{ color: '#e03c52', cursor: 'pointer', fontWeight: 600 }}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </span>
        </p>
      </div>
    </main>
  );
};

export default Login;
