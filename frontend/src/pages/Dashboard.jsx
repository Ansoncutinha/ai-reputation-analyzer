import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import API from '../api/axios'

const donutColors = ['#39ff14','#ff4d4d','#f97316']

const pinkCard = {
  background:'#1a1f2e',
  border:'1px solid rgba(255,20,255,0.35)',
  borderRadius:14, padding:18,
  boxShadow:'0 0 18px rgba(255,0,255,0.08)'
}

function Gauge({ value, max=5 }) {
  // Scale value from [1, 5]. Total sweep is 180 degrees (-90 to 90) to make a perfect semi-circle.
  const pct   = (Math.min(Math.max(value, 1), max) - 1) / (max - 1 || 1)
  const angle = -90 + pct * 180
  const r2rad = deg => (deg * Math.PI) / 180
  const cx=100, cy=105, R=72

  const ex = cx + R * Math.cos(r2rad(angle - 90))
  const ey = cy + R * Math.sin(r2rad(angle - 90))

  const colors = ['#ff4d4d','#f97316','#cfff00','#39ff14','#00f5d4']

  // 5 colored segments spanning the 180 degrees (180 / 5 = 36 degrees each)
  const segments = colors.map((c, i) => {
    const startDeg = -90 + i * 36
    const endDeg   = startDeg + 36
    const x1 = cx + R * Math.cos(r2rad(startDeg - 90))
    const y1 = cy + R * Math.sin(r2rad(startDeg - 90))
    const x2 = cx + R * Math.cos(r2rad(endDeg - 90))
    const y2 = cy + R * Math.sin(r2rad(endDeg - 90))
    return { c, x1, y1, x2, y2 }
  })

  // Spread the 5 labels evenly across the 180 degree semi-circle (intervals of 180/4 = 45)
  const labels = [1,2,3,4,5].map((n, i) => {
    const deg = -90 + i * 45
    const lx  = cx + (R + 22) * Math.cos(r2rad(deg - 90))
    const ly  = cy + (R + 22) * Math.sin(r2rad(deg - 90))
    return { n, lx, ly }
  })

  return (
    <svg width="200" height="140" viewBox="0 0 200 140">
      <path
        d={`M ${cx - R} ${cy} A ${R} ${R} 0 1 1 ${cx + R} ${cy}`}
        fill="none" stroke="#2a3040"
        strokeWidth="12" strokeLinecap="round"
      />
      {segments.map((s, i) => (
        <path key={i}
          d={`M ${s.x1} ${s.y1} A ${R} ${R} 0 0 1 ${s.x2} ${s.y2}`}
          fill="none" stroke={s.c}
          strokeWidth="12" strokeLinecap="round" opacity="0.85"
        />
      ))}
      <line x1={cx} y1={cy} x2={ex} y2={ey} stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="5" fill="white"/>
      {labels.map(({ n, lx, ly }) => (
        <text key={n} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fill="#94a3b8" fontSize="12" fontWeight="700">
          {n}
        </text>
      ))}
    </svg>
  )
}

function DonutLabel({ cx, cy }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
      <tspan x={cx} dy="-8"  fill="#94a3b8" fontSize="10">Sentiment</tspan>
      <tspan x={cx} dy="16"  fill="#94a3b8" fontSize="10">breakdown</tspan>
    </text>
  )
}

function CustomLegend({ hidden, onToggle }) {
  const items = [
    { key:'neg',   label:'Negative',        color:'#ef4444' },
    { key:'neu',   label:'Neutral',          color:'#f97316' },
    { key:'pos',   label:'Positive',         color:'#39ff14' },
    { key:'score', label:'Sentiment score',  color:'#00f5d4' },
  ]
  return (
    <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginTop:8 }}>
      {items.map(item => (
        <button
          key={item.key}
          onClick={() => onToggle(item.key)}
          style={{
            display:'flex', alignItems:'center', gap:6,
            padding:'5px 12px', borderRadius:9999,
            border:`1px solid ${hidden[item.key] ? '#333' : item.color}`,
            background: hidden[item.key] ? 'rgba(255,255,255,0.03)' : `${item.color}20`,
            color: hidden[item.key] ? '#475569' : item.color,
            cursor:'pointer', fontSize:12, fontWeight:600,
            fontFamily:'inherit', transition:'all 0.2s',
            textDecoration: hidden[item.key] ? 'line-through' : 'none'
          }}
        >
          <span style={{ width:10, height:10, borderRadius:'50%', background: hidden[item.key] ? '#333' : item.color, display:'inline-block' }}/>
          {item.label}
        </button>
      ))}
    </div>
  )
}

const CustomDot = (props) => {
  const { cx, cy } = props
  if (!cx || !cy) return null
  return <circle cx={cx} cy={cy} r={4} fill="#00f5d4" stroke="#1a1f2e" strokeWidth={2}/>
}

export default function Dashboard() {
  const nav = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [hidden,  setHidden]  = useState({ neg:false, neu:false, pos:false, score:false })

  useEffect(() => {
    API.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const toggleHidden = (key) => setHidden(prev => ({ ...prev, [key]: !prev[key] }))

  if (loading) return (
    <div style={{ color:'#00f5d4', textAlign:'center', paddingTop:80, fontSize:18 }}>
      Loading dashboard...
    </div>
  )

  if (error) return (
    <div style={{ color:'#ff4d4d', textAlign:'center', paddingTop:80, fontSize:16 }}>
      {error}
    </div>
  )

  const avg = data?.avgSentimentScore || 0
  const sb  = data?.sentimentBreakdown || {}

  const donut = [
    { name:'Positive', value: sb.positivePercent || 0 },
    { name:'Negative', value: sb.negativePercent || 0 },
    { name:'Neutral',  value: sb.neutralPercent  || 0 },
  ]

  const timelineMap = {}
  ;(data?.timeline || []).forEach(t => {
    const d = t._id.date
    if (!timelineMap[d]) timelineMap[d] = { date:d, pos:0, neu:0, neg:0 }
    if (t._id.sentiment==='Positive') timelineMap[d].pos = t.count
    if (t._id.sentiment==='Neutral')  timelineMap[d].neu = t.count
    if (t._id.sentiment==='Negative') timelineMap[d].neg = t.count
  })

  const chartData = Object.values(timelineMap).map(d => {
    const total = d.pos + d.neu + d.neg
    const score = total > 0
      ? Number(((d.pos*5 + d.neu*3 + d.neg*1) / total).toFixed(2))
      : avg
    return { ...d, score }
  })

  const sentimentLabel = avg >= 4 ? 'Positive' : avg >= 3 ? 'Neutral' : 'Negative'
  const sentimentColor = avg >= 4 ? '#39ff14' : avg >= 3 ? '#cfff00' : '#ff4d4d'

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      <h1 style={{ color:'white', fontSize:20, fontWeight:700, display:'flex', alignItems:'center', gap:12 }}>
        <span style={{ width:6, height:28, borderRadius:3, background:'linear-gradient(to bottom,#ff4dff,#00f5d4)', display:'inline-block' }}/>
        Dashboard — Sentiment Analysis
        <span style={{ color:'#94a3b8', fontSize:14, fontWeight:400 }}>(live)</span>
      </h1>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>

        {/* Gauge */}
        <div style={pinkCard}>
          <p style={{ color:'#94a3b8', fontSize:12, textAlign:'center', marginBottom:4 }}>
            Overall Sentiment Level
          </p>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
            <Gauge value={avg} max={5}/>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:-8 }}>
              <span style={{ fontSize:22 }}>{avg >= 4 ? '😊' : avg >= 3 ? '😐' : '😞'}</span>
              <span style={{ color:'white', fontSize:28, fontWeight:700 }}>{avg}</span>
            </div>
            <div style={{ color:'#94a3b8', fontSize:11 }}>Out of 5</div>
            <div style={{ color:sentimentColor, fontWeight:700, fontSize:14 }}>{sentimentLabel}</div>
          </div>
        </div>

        {/* Donut */}
        <div style={pinkCard}>
          <p style={{ color:'#94a3b8', fontSize:12, textAlign:'center', marginBottom:4 }}>
            Comment's Sentiment
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <PieChart width={140} height={140}>
              <Pie data={donut} cx={65} cy={65} innerRadius={40} outerRadius={60} dataKey="value" labelLine={false}>
                {donut.map((d,i) => <Cell key={i} fill={donutColors[i]}/>)}
                <DonutLabel cx={65} cy={65}/>
              </Pie>
            </PieChart>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {donut.map((d,i) => (
                <div key={d.name} style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:16 }}>{d.name==='Positive'?'👍':d.name==='Negative'?'👎':'🤔'}</span>
                  <div>
                    <div style={{ color:donutColors[i], fontWeight:700, fontSize:16 }}>{d.value}%</div>
                    <div style={{ color:'#64748b', fontSize:10 }}>{d.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats + Insights preview */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { icon:'💬', label:'Total Feedback', val:data?.totalFeedback||0, change:`${sb.positivePercent||0}%` },
            { icon:'👥', label:'Total Users',    val:data?.totalUsers||0,    change:'+new' },
          ].map(s => (
            <div key={s.label} style={{ ...pinkCard, flex:1, display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{s.icon}</div>
              <div>
                <div style={{ color:'white', fontSize:28, fontWeight:700 }}>{s.val}</div>
                <div style={{ color:'#94a3b8', fontSize:13 }}>{s.label}</div>
              </div>
              <div style={{ marginLeft:'auto', color:'#39ff14', fontWeight:700, fontSize:16 }}>{s.change}</div>
            </div>
          ))}

          {/* Insights preview card */}
          <div
            onClick={() => nav('/insights')}
            style={{
              background:'rgba(255,77,77,0.05)',
              border:'1px solid rgba(255,77,77,0.3)',
              borderRadius:14, padding:18,
              cursor:'pointer',
              display:'flex', alignItems:'center', gap:14,
              transition:'all 0.2s'
            }}
          >
            <div style={{ width:48, height:48, borderRadius:12, background:'rgba(255,77,77,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>⚠️</div>
            <div>
              <div style={{ color:'#ff4d4d', fontWeight:700, fontSize:13 }}>AI Insights ready</div>
              <div style={{ color:'#64748b', fontSize:11, marginTop:3 }}>View smart suggestions →</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ background:'#1a1f2e', border:'1px solid rgba(255,20,255,0.35)', borderRadius:14, padding:'18px 18px 8px', boxShadow:'0 0 18px rgba(255,0,255,0.08)' }}>
        <h2 style={{ color:'#ff4dff', fontWeight:700, textAlign:'center', marginBottom:16, fontSize:15 }}>
          Sentiment timeline
        </h2>
        {chartData.length === 0 ? (
          <div style={{ color:'#64748b', textAlign:'center', padding:40 }}>
            No timeline data yet. Submit feedback to see trends here.
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ top:10, right:20, left:0, bottom:5 }}>
                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize:11, fill:'#94a3b8' }}/>
                <YAxis yAxisId="l" stroke="#475569" tick={{ fontSize:11, fill:'#94a3b8' }} domain={[0,'auto']}
                       label={{ value:'Comments', angle:-90, position:'insideLeft', fill:'#64748b', fontSize:10 }}/>
                <YAxis yAxisId="r" orientation="right" stroke="#00f5d4" tick={{ fontSize:11, fill:'#00f5d4' }} domain={[0,5]}
                       label={{ value:'Score', angle:90, position:'insideRight', fill:'#00f5d4', fontSize:10 }}/>
                <Tooltip contentStyle={{ background:'#1a1f2e', border:'1px solid #00f5d4', borderRadius:8, fontSize:12 }}/>
                {!hidden.neg   && <Bar  yAxisId="l" dataKey="neg"   stackId="a" fill="#ef4444" name="Negative"/>}
                {!hidden.neu   && <Bar  yAxisId="l" dataKey="neu"   stackId="a" fill="#f97316" name="Neutral"/>}
                {!hidden.pos   && <Bar  yAxisId="l" dataKey="pos"   stackId="a" fill="#39ff14" name="Positive"/>}
                {!hidden.score && (
                  <Line yAxisId="r" type="monotone" dataKey="score" stroke="#00f5d4" strokeWidth={3}
                        dot={<CustomDot/>} activeDot={{ r:6, fill:'#00f5d4' }} name="Sentiment score"/>
                )}
              </ComposedChart>
            </ResponsiveContainer>
            <CustomLegend hidden={hidden} onToggle={toggleHidden}/>
          </>
        )}
      </div>

    </div>
  )
}