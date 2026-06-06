"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SYSTEM_STATS, HR_USERS, AUDIT_LOGS, ORGANIZATIONS, CANDIDATES } from "@/lib/mockData";
import { downloadCandidatesExcel } from "@/lib/excelExport";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Users, FileText, Building2, Briefcase,
  LogOut, Settings, Shield, Activity,
  ChevronRight, Bell, Search, Download
} from "lucide-react";

// ─── SIDEBAR LINKS ────────────────────────────────
const NAV = [
  { label:"Dashboard",     icon: Activity,   href:"/admin/dashboard" },
  { label:"HR Users",      icon: Users,      href:"/admin/users"     },
  { label:"Organizations", icon: Building2,  href:"/admin/orgs"      },
  { label:"Settings",      icon: Settings,   href:"/admin/settings"  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [activePage, setActivePage] = useState("Dashboard");

  // Check if admin is logged in
  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) {
      router.push("/admin/login");
    } else {
      setAdmin(JSON.parse(stored));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  if (!admin) return null;

  // ─── STAT CARDS DATA ─────────────────────────────
  const stats = [
    { label:"Total Organizations", value: SYSTEM_STATS.totalOrgs,        icon: Building2,  color:"#1253A4", bg:"#EFF6FF" },
    { label:"Total HR Users",      value: SYSTEM_STATS.totalHRUsers,      icon: Users,      color:"#0EA5C9", bg:"#F0F9FF" },
    { label:"Total Candidates",    value: SYSTEM_STATS.totalCandidates,   icon: FileText,   color:"#10B981", bg:"#F0FDF4" },
    { label:"Active Jobs",         value: SYSTEM_STATS.activeJobs,        icon: Briefcase,  color:"#8B5CF6", bg:"#F5F3FF" },
  ];

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">

      {/* ── SIDEBAR ── */}
      <div className="w-56 bg-[#0B1D3A] min-h-screen flex flex-col fixed left-0 top-0">

        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0EA5C9] rounded-xl flex items-center justify-center text-white font-bold">
              A
            </div>
            <div>
              <div className="text-white font-bold text-sm">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs">Admin Portal</div>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4">
          <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-3 px-2">
            Main Menu
          </div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.label;
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0EA5C9]/20 text-[#0EA5C9] border border-[#0EA5C9]/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16}/>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#1253A4] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {admin.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div className="text-white text-xs font-semibold">{admin.name}</div>
              <div className="text-white/40 text-xs">{admin.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
          >
            <LogOut size={14}/>
            Logout
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="ml-0 md:ml-0 md:ml-0 md:ml-56 flex-1">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-lg font-bold text-[#1E293B]">Admin Dashboard</div>
            <div className="text-xs text-slate-400">Welcome back, {admin.name}</div>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-4 py-2">
              <Search size={14} className="text-slate-400"/>
              <input
                placeholder="Search..."
                className="bg-transparent text-sm outline-none text-slate-600 w-40"
              />
            </div>
            {/* Bell */}
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
              <Bell size={16} className="text-slate-500"/>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
            </button>
            {/* Shield badge */}
            <div className="flex items-center gap-2 bg-[#1253A4]/10 px-3 py-2 rounded-xl">
              <Shield size={14} className="text-[#1253A4]"/>
              <span className="text-xs font-semibold text-[#1253A4]">{admin.role}</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium text-slate-500">{s.label}</div>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                      <Icon size={18} style={{ color: s.color }}/>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[#1E293B]">{s.value}</div>
                  <div className="text-xs text-green-600 font-semibold mt-1">↑ Active</div>
                </div>
              );
            })}
          </div>

          {/* ── SYSTEM HEALTH ── */}
          <div className="grid grid-cols-2 gap-5 mb-8">

            {/* System Status */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="font-bold text-[#1E293B] mb-5">⚙️ System Health</div>
              {[
                { label:"System Uptime",       value: SYSTEM_STATS.systemUptime,  color:"#10B981" },
                { label:"Parse Success Rate",  value: SYSTEM_STATS.parseSuccess,  color:"#10B981" },
                { label:"Resumes Parsed Today",value: SYSTEM_STATS.parsedToday,   color:"#1253A4" },
                { label:"Total Resumes",       value: SYSTEM_STATS.totalResumes,  color:"#1253A4" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>

            {/* Organizations */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <div className="font-bold text-[#1E293B] mb-5">🏢 Organizations</div>
              {ORGANIZATIONS.map((org, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-[#1E293B]">{org.name}</div>
                    <div className="text-xs text-slate-400">{org.users} users · {org.resumes} resumes</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={org.plan}/>
                    <StatusBadge status={org.status}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── HR USERS TABLE ── */}
<div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-8">
  <div className="flex items-center justify-between mb-5">
    <div className="font-bold text-[#1E293B]">👥 HR Users</div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => downloadCandidatesExcel(CANDIDATES, "All_Candidates_Admin")}
        className="flex items-center gap-2 bg-[#10B981] text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-[#059669] transition-all">
        <Download size={12}/> Download Candidates XL
      </button>
      <button className="flex items-center gap-1 text-xs font-semibold text-[#1253A4] hover:underline">
        View All <ChevronRight size={14}/>
      </button>
    </div>
  </div>
  <table className="w-full">
    <thead>
      <tr className="border-b border-[#F1F5F9]">
        {["Name","User ID","Organization","Role","Status","Last Login"].map(h => (
          <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide pb-3 px-2">{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {HR_USERS.map((user, i) => (
        <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-all">
          <td className="py-3 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1253A4] flex items-center justify-center text-white text-xs font-bold">
                {user.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1E293B]">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </div>
            </div>
          </td>
          <td className="py-3 px-2 text-xs font-mono text-slate-500">{user.userId}</td>
          <td className="py-3 px-2 text-sm text-slate-600">{user.org}</td>
          <td className="py-3 px-2"><StatusBadge status={user.role}/></td>
          <td className="py-3 px-2"><StatusBadge status={user.status}/></td>
          <td className="py-3 px-2 text-xs text-slate-400">{user.lastLogin}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

          {/* ── AUDIT LOGS ── */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
            <div className="font-bold text-[#1E293B] mb-5">📋 Recent Audit Logs</div>
            {AUDIT_LOGS.map((log, i) => {
              const colors = {
                upload: { bg:"#F0F9FF", text:"#0EA5C9", icon:"📤" },
                admin:  { bg:"#F5F3FF", text:"#8B5CF6", icon:"🔧" },
                hr:     { bg:"#F0FDF4", text:"#10B981", icon:"👥" },
                view:   { bg:"#FFF7ED", text:"#F59E0B", icon:"👁️" },
                config: { bg:"#FFF1F2", text:"#EF4444", icon:"⚙️" },
              };
              const c = colors[log.type] || colors.view;
              return (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-[#F8FAFC] last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: c.bg }}>
                    {c.icon}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-[#1E293B]">{log.user} </span>
                    <span className="text-sm text-slate-500">{log.action}</span>
                  </div>
                  <div className="text-xs text-slate-400">{log.time}</div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}