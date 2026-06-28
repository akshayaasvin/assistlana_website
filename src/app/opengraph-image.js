import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ASSISTLANA - AI HR Platform'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
          ASSISTLANA
        </div>
        <div style={{ fontSize: 32, color: '#38bdf8', marginBottom: 30, textAlign: 'center' }}>
          AI-Powered HR Platform
        </div>
        <div style={{ fontSize: 22, color: '#94a3b8', textAlign: 'center', maxWidth: 800 }}>
          AI Resume Screening • Mock Interviews • Jobs • Internships
        </div>
        <div style={{ fontSize: 18, color: '#64748b', marginTop: 30 }}>
          Trusted by 500+ businesses across India
        </div>
      </div>
    ),
    { ...size }
  )
}
