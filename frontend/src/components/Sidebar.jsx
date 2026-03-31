import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Users, UserCircle, Settings, Lightbulb } from 'lucide-react'

const links = [
  { icon: LayoutDashboard, to: '/dashboard',   label: 'Dashboard'    },
  { icon: MessageSquare,   to: '/my-analytics',label: 'All Feedback' },
  { icon: Users,           to: '/site-users',  label: 'Site Users'   },
  { icon: Lightbulb,       to: '/insights',    label: 'Insights'     },
  { icon: UserCircle,      to: '/my-account',  label: 'My Account'   },
  { icon: Settings,        to: '/settings',    label: 'Settings'     },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 56,
      background: '#161b27',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 24,
      gap: 6,
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      {links.map(({ icon: Icon, to, label }) => (
        <NavLink key={to} to={to} title={label}
          style={({ isActive }) => ({
            padding: 10, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isActive ? '#00f5d4' : '#475569',
            background: isActive ? 'rgba(0,245,212,0.1)' : 'transparent',
            transition: 'all 0.2s', textDecoration: 'none'
          })}>
          <Icon size={20} />
        </NavLink>
      ))}
    </aside>
  )
}