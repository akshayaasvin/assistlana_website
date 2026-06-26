"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { supabase } from "@/lib/supabase";
import { downloadCandidatesExcel } from "@/lib/excelExport";
import { ArrowLeft, Download, Eye, X } from "lucide-react";

const AVATAR_COLORS = ["#1253A4","#0EA5C9","#8B5CF6","#10B981","#F59E0B","#EF4444","#6366F1"];
function avatarColor(name, idx) {
  if (!name) return AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}
function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function scoreColor(s) {
  if (s >= 85) return "bg-green-100 text-green-700";
  if (s >= 70) return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
}

export default function JobMatchesClient() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const jobIdxParam  = parseInt(searchParams.get("job") || "0");

  const [user,        setUser]        = useState(null);
  const [jobs,        setJobs]        = useState([]);
  const [candidates,  setCandidates]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeIdx,   setActiveIdx]   = useState(jobIdxParam);
  const [selected,    setSelected]    = useState(null);
  const [shortlisted, setShortlisted] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) { router.push("/"); return; }
    setUser(JSON.parse(stored));
    Promise.all([
      supabase.from("jobs").select("*").eq("status", "Active").order("created_at", { ascending: false }),
      supabase.from("candidates").select("*").order("ai_score", { ascending: false }),
    ]).then(([jobsRes, candidatesRes]) => {
      setJobs(jobsRes.data || []);
      setCandidates(candidatesRes.data || []);
      setLoading(false);
    });
  }, []);

  const job     = jobs[activeIdx] ?? null;
  const matched = candidates;

  const handleShortlist = async (id) => {
    const isShortlisted = shortlisted.includes(id);
    setShortlisted(prev => isShortlisted ? prev.filter(i => i !== id) : [...prev, id]);
    if (!isShortlisted) {
      await supabase.from("candidates").update({ status: "Shortlisted" }).eq("id", id);
    }
  };

  const downloadSingle = (candidate) => {
    downloadCandidatesExcel([candidate], candidate.name);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex bg-[#F8FAFC]">
        <HRSidebar user={user}/>
        <div className="ml-0 md:ml-56 flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#1253A4]/20 border-t-[#1253A4] rounded-full animate-spin"/>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={() => router.push("/hr/jobs")}
                className="flex items-center gap-1 text-slate-400 hover:text-slate-700 text-xs md:text-sm font-semibold transition-all flex-shrink-0">
                <ArrowLeft size={16}/> <span className="hidden sm:inline">Back to Jobs</span>
              </button>
              <div className="w-px h-6 bg-[#E2E8F0] hidden sm:block"/>
              <div className="min-w-0">
                <div className="text-base md:text-lg font-bold text-[#1E293B] truncate">Job Matches</div>
                <div className="text-xs text-slate-400 hidden sm:block">AI-ranked candidates for each job</div>
              </div>
            </div>
            {job && (
              <button
                onClick={() => downloadCandidatesExcel(matched, `${job.title}_Matches`)}
                className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all flex-shrink-0">
                <Download size={14}/> Download Excel
              </button>
            )}
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* No jobs state */}
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
              <div className="text-4xl mb-3">💼</div>
              <div className="font-bold text-slate-400 mb-2">No active jobs found</div>
              <p className="text-sm text-slate-400 mb-4">Post a job first to see candidate matches.</p>
              <button onClick={() => router.push("/hr/jobs")}
                className="px-6 py-2.5 bg-[#1253A4] text-white rounded-xl text-sm font-semibold hover:bg-[#0d47a1]">
                Go to Jobs →
              </button>
            </div>
          ) : (
            <>
              {/* Job Selector */}
              <div className="flex gap-2 mb-6 flex-wrap overflow-x-auto pb-1">
                {jobs.map((j, i) => (
                  <button key={j.id} onClick={() => setActiveIdx(i)}
                    className={`px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all border whitespace-nowrap flex-shrink-0 ${
                      activeIdx === i
                        ? "bg-[#1253A4] text-white border-[#1253A4]"
                        : "bg-white text-slate-500 border-[#E2E8F0] hover:border-[#1253A4] hover:text-[#1253A4]"
                    }`}>
                    {j.title.length > 22 ? j.title.slice(0, 22) + "..." : j.title}
                  </button>
                ))}
              </div>

              {/* Job Info */}
              {job && (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5 mb-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-bold text-[#1E293B] text-base md:text-lg mb-1">{job.title}</div>
                      <div className="text-sm text-slate-400 mb-3">
                        {job.company} · {job.job_type} · {job.work_mode}
                        {job.experience ? ` · ${job.experience}` : ""}
                      </div>
                      {Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.skills_required.map(s => (
                            <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-md font-medium">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <div className="text-center bg-[#EFF6FF] rounded-xl px-4 md:px-5 py-3">
                        <div className="text-xl md:text-2xl font-bold text-[#1253A4]">{matched.length}</div>
                        <div className="text-xs text-slate-400">Candidates</div>
                      </div>
                      <div className="text-center bg-[#F0FDF4] rounded-xl px-4 md:px-5 py-3">
                        <div className="text-xl md:text-2xl font-bold text-[#10B981]">
                          {shortlisted.length || matched.filter(c => (c.ai_score ?? 0) >= 85).length}
                        </div>
                        <div className="text-xs text-slate-400">Shortlisted</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No candidates state */}
              {matched.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center">
                  <div className="text-4xl mb-3">👥</div>
                  <div className="font-bold text-slate-400 mb-2">No candidates yet</div>
                  <p className="text-sm text-slate-400">Upload resumes to start seeing ranked matches here.</p>
                </div>
              ) : (
                <>
                  {/* MOBILE: Card List */}
                  <div className="md:hidden space-y-3">
                    <div className="px-1 mb-3 flex items-center justify-between">
                      <div className="font-bold text-sm text-[#1E293B]">🏆 Ranked Candidates</div>
                      <div className="text-xs text-slate-400">By AI Score</div>
                    </div>
                    {matched.map((c, i) => {
                      const score = c.ai_score ?? 0;
                      const skills = Array.isArray(c.skills) ? c.skills : [];
                      return (
                        <div key={c.id ?? i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              i===0?"bg-yellow-100 text-yellow-600":
                              i===1?"bg-slate-100 text-slate-500":
                              i===2?"bg-orange-100 text-orange-500":"bg-[#F1F5F9] text-slate-400"
                            }`}>
                              {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                            </div>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: avatarColor(c.name, i) }}>
                              {initials(c.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-[#1E293B] truncate">{c.name}</div>
                              <div className="text-xs text-slate-400 truncate">{c.email}</div>
                            </div>
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${scoreColor(score)}`}>
                              {score}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            {c.location && (
                              <span className="text-xs bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg">
                                📍 {c.location}
                              </span>
                            )}
                            {c.experience_years != null && (
                              <span className="text-xs bg-[#F5F3FF] text-[#8B5CF6] px-2 py-1 rounded-lg">
                                {c.experience_years} yrs exp
                              </span>
                            )}
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                              shortlisted.includes(c.id)?"bg-green-100 text-green-700":
                              c.status==="Shortlisted"?"bg-green-100 text-green-700":
                              c.status==="Reviewing"?"bg-yellow-100 text-yellow-700":
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {shortlisted.includes(c.id)?"Shortlisted":c.status||"Pending"}
                            </span>
                          </div>

                          {c.jd_match > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-1 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                <div className="h-full bg-[#0EA5C9] rounded-full" style={{ width:`${c.jd_match}%` }}/>
                              </div>
                              <span className="text-xs font-bold text-slate-600">JD: {c.jd_match}%</span>
                            </div>
                          )}

                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {skills.slice(0, 3).map(s => (
                                <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-0.5 rounded-md">{s}</span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelected(c)}
                              className="flex-1 flex items-center justify-center gap-1 p-2 bg-[#EFF6FF] text-[#1253A4] rounded-lg text-xs font-semibold">
                              <Eye size={13}/> View
                            </button>
                            <button onClick={() => handleShortlist(c.id)}
                              className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-lg text-xs font-semibold ${
                                shortlisted.includes(c.id)?"bg-green-100 text-green-600":"bg-[#F0FDF4] text-[#10B981]"
                              }`}>
                              {shortlisted.includes(c.id)?"✅ Shortlisted":"⭐ Shortlist"}
                            </button>
                            <button onClick={() => downloadSingle(c)}
                              className="p-2 bg-[#F0FDF4] text-[#10B981] rounded-lg">
                              <Download size={13}/>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP: Table */}
                  <div className="hidden md:block bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                    <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
                      <div className="font-bold text-sm text-[#1E293B]">🏆 Ranked Candidates</div>
                      <div className="text-xs text-slate-400">Sorted by AI Score</div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#F1F5F9]">
                            {["Rank","Candidate","Location","Experience","Skills","AI Score","JD Match","Status","Actions"].map(h => (
                              <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-3 whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matched.map((c, i) => {
                            const score = c.ai_score ?? 0;
                            const skills = Array.isArray(c.skills) ? c.skills : [];
                            return (
                              <tr key={c.id ?? i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-all ${i<3?"bg-yellow-50/20":""}`}>
                                <td className="py-3 px-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    i===0?"bg-yellow-100 text-yellow-600":
                                    i===1?"bg-slate-100 text-slate-500":
                                    i===2?"bg-orange-100 text-orange-500":"bg-[#F1F5F9] text-slate-400"
                                  }`}>
                                    {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                      style={{ background: avatarColor(c.name, i) }}>
                                      {initials(c.name)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-sm font-semibold text-[#1E293B] truncate">{c.name}</div>
                                      <div className="text-xs text-slate-400 truncate">{c.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  {c.location ? (
                                    <span className="text-xs bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg whitespace-nowrap">
                                      📍 {c.location}
                                    </span>
                                  ) : "—"}
                                </td>
                                <td className="py-3 px-3 text-sm text-slate-600 font-medium whitespace-nowrap">
                                  {c.experience_years != null ? `${c.experience_years} yrs` : "—"}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex flex-wrap gap-1">
                                    {skills.slice(0, 2).map(s => (
                                      <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-0.5 rounded-md whitespace-nowrap">{s}</span>
                                    ))}
                                    {skills.length > 2 && (
                                      <span className="text-xs text-slate-400">+{skills.length - 2}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${scoreColor(score)}`}>
                                    {score}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  {c.jd_match > 0 ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-14 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#0EA5C9] rounded-full" style={{ width:`${c.jd_match}%` }}/>
                                      </div>
                                      <span className="text-xs font-bold text-slate-600">{c.jd_match}%</span>
                                    </div>
                                  ) : "—"}
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                                    shortlisted.includes(c.id)?"bg-green-100 text-green-700":
                                    c.status==="Shortlisted"?"bg-green-100 text-green-700":
                                    c.status==="Reviewing"?"bg-yellow-100 text-yellow-700":
                                    "bg-slate-100 text-slate-500"
                                  }`}>
                                    {shortlisted.includes(c.id)?"Shortlisted":c.status||"Pending"}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => setSelected(c)}
                                      className="p-1.5 bg-[#EFF6FF] text-[#1253A4] rounded-lg hover:bg-[#DBEAFE] transition-all"
                                      title="View">
                                      <Eye size={13}/>
                                    </button>
                                    <button onClick={() => handleShortlist(c.id)}
                                      className={`p-1.5 rounded-lg transition-all ${
                                        shortlisted.includes(c.id)?"bg-green-100 text-green-600":"bg-[#F0FDF4] text-[#10B981] hover:bg-green-100"
                                      }`}
                                      title="Shortlist">
                                      {shortlisted.includes(c.id)?"✅":"⭐"}
                                    </button>
                                    <button onClick={() => downloadSingle(c)}
                                      className="p-1.5 bg-[#F0FDF4] text-[#10B981] rounded-lg hover:bg-green-100 transition-all"
                                      title="Download">
                                      <Download size={13}/>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D3A] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="text-white font-bold">Candidate Profile</div>
              <div className="flex items-center gap-3">
                <button onClick={() => downloadSingle(selected)}
                  className="flex items-center gap-1 bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Download size={12}/> <span className="hidden sm:inline">Download XL</span>
                </button>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                  <X size={18}/>
                </button>
              </div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex flex-wrap items-center gap-4 mb-5 p-4 bg-[#F8FAFC] rounded-xl">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                  style={{ background: avatarColor(selected.name, 0) }}>
                  {initials(selected.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-bold text-[#1E293B] truncate">{selected.name}</div>
                  <div className="text-sm text-slate-400 truncate">{selected.role || selected.email}</div>
                  {selected.location && <div className="text-xs text-slate-400">📍 {selected.location}</div>}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1253A4]">{selected.ai_score ?? 0}</div>
                  <div className="text-xs text-slate-400">AI Score</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  ["JD Match",    selected.jd_match > 0 ? selected.jd_match + "%" : "—"],
                  ["Experience",  selected.experience_years != null ? selected.experience_years + " years" : "—"],
                  ["Email",       selected.email || "—"],
                  ["Phone",       selected.phone || "—"],
                ].map(([l, v], i) => (
                  <div key={i} className="bg-[#F8FAFC] rounded-xl p-3">
                    <div className="text-xs text-slate-400">{l}</div>
                    <div className="text-sm font-bold text-[#1E293B] break-all">{v}</div>
                  </div>
                ))}
              </div>
              {Array.isArray(selected.skills) && selected.skills.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-slate-400 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {selected.skills.map(s => (
                      <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-md">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { handleShortlist(selected.id); setSelected(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    shortlisted.includes(selected.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-[#1253A4] text-white hover:bg-[#0d47a1]"
                  }`}>
                  {shortlisted.includes(selected.id) ? "✅ Shortlisted" : "⭐ Shortlist"}
                </button>
                <button onClick={() => setSelected(null)}
                  className="flex-1 bg-[#F1F5F9] text-slate-600 py-2.5 rounded-xl text-sm font-semibold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
