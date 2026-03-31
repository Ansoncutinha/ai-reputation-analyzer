import { useNavigate } from 'react-router-dom'
import WaveBg from '../components/WaveBg'

export default function Landing() {
  const nav = useNavigate()

  return (
    <div className="wave-bg" style={{
      minHeight:'100vh', display:'flex',
      flexDirection:'column', alignItems:'center',
      justifyContent:'center', position:'relative'
    }}>
      <WaveBg />

      {/* Top nav */}
      <nav style={{
        position:'absolute', top:0, left:0, right:0,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'20px 40px', zIndex:2
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <svg width="30" height="30" viewBox="0 0 32 32">
            <path d="M16 4 L28 12 L28 24 L16 30 L4 24 L4 12 Z"
                  fill="none" stroke="#00f5d4" strokeWidth="2"/>
            <circle cx="16" cy="16" r="5" fill="#00f5d4" opacity="0.8"/>
          </svg>
          <span style={{ color:'#00f5d4', fontWeight:700, fontSize:20 }}>InsightFlow</span>
        </div>
        <div style={{ display:'flex', gap:14 }}>
          <button onClick={() => nav('/login')} style={{
            padding:'8px 24px', borderRadius:9999,
            border:'1px solid rgba(0,245,212,0.5)',
            background:'transparent', color:'#00f5d4',
            cursor:'pointer', fontWeight:600, fontSize:14
          }}>Login</button>
          <button onClick={() => nav('/signup')} className="btn-cyan"
                  style={{ width:'auto', padding:'8px 24px', fontSize:14 }}>
            Get Access
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        position:'relative', zIndex:1,
        display:'flex', flexDirection:'column',
        alignItems:'center', textAlign:'center',
        gap:24, maxWidth:720, padding:'0 24px'
      }}>
        {/* Badge */}
        <div style={{
          padding:'6px 18px', borderRadius:9999,
          border:'1px solid rgba(0,245,212,0.3)',
          background:'rgba(0,245,212,0.08)',
          color:'#00f5d4', fontSize:13, fontWeight:600
        }}>
          ✦ AI-Powered Feedback & Reputation Analytics
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize:52, fontWeight:800, lineHeight:1.15,
          color:'white', margin:0
        }}>
          Know Exactly What Your
          <br/>
          <span style={{
            background:'linear-gradient(90deg, #00f5d4, #39ff14)',
            WebkitBackgroundClip:'text',
            WebkitTextFillColor:'transparent'
          }}>
            Customers Think
          </span>
        </h1>

        <p style={{
          color:'#94a3b8', fontSize:18, lineHeight:1.7,
          maxWidth:560, margin:0
        }}>
          Add one line of code to your website. InsightFlow instantly tracks
          user feedback, sentiment, and behavior — giving you a live analytics
          dashboard to grow your business.
        </p>

        {/* Single CTA */}
        <button onClick={() => nav('/signup')} className="btn-cyan"
                style={{ width:'auto', padding:'16px 48px', fontSize:17, marginTop:8 }}>
          Start Analyzing Your Site →
        </button>

        {/* How it works */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(3,1fr)',
          gap:20, marginTop:16, width:'100%'
        }}>
          {[
            { step:'01', title:'Add the snippet',    desc:'Paste one JS line into your website header' },
            { step:'02', title:'Collect feedback',   desc:'Visitors submit ratings and comments automatically' },
            { step:'03', title:'See live analytics', desc:'Your dashboard shows sentiment, trends and users' },
          ].map(s => (
            <div key={s.step} style={{
              padding:'20px', borderRadius:14, textAlign:'left',
              background:'rgba(35,41,54,0.7)',
              border:'1px solid rgba(0,245,212,0.12)',
              backdropFilter:'blur(10px)'
            }}>
              <div style={{
                color:'#00f5d4', fontSize:13, fontWeight:700,
                marginBottom:8, opacity:0.7
              }}>{s.step}</div>
              <div style={{ color:'white', fontWeight:700, fontSize:15, marginBottom:6 }}>
                {s.title}
              </div>
              <div style={{ color:'#64748b', fontSize:13, lineHeight:1.5 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span style={{
        position:'absolute', bottom:20, right:24,
        color:'white', opacity:0.2, fontSize:24
      }}>✦</span>
    </div>
  )
}