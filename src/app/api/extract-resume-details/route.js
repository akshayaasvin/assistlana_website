import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { resumeText } = await req.json()

    if (!resumeText) {
      return NextResponse.json({ error: 'No resume text provided' }, { status: 400 })
    }

    const GEMINI_KEY = process.env.GEMINI_API_KEY
      || process.env.GOOGLE_API_KEY
      || process.env.GOOGLE_GEMINI_API_KEY

    if (!GEMINI_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Extract information from this resume and return ONLY a valid JSON object. No markdown, no backticks, no explanation. Just raw JSON.

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
- summary: 2 sentence professional summary of the candidate

Resume text to extract from:
${resumeText.substring(0, 4000)}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000
          }
        })
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API error:', errText)
      return NextResponse.json({ error: 'Gemini API failed: ' + errText }, { status: 500 })
    }

    const geminiData = await response.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

    const cleanText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim()

    let extracted = {}
    try {
      extracted = JSON.parse(cleanText)
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr, 'Raw:', cleanText)
      extracted = {
        full_name: 'Unknown',
        email: '',
        phone: '',
        skills: '',
        experience_years: '0',
        domain: 'Other',
        summary: ''
      }
    }

    return NextResponse.json(extracted)
  } catch (err) {
    console.error('Extract details error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
