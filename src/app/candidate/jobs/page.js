"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { JOBS, CANDIDATES, AI_SUGGESTIONS } from "@/lib/mockData";
import { Search, Bell, X, CheckCircle, Briefcase, Lightbulb } from "lucide-react";

export default function CandidateJobs() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [applied,   setApplied]   = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [showTips,  setShowTips]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [success,   setSuccess]   = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setCandidate(CANDIDATES.find(c => c.email === u.email) || CANDIDATES[0]);
  }, []);

  const handleApply = (jobId) => {
    if (applied.includes(jobId)) return;
    setApplied(prev => [...prev, jobId]);
    setSelected(null);
    setSuccess("✅ Applied successfully! HR team will review your profile.");
    setTimeout(() => setSuccess(""), 4000);
  };

  const filtered = JOBS.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.dept.toLowerCase().includes(search.toLowerCase())
  );

  if (!user || !candidate) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-0">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="text-base md:text-lg font-bold text-[#1E293B]">Browse Jobs</div>
              <div className="text-xs text-slate-400 hidden sm:block">Jobs posted by HR · Apply with one click</div>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl flex-shrink-0 md:hidden">
              <Bell size={16} className="text-slate-500"/>
            </button>
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-3 py-2 flex-1 md:flex-none">
              <Search size={14} className="text-slate-400"/>
              <input placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none w-full md:w-40 text-slate-600"/>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl hidden md:flex">
              <Bell size={16} className="text-slate-500"/>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <CheckCircle size={16}/>{success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filtered.map((job,i) => {
              const isApplied = applied.includes(job.id);
              const match = candidate.jd_match - (i * 3);
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase size={18} className="text-[#1253A4]"/>
                    </div>
                    <span className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-full font-bold">
                      {match}% match
                    </span>
                  </div>

                  <div className="font-bold text-[#1E293B] mb-1 text-sm md:text-base">{job.title}</div>
                  <div className="text-xs text-slate-400 mb-2">{job.dept} · {job.exp} · {job.posted}</div>
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{job.desc}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills.slice(0,3).map(s => (
                      <span key={s} className="text-xs bg-[#F1F5F9] text-slate-600 px-2 py-0.5 rounded-md">{s}</span>
                    ))}
                  </div>

                  {/* Match bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Your JD Match</span>
                      <span className="font-bold text-[#0EA5C9]">{match}%</span>
                    </div>
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0EA5C9] rounded-full" style={{ width:`${match}%` }}/>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setSelected(job)}
                      className="flex-1 py-2 border border-[#E2E8F0] rounded-xl text-xs font-semibold text-slate-600 hover:bg-[#F1F5F9] transition-all">
                      View Details
                    </button>
                    <button onClick={() => setShowTips(job)}
                      className="p-2 bg-[#FFF7ED] text-[#F59E0B] rounded-xl hover:bg-[#FEF3C7] transition-all"
                      title="AI Tips">
                      <Lightbulb size={14}/>
                    </button>
                    <button onClick={() => handleApply(job.id)} disabled={isApplied}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isApplied
                          ? "bg-green-100 text-green-700 cursor-not-allowed"
                          : "bg-[#1253A4] text-white hover:bg-[#0d47a1]"
                      }`}>
                      {isApplied ? "✅ Applied" : "Apply Now"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D3A] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="text-white font-bold truncate pr-2">{selected.title}</div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white flex-shrink-0"><X size={18}/></button>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs bg-[#EFF6FF] text-[#1253A4] px-3 py-1 rounded-full font-semibold">{selected.dept}</span>
                <span className="text-xs bg-[#F0FDF4] text-[#10B981] px-3 py-1 rounded-full font-semibold">{selected.exp}</span>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">{selected.status}</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">{selected.desc}</p>
              <div className="mb-4">
                <div className="text-sm font-bold text-slate-600 mb-2">Required Skills</div>
                <div className="flex flex-wrap gap-1">
                  {selected.skills.map(s => (
                    <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-md font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-[#EFF6FF] rounded-xl text-sm text-[#1253A4] mb-4">
                🎯 Your match score for this role: <strong>{candidate.jd_match}%</strong>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setSelected(null)}
                  className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-slate-500">
                  Close
                </button>
                <button onClick={() => handleApply(selected.id)}
                  disabled={applied.includes(selected.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    applied.includes(selected.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-[#1253A4] text-white hover:bg-[#0d47a1]"
                  }`}>
                  {applied.includes(selected.id) ? "✅ Already Applied" : "Apply Now →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#F59E0B] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="text-white font-bold text-sm truncate pr-2">🤖 AI Tips for {showTips.title}</div>
              <button onClick={() => setShowTips(null)} className="text-white/70 hover:text-white flex-shrink-0"><X size={18}/></button>
            </div>
            <div className="p-4 md:p-6">
              <p className="text-sm text-slate-500 mb-4">To improve your match for this role:</p>
              <div className="space-y-3">
                {AI_SUGGESTIONS.map((s,i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE68A]">
                    <span className="text-[#F59E0B] font-bold text-sm flex-shrink-0">{i+1}.</span>
                    <span className="text-sm text-slate-600">{s}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowTips(null); router.push("/candidate/resume"); }}
                className="mt-4 w-full py-2.5 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all">
                Update My Resume →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}