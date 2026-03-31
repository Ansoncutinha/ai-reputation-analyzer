import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WaveBg from '../components/WaveBg'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [loading,    setLoading]    = useState(false)

  const [showForgot, setShowForgot] = useState(false)
  const [fpEmail,    setFpEmail]    = useState('')
  const [fpLoading,  setFpLoading]  = useState(false)
  const [fpMsg,      setFpMsg]      = useState('')

  const { login }    = useAuth()
  const nav          = useNavigate()
  const { showToast } = useToast()

  const handleLogin = async () => {
    if (!identifier || !password) {
      showToast('Please fill in all fields', 'error')
      return
    }
    setLoading(true)
    try {
      const { data } = await API.post('/auth/login', { email: identifier, password })
      login(data)
      showToast(`Welcome back, ${data.fullName}!`, 'success')
      setTimeout(() => nav('/dashboard'), 800)
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Check your credentials.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!fpEmail) { setFpMsg('Please enter your email'); return }
    setFpLoading(true); setFpMsg('')
    try {
      const { data } = await API.post('/reset-password/request', { email: fpEmail })
      setFpMsg(data.message)
    } catch {
      setFpMsg('Something went wrong. Try again.')
    } finally {
      setFpLoading(false)
    }
  }

  return (
    <div className="wave-bg" style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <WaveBg/>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000
        }}>
          <div className="glass-card glowing-border" style={{
            width:'100%', maxWidth:420, padding:32, position:'relative', zIndex:1
          }}>
            <h2 style={{ color:'white', fontSize:20, fontWeight:700, marginBottom:8 }}>
              Forgot Password
            </h2>
            <p style={{ color:'#64748b', fontSize:13, marginBottom:20 }}>
              Enter your email and we'll send you a reset link.
            </p>

            {fpMsg && (
              <div style={{
                padding:'12px 16px', borderRadius:10, marginBottom:16,
                background:'rgba(0,245,212,0.1)', border:'1px solid #00f5d4',
                color:'#00f5d4', fontSize:13
              }}>{fpMsg}</div>
            )}

            <input className="input-field" type="email"
                   placeholder="Enter your email"
                   value={fpEmail} onChange={e => setFpEmail(e.target.value)}
                   style={{ marginBottom:16 }}/>

            <div style={{ display:'flex', gap:12 }}>
              <button className="btn-cyan" onClick={handleForgotPassword}
                      disabled={fpLoading} style={{ flex:1 }}>
                {fpLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button onClick={() => { setShowForgot(false); setFpMsg(''); setFpEmail('') }}
                style={{
                  flex:1, padding:'12px', borderRadius:9999,
                  background:'rgba(255,255,255,0.05)',
                  border:'1px solid rgba(255,255,255,0.1)',
                  color:'#94a3b8', cursor:'pointer', fontFamily:'inherit',
                  fontSize:14, fontWeight:600
                }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Form */}
      <div className="glass-card glowing-border" style={{
        position:'relative', zIndex:1, width:'100%', maxWidth:420,
        padding:40, display:'flex', flexDirection:'column', alignItems:'center', gap:14
      }}>
        <span style={{ color:'#00f5d4', fontWeight:700, fontSize:18 }}>InsightFlow</span>
        <h2 style={{ color:'white', fontSize:26, fontWeight:700, margin:0 }}>Welcome back</h2>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>Sign in to your dashboard</p>

        <input className="input-field" placeholder="Email or Username"
               value={identifier} onChange={e => setIdentifier(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleLogin()}/>

        <div style={{ position:'relative', width:'100%' }}>
          <input className="input-field"
                 type={showPass ? 'text' : 'password'}
                 placeholder="Password"
                 value={password} onChange={e => setPassword(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleLogin()}
                 style={{ paddingRight:44 }}/>
          <button onClick={() => setShowPass(!showPass)} style={{
            position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer',
            color:'#64748b', fontSize:18, lineHeight:1
          }}>{showPass ? '🙈' : '👁'}</button>
        </div>

        <button className="btn-cyan" onClick={handleLogin} disabled={loading} style={{ marginTop:4 }}>
          {loading ? 'Signing in...' : 'Login'}
        </button>

        <div style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
          <button onClick={() => setShowForgot(true)} style={{
            background:'none', border:'none', cursor:'pointer',
            color:'#64748b', fontSize:13, fontFamily:'inherit'
          }}>
            Forgot Password?
          </button>
          <Link to="/signup" style={{ color:'#00f5d4', fontSize:13, textDecoration:'none' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}