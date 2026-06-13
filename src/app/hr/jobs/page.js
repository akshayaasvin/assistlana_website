"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { JOBS } from "@/lib/mockData";
import { Plus, Bell, Search, X, Briefcase } from "lucide-react";

export default function HRJobs() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [jobs,      setJobs]      = useState(JOBS);
  const [showModal, setShowModal] = useState(false);
  const [viewJob,   setViewJob]   = useState(null);
  const [newJob,    setNewJob]    = useState({
    title:"", dept:"Engineering", exp:"", skills:"", desc:"", status:"Active"
  });
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) router.push("/");
    else setUser(JSON.parse(stored));
  }, []);

  const handleCreate = () => {
    if (!newJob.title || !newJob.desc) return;
    const created = {
      ...newJob,
      id:          jobs.length + 1,
      matches:     0,
      shortlisted: 0,
      posted:      "Just now",
      skills:      newJob.skills.split(",").map(s => s.trim()).filter(Boolean),
    };
    setJobs(prev => [created, ...prev]);
    setShowModal(false);
    setNewJob({ title:"", dept:"Engineering", exp:"", skills:"", desc:"", status:"Active" });
    setSuccess("✅ Job posted! Candidates can now view and apply.");
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleDelete = (index) => {
    if (confirm(`Delete "${jobs[index].title}"?`)) {
      setJobs(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between gap-2 mb-3 md:mb-0">
            <div className="min-w-0 pl-12 md:pl-0">
              <div className="text-base md:text-lg font-bold text-[#1E293B] truncate">Job Descriptions</div>
              <div className="text-xs text-slate-400 truncate hidden sm:block">Post jobs · candidates can view and apply</div>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl flex-shrink-0 md:hidden">
              <Bell size={16} className="text-slate-500"/>
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 md:justify-end">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-3 py-2 flex-shrink-0">
              <Search size={14} className="text-slate-400"/>
              <input
                placeholder="Search jobs..."
                className="bg-transparent text-sm outline-none w-24 md:w-32 text-slate-600"/>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl flex-shrink-0 hidden md:flex">
              <Bell size={16} className="text-slate-500"/>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#1253A4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all flex-shrink-0 whitespace-nowrap">
              <Plus size={15}/> Post Job
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {jobs.map((job, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5 hover:shadow-md transition-all flex flex-col">

                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-[#1253A4]"/>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    job.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>{job.status}</span>
                </div>

                {/* Job Info */}
                <div className="font-bold text-[#1E293B] mb-1">{job.title}</div>
                <div className="text-xs text-slate-400 mb-3">{job.dept} · {job.posted}</div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-1">{job.desc}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {job.skills.slice(0,3).map(s => (
                    <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-0.5 rounded-md font-medium">
                      {s}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-[#EFF6FF] rounded-xl p-2 text-center">
                    <div className="text-lg font-bold text-[#1253A4]">{job.matches}</div>
                    <div className="text-xs text-slate-400">Matched</div>
                  </div>
                  <div className="flex-1 bg-[#F0FDF4] rounded-xl p-2 text-center">
                    <div className="text-lg font-bold text-[#10B981]">{job.shortlisted}</div>
                    <div className="text-xs text-slate-400">Shortlisted</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewJob({ job, index: i })}
                      className="flex-1 bg-[#F1F5F9] text-slate-600 py-2 rounded-xl text-xs font-semibold hover:bg-[#E2E8F0] transition-all">
                      📋 View Details
                    </button>
                    <button
                      onClick={() => router.push(`/hr/jobs/matches?job=${i}`)}
                      className="flex-1 bg-[#1253A4] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#0d47a1] transition-all">
                      View Matches →
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(i)}
                    className="w-full bg-red-50 text-red-500 py-2 rounded-xl text-xs font-semibold hover:bg-red-100 transition-all">
                    🗑️ Delete Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CREATE JOB MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D3A] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="text-white font-bold">Post New Job</div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={18}/>
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Job Title *</label>
                <input
                  value={newJob.title}
                  onChange={e => setNewJob(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Senior React Developer"
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    value={newJob.dept}
                    onChange={e => setNewJob(p => ({ ...p, dept: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                    <option>Engineering</option>
                    <option>AI/ML</option>
                    <option>Design</option>
                    <option>Analytics</option>
                    <option>Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Experience</label>
                  <input
                    value={newJob.exp}
                    onChange={e => setNewJob(p => ({ ...p, exp: e.target.value }))}
                    placeholder="e.g. 2-4 years"
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Required Skills (comma separated)</label>
                <input
                  value={newJob.skills}
                  onChange={e => setNewJob(p => ({ ...p, skills: e.target.value }))}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Job Description *</label>
                <textarea
                  value={newJob.desc}
                  onChange={e => setNewJob(p => ({ ...p, desc: e.target.value }))}
                  placeholder="Describe the role, responsibilities and requirements..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC] resize-none"/>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-slate-500 hover:bg-[#F1F5F9] transition-all">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 py-2.5 bg-[#1253A4] text-white rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                  Post Job →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW JOB DETAILS MODAL ── */}
      {viewJob && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#0B1D3A] px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="text-white font-bold text-base truncate pr-2">{viewJob.job.title}</div>
              <button
                onClick={() => setViewJob(null)}
                className="text-slate-400 hover:text-white transition-all flex-shrink-0">
                <X size={18}/>
              </button>
            </div>

            <div className="p-4 md:p-6">

              {/* Status + Dept badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-xs bg-[#EFF6FF] text-[#1253A4] px-3 py-1 rounded-full font-semibold">
                  {viewJob.job.dept}
                </span>
                <span className="text-xs bg-[#F0FDF4] text-[#10B981] px-3 py-1 rounded-full font-semibold">
                  {viewJob.job.exp}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                  viewJob.job.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {viewJob.job.status}
                </span>
                <span className="text-xs bg-[#F1F5F9] text-slate-500 px-3 py-1 rounded-full font-semibold">
                  Posted {viewJob.job.posted}
                </span>
              </div>

              {/* Job Description */}
              <div className="mb-5">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  Job Description
                </div>
                <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                  <p className="text-sm text-slate-600 leading-relaxed">{viewJob.job.desc}</p>
                </div>
              </div>

              {/* Required Skills */}
              <div className="mb-5">
                <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  Required Skills ({viewJob.job.skills.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {viewJob.job.skills.map((s, si) => (
                    <span key={si} className="text-sm bg-[#EFF6FF] text-[#1253A4] px-3 py-1.5 rounded-lg font-medium border border-[#BFDBFE]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-[#EFF6FF] rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#1253A4]">{viewJob.job.matches}</div>
                  <div className="text-xs text-slate-400 mt-1">Total Matched</div>
                </div>
                <div className="bg-[#F0FDF4] rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-[#10B981]">{viewJob.job.shortlisted}</div>
                  <div className="text-xs text-slate-400 mt-1">Shortlisted</div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setViewJob(null);
                    router.push(`/hr/jobs/matches?job=${viewJob.index}`);
                  }}
                  className="flex-1 bg-[#1253A4] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                  View Matches →
                </button>
                <button
                  onClick={() => setViewJob(null)}
                  className="flex-1 bg-[#F1F5F9] text-slate-600 py-3 rounded-xl text-sm font-semibold hover:bg-[#E2E8F0] transition-all">
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