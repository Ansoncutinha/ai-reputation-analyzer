import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import WaveBg from '../components/WaveBg'
import API from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Signup() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login }      = useAuth()
  const nav            = useNavigate()
  const { showToast }  = useToast()

  const handleSignup = async () => {
    if (!fullName || !username || !email || !password || !confirm) {
      showToast('Please fill in all fields', 'error')
      return
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error')
      return
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }
    setLoading(true)
    try {
      const { data } = await API.post('/auth/register', {
        fullName, username, email, password
      })
      login(data)
      showToast(`Account created! Welcome, ${data.fullName}!`, 'success')
      setTimeout(() => nav('/dashboard'), 800)
    } catch (err) {
      showToast(err.response?.data?.message || 'Signup failed. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="wave-bg" style={{
      minHeight:'100vh', display:'flex',
      alignItems:'center', justifyContent:'center'
    }}>
      <WaveBg />
      <div className="glass-card glowing-border" style={{
        position:'relative', zIndex:1,
        width:'100%', maxWidth:420, padding:40,
        display:'flex', flexDirection:'column',
        alignItems:'center', gap:14
      }}>
        <span style={{ color:'#00f5d4', fontWeight:700, fontSize:18 }}>InsightFlow</span>
        <h2 style={{ color:'white', fontSize:26, fontWeight:700, margin:0 }}>
          Create Account
        </h2>
        <p style={{ color:'#64748b', fontSize:14, margin:0 }}>
          Start analyzing your site feedback
        </p>

        <input className="input-field" placeholder="Full Name"
               value={fullName} onChange={e => setFullName(e.target.value)}/>
        <input className="input-field" placeholder="Username"
               value={username} onChange={e => setUsername(e.target.value)}/>
        <input className="input-field" placeholder="Email Address" type="email"
               value={email} onChange={e => setEmail(e.target.value)}/>
        <input className="input-field" placeholder="Password (min 6 characters)" type="password"
               value={password} onChange={e => setPassword(e.target.value)}/>
        <input className="input-field" placeholder="Confirm Password" type="password"
               value={confirm} onChange={e => setConfirm(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSignup()}/>

        <button className="btn-cyan" onClick={handleSignup}
                disabled={loading} style={{ marginTop:6 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={{ color:'#64748b', fontSize:13 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#00f5d4', textDecoration:'none' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
