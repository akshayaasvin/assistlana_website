"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/shared/PublicHeader";
import { Search, X, MapPin, Briefcase, Clock, ChevronRight, ExternalLink, Upload, AlertCircle, CheckCircle } from "lucide-react";

const JOB_TYPES = ["All", "Full-time", "Part-time", "Contract", "Internship"];
const WORK_MODES = ["All", "On-site", "Remote", "Hybrid"];

function timeAgo(ts) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  if (d < 30)  return `${d} days ago`;
  return `${Math.floor(d/30)} month${Math.floor(d/30)>1?"s":""} ago`;
}

function ApplyModal({ job, onClose, candidateUser }) {
  const [form, setForm] = useState({
    name:  candidateUser?.name  || "",
    email: candidateUser?.email || "",
    phone: "",
    cover_letter: "",
  });
  const [file,     setFile]    = useState(null);
  const [loading,  setLoading] = useState(false);
  const [success,  setSuccess] = useState(false);
  const [error,    setError]   = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.phone) { setError("Please fill name, email, and phone."); return; }
    setLoading(true);
    let resume_url = "";

    if (file) {
      const fname = `${Date.now()}_${file.name.replace(/\s/g,"_")}`;
      const { error: upErr } = await supabase.storage.from("resumes").upload(fname, file, { contentType: file.type });
      if (!upErr) {
        const { data } = supabase.storage.from("resumes").getPublicUrl(fname);
        resume_url = data.publicUrl;
      }
    }

    const { error: dbErr } = await supabase.from("job_applications").insert([{
      job_id:          job.id,
      candidate_id:    candidateUser?.id || null,
      candidate_name:  form.name,
      candidate_email: form.email,
      candidate_phone: form.phone,
      resume_url,
      cover_letter:    form.cover_letter,
      status:          "Applied",
    }]);

    if (dbErr) { setError("Submission failed: " + dbErr.message); setLoading(false); return; }
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-white font-bold">Apply: {job.title}</div>
            <div className="text-white/70 text-xs">{job.company}</div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3"/>
              <div className="font-bold text-[#0F172A] text-lg mb-1">Application Submitted!</div>
              <p className="text-[#64748B] text-sm">We'll review your application and get back to you soon.</p>
              <button onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white rounded-xl font-semibold text-sm">
                Close
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm">
                  <AlertCircle size={14}/>{error}
                </div>
              )}
              {[
                { label:"Full Name *",     key:"name",  type:"text",  ph:"Your full name" },
                { label:"Email *",         key:"email", type:"email", ph:"your@email.com" },
                { label:"Phone *",         key:"phone", type:"tel",   ph:"+91 9876543210" },
              ].map(f => (
                <div key={f.key} className="mb-4">
                  <label className="block text-sm font-semibold text-[#64748B] mb-1.5">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]:e.target.value }))}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
                </div>
              ))}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Resume (PDF)</label>
                <label className="flex items-center gap-3 border-2 border-dashed border-[#E2E8F0] rounded-xl px-4 py-3 cursor-pointer hover:border-[#0284C7] transition-all">
                  <Upload size={18} className="text-[#64748B]"/>
                  <span className="text-sm text-[#64748B]">{file ? file.name : "Click to upload PDF"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])}/>
                </label>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Cover Letter (optional)</label>
                <textarea placeholder="Tell us why you're a great fit..." value={form.cover_letter}
                  onChange={e => setForm(p => ({ ...p, cover_letter:e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none resize-none"/>
              </div>
              <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90">
                {loading ? "Submitting..." : "Submit Application →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function JobDetailModal({ job, onClose, onApply }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-white font-bold text-lg">{job.title}</div>
            <div className="text-white/70 text-sm">{job.company} · {job.location}</div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex flex-wrap gap-2 mb-5">
            {[job.job_type, job.work_mode, job.experience].filter(Boolean).map((t,i) => (
              <span key={i} className="bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-3 py-1 text-xs font-semibold">{t}</span>
            ))}
            {job.salary && (
              <span className="bg-[#DCFCE7] text-[#16A34A] rounded-full px-3 py-1 text-xs font-semibold">💰 {job.salary}</span>
            )}
          </div>
          {job.description && (
            <div className="mb-5">
              <div className="font-bold text-[#0F172A] mb-2">Job Description</div>
              <p className="text-[#64748B] text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}
          {job.skills_required?.length > 0 && (
            <div className="mb-5">
              <div className="font-bold text-[#0F172A] mb-2">Skills Required</div>
              <div className="flex flex-wrap gap-2">
                {job.skills_required.map((s,i) => (
                  <span key={i} className="bg-[#F1F5F9] text-[#64748B] rounded-full px-3 py-1 text-xs font-semibold">{s}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 border border-[#E2E8F0] text-[#0F172A] py-2.5 rounded-xl font-semibold text-sm hover:bg-[#F1F5F9]">
              Close
            </button>
            {job.apply_type === "external" && job.external_link ? (
              <a href={job.external_link} target="_blank" rel="noopener noreferrer"
                className="flex-1 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white py-2.5 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-1 hover:opacity-90">
                Apply External <ExternalLink size={14}/>
              </a>
            ) : (
              <button onClick={onApply}
                className="flex-1 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white py-2.5 rounded-xl font-semibold text-sm hover:opacity-90">
                Apply Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicJobsPage() {
  const [jobs,       setJobs]       = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [jobType,    setJobType]    = useState("All");
  const [workMode,   setWorkMode]   = useState("All");
  const [location,   setLocation]   = useState("");
  const [selected,   setSelected]   = useState(null);
  const [applying,   setApplying]   = useState(null);
  const [signInOpen, setSignInOpen] = useState(false);

  const candidateUser = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("candidate_user") || "null")
    : null;

  useEffect(() => {
    const fetchJobs = async () => {
      const { data } = await supabase.from("jobs").select("*").eq("status", "Active").order("created_at", { ascending: false });
      setJobs(data || []);
      setFiltered(data || []);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleSearch = () => {
    let res = [...jobs];
    if (search)   res = res.filter(j => `${j.title} ${j.skills_required?.join(" ")} ${j.location}`.toLowerCase().includes(search.toLowerCase()));
    if (jobType  !== "All") res = res.filter(j => j.job_type === jobType);
    if (workMode !== "All") res = res.filter(j => j.work_mode === workMode);
    if (location) res = res.filter(j => j.location?.toLowerCase().includes(location.toLowerCase()));
    setFiltered(res);
  };

  useEffect(() => { handleSearch(); }, [jobs]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicHeader
        onSignIn={() => setSignInOpen(true)}
        onGetStarted={() => setSignInOpen(true)}
      />

      {/* Filters */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-[57px] z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
              <input placeholder="Search jobs by title, skill, or location..."
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key==="Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
            <select value={jobType} onChange={e => setJobType(e.target.value)}
              className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:border-[#0284C7] outline-none bg-white">
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={workMode} onChange={e => setWorkMode(e.target.value)}
              className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] focus:border-[#0284C7] outline-none bg-white">
              {WORK_MODES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)}
              className="px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none w-32"/>
            <button onClick={handleSearch}
              className="px-5 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white rounded-xl font-semibold text-sm hover:opacity-90">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 w-full flex-1">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-[#0F172A]">
            {loading ? "Loading jobs..." : `${filtered.length} Jobs Found`}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#64748B]">Loading jobs...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🔍</div>
            <div className="font-bold text-[#0F172A] text-lg mb-1">No jobs found</div>
            <p className="text-[#64748B] text-sm">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-all flex flex-col">
                {/* Logo placeholder */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#0284C7] to-[#0D9488] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(job.company||"A")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[#0F172A] text-sm leading-tight truncate">{job.title}</div>
                    <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                      {job.company}
                      {job.location && <><span>·</span><MapPin size={10}/>{job.location}</>}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {job.work_mode && <span className="bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-2.5 py-0.5 text-xs font-semibold">{job.work_mode}</span>}
                  {job.job_type  && <span className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2.5 py-0.5 text-xs">{job.job_type}</span>}
                  {job.experience && <span className="bg-[#FEF9C3] text-[#854D0E] rounded-full px-2.5 py-0.5 text-xs">{job.experience}</span>}
                  {job.salary    && <span className="bg-[#DCFCE7] text-[#16A34A] rounded-full px-2.5 py-0.5 text-xs font-semibold">💰 {job.salary}</span>}
                </div>

                {job.skills_required?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.skills_required.slice(0,4).map((s,i) => (
                      <span key={i} className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2 py-0.5 text-[11px]">{s}</span>
                    ))}
                    {job.skills_required.length > 4 && (
                      <span className="text-[11px] text-[#64748B]">+{job.skills_required.length-4} more</span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 text-[11px] text-[#64748B] mb-4">
                  <Clock size={11}/> Posted {timeAgo(job.created_at)}
                </div>

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setSelected(job)}
                    className="flex-1 border border-[#E2E8F0] text-[#0F172A] py-2 rounded-xl text-xs font-semibold hover:bg-[#F1F5F9] transition-all flex items-center justify-center gap-1">
                    View Details <ChevronRight size={13}/>
                  </button>
                  {job.apply_type === "external" && job.external_link ? (
                    <a href={job.external_link} target="_blank" rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white py-2 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1 hover:opacity-90">
                      Apply <ExternalLink size={12}/>
                    </a>
                  ) : (
                    <button onClick={() => setApplying(job)}
                      className="flex-1 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white py-2 rounded-xl text-xs font-semibold hover:opacity-90">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <JobDetailModal
          job={selected}
          onClose={() => setSelected(null)}
          onApply={() => { setApplying(selected); setSelected(null); }}
        />
      )}
      {applying && (
        <ApplyModal
          job={applying}
          candidateUser={candidateUser}
          onClose={() => setApplying(null)}
        />
      )}
    </div>
  );
}
