"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { Eye, EyeOff, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const COMPANY_CATEGORIES = [
  "IT / Software","Manufacturing","Healthcare","Education","Finance / Banking",
  "Retail / E-commerce","Logistics","Construction","Media / Marketing",
  "Staffing / Recruitment","Government","Other",
];
const COMPANY_SIZES = ["1–10","11–50","51–200","201–500","500–1000","1000+"];

const STEP_LABELS = ["Personal Details","Company Details","Account Setup"];

export default function HRSignupPage() {
  const router = useRouter();
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const [form, setForm] = useState({
    // Step 1
    name:            "",
    personal_email:  "",
    phone:           "",
    designation:     "",
    // Step 2
    company:         "",
    company_category:"",
    company_size:    "",
    website:         "",
    address:         "",
    location:        "",
    official_email:  "",
    // Step 3
    password:        "",
    confirm_password:"",
    terms:           false,
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const validate1 = () => {
    if (!form.name.trim())           return "Full name is required.";
    if (!form.personal_email.trim()) return "Personal email is required.";
    if (!form.phone.trim())          return "Contact number is required.";
    if (!form.designation.trim())    return "Designation is required.";
    return "";
  };
  const validate2 = () => {
    if (!form.company.trim())          return "Company name is required.";
    if (!form.company_category)        return "Company category is required.";
    if (!form.location.trim())         return "City / location is required.";
    if (!form.official_email.trim())   return "Official company email is required.";
    return "";
  };
  const validate3 = () => {
    if (!form.password)                return "Password is required.";
    if (form.password.length < 8)      return "Password must be at least 8 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    if (!form.terms)                   return "Please accept the terms to continue.";
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
    const err = validate3();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      // Hash password before storing
      const hashed = await bcrypt.hash(form.password, 10);

      const { error: dbErr } = await supabase.from("hr_registry").insert([{
        name:             form.name.trim(),
        email:            form.official_email.trim().toLowerCase(), // primary email used for login
        personal_email:   form.personal_email.trim().toLowerCase(),
        phone:            form.phone.trim(),
        designation:      form.designation.trim(),
        company:          form.company.trim(),
        company_category: form.company_category,
        company_size:     form.company_size,
        website:          form.website.trim(),
        address:          form.address.trim(),
        location:         form.location.trim(),
        password:         hashed,
        status:           "pending",
        plan:             "free",
      }]);

      if (dbErr) {
        if (dbErr.code === "23505") {
          setError("An account with this email already exists.");
        } else {
          setError("Registration failed: " + dbErr.message);
        }
        setLoading(false);
        return;
      }
      setDone(true);
    } catch (err) {
      setError("Something went wrong: " + err.message);
    }
    setLoading(false);
  };

  if (done) return (
    <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500"/>
        </div>
        <h2 className="text-xl font-bold text-[#1E293B] mb-2">Registration Submitted!</h2>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 text-left mb-5 space-y-3">
          <div className="text-sm font-bold text-[#1E293B] mb-2">What happens next?</div>
          {[
            "Admin reviews your registration details",
            "Your account gets approved (usually within 24 hours)",
            "Admin assigns your unique HR Login ID",
            "Login at /hr/login using your HR ID + the password you just set",
            "Admin may contact you via WhatsApp or Email",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="w-5 h-5 rounded-full bg-[#1253A4] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
              {t}
            </div>
          ))}
        </div>

        <div className="text-xs text-slate-400 mb-5">
          Questions? Contact <span className="text-[#1253A4] font-semibold">admin@assistlana.com</span>
        </div>

        <Link href="/hr/login"
          className="block w-full bg-[#1253A4] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#0d47a1] transition-all text-center">
          Go to HR Login →
        </Link>
        <Link href="/" className="block text-center text-xs text-slate-400 mt-3 hover:underline">← Back to Home</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center p-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] w-full max-w-lg">

        {/* Header */}
        <div className="bg-[#0B1D3A] rounded-t-2xl px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-[#0EA5C9] rounded-lg flex items-center justify-center text-white font-bold">A</div>
            <div>
              <div className="text-white font-bold">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs tracking-widest uppercase">HR Registration</div>
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, idx) => {
              const n = idx + 1;
              const isActive = step === n;
              const isDone   = step > n;
              return (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                    isDone   ? "bg-green-400 text-white" :
                    isActive ? "bg-[#0EA5C9] text-white" : "bg-white/20 text-white/50"
                  }`}>
                    {isDone ? "✓" : n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? "text-white" : "text-white/50"}`}>{label}</span>
                  {idx < 2 && <div className="flex-1 h-px bg-white/20 ml-1"/>}
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

          {/* ── STEP 1: Personal Details ── */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Full Name *" value={form.name} onChange={v => set("name", v)} placeholder="Your full name"/>
              <Field label="Personal Email ID *" type="email" value={form.personal_email} onChange={v => set("personal_email", v)} placeholder="personal@gmail.com"/>
              <Field label="Contact Number *" type="tel" value={form.phone} onChange={v => set("phone", v)} placeholder="+91 9876543210"/>
              <Field label="Designation / Job Title *" value={form.designation} onChange={v => set("designation", v)} placeholder="e.g. Senior HR Manager"/>
            </div>
          )}

          {/* ── STEP 2: Company Details ── */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Company Name *" value={form.company} onChange={v => set("company", v)} placeholder="Your company name"/>
              <SelectField label="Company Category *" value={form.company_category} onChange={v => set("company_category", v)}
                options={["", ...COMPANY_CATEGORIES]} placeholder="Select category"/>
              <SelectField label="Company Size" value={form.company_size} onChange={v => set("company_size", v)}
                options={["", ...COMPANY_SIZES]} placeholder="Select size"/>
              <Field label="Company Website" value={form.website} onChange={v => set("website", v)} placeholder="https://company.com"/>
              <Field label="Company Address" value={form.address} onChange={v => set("address", v)} placeholder="Street, area, etc."/>
              <Field label="City / Location *" value={form.location} onChange={v => set("location", v)} placeholder="e.g. Chennai"/>
              <Field label="Official Company Email *" type="email" value={form.official_email} onChange={v => set("official_email", v)} placeholder="hr@company.com"/>
            </div>
          )}

          {/* ── STEP 3: Account Setup ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password * <span className="text-slate-400 font-normal">(min 8 characters)</span></label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-2.5 pr-11 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#1253A4] transition-all"/>
                  <button type="button" onClick={() => setShowPw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <input type={showCpw ? "text" : "password"} value={form.confirm_password} onChange={e => set("confirm_password", e.target.value)}
                    placeholder="Repeat your password"
                    className="w-full px-4 py-2.5 pr-11 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#1253A4] transition-all"/>
                  <button type="button" onClick={() => setShowCpw(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showCpw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.terms} onChange={e => set("terms", e.target.checked)} className="mt-0.5 accent-[#1253A4]"/>
                <span className="text-xs text-slate-600">
                  I agree to ASSISTLANA's <span className="text-[#1253A4] font-semibold">Terms of Service</span> and <span className="text-[#1253A4] font-semibold">Privacy Policy</span>.
                </span>
              </label>
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
              <button onClick={next} className="flex-1 bg-[#1253A4] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#0d47a1] transition-all flex items-center justify-center gap-2">
                Next <ChevronRight size={16}/>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-[#1253A4] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#0d47a1] disabled:opacity-60 transition-all">
                {loading ? "Submitting..." : "Submit Registration →"}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-slate-400 mt-4">
            Already have credentials?{" "}
            <Link href="/hr/login" className="text-[#1253A4] font-semibold hover:underline">Sign In</Link>
            {" · "}
            <Link href="/" className="hover:underline">Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#1253A4] transition-all bg-[#F8FAFC] focus:bg-white"/>
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#1253A4] transition-all bg-[#F8FAFC] appearance-none">
          <option value="">{placeholder}</option>
          {options.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▾</div>
      </div>
    </div>
  );
}
