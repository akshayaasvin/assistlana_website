"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/shared/PublicHeader";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

const ROLES = [
  "Web Development",
  "Python + AI",
  "Digital Marketing",
  "Data Analytics",
  "HR & Recruitment",
  "Graphic Design",
  "Content Writing",
];

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Final Year", "PG", "Fresher"];

export default function InternshipApplyPage() {
  const [form, setForm] = useState({
    name:"", email:"", phone:"", college:"", department:"",
    year_of_study:"", role:"", message:"",
  });
  const [file,    setFile]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const handleSubmit = async () => {
    setError("");
    const required = ["name","email","phone","college","department","year_of_study","role"];
    for (const k of required) {
      if (!form[k]) { setError(`Please fill in: ${k.replace("_"," ")}`); return; }
    }
    setLoading(true);

    let resume_url = "";
    if (file) {
      if (file.size > 5 * 1024 * 1024) { setError("File too large (max 5MB)."); setLoading(false); return; }
      const fname = `${Date.now()}_${file.name.replace(/\s/g,"_")}`;
      const { error: upErr } = await supabase.storage.from("internship-resumes").upload(fname, file, { contentType: file.type });
      if (!upErr) {
        const { data } = supabase.storage.from("internship-resumes").getPublicUrl(fname);
        resume_url = data.publicUrl;
      }
    }

    const { error: dbErr } = await supabase.from("internship_applications").insert([{
      ...form,
      resume_url,
      status: "Pending",
    }]);

    if (dbErr) { setError("Submission failed: " + dbErr.message); setLoading(false); return; }
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <PublicHeader/>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-10 text-center max-w-md shadow-sm">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-4"/>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Application Submitted!</h2>
            <p className="text-[#64748B] text-sm mb-4">
              We've received your application for the{" "}
              <span className="font-semibold text-[#0284C7]">{form.role}</span> internship.
            </p>
            <div className="bg-[#DCFCE7] text-[#16A34A] rounded-full px-4 py-1.5 text-sm font-semibold inline-block mb-6">
              ✅ {form.role} · Pending Review
            </div>
            <Link href="/"
              className="block w-full py-2.5 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white rounded-xl font-semibold text-sm hover:opacity-90 text-center">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicHeader/>

      {/* Hero */}
      <div className="bg-white border-b border-[#E2E8F0] py-10 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-2">
          Launch Your Career with{" "}
          <span className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] bg-clip-text text-transparent">
            ASSISTLANA Internship
          </span>
        </h1>
        <p className="text-[#64748B] text-sm mb-4">Real-world experience at Pondicherry's leading HR-tech company</p>
        <div className="flex flex-wrap justify-center gap-3">
          {["💰 Paid Stipend","🎓 Certificate","💼 Job Referral"].map(b => (
            <span key={b} className="bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] px-4 py-1.5 rounded-full text-xs font-semibold">{b}</span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-8 w-full max-w-2xl">
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">Internship Application Form</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={14}/>{error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {[
              { label:"Full Name *",   key:"name",       type:"text",  ph:"Your full name" },
              { label:"Email *",       key:"email",      type:"email", ph:"your@email.com" },
              { label:"Phone *",       key:"phone",      type:"tel",   ph:"+91 9876543210" },
              { label:"College *",     key:"college",    type:"text",  ph:"Your college name" },
              { label:"Department *",  key:"department", type:"text",  ph:"e.g. B.E Computer Science" },
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
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Internship Role *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROLES.map(r => (
                <button key={r} type="button" onClick={() => set("role", r)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-left ${
                    form.role === r
                      ? "border-[#0284C7] bg-[#EFF6FF] text-[#0284C7]"
                      : "border-[#E2E8F0] text-[#64748B] hover:border-[#0284C7]/40"
                  }`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Resume (PDF, max 5MB)</label>
            <label className="flex items-center gap-3 border-2 border-dashed border-[#E2E8F0] rounded-xl px-4 py-3 cursor-pointer hover:border-[#0284C7] transition-all">
              <Upload size={18} className="text-[#64748B]"/>
              <span className="text-sm text-[#64748B]">{file ? file.name : "Click to upload PDF"}</span>
              <input type="file" accept=".pdf" className="hidden" onChange={e => setFile(e.target.files[0])}/>
            </label>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Why do you want this internship? (optional)</label>
            <textarea placeholder="Tell us about your motivation and goals..." value={form.message}
              onChange={e => set("message", e.target.value)} rows={3}
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none resize-none"/>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
            {loading ? "Submitting..." : "Submit Application →"}
          </button>
        </div>
      </div>
    </div>
  );
}
