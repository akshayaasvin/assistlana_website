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
  const [newJob,    setNewJob]    = useState({ title:"", dept:"Engineering", exp:"", skills:"", desc:"", status:"Active" });
  const [success,   setSuccess]   = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) router.push("/");
    else setUser(JSON.parse(stored));
  }, []);

  const handleCreate = () => {
    if (!newJob.title || !newJob.desc) return;
    const created = {
      ...newJob,
      id: jobs.length + 1,
      matches: 0, shortlisted: 0,
      posted: "Just now",
      skills: newJob.skills.split(",").map(s => s.trim()).filter(Boolean),
    };
    setJobs(prev => [created, ...prev]);
    setShowModal(false);
    setNewJob({ title:"", dept:"Engineering", exp:"", skills:"", desc:"", status:"Active" });
    setSuccess("✅ Job posted! Candidates can now view and apply.");
    setTimeout(() => setSuccess(""), 4000);
  };


  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-0 md:ml-56 flex-1">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-lg font-bold text-[#1E293B]">Job Descriptions</div>
            <div className="text-xs text-slate-400">Post jobs · candidates can view and apply</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-xl px-4 py-2">
              <Search size={14} className="text-slate-400"/>
              <input placeholder="Search jobs..." className="bg-transparent text-sm outline-none w-32 text-slate-600"/>
            </div>
            <button className="relative p-2 bg-[#F1F5F9] rounded-xl">
              <Bell size={16} className="text-slate-500"/>
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#1253A4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
              <Plus size={15}/> Post Job
            </button>
          </div>
        </div>

        <div className="p-8">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              {success}
            </div>
          )}


          <div className="grid grid-cols-3 gap-5">
            {jobs.map((job,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase size={18} className="text-[#1253A4]"/>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    job.status === "Active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>{job.status}</span>
                </div>
                <div className="font-bold text-[#1E293B] mb-1">{job.title}</div>
                <div className="text-xs text-slate-400 mb-3">{job.dept} · {job.posted}</div>
                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{job.desc}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {job.skills.slice(0,3).map(s => (
                    <span key={s} className="text-xs bg-[#EFF6FF] text-[#1253A4] px-2 py-0.5 rounded-md font-medium">{s}</span>
                  ))}
                </div>

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
                <button onClick={() => router.push(`/hr/jobs/matches?job=${i}`)}
                        className="w-full bg-[#1253A4] text-white py-2 rounded-xl text-xs font-semibold hover:bg-[#0d47a1] transition-all">
                        View Matches →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Job Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#0B1D3A] px-6 py-4 flex items-center justify-between">
              <div className="text-white font-bold">Post New Job</div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Job Title *</label>
                <input value={newJob.title} onChange={e => setNewJob(p => ({ ...p, title:e.target.value }))}
                  placeholder="e.g. Senior React Developer"
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Department</label>
                  <select value={newJob.dept} onChange={e => setNewJob(p => ({ ...p, dept:e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                    <option>Engineering</option><option>AI/ML</option>
                    <option>Design</option><option>Analytics</option><option>Infrastructure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">Experience</label>
                  <input value={newJob.exp} onChange={e => setNewJob(p => ({ ...p, exp:e.target.value }))}
                    placeholder="e.g. 2-4 years"
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Required Skills (comma separated)</label>
                <input value={newJob.skills} onChange={e => setNewJob(p => ({ ...p, skills:e.target.value }))}
                  placeholder="e.g. React, Node.js, PostgreSQL"
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Job Description *</label>
                <textarea value={newJob.desc} onChange={e => setNewJob(p => ({ ...p, desc:e.target.value }))}
                  placeholder="Describe the role, responsibilities and requirements..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC] resize-none"/>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-semibold text-slate-500 hover:bg-[#F1F5F9] transition-all">
                  Cancel
                </button>
                <button onClick={handleCreate}
                  className="flex-1 py-2.5 bg-[#1253A4] text-white rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                  Post Job →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}