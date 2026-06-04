"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { JOBS, APPLICATIONS } from "@/lib/mockData";
import { Bell, ClipboardList } from "lucide-react";

export default function CandidateApplications() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    setUser(JSON.parse(stored));
  }, []);

  const statusStyle = {
    Shortlisted: { bg:"bg-green-100",  text:"text-green-700",  icon:"⭐" },
    Reviewing:   { bg:"bg-yellow-100", text:"text-yellow-700", icon:"🔍" },
    Pending:     { bg:"bg-slate-100",  text:"text-slate-600",  icon:"⏳" },
    Rejected:    { bg:"bg-red-100",    text:"text-red-700",    icon:"❌" },
  };

  const stages = ["Applied","Under Review","Shortlisted","Interview","Offer"];

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <CandidateSidebar user={user}/>
      <div className="ml-56 flex-1">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-lg font-bold text-[#1E293B]">My Applications</div>
            <div className="text-xs text-slate-400">Track your job application status</div>
          </div>
          <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
            <Bell size={16} className="text-slate-500"/>
          </button>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label:"Total Applied",  val: APPLICATIONS.length,                                         color:"#1253A4" },
              { label:"Under Review",   val: APPLICATIONS.filter(a=>a.status==="Reviewing").length,       color:"#F59E0B" },
              { label:"Shortlisted",    val: APPLICATIONS.filter(a=>a.status==="Shortlisted").length,     color:"#10B981" },
              { label:"Avg Score",      val: Math.round(APPLICATIONS.reduce((a,b)=>a+b.score,0)/APPLICATIONS.length), color:"#8B5CF6" },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <div className="text-sm text-slate-400 mb-1">{s.label}</div>
                <div className="text-3xl font-bold" style={{ color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Application Cards */}
          <div className="space-y-4">
            {APPLICATIONS.map((app,i) => {
              const job = JOBS.find(j => j.id === app.jobId);
              if (!job) return null;
              const st = statusStyle[app.status] || statusStyle.Pending;
              const stageIndex = app.status === "Shortlisted" ? 2 : app.status === "Reviewing" ? 1 : 0;

              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-xl">💼</div>
                      <div>
                        <div className="font-bold text-[#1E293B]">{job.title}</div>
                        <div className="text-sm text-slate-400">{job.dept} · Applied {app.appliedDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-[#1253A4]">{app.score}</div>
                        <div className="text-xs text-slate-400">AI Score</div>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${st.bg} ${st.text}`}>
                        {st.icon} {app.status}
                      </span>
                    </div>
                  </div>

                  {/* Progress stages */}
                  <div className="flex items-center gap-1">
                    {stages.map((stage, si) => (
                      <div key={si} className="flex items-center flex-1">
                        <div className={`flex-1 flex flex-col items-center`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                            si <= stageIndex ? "bg-[#10B981] text-white" : "bg-[#E2E8F0] text-slate-400"
                          }`}>
                            {si <= stageIndex ? "✓" : si+1}
                          </div>
                          <div className={`text-xs ${si <= stageIndex ? "text-[#10B981] font-semibold" : "text-slate-400"}`}>
                            {stage}
                          </div>
                        </div>
                        {si < stages.length-1 && (
                          <div className={`h-0.5 flex-1 mb-4 ${si < stageIndex ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}/>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {APPLICATIONS.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center">
              <ClipboardList size={48} className="mx-auto mb-4 text-slate-200"/>
              <div className="font-bold text-slate-400 mb-2">No applications yet</div>
              <button onClick={() => router.push("/candidate/jobs")}
                className="mt-2 px-6 py-2.5 bg-[#1253A4] text-white rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                Browse Jobs →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}