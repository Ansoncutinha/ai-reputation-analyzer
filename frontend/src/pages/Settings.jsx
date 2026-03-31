import { useState } from 'react'
import { LogOut, Bell, Shield, Copy, Check, Key } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import API from '../api/axios'

const API_KEY = '5942eab36f2ab7c4351a260998f791657aa7dff0'

export default function Settings() {
  const { logout }    = useAuth()
  const { showToast } = useToast()

  const [notifications, setNotifications] = useState({
    emailAlerts:       true,
    weeklyReports:     true,
    negativeSentiment: true,
  })

  const [currentPass, setCurrentPass] = useState('')
  const [newPass,     setNewPass]     = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [saving,      setSaving]      = useState(false)
  const [copied,      setCopied]      = useState(false)

  const toggleNotif = (key) =>
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))

  const handleCopy = () => {
    navigator.clipboard.writeText(API_KEY)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      showToast('Please fill in all 3 password fields', 'error')
      return
    }
    if (newPass.length < 6) {
      showToast('New password must be at least 6 characters', 'error')
      return
    }
    if (newPass !== confirmPass) {
      showToast('New passwords do not match', 'error')
      return
    }
    setSaving(true)
    try {
      await API.put('/auth/me', {
        currentPassword: currentPass,
        password: newPass
      })
      showToast('Password changed successfully!', 'success')
      setCurrentPass('')
      setNewPass('')
      setConfirmPass('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    showToast('You have been logged out successfully', 'info')
    setTimeout(() => {
      localStorage.removeItem('insightUser')
      window.location.replace('/')
    }, 1000)
  }

  const card = {
    background:'#232936',
    border:'1px solid rgba(0,245,212,0.15)',
    borderRadius:14, padding:'20px 24px', marginBottom:14
  }

  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{
      width:46, height:26, borderRadius:13, cursor:'pointer',
      background: on ? '#00f5d4' : '#374151', position:'relative',
      transition:'background 0.3s',
      boxShadow: on ? '0 0 12px rgba(0,245,212,0.5)' : 'none'
    }}>
      <div style={{
        width:20, height:20, borderRadius:'50%', background:'white',
        position:'absolute', top:3, left: on ? 22 : 3, transition:'left 0.3s'
      }}/>
    </div>
  )

  return (
    <div style={{ maxWidth:640 }}>
      <h1 style={{ color:'white', fontSize:22, fontWeight:700, marginBottom:24 }}>
        Settings
      </h1>

      {/* API Key */}
      <div style={{
        ...card,
        border:'1px solid rgba(0,245,212,0.4)',
        background:'rgba(0,245,212,0.05)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <Key size={18} color="#00f5d4"/>
          <span style={{ color:'#00f5d4', fontWeight:700, fontSize:15 }}>ShopZone API Key</span>
          <span style={{
            marginLeft:'auto', fontSize:11, color:'#39ff14',
            background:'rgba(57,255,20,0.1)', border:'1px solid #39ff1440',
            padding:'2px 10px', borderRadius:9999
          }}>Active</span>
        </div>
        <p style={{ color:'#94a3b8', fontSize:13, marginBottom:16, lineHeight:1.6 }}>
          This is your permanent API key for ShopZone. Already saved in your ShopZone backend.
          <strong style={{ color:'#ff4d4d' }}> Never change it</strong> — it will disconnect ShopZone.
        </p>
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          background:'#1a1f2e', borderRadius:10,
          padding:'12px 16px', border:'1px solid rgba(0,245,212,0.2)'
        }}>
          <code style={{
            flex:1, color:'#00f5d4', fontSize:12,
            fontFamily:'monospace', wordBreak:'break-all'
          }}>
            {API_KEY}
          </code>
          <button onClick={handleCopy} style={{
            background: copied ? '#39ff14' : 'rgba(0,245,212,0.15)',
            border:`1px solid ${copied ? '#39ff14' : 'rgba(0,245,212,0.3)'}`,
            borderRadius:8, padding:'6px 12px', cursor:'pointer',
            color: copied ? '#0d1117' : '#00f5d4',
            display:'flex', alignItems:'center', gap:6,
            fontSize:12, fontWeight:600, fontFamily:'inherit',
            transition:'all 0.2s', whiteSpace:'nowrap'
          }}>
            {copied ? <><Check size={14}/>Copied!</> : <><Copy size={14}/>Copy</>}
          </button>
        </div>
        <div style={{
          marginTop:14, padding:'10px 14px', borderRadius:8,
          background:'rgba(255,77,77,0.08)', border:'1px solid rgba(255,77,77,0.2)'
        }}>
          <p style={{ color:'#ff4d4d', fontSize:12, margin:0 }}>
            ⚠️ Saved in D:\shopzone\backend\.env — do not run the console command again.
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
          <Bell size={18} color="#00f5d4"/>
          <span style={{ color:'#00f5d4', fontWeight:600, fontSize:15 }}>Notifications</span>
        </div>
        {[
          { key:'emailAlerts',       label:'Email Alerts',              desc:'Get emailed when new feedback arrives' },
          { key:'weeklyReports',     label:'Weekly Reports',            desc:'Summary of your weekly performance' },
          { key:'negativeSentiment', label:'Negative Sentiment Alerts', desc:'Alert when negative feedback spikes' },
        ].map(item => (
          <div key={item.key} style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)'
          }}>
            <div>
              <div style={{ color:'#e2e8f0', fontSize:14 }}>{item.label}</div>
              <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>{item.desc}</div>
            </div>
            <Toggle on={notifications[item.key]} onToggle={() => toggleNotif(item.key)}/>
          </div>
        ))}
      </div>

      {/* Change Password */}
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
          <Shield size={18} color="#00f5d4"/>
          <span style={{ color:'#00f5d4', fontWeight:600, fontSize:15 }}>Change Password</span>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <input className="input-field" type="password"
                 placeholder="Current Password"
                 value={currentPass} onChange={e => setCurrentPass(e.target.value)}/>
          <input className="input-field" type="password"
                 placeholder="New Password (min 6 characters)"
                 value={newPass} onChange={e => setNewPass(e.target.value)}/>
          <input className="input-field" type="password"
                 placeholder="Confirm New Password"
                 value={confirmPass} onChange={e => setConfirmPass(e.target.value)}/>
          <button onClick={handleChangePassword} disabled={saving} style={{
            padding:'10px 24px', borderRadius:9999, width:'fit-content',
            background:'#00f5d4', color:'#0d1117', border:'none',
            cursor: saving ? 'not-allowed' : 'pointer', fontWeight:700,
            boxShadow:'0 0 14px rgba(0,245,212,0.4)',
            opacity: saving ? 0.7 : 1, fontFamily:'inherit'
          }}>
            {saving ? 'Saving...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Logout */}
      <div style={{
        ...card,
        border:'1px solid rgba(255,77,77,0.3)',
        background:'rgba(255,77,77,0.05)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <LogOut size={18} color="#ff4d4d"/>
          <span style={{ color:'#ff4d4d', fontWeight:600, fontSize:15 }}>Logout</span>
        </div>
        <p style={{ color:'#94a3b8', fontSize:13, marginBottom:16 }}>
          You will be signed out of your InsightFlow account.
        </p>
        <button onClick={handleLogout} style={{
          padding:'10px 32px', borderRadius:9999,
          background:'#ff4d4d', color:'white', border:'none',
          cursor:'pointer', fontWeight:700, fontSize:14,
          boxShadow:'0 0 16px rgba(255,77,77,0.4)', fontFamily:'inherit'
        }}>Logout</button>
      </div>
    </div>
  )
}
