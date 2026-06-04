"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { CANDIDATES, JOBS } from "@/lib/mockData";
import { downloadCandidatesExcel } from "@/lib/excelExport";
import { ArrowLeft, Download, Eye, X } from "lucide-react";

export default function JobMatches() {
  const router     = useRouter();
  const [user,       setUser]       = useState(null);
  const searchParams  = useSearchParams();
  const jobFromURL    = parseInt(searchParams.get("job") || "0");
  const [activeJob, setActiveJob] = useState(jobFromURL);
  const [selected,   setSelected]   = useState(null);
  const [shortlisted,setShortlisted]= useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) router.push("/");
    else setUser(JSON.parse(stored));
  }, []);

  const job      = JOBS[activeJob];
  const matched  = [...CANDIDATES].sort((a,b) => b.score - a.score);

  const handleShortlist = (id) => {
    setShortlisted(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <HRSidebar user={user}/>
      <div className="ml-56 flex-1">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/hr/jobs")}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-700 text-sm font-semibold transition-all">
              <ArrowLeft size={16}/> Back to Jobs
            </button>
            <div className="w-px h-6 bg-[#E2E8F0]"/>
            <div>
              <div className="text-lg font-bold text-[#1E293B]">Job Matches</div>
              <div className="text-xs text-slate-400">AI-ranked candidates for each job</div>
            </div>
          </div>
          <button
            onClick={() => downloadCandidatesExcel(matched, `${job?.title}_Matches`)}
            className="flex items-center gap-2 bg-[#10B981] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all">
            <Download size={14}/> Download Excel
          </button>
        </div>

        <div className="p-8">

          {/* Job Selector */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {JOBS.map((j,i) => (
              <button key={i} onClick={() => setActiveJob(i)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                  activeJob === i
                    ? "bg-[#1253A4] text-white border-[#1253A4]"
                    : "bg-white text-slate-500 border-[#E2E8F0] hover:border-[#1253A4] hover:text-[#1253A4]"
                }`}>
                {j.title.length > 22 ? j.title.slice(0,22)+"..." : j.title}
              </button>
            ))}
          </div>

          {/* Job Info Card */}
          {job && (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-[#1E293B] text-lg mb-1">{job.title}</div>
                  <div className="text-sm text-slate-400 mb-3">
                    {job.dept} · {job.exp} · Posted {job.posted}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.map(s => (
                      <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="text-center bg-[#EFF6FF] rounded-xl px-5 py-3">
                    <div className="text-2xl font-bold text-[#1253A4]">{matched.length}</div>
                    <div className="text-xs text-slate-400">Total Matched</div>
                  </div>
                  <div className="text-center bg-[#F0FDF4] rounded-xl px-5 py-3">
                    <div className="text-2xl font-bold text-[#10B981]">
                      {shortlisted.length || matched.filter(c => c.score >= 85).length}
                    </div>
                    <div className="text-xs text-slate-400">Shortlisted</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ranked Table */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-6 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="font-bold text-sm text-[#1E293B]">
                🏆 Ranked Candidates
              </div>
              <div className="text-xs text-slate-400">
                Sorted by AI Score · highest first
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9]">
                  {["Rank","Candidate","Location","Age","Qualification","AI Score","JD Match","Status","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide py-3 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matched.map((c,i) => (
                  <tr key={i} className={`border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-all ${
                    i < 3 ? "bg-yellow-50/20" : ""
                  }`}>

                    {/* Rank */}
                    <td className="py-3 px-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? "bg-yellow-100 text-yellow-600" :
                        i === 1 ? "bg-slate-100 text-slate-500"  :
                        i === 2 ? "bg-orange-100 text-orange-500": "bg-[#F1F5F9] text-slate-400"
                      }`}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i+1}
                      </div>
                    </td>

                    {/* Candidate */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: c.color }}>{c.avatar}</div>
                        <div>
                          <div className="text-sm font-semibold text-[#1E293B]">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.edu}</div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <span className="text-xs bg-[#F1F5F9] text-slate-600 px-2 py-1 rounded-lg">
                        📍 {c.location}
                      </span>
                    </td>

                    {/* Age */}
                    <td className="py-3 px-3 text-sm text-slate-600 font-medium">{c.age}</td>

                    {/* Qualification */}
                    <td className="py-3 px-3">
                      <span className="text-xs bg-[#F5F3FF] text-[#8B5CF6] px-2 py-1 rounded-lg">
                        {c.qualification}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="py-3 px-3">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        c.score >= 85 ? "bg-green-100 text-green-700" :
                        c.score >= 70 ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>{c.score}</span>
                    </td>

                    {/* JD Match */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-14 h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0EA5C9] rounded-full"
                            style={{ width:`${c.jd_match}%` }}/>
                        </div>
                        <span className="text-xs font-bold text-slate-600">{c.jd_match}%</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        shortlisted.includes(c.id) ? "bg-green-100 text-green-700" :
                        c.status === "Shortlisted"  ? "bg-green-100 text-green-700" :
                        c.status === "Reviewing"    ? "bg-yellow-100 text-yellow-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {shortlisted.includes(c.id) ? "Shortlisted" : c.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelected(c)}
                          className="p-1.5 bg-[#EFF6FF] text-[#1253A4] rounded-lg hover:bg-[#DBEAFE] transition-all"
                          title="View Profile">
                          <Eye size={13}/>
                        </button>
                        <button
                          onClick={() => handleShortlist(c.id)}
                          className={`p-1.5 rounded-lg transition-all text-xs font-bold ${
                            shortlisted.includes(c.id)
                              ? "bg-green-100 text-green-600"
                              : "bg-[#F0FDF4] text-[#10B981] hover:bg-green-100"
                          }`}
                          title="Shortlist">
                          {shortlisted.includes(c.id) ? "✅" : "⭐"}
                        </button>
                        <button
                          onClick={() => downloadCandidatesExcel([c], c.name)}
                          className="p-1.5 bg-[#F0FDF4] text-[#10B981] rounded-lg hover:bg-green-100 transition-all"
                          title="Download">
                          <Download size={13}/>
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

      {/* Candidate Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#0B1D3A] px-6 py-4 flex items-center justify-between">
              <div className="text-white font-bold">Candidate Profile</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadCandidatesExcel([selected], selected.name)}
                  className="flex items-center gap-1 bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <Download size={12}/> Download XL
                </button>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">
                  <X size={18}/>
                </button>
              </div>
            </div>
            <div className="p-6">
              {/* Profile header */}
              <div className="flex items-center gap-4 mb-5 p-4 bg-[#F8FAFC] rounded-xl">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: selected.color }}>{selected.avatar}</div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-[#1E293B]">{selected.name}</div>
                  <div className="text-sm text-slate-400">{selected.role}</div>
                  <div className="text-xs text-slate-400">📍 {selected.location} · Age {selected.age}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1253A4]">{selected.score}</div>
                  <div className="text-xs text-slate-400">AI Score</div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  ["JD Match",      selected.jd_match+"%"    ],
                  ["Qualification", selected.qualification   ],
                  ["Experience",    selected.exp+" years"    ],
                  ["Education",     selected.edu             ],
                ].map(([l,v],i) => (
                  <div key={i} className="bg-[#F8FAFC] rounded-xl p-3">
                    <div className="text-xs text-slate-400">{l}</div>
                    <div className="text-sm font-bold text-[#1E293B]">{v}</div>
                  </div>
                ))}
              </div>

              {/* Score breakdown */}
              <div className="mb-4">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Score Breakdown</div>
                {[
                  { label:"Skills",     val:Math.round(selected.score*0.4), max:40, color:"#0EA5C9" },
                  { label:"Experience", val:Math.round(selected.score*0.3), max:30, color:"#1253A4" },
                  { label:"Education",  val:Math.round(selected.score*0.2), max:20, color:"#8B5CF6" },
                  { label:"Extras",     val:Math.round(selected.score*0.1), max:10, color:"#10B981" },
                ].map((s,i) => (
                  <div key={i} className="mb-2">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="font-bold" style={{ color:s.color }}>{s.val}/{s.max}</span>
                    </div>
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width:`${(s.val/s.max)*100}%`, background:s.color }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Skills</div>
                <div className="flex flex-wrap gap-1">
                  {selected.skills.map(s => (
                    <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-1 rounded-md font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => { handleShortlist(selected.id); setSelected(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    shortlisted.includes(selected.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-[#1253A4] text-white hover:bg-[#0d47a1]"
                  }`}>
                  {shortlisted.includes(selected.id) ? "✅ Shortlisted" : "⭐ Shortlist"}
                </button>
                <button onClick={() => setSelected(null)}
                  className="flex-1 bg-[#F1F5F9] text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E2E8F0]">
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