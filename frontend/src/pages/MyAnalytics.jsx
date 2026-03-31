import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import API from '../api/axios'

const sentimentColor = { Positive:'#39ff14', Neutral:'#cfff00', Negative:'#ff4d4d' }

function Stars({ n }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i<=n ? '#facc15':'#374151', fontSize:16 }}>★</span>
      ))}
    </span>
  )
}

export default function MyAnalytics() {
  const [feedbacks, setFeedbacks] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState('all')

  useEffect(() => {
    API.get('/feedback')
      .then(res => setFeedbacks(res.data.feedbacks || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = feedbacks.filter(r =>
    (r.customerName?.toLowerCase().includes(search.toLowerCase()) ||
     r.feedbackText?.toLowerCase().includes(search.toLowerCase())) &&
    (filter==='all' || r.sentiment?.toLowerCase()===filter)
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
        <h1 style={{ color:'white', fontSize:22, fontWeight:700 }}>All Feedback</h1>
        <div style={{ marginLeft:'auto', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            background:'#232936', border:'1px solid rgba(0,245,212,0.3)',
            borderRadius:9999, padding:'8px 14px'
          }}>
            <Search size={14} color="#64748b"/>
            <input placeholder="Search feedback..."
                   value={search} onChange={e => setSearch(e.target.value)}
                   style={{ background:'transparent', border:'none', outline:'none',
                            color:'white', fontSize:13, width:160 }}/>
          </div>
          {['Positive','Neutral','Negative'].map(s => (
            <button key={s}
                    onClick={() => setFilter(filter===s.toLowerCase()?'all':s.toLowerCase())}
                    style={{
                      padding:'6px 16px', borderRadius:9999, fontSize:13, fontWeight:700,
                      cursor:'pointer', border:`1px solid ${sentimentColor[s]}`,
                      color:sentimentColor[s],
                      background: filter===s.toLowerCase() ? sentimentColor[s]+'25':'transparent'
                    }}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color:'#00f5d4', textAlign:'center', padding:60 }}>Loading feedback...</div>
      ) : (
        <div style={{ borderRadius:12, overflow:'hidden', border:'1px solid rgba(0,245,212,0.2)' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#232936', borderBottom:'1px solid rgba(0,245,212,0.2)' }}>
                {['Date','Customer','Rating','Feedback','Sentiment'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left',
                                       color:'#00f5d4', fontWeight:600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding:40, textAlign:'center', color:'#64748b' }}>
                  No feedback yet. It will appear here once clients submit feedback.
                </td></tr>
              ) : filtered.map((r,i) => (
                <tr key={i}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'12px 16px', color:'#94a3b8' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding:'12px 16px', color:'white' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{
                        width:30, height:30, borderRadius:'50%', background:'#374151',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontWeight:700, fontSize:12, color:'white'
                      }}>{(r.customerName||'A')[0]}</div>
                      {r.customerName || 'Anonymous'}
                    </div>
                  </td>
                  <td style={{ padding:'12px 16px' }}><Stars n={r.rating}/></td>
                  <td style={{ padding:'12px 16px', color:'#94a3b8', maxWidth:200 }}>
                    {r.feedbackText?.slice(0,60)}{r.feedbackText?.length>60?'...':''}
                  </td>
                  <td style={{ padding:'12px 16px' }}>
                    <span style={{
                      padding:'4px 12px', borderRadius:9999, fontSize:12, fontWeight:700,
                      border:`1px solid ${sentimentColor[r.sentiment]}`,
                      color:sentimentColor[r.sentiment]
                    }}>{r.sentiment}</span>
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