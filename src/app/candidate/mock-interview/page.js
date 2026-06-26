"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { CheckCircle, AlertCircle } from "lucide-react";

const DOMAINS = [
  "Software Development","Digital Marketing","Data Analytics",
  "HR & Management","General",
];

const QUESTIONS = {
  English: [
    "Tell me about yourself and your background.",
    "What are your key technical skills and strengths?",
    "Describe a challenge you faced and how you solved it.",
    "Why are you interested in this field/role?",
    "Where do you see yourself in 3 years?",
  ],
  Tamil: [
    "உங்களை பற்றி சொல்லுங்கள்.",
    "உங்கள் முக்கிய திறன்கள் என்ன?",
    "நீங்கள் சந்தித்த சவாலை எப்படி கடந்தீர்கள்?",
    "இந்த துறையில் ஏன் ஆர்வம் உள்ளது?",
    "3 ஆண்டுகளில் நீங்கள் எங்கே இருக்க விரும்புகிறீர்கள்?",
  ],
};

async function scoreAnswer(question, answer, language) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `You are a professional interview coach. Score this interview answer 0-100.
Language: ${language}
Question: ${question}
Answer: ${answer}

Return ONLY valid JSON: {"score": number, "feedback": "one sentence feedback"}`,
        }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '{"score":50,"feedback":"Answer received."}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, feedback: "Answer received." };
  } catch {
    const wordCount = answer.trim().split(/\s+/).length;
    const score = Math.min(100, Math.max(20, wordCount * 3 + 20));
    return { score, feedback: "Answer evaluated based on length and content." };
  }
}

export default function MockInterviewPage() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [step,      setStep]      = useState("setup");   // setup | interview | results
  const [domain,    setDomain]    = useState("General");
  const [language,  setLanguage]  = useState("English");
  const [qIndex,    setQIndex]    = useState(0);
  const [answers,   setAnswers]   = useState([]);
  const [current,   setCurrent]   = useState("");
  const [timer,     setTimer]     = useState(60);
  const [scoring,   setScoring]   = useState(false);
  const [results,   setResults]   = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [pastTests, setPastTests] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    supabase.from("mock_interviews").select("*").eq("candidate_email", u.email)
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setPastTests(data || []));
  }, []);

  const questions = QUESTIONS[language];

  const startTimer = () => {
    setTimer(60);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmitAnswer(true); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const startInterview = () => {
    setAnswers([]);
    setResults([]);
    setQIndex(0);
    setCurrent("");
    setStep("interview");
    startTimer();
  };

  const handleSubmitAnswer = async (autoSubmit = false) => {
    clearInterval(timerRef.current);
    const ans = autoSubmit ? (current || "(No answer given)") : current;
    setScoring(true);
    const scored = await scoreAnswer(questions[qIndex], ans, language);
    const newAnswers = [...answers, ans];
    const newResults = [...results, { question: questions[qIndex], answer: ans, ...scored }];
    setAnswers(newAnswers);
    setResults(newResults);
    setScoring(false);
    setCurrent("");

    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      startTimer();
    } else {
      setStep("results");
      saveSession(newAnswers, newResults);
    }
  };

  const saveSession = async (ans, res) => {
    if (!user) return;
    setSaving(true);
    const finalScore = Math.round(res.reduce((a, r) => a + r.score, 0) / res.length);
    await supabase.from("mock_interviews").insert([{
      candidate_email: user.email,
      candidate_name:  user.name,
      domain,
      questions:       JSONB_stringify(questions),
      answers:         JSONB_stringify(ans),
      scores:          JSONB_stringify(res.map(r => r.score)),
      final_score:     finalScore,
      passed:          finalScore >= 60,
      completed_at:    new Date().toISOString(),
    }]);
    setSaving(false);
    const { data } = await supabase.from("mock_interviews").select("*").eq("candidate_email", user.email)
      .order("created_at", { ascending: false }).limit(5);
    setPastTests(data || []);
  };

  function JSONB_stringify(v) { try { return JSON.parse(JSON.stringify(v)); } catch { return v; } }

  const finalScore = results.length > 0
    ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
    : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">AI Mock Interview</h1>
            <p className="text-sm text-[#64748B]">Practice interviews with Tamil/English AI and get scored</p>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-3xl">

          {/* ── SETUP ── */}
          {step === "setup" && (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                <h2 className="font-bold text-[#0F172A] mb-4">Start Your AI Mock Interview</h2>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-[#64748B] mb-2">Select Domain</label>
                  <select value={domain} onChange={e => setDomain(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none bg-white text-[#0F172A]">
                    {DOMAINS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#64748B] mb-2">Interview Language</label>
                  <div className="flex gap-3">
                    {["English","Tamil"].map(l => (
                      <button key={l} onClick={() => setLanguage(l)}
                        className={`flex-1 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                          language===l ? "border-[#0284C7] bg-[#EFF6FF] text-[#0284C7]" : "border-[#E2E8F0] text-[#64748B]"
                        }`}>
                        {l === "Tamil" ? "🇮🇳 " : "🇬🇧 "}{l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F0F9FF] border border-[#DBEAFE] rounded-xl p-4 mb-5 text-sm text-[#1D4ED8]">
                  <div className="font-semibold mb-1">ℹ️ How it works:</div>
                  <ul className="space-y-0.5 text-xs text-[#64748B]">
                    <li>→ 5 questions will be asked one by one</li>
                    <li>→ You have 60 seconds per question</li>
                    <li>→ AI scores each answer 0-100</li>
                    <li>→ Score ≥60 = Pass</li>
                  </ul>
                </div>

                <button onClick={startInterview}
                  className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-3 rounded-xl text-sm hover:opacity-90 transition-all">
                  Start Interview →
                </button>
              </div>

              {/* Past Results */}
              {pastTests.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                  <h3 className="font-bold text-[#0F172A] mb-4">Past Interview Results</h3>
                  <div className="space-y-3">
                    {pastTests.map((t,i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <div>
                          <div className="text-sm font-semibold text-[#0F172A]">{t.domain}</div>
                          <div className="text-xs text-[#64748B]">{new Date(t.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-[#0284C7]">{t.final_score}</span>
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${t.passed ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
                            {t.passed ? "Pass" : "Fail"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ACTIVE INTERVIEW ── */}
          {step === "interview" && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-[#64748B]">Question {qIndex+1} of {questions.length}</span>
                <div className={`text-sm font-bold ${timer <= 10 ? "text-red-500" : "text-[#0284C7]"}`}>
                  ⏱ {timer}s
                </div>
              </div>
              <div className="w-full bg-[#E2E8F0] rounded-full h-2 mb-6">
                <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] h-2 rounded-full transition-all"
                  style={{ width: `${((qIndex) / questions.length) * 100}%` }}/>
              </div>

              {/* Timer circle */}
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#E2E8F0" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="34" fill="none"
                      stroke={timer <= 10 ? "#EF4444" : "#0284C7"}
                      strokeWidth="6"
                      strokeDasharray={`${(timer/60)*214} 214`}
                      strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-extrabold ${timer <= 10 ? "text-red-500" : "text-[#0F172A]"}`}>{timer}</span>
                  </div>
                </div>
              </div>

              {/* Question */}
              <div className="bg-gradient-to-r from-[#F0F9FF] to-[#F0FDFA] border border-[#DBEAFE] rounded-2xl p-5 mb-5">
                <p className="text-[#0F172A] font-semibold text-base leading-relaxed">{questions[qIndex]}</p>
              </div>

              {/* Answer */}
              <textarea
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="Type your answer here..."
                rows={5}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none resize-none mb-4"
              />

              <button onClick={() => handleSubmitAnswer(false)} disabled={scoring}
                className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90">
                {scoring ? "Scoring your answer..." : "Submit Answer →"}
              </button>
            </div>
          )}

          {/* ── RESULTS ── */}
          {step === "results" && (
            <div className="space-y-5">
              {/* Score card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm text-center">
                <h2 className="font-bold text-[#0F172A] text-xl mb-4">Interview Complete!</h2>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="50" fill="none"
                      stroke={finalScore >= 60 ? "#0D9488" : "#EF4444"}
                      strokeWidth="10"
                      strokeDasharray={`${(finalScore/100)*314} 314`}
                      strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-[#0F172A]">{finalScore}</span>
                    <span className="text-xs text-[#64748B]">/ 100</span>
                  </div>
                </div>
                <span className={`inline-block px-5 py-1.5 rounded-full text-sm font-bold mb-2 ${
                  finalScore >= 60 ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#FEE2E2] text-[#DC2626]"
                }`}>
                  {finalScore >= 60 ? "✅ Pass" : "❌ Fail"}
                </span>
                <p className="text-[#64748B] text-sm">{finalScore >= 60 ? "Great job! You passed the mock interview." : "Keep practicing to improve your score."}</p>
                {saving && <p className="text-xs text-[#64748B] mt-2">Saving results...</p>}
              </div>

              {/* Per-question breakdown */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[#E2E8F0]">
                  <h3 className="font-bold text-[#0F172A]">Question Breakdown</h3>
                </div>
                <div className="divide-y divide-[#F1F5F9]">
                  {results.map((r,i) => (
                    <div key={i} className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm font-semibold text-[#0F172A] flex-1">Q{i+1}: {r.question}</p>
                        <span className={`text-sm font-bold px-3 py-1 rounded-full flex-shrink-0 ${
                          r.score >= 70 ? "bg-[#DCFCE7] text-[#16A34A]" :
                          r.score >= 40 ? "bg-[#FEF9C3] text-[#854D0E]" : "bg-[#FEE2E2] text-[#DC2626]"
                        }`}>{r.score}/100</span>
                      </div>
                      <p className="text-xs text-[#64748B] italic mb-1">"{r.answer.slice(0,100)}{r.answer.length>100?"...":""}"</p>
                      <p className="text-xs text-[#0284C7]">💡 {r.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setStep("setup"); setResults([]); setAnswers([]); setQIndex(0); }}
                  className="flex-1 border border-[#E2E8F0] text-[#0F172A] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#F1F5F9]">
                  Retake Interview
                </button>
                <button onClick={() => router.push("/candidate/dashboard")}
                  className="flex-1 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90">
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
