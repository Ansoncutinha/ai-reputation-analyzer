import { useState, useEffect } from 'react'
import API from '../api/axios'

const card = {
  background: '#1a1f2e',
  border: '1px solid rgba(0,245,212,0.15)',
  borderRadius: 14,
  padding: '20px 24px',
  marginBottom: 16
}

const pinkCard = {
  background: '#1a1f2e',
  border: '1px solid rgba(255,20,255,0.35)',
  borderRadius: 14,
  padding: '20px 24px',
  marginBottom: 16
}

export default function Insights() {
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [insights,    setInsights]    = useState(null)
  const [generatedAt, setGeneratedAt] = useState(null)
  const [error,       setError]       = useState('')

  // On page load — fetch dashboard stats + cached insights (no API call)
  useEffect(() => {
    Promise.all([
      API.get('/dashboard'),
      API.get('/feedback'),
      API.get('/insights')
    ]).then(([dash, feed, cached]) => {
      setData({ dashboard: dash.data, feedbacks: feed.data.feedbacks || [] })
      if (cached.data.insights) {
        setInsights(cached.data.insights)
        setGeneratedAt(cached.data.generatedAt)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  // On button click — call Gemini via backend and cache result
  const generateInsights = async () => {
    setAiLoading(true)
    setError('')
    try {
      const res = await API.post('/insights/generate')
      setInsights(res.data.insights)
      setGeneratedAt(res.data.generatedAt)
    } catch (err) {
      setError('Failed to generate insights. Please try again.')
    }
    setAiLoading(false)
  }

  const severityColor = s =>
    s === 'high'   ? { color:'#ff4d4d', bg:'rgba(255,77,77,0.12)'  } :
    s === 'medium' ? { color:'#f97316', bg:'rgba(249,115,22,0.12)' } :
                     { color:'#cfff00', bg:'rgba(207,255,0,0.12)'  }

  const impactColor = i =>
    i === 'high' ? { color:'#39ff14', bg:'rgba(57,255,20,0.12)'  } :
                   { color:'#00f5d4', bg:'rgba(0,245,212,0.12)'  }

  const trendColor =
    insights?.trend === 'improving' ? '#39ff14' :
    insights?.trend === 'declining' ? '#ff4d4d' : '#cfff00'

  const trendIcon =
    insights?.trend === 'improving' ? '📈' :
    insights?.trend === 'declining' ? '📉' : '➡️'

  if (loading) return (
    <div style={{ color:'#00f5d4', textAlign:'center', paddingTop:80, fontSize:18 }}>
      Loading...
    </div>
  )

  const sb = data?.dashboard?.sentimentBreakdown || {}

  return (
    <div style={{ maxWidth:860 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ color:'white', fontSize:22, fontWeight:700, margin:0, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:6, height:28, borderRadius:3, background:'linear-gradient(to bottom,#ff4dff,#00f5d4)', display:'inline-block' }}/>
            AI Insights
          </h1>
          <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0 16px' }}>
            Smart analysis powered by Gemini AI
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
          <button
            onClick={generateInsights}
            disabled={aiLoading}
            style={{
              padding:'12px 28px', borderRadius:9999,
              background: aiLoading ? 'rgba(0,245,212,0.2)' : 'linear-gradient(135deg,#00f5d4,#00c4aa)',
              color:'#0d1117', border:'none', cursor: aiLoading ? 'not-allowed' : 'pointer',
              fontWeight:700, fontSize:14, fontFamily:'inherit',
              boxShadow: aiLoading ? 'none' : '0 0 20px rgba(0,245,212,0.4)',
              display:'flex', alignItems:'center', gap:8
            }}
          >
            {aiLoading
              ? <><span>⏳</span> Analyzing...</>
              : <><span>🧠</span> {insights ? 'Regenerate Insights' : 'Generate AI Insights'}</>
            }
          </button>
          {generatedAt && (
            <span style={{ color:'#475569', fontSize:11 }}>
              Last generated: {new Date(generatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background:'rgba(255,77,77,0.1)', border:'1px solid #ff4d4d', borderRadius:10, padding:'12px 16px', color:'#ff4d4d', fontSize:13, marginBottom:16 }}>
          {error}
        </div>
      )}

      {/* Stats overview */}
      {data && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[
            { label:'Total Feedback', value: data.dashboard?.totalFeedback || 0,             icon:'💬', color:'#00f5d4' },
            { label:'Avg Score',      value: `${data.dashboard?.avgSentimentScore || 0}/5`,   icon:'⭐', color:'#cfff00' },
            { label:'Positive',       value: `${sb.positivePercent || 0}%`,                   icon:'👍', color:'#39ff14' },
            { label:'Negative',       value: `${sb.negativePercent || 0}%`,                   icon:'👎', color:'#ff4d4d' },
          ].map(s => (
            <div key={s.label} style={{ ...card, marginBottom:0, textAlign:'center', padding:'16px 12px' }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ color:s.color, fontSize:22, fontWeight:700 }}>{s.value}</div>
              <div style={{ color:'#64748b', fontSize:11, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!insights && !aiLoading && (
        <div style={{ ...pinkCard, textAlign:'center', padding:'60px 40px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🧠</div>
          <h2 style={{ color:'white', fontSize:18, fontWeight:600, marginBottom:8 }}>
            No insights generated yet
          </h2>
          <p style={{ color:'#64748b', fontSize:14, marginBottom:24 }}>
            Click "Generate AI Insights" to get real AI-powered business recommendations.
            Results are cached — Gemini is only called when you click the button.
          </p>
          <button onClick={generateInsights} style={{
            padding:'12px 32px', borderRadius:9999,
            background:'linear-gradient(135deg,#00f5d4,#00c4aa)',
            color:'#0d1117', border:'none', cursor:'pointer',
            fontWeight:700, fontSize:14, fontFamily:'inherit',
            boxShadow:'0 0 20px rgba(0,245,212,0.4)'
          }}>
            🚀 Generate Insights Now
          </button>
        </div>
      )}

      {/* Loading state */}
      {aiLoading && (
        <div style={{ ...pinkCard, textAlign:'center', padding:'60px 40px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
          <h2 style={{ color:'#00f5d4', fontSize:18, fontWeight:600, marginBottom:8 }}>
            Gemini AI is analyzing your feedback...
          </h2>
          <p style={{ color:'#64748b', fontSize:14 }}>
            Reading customer reviews and generating smart insights
          </p>
        </div>
      )}

      {/* Insights content */}
      {insights && !aiLoading && (
        <>

          {/* Power Summary */}
          <div style={{
            background:'linear-gradient(135deg, rgba(0,245,212,0.08), rgba(255,20,255,0.08))',
            border:'1px solid rgba(0,245,212,0.35)',
            borderRadius:14, padding:'20px 24px',
            marginBottom:16,
            display:'flex', alignItems:'flex-start', gap:16
          }}>
            <span style={{ fontSize:30, flexShrink:0 }}>💡</span>
            <div>
              <div style={{ color:'#00f5d4', fontSize:11, fontWeight:700, letterSpacing:1.5, marginBottom:8 }}>
                AI SUMMARY
              </div>
              <p style={{ color:'white', fontSize:15, fontWeight:600, margin:0, lineHeight:1.7 }}>
                {insights.powerSummary || insights.summary}
              </p>
            </div>
          </div>

          {/* Overall trend */}
          <div style={{ ...pinkCard, display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ fontSize:36 }}>{trendIcon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <span style={{ color:'white', fontWeight:700, fontSize:15 }}>Overall Assessment</span>
                <span style={{
                  display:'inline-block', padding:'3px 12px', borderRadius:9999,
                  fontSize:11, fontWeight:700,
                  color:trendColor, background:`${trendColor}20`,
                  border:`1px solid ${trendColor}40`
                }}>
                  {insights.trend?.toUpperCase()}
                </span>
              </div>
              <p style={{ color:'#94a3b8', fontSize:14, margin:0 }}>{insights.summary}</p>
              <p style={{ color:trendColor, fontSize:12, margin:'8px 0 0', fontStyle:'italic' }}>
                {insights.trendInsight}
              </p>
            </div>
          </div>

          {/* Like vs Complain */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div style={{ ...card, border:'1px solid rgba(57,255,20,0.2)' }}>
              <h3 style={{ color:'#39ff14', fontSize:14, fontWeight:700, marginBottom:14 }}>
                👍 What customers like
              </h3>
              {(insights.whatCustomersLike || []).map((item, i, arr) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                  borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }}>
                  <span style={{ color:'#39ff14' }}>✓</span>
                  <span style={{ color:'#e2e8f0', fontSize:13 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card, border:'1px solid rgba(255,77,77,0.2)' }}>
              <h3 style={{ color:'#ff4d4d', fontSize:14, fontWeight:700, marginBottom:14 }}>
                👎 What customers complain about
              </h3>
              {(insights.whatCustomersComplainAbout || []).map((item, i, arr) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'8px 0',
                  borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }}>
                  <span style={{ color:'#ff4d4d' }}>✗</span>
                  <span style={{ color:'#e2e8f0', fontSize:13 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Issues */}
          <div style={pinkCard}>
            <h3 style={{ color:'#ff4dff', fontSize:14, fontWeight:700, marginBottom:16 }}>
              ⚠️ Key Issues Detected
            </h3>
            {(insights.keyIssues || []).map((item, i, arr) => {
              const sc = severityColor(item.severity)
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'flex-start', gap:14, padding:'12px 0',
                  borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }}>
                  <span style={{
                    display:'inline-block', padding:'3px 10px', borderRadius:9999,
                    fontSize:10, fontWeight:700, marginTop:2, whiteSpace:'nowrap',
                    color:sc.color, background:sc.bg, border:`1px solid ${sc.color}40`
                  }}>
                    {(item.severity || 'low').toUpperCase()}
                  </span>
                  <div>
                    <div style={{ color:'white', fontSize:13, fontWeight:600 }}>{item.issue}</div>
                    <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>{item.detail}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Suggestions */}
          <div style={{ ...card, border:'1px solid rgba(0,245,212,0.25)' }}>
            <h3 style={{ color:'#00f5d4', fontSize:14, fontWeight:700, marginBottom:16 }}>
              💡 Action Suggestions
            </h3>
            {(insights.actionSuggestions || []).map((item, i, arr) => {
              const ic = impactColor(item.impact)
              const icons = ['🚀','📣','📝','🎁','⚡','🔧']
              return (
                <div key={i} style={{
                  display:'flex', alignItems:'flex-start', gap:14, padding:'12px 0',
                  borderBottom: i < arr.length-1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                }}>
                  <div style={{
                    width:34, height:34, borderRadius:'50%',
                    background:'rgba(0,245,212,0.1)', border:'1px solid rgba(0,245,212,0.3)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:15, flexShrink:0
                  }}>
                    {icons[i] || '💡'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                      <span style={{ color:'white', fontSize:13, fontWeight:600 }}>{item.action}</span>
                      <span style={{
                        display:'inline-block', padding:'2px 8px', borderRadius:9999,
                        fontSize:10, fontWeight:700,
                        color:ic.color, background:ic.bg, border:`1px solid ${ic.color}40`
                      }}>
                        {(item.impact || 'medium').toUpperCase()} IMPACT
                      </span>
                    </div>
                    <div style={{ color:'#64748b', fontSize:12 }}>{item.detail}</div>
                  </div>
                </div>
              )
            })}
          </div>

        </>
      )}
    </div>
  )
}
