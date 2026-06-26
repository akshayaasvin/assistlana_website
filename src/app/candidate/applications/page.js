"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { supabase } from "@/lib/supabase";
import { Bell, ClipboardList } from "lucide-react";

const STATUS_STYLE = {
  Shortlisted: { bg:"bg-green-100",  text:"text-green-700",  icon:"⭐" },
  Reviewing:   { bg:"bg-yellow-100", text:"text-yellow-700", icon:"🔍" },
  Pending:     { bg:"bg-slate-100",  text:"text-slate-600",  icon:"⏳" },
  Rejected:    { bg:"bg-red-100",    text:"text-red-700",    icon:"❌" },
  Interview:   { bg:"bg-blue-100",   text:"text-blue-700",   icon:"📞" },
};

const STAGES = ["Applied", "Under Review", "Shortlisted", "Interview", "Offer"];

function stageIndex(status) {
  if (status === "Shortlisted") return 2;
  if (status === "Reviewing")   return 1;
  if (status === "Interview")   return 3;
  if (status === "Offer")       return 4;
  return 0;
}

function timeAgo(ts) {
  if (!ts) return "—";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

export default function CandidateApplications() {
  const router = useRouter();
  const [user,         setUser]         = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);

    supabase
      .from("job_applications")
      .select("*")
      .eq("candidate_email", u.email)
      .order("applied_at", { ascending: false })
      .then(({ data }) => {
        setApplications(data || []);
        setLoading(false);
      });
  }, []);

  const shortlisted = applications.filter(a => a.status === "Shortlisted").length;
  const reviewing   = applications.filter(a => a.status === "Reviewing").length;
  const avgScore    = applications.length
    ? Math.round(applications.reduce((s, a) => s + (a.ai_score || 0), 0) / applications.length)
    : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="text-base md:text-lg font-bold text-[#1E293B]">My Applications</div>
              <div className="text-xs text-slate-400 hidden sm:block">Track your job application status</div>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl flex-shrink-0">
              <Bell size={16} className="text-slate-500"/>
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[
              { label: "Total Applied", val: loading ? "—" : applications.length, color: "#1253A4" },
              { label: "Under Review",  val: loading ? "—" : reviewing,            color: "#F59E0B" },
              { label: "Shortlisted",   val: loading ? "—" : shortlisted,          color: "#10B981" },
              { label: "Avg AI Score",  val: loading ? "—" : avgScore,             color: "#8B5CF6" },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 md:p-5">
                <div className="text-xs md:text-sm text-slate-400 mb-1">{s.label}</div>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1253A4]/20 border-t-[#1253A4] rounded-full animate-spin"/>
            </div>
          )}

          {/* Application Cards */}
          {!loading && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((app, i) => {
                const st = STATUS_STYLE[app.status] || STATUS_STYLE.Pending;
                const si = stageIndex(app.status);
                return (
                  <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-lg flex-shrink-0">💼</div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#1E293B] text-sm md:text-base truncate">
                            {app.job_title || "Job Application"}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {app.company || "—"} · Applied {timeAgo(app.applied_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                        {app.ai_score > 0 && (
                          <div className="text-center">
                            <div className="text-lg md:text-xl font-bold text-[#1253A4]">{app.ai_score}</div>
                            <div className="text-xs text-slate-400">AI Score</div>
                          </div>
                        )}
                        <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${st.bg} ${st.text}`}>
                          {st.icon} {app.status || "Pending"}
                        </span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="overflow-x-auto pb-1">
                      <div className="flex items-center gap-1 min-w-max md:min-w-0">
                        {STAGES.map((stage, idx) => (
                          <div key={idx} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                                idx <= si ? "bg-[#10B981] text-white" : "bg-[#E2E8F0] text-slate-400"
                              }`}>
                                {idx <= si ? "✓" : idx + 1}
                              </div>
                              <div className={`text-xs whitespace-nowrap ${idx <= si ? "text-[#10B981] font-semibold" : "text-slate-400"}`}>
                                {stage}
                              </div>
                            </div>
                            {idx < STAGES.length - 1 && (
                              <div className={`h-0.5 w-8 md:w-12 mb-4 flex-shrink-0 ${idx < si ? "bg-[#10B981]" : "bg-[#E2E8F0]"}`}/>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && applications.length === 0 && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 md:p-16 text-center">
              <ClipboardList size={48} className="mx-auto mb-4 text-slate-200"/>
              <div className="font-bold text-slate-400 mb-2">No applications yet</div>
              <p className="text-sm text-slate-400 mb-4">You haven't applied to any jobs. Start exploring opportunities!</p>
              <button onClick={() => router.push("/candidate/jobs")}
                className="px-6 py-2.5 bg-[#1253A4] text-white rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                Browse Jobs →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
