"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { ANALYTICS, CANDIDATES, JOBS } from "@/lib/mockData";
import { Bell, Download, TrendingUp, Users, FileText, Target } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { downloadCandidatesExcel } from "@/lib/excelExport";

export default function HRAnalytics() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) router.push("/");
    else setUser(JSON.parse(stored));
  }, []);

  const scoreDist = [
    { range:"< 60",  count:12, color:"#EF4444" },
    { range:"60-70", count:28, color:"#F59E0B" },
    { range:"70-80", count:54, color:"#0EA5C9" },
    { range:"80-90", count:89, color:"#1253A4" },
    { range:"90+",   count:43, color:"#10B981" },
  ];

  const timeToHire = [
    { month:"Jan", days:12 },
    { month:"Feb", days:10 },
    { month:"Mar", days:9  },
    { month:"Apr", days:11 },
    { month:"May", days:7  },
    { month:"Jun", days:6  },
  ];

  const TABS = ["Overview", "Candidates", "Jobs", "Skills"];

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
              <div className="text-xs text-slate-400 hidden sm:block">Recruitment insights and performance metrics</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => downloadCandidatesExcel(CANDIDATES, "Analytics_Export")}
                className="flex items-center gap-2 bg-[#10B981] text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-[#059669] transition-all whitespace-nowrap">
                <Download size={14}/> <span className="hidden sm:inline">Export Data</span>
              </button>
              <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
                <Bell size={16} className="text-slate-500"/>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* TOP STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label:"Total Resumes",     val:"247", change:"↑ 34 this week",  color:"#1253A4", icon: FileText,   bg:"#EFF6FF" },
              { label:"Candidates Scored", val:"238", change:"↑ 28 this week",  color:"#0EA5C9", icon: Target,     bg:"#F0F9FF" },
              { label:"Shortlisted",       val:"43",  change:"↑ 8 this week",   color:"#10B981", icon: Users,      bg:"#F0FDF4" },
              { label:"Avg AI Score",      val:"76",  change:"↑ 5 pts vs last", color:"#8B5CF6", icon: TrendingUp, bg:"#F5F3FF" },
            ].map((s,i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 md:p-5">
                  <div className="flex items-center justify-between mb-2 md:mb-3">
                    <div className="text-xs md:text-sm text-slate-500">{s.label}</div>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:s.bg }}>
                      <Icon size={14} style={{ color:s.color }}/>
                    </div>
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-[#1E293B] mb-1">{s.val}</div>
                  <div className="text-xs font-semibold text-[#10B981]">{s.change}</div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-[#E2E8F0] p-1.5 mb-6 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "bg-[#1253A4] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW TAB */}
          {activeTab === "Overview" && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">📈 Weekly Resume Activity</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={ANALYTICS.weekly}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#0EA5C9" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#0EA5C9" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false}/>
                      <YAxis hide/>
                      <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", fontSize:11 }}/>
                      <Legend wrapperStyle={{ fontSize:11 }}/>
                      <Area type="monotone" dataKey="resumes" name="Resumes" stroke="#0EA5C9" fill="url(#g1)" strokeWidth={2}/>
                      <Area type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#10B981" fill="url(#g2)" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🔽 Hiring Funnel</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ANALYTICS.funnel} layout="vertical" margin={{ left:10, right:20 }}>
                      <XAxis type="number" hide/>
                      <YAxis dataKey="stage" type="category" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false} width={80}/>
                      <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", fontSize:11 }}/>
                      <Bar dataKey="count" radius={[0,8,8,0]}>
                        {ANALYTICS.funnel.map((_,i) => (
                          <Cell key={i} fill={`hsl(${210 - i*20}, 75%, ${45+i*5}%)`}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🏢 Applications by Department</div>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={ANALYTICS.dept} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75}>
                          {ANALYTICS.dept.map((d,i) => <Cell key={i} fill={d.color}/>)}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", fontSize:11 }}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2 w-full sm:w-auto flex-shrink-0">
                      {ANALYTICS.dept.map((d,i) => (
                        <div key={i} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background:d.color }}/>
                            <span className="text-xs text-slate-600">{d.name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">⏱️ Avg Time to Hire (Days)</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={timeToHire}>
                      <XAxis dataKey="month" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false}/>
                      <YAxis hide/>
                      <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", fontSize:11 }}/>
                      <Line type="monotone" dataKey="days" stroke="#1253A4" strokeWidth={3} dot={{ fill:"#1253A4", r:4 }} name="Days"/>
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-xs text-green-600 font-semibold">↓ 50% reduction in time to hire over 6 months</div>
                </div>
              </div>
            </div>
          )}

          {/* CANDIDATES TAB */}
          {activeTab === "Candidates" && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🎯 Score Distribution</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={scoreDist}>
                      <XAxis dataKey="range" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false}/>
                      <YAxis hide/>
                      <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", fontSize:11 }}/>
                      <Bar dataKey="count" radius={[6,6,0,0]} name="Candidates">
                        {scoreDist.map((d,i) => <Cell key={i} fill={d.color}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">📊 Candidate Status Breakdown</div>
                  {[
                    { label:"Shortlisted", count: CANDIDATES.filter(c=>c.status==="Shortlisted").length, color:"#10B981", bg:"#F0FDF4" },
                    { label:"Reviewing",   count: CANDIDATES.filter(c=>c.status==="Reviewing").length,   color:"#F59E0B", bg:"#FFFBEB" },
                    { label:"Pending",     count: CANDIDATES.filter(c=>c.status==="Pending").length,     color:"#64748B", bg:"#F1F5F9" },
                    { label:"Rejected",    count: CANDIDATES.filter(c=>c.status==="Rejected").length,    color:"#EF4444", bg:"#FFF1F2" },
                  ].map((s,i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4 py-3 border-b border-[#F1F5F9] last:border-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background:s.bg, color:s.color }}>{s.count}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#1E293B]">{s.label}</div>
                        <div className="h-1.5 bg-[#E2E8F0] rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${(s.count/Math.max(CANDIDATES.length,1))*100}%`, background:s.color }}/>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-400 flex-shrink-0">
                        {Math.round((s.count/Math.max(CANDIDATES.length,1))*100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Candidates — cards on mobile, table on desktop */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-[#1E293B] text-sm md:text-base">👥 Top Candidates Summary</div>
                  <button onClick={() => router.push("/hr/candidates")}
                    className="text-xs text-[#1253A4] font-semibold hover:underline">View All →</button>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden space-y-3">
                  {CANDIDATES.slice(0,5).map((c,i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background:c.color }}>{c.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#1E293B] truncate">{c.name}</div>
                        <div className="text-xs text-slate-400">📍 {c.location}</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        c.score>=85?"bg-green-100 text-green-700":c.score>=70?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"
                      }`}>{c.score}</span>
                    </div>
                  ))}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F1F5F9]">
                        {["Candidate","Location","AI Score","JD Match","Status"].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase py-2 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CANDIDATES.slice(0,5).map((c,i) => (
                        <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                style={{ background:c.color }}>{c.avatar}</div>
                              <span className="text-sm font-semibold text-[#1E293B]">{c.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-500">📍 {c.location}</td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              c.score>=85?"bg-green-100 text-green-700":c.score>=70?"bg-yellow-100 text-yellow-700":"bg-red-100 text-red-700"
                            }`}>{c.score}</span>
                          </td>
                          <td className="py-3 px-3 text-xs font-bold text-[#0EA5C9]">{c.jd_match}%</td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              c.status==="Shortlisted"?"bg-green-100 text-green-700":
                              c.status==="Reviewing"?"bg-yellow-100 text-yellow-700":"bg-slate-100 text-slate-500"
                            }`}>{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* JOBS TAB */}
          {activeTab === "Jobs" && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {[
                  { label:"Active Jobs",       val: JOBS.filter(j=>j.status==="Active").length, color:"#10B981" },
                  { label:"Total Matches",     val: JOBS.reduce((a,j)=>a+j.matches,0),          color:"#1253A4" },
                  { label:"Total Shortlisted", val: JOBS.reduce((a,j)=>a+j.shortlisted,0),      color:"#8B5CF6" },
                ].map((s,i) => (
                  <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 md:p-5 text-center">
                    <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color:s.color }}>{s.val}</div>
                    <div className="text-xs md:text-sm text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">💼 Job Performance</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={JOBS} margin={{ left:0, right:10 }}>
                    <XAxis dataKey="title" tickFormatter={v => v.length>12?v.slice(0,12)+"...":v}
                      tick={{ fontSize:9, fill:"#94A3B8" }} axisLine={false} tickLine={false}/>
                    <YAxis hide/>
                    <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", fontSize:11 }}/>
                    <Legend wrapperStyle={{ fontSize:11 }}/>
                    <Bar dataKey="matches" name="Matches" fill="#1253A4" radius={[4,4,0,0]}/>
                    <Bar dataKey="shortlisted" name="Shortlisted" fill="#10B981" radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Jobs — cards on mobile, table on desktop */}
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">📋 All Jobs Summary</div>
                <div className="md:hidden space-y-3">
                  {JOBS.map((j,i) => (
                    <div key={i} className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-sm font-semibold text-[#1E293B]">{j.title}</div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${
                          j.status==="Active"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"
                        }`}>{j.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{j.dept}</span>
                        <span className="text-[#1253A4] font-bold">{j.matches} matched</span>
                        <span className="text-[#10B981] font-bold">{j.shortlisted} shortlisted</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#F1F5F9]">
                        {["Job Title","Department","Matches","Shortlisted","Status","Posted"].map(h => (
                          <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase py-2 px-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {JOBS.map((j,i) => (
                        <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                          <td className="py-3 px-3 text-sm font-semibold text-[#1E293B]">{j.title}</td>
                          <td className="py-3 px-3 text-xs text-slate-500">{j.dept}</td>
                          <td className="py-3 px-3 text-sm font-bold text-[#1253A4]">{j.matches}</td>
                          <td className="py-3 px-3 text-sm font-bold text-[#10B981]">{j.shortlisted}</td>
                          <td className="py-3 px-3">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              j.status==="Active"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-700"
                            }`}>{j.status}</span>
                          </td>
                          <td className="py-3 px-3 text-xs text-slate-400">{j.posted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === "Skills" && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">🔧 Top Skills in Candidate Pool</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={ANALYTICS.skills} layout="vertical">
                      <XAxis type="number" hide/>
                      <YAxis dataKey="name" type="category" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false} width={65}/>
                      <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #E2E8F0", fontSize:11 }}/>
                      <Bar dataKey="value" radius={[0,8,8,0]} name="Candidates %">
                        {ANALYTICS.skills.map((_,i) => (
                          <Cell key={i} fill={["#1253A4","#0EA5C9","#10B981","#8B5CF6","#F59E0B","#EF4444"][i]}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                  <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">📊 Skill Demand vs Supply</div>
                  <div className="space-y-3 md:space-y-4">
                    {ANALYTICS.skills.map((s,i) => {
                      const demand = Math.min(100, s.value + Math.floor(Math.random()*20));
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-600">{s.name}</span>
                            <span className="text-slate-400">S:{s.value}% D:{demand}%</span>
                          </div>
                          <div className="flex gap-1">
                            <div className="h-2 bg-[#1253A4] rounded-full" style={{ width:`${s.value}%` }}/>
                            <div className="h-2 bg-[#E2E8F0] rounded-full flex-1"/>
                          </div>
                          <div className="flex gap-1 mt-0.5">
                            <div className="h-2 bg-[#10B981] rounded-full" style={{ width:`${demand}%` }}/>
                            <div className="h-2 bg-[#E2E8F0] rounded-full flex-1"/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1"><div className="w-3 h-2 bg-[#1253A4] rounded"/>Supply</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-2 bg-[#10B981] rounded"/>Demand</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">⚠️ Skills Gap Analysis</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {[
                    { skill:"Kubernetes",      gap:"High",   desc:"Only 15% of candidates have this skill"   },
                    { skill:"Rust",            gap:"High",   desc:"Emerging demand but very low supply"       },
                    { skill:"LLM Fine-tuning", gap:"Medium", desc:"Growing demand in AI/ML roles"             },
                    { skill:"GraphQL",         gap:"Medium", desc:"Required in 40% of engineering roles"      },
                    { skill:"Terraform",       gap:"Low",    desc:"Good supply matching current demand"       },
                    { skill:"FastAPI",         gap:"Low",    desc:"Growing pool of Python developers"         },
                  ].map((item,i) => (
                    <div key={i} className={`p-3 md:p-4 rounded-xl border ${
                      item.gap==="High"   ? "bg-red-50 border-red-100"       :
                      item.gap==="Medium" ? "bg-yellow-50 border-yellow-100" :
                      "bg-green-50 border-green-100"
                    }`}>
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <span className="font-bold text-sm text-[#1E293B]">{item.skill}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          item.gap==="High"   ? "bg-red-100 text-red-600"       :
                          item.gap==="Medium" ? "bg-yellow-100 text-yellow-600" :
                          "bg-green-100 text-green-600"
                        }`}>{item.gap} Gap</span>
                      </div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}