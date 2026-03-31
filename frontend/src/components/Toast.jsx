import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  const colors = {
    success: { bg:'rgba(57,255,20,0.12)',  border:'#39ff14', text:'#39ff14', icon:'✓' },
    error:   { bg:'rgba(255,77,77,0.12)',  border:'#ff4d4d', text:'#ff4d4d', icon:'✕' },
    info:    { bg:'rgba(0,245,212,0.12)',  border:'#00f5d4', text:'#00f5d4', icon:'ℹ' },
  }
  const c = colors[type] || colors.info

  return (
    <div style={{
      position:'fixed', top:24, right:24, zIndex:9999,
      display:'flex', alignItems:'center', gap:12,
      padding:'14px 20px', borderRadius:12,
      background:c.bg, border:`1px solid ${c.border}`,
      boxShadow:`0 0 20px ${c.border}30`,
      minWidth:280, maxWidth:380,
      transition:'all 0.3s',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(-16px)',
    }}>
      <span style={{
        width:28, height:28, borderRadius:'50%',
        background:`${c.border}20`, border:`1px solid ${c.border}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        color:c.text, fontSize:14, fontWeight:700, flexShrink:0
      }}>{c.icon}</span>
      <span style={{ color:'white', fontSize:13, fontWeight:500, lineHeight:1.4 }}>
        {message}
      </span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        style={{ marginLeft:'auto', background:'none', border:'none',
                 color:'#475569', cursor:'pointer', fontSize:16, padding:'0 4px' }}>
        ×
      </button>
    </div>
  )
}