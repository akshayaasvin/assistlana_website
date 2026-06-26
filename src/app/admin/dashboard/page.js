"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";

function timeAgo(ts) {
  if (!ts) return "—";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [admin,   setAdmin]   = useState(null);
  const [stats,   setStats]   = useState({ hr:0, candidates:0, jobs:0, internships:0, mocks:0, resumes:0 });
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) { router.push("/admin/login"); return; }
    setAdmin(JSON.parse(stored));
    loadData();
  }, []);

  const loadData = async () => {
    const [hrRes, candRes, jobsRes, intRes, mockRes, resumeRes] = await Promise.all([
      supabase.from("hr_registry").select("id,name,email,status,registered_at", { count:"exact" }),
      supabase.from("candidates").select("id,name,email,status,registered_at", { count:"exact" }),
      supabase.from("jobs").select("id", { count:"exact" }),
      supabase.from("internship_applications").select("id", { count:"exact" }),
      supabase.from("mock_interviews").select("id", { count:"exact" }),
      supabase.from("resume_suggestions").select("id", { count:"exact" }),
    ]);

    setStats({
      hr:          hrRes.count          || 0,
      candidates:  candRes.count        || 0,
      jobs:        jobsRes.count        || 0,
      internships: intRes.count         || 0,
      mocks:       mockRes.count        || 0,
      resumes:     resumeRes.count      || 0,
    });

    const hrs   = (hrRes.data   || []).map(r => ({ ...r, type:"HR" }));
    const cands = (candRes.data || []).map(r => ({ ...r, type:"Candidate" }));
    const combined = [...hrs, ...cands]
      .sort((a,b) => new Date(b.registered_at||0) - new Date(a.registered_at||0))
      .slice(0, 10);
    setRecent(combined);
    setLoading(false);
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar user={admin}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">Admin Dashboard</h1>
            <p className="text-sm text-[#64748B]">Welcome back, {admin.name}</p>
          </div>
          <div className="text-xs text-[#64748B] hidden md:block">{today}</div>
        </div>

        <div className="p-4 md:p-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label:"HR Users",              val:stats.hr,          icon:"👥", color:"from-[#0284C7]/15 to-[#0284C7]/5" },
              { label:"Job Seekers",           val:stats.candidates,  icon:"🎓", color:"from-[#0D9488]/15 to-[#0D9488]/5" },
              { label:"Jobs Posted",           val:stats.jobs,        icon:"💼", color:"from-[#7C3AED]/15 to-[#7C3AED]/5" },
              { label:"Internship Apps",       val:stats.internships, icon:"📋", color:"from-[#F59E0B]/15 to-[#F59E0B]/5" },
              { label:"Mock Interviews",       val:stats.mocks,       icon:"🎤", color:"from-[#EF4444]/15 to-[#EF4444]/5" },
              { label:"Resume Scans",          val:stats.resumes,     icon:"📄", color:"from-[#10B981]/15 to-[#10B981]/5" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-r ${s.color} flex-shrink-0`}>
                  {s.icon}
                </div>
                <div>
                  <div className="text-xl font-extrabold text-[#0F172A]">{loading ? "—" : s.val}</div>
                  <div className="text-[10px] text-[#64748B] leading-tight">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Registrations */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm mb-6">
            <div className="p-5 border-b border-[#E2E8F0]">
              <h2 className="font-bold text-[#0F172A]">Recent Registrations</h2>
            </div>
            {loading ? (
              <div className="p-8 text-center text-[#64748B]">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="p-8 text-center text-[#64748B] text-sm">No recent registrations</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                      {["Name","Email","Type","Registered","Status"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide py-3 px-5">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((r,i) => (
                      <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                              r.type==="HR" ? "bg-gradient-to-r from-[#0284C7] to-[#0D9488]" : "bg-gradient-to-r from-[#7C3AED] to-[#0284C7]"
                            }`}>
                              {(r.name||"?")[0]}
                            </div>
                            <span className="text-sm font-semibold text-[#0F172A]">{r.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5 text-xs text-[#64748B]">{r.email}</td>
                        <td className="py-3 px-5">
                          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                            r.type==="HR" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#EDE9FE] text-[#7C3AED]"
                          }`}>{r.type}</span>
                        </td>
                        <td className="py-3 px-5 text-xs text-[#64748B]">{timeAgo(r.registered_at)}</td>
                        <td className="py-3 px-5">
                          <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                            r.status==="Active" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                          }`}>{r.status || "Pending"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label:"View HR Users",     href:"/admin/hr-users",   icon:"👥" },
              { label:"View Job Seekers",  href:"/admin/candidates", icon:"🎓" },
              { label:"View Internships",  href:"/admin/internships",icon:"📋" },
              { label:"All Jobs",          href:"/admin/jobs",        icon:"💼" },
            ].map(l => (
              <Link key={l.label} href={l.href}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm hover:shadow-md hover:border-[#0284C7]/30 transition-all flex items-center gap-3">
                <span className="text-2xl">{l.icon}</span>
                <span className="text-sm font-semibold text-[#0F172A]">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
