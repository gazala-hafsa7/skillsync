import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const ALL_SKILLS = ['React','Vue.js','Angular','Node.js','Python','Django','FastAPI',
  'Java','Spring Boot','Go','Rust','Flutter','React Native','Swift',
  'PostgreSQL','MongoDB','Redis','AWS','GCP','Docker','Kubernetes',
  'TensorFlow','PyTorch','OpenCV','Figma','Adobe XD','Blender'];

const Profile: React.FC = () => {
  const [skills, setSkills] = useState<string[]>(['React','Node.js','Python']);
  const [profile, setProfile] = useState({ name:'Alex Chen', dept:'CSE', year:'3rd Year' });
  const [saved, setSaved] = useState(false);

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'12px 16px',
    background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.07)',
    borderRadius:12, color:'#f0f0f0', fontSize:14, fontFamily:'inherit', outline:'none',
    transition:'border-color 0.2s', backdropFilter:'blur(8px)',
  };

  return (
    <main style={{ minHeight:'100vh', padding:'60px 40px' }}>
      <div className="container" style={{ padding:0, maxWidth:780 }}>
        <h1 style={{ fontSize:32, fontWeight:800, marginBottom:6, letterSpacing:'-0.5px' }}>My Profile</h1>
        <p style={{ color:'#606060', marginBottom:44, fontSize:14 }}>Build your tech identity and get matched with the right teams.</p>

        {/* Profile card */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:28, marginBottom:16, backdropFilter:'blur(20px)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28, flexWrap:'wrap' }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#e03c52,#ff8c69)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800, color:'#fff', boxShadow:'0 0 24px rgba(224,60,82,0.4)', flexShrink:0 }}>
              {profile.name.split(' ').map(n=>n[0]).join('')}
            </div>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, letterSpacing:'-0.3px' }}>{profile.name}</h2>
              <p style={{ color:'#606060', fontSize:14 }}>{profile.dept} · {profile.year}</p>
            </div>
            <div style={{ marginLeft:'auto' }}>
              <Badge status="done">⚡ 92% Match Score</Badge>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            {([['name','Full Name','Your full name'],['dept','Department','e.g. CSE, ECE'],['year','Year','e.g. 3rd Year']] as const).map(([k,label,ph]) => (
              <div key={k} style={k==='name' ? {gridColumn:'1 / -1'} : {}}>
                <label style={{ fontSize:12, color:'#505050', marginBottom:5, display:'block', fontWeight:500 }}>{label}</label>
                <input type="text" placeholder={ph} value={(profile as any)[k]}
                  onChange={e => setProfile(p=>({...p,[k]:e.target.value}))}
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor='rgba(224,60,82,0.35)')}
                  onBlur={e  => (e.target.style.borderColor='rgba(255,255,255,0.07)')} />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:28, marginBottom:20, backdropFilter:'blur(20px)' }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:4, letterSpacing:'-0.2px' }}>Skills</h3>
          <p style={{ color:'#505050', fontSize:13, marginBottom:18 }}>{skills.length} selected</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:9 }}>
            {ALL_SKILLS.map(s => {
              const active = skills.includes(s);
              return (
                <button key={s} onClick={() => setSkills(p => active ? p.filter(x=>x!==s) : [...p,s])}
                  style={{
                    padding:'6px 14px', fontSize:13, fontWeight:500,
                    background: active ? 'rgba(224,60,82,0.12)' : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${active ? 'rgba(224,60,82,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius:999, color: active ? '#f87171' : '#606060',
                    cursor:'pointer', fontFamily:'inherit', transition:'all 0.18s',
                  }}>
                  {active && '✓ '}{s}
                </button>
              );
            })}
          </div>
        </div>

        <Button size="lg" variant="accent" onClick={() => { setSaved(true); setTimeout(()=>setSaved(false),2500); }}>
          {saved ? '✓ Saved!' : 'Save Profile →'}
        </Button>
      </div>
    </main>
  );
};

export default Profile;