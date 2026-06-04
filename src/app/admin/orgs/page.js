"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ORGANIZATIONS } from "@/lib/mockData";
import StatusBadge from "@/components/shared/StatusBadge";
import {
  Activity, Users, Building2, Settings,
  LogOut, Brain, Plus, X, Check,
  Search, Edit, Trash2
} from "lucide-react";

const NAV = [
  { label:"Dashboard",     icon: Activity,  href:"/admin/dashboard" },
  { label:"HR Users",      icon: Users,     href:"/admin/users"     },
  { label:"Organizations", icon: Building2, href:"/admin/orgs"      },
  { label:"Settings",      icon: Settings,  href:"/admin/settings"  },
];

export default function AdminOrgs() {
  const router = useRouter();
  const [admin,      setAdmin]      = useState(null);
  const [orgs,       setOrgs]       = useState(ORGANIZATIONS);
  const [showModal,  setShowModal]  = useState(false);
  const [search,     setSearch]     = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [newOrg,     setNewOrg]     = useState({
    name:"", plan:"Starter", status:"Active"
  });

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) router.push("/admin/login");
    else setAdmin(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  const handleAdd = () => {
    if (!newOrg.name) return;
    setOrgs(prev => [...prev, {
      id: prev.length + 1,
      ...newOrg,
      users: 0,
      resumes: 0,
    }]);
    setShowModal(false);
    setNewOrg({ name:"", plan:"Starter", status:"Active" });
    setSuccessMsg("✅ Organization added successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleDelete = (id) => {
    setOrgs(prev => prev.filter(o => o.id !== id));
    setSuccessMsg("✅ Organization removed.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const planColors = {
    Enterprise: { bg:"#F5F3FF", text:"#8B5CF6", border:"#DDD6FE" },
    Growth:     { bg:"#EFF6FF", text:"#1253A4", border:"#BFDBFE" },
    Starter:    { bg:"#F1F5F9", text:"#64748B", border:"#E2E8F0" },
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">

      {/* Sidebar */}
      <div className="w-56 bg-[#0B1D3A] min-h-screen flex flex-col fixed left-0 top-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0EA5C9] rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-white"/>
            </div>
            <div>
              <div className="text-white font-bold text-sm">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs">Admin Portal</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-3 px-2">
            Main Menu
          </div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin/orgs";
            return (
              <button key={item.label} onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0EA5C9]/20 text-[#0EA5C9] border border-[#0EA5C9]/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}>
                <Icon size={16}/>{item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#1253A4] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {admin.name.split(" ").map(n=>n[0]).join("")}
            </div>
            <div>
              <div className="text-white text-xs font-semibold">{admin.name}</div>
              <div className="text-white/40 text-xs">{admin.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all">
            <LogOut size={14}/>Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-lg font-bold text-[#1E293B]">Organizations</div>
            <div className="text-xs text-slate-400">Manage all client organizations and their plans</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-4 py-2">
              <Search size={14} className="text-slate-400"/>
              <input placeholder="Search organizations..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none w-40 text-slate-600"/>
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#1253A4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
              <Plus size={15}/> Add Organization
            </button>
          </div>
        </div>

        <div className="p-8">

          {/* Success */}
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <Check size={16}/>{successMsg}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label:"Total Orgs",      val: orgs.length,                                       color:"#1253A4" },
              { label:"Active",          val: orgs.filter(o=>o.status==="Active").length,         color:"#10B981" },
              { label:"Enterprise Plan", val: orgs.filter(o=>o.plan==="Enterprise").length,       color:"#8B5CF6" },
              { label:"Total HR Users",  val: orgs.reduce((a,o)=>a+(o.users||0),0),              color:"#0EA5C9" },
            ].map((s,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <div className="text-sm text-slate-400 mb-1">{s.label}</div>
                <div className="text-3xl font-bold" style={{ color:s.color }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Org Cards */}
          <div className="grid grid-cols-2 gap-5">
            {filtered.map((org, i) => {
              const pc = planColors[org.plan] || planColors.Starter;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#EFF6FF] rounded-2xl flex items-center justify-center text-xl font-bold text-[#1253A4]">
                        {org.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-[#1E293B] text-base">{org.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Organization ID: ORG-{String(org.id).padStart(3,"0")}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1 rounded-full border"
                        style={{ background:pc.bg, color:pc.text, borderColor:pc.border }}>
                        {org.plan}
                      </span>
                      <StatusBadge status={org.status}/>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label:"HR Users", val: org.users  || 0 },
                      { label:"Resumes",  val: org.resumes || 0 },
                      { label:"Status",   val: org.status       },
                     ].map((item, j) => (
                      <div key={j} className="bg-[#F8FAFC] rounded-xl p-3 text-center">
                         <div className="text-sm font-bold text-[#1E293B]">{item.val}</div>
                         <div className="text-xs text-slate-400">{item.label}</div>
                      </div>
                     ))}
                   </div>

                  {/* Plan limits */}
                  <div className="mb-4 p-3 rounded-xl"
                    style={{ background: pc.bg, border:`1px solid ${pc.border}` }}>
                    <div className="text-xs font-bold mb-1" style={{ color:pc.text }}>
                      {org.plan} Plan Limits
                    </div>
                    <div className="text-xs" style={{ color:pc.text }}>
                      {org.plan === "Enterprise" ? "Unlimited users · Unlimited resumes · White-label" :
                       org.plan === "Growth"     ? "20 users · 2,000 resumes/mo · API access" :
                       "5 users · 200 resumes/mo · Basic features"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#EFF6FF] text-[#1253A4] rounded-xl text-xs font-semibold hover:bg-[#DBEAFE] transition-all">
                      <Edit size={13}/> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(org.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all">
                      <Trash2 size={13}/> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Org Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0B1D3A] px-6 py-4 flex items-center justify-between">
              <div className="text-white font-bold">Add New Organization</div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={18}/>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-2">
                  Organization Name *
                </label>
                <input value={newOrg.name}
                  onChange={e => setNewOrg(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. TechCorp India"
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Plan</label>
                <select value={newOrg.plan}
                  onChange={e => setNewOrg(p => ({ ...p, plan: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                  <option>Starter</option>
                  <option>Growth</option>
                  <option>Enterprise</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Status</label>
                <select value={newOrg.status}
                  onChange={e => setNewOrg(p => ({ ...p, status: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-slate-500 hover:bg-[#F1F5F9]">
                  Cancel
                </button>
                <button onClick={handleAdd}
                  className="flex-1 py-2.5 bg-[#1253A4] text-white rounded-xl text-sm font-semibold hover:bg-[#0d47a1]">
                  Add Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}