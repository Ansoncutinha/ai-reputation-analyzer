import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Settings, UserCircle } from 'lucide-react'

const tabs = [
  { label: 'Dashboard',   to: '/dashboard'    },
  { label: 'All Feedback',to: '/my-analytics' },
  { label: 'Site Users',  to: '/site-users'   },
  { label: 'Insights',    to: '/insights'     },
  { label: 'My Account',  to: '/my-account'   },
]

export default function MainLayout() {
  const nav = useNavigate()
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#1a1f2e' }}>
      <Sidebar />
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>

        <header style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'12px 28px',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          background:'#161b27'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <svg width="26" height="26" viewBox="0 0 32 32">
              <path d="M16 4 L28 12 L28 24 L16 30 L4 24 L4 12 Z"
                    fill="none" stroke="#00f5d4" strokeWidth="2"/>
              <circle cx="16" cy="16" r="5" fill="#00f5d4" opacity="0.8"/>
            </svg>
            <span style={{ color:'#00f5d4', fontWeight:700, fontSize:18 }}>InsightFlow</span>
          </div>

          <nav style={{ display:'flex', gap:28 }}>
            {tabs.map(t => (
              <NavLink key={t.to} to={t.to} style={({ isActive }) => ({
                fontSize:14, fontWeight:500, textDecoration:'none',
                color: isActive ? '#00f5d4' : '#94a3b8',
                borderBottom: isActive ? '2px solid #00f5d4' : '2px solid transparent',
                paddingBottom:4, transition:'all 0.2s'
              })}>
                {t.label}
              </NavLink>
            ))}
          </nav>

          <div style={{ display:'flex', gap:18, color:'#64748b' }}>
            <Settings size={18} style={{ cursor:'pointer' }}
                      onClick={() => nav('/settings')} />
            <UserCircle size={18} style={{ cursor:'pointer' }}
                        onClick={() => nav('/my-account')} />
          </div>
        </header>

        <main style={{ flex:1, padding:28, overflowY:'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}