"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { CANDIDATES } from "@/lib/mockData";
import { Bell, Search } from "lucide-react";

const COLUMNS = [
  { id:"reviewing",  label:"🔍 Reviewing",  color:"#64748B", bg:"#F1F5F9" },
  { id:"shortlisted",label:"⭐ Shortlisted", color:"#0EA5C9", bg:"#F0F9FF" },
  { id:"interview",  label:"📞 Interview",   color:"#1253A4", bg:"#EFF6FF" },
  { id:"offer",      label:"✅ Offer",       color:"#10B981", bg:"#F0FDF4" },
];

export default function HRShortlist() {
  const router = useRouter();
  const [user,     setUser]     = useState(null);
  const [board,    setBoard]    = useState({
    reviewing:   CANDIDATES.filter(c => c.status === "Reviewing"),
    shortlisted: CANDIDATES.filter(c => c.status === "Shortlisted"),
    interview:   [],
    offer:       [],
  });
  const [dragging,   setDragging]   = useState(null);
  const [search,     setSearch]     = useState("");
  const [activeCol,  setActiveCol]  = useState("reviewing"); // mobile tab

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) router.push("/");
    else setUser(JSON.parse(stored));
  }, []);

  const handleDragStart = (candidate, fromCol) => {
    setDragging({ candidate, fromCol });
  };

  const handleDrop = (toCol) => {
    if (!dragging || dragging.fromCol === toCol) return;
    setBoard(prev => ({
      ...prev,
      [dragging.fromCol]: prev[dragging.fromCol].filter(c => c.id !== dragging.candidate.id),
      [toCol]: [...prev[toCol], { ...dragging.candidate, status: toCol }],
    }));
    setDragging(null);
  };

  // Mobile: move card to next/prev stage
  const moveCard = (candidate, fromCol, direction) => {
    const idx = COLUMNS.findIndex(c => c.id === fromCol);
    const toIdx = idx + direction;
    if (toIdx < 0 || toIdx >= COLUMNS.length) return;
    const toCol = COLUMNS[toIdx].id;
    setBoard(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(c => c.id !== candidate.id),
      [toCol]: [...prev[toCol], { ...candidate, status: toCol }],
    }));
  };

  const totalCandidates = Object.values(board).flat().length;

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-0">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="text-base md:text-lg font-bold text-[#1E293B]">Shortlist Board</div>
              <div className="text-xs text-slate-400 hidden sm:block">Drag candidates through hiring stages</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-3 py-2">
                <Search size={14} className="text-slate-400"/>
                <input placeholder="Search..."
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-sm outline-none w-20 md:w-36 text-slate-600"/>
              </div>
              <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
                <Bell size={16} className="text-slate-500"/>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {COLUMNS.map((col,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-3 md:p-4 text-center">
                <div className="text-xl md:text-2xl font-bold mb-1" style={{ color: col.color }}>
                  {board[col.id].length}
                </div>
                <div className="text-xs text-slate-400">{col.label}</div>
              </div>
            ))}
          </div>

          {/* ── MOBILE: Tab + Single Column View ── */}
          <div className="md:hidden">
            {/* Column Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {COLUMNS.map(col => (
                <button key={col.id}
                  onClick={() => setActiveCol(col.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 border transition-all ${
                    activeCol === col.id
                      ? "text-white border-transparent"
                      : "bg-white text-slate-500 border-[#E2E8F0]"
                  }`}
                  style={activeCol === col.id ? { background: COLUMNS.find(c=>c.id===activeCol)?.color, borderColor: COLUMNS.find(c=>c.id===activeCol)?.color } : {}}>
                  {col.label}
                  <span className={`rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold ${
                    activeCol === col.id ? "bg-white/20 text-white" : "bg-[#F1F5F9] text-slate-500"
                  }`}>
                    {board[col.id].length}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Column Cards */}
            <div className="rounded-2xl p-4 min-h-64" style={{ background: COLUMNS.find(c=>c.id===activeCol)?.bg }}>
              {board[activeCol].filter(c => c.name.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                <div className="text-center py-12 text-slate-300">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-xs font-medium">
                    {search ? "No candidates match search" : "No candidates here"}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {board[activeCol]
                    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                    .map((candidate, i) => {
                      const colIdx = COLUMNS.findIndex(c => c.id === activeCol);
                      return (
                        <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: candidate.color }}>
                              {candidate.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-[#1E293B] truncate">{candidate.name}</div>
                              <div className="text-xs text-slate-400 truncate">{candidate.role}</div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                              candidate.score >= 85 ? "bg-green-100 text-green-700" :
                              candidate.score >= 70 ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>{candidate.score}</span>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {candidate.skills.slice(0,3).map(s => (
                              <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-0.5 rounded-md">
                                {s}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between mb-3">
                            <div className="text-xs text-slate-400">
                              📍 {candidate.location} · {candidate.exp} yrs
                            </div>
                            <span className="text-xs text-[#0EA5C9] font-bold">
                              {candidate.jd_match}% match
                            </span>
                          </div>

                          <div className="flex gap-2">
                            {colIdx > 0 && (
                              <button
                                onClick={() => moveCard(candidate, activeCol, -1)}
                                className="flex-1 py-1.5 text-xs font-semibold bg-[#F1F5F9] text-slate-500 rounded-lg">
                                ← {COLUMNS[colIdx-1].label.split(" ")[1]}
                              </button>
                            )}
                            {colIdx < COLUMNS.length - 1 && (
                              <button
                                onClick={() => moveCard(candidate, activeCol, 1)}
                                className="flex-1 py-1.5 text-xs font-semibold text-white rounded-lg"
                                style={{ background: COLUMNS[colIdx+1].color }}>
                                {COLUMNS[colIdx+1].label.split(" ")[1]} →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            <div className="mt-4 bg-white rounded-2xl border border-[#E2E8F0] p-4 text-xs text-slate-500">
              💡 <strong>Tip:</strong> Use the ← → buttons to move candidates between stages.
              Total: <strong>{totalCandidates} candidates</strong> in pipeline.
            </div>
          </div>

          {/* ── DESKTOP: Full Kanban Board ── */}
          <div className="hidden md:grid grid-cols-4 gap-5">
            {COLUMNS.map((col) => (
              <div key={col.id}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className="rounded-2xl p-4 min-h-96"
                style={{ background: col.bg }}>

                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="font-bold text-sm" style={{ color: col.color }}>
                    {col.label}
                  </div>
                  <span className="bg-white rounded-full px-2 py-0.5 text-xs font-bold text-slate-500 shadow-sm">
                    {board[col.id].length}
                  </span>
                </div>

                {/* Cards */}
                {board[col.id]
                  .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
                  .map((candidate, i) => (
                  <div key={i}
                    draggable
                    onDragStart={() => handleDragStart(candidate, col.id)}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-3 cursor-grab hover:shadow-md transition-all active:opacity-50">

                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: candidate.color }}>
                        {candidate.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[#1E293B] truncate">{candidate.name}</div>
                        <div className="text-xs text-slate-400 truncate">{candidate.role}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          candidate.score >= 85 ? "bg-green-100 text-green-700" :
                          candidate.score >= 70 ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>{candidate.score}</span>
                        <span className="text-xs text-slate-400">score</span>
                      </div>
                      <span className="text-xs text-[#0EA5C9] font-bold">
                        {candidate.jd_match}% match
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {candidate.skills.slice(0,2).map(s => (
                        <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-slate-400">
                      📍 {candidate.location} · {candidate.exp} yrs
                    </div>
                  </div>
                ))}

                {board[col.id].length === 0 && (
                  <div className="text-center py-8 text-slate-300">
                    <div className="text-3xl mb-2">📋</div>
                    <div className="text-xs font-medium">Drop candidates here</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Legend */}
          <div className="hidden md:block mt-6 bg-white rounded-2xl border border-[#E2E8F0] p-4">
            <div className="text-xs font-semibold text-slate-400 mb-2">HOW TO USE</div>
            <div className="flex items-center gap-8 text-xs text-slate-500 flex-wrap">
              <span>🖱️ <strong>Drag</strong> candidate cards between columns</span>
              <span>📍 Cards show location, score and JD match</span>
              <span>🔍 Use search to filter candidates</span>
              <span>Total: <strong>{totalCandidates} candidates</strong> in pipeline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}