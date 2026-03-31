import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import WaveBg from '../components/WaveBg'
import API from '../api/axios'
import { useToast } from '../context/ToastContext'

export default function ResetPassword() {
  const [params]      = useSearchParams()
  const token         = params.get('token')
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const nav           = useNavigate()
  const { showToast } = useToast()

  const handleReset = async () => {
    if (!password || !confirm) return showToast('Please fill in both fields', 'error')
    if (password.length < 6)   return showToast('Password must be at least 6 characters', 'error')
    if (password !== confirm)  return showToast('Passwords do not match', 'error')
    if (!token)                return showToast('Invalid reset link', 'error')

    setLoading(true)
    try {
      const { data } = await API.post('/reset-password/confirm', { token, newPassword: password })
      showToast(data.message, 'success')
      setTimeout(() => nav('/login'), 1500)
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wave-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <WaveBg/>
      <div className="glass-card glowing-border" style={{
        position:'relative', zIndex:1, width:'100%', maxWidth:420,
        padding:40, display:'flex', flexDirection:'column', alignItems:'center', gap:14
      }}>
        <span style={{ color:'#00f5d4', fontWeight:700, fontSize:18 }}>InsightFlow</span>
        <h2 style={{ color:'white', fontSize:24, fontWeight:700, margin:0 }}>
          Set New Password
        </h2>
        <p style={{ color:'#64748b', fontSize:13, margin:0, textAlign:'center' }}>
          Enter your new password below
        </p>

        <input className="input-field" type="password"
               placeholder="New Password (min 6 characters)"
               value={password} onChange={e => setPassword(e.target.value)}/>
        <input className="input-field" type="password"
               placeholder="Confirm New Password"
               value={confirm} onChange={e => setConfirm(e.target.value)}/>

        <button className="btn-cyan" onClick={handleReset} disabled={loading} style={{ marginTop:4 }}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </div>
  )
}