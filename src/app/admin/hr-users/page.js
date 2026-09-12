"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Download, Trash2, ToggleLeft, ToggleRight, CheckCircle, Plus, X, AlertCircle } from "lucide-react";
import { downloadHRUsersExcel } from "@/lib/excelExport";

function timeAgo(ts) {
  if (!ts) return "—";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

function AddHRModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", company:"ASSISTLANA" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleAdd = async () => {
    setError("");
    if (!form.name || !form.email) { setError("Name and Email are required."); return; }
    setLoading(true);
    const { error: dbErr } = await supabase.from("hr_registry").insert([{ ...form, status:"Active" }]);
    if (dbErr) { setError(dbErr.message.includes("unique") ? "Email already exists." : dbErr.message); setLoading(false); return; }
    setLoading(false); onAdded();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] px-6 py-4 flex items-center justify-between">
          <div className="text-white font-bold">Add HR User</div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm">
              <AlertCircle size={14}/>{error}
            </div>
          )}
          {[
            { label:"Full Name *", key:"name",    type:"text",  ph:"e.g. Kavitha Nair" },
            { label:"Email *",     key:"email",   type:"email", ph:"hr@company.com" },
            { label:"Phone",       key:"phone",   type:"tel",   ph:"+91 9876543210" },
            { label:"Company",     key:"company", type:"text",  ph:"Company name" },
          ].map(f => (
            <div key={f.key} className="mb-4">
              <label className="block text-sm font-semibold text-[#64748B] mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.ph} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]:e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
          ))}
          <button onClick={handleAdd} disabled={loading}
            className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90">
            {loading ? "Adding..." : "Add HR User →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminHRUsers() {
  const router = useRouter();
  const [admin,    setAdmin]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("All");
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [toast,    setToast]    = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) { router.push("/admin/login"); return; }
    setAdmin(JSON.parse(stored));
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase.from("hr_registry").select("*").order("registered_at", { ascending: false });
    setUsers(data || []);
    setFiltered(data || []);
    setLoading(false);
  };

  useEffect(() => {
    let res = [...users];
    if (search) res = res.filter(u => `${u.name} ${u.email} ${u.company}`.toLowerCase().includes(search.toLowerCase()));
    if (status !== "All") res = res.filter(u => u.status === status);
    setFiltered(res);
  }, [search, status, users]);

  const handleToggle = async (u) => {
    const newStatus = u.status === "Active" ? "Inactive" : "Active";
    await supabase.from("hr_registry").update({ status: newStatus }).eq("id", u.id);
    setUsers(p => p.map(x => x.id===u.id ? {...x, status:newStatus} : x));
    showMsg(`HR user ${newStatus === "Active" ? "activated" : "deactivated"}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this HR user? This cannot be undone.")) return;
    await supabase.from("hr_registry").delete().eq("id", id);
    setUsers(p => p.filter(x => x.id !== id));
    showMsg("HR user deleted");
  };

  const showMsg = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  if (!admin) return null;

  const active   = users.filter(u => u.status==="Active").length;
  const inactive = users.filter(u => u.status==="Inactive").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <AdminSidebar user={admin}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">HR Users</h1>
            <p className="text-sm text-[#64748B]">{users.length} total · {active} active</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => downloadHRUsersExcel(filtered, "HR_Users")}
              className="flex items-center gap-2 border border-[#E2E8F0] text-[#64748B] px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#F1F5F9]">
              <Download size={14}/> Export Excel
            </button>
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white px-3 py-2 rounded-xl text-xs font-semibold hover:opacity-90">
              <Plus size={14}/> Add HR User
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white border border-[#E2E8F0] shadow-md px-4 py-2.5 rounded-xl text-sm">
            <CheckCircle size={14} className="text-green-500"/>{toast}
          </div>
        )}

        <div className="p-4 md:p-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label:"Total",    val:users.length, color:"text-[#0284C7]" },
              { label:"Active",   val:active,       color:"text-[#16A34A]" },
              { label:"Inactive", val:inactive,     color:"text-[#64748B]" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 text-center shadow-sm">
                <div className={`text-2xl font-extrabold ${s.color}`}>{s.val}</div>
                <div className="text-xs text-[#64748B]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
              <input placeholder="Search name, email, company..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] outline-none bg-white">
              {["All","Active","Inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                    {["#","Name","Email","Phone","Company","Registered","Last Login","Status","Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide py-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="text-center py-10 text-[#64748B]">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-[#64748B] text-sm">No HR users found</td></tr>
                  ) : filtered.map((u,i) => (
                    <tr key={u.id} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC]">
                      <td className="py-3 px-4 text-xs text-[#64748B]">{i+1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-gradient-to-r from-[#0284C7] to-[#0D9488] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.name||"?")[0]}
                          </div>
                          <span className="text-sm font-semibold text-[#0F172A]">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">{u.email}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">{u.phone || "—"}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B]">{u.company || "—"}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">{timeAgo(u.registered_at)}</td>
                      <td className="py-3 px-4 text-xs text-[#64748B] whitespace-nowrap">{timeAgo(u.last_login)}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold rounded-full px-2.5 py-0.5 ${
                          u.status==="Active" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                        }`}>{u.status}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggle(u)} title={u.status==="Active"?"Deactivate":"Activate"}
                            className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-all">
                            {u.status==="Active" ? <ToggleRight size={18} className="text-green-500"/> : <ToggleLeft size={18} className="text-[#64748B]"/>}
                          </button>
                          <button onClick={() => handleDelete(u.id)} title="Delete"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-all">
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

      {showAdd && (
        <AddHRModal onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); fetchUsers(); showMsg("HR user added!"); }}/>
      )}
    </div>
  );
}
