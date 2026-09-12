"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";

function timeAgo(ts) {
  if (!ts) return "";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

function statusColor(s) {
  if (s === "Shortlisted") return "bg-[#DCFCE7] text-[#16A34A]";
  if (s === "Rejected")    return "bg-[#FEE2E2] text-[#DC2626]";
  if (s === "Interview")   return "bg-[#DBEAFE] text-[#1D4ED8]";
  return "bg-[#F1F5F9] text-[#64748B]";
}

export default function CandidateDashboard() {
  const router = useRouter();
  const [user,         setUser]         = useState(null);
  const [applications, setApplications] = useState([]);
  const [internCount,  setInternCount]  = useState(0);
  const [resumeScore,  setResumeScore]  = useState(null);
  const [mockCount,    setMockCount]    = useState(0);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);

    const load = async () => {
      const [appRes, intRes, resumeRes, mockRes, candRes] = await Promise.all([
        supabase.from("job_applications").select("*").eq("candidate_email", u.email).order("applied_at", { ascending: false }),
        supabase.from("internship_applications").select("id").eq("email", u.email),
        supabase.from("resume_suggestions").select("ats_score").eq("candidate_email", u.email).order("created_at", { ascending: false }).limit(1),
        supabase.from("mock_interviews").select("id").eq("candidate_email", u.email),
        supabase.from("candidates").select("ats_score").eq("email", u.email).single(),
      ]);
      setApplications(appRes.data || []);
      setInternCount((intRes.data || []).length);
      setMockCount((mockRes.data || []).length);
      const score = resumeRes.data?.[0]?.ats_score || candRes.data?.ats_score || null;
      setResumeScore(score);
      setLoading(false);
    };
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">{greeting}, {user.name?.split(" ")[0]}! 👋</h1>
            <p className="text-sm text-[#64748B]">Track your job search and career growth</p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon:"💼", label:"Jobs Applied",         value: applications.length,                          color:"from-[#0284C7]/15 to-[#0284C7]/5" },
              { icon:"🎓", label:"Internship Applied",   value: internCount,                                  color:"from-[#0D9488]/15 to-[#0D9488]/5" },
              { icon:"📄", label:"Resume AI Score",      value: resumeScore ? resumeScore+"%" : "N/A",        color:"from-[#7C3AED]/15 to-[#7C3AED]/5" },
              { icon:"🎤", label:"Mock Interviews Done", value: mockCount,                                    color:"from-[#F59E0B]/15 to-[#F59E0B]/5" },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-r ${s.color}`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#0F172A]">{loading ? "—" : s.value}</div>
                  <div className="text-xs text-[#64748B]">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon:"📄", title:"Improve Your Resume",  desc:"Get AI suggestions to boost your ATS score",  href:"/candidate/resume",        color:"from-[#7C3AED] to-[#0284C7]" },
              { icon:"💼", title:"Browse New Jobs",       desc:"Discover jobs matching your skills",           href:"/candidate/jobs",           color:"from-[#0284C7] to-[#0D9488]" },
              { icon:"🎓", title:"Apply for Internship",  desc:"Internship applications are open",             href:"/candidate/internship",     color:"from-[#0D9488] to-[#10B981]" },
              { icon:"🎤", title:"Practice Interview",    desc:"Start an AI mock interview now",               href:"/candidate/mock-interview", color:"from-[#F59E0B] to-[#EF4444]" },
            ].map((a,i) => (
              <Link key={i} href={a.href}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md hover:border-[#0284C7]/30 transition-all flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-gradient-to-r ${a.color} flex-shrink-0`}>
                  {a.icon}
                </div>
                <div>
                  <div className="font-bold text-[#0F172A] text-sm mb-0.5">{a.title}</div>
                  <div className="text-xs text-[#64748B]">{a.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <h2 className="font-bold text-[#0F172A]">Recent Applications</h2>
              <Link href="/candidate/applications" className="text-xs text-[#0284C7] font-semibold hover:underline">View All →</Link>
            </div>
            {loading ? (
              <div className="p-8 text-center text-[#64748B] text-sm">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-3xl mb-2">📭</div>
                <p className="text-sm text-[#64748B]">No applications yet.</p>
                <Link href="/candidate/jobs" className="inline-block mt-3 text-sm text-[#0284C7] font-semibold hover:underline">Browse Jobs →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F1F5F9]">
                      {["Job Title","Applied","Status"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide py-3 px-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0,5).map((a,i) => (
                      <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                        <td className="py-3 px-5 text-sm font-semibold text-[#0F172A]">{a.job_title || "Job Application"}</td>
                        <td className="py-3 px-5 text-xs text-[#64748B]">{timeAgo(a.applied_at)}</td>
                        <td className="py-3 px-5">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor(a.status)}`}>{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
