"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Search, Bell, Eye, EyeOff, X, Download, Filter, ChevronDown, Trash2, Star,
} from "lucide-react";

// ── Phone masking ──────────────────────────────────────────────────────────────
const maskPhone = (phone) => {
  if (!phone) return "N/A";
  const s = String(phone).replace(/\D/g, "");
  if (s.length < 4) return phone;
  return s.slice(0, 2) + "••••••" + s.slice(-2);
};

// ── Excel download (premium — includes phone) ──────────────────────────────────
function downloadPremiumExcel(candidates, filename = "JobSeekers_Report") {
  const rows = candidates.map((c, i) => ({
    "S.No":           i + 1,
    "Name":           c.name || "",
    "Email":          c.email || "",
    "Phone":          c.phone || "",
    "Location":       c.current_location || c.location || "",
    "Domain":         c.domain || "",
    "Experience":     c.experience_level || (c.experience_years ? c.experience_years + " yrs" : ""),
    "Work Mode":      c.work_mode || "",
    "Skills":         Array.isArray(c.skills) ? c.skills.join(", ") : (c.skills || ""),
    "AI Score":       c.ai_score || 0,
    "JD Match %":     (c.jd_match || 0) + "%",
    "Status":         c.status || "Pending",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch:5 },{ wch:20 },{ wch:28 },{ wch:15 },{ wch:18 },
    { wch:18 },{ wch:14 },{ wch:16 },{ wch:35 },{ wch:10 },{ wch:10 },{ wch:14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Job Seekers");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── Excel download (free — no phone) ──────────────────────────────────────────
function downloadFreeExcel(candidates, filename = "JobSeekers_Report") {
  const rows = candidates.map((c, i) => ({
    "S.No":       i + 1,
    "Name":       c.name || "",
    "Email":      c.email || "",
    "Location":   c.current_location || c.location || "",
    "Domain":     c.domain || "",
    "Experience": c.experience_level || (c.experience_years ? c.experience_years + " yrs" : ""),
    "Skills":     Array.isArray(c.skills) ? c.skills.join(", ") : (c.skills || ""),
    "AI Score":   c.ai_score || 0,
    "JD Match %": (c.jd_match || 0) + "%",
    "Status":     c.status || "Pending",
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch:5 },{ wch:20 },{ wch:28 },{ wch:18 },{ wch:18 },
    { wch:14 },{ wch:35 },{ wch:10 },{ wch:10 },{ wch:14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Job Seekers");
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buf], { type: "application/octet-stream" }), `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ── JD score badge ─────────────────────────────────────────────────────────────
function JDMatchBadge({ score, reason }) {
  if (score == null) return <span className="text-xs text-slate-400">—</span>;
  const s   = Number(score);
  const cfg = s >= 90 ? { bg: "bg-green-100  text-green-700",  label: "Excellent" }
            : s >= 70 ? { bg: "bg-yellow-100 text-yellow-700", label: "Good"      }
            : s >= 50 ? { bg: "bg-orange-100 text-orange-700", label: "Partial"   }
            :           { bg: "bg-red-100    text-red-700",    label: "Low"       };
  return (
    <span
      title={reason || ""}
      className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap cursor-default ${cfg.bg}`}>
      {s}% {cfg.label}
    </span>
  );
}

export default function HRCandidates() {
  const router = useRouter();

  const [user,             setUser]             = useState(null);
  const [hrId,             setHrId]             = useState(null);
  const [hrPlan,           setHrPlan]           = useState("free");
  const [candidates,       setCandidates]       = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [search,           setSearch]           = useState("");
  const [selected,         setSelected]         = useState(null);
  const [showFilter,       setShowFilter]       = useState(false);
  const [filterStatus,     setFilterStatus]     = useState("All");
  const [filterLocation,   setFilterLocation]   = useState("All");
  const [filterDomain,     setFilterDomain]     = useState("All");
  const [filterExp,        setFilterExp]        = useState("All");
  const [deleteMsg,        setDeleteMsg]        = useState("");
  const [revealedPhones,   setRevealedPhones]   = useState({});
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // JD match state
  const [jdText,           setJdText]           = useState("");
  const [jdScores,         setJdScores]         = useState(null); // Map<id, {jd_score, match_reason}>
  const [jdLoading,        setJdLoading]        = useState(false);
  const [jdError,          setJdError]          = useState("");
  const [showHighMatchOnly, setShowHighMatchOnly]= useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setHrId(u.id);

    if (u.email) {
      supabase.from("hr_registry").select("plan").eq("email", u.email).single()
        .then(({ data }) => { if (data?.plan) setHrPlan(data.plan); });
    }

    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("candidates")
      .select("id,name,email,phone,ai_score,jd_match,status,location,current_location,qualification,age,experience_years,experience_level,domain,skills,work_mode,resume_url,education_degree,current_role,summary,uploaded_by_hr")
      .order("ai_score", { ascending: false });
    if (!error && data) setCandidates(data);
    setLoading(false);
  };

  // ── JD Match ──────────────────────────────────────────────────────────────────
  const handleJdMatch = async () => {
    if (!jdText.trim()) { setJdError("Please paste a job description first."); return; }
    if (!hrId)          { setJdError("Not logged in."); return; }
    setJdError("");
    setJdLoading(true);
    try {
      const res  = await fetch("/api/hr/jd-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription: jdText, hrId }),
      });
      const data = await res.json();
      if (data.error) { setJdError(data.error); setJdLoading(false); return; }
      // Build a lookup map id -> {jd_score, match_reason}
      const map = {};
      (data.scores || []).forEach(s => { map[s.id] = { jd_score: s.jd_score, match_reason: s.match_reason }; });
      setJdScores(map);
    } catch (err) {
      setJdError(err.message);
    }
    setJdLoading(false);
  };

  const clearJdMatch = () => {
    setJdScores(null);
    setJdText("");
    setJdError("");
    setShowHighMatchOnly(false);
  };

  const togglePhone = (id) =>
    setRevealedPhones(prev => ({ ...prev, [id]: !prev[id] }));

  const handleExcelDownload = (list, name) => {
    if (hrPlan !== "premium") { setShowPremiumModal(true); return; }
    downloadPremiumExcel(list, name);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (!error) {
      setCandidates(prev => prev.filter(c => c.id !== id));
      setSelected(null);
      setDeleteMsg("✅ Job seeker deleted.");
      setTimeout(() => setDeleteMsg(""), 3000);
    }
  };

  const handleShortlist = async (candidate) => {
    const { error } = await supabase.from("candidates").update({ status: "Shortlisted" }).eq("id", candidate.id);
    if (!error) {
      setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: "Shortlisted" } : c));
      setSelected(prev => prev ? { ...prev, status: "Shortlisted" } : null);
    }
  };

  // ── Filter options ─────────────────────────────────────────────────────────────
  const locations = ["All", ...new Set(candidates.map(c => c.current_location || c.location).filter(Boolean))];
  const domains   = ["All", ...new Set(candidates.map(c => c.domain).filter(Boolean))];
  const expLevels = ["All", "Fresher", "Junior", "Mid-level", "Senior"];
  const statuses  = ["All", "Shortlisted", "Reviewing", "Pending", "Rejected"];

  // ── Build display list (with JD scores merged in if active) ──────────────────
  let displayList = candidates.map(c => ({
    ...c,
    _jd_score:  jdScores ? (jdScores[c.id]?.jd_score  ?? null) : null,
    _jd_reason: jdScores ? (jdScores[c.id]?.match_reason ?? "") : "",
  }));

  // Apply standard filters
  const filtered = displayList.filter(c => {
    const loc = c.current_location || c.location || "";
    const matchSearch   = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      loc.toLowerCase().includes(search.toLowerCase()) ||
      c.domain?.toLowerCase().includes(search.toLowerCase()) ||
      (Array.isArray(c.skills) ? c.skills : []).join(" ").toLowerCase().includes(search.toLowerCase());
    const matchStatus   = filterStatus   === "All" || c.status           === filterStatus;
    const matchLocation = filterLocation === "All" || loc                === filterLocation;
    const matchDomain   = filterDomain   === "All" || c.domain           === filterDomain;
    const matchExp      = filterExp      === "All" || c.experience_level === filterExp;
    const matchHighOnly = !showHighMatchOnly || (c._jd_score != null && c._jd_score >= 70);
    return matchSearch && matchStatus && matchLocation && matchDomain && matchExp && matchHighOnly;
  });

  // Sort by JD score when active, else keep existing AI score order
  const sortedFiltered = jdScores
    ? [...filtered].sort((a, b) => (b._jd_score ?? -1) - (a._jd_score ?? -1))
    : filtered;

  const activeFilters = [filterStatus, filterLocation, filterDomain, filterExp].filter(f => f !== "All").length;
  const resetFilters  = () => { setFilterStatus("All"); setFilterLocation("All"); setFilterDomain("All"); setFilterExp("All"); };

  const ScoreBadge = ({ score }) => {
    const s  = score || 0;
    const bg = s >= 85 ? "bg-green-100 text-green-700" : s >= 70 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
    return <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${bg}`}>{s}</span>;
  };

  const StatusBadge = ({ status }) => {
    const map = { Shortlisted: "bg-green-100 text-green-700", Reviewing: "bg-yellow-100 text-yellow-700", Pending: "bg-slate-100 text-slate-600", Rejected: "bg-red-100 text-red-700" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] || "bg-gray-100 text-gray-600"}`}>{status || "Pending"}</span>;
  };

  const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const getColor    = (name) => {
    const colors = ["#1253A4", "#0EA5C9", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#6366F1", "#EC4899"];
    let hash = 0;
    for (let i = 0; i < (name || "").length; i++) hash += name.charCodeAt(i);
    return colors[hash % colors.length];
  };

  if (!user) return null;

  if (loading) return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#1253A4] border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
          <div className="text-slate-500 font-semibold">Loading job seekers...</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* ── Topbar ── */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-0">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="flex items-center gap-2">
                <div className="text-base md:text-lg font-bold text-[#1E293B]">Job Seekers</div>
                {hrPlan === "premium" && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">⭐ Premium</span>
                )}
              </div>
              <div className="text-xs text-slate-400">{candidates.length} total job seekers</div>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 md:justify-end">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-3 py-2 flex-shrink-0">
              <Search size={14} className="text-slate-400"/>
              <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm outline-none w-24 md:w-48 text-slate-600"/>
            </div>
            <button onClick={() => setShowFilter(!showFilter)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all flex-shrink-0 whitespace-nowrap ${
                showFilter || activeFilters > 0 ? "bg-[#1253A4] text-white border-[#1253A4]" : "bg-white text-slate-600 border-[#E2E8F0] hover:border-[#1253A4]"
              }`}>
              <Filter size={14}/> Filters
              {activeFilters > 0 && <span className="bg-white text-[#1253A4] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{activeFilters}</span>}
            </button>
            <button onClick={() => handleExcelDownload(sortedFiltered, "ASSISTLANA_JobSeekers")}
              className="flex items-center gap-1 bg-[#10B981] text-white px-3 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-[#059669] transition-all flex-shrink-0 whitespace-nowrap">
              <Download size={14}/> <span className="hidden sm:inline">Download Excel</span>
              {hrPlan !== "premium" && <Star size={12} className="text-yellow-300 fill-yellow-300"/>}
            </button>
            <button onClick={fetchCandidates} className="p-2 bg-[#F1F5F9] rounded-xl text-slate-500 hover:bg-[#E2E8F0] transition-all flex-shrink-0" title="Refresh">🔄</button>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {deleteMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">{deleteMsg}</div>
          )}

          {/* ── JD Match Section ── */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6 mb-6 shadow-sm">
            <div className="font-bold text-[#1E293B] mb-3 flex items-center gap-2 text-sm md:text-base">
              🎯 Find Best Candidates for Your Job
            </div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Paste Job Description</label>
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="We are looking for a React developer with 2+ years experience in Next.js, TypeScript, and REST APIs..."
              rows={4}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-slate-700 outline-none focus:border-[#1253A4] resize-none transition-all bg-[#F8FAFC]"
            />
            {jdError && <div className="text-xs text-red-500 mt-1">{jdError}</div>}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <button
                onClick={handleJdMatch}
                disabled={jdLoading || !jdText.trim()}
                className="flex items-center gap-2 bg-[#1253A4] hover:bg-[#0d47a1] text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {jdLoading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Scoring...</>
                  : "🔍 Match & Sort Candidates"}
              </button>
              {jdScores && (
                <>
                  <button onClick={clearJdMatch}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold border border-[#E2E8F0] text-slate-600 hover:bg-[#F1F5F9] transition-all">
                    <X size={14}/> Clear Match
                  </button>
                  <button
                    onClick={() => setShowHighMatchOnly(v => !v)}
                    className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                      showHighMatchOnly
                        ? "bg-green-500 text-white border-green-500"
                        : "border-[#E2E8F0] text-slate-600 hover:bg-[#F1F5F9]"
                    }`}>
                    {showHighMatchOnly ? "✅ 70%+ Only" : "Show 70%+ matches only"}
                  </button>
                  <span className="text-xs text-slate-400 ml-auto">
                    Scored {Object.keys(jdScores).length} of your candidates
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ── Filter Panel ── */}
          {showFilter && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-[#1E293B] flex items-center gap-2 text-sm"><Filter size={16} className="text-[#1253A4]"/>Filter Job Seekers</div>
                <div className="flex items-center gap-3">
                  {activeFilters > 0 && <button onClick={resetFilters} className="text-xs text-red-500 hover:text-red-700 font-semibold underline">Clear All</button>}
                  <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Status",     val: filterStatus,   set: setFilterStatus,   opts: statuses  },
                  { label: "Location",   val: filterLocation, set: setFilterLocation, opts: locations },
                  { label: "Domain",     val: filterDomain,   set: setFilterDomain,   opts: domains   },
                  { label: "Experience", val: filterExp,      set: setFilterExp,      opts: expLevels },
                ].map(({ label, val, set, opts }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">{label}</label>
                    <div className="relative">
                      <select value={val} onChange={e => set(e.target.value)}
                        className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC] appearance-none">
                        {opts.map(o => <option key={o}>{o}</option>)}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs md:text-sm text-slate-500">
              Showing <span className="font-bold text-[#1E293B]">{sortedFiltered.length}</span> of <span className="font-bold text-[#1E293B]">{candidates.length}</span>
              {jdScores && <span className="ml-2 text-[#1253A4] font-semibold text-xs">· Sorted by JD match</span>}
            </div>
            <button onClick={() => handleExcelDownload(sortedFiltered, "Filtered_JobSeekers")}
              className="flex items-center gap-2 text-xs text-[#10B981] font-semibold hover:underline">
              <Download size={12}/> Download filtered ({sortedFiltered.length})
              {hrPlan !== "premium" && <Star size={10} className="text-yellow-400 fill-yellow-400"/>}
            </button>
          </div>

          {/* ── DESKTOP: Table ── */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    {["Job Seeker", "Phone", "Location", "Domain", "Experience", "AI Score",
                      jdScores ? "JD Match" : "JD Match", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((c, i) => (
                    <tr key={c.id || i} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-all">

                      {/* Job Seeker */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ background: getColor(c.name) }}>
                            {getInitials(c.name)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-[#1E293B]">{c.name}</div>
                            <div className="text-xs text-slate-400 truncate max-w-[140px]">{c.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono text-slate-700">
                            {revealedPhones[c.id] ? (c.phone || "N/A") : maskPhone(c.phone)}
                          </span>
                          <button onClick={() => togglePhone(c.id)} className="text-slate-400 hover:text-[#1253A4] transition-colors ml-1">
                            {revealedPhones[c.id] ? <EyeOff size={13}/> : <Eye size={13}/>}
                          </button>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3">
                        <span className="text-xs bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                          📍 {c.current_location || c.location || "N/A"}
                        </span>
                      </td>

                      {/* Domain */}
                      <td className="py-3 px-3">
                        <span className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                          {c.domain || "—"}
                        </span>
                      </td>

                      {/* Experience */}
                      <td className="py-3 px-3">
                        <span className="text-xs bg-[#F5F3FF] text-[#8B5CF6] px-2 py-1 rounded-lg font-medium whitespace-nowrap">
                          {c.experience_level || (c.experience_years ? c.experience_years + " yrs" : "—")}
                        </span>
                      </td>

                      {/* AI Score */}
                      <td className="py-3 px-3"><ScoreBadge score={c.ai_score}/></td>

                      {/* JD Match */}
                      <td className="py-3 px-3">
                        {jdScores ? (
                          <JDMatchBadge score={c._jd_score} reason={c._jd_reason}/>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-14 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                              <div className="h-full bg-[#0EA5C9] rounded-full" style={{ width: `${c.jd_match || 0}%` }}/>
                            </div>
                            <span className="text-xs font-bold">{c.jd_match || 0}%</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3"><StatusBadge status={c.status}/></td>

                      {/* Actions */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelected(c)} className="p-1.5 bg-[#EFF6FF] text-[#1253A4] rounded-lg hover:bg-[#DBEAFE] transition-all" title="View"><Eye size={13}/></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all" title="Delete"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedFiltered.length === 0 && !loading && (
              <div className="text-center py-16 text-slate-400">
                <div className="text-4xl mb-3">👥</div>
                <div className="font-semibold mb-1">{candidates.length === 0 ? "No job seekers yet" : "No results match your filters"}</div>
                {candidates.length > 0 && <button onClick={resetFilters} className="mt-3 text-sm text-[#1253A4] font-semibold hover:underline">Clear filters</button>}
              </div>
            )}
          </div>

          {/* ── MOBILE: Cards ── */}
          <div className="md:hidden space-y-3">
            {sortedFiltered.map((c, i) => (
              <div key={c.id || i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: getColor(c.name) }}>
                    {getInitials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#1E293B] truncate">{c.name}</div>
                    <div className="text-xs text-slate-400 truncate">{c.email}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs font-mono text-slate-600">
                        {revealedPhones[c.id] ? (c.phone || "N/A") : maskPhone(c.phone)}
                      </span>
                      <button onClick={() => togglePhone(c.id)} className="text-slate-400"><EyeOff size={11}/></button>
                    </div>
                  </div>
                  <ScoreBadge score={c.ai_score}/>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg">📍 {c.current_location || c.location || "N/A"}</span>
                  <span className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-lg">{c.domain || "—"}</span>
                  <span className="text-xs bg-[#F5F3FF] text-[#8B5CF6] px-2 py-1 rounded-lg">{c.experience_level || (c.experience_years ? c.experience_years + " yrs" : "—")}</span>
                  <StatusBadge status={c.status}/>
                  {jdScores && c._jd_score != null && (
                    <JDMatchBadge score={c._jd_score} reason={c._jd_reason}/>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(c)} className="flex-1 flex items-center justify-center gap-1 p-2 bg-[#EFF6FF] text-[#1253A4] rounded-lg text-xs font-semibold"><Eye size={13}/> View</button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Premium Modal ── */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] w-full max-w-sm p-6">
            <div className="text-4xl text-center mb-3">⭐</div>
            <h2 className="text-lg font-bold text-[#1E293B] text-center mb-2">Premium Feature</h2>
            <p className="text-sm text-slate-500 text-center mb-4">
              Excel download with candidate phone numbers is available for <strong>Premium HR accounts</strong> only.
            </p>
            <div className="bg-[#F8FAFC] rounded-xl p-3 text-xs text-slate-600 text-center mb-4">
              Contact <span className="font-bold text-[#1253A4]">admin@assistlana.com</span> or your ASSISTLANA account manager to upgrade.
            </div>
            <button onClick={() => setShowPremiumModal(false)}
              className="w-full bg-[#1253A4] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#0d47a1] transition-all">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Candidate Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D3A] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="text-white font-bold">Job Seeker Profile</div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>

            <div className="p-4 md:p-6">
              <div className="flex flex-wrap items-center gap-4 mb-5 p-4 bg-[#F8FAFC] rounded-xl">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                  style={{ background: getColor(selected.name) }}>
                  {getInitials(selected.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-[#1E293B] truncate">{selected.name}</div>
                  <div className="text-sm text-slate-400 truncate">{selected.email}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    📍 {selected.current_location || selected.location || "N/A"} · {selected.domain || "—"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1253A4]">{selected.ai_score || 0}</div>
                  <div className="text-xs text-slate-400">AI Score</div>
                </div>
              </div>

              {/* JD match info in modal */}
              {jdScores && selected._jd_score != null && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-700">🎯 JD Match Score</span>
                    <JDMatchBadge score={selected._jd_score} reason={selected._jd_reason}/>
                  </div>
                  {selected._jd_reason && (
                    <div className="text-xs text-blue-600">{selected._jd_reason}</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  ["📞 Phone",      selected.phone || "N/A"],
                  ["💼 Experience", selected.experience_level || (selected.experience_years ? selected.experience_years + " yrs" : "—")],
                  ["🎯 JD Match",   jdScores && selected._jd_score != null ? selected._jd_score + "%" : (selected.jd_match || 0) + "%"],
                  ["🏢 Work Mode",  selected.work_mode || "—"],
                  ["📊 Status",     selected.status || "Pending"],
                  ["🎓 Education",  selected.education_degree || selected.qualification || "—"],
                ].map(([l, v], i) => (
                  <div key={i} className="bg-[#F8FAFC] rounded-xl p-3">
                    <div className="text-xs text-slate-400 mb-0.5">{l}</div>
                    <div className="text-sm font-bold text-[#1E293B]">{v}</div>
                  </div>
                ))}
              </div>

              {selected.skills && selected.skills.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(selected.skills) ? selected.skills : String(selected.skills).split(",")).map((s, i) => (
                      <span key={i} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-md font-medium">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {selected.summary && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Summary</div>
                  <div className="text-xs text-slate-600 bg-[#F8FAFC] rounded-xl p-3">{selected.summary}</div>
                </div>
              )}

              {selected.resume_url && (
                <div className="mb-4">
                  <a href={selected.resume_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-[#0EA5C9] font-semibold hover:underline">
                    📄 View Resume PDF
                  </a>
                </div>
              )}

              {selected.linkedin_url && (
                <div className="mb-4">
                  <a href={selected.linkedin_url} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-[#0EA5C9] font-semibold hover:underline">
                    🔗 LinkedIn Profile
                  </a>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => handleShortlist(selected)} disabled={selected.status === "Shortlisted"}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    selected.status === "Shortlisted" ? "bg-green-100 text-green-700 cursor-not-allowed" : "bg-[#1253A4] text-white hover:bg-[#0d47a1]"
                  }`}>
                  {selected.status === "Shortlisted" ? "✅ Shortlisted" : "⭐ Shortlist"}
                </button>
                <button onClick={() => handleDelete(selected.id)}
                  className="px-4 bg-red-50 text-red-500 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 flex items-center justify-center gap-1">
                  <Trash2 size={14}/> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
