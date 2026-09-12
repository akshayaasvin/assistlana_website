"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

const ROLES = [
  "Web Development","Python + AI","Digital Marketing",
  "Data Analytics","HR & Recruitment","Graphic Design","Content Writing",
];
const YEARS = ["1st Year","2nd Year","3rd Year","4th Year","Final Year","PG","Fresher"];

export default function CandidateInternship() {
  const router = useRouter();
  const [user,       setUser]       = useState(null);
  const [pastApp,    setPastApp]    = useState(null);
  const [file,       setFile]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");
  const [form, setForm] = useState({
    name:"", email:"", phone:"", college:"", department:"",
    year_of_study:"", role:"", message:"",
  });

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setForm(p => ({ ...p, name: u.name || "", email: u.email || "" }));

    supabase.from("internship_applications").select("*").eq("email", u.email).maybeSingle()
      .then(({ data }) => { if (data) setPastApp(data); });
  }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    const required = ["name","email","phone","college","department","year_of_study","role"];
    for (const k of required) {
      if (!form[k]) { setError(`Please fill: ${k.replace("_"," ")}`); return; }
    }
    setLoading(true);
    let resume_url = "";
    if (file) {
      const fname = `${Date.now()}_${file.name.replace(/\s/g,"_")}`;
      const { error: upErr } = await supabase.storage.from("internship-resumes").upload(fname, file, { contentType: file.type });
      if (!upErr) {
        const { data } = supabase.storage.from("internship-resumes").getPublicUrl(fname);
        resume_url = data.publicUrl;
      }
    }
    const { error: dbErr } = await supabase.from("internship_applications").insert([{ ...form, resume_url, status:"Pending" }]);
    if (dbErr) { setError("Failed: " + dbErr.message); setLoading(false); return; }
    setLoading(false);
    setSuccess(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 min-w-0">
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-4 sticky top-0 z-10">
          <div className="pl-12 md:pl-0">
            <h1 className="text-xl font-bold text-[#0F172A]">Internship Application</h1>
            <p className="text-sm text-[#64748B]">Apply for ASSISTLANA internship programs</p>
          </div>
        </div>

        <div className="p-4 md:p-8 max-w-2xl">
          {/* Past application status */}
          {pastApp && (
            <div className="bg-[#F0FDFA] border border-[#99F6E4] rounded-2xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle size={20} className="text-[#0D9488] flex-shrink-0"/>
              <div>
                <div className="font-bold text-[#0D9488] text-sm">Application Already Submitted</div>
                <div className="text-xs text-[#64748B]">Role: {pastApp.role} · Status: <span className="font-semibold">{pastApp.status}</span></div>
              </div>
            </div>
          )}

          {success ? (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center shadow-sm">
              <CheckCircle size={52} className="text-green-500 mx-auto mb-3"/>
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Application Submitted!</h2>
              <p className="text-[#64748B] text-sm">We'll review your <span className="font-semibold text-[#0284C7]">{form.role}</span> application soon.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex flex-wrap gap-2 mb-5">
                {["💰 Paid Stipend","🎓 Certificate","💼 Job Referral"].map(b => (
                  <span key={b} className="bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] px-3 py-1 rounded-full text-xs font-semibold">{b}</span>
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 mb-4 text-sm">
                  <AlertCircle size={14}/>{error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[
                  { label:"Full Name *",  key:"name",       type:"text",  ph:"Your name" },
                  { label:"Email *",      key:"email",      type:"email", ph:"your@email.com" },
                  { label:"Phone *",      key:"phone",      type:"tel",   ph:"+91 9876543210" },
                  { label:"College *",    key:"college",    type:"text",  ph:"College name" },
                  { label:"Department *", key:"department", type:"text",  ph:"e.g. B.E Computer Science" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">{f.label}</label>
                    <input type={f.type} placeholder={f.ph} value={form[f.key]}
                      onChange={e => set(f.key, e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Year of Study *</label>
                  <select value={form.year_of_study} onChange={e => set("year_of_study", e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none bg-white text-[#0F172A]">
                    <option value="">Select year...</option>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-2">Internship Role *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ROLES.map(r => (
                    <button key={r} type="button" onClick={() => set("role", r)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-left ${
                        form.role === r ? "border-[#0284C7] bg-[#EFF6FF] text-[#0284C7]" : "border-[#E2E8F0] text-[#64748B]"
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Resume (PDF)</label>
                <label className="flex items-center gap-3 border-2 border-dashed border-[#E2E8F0] rounded-xl px-4 py-3 cursor-pointer hover:border-[#0284C7] transition-all">
                  <Upload size={16} className="text-[#64748B]"/>
                  <span className="text-sm text-[#64748B]">{file ? file.name : "Click to upload PDF"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])}/>
                </label>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Why this internship? (optional)</label>
                <textarea placeholder="Your motivation..." value={form.message}
                  onChange={e => set("message", e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none resize-none"/>
              </div>

              <button onClick={handleSubmit} disabled={loading || !!pastApp}
                className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90">
                {pastApp ? "Already Applied" : loading ? "Submitting..." : "Submit Application →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
