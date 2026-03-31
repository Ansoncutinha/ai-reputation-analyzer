import { useState, useEffect } from 'react'
import { Eye, EyeOff, UserCircle, Mail, Lock, Calendar, Shield } from 'lucide-react'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function MyAccount() {
  const { user: authUser, login } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState('')
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: ''
  })

  useEffect(() => {
    API.get('/auth/me').then(res => {
      setForm({
        fullName: res.data.fullName || '',
        username: res.data.username || '',
        email:    res.data.email    || '',
        password: ''
      })
    }).catch(console.error)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMsg('')
    try {
      const payload = { fullName: form.fullName, username: form.username, email: form.email }
      if (form.password) payload.password = form.password
      const { data } = await API.put('/auth/me', payload)
      login({ ...authUser, ...data.user })
      setMsg('Profile updated successfully!')
      setEditing(false)
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const card = {
    background:'#232936', border:'1px solid rgba(0,245,212,0.15)',
    borderRadius:14, padding:'22px 26px', marginBottom:16
  }

  const Field = ({ icon, label, field, type='text' }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        {icon}
        <span style={{ color:'#94a3b8', fontSize:12, fontWeight:600,
                       textTransform:'uppercase', letterSpacing:1 }}>{label}</span>
      </div>
      <div style={{ position:'relative' }}>
        <input
          type={field==='password' && !showPass ? 'password' : type}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          disabled={!editing}
          placeholder={field==='password' ? 'Leave blank to keep current' : ''}
          style={{
            background: editing ? 'rgba(13,17,23,0.6)' : 'rgba(13,17,23,0.3)',
            border:`1px solid ${editing?'rgba(0,245,212,0.4)':'rgba(255,255,255,0.08)'}`,
            borderRadius:10, padding:'10px 14px',
            color: editing ? '#e2e8f0' : '#94a3b8',
            width:'100%', outline:'none', fontSize:14,
            paddingRight: field==='password' ? 44 : 14
          }}
        />
        {field==='password' && (
          <button onClick={() => setShowPass(!showPass)} style={{
            position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer',
            color:'#475569', display:'flex', alignItems:'center'
          }}>
            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth:600 }}>
      {/* Header */}
      <div style={{
        ...card, display:'flex', alignItems:'center', gap:20, marginBottom:20,
        background:'linear-gradient(135deg,#1e2a3a 0%,#232936 100%)',
        border:'1px solid rgba(0,245,212,0.2)'
      }}>
        <div style={{
          width:72, height:72, borderRadius:'50%',
          background:'linear-gradient(135deg,#00f5d4,#39ff14)',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:28, fontWeight:700, color:'#0d1117',
          boxShadow:'0 0 20px rgba(0,245,212,0.3)'
        }}>
          {form.fullName?.[0] || '?'}
        </div>
        <div>
          <h2 style={{ color:'white', fontSize:20, fontWeight:700, margin:0 }}>{form.fullName}</h2>
          <p style={{ color:'#00f5d4', fontSize:13, margin:'4px 0 0' }}>@{form.username}</p>
          <p style={{ color:'#64748b', fontSize:12, margin:'2px 0 0' }}>InsightFlow Account</p>
        </div>
        <button onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                style={{
                  marginLeft:'auto', padding:'8px 20px', borderRadius:9999,
                  border: editing?'1px solid #39ff14':'1px solid rgba(0,245,212,0.4)',
                  background: editing?'rgba(57,255,20,0.1)':'transparent',
                  color: editing?'#39ff14':'#00f5d4',
                  cursor:'pointer', fontWeight:600, fontSize:13
                }}>
          {saving ? 'Saving...' : editing ? '✓ Save' : '✏ Edit'}
        </button>
      </div>

      {msg && (
        <div style={{
          padding:'10px 16px', borderRadius:10, marginBottom:16,
          background: msg.includes('success')?'rgba(57,255,20,0.1)':'rgba(255,77,77,0.1)',
          border:`1px solid ${msg.includes('success')?'#39ff14':'#ff4d4d'}`,
          color: msg.includes('success')?'#39ff14':'#ff4d4d', fontSize:13
        }}>{msg}</div>
      )}

      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <Shield size={16} color="#00f5d4"/>
          <span style={{ color:'#00f5d4', fontWeight:700, fontSize:15 }}>Account Details</span>
        </div>
        <Field icon={<UserCircle size={14} color="#64748b"/>} label="Full Name"     field="fullName"/>
        <Field icon={<span style={{ color:'#64748b', fontSize:14, fontFamily:'monospace' }}>@</span>} label="Username" field="username"/>
        <Field icon={<Mail size={14} color="#64748b"/>}       label="Email Address" field="email" type="email"/>
        <Field icon={<Lock size={14} color="#64748b"/>}       label="Password"      field="password"/>
      </div>
    </div>
  )
}