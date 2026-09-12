import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  try {
    const { question, answer, language } = await request.json();

    if (!question || !answer) {
      return NextResponse.json({ score: 0, feedback: "Question and answer are required." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(scoreAnswerLocally(question, answer), { status: 200 });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are a professional interview coach. Score this interview answer from 0-100.

Scoring criteria:
- Relevance to the question (40%): Does the answer actually address what was asked?
- Communication quality (20%): Is it clear, articulate, and well-expressed?
- Grammar and language (20%): Correct grammar, professional tone?
- Completeness (20%): Is the answer thorough enough without being padded?

IMPORTANT: Long, rambling answers should NOT automatically score high. Short, precise, relevant answers can score higher than long irrelevant ones.

Language: ${language || "English"}
Question: ${question}
Answer: ${answer}

Return ONLY valid JSON with no markdown or extra text:
{"score": <integer 0-100>, "feedback": "<one sentence of specific, actionable feedback>"}`;

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

    return NextResponse.json(scoreAnswerLocally(question, answer), { status: 200 });
  } catch {
    return NextResponse.json({ error: "Scoring failed." }, { status: 500 });
  }
}

function scoreAnswerLocally(question, answer) {
  const q = question.toLowerCase();
  const a = answer.toLowerCase().trim();

  if (!a || a.length < 5) {
    return { score: 5, feedback: "No meaningful answer provided — please elaborate on your response." };
  }

  const words = a.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const qWords = q.split(/\s+/).filter(w => w.length > 4);
  const relevantHits = qWords.filter(w => a.includes(w)).length;
  const relevanceRatio = qWords.length > 0 ? relevantHits / qWords.length : 0;

  const hasSpecifics = /\d+|example|specifically|because|result|achieved|improved|%|years|months|project|team/.test(a);
  const hasSentenceStructure = (a.match(/[.!?]/g) || []).length >= 2;
  const hasFillers = (a.match(/\b(um|uh|like|basically|just|kind of|sort of|you know|i mean)\b/g) || []).length;
  const isPureNonsense = wordCount > 5 && relevantHits === 0 && !hasSpecifics;

  let lengthScore = 0;
  if (wordCount >= 30 && wordCount <= 200) lengthScore = 20;
  else if (wordCount >= 15) lengthScore = 10;
  else if (wordCount < 10) lengthScore = -5;
  else if (wordCount > 300) lengthScore = 5;

  let score = 15;
  score += Math.round(relevanceRatio * 35);
  if (hasSpecifics)       score += 20;
  if (hasSentenceStructure) score += 15;
  score += lengthScore;
  if (hasFillers > 3)     score -= 8;
  if (isPureNonsense)     score  = Math.min(score, 20);

  score = Math.min(82, Math.max(5, score));

  let feedback = "";
  if (score >= 70) feedback = "Strong answer — clear, relevant, and well-structured.";
  else if (score >= 50) feedback = "Decent answer; add specific examples or measurable results to strengthen it.";
  else if (score >= 30) feedback = "Answer is too vague or off-topic — focus directly on what the question asks.";
  else feedback = "Answer lacks relevance and detail — address the question directly with concrete examples.";

  return { score, feedback };
}
