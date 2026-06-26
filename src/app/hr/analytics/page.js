"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { supabase } from "@/lib/supabase";
import { Bell, Download, TrendingUp, Users, FileText, Target } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { downloadCandidatesExcel } from "@/lib/excelExport";

const TABS = ["Overview", "Candidates", "Jobs", "Skills"];

function buildWeeklyData(candidates) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = Array(7).fill(0).map((_, i) => ({ day: days[i], resumes: 0, shortlisted: 0 }));
  const now = Date.now();
  const msPerDay = 86400000;
  candidates.forEach(c => {
    if (!c.registered_at) return;
    const diff = Math.floor((now - new Date(c.registered_at).getTime()) / msPerDay);
    if (diff < 7) {
      const d = new Date(c.registered_at).getDay();
      counts[d].resumes += 1;
      if (c.status === "Shortlisted") counts[d].shortlisted += 1;
    }
  });
  // rotate so today is last
  const today = new Date().getDay();
  return [...counts.slice(today + 1), ...counts.slice(0, today + 1)];
}

function buildFunnel(candidates) {
  const total = candidates.length;
  const scored = candidates.filter(c => (c.ai_score || 0) > 0).length;
  const matched = candidates.filter(c => (c.jd_match || 0) > 0).length;
  const shortlisted = candidates.filter(c => c.status === "Shortlisted").length;
  return [
    { stage: "Uploaded",    count: total },
    { stage: "Scored",      count: scored },
    { stage: "Matched",     count: matched },
    { stage: "Shortlisted", count: shortlisted },
  ];
}

function buildSkillsData(candidates) {
  const freq = {};
  candidates.forEach(c => {
    (c.skills || []).forEach(s => {
      freq[s] = (freq[s] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));
}

function buildScoreDist(candidates) {
  const bands = [
    { range: "< 60",  min: 0,  max: 59,  color: "#EF4444" },
    { range: "60-70", min: 60, max: 69,  color: "#F59E0B" },
    { range: "70-80", min: 70, max: 79,  color: "#0EA5C9" },
    { range: "80-90", min: 80, max: 89,  color: "#1253A4" },
    { range: "90+",   min: 90, max: 100, color: "#10B981" },
  ];
  return bands.map(b => ({
    ...b,
    count: candidates.filter(c => {
      const s = c.ai_score || 0;
      return s >= b.min && s <= b.max;
    }).length,
  }));
}

function buildDeptData(candidates) {
  const colors = ["#1253A4","#0EA5C9","#10B981","#8B5CF6","#F59E0B","#EF4444"];
  const freq = {};
  candidates.forEach(c => {
    const role = c.role || "General";
    freq[role] = (freq[role] || 0) + 1;
  });
  const total = candidates.length || 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count], i) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[i % colors.length],
    }));
}

export default function HRAnalytics() {
  const router = useRouter();
  const [user,       setUser]       = useState(null);
  const [activeTab,  setActiveTab]  = useState("Overview");
  const [candidates, setCandidates] = useState([]);
  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) { router.push("/"); return; }
    setUser(JSON.parse(stored));
    loadData();
  }, []);

  const loadData = async () => {
    const [candRes, jobsRes] = await Promise.all([
      supabase.from("candidates").select("*").order("ai_score", { ascending: false }),
      supabase.from("jobs").select("*"),
    ]);
    setCandidates(candRes.data || []);
    setJobs(jobsRes.data || []);
    setLoading(false);
  };

  const weeklyData  = buildWeeklyData(candidates);
  const funnelData  = buildFunnel(candidates);
  const skillsData  = buildSkillsData(candidates);
  const scoreDist   = buildScoreDist(candidates);
  const deptData    = buildDeptData(candidates);
  const avgScore    = candidates.length
    ? Math.round(candidates.reduce((a, c) => a + (c.ai_score || 0), 0) / candidates.length)
    : 0;
  const shortlisted = candidates.filter(c => c.status === "Shortlisted").length;

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="text-base md:text-lg font-bold text-[#1E293B]">Analytics</div>
              <div className="text-xs text-slate-400 hidden sm:block">Live recruitment insights from your database</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => downloadCandidatesExcel(candidates, "Analytics_Export")}
                disabled={candidates.length === 0}
                className="flex items-center gap-2 bg-[#10B981] text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-[#059669] transition-all whitespace-nowrap disabled:opacity-50">
                <Download size={14}/> <span className="hidden sm:inline">Export Data</span>
              </button>
              <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
                <Bell size={16} className="text-slate-500"/>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#1253A4]/20 border-t-[#1253A4] rounded-full animate-spin"/>
            </div>
          ) : (
            <>
              {/* TOP STATS — live from DB */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                {[
                  { label: "Total Resumes",     val: candidates.length,                                     color: "#1253A4", icon: FileText,   bg: "#EFF6FF" },
                  { label: "Candidates Scored", val: candidates.filter(c => (c.ai_score || 0) > 0).length,  color: "#0EA5C9", icon: Target,     bg: "#F0F9FF" },
                  { label: "Shortlisted",       val: shortlisted,                                            color: "#10B981", icon: Users,      bg: "#F0FDF4" },
                  { label: "Avg AI Score",      val: avgScore,                                               color: "#8B5CF6", icon: TrendingUp, bg: "#F5F3FF" },
                ].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 md:p-5">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <div className="text-xs md:text-sm text-slate-500">{s.label}</div>
                        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                          <Icon size={14} style={{ color: s.color }}/>
                        </div>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-1">{s.val}</div>
                    </div>
                  );
                })}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white rounded-2xl border border-[#E2E8F0] p-1.5 mb-6 overflow-x-auto">
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab ? "bg-[#1253A4] text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* OVERVIEW */}
              {activeTab === "Overview" && (
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                      <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">📈 Weekly Upload Activity</div>
                      {weeklyData.every(d => d.resumes === 0) ? (
                        <div className="text-center py-10 text-slate-400 text-sm">No upload activity in the last 7 days.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={weeklyData}>
                            <defs>
                              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0EA5C9" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#0EA5C9" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}/>
                            <YAxis hide/>
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 11 }}/>
                            <Legend wrapperStyle={{ fontSize: 11 }}/>
                            <Area type="monotone" dataKey="resumes" name="Resumes" stroke="#0EA5C9" fill="url(#g1)" strokeWidth={2}/>
                            <Area type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#10B981" fill="url(#g2)" strokeWidth={2}/>
                          </AreaChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                      <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🔽 Hiring Funnel</div>
                      {funnelData[0].count === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">No candidate data yet.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <XAxis type="number" hide/>
                            <YAxis dataKey="stage" type="category" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={80}/>
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 11 }}/>
                            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                              {funnelData.map((_, i) => (
                                <Cell key={i} fill={`hsl(${210 - i * 20}, 75%, ${45 + i * 5}%)`}/>
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                    <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🏢 Applications by Role</div>
                    {deptData.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">No role data available yet.</div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={deptData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                              {deptData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 11 }}/>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 w-full sm:w-auto flex-shrink-0">
                          {deptData.map((d, i) => (
                            <div key={i} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }}/>
                                <span className="text-xs text-slate-600 max-w-[100px] truncate">{d.name}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-700">{d.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CANDIDATES */}
              {activeTab === "Candidates" && (
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                      <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🎯 Score Distribution</div>
                      {candidates.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 text-sm">No candidates yet.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={scoreDist}>
                            <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}/>
                            <YAxis hide/>
                            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 11 }}/>
                            <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Candidates">
                              {scoreDist.map((d, i) => <Cell key={i} fill={d.color}/>)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                      <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">📊 Status Breakdown</div>
                      {candidates.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">No candidate data yet.</div>
                      ) : (
                        ["Shortlisted", "Reviewing", "Pending", "Rejected"].map((status, i) => {
                          const count = candidates.filter(c => c.status === status).length;
                          const colors = { Shortlisted: ["#10B981","#F0FDF4"], Reviewing: ["#F59E0B","#FFFBEB"], Pending: ["#64748B","#F1F5F9"], Rejected: ["#EF4444","#FFF1F2"] };
                          const [clr, bg] = colors[status];
                          return (
                            <div key={i} className="flex items-center gap-3 md:gap-4 py-3 border-b border-[#F1F5F9] last:border-0">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                                style={{ background: bg, color: clr }}>{count}</div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-[#1E293B]">{status}</div>
                                <div className="h-1.5 bg-[#E2E8F0] rounded-full mt-1 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${(count / Math.max(candidates.length, 1)) * 100}%`, background: clr }}/>
                                </div>
                              </div>
                              <div className="text-xs font-bold text-slate-400 flex-shrink-0">
                                {Math.round((count / Math.max(candidates.length, 1)) * 100)}%
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="font-bold text-[#1E293B] text-sm md:text-base">👥 Top Candidates</div>
                      <button onClick={() => router.push("/hr/candidates")}
                        className="text-xs text-[#1253A4] font-semibold hover:underline">View All →</button>
                    </div>
                    {candidates.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        <div className="text-3xl mb-2">📭</div>No candidates uploaded yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#F1F5F9]">
                              {["Candidate", "Location", "AI Score", "JD Match", "Status"].map(h => (
                                <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase py-2 px-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {candidates.slice(0, 8).map((c, i) => (
                              <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#1253A4]">
                                      {(c.name || "?").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-[#1E293B]">{c.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-xs text-slate-500">📍 {c.location || "—"}</td>
                                <td className="py-3 px-3">
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    (c.ai_score || 0) >= 85 ? "bg-green-100 text-green-700" :
                                    (c.ai_score || 0) >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                  }`}>{c.ai_score || 0}</span>
                                </td>
                                <td className="py-3 px-3 text-xs font-bold text-[#0EA5C9]">{c.jd_match || 0}%</td>
                                <td className="py-3 px-3">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    c.status === "Shortlisted" ? "bg-green-100 text-green-700" :
                                    c.status === "Reviewing"   ? "bg-yellow-100 text-yellow-700" :
                                    c.status === "Rejected"    ? "bg-red-100 text-red-700" :
                                    "bg-slate-100 text-slate-500"
                                  }`}>{c.status || "Pending"}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* JOBS */}
              {activeTab === "Jobs" && (
                <div className="space-y-4 md:space-y-6">
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {[
                      { label: "Active Jobs",       val: jobs.filter(j => j.status === "Active").length,                                   color: "#10B981" },
                      { label: "Total Candidates",  val: candidates.length,                                                                 color: "#1253A4" },
                      { label: "Total Shortlisted", val: shortlisted,                                                                       color: "#8B5CF6" },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 md:p-5 text-center">
                        <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: s.color }}>{s.val}</div>
                        <div className="text-xs md:text-sm text-slate-400">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                    <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">💼 Jobs Summary</div>
                    {jobs.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        <div className="text-3xl mb-2">📋</div>No jobs posted yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#F1F5F9]">
                              {["Job Title", "Department", "Experience", "Status", "Posted"].map(h => (
                                <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase py-2 px-3">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {jobs.map((j, i) => (
                              <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                                <td className="py-3 px-3 text-sm font-semibold text-[#1E293B]">{j.title}</td>
                                <td className="py-3 px-3 text-xs text-slate-500">{j.department || j.dept || "—"}</td>
                                <td className="py-3 px-3 text-xs text-slate-500">{j.experience || j.exp || "—"}</td>
                                <td className="py-3 px-3">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    j.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                  }`}>{j.status || "Active"}</span>
                                </td>
                                <td className="py-3 px-3 text-xs text-slate-400">
                                  {j.created_at ? new Date(j.created_at).toLocaleDateString() : "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SKILLS */}
              {activeTab === "Skills" && (
                <div className="space-y-4 md:space-y-6">
                  <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                    <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🔧 Top Skills in Candidate Pool</div>
                    {skillsData.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-sm">No skill data yet — upload resumes to see analytics.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={skillsData} layout="vertical">
                          <XAxis type="number" hide/>
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={80}/>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 11 }}/>
                          <Bar dataKey="value" radius={[0, 8, 8, 0]} name="Candidates">
                            {skillsData.map((_, i) => (
                              <Cell key={i} fill={["#1253A4","#0EA5C9","#10B981","#8B5CF6","#F59E0B","#EF4444"][i % 6]}/>
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {skillsData.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                      <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">📊 Skill Distribution</div>
                      <div className="space-y-3">
                        {skillsData.map((s, i) => {
                          const maxCount = skillsData[0]?.value || 1;
                          const pct = Math.round((s.value / maxCount) * 100);
                          const colors = ["#1253A4","#0EA5C9","#10B981","#8B5CF6","#F59E0B","#EF4444"];
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-slate-600">{s.name}</span>
                                <span className="text-slate-400">{s.value} candidates</span>
                              </div>
                              <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: colors[i % 6] }}/>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
