"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Download, CheckCircle } from "lucide-react";
import { downloadInternshipExcel } from "@/lib/excelExport";

const STATUSES = ["All","Pending","Shortlisted","Rejected","Interview"];

function statusColor(s) {
  if (s === "Shortlisted") return "bg-[#DCFCE7] text-[#16A34A]";
  if (s === "Rejected")    return "bg-[#FEE2E2] text-[#DC2626]";
  if (s === "Interview")   return "bg-[#DBEAFE] text-[#1D4ED8]";
  if (s === "Pending")     return "bg-[#FEF9C3] text-[#854D0E]";
  return "bg-[#F1F5F9] text-[#64748B]";
}

export default function AdminInternships() {
  const router = useRouter();
  const [admin,        setAdmin]        = useState(null);
  const [apps,         setApps]         = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading,      setLoading]      = useState(true);
  const [toast,        setToast]        = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) { router.push("/admin/login"); return; }
    setAdmin(JSON.parse(stored));
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    const { data } = await supabase.from("internship_applications").select("*").order("applied_at", { ascending: false });
    setApps(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let res = [...apps];
    if (search) res = res.filter(a => `${a.name} ${a.email} ${a.college}`.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "All") res = res.filter(a => a.status === statusFilter);
    setFiltered(res);
  }, [search, statusFilter, apps]);

  const handleStatusChange = async (id, status) => {
    await supabase.from("internship_applications").update({ status }).eq("id", id);
    setApps(p => p.map(a => a.id===id ? {...a, status} : a));
    setToast("Status updated"); setTimeout(() => setToast(""), 2000);
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar user={admin}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">Internship Applications</h1>
            <p className="text-sm text-[#64748B]">{apps.length} total applications</p>
          </div>
          <button onClick={() => downloadInternshipExcel(filtered, "Internship_Applications_Admin")}
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
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
            {[
              { label:"Total",       val:apps.length,                                   color:"text-[#0284C7]" },
              { label:"Pending",     val:apps.filter(a=>a.status==="Pending").length,    color:"text-[#854D0E]" },
              { label:"Shortlisted", val:apps.filter(a=>a.status==="Shortlisted").length,color:"text-[#16A34A]" },
              { label:"Interview",   val:apps.filter(a=>a.status==="Interview").length,  color:"text-[#1D4ED8]" },
              { label:"Rejected",    val:apps.filter(a=>a.status==="Rejected").length,   color:"text-[#DC2626]" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 text-center shadow-sm">
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-[#64748B]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
              <input placeholder="Search name, email, college..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] outline-none bg-white">
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["#","Name","Email","Phone","College","Dept","Year","Role","Applied","Status","Resume"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide py-3 px-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={11} className="text-center py-10 text-[#64748B]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-10 text-[#64748B] text-sm">No applications found</td></tr>
                  ) : filtered.map((a,i) => (
                    <tr key={a.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                      <td className="py-2.5 px-3 text-xs text-[#64748B]">{i+1}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#0F172A] whitespace-nowrap">{a.name}</td>
                      <td className="py-2.5 px-3 text-xs text-[#64748B]">{a.email}</td>
                      <td className="py-2.5 px-3 text-xs text-[#64748B]">{a.phone}</td>
                      <td className="py-2.5 px-3 text-xs text-[#64748B] max-w-[120px] truncate">{a.college}</td>
                      <td className="py-2.5 px-3 text-xs text-[#64748B] max-w-[100px] truncate">{a.department}</td>
                      <td className="py-2.5 px-3 text-xs text-[#64748B] whitespace-nowrap">{a.year_of_study}</td>
                      <td className="py-2.5 px-3 text-xs text-[#64748B] whitespace-nowrap">{a.role}</td>
                      <td className="py-2.5 px-3 text-xs text-[#64748B] whitespace-nowrap">
                        {a.applied_at ? new Date(a.applied_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <select value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)}
                          className={`text-xs font-semibold rounded-lg px-2 py-1 border-0 outline-none cursor-pointer ${statusColor(a.status)}`}>
                          {["Pending","Shortlisted","Interview","Rejected"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="py-2.5 px-3">
                        {a.resume_url ? (
                          <a href={a.resume_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#0284C7] underline font-semibold whitespace-nowrap">View</a>
                        ) : <span className="text-xs text-[#64748B]">—</span>}
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
