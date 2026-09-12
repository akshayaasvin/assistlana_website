"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Download, Trash2, ToggleLeft, ToggleRight, CheckCircle } from "lucide-react";
import { downloadCandidatesExcel2 } from "@/lib/excelExport";

function timeAgo(ts) {
  if (!ts) return "—";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

export default function AdminCandidates() {
  const router = useRouter();
  const [admin,    setAdmin]    = useState(null);
  const [cands,    setCands]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("All");
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) { router.push("/admin/login"); return; }
    setAdmin(JSON.parse(stored));
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    const { data } = await supabase.from("candidates").select("*").order("registered_at", { ascending: false });
    setCands(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let res = [...cands];
    if (search) res = res.filter(c => `${c.name} ${c.email} ${c.college}`.toLowerCase().includes(search.toLowerCase()));
    if (status !== "All") res = res.filter(c => c.status === status);
    setFiltered(res);
  }, [search, status, cands]);

  const handleToggle = async (c) => {
    const newStatus = c.status === "Active" ? "Inactive" : "Active";
    await supabase.from("candidates").update({ status: newStatus }).eq("id", c.id);
    setCands(p => p.map(x => x.id===c.id ? {...x, status:newStatus} : x));
    showMsg(`Candidate ${newStatus === "Active" ? "activated" : "deactivated"}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this candidate? This cannot be undone.")) return;
    await supabase.from("candidates").delete().eq("id", id);
    setCands(p => p.filter(x => x.id !== id));
    showMsg("Candidate deleted");
  };

  const showMsg = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar user={admin}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">Job Seekers</h1>
            <p className="text-sm text-[#64748B]">{cands.length} registered candidates</p>
          </div>
          <button onClick={() => downloadCandidatesExcel2(filtered, "Candidates_Admin")}
            className="flex items-center gap-2 border border-[#E2E8F0] text-[#64748B] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#F1F5F9]">
            <Download size={14}/> Export Excel
          </button>
        </div>

        {toast && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white border border-[#E2E8F0] shadow-md px-4 py-2.5 rounded-xl text-sm">
            <CheckCircle size={14} className="text-green-500"/>{toast}
          </div>
        )}

        <div className="p-4 md:p-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
              <input placeholder="Search name, email, college..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] outline-none bg-white">
              {["All","Active","Pending","Shortlisted","Reviewing","Rejected","Inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["#","Name","Email","Phone","College","Skills","ATS Score","Registered","Status","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide py-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} className="text-center py-10 text-[#64748B]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-10 text-[#64748B] text-sm">No candidates found</td></tr>
                  ) : filtered.map((c,i) => (
                    <tr key={c.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 text-xs text-[#64748B]">{i+1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-r from-[#7C3AED] to-[#0284C7] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(c.name||"?")[0]}
                          </div>
                          <span className="text-sm font-semibold text-[#0F172A]">{c.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">{c.email}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">{c.phone || "—"}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B] max-w-[120px] truncate">{c.college || "—"}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(c.skills || []).slice(0,2).map((s,j) => (
                            <span key={j} className="bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-2 py-0.5 text-[10px] font-semibold">{s}</span>
                          ))}
                          {(c.skills||[]).length > 2 && <span className="text-[10px] text-[#64748B]">+{c.skills.length-2}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-bold ${(c.ats_score||0)>=70?"text-green-600":(c.ats_score||0)>=40?"text-amber-600":"text-red-500"}`}>
                          {c.ats_score || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">{timeAgo(c.registered_at)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                          c.status==="Shortlisted" ? "bg-[#DCFCE7] text-[#16A34A]" :
                          c.status==="Rejected"    ? "bg-[#FEE2E2] text-[#DC2626]" :
                          c.status==="Active"      ? "bg-[#DBEAFE] text-[#1D4ED8]" :
                          "bg-[#F1F5F9] text-[#64748B]"
                        }`}>{c.status || "Pending"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggle(c)} title={c.status==="Active"?"Deactivate":"Activate"}
                            className="p-1.5 rounded-lg hover:bg-[#F1F5F9]">
                            {c.status==="Active" ? <ToggleRight size={18} className="text-green-500"/> : <ToggleLeft size={18} className="text-[#64748B]"/>}
                          </button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                            <Trash2 size={15}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
