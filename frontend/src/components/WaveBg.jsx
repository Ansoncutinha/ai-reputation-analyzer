export default function WaveBg() {
  return (
    <svg style={{
      position: 'fixed', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0
    }} viewBox="0 0 1440 600" preserveAspectRatio="none">
      <path fill="none" stroke="#00f5d4" strokeWidth="1.2" strokeOpacity="0.4"
        d="M0,180 C240,80 480,280 720,180 C960,80 1200,260 1440,160"/>
      <path fill="none" stroke="#00f5d4" strokeWidth="0.8" strokeOpacity="0.2"
        d="M0,300 C200,200 500,400 800,280 C1050,180 1280,340 1440,250"/>
      <path fill="none" stroke="#39ff14" strokeWidth="0.7" strokeOpacity="0.12"
        d="M0,380 C300,260 600,460 900,330 C1100,240 1300,380 1440,310"/>
    </svg>
  )
}