"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import HRSidebar from "@/components/hr/HRSidebar";
import { Plus, X, Trash2, Edit2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle } from "lucide-react";

const JOB_TYPES  = ["Full-time","Part-time","Contract","Internship"];
const WORK_MODES = ["On-site","Remote","Hybrid"];

function PostJobModal({ user, onClose, onPosted }) {
  const [form, setForm] = useState({
    title:"", company:"ASSISTLANA", location:"", job_type:"Full-time",
    work_mode:"On-site", experience:"", salary:"",
    description:"", apply_type:"internal", external_link:"",
  });
  const [skills,  setSkills]  = useState([]);
  const [skillIn, setSkillIn] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const addSkill = () => {
    const s = skillIn.trim();
    if (s && !skills.includes(s)) { setSkills(p => [...p, s]); }
    setSkillIn("");
  };

  const handlePost = async () => {
    setError("");
    if (!form.title || !form.location || !form.description) {
      setError("Please fill Title, Location, and Description."); return;
    }
    if (form.apply_type === "external" && !form.external_link) {
      setError("Please provide external link."); return;
    }
    setLoading(true);
    const { error: dbErr } = await supabase.from("jobs").insert([{
      ...form,
      skills_required: skills,
      posted_by: user.email,
      hr_id:     user.email,
      status:    "Active",
    }]);
    if (dbErr) { setError("Failed: " + dbErr.message); setLoading(false); return; }
    setLoading(false);
    onPosted();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="text-white font-bold">Post New Job</div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm">
              <AlertCircle size={14}/>{error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { label:"Job Title *",   key:"title",      type:"text",  ph:"e.g. Senior Developer" },
              { label:"Company",       key:"company",    type:"text",  ph:"Company name" },
              { label:"Location *",    key:"location",   type:"text",  ph:"e.g. Chennai, Tamil Nadu" },
              { label:"Experience",    key:"experience", type:"text",  ph:"e.g. 2-4 years" },
              { label:"Salary Range",  key:"salary",     type:"text",  ph:"e.g. ₹5-8 LPA (optional)" },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Job Type *</label>
              <select value={form.job_type} onChange={e => set("job_type", e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-white text-[#0F172A]">
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Work Mode *</label>
              <select value={form.work_mode} onChange={e => set("work_mode", e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-white text-[#0F172A]">
                {WORK_MODES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Job Description *</label>
            <textarea placeholder="Describe the role, responsibilities, and requirements..." value={form.description}
              onChange={e => set("description", e.target.value)} rows={4}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none resize-none"/>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Skills Required (press Enter to add)</label>
            <div className="flex gap-2 mb-2">
              <input placeholder="e.g. React" value={skillIn}
                onChange={e => setSkillIn(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
              <button onClick={addSkill} className="px-4 py-2.5 bg-[#F1F5F9] text-[#64748B] rounded-xl text-sm font-semibold hover:bg-[#E2E8F0]">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s,i) => (
                <span key={i} className="flex items-center gap-1 bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-3 py-1 text-xs font-semibold">
                  {s}
                  <button onClick={() => setSkills(p => p.filter((_,j) => j!==i))} className="ml-1 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#64748B] mb-2">Apply Type *</label>
            <div className="flex gap-3">
              {[["internal","Internal Apply"],["external","External Link"]].map(([v,l]) => (
                <label key={v} className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border-2 transition-all ${
                  form.apply_type===v ? "border-[#0284C7] bg-[#EFF6FF]" : "border-[#E2E8F0]"
                }`}>
                  <input type="radio" name="apply_type" value={v} checked={form.apply_type===v}
                    onChange={() => set("apply_type", v)} className="accent-[#0284C7]"/>
                  <span className="text-sm font-semibold text-[#0F172A]">{l}</span>
                </label>
              ))}
            </div>
          </div>

          {form.apply_type === "external" && (
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#64748B] mb-1.5">External Link *</label>
              <input type="url" placeholder="https://company.com/careers/job-id" value={form.external_link}
                onChange={e => set("external_link", e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
          )}

          <button onClick={handlePost} disabled={loading}
            className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90">
            {loading ? "Posting..." : "Post Job →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HRJobs() {
  const router = useRouter();
  const [user,    setUser]    = useState(null);
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [toast,   setToast]   = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) { router.push("/"); return; }
    setUser(JSON.parse(stored));
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  const handleToggle = async (job) => {
    const newStatus = job.status === "Active" ? "Inactive" : "Active";
    await supabase.from("jobs").update({ status: newStatus }).eq("id", job.id);
    setJobs(p => p.map(j => j.id===job.id ? {...j, status:newStatus} : j));
    showToast(`Job ${newStatus === "Active" ? "activated" : "deactivated"}`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    await supabase.from("jobs").delete().eq("id", id);
    setJobs(p => p.filter(j => j.id !== id));
    showToast("Job deleted");
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10 flex items-center justify-between">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">Job Postings</h1>
            <p className="text-sm text-[#64748B]">{jobs.filter(j=>j.status==="Active").length} active jobs</p>
          </div>
          <button onClick={() => setShowPost(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
            <Plus size={16}/> Post New Job
          </button>
        </div>

        {toast && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 bg-white border border-[#E2E8F0] shadow-md px-4 py-2.5 rounded-xl text-sm text-[#0F172A]">
            <CheckCircle size={14} className="text-green-500"/>{toast}
          </div>
        )}

        <div className="p-4 md:p-8">
          {loading ? (
            <div className="text-center py-20 text-[#64748B]">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">💼</div>
              <p className="font-bold text-[#0F172A] mb-1">No jobs posted yet</p>
              <p className="text-sm text-[#64748B] mb-4">Post your first job to start receiving applications.</p>
              <button onClick={() => setShowPost(true)}
                className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90">
                Post a Job →
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      {["Job Title","Type","Mode","Apply","Status","Posted","Actions"].map(h => (
                        <th key={h} className="text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide py-3 px-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job,i) => (
                      <tr key={i} className="border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-all">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-[#0F172A] text-sm">{job.title}</div>
                          <div className="text-xs text-[#64748B]">{job.company} · {job.location}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2.5 py-0.5 text-xs">{job.job_type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-2.5 py-0.5 text-xs">{job.work_mode}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748B]">{job.apply_type === "external" ? "🔗 External" : "📋 Internal"}</td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            job.status==="Active" ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]"
                          }`}>{job.status}</span>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748B]">
                          {job.created_at ? new Date(job.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleToggle(job)} title={job.status==="Active" ? "Deactivate" : "Activate"}
                              className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-all text-[#64748B]">
                              {job.status==="Active" ? <ToggleRight size={18} className="text-green-500"/> : <ToggleLeft size={18}/>}
                            </button>
                            <button onClick={() => handleDelete(job.id)} title="Delete"
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-all text-red-400">
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
          )}
        </div>
      </div>

      {showPost && user && (
        <PostJobModal
          user={user}
          onClose={() => setShowPost(false)}
          onPosted={() => { setShowPost(false); fetchJobs(); showToast("Job posted successfully!"); }}
        />
      )}
    </div>
  );
}
