import { Search } from 'lucide-react'

const users = [
  { name:'Alex Smith',      email:'alex.rr@mail.co',    role:'Administrator', status:'Online'  },
  { name:'Joral Smith',     email:'alex.rr@mail.com',   role:'Member',        status:'Online'  },
  { name:'Kervn Smith',     email:'alex.rri@mail.com',  role:'Member',        status:'Offline' },
  { name:'Naria Metherson', email:'renmitty@mail.com',  role:'Member',        status:'Offline' },
  { name:'Stephan Smith',   email:'stepharr@mail.com',  role:'Member',        status:'Offline' },
  { name:'Erika Lihans',    email:'alex.rd@mail.co',    role:'Contributor',   status:'Online'  },
  { name:'Daniels Plaric',  email:'alex.rr@mail.com',   role:'Member',        status:'Offline' },
  { name:'Jasen Bully',     email:'alex.rr@gmail.com',  role:'Contributor',   status:'Offline' },
  { name:'Allan Maris',     email:'darmitts@mail.com',  role:'Member',        status:'Online'  },
]

export default function ManageUsers() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1 style={{ color:'white', fontSize:20, fontWeight:700 }}>
          Manage Users: E-commerce Central{' '}
          <span style={{ color:'#94a3b8', fontWeight:400, fontSize:15 }}>(Single Site View)</span>
        </h1>
        <div style={{
          display:'flex', alignItems:'center', gap:8,
          background:'#232936', border:'1px solid rgba(0,245,212,0.3)',
          borderRadius:9999, padding:'8px 16px', minWidth:220
        }}>
          <Search size={14} color="#64748b" />
          <input placeholder="Search Single Website" style={{
            background:'transparent', border:'none', outline:'none',
            color:'white', fontSize:13, width:'100%'
          }} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
        {[
          { label:'Total Registered Users', val:32 },
          { label:'Currently Online Users', val:0  },
          { label:'New Signups (This Week)', val:2  },
        ].map(s => (
          <div key={s.label} style={{
            display:'flex', alignItems:'center', gap:12, padding:'14px 18px',
            background:'#232936', border:'1px solid rgba(0,245,212,0.2)',
            borderRadius:12
          }}>
            <span style={{ fontSize:22 }}>👥</span>
            <span style={{ color:'#94a3b8', fontSize:13 }}>{s.label}</span>
            <span style={{ marginLeft:'auto', color:'white', fontSize:20, fontWeight:700 }}>
              {s.val}
            </span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(0,245,212,0.15)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
          <thead>
            <tr style={{ background:'#232936', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              {['Avatar','Full Name','Email Address','Account Type','Status','Last Active','Action'].map(h => (
                <th key={h} style={{ padding:'12px 16px', textAlign:'left',
                                     color:'#94a3b8', fontWeight:500 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u,i) => (
              <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td style={{ padding:'12px 16px' }}>
                  <div style={{
                    width:32, height:32, borderRadius:'50%', background:'#374151',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:700, fontSize:13, color:'white'
                  }}>{u.name[0]}</div>
                </td>
                <td style={{ padding:'12px 16px', color:'white' }}>{u.name}</td>
                <td style={{ padding:'12px 16px', color:'#94a3b8' }}>{u.email}</td>
                <td style={{ padding:'12px 16px', color:'#cbd5e1' }}>{u.role}</td>
                <td style={{ padding:'12px 16px' }}>
                  <span style={{
                    display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:700,
                    color: u.status==='Online' ? '#39ff14' : '#ff4d4d'
                  }}>
                    <span style={{
                      width:8, height:8, borderRadius:'50%', display:'inline-block',
                      background: u.status==='Online' ? '#39ff14' : '#ff4d4d'
                    }}/>
                    {u.status}
                  </span>
                </td>
                <td style={{ padding:'12px 16px', color:'#64748b', fontSize:12 }}>
                  2023-11-05 14:32:11
                </td>
                <td style={{ padding:'12px 16px' }}>
                  <button style={{
                    padding:'5px 14px', borderRadius:9999, fontSize:12, fontWeight:700,
                    background:'#00f5d4', color:'#0d1117', border:'none', cursor:'pointer',
                    boxShadow:'0 0 10px rgba(0,245,212,0.4)'
                  }}>
                    Manage User
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}