"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Download, Trash2, ToggleLeft, ToggleRight, CheckCircle } from "lucide-react";
import { downloadJobsExcel } from "@/lib/excelExport";

export default function AdminJobs() {
  const router = useRouter();
  const [admin,    setAdmin]    = useState(null);
  const [jobs,     setJobs]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("All");
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) { router.push("/admin/login"); return; }
    setAdmin(JSON.parse(stored));
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let res = [...jobs];
    if (search) res = res.filter(j => `${j.title} ${j.company} ${j.location}`.toLowerCase().includes(search.toLowerCase()));
    if (status !== "All") res = res.filter(j => j.status === status);
    setFiltered(res);
  }, [search, status, jobs]);

  const handleToggle = async (j) => {
    const newStatus = j.status === "Active" ? "Inactive" : "Active";
    await supabase.from("jobs").update({ status: newStatus }).eq("id", j.id);
    setJobs(p => p.map(x => x.id===j.id ? {...x, status:newStatus} : x));
    showMsg(`Job ${newStatus === "Active" ? "activated" : "deactivated"}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(p => p.filter(x => x.id !== id));
    showMsg("Job deleted");
  };

  const showMsg = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar user={admin}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">All Jobs</h1>
            <p className="text-sm text-[#64748B]">{jobs.filter(j=>j.status==="Active").length} active · {jobs.length} total</p>
          </div>
          <button onClick={() => downloadJobsExcel(filtered, "All_Jobs_Admin")}
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
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
              <input placeholder="Search title, company, location..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] outline-none bg-white">
              {["All","Active","Inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["#","Title","Posted By","Type","Mode","Status","Posted","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide py-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-10 text-[#64748B]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-[#64748B] text-sm">No jobs found</td></tr>
                  ) : filtered.map((j,i) => (
                    <tr key={j.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 text-xs text-[#64748B]">{i+1}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#0F172A] text-sm">{j.title}</div>
                        <div className="text-xs text-[#64748B]">{j.company} · {j.location}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">{j.posted_by || "—"}</td>
                      <td className="py-3 px-4"><span className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2.5 py-0.5 text-xs">{j.job_type}</span></td>
                      <td className="py-3 px-4"><span className="bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-2.5 py-0.5 text-xs">{j.work_mode}</span></td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${j.status==="Active"?"bg-[#DCFCE7] text-[#16A34A]":"bg-[#F1F5F9] text-[#64748B]"}`}>{j.status}</span>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">
                        {j.created_at ? new Date(j.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggle(j)} className="p-1.5 rounded-lg hover:bg-[#F1F5F9]">
                            {j.status==="Active" ? <ToggleRight size={18} className="text-green-500"/> : <ToggleLeft size={18} className="text-[#64748B]"/>}
                          </button>
                          <button onClick={() => handleDelete(j.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
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
