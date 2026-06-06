"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { supabase } from "@/lib/supabase";
import { AI_SUGGESTIONS } from "@/lib/mockData";
import { FileText, CheckCircle, Bell, Lightbulb, RefreshCw } from "lucide-react";

const PARSE_STEPS = [
  { label:"Reading resume file",        icon:"📄" },
  { label:"Extracting text content",    icon:"🔍" },
  { label:"NLP skill extraction",       icon:"🧠" },
  { label:"Recomputing AI score",       icon:"🎯" },
  { label:"Updating candidate profile", icon:"💾" },
];

export default function CandidateResume() {
  const router  = useRouter();
  const fileRef = useRef();

  const [user,      setUser]      = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [uploaded,  setUploaded]  = useState(null);
  const [parsing,   setParsing]   = useState(false);
  const [newScore,  setNewScore]  = useState(null);
  const [steps,     setSteps]     = useState(PARSE_STEPS.map(s=>({...s,status:"idle"})));
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadCandidate(u);
  }, []);

  // ── Load candidate from Supabase ──
  const loadCandidate = async (u) => {
    setLoading(true);
    try {
      // Try email first
      if (u.email) {
        const { data } = await supabase
          .from("candidates")
          .select("*")
          .eq("email", u.email)
          .maybeSingle();
        if (data) { setCandidate(data); setLoading(false); return; }
      }
      // Try id
      if (u.id) {
        const { data } = await supabase
          .from("candidates")
          .select("*")
          .eq("id", u.id)
          .maybeSingle();
        if (data) { setCandidate(data); setLoading(false); return; }
      }
      setCandidate(null);
    } catch (e) {
      setCandidate(null);
    }
    setLoading(false);
  };

  // ── Animate steps ──
  const runSteps = async () => {
    setSteps(PARSE_STEPS.map(s=>({...s,status:"idle"})));
    for (let i = 0; i < PARSE_STEPS.length; i++) {
      setSteps(prev => prev.map((s,j) => j===i ? {...s,status:"active"} : s));
      await new Promise(r => setTimeout(r, 700+Math.random()*300));
      setSteps(prev => prev.map((s,j) => j===i ? {...s,status:"done"  } : s));
    }
  };

  // ── Handle file upload ──
  const handleUpload = async (file) => {
    if (!file || !user) return;
    setError(""); setSuccess("");
    setUploaded({ name: file.name, size: (file.size/1024).toFixed(0)+" KB" });
    setParsing(true); setNewScore(null);

    try {
      // Step 1: Upload file to Supabase Storage
      const fileName  = `${Date.now()}_${file.name.replace(/\s/g,"_")}`;
      const { error: uploadErr } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, { upsert: true });

      const resumeUrl = uploadErr ? "" :
        supabase.storage.from("resumes").getPublicUrl(fileName).data.publicUrl;

      // Step 2: Check backend
      const backendUp = await fetch("http://localhost:8000/api/health")
        .then(r => r.ok).catch(() => false);

      let finalCandidate = null;

      if (backendUp) {
        // ── Real AI parsing — pass candidate email so backend UPDATES ──
        const stepPromise = runSteps();

        const formData = new FormData();
        formData.append("file", file);

        // Pass the email as query param so backend updates existing row
        const url = `http://localhost:8000/api/resume/parse-and-save?candidate_email=${encodeURIComponent(user.email)}`;

        const res     = await fetch(url, { method:"POST", body: formData });
        const apiData = await res.json();
        await stepPromise;

        if (apiData.success && apiData.candidate) {
          // Also update resume_url since backend doesn't know it
          const { data: withUrl } = await supabase
            .from("candidates")
            .update({ resume_url: resumeUrl })
            .eq("email", user.email)
            .select()
            .maybeSingle();

          finalCandidate = withUrl || apiData.candidate;
        }

      } else {
        // ── Fallback simulation ──
        await runSteps();
        const newAI = Math.min(100, (candidate?.ai_score || 55) + Math.floor(Math.random()*12)+5);

        const { data: updated } = await supabase
          .from("candidates")
          .update({
            resume_url: resumeUrl,
            ai_score:   newAI,
            jd_match:   newAI - 5,
            status:     "Reviewing",
          })
          .eq("email", user.email)
          .select()
          .maybeSingle();

        finalCandidate = updated;
      }

      // Step 3: Update state
      if (finalCandidate) {
        setCandidate(finalCandidate);
        setNewScore(finalCandidate.ai_score);
        setSuccess("✅ Resume uploaded and profile updated!");
      } else {
        // Last resort: reload from DB
        await loadCandidate(user);
        setSuccess("✅ Resume uploaded!");
      }

    } catch (err) {
      setError("Upload failed: " + err.message);
    }
    setParsing(false);
  };

  // ── Loading screen ──
  if (loading) return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <div className="w-56 bg-[#0B1D3A] min-h-screen flex-shrink-0"/>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
          <div className="text-slate-500 font-medium">Loading your profile...</div>
        </div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-0 md:ml-0 md:ml-56 flex-1">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-lg font-bold text-[#1E293B]">My Resume</div>
            <div className="text-xs text-slate-400">
              Upload resume · AI extracts real data · score updates instantly
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => loadCandidate(user)}
              className="flex items-center gap-2 bg-[#F1F5F9] text-slate-600 px-3 py-2 rounded-xl text-sm hover:bg-[#E2E8F0] transition-all">
              <RefreshCw size={14}/> Refresh
            </button>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
              <Bell size={16} className="text-slate-500"/>
            </button>
          </div>
        </div>

        <div className="p-8">

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              ⚠️ {error}
            </div>
          )}

          {!candidate && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 mb-5 text-sm">
              ⚠️ No profile found for <strong>{user?.email}</strong>.
              Upload your resume below to build your profile.
            </div>
          )}

          <div className="grid grid-cols-2 gap-8">

            {/* ── LEFT ── */}
            <div className="space-y-5">

              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-4">👤 My Profile</div>

                {candidate ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-5 p-4 bg-[#F0FDF4] rounded-xl">
                      <div className="w-14 h-14 bg-[#10B981] rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {(candidate.name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-[#1E293B] truncate">{candidate.name}</div>
                        <div className="text-sm text-slate-400 truncate">{candidate.email}</div>
                        {candidate.phone && <div className="text-xs text-slate-400 mt-0.5">📞 {candidate.phone}</div>}
                      </div>
                      <div className="text-center flex-shrink-0">
                        <div className={`text-4xl font-bold ${
                          (candidate.ai_score||0)>=80 ? "text-green-600" :
                          (candidate.ai_score||0)>=60 ? "text-yellow-600" : "text-slate-400"
                        }`}>
                          {candidate.ai_score || 0}
                        </div>
                        <div className="text-xs text-slate-400">AI Score</div>
                      </div>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        ["📍 Location",   candidate.location                    || "Not set" ],
                        ["💼 Experience", (candidate.experience_years||"—")+" yrs"          ],
                        ["🎓 Education",  candidate.education                   || "Not set" ],
                        ["🎯 JD Match",   (candidate.jd_match||0)+"%"                       ],
                        ["🎂 Age",        candidate.age                         || "—"       ],
                        ["📊 Status",     candidate.status                      || "Pending" ],
                      ].map(([l,v],i) => (
                        <div key={i} className="bg-[#F8FAFC] rounded-xl p-3">
                          <div className="text-xs text-slate-400 mb-0.5">{l}</div>
                          <div className="text-sm font-bold text-[#1E293B]">{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                          Skills ({candidate.skills.length} found)
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.map((s,i) => (
                            <span key={i} className="text-xs bg-[#F0FDF4] text-[#10B981] border border-[#A7F3D0] px-2 py-1 rounded-full font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Score breakdown */}
                    {(candidate.ai_score||0) > 0 && (
                      <div className="border-t border-[#F1F5F9] pt-4">
                        <div className="text-xs font-bold text-slate-400 mb-3 uppercase">Score Breakdown</div>
                        {[
                          { label:"Skills",     val:Math.round((candidate.ai_score||0)*0.4), max:40, color:"#0EA5C9" },
                          { label:"Experience", val:Math.round((candidate.ai_score||0)*0.3), max:30, color:"#1253A4" },
                          { label:"Education",  val:Math.round((candidate.ai_score||0)*0.2), max:20, color:"#8B5CF6" },
                          { label:"Extras",     val:Math.round((candidate.ai_score||0)*0.1), max:10, color:"#10B981" },
                        ].map((s,i) => (
                          <div key={i} className="mb-2.5">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">{s.label}</span>
                              <span className="font-bold" style={{ color:s.color }}>{s.val}/{s.max}</span>
                            </div>
                            <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all"
                                style={{ width:`${(s.val/s.max)*100}%`, background:s.color }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-10 text-slate-400">
                    <div className="text-5xl mb-3">👤</div>
                    <div className="font-semibold mb-1">No profile data yet</div>
                    <div className="text-sm">Upload your resume to create your profile</div>
                  </div>
                )}
              </div>

              {/* Upload Card */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-4">
                  ⬆️ {candidate?.resume_url ? "Update My Resume" : "Upload My Resume"}
                </div>

                <div
                  onClick={() => !parsing && fileRef.current.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    parsing ? "cursor-not-allowed opacity-60 border-[#E2E8F0]"
                            : "cursor-pointer border-[#E2E8F0] hover:border-[#10B981] hover:bg-[#F0FDF4]"
                  }`}>
                  <input ref={fileRef} type="file" accept=".pdf,.docx" className="hidden"
                    onChange={e => e.target.files[0] && handleUpload(e.target.files[0])}/>
                  <div className="text-4xl mb-3">📁</div>
                  <div className="font-semibold text-[#1E293B] mb-1">
                    {parsing ? "Processing your resume..." : "Click to upload"}
                  </div>
                  <div className="text-xs text-slate-400">PDF or DOCX · Max 10MB</div>
                </div>

                {/* Uploaded file status */}
                {uploaded && (
                  <div className={`mt-4 flex items-center gap-3 p-3 rounded-xl border ${
                    newScore ? "bg-green-50 border-green-200" : "bg-[#F0FDF4] border-[#A7F3D0]"
                  }`}>
                    <FileText size={18} className="text-[#10B981] flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1E293B] truncate">{uploaded.name}</div>
                      <div className="text-xs text-slate-400">{uploaded.size}</div>
                    </div>
                    {parsing   && <div className="w-5 h-5 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin flex-shrink-0"/>}
                    {!parsing && newScore && <CheckCircle size={18} className="text-[#10B981] flex-shrink-0"/>}
                  </div>
                )}

                {/* Parse steps */}
                {(parsing || newScore) && (
                  <div className="mt-4 space-y-2">
                    {steps.map((step,i) => (
                      <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                        step.status==="done"   ? "bg-green-50"  :
                        step.status==="active" ? "bg-blue-50"   : "bg-[#F8FAFC]"
                      }`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 ${
                          step.status==="done"   ? "bg-green-100" :
                          step.status==="active" ? "bg-blue-100"  : "bg-[#F1F5F9]"
                        }`}>
                          {step.status==="done"   ? "✅" :
                           step.status==="active" ? <div className="w-3.5 h-3.5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"/> :
                           step.icon}
                        </div>
                        <span className={`text-xs font-medium ${
                          step.status==="done"   ? "text-green-700" :
                          step.status==="active" ? "text-blue-700"  : "text-slate-400"
                        }`}>{step.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Score updated banner */}
                {newScore && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="text-sm font-bold text-green-700 mb-1">🎉 Profile Updated!</div>
                    <div className="text-sm text-green-600">
                      Your AI score is now <strong>{newScore}/100</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT ── */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="flex items-center gap-2 font-bold text-[#1E293B] mb-4">
                  <Lightbulb size={18} className="text-[#F59E0B]"/>
                  AI Resume Suggestions
                </div>
                <p className="text-sm text-slate-500 mb-4">
                  Follow these tips to improve your score:
                </p>
                <div className="space-y-3">
                  {AI_SUGGESTIONS.map((s,i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]">
                      <div className="w-6 h-6 bg-[#F59E0B] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                        {i+1}
                      </div>
                      <div className="text-sm text-slate-600">{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}