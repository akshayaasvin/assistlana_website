import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Resume text is required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(buildFallbackAnalysis(text), { status: 200 });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an expert ATS resume reviewer. Analyze the resume text and return ONLY valid JSON with no markdown, no code blocks, no extra text.

Return exactly this JSON structure:
{
  "ats_score": <integer 0-100>,
  "overall_feedback": "<2-3 sentence summary>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "improvements": [{"section":"<section>","issue":"<issue>","suggestion":"<fix>"}],
  "missing_keywords": ["<keyword1>","<keyword2>","<keyword3>"],
  "formatting_tips": ["<tip1>","<tip2>"]
}

Score strictly on:
- Contact info present (name, email, phone): 10pts
- Skills section with tech keywords: 25pts
- Work experience with quantified results: 20pts
- Education section: 15pts
- Industry keywords coverage: 20pts
- Formatting (clear sections, bullets): 10pts

Resume text:
${text.slice(0, 6000)}`;

      const result = await model.generateContent(prompt);
      const raw = result.response.text();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      }
    } catch {
      // fall through to local fallback
    }

    return NextResponse.json(buildFallbackAnalysis(text), { status: 200 });
  } catch {
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}

function buildFallbackAnalysis(text) {
  const lower = text.toLowerCase();
  let score = 0;

  const hasEmail = /@\w+\.\w+/.test(text);
  const hasPhone = /(\+?\d[\d\s\-]{8,})/.test(text);
  const hasName  = text.trim().split("\n")[0].trim().length > 2;
  if (hasEmail) score += 4;
  if (hasPhone) score += 3;
  if (hasName)  score += 3;

  const techKeywords = ["javascript","python","java","react","node","sql","aws","docker","kubernetes","git","typescript","css","html","api","cloud","machine learning","tensorflow","pytorch"];
  const foundTech = techKeywords.filter(k => lower.includes(k));
  score += Math.min(25, foundTech.length * 4);

  const hasExperience = /experience|work history|employment|worked at|company|organization/.test(lower);
  const hasQuantified = /\d+%|\d+ years|\d+ months|improved|increased|reduced|saved|\$\d+/.test(lower);
  if (hasExperience) score += 12;
  if (hasQuantified) score += 8;

  const hasEducation = /education|university|college|degree|bachelor|master|b\.tech|m\.tech|b\.e|mba/.test(lower);
  if (hasEducation) score += 15;

  const softKeywords = ["communication","leadership","teamwork","problem solving","agile","scrum","project management"];
  const foundSoft = softKeywords.filter(k => lower.includes(k));
  score += Math.min(20, foundSoft.length * 4);

  const lineCount = text.split("\n").filter(l => l.trim()).length;
  if (lineCount >= 15) score += 5;
  if (lineCount >= 30) score += 5;

  score = Math.min(95, Math.max(20, score));

  const strengths = [];
  if (hasEmail && hasPhone) strengths.push("Contact information is present and complete");
  if (foundTech.length > 3) strengths.push(`Strong technical skills: ${foundTech.slice(0, 3).join(", ")}`);
  if (hasExperience)        strengths.push("Work experience section is included");
  if (hasEducation)         strengths.push("Education section is clearly listed");
  if (strengths.length === 0) strengths.push("Resume has basic structure");

  const improvements = [];
  if (!hasQuantified) improvements.push({ section:"Experience", issue:"Missing quantified achievements", suggestion:"Add metrics like 'Improved performance by 30%' or 'Managed team of 5'." });
  if (!lower.includes("summary") && !lower.includes("objective")) improvements.push({ section:"Summary", issue:"No professional summary found", suggestion:"Add a 2-3 sentence professional summary at the top." });
  if (foundSoft.length < 2) improvements.push({ section:"Skills", issue:"Limited soft skills mentioned", suggestion:"Add keywords like communication, leadership, agile, or teamwork." });

  return {
    ats_score: score,
    overall_feedback: score >= 70
      ? "Your resume is well-structured with good technical content. Focus on quantifying achievements to further improve your ATS score."
      : "Your resume needs improvement. Add more industry keywords, quantify your achievements, and ensure all key sections are present.",
    strengths,
    improvements,
    missing_keywords: techKeywords.filter(k => !lower.includes(k)).slice(0, 5),
    formatting_tips: [
      "Use consistent bullet points throughout",
      "Keep resume to 1-2 pages maximum",
      "Use standard section headings: Summary, Experience, Education, Skills",
      "Use a clean, single-column format for better ATS parsing",
    ],
  };
}
