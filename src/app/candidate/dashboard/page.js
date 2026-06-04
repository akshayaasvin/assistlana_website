"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { CANDIDATES, JOBS, APPLICATIONS, AI_SUGGESTIONS } from "@/lib/mockData";
import { Bell, Search, ArrowRight } from "lucide-react";

export default function CandidateDashboard() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    const found = CANDIDATES.find(c => c.email === u.email) || CANDIDATES[0];
    setCandidate(found);
  }, []);

  if (!user || !candidate) return null;

  const myApplications = APPLICATIONS.filter(a => a.candidateId === candidate.id);
  const scoreBreakdown = [
    { label:"Skills Match", val: Math.round(candidate.score*0.4), max:40, color:"#0EA5C9" },
    { label:"Experience",   val: Math.round(candidate.score*0.3), max:30, color:"#1253A4" },
    { label:"Education",    val: Math.round(candidate.score*0.2), max:20, color:"#8B5CF6" },
    { label:"Extras",       val: Math.round(candidate.score*0.1), max:10, color:"#10B981" },
  ];

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <CandidateSidebar user={user}/>
      <div className="ml-56 flex-1">
        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-lg font-bold text-[#1E293B]">My Dashboard</div>
            <div className="text-xs text-slate-400">Welcome back, {user.name}!</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-4 py-2">
              <Search size={14} className="text-slate-400"/>
              <input placeholder="Search jobs..." className="bg-transparent text-sm outline-none w-32 text-slate-600"/>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
              <Bell size={16} className="text-slate-500"/>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* Top row */}
          <div className="grid grid-cols-3 gap-6 mb-8">

            {/* Score Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 col-span-1">
              <div className="text-sm font-bold text-slate-500 mb-4">Your AI Score</div>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#10B981" strokeWidth="10"
                      strokeDasharray={`${(candidate.score/100)*314} 314`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold text-[#1E293B]">{candidate.score}</div>
                    <div className="text-xs text-slate-400">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {scoreBreakdown.map((s,i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="font-bold" style={{ color:s.color }}>{s.val}/{s.max}</span>
                    </div>
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width:`${(s.val/s.max)*100}%`, background:s.color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="col-span-2 grid grid-cols-2 gap-4">
              {[
                { label:"Jobs Applied",    val: myApplications.length, color:"#1253A4", icon:"📋" },
                { label:"Shortlisted",     val: myApplications.filter(a=>a.status==="Shortlisted").length, color:"#10B981", icon:"⭐" },
                { label:"JD Match Score",  val: candidate.jd_match+"%", color:"#0EA5C9", icon:"🎯" },
                { label:"Active Jobs",     val: JOBS.filter(j=>j.status==="Active").length, color:"#8B5CF6", icon:"💼" },
              ].map((s,i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className="text-2xl font-bold mb-1" style={{ color:s.color }}>{s.val}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}

              {/* Quick Actions */}
              <div className="col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <div className="text-sm font-bold text-slate-600 mb-3">Quick Actions</div>
                <div className="flex gap-3">
                  {[
                    { label:"Browse Jobs",      href:"/candidate/jobs",         color:"#1253A4" },
                    { label:"Update Resume",    href:"/candidate/resume",       color:"#10B981" },
                    { label:"My Applications",  href:"/candidate/applications", color:"#8B5CF6" },
                  ].map((a,i) => (
                    <button key={i} onClick={() => router.push(a.href)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background:a.color }}>
                      {a.label} <ArrowRight size={14}/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">

            {/* AI Suggestions */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="font-bold text-[#1E293B] mb-4">🤖 AI Resume Suggestions</div>
              <div className="space-y-3">
                {AI_SUGGESTIONS.slice(0,4).map((s,i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#F8FAFF] rounded-xl border border-[#E2E8F0]">
                    <div className="w-5 h-5 bg-[#EFF6FF] rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#1253A4] mt-0.5">
                      {i+1}
                    </div>
                    <div className="text-sm text-slate-600">{s}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/candidate/resume")}
                className="mt-4 w-full py-2.5 bg-[#10B981] text-white rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all">
                Update Resume with AI Tips →
              </button>
            </div>

            {/* Recent Jobs */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="font-bold text-[#1E293B] mb-4">💼 Latest Job Openings</div>
              <div className="space-y-3">
                {JOBS.slice(0,4).map((job,i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                    <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0 text-base">💼</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1E293B] truncate">{job.title}</div>
                      <div className="text-xs text-slate-400">{job.dept} · {job.posted}</div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold flex-shrink-0">
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={() => router.push("/candidate/jobs")}
                className="mt-4 w-full py-2.5 bg-[#1253A4] text-white rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                View All Jobs →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}