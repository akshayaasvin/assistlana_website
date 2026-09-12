"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Eye, EyeOff, X, ChevronRight } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const DOMAINS = [
  "💻 Software Development","🎨 UI/UX Design","📊 Data Science / Analytics",
  "☁️ Cloud / DevOps","🔒 Cybersecurity","📱 Mobile Development",
  "📢 Digital Marketing","💼 HR / Recruitment","💰 Finance / Accounting",
  "🛍️ Sales / Business Development","📋 Operations / Management",
  "🎓 Education / Training","Other",
];
const SALARY_RANGES = ["Below 2 LPA","2–4 LPA","4–6 LPA","6–10 LPA","10 LPA+"];
const EXP_LEVELS = [
  { key:"Fresher",   label:"🟢 Fresher",   sub:"0–1 years" },
  { key:"Junior",    label:"🟡 Junior",    sub:"1–3 years" },
  { key:"Mid-level", label:"🟠 Mid-level", sub:"3–5 years" },
  { key:"Senior",    label:"🔴 Senior",    sub:"5+ years"  },
];
const WORK_MODES = ["Work From Home (Remote)","Work From Office","Hybrid","Willing to Relocate"];
const STEP_LABELS = ["Personal Info","Professional Info","Job Preferences"];

export default function CandidateSignupPage() {
  const router = useRouter();
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [showPw,  setShowPw]  = useState(false);

  const [form, setForm] = useState({
    // Step 1
    name:             "",
    phone:            "",
    email:            "",
    password:         "",
    current_location: "",
    // Step 2
    experience_level: "",
    domain:           "",
    skills:           [],
    skillInput:       "",
    // Step 3
    preferred_location:  "",
    work_mode:           [],
    willing_to_relocate: false,
    relocation_cities:   "",
    expected_salary:     "",
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const addSkill = () => {
    const s = form.skillInput.trim();
    if (s && !form.skills.includes(s)) set("skills", [...form.skills, s]);
    set("skillInput", "");
  };
  const removeSkill = (s) => set("skills", form.skills.filter(x => x !== s));

  const toggleWorkMode = (mode) => {
    const cur = form.work_mode;
    const next = cur.includes(mode) ? cur.filter(m => m !== mode) : [...cur, mode];
    const reloc = next.includes("Willing to Relocate");
    set("work_mode", next);
    if (!reloc) set("relocation_cities", "");
    set("willing_to_relocate", reloc);
  };

  const validate1 = () => {
    if (!form.name.trim())             return "Full name is required.";
    if (!form.phone.trim())            return "Phone number is required.";
    if (!form.email.trim())            return "Email is required.";
    if (!form.password || form.password.length < 6) return "Password must be at least 6 characters.";
    if (!form.current_location.trim()) return "Current location is required.";
    return "";
  };
  const validate2 = () => {
    if (!form.experience_level) return "Please select your experience level.";
    if (!form.domain)           return "Please select your primary domain.";
    return "";
  };

  const next = () => {
    setError("");
    const err = step === 1 ? validate1() : validate2();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
  };
  const back = () => { setError(""); setStep(s => s - 1); };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from("candidates").select("id").eq("email", form.email.trim().toLowerCase()).maybeSingle();

      if (existing) {
        setError("An account with this email already exists. Please sign in.");
        setLoading(false);
        return;
      }

      const { data, error: dbErr } = await supabase.from("candidates").insert([{
        name:             form.name.trim(),
        email:            form.email.trim().toLowerCase(),
        password:         form.password,
        phone:            form.phone.trim(),
        current_location: form.current_location.trim(),
        experience_level: form.experience_level,
        domain:           form.domain,
        skills:           form.skills,
        preferred_location:  form.preferred_location.trim(),
        work_mode:           form.work_mode.join(", "),
        willing_to_relocate: form.willing_to_relocate,
        relocation_cities:   form.relocation_cities.trim(),
        expected_salary:     form.expected_salary,
        status:              "Pending",
        ai_score:            0,
        jd_match:            0,
      }]).select().single();

      if (dbErr) { setError("Registration failed: " + dbErr.message); setLoading(false); return; }

      localStorage.setItem("candidate_user", JSON.stringify({ name:data.name, email:data.email, id:data.id }));
      router.push("/candidate/dashboard");
    } catch (err) {
      setError("Something went wrong: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center p-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] w-full max-w-lg">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-t-2xl px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="text-white font-bold">ASSISTLANA</div>
              <div className="text-white/70 text-xs tracking-widest uppercase">Job Seeker Registration</div>
            </div>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, idx) => {
              const n = idx + 1;
              const isActive = step === n;
              const isDone   = step > n;
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isDone ? "bg-green-400 text-white" : isActive ? "bg-white text-[#2563EB]" : "bg-white/20 text-white/50"
                  }`}>
                    {isDone ? "✓" : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-white" : "text-white/50"}`}>{label}</span>
                  {idx < 2 && <div className="flex-1 h-px bg-white/30 ml-1"/>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-bold text-[#1E293B] text-base mb-4">Step {step} — {STEP_LABELS[step-1]}</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg mb-4">{error}</div>
          )}

          {/* ── STEP 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-4">
              <SField label="Full Name *" value={form.name} onChange={v => set("name", v)} placeholder="Your full name"/>
              <SField label="Phone Number *" type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="+91 9876543210"/>
              <SField label="Email ID *" type="email" value={form.email} onChange={v => set("email", v)} placeholder="you@email.com"/>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password * <span className="text-slate-400 font-normal">(min 6 chars)</span></label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                    placeholder="Create a password"
                    className="w-full px-4 py-2.5 pr-11 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#2563EB] transition-all bg-[#F8FAFC]"/>
                  <button type="button" onClick={() => setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <SField label="Current Location / City *" value={form.current_location} onChange={v => set("current_location", v)} placeholder="e.g. Chennai"/>
            </div>
          )}

          {/* ── STEP 2: Professional Info ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Experience Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXP_LEVELS.map(e => (
                    <button key={e.key} type="button" onClick={() => set("experience_level", e.key)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.experience_level === e.key
                          ? "border-[#2563EB] bg-blue-50"
                          : "border-[#E2E8F0] hover:border-[#2563EB]/50"
                      }`}>
                      <div className="text-sm font-semibold text-[#1E293B]">{e.label}</div>
                      <div className="text-xs text-slate-400">{e.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Primary Domain *</label>
                <div className="relative">
                  <select value={form.domain} onChange={e => set("domain", e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#2563EB] bg-[#F8FAFC] appearance-none">
                    <option value="">Select your domain</option>
                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</div>
                </div>
              </div>

              {/* Skills tag input */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Skills <span className="text-slate-400 font-normal">(press Enter to add)</span></label>
                <div className="flex gap-2">
                  <input value={form.skillInput} onChange={e => set("skillInput", e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    placeholder="e.g. React, Python, Figma..."
                    className="flex-1 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#2563EB] bg-[#F8FAFC]"/>
                  <button type="button" onClick={addSkill}
                    className="px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-semibold hover:bg-[#1D4ED8] transition-all">
                    Add
                  </button>
                </div>
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.skills.map(s => (
                      <span key={s} className="flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] text-xs px-2 py-1 rounded-md font-medium">
                        {s}
                        <button type="button" onClick={() => removeSkill(s)} className="text-[#2563EB]/60 hover:text-[#2563EB]"><X size={11}/></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Job Preferences ── */}
          {step === 3 && (
            <div className="space-y-5">
              <SField label="Preferred Job Location / City" value={form.preferred_location} onChange={v => set("preferred_location", v)} placeholder="e.g. Bangalore, Mumbai"/>

              {/* Work Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Work Mode Preference <span className="text-slate-400 font-normal">(select all that apply)</span></label>
                <div className="space-y-2">
                  {WORK_MODES.map(m => (
                    <label key={m} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#F8FAFC] transition-all">
                      <input type="checkbox" checked={form.work_mode.includes(m)} onChange={() => toggleWorkMode(m)} className="accent-[#2563EB]"/>
                      <span className="text-sm text-slate-700">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Relocation cities — shown only if "Willing to Relocate" is checked */}
              {form.willing_to_relocate && (
                <SField label="Preferred Cities to Relocate" value={form.relocation_cities}
                  onChange={v => set("relocation_cities", v)} placeholder="e.g. Hyderabad, Pune"/>
              )}

              {/* Expected Salary */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expected Salary Range <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <select value={form.expected_salary} onChange={e => set("expected_salary", e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#2563EB] bg-[#F8FAFC] appearance-none">
                    <option value="">Select range</option>
                    {SALARY_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button onClick={back} className="flex-1 border border-[#E2E8F0] text-slate-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-[#F8FAFC] transition-all">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={next}
                className="flex-1 bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1D4ED8] transition-all flex items-center justify-center gap-2">
                Next <ChevronRight size={16}/>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-[#2563EB] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1D4ED8] disabled:opacity-60 transition-all">
                {loading ? "Creating account..." : "Create Account →"}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Already have an account?{" "}
            <button onClick={() => router.push("/")} className="text-[#2563EB] font-semibold hover:underline">Sign In</button>
            {" · "}
            <Link href="/" className="hover:underline">Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function SField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#2563EB] transition-all bg-[#F8FAFC] focus:bg-white"/>
    </div>
  );
}
