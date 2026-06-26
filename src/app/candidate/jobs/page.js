"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { Search, X, MapPin, Clock, ExternalLink, Upload, AlertCircle, CheckCircle } from "lucide-react";

const JOB_TYPES = ["All","Full-time","Part-time","Contract","Internship"];
const WORK_MODES = ["All","On-site","Remote","Hybrid"];

function timeAgo(ts) {
  if (!ts) return "";
  const d = Math.floor((Date.now() - new Date(ts).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

function ApplyModal({ job, onClose, candidateUser }) {
  const [form, setForm] = useState({
    name:  candidateUser?.name  || "",
    email: candidateUser?.email || "",
    phone: "",
    cover_letter: "",
  });
  const [file, setFile]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

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
      job_id: job.id, candidate_id: candidateUser?.id || null,
      candidate_name: form.name, candidate_email: form.email,
      candidate_phone: form.phone, resume_url,
      cover_letter: form.cover_letter, status: "Applied",
    }]);
    if (dbErr) { setError("Failed: " + dbErr.message); setLoading(false); return; }
    setLoading(false); setSuccess(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="text-white font-bold text-sm">Apply: {job.title}</div>
            <div className="text-white/70 text-xs">{job.company}</div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-3"/>
              <div className="font-bold text-[#0F172A] text-lg mb-1">Application Submitted!</div>
              <p className="text-[#64748B] text-sm">We'll review and get back to you soon.</p>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white rounded-xl font-semibold text-sm">Close</button>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm">
                  <AlertCircle size={14}/>{error}
                </div>
              )}
              {[
                { label:"Full Name *", key:"name",  type:"text",  ph:"Your full name" },
                { label:"Email *",     key:"email", type:"email", ph:"your@email.com" },
                { label:"Phone *",     key:"phone", type:"tel",   ph:"+91 9876543210" },
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
                <label className="flex items-center gap-3 border-2 border-dashed border-[#E2E8F0] rounded-xl px-4 py-3 cursor-pointer hover:border-[#0284C7]">
                  <Upload size={16} className="text-[#64748B]"/>
                  <span className="text-sm text-[#64748B]">{file ? file.name : "Click to upload"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])}/>
                </label>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Cover Letter (optional)</label>
                <textarea placeholder="Why are you a great fit?" value={form.cover_letter}
                  onChange={e => setForm(p => ({ ...p, cover_letter:e.target.value }))} rows={3}
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

export default function CandidateJobs() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [jobs,      setJobs]      = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [applied,   setApplied]   = useState(new Set());
  const [applying,  setApplying]  = useState(null);
  const [search,    setSearch]    = useState("");
  const [jobType,   setJobType]   = useState("All");
  const [workMode,  setWorkMode]  = useState("All");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    const load = async () => {
      const [jobsRes, appsRes] = await Promise.all([
        supabase.from("jobs").select("*").eq("status","Active").order("created_at",{ascending:false}),
        supabase.from("job_applications").select("job_id").eq("candidate_email", u.email),
      ]);
      setJobs(jobsRes.data || []);
      setFiltered(jobsRes.data || []);
      setApplied(new Set((appsRes.data || []).map(a => a.job_id)));
      setLoading(false);
    };
    load();
  }, []);

  const handleSearch = () => {
    let res = [...jobs];
    if (search)   res = res.filter(j => `${j.title} ${j.skills_required?.join(" ")} ${j.location}`.toLowerCase().includes(search.toLowerCase()));
    if (jobType !== "All")  res = res.filter(j => j.job_type === jobType);
    if (workMode !== "All") res = res.filter(j => j.work_mode === workMode);
    setFiltered(res);
  };

  useEffect(() => { handleSearch(); }, [jobs]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10">
          <div className="pl-12 md:pl-0 mb-3">
            <h1 className="text-xl font-bold text-[#0F172A]">Browse Jobs</h1>
            <p className="text-sm text-[#64748B]">Find and apply for jobs matching your skills</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
              <input placeholder="Search jobs..." value={search}
                onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==="Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-2 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
            </div>
            <select value={jobType} onChange={e => setJobType(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] outline-none bg-white">
              {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={workMode} onChange={e => setWorkMode(e.target.value)}
              className="px-3 py-2 border border-[#E2E8F0] rounded-xl text-sm text-[#64748B] outline-none bg-white">
              {WORK_MODES.map(t => <option key={t}>{t}</option>)}
            </select>
            <button onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white rounded-xl font-semibold text-sm hover:opacity-90">
              Search
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {loading ? (
            <div className="text-center py-16 text-[#64748B]">Loading jobs...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-[#64748B] text-sm">No jobs found. Try different filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((job) => {
                const isApplied = applied.has(job.id);
                return (
                  <div key={job.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 ${
                    isApplied ? "border-[#0D9488]/30 bg-[#F0FDFA]/50" : "border-[#E2E8F0]"
                  }`}>
                    {isApplied && (
                      <div className="flex items-center gap-1.5 text-xs text-[#0D9488] font-semibold mb-2">
                        <CheckCircle size={13}/> Applied
                      </div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#0284C7] to-[#0D9488] rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {(job.company||"A")[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#0F172A] text-sm truncate">{job.title}</div>
                        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                          {job.company}
                          {job.location && <><span>·</span><MapPin size={10}/>{job.location}</>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.work_mode  && <span className="bg-[#DBEAFE] text-[#1D4ED8] rounded-full px-2.5 py-0.5 text-xs font-semibold">{job.work_mode}</span>}
                      {job.job_type   && <span className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2.5 py-0.5 text-xs">{job.job_type}</span>}
                      {job.experience && <span className="bg-[#FEF9C3] text-[#854D0E] rounded-full px-2.5 py-0.5 text-xs">{job.experience}</span>}
                      {job.salary     && <span className="bg-[#DCFCE7] text-[#16A34A] rounded-full px-2.5 py-0.5 text-xs">💰 {job.salary}</span>}
                    </div>

                    {job.skills_required?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.skills_required.slice(0,4).map((s,i) => (
                          <span key={i} className="bg-[#F1F5F9] text-[#64748B] rounded-full px-2 py-0.5 text-[11px]">{s}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[11px] text-[#64748B] mb-3">
                      <Clock size={10}/> Posted {timeAgo(job.created_at)}
                    </div>

                    <div className="flex gap-2">
                      {job.apply_type === "external" && job.external_link ? (
                        <a href={job.external_link} target="_blank" rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 hover:opacity-90">
                          Apply External <ExternalLink size={11}/>
                        </a>
                      ) : (
                        <button onClick={() => !isApplied && setApplying(job)} disabled={isApplied}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isApplied
                              ? "bg-[#DCFCE7] text-[#16A34A] cursor-not-allowed"
                              : "bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white hover:opacity-90"
                          }`}>
                          {isApplied ? "✅ Applied" : "Apply Now"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {applying && (
        <ApplyModal
          job={applying}
          candidateUser={user}
          onClose={() => {
            setApplying(null);
            setApplied(prev => new Set([...prev, applying.id]));
          }}
        />
      )}
    </div>
  );
}
