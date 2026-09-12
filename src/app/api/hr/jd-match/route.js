import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const { jobDescription, hrId } = await req.json()

    if (!jobDescription || !hrId) {
      return NextResponse.json({ error: 'Missing jobDescription or hrId' }, { status: 400 })
    }

    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('id, name, email, phone, skills, experience_years, domain, education_degree, current_role, location, summary')
      .eq('uploaded_by_hr', hrId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ scores: [] })
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY
      || process.env.GOOGLE_API_KEY
      || process.env.GOOGLE_GEMINI_API_KEY

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a recruitment AI. Score each candidate against the job description.
Return ONLY a JSON array sorted by jd_score descending. No markdown, no backticks.

[
  {
    "id": "candidate-uuid",
    "jd_score": 85,
    "match_reason": "Strong React and Next.js skills match JD requirements"
  }
]

Job Description:
${jobDescription}

Candidates to score:
${candidates.map(c => `
ID: ${c.id}
Name: ${c.name}
Skills: ${c.skills || 'Not mentioned'}
Experience: ${c.experience_years || 0} years
Domain: ${c.domain || 'Not specified'}
Role: ${c.current_role || 'Not specified'}
Education: ${c.education_degree || 'Not specified'}
---`).join('\n')}

Score 0-100 based on:
- Skills match (40%)
- Experience relevance (30%)
- Domain match (20%)
- Education (10%)`
            }]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
        })
      }
    )

    const geminiData = await response.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
    const cleanText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()

    let scores = []
    try {
      scores = JSON.parse(cleanText)
    } catch (e) {
      scores = []
    }

    return NextResponse.json({ scores, total: candidates.length })
  } catch (err) {
    console.error('JD match error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
