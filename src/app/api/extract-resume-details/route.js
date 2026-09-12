import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const EXTRACT_PROMPT = `Extract information from this resume and return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON.

{
  "full_name": "",
  "email": "",
  "phone": "",
  "location": "",
  "education_degree": "",
  "passout_year": "",
  "experience_years": "0",
  "current_company": "",
  "current_role": "",
  "skills": "",
  "domain": "",
  "linkedin_url": "",
  "summary": ""
}

Extraction rules:
- full_name: candidate full name
- email: email address found
- phone: phone number with country code if available
- location: city or location mentioned
- education_degree: highest degree (B.E / B.Tech / MBA / MCA / B.Sc / Diploma / 12th)
- passout_year: graduation or passout year as string
- experience_years: total years as number string, use "0" for fresher
- current_company: most recent company name
- current_role: most recent job title
- skills: ALL skills found, comma separated (technical + tools + soft skills)
- domain: ONE of these: Software Development / UI-UX Design / Data Science / Digital Marketing / HR / Finance / Sales / Operations / Education / Other
- linkedin_url: full LinkedIn URL if found, else empty string
- summary: 2 sentence professional summary of the candidate`

async function callGemini(GEMINI_KEY, model, parts) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1000 },
    }),
  })
  return res
}

function parseGeminiResponse(data) {
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  const clean   = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()
  try {
    return JSON.parse(clean)
  } catch {
    return null
  }
}

const FALLBACK = { full_name: 'Unknown', email: '', phone: '', skills: '', experience_years: '0', domain: 'Other', summary: '' }

export async function POST(req) {
  try {
    const body = await req.json()
    const { resumeText, fileBase64, mimeType } = body

    if (!resumeText && !fileBase64) {
      return NextResponse.json({ error: 'No resume text or file provided' }, { status: 400 })
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY
      || process.env.GOOGLE_API_KEY
      || process.env.GOOGLE_GEMINI_API_KEY

    if (!GEMINI_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    // Build parts — prefer base64 file (Gemini reads PDFs natively), else use text
    let parts
    if (fileBase64 && mimeType) {
      parts = [
        { inline_data: { mime_type: mimeType, data: fileBase64 } },
        { text: EXTRACT_PROMPT },
      ]
    } else {
      parts = [{
        text: EXTRACT_PROMPT + `\n\nResume text to extract from:\n${resumeText.substring(0, 4000)}`,
      }]
    }

    // Primary model: gemini-2.0-flash
    const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash']

    for (const model of MODELS) {
      const res = await callGemini(GEMINI_KEY, model, parts)

      if (res.ok) {
        const data    = await res.json()
        const parsed  = parseGeminiResponse(data)
        if (parsed) return NextResponse.json(parsed)
        // JSON parse failed — return fallback
        return NextResponse.json(FALLBACK)
      }

      const errBody = await res.text()
      console.error(`Gemini model ${model} error ${res.status}:`, errBody)

      // Only continue to next model on 404 (model not found)
      if (res.status !== 404) {
        return NextResponse.json(
          { error: `Gemini API error ${res.status}: ${errBody}` },
          { status: 500 }
        )
      }
    }

    // All models returned 404
    return NextResponse.json({ error: 'No available Gemini model found' }, { status: 500 })

  } catch (err) {
    console.error('Extract details error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
