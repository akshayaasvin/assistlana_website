"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Eye, RefreshCw, Search, X } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { downloadInternshipApplicationsCsv, downloadInternshipApplicationsExcel } from "@/lib/excelExport";
import { supabase } from "@/lib/supabase";

const ADMIN_UID = "67f399fc-0ce3-4589-b1b4-ef7de2541cda";
const STATUSES = ["New", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];
const legacyStatuses = ["Pending", ...STATUSES];

function displayDate(value) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}
function resumePath(value) {
  if (!value || !value.startsWith("http")) return value || "";
  const marker = "/internship-resumes/";
  const index = value.indexOf(marker);
  return index >= 0 ? decodeURIComponent(value.slice(index + marker.length).split("?")[0]) : "";
}
function statusStyle(status) {
  return { New:"bg-slate-100 text-slate-700", "Under Review":"bg-amber-100 text-amber-800", Shortlisted:"bg-emerald-100 text-emerald-700", Interview:"bg-blue-100 text-blue-700", Selected:"bg-violet-100 text-violet-700", Rejected:"bg-red-100 text-red-700", Pending:"bg-yellow-100 text-yellow-800" }[status] || "bg-slate-100 text-slate-700";
}

export default function AdminInternships() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [role, setRole] = useState("All");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadApplications = async () => {
    setLoading(true); setError("");
    const { data, error: queryError } = await supabase.from("internship_applications").select("*").order("applied_at", { ascending: false });
    if (queryError) setError(`Applications could not be loaded: ${queryError.message}`);
    setApplications(data || []); setLoading(false);
  };

  useEffect(() => {
    let live = true;
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      if (!live) return;
      if (data.user?.id !== ADMIN_UID) { router.replace("/admin/login"); return; }
      setAdmin({ id:data.user.id, email:data.user.email, name:"Admin", role:"Administrator" });
      loadApplications();
    };
    checkAdmin();
    return () => { live = false; };
  }, [router]);

  const roles = useMemo(() => ["All", ...new Set(applications.map((app) => app.role).filter(Boolean))], [applications]);
  const filtered = useMemo(() => applications
    .filter((app) => {
      const fields = [app.name, app.email, app.phone, app.college, app.role].filter(Boolean).join(" ").toLowerCase();
      return (!search || fields.includes(search.toLowerCase())) && (status === "All" || app.status === status) && (role === "All" || app.role === role);
    })
    .sort((a, b) => sort === "newest" ? new Date(b.applied_at || 0) - new Date(a.applied_at || 0) : new Date(a.applied_at || 0) - new Date(b.applied_at || 0)), [applications, role, search, sort, status]);

  const updateStatus = async (application, nextStatus) => {
    setSaving(true);
    const { error: updateError } = await supabase.from("internship_applications").update({ status:nextStatus }).eq("id", application.id);
    setSaving(false);
    if (updateError) { setError(`Status update failed: ${updateError.message}`); return; }
    const updated = { ...application, status:nextStatus };
    setApplications((items) => items.map((item) => item.id === application.id ? updated : item));
    setSelected(updated);
  };
  const openResume = async (application) => {
    const path = resumePath(application.resume_url);
    if (!path) return;
    const { data, error: urlError } = await supabase.storage.from("internship-resumes").createSignedUrl(path, 60);
    if (urlError || !data?.signedUrl) { setError(`Resume could not be opened: ${urlError?.message || "missing file"}`); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  if (!admin) return null;
  return <div className="min-h-screen bg-[#F8FAFC] flex">
    <AdminSidebar user={admin}/>
    <main className="ml-0 md:ml-56 flex-1 min-w-0">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 md:px-8">
        <div className="pl-12 md:pl-0"><h1 className="text-xl font-bold text-slate-900">Internship Applications</h1><p className="text-sm text-slate-500">{applications.length} submitted applications</p></div>
        <div className="flex flex-wrap gap-2">
          <button onClick={loadApplications} title="Refresh applications" className="rounded-xl border border-slate-200 p-2 text-slate-600"><RefreshCw size={16}/></button>
          <button onClick={() => downloadInternshipApplicationsCsv(filtered, "Internship_Applications")} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"><Download size={14}/>Export CSV</button>
          <button onClick={() => downloadInternshipApplicationsExcel(filtered, "Internship_Applications")} className="flex items-center gap-2 rounded-xl bg-[#1253A4] px-3 py-2 text-xs font-semibold text-white"><Download size={14}/>Export Excel</button>
        </div>
      </header>
      <div className="p-4 md:p-8">
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Total", applications.length], ["New", applications.filter((app) => app.status === "New").length], ["Under review", applications.filter((app) => app.status === "Under Review").length], ["Shortlisted", applications.filter((app) => app.status === "Shortlisted").length]].map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm"><div className="text-2xl font-extrabold text-[#1253A4]">{value}</div><div className="text-xs text-slate-500">{label}</div></div>)}</div>
        <div className="mb-5 flex flex-wrap gap-2"><label className="relative min-w-[180px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, college, role…" className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1253A4]"/></label><Filter value={status} setValue={setStatus} values={["All", ...legacyStatuses]}/><Filter value={role} setValue={setRole} values={roles}/><Filter value={sort} setValue={setSort} values={["newest", "oldest"]} labels={{ newest:"Newest first", oldest:"Oldest first" }}/></div>
        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr>{["Applicant Name", "Email", "Phone", "College", "Department", "Year", "Internship Role", "Status", "Applied Date", "Resume", "Actions"].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3">{heading}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={11} className="py-14 text-center text-slate-500">Loading applications…</td></tr> : filtered.length === 0 ? <tr><td colSpan={11} className="py-14 text-center text-slate-500">No internship applications found.</td></tr> : filtered.map((app) => <tr key={app.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-900">{app.name || "—"}</td><td className="px-3 py-3 text-xs text-slate-600">{app.email || "—"}</td><td className="px-3 py-3 text-xs text-slate-600">{app.phone || "—"}</td><td className="px-3 py-3 text-xs text-slate-600">{app.college || "—"}</td><td className="px-3 py-3 text-xs text-slate-600">{app.department || "—"}</td><td className="px-3 py-3 text-xs text-slate-600">{app.year_of_study || "—"}</td><td className="px-3 py-3 text-xs text-slate-600">{app.role || "—"}</td><td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${statusStyle(app.status)}`}>{app.status || "—"}</span></td><td className="whitespace-nowrap px-3 py-3 text-xs text-slate-600">{displayDate(app.applied_at)}</td><td className="px-3 py-3"><button disabled={!app.resume_url} onClick={() => openResume(app)} className="text-xs font-semibold text-[#1253A4] underline disabled:no-underline disabled:opacity-40">View</button></td><td className="px-3 py-3"><button onClick={() => setSelected(app)} className="flex items-center gap-1 text-xs font-semibold text-[#1253A4]"><Eye size={14}/>View</button></td></tr>)}</tbody></table></div></div>
      </div>
    </main>
    {selected && <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30"><section className="h-full w-full max-w-xl overflow-y-auto bg-white p-6 shadow-2xl"><div className="mb-6 flex items-center justify-between"><button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm font-semibold text-slate-600"><ArrowLeft size={16}/>Back to Applications</button><button onClick={() => setSelected(null)}><X size={18}/></button></div><h2 className="text-2xl font-bold text-slate-900">{selected.name}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{[["Email",selected.email],["Phone",selected.phone],["College",selected.college],["Department",selected.department],["Year",selected.year_of_study],["Internship Role",selected.role],["Applied Date",displayDate(selected.applied_at)]].map(([label,value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><div className="text-xs font-semibold uppercase text-slate-500">{label}</div><div className="mt-1 break-words text-sm text-slate-800">{value || "—"}</div></div>)}</div>{selected.message && <div className="mt-4 rounded-xl bg-slate-50 p-4"><div className="text-xs font-semibold uppercase text-slate-500">Message</div><p className="mt-2 whitespace-pre-wrap text-sm">{selected.message}</p></div>}<div className="mt-6 flex flex-wrap gap-3"><button disabled={!selected.resume_url} onClick={() => openResume(selected)} className="rounded-xl border border-[#1253A4] px-4 py-2 text-sm font-semibold text-[#1253A4] disabled:opacity-40">View / download resume</button><select disabled={saving} value={selected.status || ""} onChange={(event) => updateStatus(selected, event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">{legacyStatuses.filter((item) => item === "Pending" || STATUSES.includes(item)).map((item) => <option key={item}>{item}</option>)}</select></div></section></div>}
  </div>;
}

function Filter({ value, setValue, values, labels = {} }) { return <select value={value} onChange={(event) => setValue(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">{values.map((item) => <option key={item} value={item}>{labels[item] || item}</option>)}</select>; }
