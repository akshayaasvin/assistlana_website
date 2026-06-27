"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Users, Briefcase, FileText, Mic, ClipboardList, Settings,
  LogOut, RefreshCw, Trash2, CheckCircle, XCircle, Download,
  Upload, AlertTriangle, ChevronDown, Eye, Database, BarChart3,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ADMIN_UID  = "dd0b11eb-76c6-4afd-94b4-0d0845c85b5c";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey    = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sb = createClient(supabaseUrl, anonKey);

const TABS = ["Overview","HR Approvals","All HR","Candidates","Jobs","Storage","Import / Export"];

// ─── helpers ─────────────────────────────────────────────────────────────────
function Badge({ status }) {
  const map = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    Active:   "bg-green-100 text-green-700",
    Inactive: "bg-slate-100 text-slate-500",
    Pending:  "bg-yellow-100 text-yellow-700",
    Shortlisted:"bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {status || "—"}
    </span>
  );
}

async function adminAction(action, id, adminId) {
  const res = await fetch("/api/admin/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, id, adminId }),
  });
  return res.json();
}

function dlXlsx(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), filename);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router    = useRouter();
  const [admin,   setAdmin]   = useState(null);
  const [tab,     setTab]     = useState("Overview");
  const [toast,   setToast]   = useState("");
  const [stats,   setStats]   = useState({ candidates:0, hr:0, jobs:0, pendingHR:0, resumes:0, mocks:0, internships:0 });
  const [loading, setLoading] = useState(true);

  // Tab data
  const [pendingHR,        setPendingHR]        = useState([]);
  const [allHR,            setAllHR]            = useState([]);
  const [candidates,       setCandidates]       = useState([]);
  const [jobs,             setJobs]             = useState([]);
  const [counts,           setCounts]           = useState({});
  const [credentialsModal, setCredentialsModal] = useState(null); // { hr_login_id, password, hr_name, company_name, email }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("adminAuth");
      if (!raw) { router.replace("/admin/login"); return; }
      const auth = JSON.parse(raw);
      if (auth.id !== ADMIN_UID) { router.replace("/admin/login"); return; }
      setAdmin(auth);
    } catch { router.replace("/admin/login"); return; }
  }, []);

  useEffect(() => {
    if (admin) loadAll();
  }, [admin]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const loadAll = async () => {
    setLoading(true);
    const [hrRes, candRes, jobsRes, resumeRes, mockRes, intRes] = await Promise.all([
      sb.from("hr_registry").select("*", { count:"exact" }).order("registered_at", { ascending: false }),
      sb.from("candidates").select("*", { count:"exact" }).order("registered_at", { ascending: false }).limit(100),
      sb.from("jobs").select("*", { count:"exact" }).order("created_at", { ascending: false }),
      sb.from("resume_suggestions").select("id", { count:"exact" }),
      sb.from("mock_interviews").select("id", { count:"exact" }),
      sb.from("internship_applications").select("id", { count:"exact" }),
    ]);

    const hrData  = hrRes.data  || [];
    const pending = hrData.filter(h => h.status === "pending");

    setAllHR(hrData);
    setPendingHR(pending);
    setCandidates(candRes.data || []);
    setJobs(jobsRes.data || []);

    setStats({
      candidates:  candRes.count  || 0,
      hr:          hrRes.count    || 0,
      jobs:        jobsRes.count  || 0,
      pendingHR:   pending.length,
      resumes:     resumeRes.count || 0,
      mocks:       mockRes.count   || 0,
      internships: intRes.count    || 0,
    });

    setCounts({
      candidates:             candRes.count   || 0,
      hr_registry:            hrRes.count     || 0,
      jobs:                   jobsRes.count   || 0,
      resume_suggestions:     resumeRes.count || 0,
      mock_interviews:        mockRes.count   || 0,
      internship_applications:intRes.count    || 0,
    });

    setLoading(false);
  };

  const hrAction = async (action, id) => {
    const r = await adminAction(action, id, ADMIN_UID);
    if (r.success) {
      if (action === "approve_hr" && r.credentials) {
        setCredentialsModal(r.credentials);
      } else {
        showToast(r.message);
      }
      loadAll();
    } else {
      showToast("Error: " + r.error);
    }
  };

  const logout = async () => {
    try { await sb.auth.signOut(); } catch (_) {}
    localStorage.removeItem("adminAuth");
    router.push("/admin/login");
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col">

      {/* Header */}
      <header className="bg-[#0B1D3A] px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0EA5C9] rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
          <div>
            <div className="text-white font-bold text-sm">ASSISTLANA</div>
            <div className="text-[#0EA5C9] text-[10px] tracking-widest uppercase">Admin Panel</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs hidden sm:block">{admin.email}</span>
          <button onClick={loadAll} className="p-1.5 text-slate-400 hover:text-white transition-all" title="Refresh">
            <RefreshCw size={14}/>
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-semibold transition-all">
            <LogOut size={14}/> Logout
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 bg-white border border-[#E2E8F0] shadow-lg px-4 py-2.5 rounded-xl text-sm text-[#0F172A] flex items-center gap-2">
          <CheckCircle size={14} className="text-green-500"/>{toast}
        </div>
      )}

      {/* Stats row */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-5xl">
          {[
            { label:"Candidates",   val:stats.candidates, color:"#1253A4", icon:Users      },
            { label:"HR Users",     val:stats.hr,         color:"#0EA5C9", icon:Briefcase  },
            { label:"Active Jobs",  val:stats.jobs,       color:"#10B981", icon:FileText   },
            { label:"Pending HR",   val:stats.pendingHR,  color:"#F59E0B", icon:AlertTriangle },
          ].map((s,i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.color + "20" }}>
                  <Icon size={16} style={{ color: s.color }}/>
                </div>
                <div>
                  <div className="text-xl font-bold" style={{ color: s.color }}>{loading ? "…" : s.val}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                tab === t
                  ? "border-[#1253A4] text-[#1253A4]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}>
              {t} {t === "HR Approvals" && stats.pendingHR > 0 && (
                <span className="ml-1 bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{stats.pendingHR}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">

        {/* ── TAB 1: Overview ── */}
        {tab === "Overview" && (
          <div className="space-y-6">
            <h2 className="font-bold text-[#1E293B] text-lg">Platform Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label:"Total Candidates",  val:stats.candidates,  color:"#1253A4", icon:"👥" },
                { label:"HR Users",          val:stats.hr,          color:"#0EA5C9", icon:"🏢" },
                { label:"Jobs Posted",       val:stats.jobs,        color:"#10B981", icon:"💼" },
                { label:"Pending Approvals", val:stats.pendingHR,   color:"#F59E0B", icon:"⏳" },
                { label:"Resume Scans",      val:stats.resumes,     color:"#8B5CF6", icon:"📄" },
                { label:"Mock Interviews",   val:stats.mocks,       color:"#EF4444", icon:"🎤" },
              ].map((s,i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm text-center">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{loading ? "…" : s.val}</div>
                  <div className="text-sm text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
            {stats.pendingHR > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-800 text-sm font-medium">
                  <AlertTriangle size={16}/> {stats.pendingHR} HR account{stats.pendingHR > 1 ? "s" : ""} waiting for approval
                </div>
                <button onClick={() => setTab("HR Approvals")}
                  className="text-xs font-semibold text-yellow-700 hover:underline">Review →</button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2 & 3: HR ── */}
        {(tab === "HR Approvals" || tab === "All HR") && (
          <HRTable
            data={tab === "HR Approvals" ? pendingHR : allHR}
            title={tab === "HR Approvals" ? "Pending HR Approvals" : "All HR Users"}
            onAction={hrAction}
            showApprove={true}
            showReject={true}
            loading={loading}
          />
        )}

        {/* ── TAB 4: Candidates ── */}
        {tab === "Candidates" && (
          <CandidatesTable data={candidates} onAction={hrAction} onExport={() => {
            dlXlsx(candidates.map(c => ({
              name: c.name, email: c.email, phone: c.phone, college: c.college,
              status: c.status, ai_score: c.ai_score, ats_score: c.ats_score,
              skills: Array.isArray(c.skills) ? c.skills.join(", ") : c.skills,
              registered_at: c.registered_at,
            })), "candidates_export.xlsx");
          }} loading={loading}/>
        )}

        {/* ── TAB 5: Jobs ── */}
        {tab === "Jobs" && (
          <JobsTable data={jobs} onAction={hrAction} onExport={() => {
            dlXlsx(jobs.map(j => ({
              title: j.title, company: j.company, location: j.location,
              job_type: j.job_type, work_mode: j.work_mode, experience: j.experience,
              status: j.status, created_at: j.created_at,
            })), "jobs_export.xlsx");
          }} loading={loading}/>
        )}

        {/* ── TAB 6: Storage ── */}
        {tab === "Storage" && (
          <StorageTab counts={counts} adminId={ADMIN_UID} onDone={() => { loadAll(); showToast("Done!"); }} showToast={showToast}/>
        )}

        {/* ── TAB 7: Import / Export ── */}
        {tab === "Import / Export" && (
          <ImportExportTab adminId={ADMIN_UID} showToast={showToast}
            onImportDone={loadAll}
            candidates={candidates} allHR={allHR} jobs={jobs}/>
        )}
      </div>

      {/* Credentials Modal */}
      {credentialsModal && (
        <CredentialsModal
          credentials={credentialsModal}
          onClose={() => { setCredentialsModal(null); loadAll(); }}
        />
      )}
    </div>
  );
}

// ─── HR Table ─────────────────────────────────────────────────────────────────
function HRTable({ data, title, onAction, loading }) {
  return (
    <div>
      <h2 className="font-bold text-[#1E293B] text-lg mb-4">{title} ({data.length})</h2>
      {loading ? <Spinner/> : data.length === 0 ? (
        <EmptyState icon="🏢" msg="No HR accounts found"/>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Name","Email","Phone","Company","Status","Registered","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((hr, i) => (
                  <tr key={hr.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-all">
                    <td className="py-3 px-4 text-sm font-semibold text-[#1E293B]">{hr.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{hr.email}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{hr.phone || "—"}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{hr.company || "—"}</td>
                    <td className="py-3 px-4"><Badge status={hr.status}/></td>
                    <td className="py-3 px-4 text-xs text-slate-400">{hr.registered_at ? new Date(hr.registered_at).toLocaleDateString() : "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {hr.status !== "approved" && (
                          <button onClick={() => onAction("approve_hr", hr.id)}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 transition-all">
                            Approve
                          </button>
                        )}
                        {hr.status !== "rejected" && (
                          <button onClick={() => onAction("reject_hr", hr.id)}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold hover:bg-yellow-200 transition-all">
                            Reject
                          </button>
                        )}
                        <button onClick={() => confirm(`Delete HR account: ${hr.name}?`) && onAction("delete_hr", hr.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Candidates Table ──────────────────────────────────────────────────────────
function CandidatesTable({ data, onAction, onExport, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#1E293B] text-lg">Candidates ({data.length})</h2>
        <button onClick={onExport}
          className="flex items-center gap-1.5 bg-[#10B981] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#059669] transition-all">
          <Download size={13}/> Export Excel
        </button>
      </div>
      {loading ? <Spinner/> : data.length === 0 ? (
        <EmptyState icon="👥" msg="No candidates yet"/>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Name","Email","Phone","College","Status","AI Score","Registered","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-all">
                    <td className="py-3 px-4 text-sm font-semibold text-[#1E293B]">{c.name}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{c.email}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{c.phone || "—"}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{c.college || "—"}</td>
                    <td className="py-3 px-4"><Badge status={c.status}/></td>
                    <td className="py-3 px-4 text-sm font-bold text-[#1253A4]">{c.ai_score || 0}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{c.registered_at ? new Date(c.registered_at).toLocaleDateString() : "—"}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => confirm(`Delete candidate "${c.name}" and all their data?`) && onAction("delete_candidate", c.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Jobs Table ────────────────────────────────────────────────────────────────
function JobsTable({ data, onAction, onExport, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#1E293B] text-lg">Jobs ({data.length})</h2>
        <button onClick={onExport}
          className="flex items-center gap-1.5 bg-[#10B981] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#059669] transition-all">
          <Download size={13}/> Export Excel
        </button>
      </div>
      {loading ? <Spinner/> : data.length === 0 ? (
        <EmptyState icon="💼" msg="No jobs posted"/>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {["Title","Company","Location","Type","Status","Posted","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((j, i) => (
                  <tr key={j.id || i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-all">
                    <td className="py-3 px-4 text-sm font-semibold text-[#1E293B]">{j.title}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{j.company}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{j.location}</td>
                    <td className="py-3 px-4 text-sm text-slate-500">{j.job_type}</td>
                    <td className="py-3 px-4"><Badge status={j.status}/></td>
                    <td className="py-3 px-4 text-xs text-slate-400">{j.created_at ? new Date(j.created_at).toLocaleDateString() : "—"}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => confirm(`Delete job "${j.title}"?`) && onAction("delete_job", j.id)}
                        className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={13}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Storage Tab ───────────────────────────────────────────────────────────────
function StorageTab({ counts, adminId, onDone, showToast }) {
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(null);

  const doAction = async (action, label) => {
    setLoading(action);
    const r = await fetch("/api/admin/action", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action, adminId }),
    }).then(r => r.json());
    setLoading(null);
    if (r.success) { showToast(label + " — done!"); onDone(); }
    else showToast("Error: " + r.error);
  };

  const dangerActions = [
    { action:"clear_mock_interviews",    label:"Clear ALL Mock Interviews"    },
    { action:"clear_resume_suggestions", label:"Clear ALL Resume Suggestions" },
    { action:"clear_job_applications",   label:"Clear ALL Job Applications"   },
  ];

  const bulkActions = [
    { action:"bulk_delete_old_jobs",         label:"Delete Jobs older than 30 days"          },
    { action:"bulk_delete_old_resumes",      label:"Delete Resume Suggestions older than 30 days" },
    { action:"bulk_delete_old_interviews",   label:"Delete Mock Interviews older than 30 days"    },
    { action:"bulk_delete_rejected_hr",      label:"Delete Rejected HR Accounts"             },
    { action:"bulk_delete_old_applications", label:"Delete Job Applications older than 60 days"   },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-[#1E293B] text-lg">Storage Manager</h2>

      {/* Record counts */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="font-semibold text-[#1E293B] mb-3 text-sm flex items-center gap-2">
          <Database size={15} className="text-[#0EA5C9]"/> Record Counts
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(counts).map(([table, count]) => (
            <div key={table} className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <div className="text-lg font-bold text-[#1253A4]">{count}</div>
              <div className="text-xs text-slate-400">{table.replace(/_/g," ")}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk deletes */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="font-semibold text-[#1E293B] mb-3 text-sm">Bulk Delete</div>
        <div className="space-y-2">
          {bulkActions.map(({ action, label }) => (
            <div key={action} className="flex items-center justify-between p-3 rounded-xl border border-[#F1F5F9] hover:border-[#E2E8F0]">
              <span className="text-sm text-slate-600">{label}</span>
              <button
                disabled={loading === action}
                onClick={() => {
                  if (window.confirm(`Confirm: ${label}?`)) doAction(action, label);
                }}
                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-100 transition-all disabled:opacity-50">
                {loading === action ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border-2 border-red-200 p-5">
        <div className="font-bold text-red-600 mb-1 text-sm flex items-center gap-2">
          <AlertTriangle size={15}/> Danger Zone
        </div>
        <p className="text-xs text-slate-500 mb-4">These actions delete ALL records. Type <code className="bg-[#F1F5F9] px-1 rounded">DELETE</code> to confirm each.</p>
        <div className="space-y-3">
          {dangerActions.map(({ action, label }) => (
            <DangerAction key={action} label={label} action={action} adminId={adminId}
              onDone={() => { showToast(label + " cleared!"); onDone(); }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function DangerAction({ label, action, adminId, onDone }) {
  const [val, setVal]     = useState("");
  const [busy, setBusy]   = useState(false);

  const execute = async () => {
    if (val !== "DELETE") return;
    setBusy(true);
    const r = await fetch("/api/admin/action", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ action, adminId }),
    }).then(r => r.json());
    setBusy(false);
    if (r.success) { setVal(""); onDone(); }
  };

  return (
    <div className="p-3 rounded-xl bg-red-50 border border-red-200">
      <div className="text-sm font-semibold text-red-700 mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} placeholder="Type DELETE to confirm"
          className="flex-1 px-3 py-1.5 border border-red-200 rounded-lg text-xs outline-none bg-white"/>
        <button onClick={execute} disabled={val !== "DELETE" || busy}
          className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 transition-all">
          {busy ? "..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}

// ─── Import / Export Tab ───────────────────────────────────────────────────────
function ImportExportTab({ adminId, showToast, onImportDone, candidates, allHR, jobs }) {
  const [importTab, setImportTab] = useState("Candidates");
  const [file,      setFile]      = useState(null);
  const [preview,   setPreview]   = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  const IMPORT_TYPES = ["Candidates","HR","Jobs"];

  const templates = {
    Candidates: { filename:"candidate_template.xlsx", headers:["name","email","password","phone","college","status","skills","ai_score","ats_score","jd_match"],
      sample:{ name:"Jane Doe",email:"jane@example.com",password:"Pass@123",phone:"9876543210",college:"IIT Madras",status:"Pending",skills:"React,Node",ai_score:0,ats_score:0,jd_match:0 } },
    HR: { filename:"hr_template.xlsx", headers:["name","email","phone","company"],
      sample:{ name:"HR Manager",email:"hr@company.com",phone:"9876543210",company:"ASSISTLANA" } },
    Jobs: { filename:"jobs_template.xlsx", headers:["title","company","location","job_type","work_mode","experience","salary","description","skills_required","apply_type","external_link","status"],
      sample:{ title:"Software Engineer",company:"ASSISTLANA",location:"Chennai",job_type:"Full-time",work_mode:"Hybrid",experience:"2-4 years",salary:"₹8-12 LPA",description:"Build scalable AI products",skills_required:"React,Node,SQL",apply_type:"internal",external_link:"",status:"Active" } },
  };

  const downloadTemplate = () => {
    const t = templates[importTab];
    const ws = XLSX.utils.json_to_sheet([t.sample], { header: t.headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    const buf = XLSX.write(wb, { bookType:"xlsx", type:"array" });
    saveAs(new Blob([buf], { type:"application/octet-stream" }), t.filename);
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setImportResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type:"binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval:"" });
      setTotalRows(rows.length);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsBinaryString(f);
  };

  const doImport = async () => {
    if (!file) return;
    setImporting(true); setImportResult(null);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const wb = XLSX.read(e.target.result, { type:"binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(ws, { defval:"" });
      const type = importTab.toLowerCase() === "hr" ? "hr" : importTab.toLowerCase();
      const r = await fetch("/api/admin/import", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ type: type === "candidates" ? "candidates" : type, rows, adminId }),
      }).then(r => r.json());
      setImporting(false);
      if (r.error) { showToast("Error: " + r.error); }
      else { setImportResult(r); onImportDone(); }
    };
    reader.readAsBinaryString(file);
  };

  const exportAll = (type) => {
    if (type === "candidates") {
      dlXlsx(candidates.map(c => ({ name:c.name, email:c.email, phone:c.phone, college:c.college, status:c.status, ai_score:c.ai_score, ats_score:c.ats_score, skills: Array.isArray(c.skills)?c.skills.join(","):c.skills })), "candidates_export.xlsx");
    } else if (type === "hr") {
      dlXlsx(allHR.map(h => ({ name:h.name, email:h.email, phone:h.phone, company:h.company, status:h.status })), "hr_export.xlsx");
    } else if (type === "jobs") {
      dlXlsx(jobs.map(j => ({ title:j.title, company:j.company, location:j.location, job_type:j.job_type, work_mode:j.work_mode, experience:j.experience, status:j.status, created_at:j.created_at })), "jobs_export.xlsx");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-[#1E293B] text-lg">Import / Export</h2>

      {/* IMPORT */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="font-semibold text-[#1E293B] mb-4 text-sm flex items-center gap-2">
          <Upload size={15} className="text-[#1253A4]"/> Import Data
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-5 bg-[#F8FAFC] rounded-xl p-1">
          {IMPORT_TYPES.map(t => (
            <button key={t} onClick={() => { setImportTab(t); setFile(null); setPreview([]); setImportResult(null); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${importTab===t?"bg-white shadow text-[#1253A4]":"text-slate-500"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Step 1: Download template */}
        <div className="mb-4 p-4 bg-[#EFF6FF] rounded-xl border border-[#DBEAFE]">
          <div className="text-xs font-bold text-[#1253A4] mb-1">Step 1 — Download Template</div>
          <button onClick={downloadTemplate}
            className="flex items-center gap-1.5 bg-[#1253A4] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#0d47a1] transition-all">
            <Download size={12}/> {templates[importTab].filename}
          </button>
        </div>

        {/* Step 2: Upload */}
        <div className="mb-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
          <div className="text-xs font-bold text-slate-600 mb-2">Step 2 — Upload Filled Excel</div>
          <div
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${file ? "border-[#0D9488] bg-[#F0FDFA]" : "border-[#E2E8F0] hover:border-[#1253A4]"}`}>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>
            <div className="text-2xl mb-1">{file ? "📊" : "☁️"}</div>
            <div className="text-sm font-semibold text-slate-700">{file ? file.name : "Click to upload Excel / CSV"}</div>
            {totalRows > 0 && <div className="text-xs text-[#0D9488] mt-1">{totalRows} rows found</div>}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <div className="text-xs font-semibold text-slate-500 mb-1">Preview (first {preview.length} rows):</div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#F1F5F9]">
                    {Object.keys(preview[0]).slice(0,6).map(k => (
                      <th key={k} className="text-left px-2 py-1 text-slate-500 font-semibold whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-[#F1F5F9]">
                      {Object.values(row).slice(0,6).map((v, j) => (
                        <td key={j} className="px-2 py-1 text-slate-600 whitespace-nowrap">{String(v).slice(0,30)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Step 3: Import */}
        {file && (
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div className="text-xs font-bold text-slate-600 mb-3">Step 3 — Import {totalRows} rows into {importTab}</div>
            <button onClick={doImport} disabled={importing}
              className="w-full bg-[#1253A4] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:bg-[#0d47a1] transition-all">
              {importing ? "Importing..." : `Import ${totalRows} ${importTab} →`}
            </button>
          </div>
        )}

        {/* Import result */}
        {importResult && (
          <div className="mt-3 space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm">
              <div className="font-bold text-green-700 mb-1">Import Complete</div>
              <div className="text-green-600">✅ Imported: {importResult.success}</div>
              <div className="text-yellow-600">⏭️ Skipped (duplicates): {importResult.skipped}</div>
              <div className="text-red-600">❌ Failed: {importResult.failed}</div>
              {importResult.details?.length > 0 && (
                <div className="mt-2 text-xs text-red-500">{importResult.details.slice(0,3).map((d,i) => <div key={i}>{d.row}: {d.reason}</div>)}</div>
              )}
            </div>

            {/* HR credentials table shown only for HR imports */}
            {importResult.credentials?.length > 0 && (
              <div className="p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-[#1253A4] text-sm">HR Login Credentials</div>
                  <button
                    onClick={() => {
                      const data = importResult.credentials.map(c => ({
                        Name: c.name, Company: c.company, Email: c.email,
                        "HR ID": c.hr_login_id, Password: c.plain_password,
                      }));
                      dlXlsx(data, "hr_credentials.xlsx");
                    }}
                    className="flex items-center gap-1.5 bg-[#1253A4] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#0d47a1] transition-all">
                    <Download size={12}/> Export Credentials
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#DBEAFE]">
                        {["Name","Company","Email","HR ID","Password"].map(h => (
                          <th key={h} className="text-left px-3 py-2 text-[#1253A4] font-semibold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.credentials.map((c, i) => (
                        <tr key={i} className="border-b border-[#DBEAFE]">
                          <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{c.name}</td>
                          <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{c.company}</td>
                          <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{c.email}</td>
                          <td className="px-3 py-2 font-mono font-bold text-[#1253A4] whitespace-nowrap">{c.hr_login_id}</td>
                          <td className="px-3 py-2 font-mono font-bold text-[#EA580C] whitespace-nowrap">{c.plain_password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-[#1253A4] mt-2 font-medium">⚠️ Save or export these credentials — passwords won't be shown again.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* EXPORT */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
        <div className="font-semibold text-[#1E293B] mb-4 text-sm flex items-center gap-2">
          <Download size={15} className="text-[#10B981]"/> Export Data
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label:"Export All Candidates", type:"candidates", count:candidates.length },
            { label:"Export All HR",         type:"hr",         count:allHR.length      },
            { label:"Export All Jobs",        type:"jobs",       count:jobs.length       },
          ].map(({ label, type, count }) => (
            <button key={type} onClick={() => exportAll(type)}
              className="flex flex-col items-center gap-1 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl hover:border-[#10B981] hover:bg-[#F0FDF4] transition-all">
              <Download size={18} className="text-[#10B981]"/>
              <div className="text-sm font-semibold text-[#1E293B]">{label}</div>
              <div className="text-xs text-slate-400">{count} records</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Credentials Modal ─────────────────────────────────────────────────────────
function CredentialsModal({ credentials, onClose }) {
  const { hr_login_id, password, hr_name, company_name, email } = credentials;
  const loginUrl = "https://assistlana-website-6fzh.vercel.app/hr/login";

  const copyText = (text) => navigator.clipboard.writeText(text);
  const copyBoth = () => {
    const text = `ASSISTLANA HR Credentials\n\nName: ${hr_name}\nCompany: ${company_name}\nEmail: ${email}\n\nHR ID: ${hr_login_id}\nPassword: ${password}\n\nLogin at: ${loginUrl}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-green-500 rounded-t-2xl px-6 py-4 text-white">
          <div className="text-lg font-bold">✅ HR Account Approved!</div>
          <div className="text-green-100 text-sm mt-0.5">Credentials generated — share with the HR user</div>
        </div>

        <div className="p-6 space-y-4">
          {/* Info */}
          <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] space-y-1 text-sm">
            <div><span className="text-slate-400 text-xs">Name</span><div className="font-semibold text-[#1E293B]">{hr_name}</div></div>
            <div><span className="text-slate-400 text-xs">Company</span><div className="font-semibold text-[#1E293B]">{company_name}</div></div>
            <div><span className="text-slate-400 text-xs">Email</span><div className="font-semibold text-[#1E293B]">{email}</div></div>
          </div>

          {/* HR ID */}
          <div>
            <div className="text-xs font-bold text-slate-600 mb-1.5">HR ID</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl px-4 py-2.5 font-mono font-bold text-[#1253A4] text-sm tracking-widest">
                {hr_login_id}
              </div>
              <button onClick={() => copyText(hr_login_id)}
                className="px-3 py-2.5 bg-[#1253A4] text-white text-xs font-semibold rounded-xl hover:bg-[#0d47a1] transition-all whitespace-nowrap">
                Copy
              </button>
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="text-xs font-bold text-slate-600 mb-1.5">Password</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl px-4 py-2.5 font-mono font-bold text-[#EA580C] text-sm tracking-widest">
                {password}
              </div>
              <button onClick={() => copyText(password)}
                className="px-3 py-2.5 bg-[#EA580C] text-white text-xs font-semibold rounded-xl hover:bg-[#c2410c] transition-all whitespace-nowrap">
                Copy
              </button>
            </div>
          </div>

          {/* Copy Both */}
          <button onClick={copyBoth}
            className="w-full bg-green-500 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-green-600 transition-all">
            Copy Both (with login URL)
          </button>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-start gap-2">
            <AlertTriangle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5"/>
            <div className="text-xs text-yellow-800 font-medium">
              Password shown only once — save it now. Login URL: <span className="font-mono text-yellow-900">{loginUrl}</span>
            </div>
          </div>

          {/* Close */}
          <button onClick={onClose}
            className="w-full border border-[#E2E8F0] text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F8FAFC] transition-all">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tiny shared UI ────────────────────────────────────────────────────────────
function Spinner() {
  return <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#1253A4]/20 border-t-[#1253A4] rounded-full animate-spin"/></div>;
}
function EmptyState({ icon, msg }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <div className="text-slate-400 font-medium">{msg}</div>
    </div>
  );
}
