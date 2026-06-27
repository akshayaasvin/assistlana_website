"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { supabase } from "@/lib/supabase";
import { Upload, FileText, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = [".pdf", ".docx", ".doc"];

// Extract text via server-side API (uses pdf-parse for PDF, mammoth for DOCX)
async function extractTextFromFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/extract-resume-text", { method: "POST", body: formData });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text;
}

async function analyzeResume(text) {
  const res = await fetch("/api/analyze-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("Analysis service unavailable.");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}

export default function CandidateResume() {
  const router  = useRouter();
  const fileRef = useRef();
  const [user,      setUser]      = useState(null);
  const [file,      setFile]      = useState(null);
  const [fileError, setFileError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState("");
  const [pastScans, setPastScans] = useState([]);
  const [expanded,  setExpanded]  = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    supabase.from("resume_suggestions").select("*").eq("candidate_email", u.email)
      .order("created_at", { ascending: false }).limit(5)
      .then(({ data }) => setPastScans(data || []));
  }, []);

  const validateAndSetFile = (f) => {
    setFileError("");
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setFileError(`Unsupported file type. Please upload ${ACCEPTED_TYPES.join(", ")}`);
      return;
    }
    const sizeMB = f.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      setFileError(`File too large (${sizeMB.toFixed(1)} MB). Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) { setError("Please select a resume file first."); return; }
    setError(""); setAnalyzing(true); setResult(null);
    try {
      const text = await extractTextFromFile(file);
      const analysis = await analyzeResume(text);
      setResult(analysis);

      if (user) {
        await supabase.from("resume_suggestions").insert([{
          candidate_email: user.email,
          original_text:   text.slice(0, 500),
          suggestions:     analysis,
          ats_score:       analysis.ats_score,
        }]);
        const { data } = await supabase.from("resume_suggestions").select("*")
          .eq("candidate_email", user.email).order("created_at", { ascending: false }).limit(5);
        setPastScans(data || []);

        await supabase.from("candidates").update({ ats_score: analysis.ats_score }).eq("email", user.email);
      }
    } catch (e) {
      setError("Analysis failed: " + e.message);
    }
    setAnalyzing(false);
  };

  const scoreColor = (s) => s >= 70 ? "text-green-600" : s >= 40 ? "text-amber-600" : "text-red-500";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">Resume AI Suggestions</h1>
            <p className="text-sm text-[#64748B]">Upload your resume and get an instant ATS score with AI feedback</p>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left: Upload + Analyze */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
                <h2 className="font-bold text-[#0F172A] mb-4">Upload Your Resume</h2>

                {(error || fileError) && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm">
                    <AlertCircle size={14}/>{error || fileError}
                  </div>
                )}

                <div
                  onClick={() => !analyzing && fileRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    analyzing ? "opacity-60 cursor-not-allowed border-[#E2E8F0]" :
                    file ? "border-[#0D9488] bg-[#F0FDFA]" : "border-[#E2E8F0] hover:border-[#0284C7] hover:bg-[#F0F9FF]"
                  }`}>
                  <input ref={fileRef} type="file" accept=".pdf,.docx,.doc" className="hidden"
                    onChange={e => { if (e.target.files[0]) validateAndSetFile(e.target.files[0]); }}/>
                  <div className="text-4xl mb-3">{file ? "📄" : "☁️"}</div>
                  <div className="font-semibold text-[#0F172A] text-sm mb-1">
                    {file ? file.name : "Click to upload PDF or DOCX"}
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {file ? `${(file.size / 1024).toFixed(0)} KB` : `Supports PDF, DOC, DOCX · Max ${MAX_FILE_SIZE_MB} MB`}
                  </div>
                </div>

                <button onClick={handleAnalyze} disabled={!file || analyzing || !!fileError}
                  className="mt-4 w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
                  {analyzing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Analyzing with AI...
                    </span>
                  ) : "Analyze Resume →"}
                </button>
              </div>

              {/* Past Analyses */}
              {pastScans.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                  <h3 className="font-bold text-[#0F172A] mb-3">Past Analyses</h3>
                  <div className="space-y-2">
                    {pastScans.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <div className="text-xs text-[#64748B]">{new Date(s.created_at).toLocaleDateString()}</div>
                        <span className={`text-sm font-bold ${scoreColor(s.ats_score)}`}>{s.ats_score}/100</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Results */}
            <div>
              {!result && !analyzing && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm text-center h-full flex flex-col items-center justify-center">
                  <div className="text-5xl mb-3">📊</div>
                  <div className="font-bold text-[#0F172A] mb-1">No Analysis Yet</div>
                  <p className="text-sm text-[#64748B]">Upload your resume and click Analyze to get your ATS score and AI feedback.</p>
                </div>
              )}

              {analyzing && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm text-center">
                  <div className="w-16 h-16 border-4 border-[#0284C7]/20 border-t-[#0284C7] rounded-full animate-spin mx-auto mb-4"/>
                  <div className="font-bold text-[#0F172A] mb-1">Analyzing your resume...</div>
                  <p className="text-sm text-[#64748B]">AI is reading your resume and generating feedback</p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  {/* ATS Score */}
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm text-center">
                    <div className="relative w-28 h-28 mx-auto mb-3">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10"/>
                        <circle cx="60" cy="60" r="50" fill="none"
                          stroke={result.ats_score >= 70 ? "#0D9488" : result.ats_score >= 40 ? "#F59E0B" : "#EF4444"}
                          strokeWidth="10"
                          strokeDasharray={`${(result.ats_score / 100) * 314} 314`}
                          strokeLinecap="round"/>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-2xl font-extrabold ${scoreColor(result.ats_score)}`}>{result.ats_score}</span>
                        <span className="text-[10px] text-[#64748B]">ATS Score</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed">{result.overall_feedback}</p>
                  </div>

                  {/* Strengths */}
                  {result.strengths?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                      <h3 className="font-bold text-[#0F172A] mb-3 text-sm">✅ Strengths</h3>
                      <ul className="space-y-1.5">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#64748B]">
                            <CheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5"/>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {result.improvements?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-[#E2E8F0]">
                        <h3 className="font-bold text-[#0F172A] text-sm">🔧 Improvements Needed</h3>
                      </div>
                      <div className="divide-y divide-[#F1F5F9]">
                        {result.improvements.map((imp, i) => (
                          <div key={i} className="p-4">
                            <button
                              onClick={() => setExpanded(p => ({ ...p, [i]: !p[i] }))}
                              className="w-full flex items-center justify-between text-left">
                              <span className="text-sm font-semibold text-[#0F172A]">{imp.section}</span>
                              {expanded[i] ? <ChevronUp size={14} className="text-[#64748B]"/> : <ChevronDown size={14} className="text-[#64748B]"/>}
                            </button>
                            {expanded[i] && (
                              <div className="mt-2 space-y-1.5">
                                <p className="text-xs text-red-600">Issue: {imp.issue}</p>
                                <p className="text-xs text-[#0284C7]">Fix: {imp.suggestion}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {result.missing_keywords?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                      <h3 className="font-bold text-[#0F172A] mb-3 text-sm">🔑 Missing Keywords</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_keywords.map((k, i) => (
                          <span key={i} className="bg-[#FEE2E2] text-[#DC2626] rounded-full px-3 py-1 text-xs font-semibold">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formatting Tips */}
                  {result.formatting_tips?.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
                      <h3 className="font-bold text-[#0F172A] mb-3 text-sm">💡 Formatting Tips</h3>
                      <ul className="space-y-1.5">
                        {result.formatting_tips.map((t, i) => (
                          <li key={i} className="text-xs text-[#64748B] flex items-start gap-2">
                            <span className="text-[#0284C7] font-bold flex-shrink-0">→</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
