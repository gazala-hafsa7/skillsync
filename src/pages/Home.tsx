import React, { useRef, useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { SkillTag } from '../components/ui/badge';

/* ── Intersection observer hook ── */
const useVisible = (ref: React.RefObject<HTMLElement>) => {
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setV(true); },
      { threshold: 0.1 }
    );
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return v;
};

/* ── Fade section wrapper ── */
const Fade: React.FC<{ children: React.ReactNode; delay?: number; style?: React.CSSProperties }> = ({ children, delay = 0, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const v = useVisible(ref as React.RefObject<HTMLElement>);
  return (
    <div ref={ref} className={`section-fade ${v ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
};

/* ── Envelope component ── */
const Envelope: React.FC = () => {
  const [opened, setOpened] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => setOpened(!opened)}
      style={{ position: 'relative', width: 480, height: 340, cursor: 'pointer', margin: '0 auto' }}
    >
      <style>{`
        @keyframes envelopeGlow {
          0%,100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.05); }
        }
        @keyframes cardRise {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(-60px); opacity: 1; }
        }
        @keyframes flapOpen {
          from { transform: rotateX(0deg); }
          to   { transform: rotateX(-180deg); }
        }
        @keyframes sparkle {
          0%   { transform: translate(0,0) scale(0);   opacity: 0; }
          50%  { transform: translate(var(--dx),var(--dy)) scale(1); opacity: 1; }
          100% { transform: translate(calc(var(--dx)*2),calc(var(--dy)*2)) scale(0); opacity: 0; }
        }
      `}</style>

      {/* Ambient glow behind envelope */}
      <div style={{
        position: 'absolute', inset: -60,
        background: 'radial-gradient(ellipse, rgba(200,80,20,0.5) 0%, transparent 65%)',
        filter: 'blur(20px)',
        animation: 'envelopeGlow 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* ── ENVELOPE BODY ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 300, borderRadius: '4px 4px 16px 16px',
        background: 'linear-gradient(175deg, #1a1a1a 0%, #111 100%)',
        border: '1px solid rgba(255,120,30,0.2)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(200,80,20,0.15)',
        overflow: 'hidden',
      }}>
        {/* Bottom triangle fold */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
          background: 'linear-gradient(180deg, #161616 0%, #121212 100%)',
          clipPath: 'polygon(0 100%, 50% 0%, 100% 100%)',
          borderTop: '1px solid rgba(255,120,30,0.1)',
        }} />
        {/* Left triangle fold */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          width: '50%', height: '100%',
          background: 'linear-gradient(135deg, #181818, #141414)',
          clipPath: 'polygon(0 0, 0 100%, 100% 100%)',
          borderRight: '1px solid rgba(255,255,255,0.03)',
        }} />
        {/* Right triangle fold */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '50%', height: '100%',
          background: 'linear-gradient(225deg, #181818, #141414)',
          clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
        }} />
      </div>

      {/* ── ENVELOPE FLAP (top) ── */}
      <div style={{
        position: 'absolute', top: 40, left: 0, right: 0, height: 160,
        transformOrigin: 'top center',
        transform: opened ? 'rotateX(-160deg)' : hovered ? 'rotateX(-20deg)' : 'rotateX(0deg)',
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: opened ? 1 : 10,
        perspective: 800,
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(160deg, #1e1e1e 0%, #151515 100%)',
          clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
          borderBottom: '1px solid rgba(255,120,30,0.15)',
          boxShadow: 'inset 0 -10px 30px rgba(0,0,0,0.3)',
        }} />
      </div>

      {/* ── CARD inside envelope ── */}
      <div style={{
        position: 'absolute', left: 24, right: 24,
        top: opened ? -20 : 80,
        height: 220, borderRadius: 16, zIndex: 5,
        background: 'linear-gradient(145deg, #c85010 0%, #e86820 30%, #f07830 50%, #c04010 100%)',
        boxShadow: opened
          ? '0 -20px 60px rgba(200,80,20,0.6), 0 0 40px rgba(240,120,40,0.4)'
          : '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '28px 32px', textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Card texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 16,
          background: 'radial-gradient(ellipse at 30% 30%, rgba(255,180,80,0.25) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        {/* Corner brackets */}
        {[{ top:10,left:10,borderTop:'2px solid',borderLeft:'2px solid' },
          { top:10,right:10,borderTop:'2px solid',borderRight:'2px solid' },
          { bottom:10,left:10,borderBottom:'2px solid',borderLeft:'2px solid' },
          { bottom:10,right:10,borderBottom:'2px solid',borderRight:'2px solid' }
        ].map((s, i) => (
          <div key={i} style={{ position:'absolute', width:14, height:14, borderColor:'rgba(255,255,255,0.4)', ...s }} />
        ))}
        {/* SkillSync wordmark on card */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <span style={{ fontSize:18 }}>⚡</span>
          <span style={{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.9)', letterSpacing:'0.05em' }}>skillsync</span>
        </div>
        <h3 style={{
          fontSize: 'clamp(15px, 2.5vw, 19px)', fontWeight: 700,
          color: '#fff', lineHeight: 1.45, letterSpacing: '-0.2px',
          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          Where skills meet opportunity.<br />
          Find your teammates to develop<br />
          and innovate to solve real world problems.
        </h3>
        {!opened && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 12 }}>
            click to open
          </p>
        )}
      </div>

      {/* Sparkles when opened */}
      {opened && [
        { dx: '-40px', dy: '-60px', delay: '0s',    size: 4,  color: '#ff8c30' },
        { dx:  '50px', dy: '-80px', delay: '0.1s',  size: 3,  color: '#ffb060' },
        { dx: '-60px', dy: '-40px', delay: '0.2s',  size: 5,  color: '#ff6010' },
        { dx:  '70px', dy: '-50px', delay: '0.15s', size: 3,  color: '#ffd080' },
        { dx:  '20px', dy: '-90px', delay: '0.05s', size: 4,  color: '#ff9040' },
      ].map((sp, i) => (
        <div key={i} style={{
          position: 'absolute', top: '40%', left: '50%',
          width: sp.size, height: sp.size, borderRadius: '50%',
          background: sp.color,
          '--dx': sp.dx, '--dy': sp.dy,
          animation: `sparkle 0.8s ease-out ${sp.delay} forwards`,
          pointerEvents: 'none', zIndex: 20,
        } as React.CSSProperties} />
      ))}

      {/* Click hint */}
      {!opened && (
        <div style={{
          position: 'absolute', bottom: -32, left: '50%', transform: 'translateX(-50%)',
          fontSize: 12, color: '#404040', whiteSpace: 'nowrap',
          animation: 'fadeUp 0.5s ease 1s both',
        }}>
          ↑ hover to peek, click to open
        </div>
      )}
    </div>
  );
};

/* ── Feature card ── */
const FeatureCard: React.FC<{
  icon: string; title: string; desc: string;
  accentColor?: string; span?: boolean;
}> = ({ icon, title, desc, accentColor = 'rgba(200,80,20,0.5)', span }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        gridColumn: span ? 'span 2' : 'span 1',
        background: hov
          ? 'linear-gradient(145deg, rgba(30,20,10,0.9), rgba(20,15,8,0.95))'
          : 'linear-gradient(145deg, rgba(20,15,8,0.8), rgba(15,10,5,0.9))',
        border: `1px solid ${hov ? 'rgba(200,80,20,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 20, padding: '32px 28px',
        backdropFilter: 'blur(20px)',
        transition: 'all 0.3s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov
          ? `0 20px 50px rgba(0,0,0,0.6), 0 0 30px ${accentColor.replace('0.5','0.15')}`
          : '0 4px 20px rgba(0,0,0,0.4)',
        position: 'relative', overflow: 'hidden', cursor: 'default',
      }}>
      {/* Top glow line on hover */}
      {hov && <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />}
      {/* Background hex pattern */}
      <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='46' viewBox='0 0 40 46' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 11.5 L40 34.5 L20 46 L0 34.5 L0 11.5 Z' fill='none' stroke='%23ff8030' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize:'40px 46px' }} />
      <div style={{
        width: 52, height: 52, borderRadius: 14, marginBottom: 20,
        background: `linear-gradient(135deg, ${accentColor.replace('0.5','0.2')}, transparent)`,
        border: `1px solid ${accentColor.replace('0.5','0.3')}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
        boxShadow: hov ? `0 0 20px ${accentColor.replace('0.5','0.3')}` : 'none',
        transition: 'box-shadow 0.3s',
      }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.3px', color: '#f0e8e0' }}>{title}</h3>
      <p style={{ fontSize: 14, color: '#604838', lineHeight: 1.75 }}>{desc}</p>
    </div>
  );
};

/* ── Step card ── */
const StepCard: React.FC<{ n: string; icon: string; title: string; desc: string }> = ({ n, icon, title, desc }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(200,80,20,0.08)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hov ? 'rgba(200,80,20,0.3)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 20, padding: '32px 24px', textAlign: 'center',
        backdropFilter: 'blur(16px)', transition: 'all 0.3s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
      {hov && <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 0%, rgba(200,80,20,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />}
      <div style={{ position:'relative', display:'inline-flex', marginBottom:20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 20,
          background: 'linear-gradient(135deg, rgba(200,80,20,0.2), rgba(200,80,20,0.05))',
          border: '1px solid rgba(200,80,20,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
          boxShadow: hov ? '0 0 24px rgba(200,80,20,0.3)' : 'none', transition: 'box-shadow 0.3s',
        }}>{icon}</div>
        <div style={{
          position:'absolute', top:-8, right:-8,
          width:26, height:26, borderRadius:'50%',
          background:'linear-gradient(135deg,#c85010,#e86820)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:800, color:'#fff',
          boxShadow:'0 0 12px rgba(200,80,20,0.5)',
        }}>{n}</div>
      </div>
      <h3 style={{ fontSize:18, fontWeight:700, marginBottom:10, letterSpacing:'-0.2px', color:'#f0e8e0' }}>{title}</h3>
      <p style={{ fontSize:14, color:'#604838', lineHeight:1.75 }}>{desc}</p>
    </div>
  );
};

/* ── Member card ── */
const MemberCard: React.FC<{ initials:string; name:string; dept:string; skills:string[]; match:number }> = ({ initials, name, dept, skills, match }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'rgba(200,80,20,0.07)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hov ? 'rgba(200,80,20,0.25)' : 'rgba(255,255,255,0.05)'}`,
        borderRadius: 20, padding: '24px 22px',
        backdropFilter: 'blur(16px)', transition: 'all 0.25s ease',
      }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
        <div style={{
          width:48, height:48, borderRadius:'50%',
          background:'linear-gradient(135deg,#c85010,#e86820)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontWeight:700, fontSize:15, color:'#fff', flexShrink:0,
          boxShadow:'0 0 16px rgba(200,80,20,0.4)',
        }}>{initials}</div>
        <div>
          <div style={{ fontWeight:700, fontSize:15, color:'#f0e8e0', letterSpacing:'-0.2px' }}>{name}</div>
          <div style={{ fontSize:13, color:'#604838' }}>{dept}</div>
        </div>
        <div style={{ marginLeft:'auto', fontSize:12, color:'#e86820', fontWeight:700,
          background:'rgba(200,80,20,0.12)', border:'1px solid rgba(200,80,20,0.25)',
          padding:'4px 10px', borderRadius:999 }}>
          {match}% match
        </div>
      </div>
      <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
        {skills.map(s => (
          <span key={s} style={{
            padding:'4px 11px', fontSize:12, fontWeight:500,
            background:'rgba(200,80,20,0.08)', border:'1px solid rgba(200,80,20,0.15)',
            borderRadius:999, color:'#906040',
          }}>{s}</span>
        ))}
      </div>
    </div>
  );
};

/* ── HOME PAGE ── */
interface HomeProps { onNavigate?: (page: string) => void; }

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const features = [
    { icon:'🎯', title:'Skill Matching',    desc:'AI-powered algorithm matches students to projects based on skills and proficiency levels.',  accentColor:'rgba(200,80,20,0.5)' },
    { icon:'👥', title:'Team Building',     desc:'Form balanced teams with diverse skill sets and compatible interests.',                       accentColor:'rgba(180,60,10,0.5)' },
    { icon:'🏆', title:'Gamification',      desc:"Earn points, badges, and tags like 'Backend Pro' or 'Hackathon Warrior'.",                  accentColor:'rgba(220,100,20,0.5)', span:true },
    { icon:'📊', title:'Analytics',         desc:'Track team compatibility scores, skill distribution, and campus trends.',                    accentColor:'rgba(160,60,10,0.5)' },
    { icon:'📋', title:'News Board',        desc:'Stay updated with hackathons, workshops, and startup events on campus.',                     accentColor:'rgba(200,80,20,0.5)' },
    { icon:'🛡️', title:'Role-Based Access', desc:'Students and admins get tailored dashboards with appropriate permissions.',                  accentColor:'rgba(180,70,10,0.5)' },
  ];

  const members = [
    { initials:'AC', name:'Alex Chen',    dept:'CSE, 3rd Year', skills:['React','Node.js','Python'],  match:92 },
    { initials:'PS', name:'Priya Sharma', dept:'ECE, 4th Year', skills:['Figma','Flutter','ML'],      match:88 },
    { initials:'RK', name:'Ravi Kumar',   dept:'IT, 2nd Year',  skills:['AWS','Docker','Go'],         match:95 },
  ];

  const floatingTags = [
    { label:'React',   style:{ top:'26%', left:'4%'   }, delay:'0s'   },
    { label:'Python',  style:{ top:'20%', right:'6%'  }, delay:'0.7s' },
    { label:'Node.js', style:{ top:'54%', left:'2%'   }, delay:'1.4s' },
    { label:'Figma',   style:{ top:'62%', right:'4%'  }, delay:'2.1s' },
    { label:'AWS',     style:{ bottom:'22%', left:'7%'}, delay:'2.8s' },
  ];

  return (
    <main style={{ background:'#080808' }}>

      {/* ══ HERO ══ */}
      <section style={{
        minHeight:'calc(100vh - 60px)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'0 40px 80px',
        position:'relative', overflow:'hidden', textAlign:'center',
      }}>
        {/* Orange ambient orbs — matches Velocity reference */}
        <div style={{ position:'absolute', width:700, height:500, top:'-5%', left:'50%', transform:'translateX(-50%)', background:'radial-gradient(ellipse, rgba(200,80,20,0.18) 0%, transparent 65%)', filter:'blur(2px)', pointerEvents:'none', animation:'drift 16s ease-in-out infinite' }} />
        <div style={{ position:'absolute', width:400, height:400, bottom:'5%', left:'-5%', background:'radial-gradient(circle, rgba(160,50,10,0.1) 0%, transparent 70%)', pointerEvents:'none', animation:'drift 20s ease-in-out reverse infinite' }} />
        <div style={{ position:'absolute', width:300, height:300, bottom:'10%', right:'-2%', background:'radial-gradient(circle, rgba(180,70,10,0.08) 0%, transparent 70%)', pointerEvents:'none', animation:'drift 18s ease-in-out 4s infinite' }} />

        {/* Hex grid background */}
        <div style={{ position:'absolute', inset:0, opacity:0.025, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='69' viewBox='0 0 60 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17.3 L60 51.9 L30 69.2 L0 51.9 L0 17.3 Z' fill='none' stroke='%23ff8030' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize:'60px 69px', pointerEvents:'none' }} />

        {/* Floating tags */}
        {floatingTags.map(t => (
          <SkillTag key={t.label} className="hide-mobile"
            style={{ position:'absolute', zIndex:2, ...t.style }} delay={t.delay}>
            {t.label}
          </SkillTag>
        ))}

        {/* Platform badge */}
        <div style={{ animation:'fadeUp 0.5s ease 0.1s both', marginBottom:28 }}>
          <span style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'8px 20px', borderRadius:999,
            background:'rgba(200,80,20,0.1)', border:'1px solid rgba(200,80,20,0.25)',
            fontSize:13, color:'#c06030', backdropFilter:'blur(12px)',
          }}>
            <span style={{ fontSize:14 }}>⚡</span> Campus Skill Matchmaking Platform
          </span>
        </div>

        {/* Headline */}
        <div style={{ animation:'fadeUp 0.6s ease 0.2s both' }}>
          <h1 style={{ fontSize:'clamp(38px,7vw,72px)', fontWeight:800, lineHeight:1.05, letterSpacing:'-1.5px', marginBottom:6, color:'#f5ede5' }}>
            Find. Match.
          </h1>
          <h1 style={{
            fontSize:'clamp(38px,7vw,72px)', fontWeight:800, lineHeight:1.05,
            letterSpacing:'-1.5px', marginBottom:28,
            background:'linear-gradient(135deg, #ff9050, #e06020, #c04010)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            Build Better Teams.
          </h1>
        </div>

        <p style={{
          fontSize:17, color:'#604030', maxWidth:520, lineHeight:1.8, marginBottom:40,
          animation:'fadeUp 0.6s ease 0.35s both', letterSpacing:'-0.1px',
        }}>
          Where skills meet opportunity. Find your perfect hackathon squad,
          project team, or startup co-founders — powered by intelligent skill matching.
        </p>

        <div style={{ display:'flex', gap:14, flexWrap:'wrap', justifyContent:'center', animation:'fadeUp 0.6s ease 0.5s both' }}>
          <button onClick={() => onNavigate?.('profile')} style={{
            padding:'14px 32px', fontSize:15, fontWeight:700, borderRadius:12, border:'none',
            background:'linear-gradient(135deg, #e06020, #c04010)', color:'#fff', cursor:'pointer',
            fontFamily:'inherit', transition:'all 0.2s',
            boxShadow:'0 0 24px rgba(200,80,20,0.4)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 36px rgba(200,80,20,0.6)'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 24px rgba(200,80,20,0.4)'; (e.currentTarget as HTMLButtonElement).style.transform='none'; }}
          >
            Get Started Now
          </button>
          <button onClick={() => onNavigate?.('projects')} style={{
            padding:'14px 32px', fontSize:15, fontWeight:700, borderRadius:12,
            background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
            color:'#a07060', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.04)'; }}
          >
            Explore Teams
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display:'flex', alignItems:'center', marginTop:60,
          animation:'fadeUp 0.6s ease 0.65s both',
          background:'rgba(200,80,20,0.05)', border:'1px solid rgba(200,80,20,0.12)',
          borderRadius:20, padding:'20px 40px', backdropFilter:'blur(16px)',
          flexWrap:'wrap', justifyContent:'center',
        }}>
          {[['500+','Students'],['120+','Projects'],['95%','Match Rate']].map(([val,label],i) => (
            <React.Fragment key={val}>
              <div style={{ textAlign:'center', padding:'0 32px' }}>
                <div style={{ fontSize:26, fontWeight:800, color:'#f0e0d0', letterSpacing:'-0.5px' }}>{val}</div>
                <div style={{ fontSize:13, color:'#604030', marginTop:2 }}>{label}</div>
              </div>
              {i < 2 && <div style={{ width:1, height:36, background:'rgba(200,80,20,0.2)' }} />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ══ ENVELOPE SECTION ══ */}
      <section style={{ padding:'80px 40px 120px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 50%, rgba(200,80,20,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <Fade>
          <div style={{ textAlign:'center', marginBottom:72 }}>
            <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:999, background:'rgba(200,80,20,0.1)', border:'1px solid rgba(200,80,20,0.2)', fontSize:12, color:'#c06030', marginBottom:16, letterSpacing:'0.08em' }}>
              OUR MISSION
            </span>
            <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:800, letterSpacing:'-0.5px', color:'#f0e8e0', marginBottom:12 }}>
              A message for you
            </h2>
            <p style={{ color:'#604030', fontSize:15, maxWidth:400, margin:'0 auto' }}>
              Open to discover what SkillSync is all about
            </p>
          </div>
          <Envelope />
        </Fade>
      </section>

      {/* ══ PROBLEM ══ */}
      <section style={{ padding:'80px 40px', textAlign:'center', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 40%, rgba(200,80,20,0.06) 0%, transparent 65%)', pointerEvents:'none' }} />
        <Fade>
          <div className="container" style={{ padding:0 }}>
            <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:999, background:'rgba(200,80,20,0.1)', border:'1px solid rgba(200,80,20,0.2)', fontSize:12, color:'#c06030', marginBottom:20, letterSpacing:'0.08em' }}>
              WHY US
            </span>
            <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:800, lineHeight:1.2, marginBottom:24, letterSpacing:'-0.5px', color:'#f0e8e0' }}>
              The Problem with Team Formation
            </h2>
            <p style={{ fontSize:17, color:'#604030', lineHeight:1.9, maxWidth:720, margin:'0 auto' }}>
              Engineering students waste hours finding teammates for hackathons and projects.
              Teams end up unbalanced — three frontend devs, zero backend.
              No one knows who has what skills.{' '}
              <span style={{ color:'#e06020', fontWeight:600 }}>SkillSync fixes this.</span>
            </p>
          </div>
        </Fade>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding:'40px 40px 100px' }}>
        <div className="container" style={{ padding:0 }}>
          <Fade>
            <div style={{ textAlign:'center', marginBottom:64 }}>
              <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:999, background:'rgba(200,80,20,0.1)', border:'1px solid rgba(200,80,20,0.2)', fontSize:12, color:'#c06030', marginBottom:16, letterSpacing:'0.08em' }}>
                PROCESS
              </span>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:800, marginBottom:10, letterSpacing:'-0.5px', color:'#f0e8e0' }}>
                The Process. Fast, Clear, Done.
              </h2>
              <p style={{ fontSize:15, color:'#604030' }}>Three steps to your dream team</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, maxWidth:880, margin:'0 auto' }}>
              <StepCard n="1" icon="⌨️" title="Create Your Profile"  desc="Add your skills, interests, and achievements to build your tech identity." />
              <StepCard n="2" icon="🧠" title="Smart Matching"        desc="Our algorithm finds the perfect teams based on skill diversity and synergy." />
              <StepCard n="3" icon="🚀" title="Build Together"        desc="Join teams, hack, ship projects, and earn reputation on campus." />
            </div>
          </Fade>
        </div>
      </section>

      {/* ══ FEATURES ══ */}
      <section style={{ padding:'20px 40px 100px' }}>
        <div className="container" style={{ padding:0 }}>
          <Fade>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <span style={{ display:'inline-block', padding:'6px 16px', borderRadius:999, background:'rgba(200,80,20,0.1)', border:'1px solid rgba(200,80,20,0.2)', fontSize:12, color:'#c06030', marginBottom:16, letterSpacing:'0.08em' }}>
                FEATURES
              </span>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:800, marginBottom:10, letterSpacing:'-0.5px', color:'#f0e8e0' }}>
                Why Students Stick With SkillSync
              </h2>
              <p style={{ fontSize:15, color:'#604030' }}>Everything you need to build winning teams</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
              {features.map(f => <FeatureCard key={f.title} {...f} />)}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══ MEMBERS ══ */}
      <section style={{ padding:'20px 40px 100px' }}>
        <div className="container" style={{ padding:0 }}>
          <Fade>
            <div style={{ textAlign:'center', marginBottom:56 }}>
              <h2 style={{ fontSize:'clamp(26px,4vw,42px)', fontWeight:800, marginBottom:10, letterSpacing:'-0.5px', color:'#f0e8e0' }}>
                Meet Your Future Teammates
              </h2>
              <p style={{ fontSize:15, color:'#604030' }}>Talented students ready to build with you</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
              {members.map(m => <MemberCard key={m.name} {...m} />)}
            </div>
          </Fade>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ padding:'80px 40px 120px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        {/* Orange glow bg */}
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 50% 60%, rgba(200,80,20,0.15) 0%, transparent 65%)', pointerEvents:'none' }} />
        {/* Hex pattern */}
        <div style={{ position:'absolute', inset:0, opacity:0.02, backgroundImage:`url("data:image/svg+xml,%3Csvg width='60' height='69' viewBox='0 0 60 69' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 17.3 L60 51.9 L30 69.2 L0 51.9 L0 17.3 Z' fill='none' stroke='%23ff8030' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize:'60px 69px', pointerEvents:'none' }} />
        <Fade>
          <h2 style={{ fontSize:'clamp(28px,5vw,48px)', fontWeight:800, marginBottom:14, letterSpacing:'-0.8px', color:'#f0e8e0' }}>
            Ready to find your team?
          </h2>
          <p style={{ fontSize:16, color:'#604030', marginBottom:36, maxWidth:420, margin:'0 auto 36px' }}>
            Join hundreds of students already building better teams on{' '}
            <span style={{ color:'#e06020' }}>SkillSync.</span>
          </p>
          <button onClick={() => onNavigate?.('profile')} style={{
            padding:'16px 40px', fontSize:16, fontWeight:700, borderRadius:14, border:'none',
            background:'linear-gradient(135deg, #e06020, #c04010)', color:'#fff',
            cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s',
            boxShadow:'0 0 32px rgba(200,80,20,0.5)',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 48px rgba(200,80,20,0.7)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform='none'; (e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 32px rgba(200,80,20,0.5)'; }}
          >
            Get Started Free →
          </button>
        </Fade>
      </section>

    </main>
  );
};

export default Home;