"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, UserCircle, X, Mail, Lock, Eye, EyeOff,
  AlertCircle, Shield, Menu, CheckCircle,
} from "lucide-react";
import { HR_USERS_AUTH, ADMIN_USERS } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/shared/PublicHeader";

/* ─── PWA Install Button ─────────────────────────── */
function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  if (installed || !deferredPrompt) return null;
  return (
    <button onClick={handleInstall}
      className="flex items-center gap-2 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white px-4 py-2 rounded-xl text-sm font-semibold">
      📲 Install App
    </button>
  );
}

/* ─── Gallery photos ────────────────────────────── */
const GALLERY = [
  { year: "2022", label: "Campus Drive 2022" },
  { year: "2023", label: "Campus Drive 2023" },
  { year: "2024", label: "Campus Drive 2024" },
  { year: "2025", label: "Campus Drive 2025" },
];

export default function HomePage() {
  const router = useRouter();

  const [showSignIn,   setShowSignIn]   = useState(false);
  const [showSignUp,   setShowSignUp]   = useState(false);
  const [portalChoice, setPortalChoice] = useState(null); // "hr"|"candidate"|"admin"
  const [showPass,     setShowPass]     = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [userId,   setUserId]   = useState(""); // admin userId field

  const [signupData, setSignupData] = useState({ name:"", email:"", password:"", role:"candidate" });

  const resetModal = () => {
    setError(""); setEmail(""); setPassword(""); setUserId("");
    setShowPass(false); setPortalChoice(null); setLoading(false);
  };

  const openSignIn = () => { resetModal(); setShowSignIn(true); };
  const openSignUp = () => { resetModal(); setShowSignUp(true); };

  /* ── SIGN IN ─────────────────────────────────── */
  const handleSignIn = async () => {
    setError("");

    if (portalChoice === "admin") {
      if (!userId || !password) { setError("Please enter User ID and password."); return; }
      const admin = ADMIN_USERS.find(a => a.userId === userId && a.password === password);
      if (admin) {
        localStorage.setItem("admin_user", JSON.stringify(admin));
        setShowSignIn(false); resetModal();
        router.push("/admin/dashboard");
      } else {
        setError("Invalid admin credentials.");
      }
      return;
    }

    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (portalChoice === "hr") {
      const user = HR_USERS_AUTH.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem("hr_user", JSON.stringify(user));
        setShowSignIn(false); resetModal();
        router.push("/hr/upload");
      } else {
        setError("Invalid HR email or password.");
        setLoading(false);
      }
    } else {
      const { data, error: dbError } = await supabase
        .from("candidates").select("*").eq("email", email).single();
      if (dbError || !data) {
        setError("No account found. Please sign up first.");
        setLoading(false); return;
      }
      if (data.password !== password) {
        setError("Incorrect password."); setLoading(false); return;
      }
      localStorage.setItem("candidate_user", JSON.stringify({ name:data.name, email:data.email, id:data.id }));
      setShowSignIn(false); resetModal();
      router.push("/candidate/dashboard");
    }
  };

  /* ── SIGN UP ─────────────────────────────────── */
  const handleSignUp = async () => {
    setError("");
    if (!signupData.name || !signupData.email || !signupData.password) {
      setError("Please fill all fields."); return;
    }
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }
    setLoading(true);
    try {
      if (signupData.role === "candidate") {
        const { data: existing } = await supabase.from("candidates")
          .select("*").eq("email", signupData.email).maybeSingle();

        if (existing) {
          const { data: updated, error: updateError } = await supabase.from("candidates")
            .update({ password: signupData.password, name: signupData.name })
            .eq("email", signupData.email).select().single();
          if (updateError) { setError("Update failed: " + updateError.message); setLoading(false); return; }
          localStorage.setItem("candidate_user", JSON.stringify({ name:updated.name, email:updated.email, id:updated.id }));
        } else {
          const { data: created, error: createError } = await supabase.from("candidates")
            .insert([{ name:signupData.name, email:signupData.email, password:signupData.password, status:"Pending", ai_score:0, jd_match:0, skills:[] }])
            .select().single();
          if (createError) { setError("Signup failed: " + createError.message); setLoading(false); return; }
          localStorage.setItem("candidate_user", JSON.stringify({ name:created.name, email:created.email, id:created.id }));
        }
        setLoading(false); setShowSignUp(false); resetModal();
        router.push("/candidate/dashboard");
      } else {
        setLoading(false); setShowSignUp(false);
        setSuccessMsg("HR account request sent! Admin will approve.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setError("Something went wrong: " + err.message); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* ── HEADER ── */}
      <PublicHeader onSignIn={openSignIn} onGetStarted={openSignUp}/>

      {/* Install + success toast */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 items-end">
        <InstallButton/>
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm shadow-md">
            <CheckCircle size={16}/>{successMsg}
          </div>
        )}
      </div>

      {/* ══ SECTION 1: HERO ══════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Gradient blob */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-[#E0F2FE]/60 to-[#CCFBF1]/60 rounded-full blur-3xl"/>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 md:px-8 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            🏆 Est. 2019 · Pondicherry, Tamil Nadu
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0F172A] leading-tight mb-4">
            Build Your Career with<br/>
            <span className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] bg-clip-text text-transparent">
              AI-Powered HR Solutions
            </span>
          </h1>
          <p className="text-[#64748B] text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            ASSISTLANA connects job seekers with top companies through intelligent resume screening,
            AI mock interviews, and smart job matching — from Pondicherry, serving Tamil Nadu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/jobs"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-sm">
              🔍 Browse Jobs
            </Link>
            <Link href="/apply"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#0D9488] text-[#0D9488] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#F0FDFA] transition-all">
              🎓 Apply for Internship
            </Link>
            <button onClick={openSignIn}
              className="inline-flex items-center justify-center gap-2 border border-[#E2E8F0] text-[#0F172A] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#F1F5F9] transition-all">
              Sign In / Register
            </button>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { val:"500+",  label:"Students Placed" },
              { val:"50+",   label:"College Partners" },
              { val:"200+",  label:"Jobs Posted" },
              { val:"2019",  label:"Est. Pondicherry" },
            ].map((s,i) => (
              <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-4 text-center shadow-sm">
                <div className="text-2xl font-extrabold bg-gradient-to-r from-[#0284C7] to-[#0D9488] bg-clip-text text-transparent">{s.val}</div>
                <div className="text-xs text-[#64748B] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 2: WHAT WE DO ════════════════════ */}
      <section className="bg-[#F8FAFC] py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-2">What We Do</h2>
            <p className="text-[#64748B]">End-to-end recruitment and career solutions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon:"🏢", title:"HR & Recruitment Services", desc:"End-to-end campus placement drives, bulk hiring, and talent acquisition for companies across Tamil Nadu." },
              { icon:"🤖", title:"AI Resume Screening",       desc:"Upload resumes, get instant ATS scores, JD matching, and AI-powered candidate shortlisting in seconds." },
              { icon:"🎓", title:"Student Career Programs",   desc:"Internships, mock interviews, resume AI coaching, and job placement support for fresh graduates." },
            ].map((c,i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0284C7] to-[#0D9488] rounded-xl flex items-center justify-center text-2xl mb-4">
                  {c.icon}
                </div>
                <h3 className="font-bold text-[#0F172A] mb-2">{c.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 3: FOR JOB SEEKERS ═══════════════ */}
      <section className="bg-[#F0FDFA] py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#0F172A] mb-2">Your Career Journey Starts Here</h2>
            <p className="text-[#64748B]">Tools and opportunities designed for job seekers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { icon:"📄", title:"Resume AI Suggestions",  desc:"Get instant feedback on your resume with ATS score and improvement tips", href:"/candidate/resume" },
              { icon:"💼", title:"Browse & Apply Jobs",    desc:"Find jobs matching your skills and apply directly or via company portal", href:"/jobs" },
              { icon:"🎓", title:"Internship Programs",    desc:"Apply for hands-on internships at ASSISTLANA and partner companies",      href:"/apply" },
              { icon:"🎤", title:"AI Mock Interview",      desc:"Practice interviews with our Tamil/English AI interviewer and get scored", href:"/candidate/mock-interview" },
            ].map((f,i) => (
              <Link key={i} href={f.href}
                className="flex items-start gap-4 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm hover:border-[#0D9488] hover:shadow-md transition-all">
                <div className="w-11 h-11 bg-gradient-to-br from-[#0284C7]/10 to-[#0D9488]/10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="font-bold text-[#0F172A] text-sm mb-1">{f.title}</div>
                  <div className="text-[#64748B] text-xs leading-relaxed">{f.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SECTION 4: FOR HR / COMPANIES ════════════ */}
      <section className="bg-white py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-[#0F172A] mb-4">Smarter Hiring, Faster Results</h2>
              <div className="space-y-4">
                {[
                  { icon:"⚡", text:"Upload bulk resumes — get ranked candidates in 60 seconds" },
                  { icon:"🎯", text:"JD matching with semantic AI — find the right fit fast" },
                  { icon:"📊", text:"Full analytics dashboard with Excel export" },
                ].map((p,i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gradient-to-r from-[#0284C7]/10 to-[#0D9488]/10 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                      {p.icon}
                    </div>
                    <p className="text-[#64748B] text-sm leading-relaxed pt-1.5">{p.text}</p>
                  </div>
                ))}
              </div>
              <button onClick={openSignUp}
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shadow-sm">
                Start Hiring Free →
              </button>
            </div>
            <div className="bg-gradient-to-br from-[#E0F2FE] to-[#CCFBF1] rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">🤖</div>
              <div className="text-2xl font-extrabold text-[#0F172A] mb-2">AI-First Recruitment</div>
              <p className="text-[#64748B] text-sm">Powered by NLP and semantic matching to find your perfect candidates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 5: GALLERY STRIP ══════════════════ */}
      <section className="bg-[#F8FAFC] py-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-[#0F172A]">Our Events</h2>
            <Link href="/gallery" className="text-[#0284C7] text-sm font-semibold hover:underline">
              View All Events →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {GALLERY.map((g) => (
              <div key={g.year} className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0284C7] to-[#0D9488] aspect-[4/3] flex items-end">
                <div className="absolute inset-0 bg-black/20"/>
                <div className="relative p-3">
                  <div className="text-white font-bold text-sm">{g.label}</div>
                  <div className="text-white/70 text-xs">{g.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════ */}
      <footer className="bg-white border-t border-[#E2E8F0] py-12 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="text-xl font-extrabold bg-gradient-to-r from-[#0284C7] to-[#0D9488] bg-clip-text text-transparent mb-2">
                ASSISTLANA
              </div>
              <p className="text-[#64748B] text-sm mb-3">HR Consultancy & AI Recruitment Platform</p>
              <p className="text-[#64748B] text-xs">Pondicherry, Tamil Nadu, India</p>
              <p className="text-[#64748B] text-xs">contact@assistlana.com</p>
              <p className="text-[#64748B] text-xs">+91 8553451935</p>
            </div>
            {/* Links */}
            <div>
              <div className="font-bold text-[#0F172A] mb-3 text-sm">Quick Links</div>
              <div className="space-y-2">
                {[["Home","/"],["Jobs","/jobs"],["Internship","/apply"],["Gallery","/gallery"],["Sign In","#signin"]].map(([l,h]) => (
                  <Link key={l} href={h === "#signin" ? "#" : h}
                    onClick={h === "#signin" ? (e) => { e.preventDefault(); openSignIn(); } : undefined}
                    className="block text-[#64748B] text-sm hover:text-[#0284C7] transition-all">
                    {l}
                  </Link>
                ))}
              </div>
            </div>
            {/* Badge */}
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#E0F2FE] to-[#CCFBF1] border border-[#BAE6FD] px-4 py-2 rounded-xl self-start">
                <span className="text-sm">🤖</span>
                <span className="text-sm font-semibold text-[#0284C7]">Powered by AI</span>
              </div>
              <p className="text-[#64748B] text-xs leading-relaxed">
                Smart recruitment platform built for Tamil Nadu's job market with AI at its core.
              </p>
            </div>
          </div>
          <div className="border-t border-[#E2E8F0] pt-6 text-center text-xs text-[#64748B]">
            © 2025 ASSISTLANA. HR Consultancy & AI Recruitment Platform. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ══ SIGN IN MODAL ══════════════════════════════ */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] px-8 py-5 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Sign In</div>
                <div className="text-white/70 text-sm">Access your portal</div>
              </div>
              <button onClick={() => { setShowSignIn(false); resetModal(); }}
                className="text-white/70 hover:text-white">
                <X size={20}/>
              </button>
            </div>

            <div className="p-7">
              {/* Step 1: Choose Portal */}
              {!portalChoice && (
                <div>
                  <div className="text-sm font-semibold text-[#64748B] mb-4 text-center">Who are you signing in as?</div>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setPortalChoice("hr")}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#0284C7] hover:bg-[#F0F9FF] transition-all">
                      <Users size={22} className="text-[#0284C7]"/>
                      <div className="font-bold text-[#0F172A] text-xs">HR Team</div>
                      <div className="text-[10px] text-[#64748B]">Recruiter</div>
                    </button>
                    <button onClick={() => setPortalChoice("candidate")}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#0D9488] hover:bg-[#F0FDFA] transition-all">
                      <UserCircle size={22} className="text-[#0D9488]"/>
                      <div className="font-bold text-[#0F172A] text-xs">Candidate</div>
                      <div className="text-[10px] text-[#64748B]">Job Seeker</div>
                    </button>
                    <button onClick={() => setPortalChoice("admin")}
                      className="flex flex-col items-center gap-2 p-4 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#7C3AED] hover:bg-[#F5F3FF] transition-all">
                      <Shield size={22} className="text-[#7C3AED]"/>
                      <div className="font-bold text-[#0F172A] text-xs">Admin</div>
                      <div className="text-[10px] text-[#64748B]">Super Admin</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Login Form */}
              {portalChoice && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => { setPortalChoice(null); setError(""); }}
                      className="text-xs text-[#64748B] hover:text-[#0F172A] underline">← Back</button>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      portalChoice==="hr"        ? "bg-[#DBEAFE] text-[#1D4ED8]" :
                      portalChoice==="candidate" ? "bg-[#DCFCE7] text-[#16A34A]" :
                                                   "bg-[#EDE9FE] text-[#7C3AED]"
                    }`}>
                      {portalChoice==="hr" ? "HR Portal" : portalChoice==="candidate" ? "Candidate Portal" : "Admin Portal"}
                    </span>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                      <AlertCircle size={14}/>{error}
                    </div>
                  )}

                  {portalChoice === "admin" ? (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-[#64748B] mb-1.5">User ID</label>
                        <input type="text" placeholder="e.g. admin001" value={userId}
                          onChange={e => setUserId(e.target.value)}
                          className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#0284C7] outline-none"/>
                      </div>
                      <div className="mb-5">
                        <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Password</label>
                        <div className="relative">
                          <input type={showPass ? "text" : "password"} placeholder="Enter password" value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key==="Enter" && handleSignIn()}
                            className="w-full pr-10 px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#0284C7] outline-none"/>
                          <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Email Address</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
                          <input type="email" placeholder="Enter your email" value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#0284C7] outline-none"/>
                        </div>
                      </div>
                      <div className="mb-5">
                        <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Password</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
                          <input type={showPass ? "text" : "password"} placeholder="Enter your password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key==="Enter" && handleSignIn()}
                            className="w-full pl-9 pr-10 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#0284C7] outline-none"/>
                          <button type="button" onClick={() => setShowPass(!showPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                            {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  <button onClick={handleSignIn} disabled={loading}
                    className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-[#64748B]">
                Don't have an account?{" "}
                <button onClick={() => { setShowSignIn(false); openSignUp(); }}
                  className="text-[#0284C7] font-semibold hover:underline">Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SIGN UP MODAL ═════════════════════════════ */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#0284C7] to-[#0D9488] px-8 py-5 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Create Account</div>
                <div className="text-white/70 text-sm">Join ASSISTLANA platform</div>
              </div>
              <button onClick={() => { setShowSignUp(false); resetModal(); }}
                className="text-white/70 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-7">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle size={14}/>{error}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. Priya Rajan" value={signupData.name}
                  onChange={e => setSignupData(p => ({ ...p, name:e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Email Address</label>
                <input type="email" placeholder="Enter your email" value={signupData.email}
                  onChange={e => setSignupData(p => ({ ...p, email:e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Password</label>
                <input type="password" placeholder="Minimum 6 characters" value={signupData.password}
                  onChange={e => setSignupData(p => ({ ...p, password:e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#0284C7] outline-none"/>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[["candidate","👤 Candidate"],["hr","👥 HR Recruiter"]].map(([role,label]) => (
                    <button key={role} onClick={() => setSignupData(p => ({ ...p, role }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        signupData.role===role
                          ? role==="hr" ? "border-[#0284C7] bg-[#F0F9FF] text-[#0284C7]"
                                        : "border-[#0D9488] bg-[#F0FDFA] text-[#0D9488]"
                          : "border-[#E2E8F0] text-[#64748B]"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSignUp} disabled={loading}
                className="w-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
                {loading ? "Creating account..." : "Create Account →"}
              </button>
              <div className="mt-4 text-center text-sm text-[#64748B]">
                Already have an account?{" "}
                <button onClick={() => { setShowSignUp(false); openSignIn(); }}
                  className="text-[#0284C7] font-semibold hover:underline">Sign In</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
