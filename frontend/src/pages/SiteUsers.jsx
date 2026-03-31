import { useState, useEffect } from 'react'
import { Search, Shield, Wifi, WifiOff } from 'lucide-react'
import API from '../api/axios'

const roleColor = { Administrator:'#00f5d4', Contributor:'#cfff00', Member:'#94a3b8' }

function PasswordCell({ password }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ fontFamily: show?'inherit':'monospace', color: show?'#e2e8f0':'#64748b',
                     fontSize:13, letterSpacing: show?'normal':2 }}>
        {show ? password : '••••••••'}
      </span>
      <button onClick={() => setShow(!show)} style={{
        background:'none', border:'none', cursor:'pointer',
        color:'#475569', display:'flex', alignItems:'center'
      }}>
        {show ? <EyeOff size={14}/> : <Eye size={14}/>}
      </button>
    </div>
  )
}

export default function SiteUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    API.get('/site-users')
      .then(res => setUsers(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u =>
    (u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (filter==='all' || u.status?.toLowerCase()===filter)
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ color:'white', fontSize:22, fontWeight:700, margin:0 }}>Site User Logins</h1>
          <p style={{ color:'#64748b', fontSize:13, marginTop:4 }}>
            Users collected from your connected client websites
          </p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:'#232936', border:'1px solid rgba(0,245,212,0.3)',
            borderRadius:9999, padding:'8px 14px'
          }}>
            <Search size={14} color="#64748b"/>
            <input placeholder="Search users..."
                   value={search} onChange={e => setSearch(e.target.value)}
                   style={{ background:'transparent', border:'none', outline:'none',
                            color:'white', fontSize:13, width:160 }}/>
          </div>
          {['all','online','offline'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding:'7px 16px', borderRadius:9999, fontSize:12, fontWeight:700,
              cursor:'pointer', textTransform:'capitalize',
              border:`1px solid ${s==='online'?'#39ff14':s==='offline'?'#ff4d4d':'rgba(0,245,212,0.4)'}`,
              color: s==='online'?'#39ff14':s==='offline'?'#ff4d4d':'#00f5d4',
              background: filter===s?(s==='online'?'#39ff1422':s==='offline'?'#ff4d4d22':'rgba(0,245,212,0.1)'):'transparent'
            }}>{s==='all'?'All Users':s}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {[
          { label:'Total Users',  val:users.length,                                  color:'#00f5d4', icon:'👥' },
          { label:'Online Now',   val:users.filter(u=>u.status==='Online').length,   color:'#39ff14', icon:'🟢' },
          { label:'Offline',      val:users.filter(u=>u.status==='Offline').length,  color:'#ff4d4d', icon:'🔴' },
        ].map(s => (
          <div key={s.label} style={{
            background:'#232936', border:`1px solid ${s.color}30`,
            borderRadius:12, padding:'16px 20px',
            display:'flex', alignItems:'center', gap:14
          }}>
            <span style={{ fontSize:24 }}>{s.icon}</span>
            <div>
              <div style={{ color:s.color, fontSize:28, fontWeight:700 }}>{s.val}</div>
              <div style={{ color:'#64748b', fontSize:13 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:10,
                    background:'rgba(0,245,212,0.05)', border:'1px solid rgba(0,245,212,0.2)',
                    borderRadius:10, padding:'10px 16px' }}>
        <Shield size={16} color="#00f5d4"/>
        <span style={{ color:'#94a3b8', fontSize:13 }}>
          Data collected from client websites via your InsightFlow JS snippet.
        </span>
      </div>

      {loading ? (
        <div style={{ color:'#00f5d4', textAlign:'center', padding:60 }}>Loading users...</div>
      ) : (
        <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid rgba(0,245,212,0.15)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#1e2535', borderBottom:'1px solid rgba(0,245,212,0.2)' }}>
                {['User','Username','Email','Role','Status','Last Online','Logins'].map(h => (
                  <th key={h} style={{ padding:'13px 14px', textAlign:'left',
                                       color:'#00f5d4', fontWeight:600, fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={7} style={{ padding:40, textAlign:'center', color:'#64748b' }}>
                  No users yet. They will appear here when clients log in on connected websites.
                </td></tr>
              ) : filtered.map((u,i) => (
                <tr key={i}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(0,245,212,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{
                        width:34, height:34, borderRadius:'50%',
                        background:'rgba(0,245,212,0.15)', border:'1px solid rgba(0,245,212,0.3)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontWeight:700, fontSize:13, color:'#00f5d4'
                      }}>{(u.fullName||u.email||'?')[0].toUpperCase()}</div>
                      <span style={{ color:'white', fontWeight:500 }}>{u.fullName||'—'}</span>
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{ color:'#00f5d4', fontFamily:'monospace',
                                   background:'rgba(0,245,212,0.08)',
                                   padding:'3px 8px', borderRadius:6, fontSize:12 }}>
                      @{u.username||'—'}
                    </span>
                  </td>
                  <td style={{ padding:'12px 14px', color:'#94a3b8' }}>{u.email}</td>
                  <td style={{ padding:'12px 14px' }}>
                    <span style={{
                      padding:'3px 10px', borderRadius:6, fontSize:11, fontWeight:700,
                      color:roleColor[u.role]||'#94a3b8',
                      background:(roleColor[u.role]||'#94a3b8')+'18'
                    }}>{u.role||'Member'}</span>
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12,
                                  fontWeight:700, color:u.status==='Online'?'#39ff14':'#ff4d4d' }}>
                      {u.status==='Online'?<Wifi size={13}/>:<WifiOff size={13}/>}
                      {u.status||'Offline'}
                    </div>
                  </td>
                  <td style={{ padding:'12px 14px', color:'#64748b', fontSize:12 }}>
                    {u.status==='Online'
                      ? <span style={{ color:'#39ff14', fontWeight:600 }}>● Active now</span>
                      : u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                  </td>
                  <td style={{ padding:'12px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ width:50, height:5, borderRadius:9999, background:'#1e2535', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:9999,
                                      width:`${Math.min(u.loginCount||0,100)}%`,
                                      background:'linear-gradient(90deg,#00f5d4,#39ff14)' }}/>
                      </div>
                      <span style={{ color:'#94a3b8', fontSize:12 }}>{u.loginCount||1}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
