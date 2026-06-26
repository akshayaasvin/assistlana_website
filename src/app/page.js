"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, UserCircle, X, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  Star, Zap, Shield, BarChart3, Brain, FileText, Target,
  Clock, TrendingUp, ArrowRight, CheckCheck, Cpu, Globe, Upload,
} from "lucide-react";
import { HR_USERS_AUTH } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/shared/PublicHeader";

/* ─── PWA Install ───────────────────────────────────── */
function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed,      setInstalled]      = useState(false);
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
      className="flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
      📲 Install App
    </button>
  );
}

/* ─── Animated counter ──────────────────────────────── */
function Counter({ end, suffix = "", label }) {
  const [count,   setCount]   = useState(0);
  const ref       = useRef(null);
  const started   = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const target    = parseInt(end.replace(/\D/g, ""), 10);
          const duration  = 1800;
          const step      = target / (duration / 16);
          let   current   = 0;
          const timer     = setInterval(() => {
            current += step;
            if (current >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(current));
          }, 16);
        }
      },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-[#64748B] mt-2 font-medium">{label}</div>
    </div>
  );
}

/* ─── Testimonials data ─────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Kavitha Nair", role: "HR Director, TechServe India", rating: 5,
    text: "AssistLana AI cut our resume screening time by 80%. The AI matching is incredibly accurate and the ATS score gives us instant confidence.",
    avatar: "KN", color: "from-blue-500 to-cyan-400",
  },
  {
    name: "Rajesh Subramanian", role: "Talent Acquisition, CyberMatics", rating: 5,
    text: "We processed 2,000+ resumes in one day with zero manual effort. The JD matching feature alone saved us weeks of recruiter time.",
    avatar: "RS", color: "from-purple-500 to-pink-400",
  },
  {
    name: "Divya Krishnan", role: "Campus Recruiter, CloudEdge Systems", rating: 5,
    text: "The platform feels like it was built specifically for enterprise hiring. Clean, fast, and the AI suggestions are spot on.",
    avatar: "DK", color: "from-emerald-500 to-teal-400",
  },
];

/* ─── Pricing data ──────────────────────────────────── */
const PRICING = [
  {
    plan: "Starter", price: "Free", period: "",
    desc: "Perfect for small teams getting started with AI hiring.",
    features: ["50 resumes/month", "AI ATS Scoring", "Basic Job Matching", "Email Support"],
    cta: "Get Started Free", highlight: false,
  },
  {
    plan: "Professional", price: "₹2,999", period: "/month",
    desc: "For growing teams that need powerful AI hiring tools.",
    features: ["Unlimited Resumes", "Advanced AI Matching", "JD Optimization", "Analytics Dashboard", "Priority Support", "Excel Export"],
    cta: "Start Free Trial", highlight: true,
  },
  {
    plan: "Enterprise", price: "Custom", period: "",
    desc: "For large organizations with enterprise-grade requirements.",
    features: ["Everything in Pro", "Custom AI Models", "API Access", "Dedicated Manager", "SLA Guarantee", "White-label Option"],
    cta: "Contact Sales", highlight: false,
  },
];

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();

  /* auth state */
  const [showSignIn,    setShowSignIn]    = useState(false);
  const [showSignUp,    setShowSignUp]    = useState(false);
  const [portalChoice,  setPortalChoice]  = useState(null); // "hr" | "candidate"
  const [showPass,      setShowPass]      = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [successMsg,    setSuccessMsg]    = useState("");
  const [email,         setEmail]         = useState("");
  const [password,      setPassword]      = useState("");
  const [signupData,    setSignupData]    = useState({ name:"", email:"", password:"", role:"candidate" });

  /* UI state */
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  /* auto-rotate testimonials */
  useEffect(() => {
    const timer = setInterval(() =>
      setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(timer);
  }, []);

  /* auth helpers */
  const resetModal = () => {
    setError(""); setEmail(""); setPassword("");
    setShowPass(false); setPortalChoice(null); setLoading(false);
  };
  const openSignIn = () => { resetModal(); setShowSignIn(true); };
  const openSignUp = () => { resetModal(); setShowSignUp(true); };

  /* ── SIGN IN ── */
  const handleSignIn = async () => {
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    if (portalChoice === "hr") {
      const user = HR_USERS_AUTH.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem("hr_user", JSON.stringify(user));
        setShowSignIn(false); resetModal();
        router.push("/hr/upload");
      } else {
        setError("Invalid HR email or password."); setLoading(false);
      }
    } else {
      const { data, error: dbError } = await supabase
        .from("candidates").select("*").eq("email", email).single();
      if (dbError || !data) { setError("No account found. Please sign up first."); setLoading(false); return; }
      if (data.password !== password) { setError("Incorrect password."); setLoading(false); return; }
      localStorage.setItem("candidate_user", JSON.stringify({ name:data.name, email:data.email, id:data.id }));
      setShowSignIn(false); resetModal();
      router.push("/candidate/dashboard");
    }
  };

  /* ── SIGN UP ── */
  const handleSignUp = async () => {
    setError("");
    if (!signupData.name || !signupData.email || !signupData.password) { setError("Please fill all fields."); return; }
    if (signupData.password.length < 6) { setError("Password must be at least 6 characters."); return; }
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
        setSuccessMsg("HR account request sent! Admin will review and approve.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err) {
      setError("Something went wrong: " + err.message); setLoading(false);
    }
  };

  /* ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader onSignIn={openSignIn} onGetStarted={openSignUp}/>

      {/* Toast / PWA */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-2 items-end">
        <InstallButton/>
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-sm shadow-md">
            <CheckCircle size={16}/>{successMsg}
          </div>
        )}
      </div>

      {/* ══ HERO ══════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28 px-4 md:px-8">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl"/>
          <div className="absolute -top-20 right-0 w-80 h-80 bg-cyan-100/50 rounded-full blur-3xl"/>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-50/70 rounded-full blur-2xl"/>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold mb-6">
                <Zap size={12} strokeWidth={3}/> #1 AI Recruitment Platform
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-[1.1] mb-5">
                AI-Powered Hiring.{" "}
                <span className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
                  Smarter Recruitment.
                </span>{" "}
                Faster Growth.
              </h1>
              <p className="text-[#64748B] text-lg leading-relaxed mb-8 max-w-xl">
                Screen resumes, optimize CVs, match candidates with jobs, and hire the best talent using advanced AI — all in one platform.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={openSignUp}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-200">
                  Try AI Free <ArrowRight size={16}/>
                </button>
                <button onClick={openSignIn}
                  className="inline-flex items-center gap-2 bg-white border-2 border-[#E2E8F0] text-[#0F172A] px-7 py-3.5 rounded-xl font-bold text-sm hover:border-[#2563EB] hover:text-[#2563EB] transition-all">
                  Book Demo
                </button>
              </div>
              {/* Social proof */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex -space-x-2">
                  {["KN","RS","DK","AM"].map((init, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${
                      ["bg-blue-500","bg-purple-500","bg-emerald-500","bg-orange-500"][i]
                    }`}>{init}</div>
                  ))}
                </div>
                <div className="text-sm text-[#64748B]">
                  <span className="font-bold text-[#0F172A]">1,000+</span> companies trust AssistLana AI
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-yellow-400 fill-yellow-400"/>)}
                  <span className="font-bold text-[#0F172A] ml-1">4.9</span>
                  <span className="text-[#64748B]">/5</span>
                </div>
              </div>
            </div>

            {/* Right — animated AI dashboard */}
            <div className="relative hidden lg:block">
              {/* Main dashboard card */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-cyan-50/40"/>
                <div className="relative">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-3 h-3 rounded-full bg-red-400"/>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"/>
                    <div className="w-3 h-3 rounded-full bg-green-400"/>
                    <span className="ml-3 text-xs font-mono text-[#94A3B8]">AI Hiring Dashboard</span>
                  </div>
                  {/* Candidate rows */}
                  {[
                    { name:"Priya Rajan",        score:94, match:91, color:"blue" },
                    { name:"Arjun Mehta",         score:88, match:85, color:"cyan" },
                    { name:"Sneha Krishnamurthy", score:91, match:89, color:"emerald" },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 mb-3 p-3 bg-white/80 rounded-2xl border border-gray-100">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        c.color === "blue" ? "bg-gradient-to-br from-blue-500 to-blue-600"
                        : c.color === "cyan" ? "bg-gradient-to-br from-cyan-500 to-cyan-600"
                        : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                      }`}>
                        {c.name.split(" ").map(w => w[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] truncate">{c.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              c.color === "blue" ? "bg-gradient-to-r from-blue-500 to-blue-400"
                              : c.color === "cyan" ? "bg-gradient-to-r from-cyan-500 to-cyan-400"
                              : "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            }`} style={{ width: `${c.score}%` }}/>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs font-bold text-[#0F172A]">{c.score}%</div>
                        <div className="text-[10px] text-[#94A3B8]">ATS</div>
                      </div>
                    </div>
                  ))}
                  {/* Bottom summary */}
                  <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl flex items-center justify-between">
                    <div className="text-xs font-semibold text-[#2563EB]">✅ 3 Candidates Analyzed</div>
                    <div className="text-xs text-[#64748B]">AI powered · 2s</div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-5 -right-5 glass rounded-2xl shadow-xl p-4 float-a">
                <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">Resume Score</div>
                <div className="text-2xl font-extrabold text-[#2563EB]">94%</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">↑ Excellent</div>
              </div>
              <div className="absolute -bottom-5 -left-5 glass rounded-2xl shadow-xl p-4 float-b">
                <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">AI Match</div>
                <div className="text-2xl font-extrabold text-[#06B6D4]">87%</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">↑ Strong fit</div>
              </div>
              <div className="absolute top-1/2 -right-8 -translate-y-1/2 glass rounded-2xl shadow-xl p-4 float-c">
                <div className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wide">ATS Passed</div>
                <div className="text-2xl font-extrabold text-emerald-500">✓</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">ATS Ready</div>
              </div>
              <div className="absolute -top-2 left-4 glass rounded-2xl shadow-lg px-4 py-2.5 float-d">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center">
                    <Brain size={12} className="text-white"/>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold text-[#94A3B8]">Skills Analysis</div>
                    <div className="text-xs font-bold text-[#0F172A]">12 skills matched</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ AI PRODUCTS ═══════════════════════════════ */}
      <section id="products" className="bg-[#F8FAFC] py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Cpu size={12}/> AI Products
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              Everything You Need to Hire Smarter
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Four AI-powered tools designed to transform every stage of your recruitment pipeline.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Brain size={24} className="text-white"/>,
                gradient: "from-[#2563EB] to-[#3B82F6]",
                title: "AI Resume Screening",
                desc: "Upload bulk resumes and get instant ATS scores, skill tags, and ranked candidates in seconds.",
                href: "/hr/upload",
              },
              {
                icon: <FileText size={24} className="text-white"/>,
                gradient: "from-[#06B6D4] to-[#0891B2]",
                title: "AI Resume Optimizer",
                desc: "Get AI-powered suggestions to improve your resume score and pass ATS filters with ease.",
                href: "/candidate/resume",
              },
              {
                icon: <Target size={24} className="text-white"/>,
                gradient: "from-[#8B5CF6] to-[#7C3AED]",
                title: "AI Job Match",
                desc: "Semantic matching engine pairs candidates with the most relevant job descriptions automatically.",
                href: "/hr/matches",
              },
              {
                icon: <CheckCheck size={24} className="text-white"/>,
                gradient: "from-[#10B981] to-[#059669]",
                title: "ATS Resume Checker",
                desc: "Instantly verify if your resume is ATS-compatible and receive actionable improvement tips.",
                href: "/candidate/resume",
              },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className={`w-14 h-14 bg-gradient-to-br ${p.gradient} rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}>
                  {p.icon}
                </div>
                <h3 className="font-bold text-[#0F172A] text-base mb-2">{p.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed mb-4">{p.desc}</p>
                <Link href={p.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:gap-2.5 transition-all">
                  Learn More <ArrowRight size={14}/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE ════════════════════════════════ */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <CheckCheck size={12}/> Why AssistLana AI
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              Built for Enterprise-Grade Hiring
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Industry-leading AI technology combined with a seamless user experience trusted by top HR teams.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon:<Brain size={20} className="text-[#2563EB]"/>,    bg:"bg-blue-50",    title:"AI Powered Screening",     desc:"NLP-based resume parsing with 99.1% accuracy. No templates needed — works with any format." },
              { icon:<CheckCheck size={20} className="text-emerald-600"/>, bg:"bg-emerald-50", title:"ATS Compatible",        desc:"All output is optimized for Applicant Tracking Systems used by Fortune 500 companies." },
              { icon:<Target size={20} className="text-purple-600"/>,   bg:"bg-purple-50",  title:"Skill Matching",           desc:"Semantic skill extraction maps candidate capabilities to job requirements with 95% precision." },
              { icon:<Zap size={20} className="text-yellow-600"/>,      bg:"bg-yellow-50",  title:"Instant Resume Analysis",  desc:"Get complete analysis in under 3 seconds — resume score, gaps, strengths, and suggestions." },
              { icon:<Shield size={20} className="text-slate-600"/>,    bg:"bg-slate-50",   title:"Secure Data",              desc:"SOC 2-ready infrastructure. All data is encrypted at rest and in transit. GDPR compliant." },
              { icon:<Globe size={20} className="text-cyan-600"/>,      bg:"bg-cyan-50",    title:"Enterprise Ready",         desc:"Scales from 10 to 100,000+ resumes. Multi-org support, role-based access, and audit logs." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl border border-[#E2E8F0] hover:border-[#2563EB]/30 hover:shadow-md transition-all group">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] mb-1.5">{f.title}</h3>
                  <p className="text-[#64748B] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════ */}
      <section className="bg-[#F8FAFC] py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Clock size={12}/> How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              Hire the Best in 4 Simple Steps
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">From upload to hire — our AI handles the heavy lifting so your team can focus on what matters.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] opacity-20"/>
            {[
              { step:"01", icon:<Upload size={22} className="text-white"/>,    title:"Upload Resume",       desc:"Drag and drop resumes or upload in bulk — PDF, Word, or any format.", color:"from-[#2563EB] to-[#3B82F6]" },
              { step:"02", icon:<Brain size={22} className="text-white"/>,     title:"AI Analysis",         desc:"Our AI extracts skills, scores ATS compatibility, and matches job descriptions.", color:"from-[#8B5CF6] to-[#7C3AED]" },
              { step:"03", icon:<Users size={22} className="text-white"/>,     title:"Candidate Matching",  desc:"Top candidates are ranked and shortlisted with detailed AI insights.", color:"from-[#06B6D4] to-[#0891B2]" },
              { step:"04", icon:<TrendingUp size={22} className="text-white"/>,title:"Hire Faster",         desc:"Interview the best fits confidently and reduce your time-to-hire by 80%.", color:"from-[#10B981] to-[#059669]" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className={`relative w-20 h-20 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {s.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-gray-100 text-[10px] font-black text-[#2563EB] flex items-center justify-center shadow">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-bold text-[#0F172A] mb-2">{s.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STATISTICS ════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3">
              Trusted by Thousands of Companies
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Numbers that reflect the impact of AI-powered recruitment.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter end="1000"  suffix="+" label="Companies"/>
            <Counter end="50000" suffix="+" label="Resumes Processed"/>
            <Counter end="95"    suffix="%" label="Matching Accuracy"/>
            <Counter end="24"    suffix="/7" label="AI Support"/>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════ */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Star size={12} className="fill-yellow-500 text-yellow-500"/> Customer Stories
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              What Our Customers Say
            </h2>
          </div>

          <div className="relative">
            {/* Testimonial card */}
            <div className="bg-[#F8FAFC] rounded-3xl p-8 md:p-12 border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} className="text-yellow-400 fill-yellow-400"/>)}
              </div>
              <p className="text-[#0F172A] text-lg md:text-xl font-medium leading-relaxed mb-8">
                &ldquo;{TESTIMONIALS[testimonialIdx].text}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TESTIMONIALS[testimonialIdx].color} flex items-center justify-center text-white font-bold`}>
                  {TESTIMONIALS[testimonialIdx].avatar}
                </div>
                <div>
                  <div className="font-bold text-[#0F172A]">{TESTIMONIALS[testimonialIdx].name}</div>
                  <div className="text-sm text-[#64748B]">{TESTIMONIALS[testimonialIdx].role}</div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => setTestimonialIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center hover:border-[#2563EB] hover:text-[#2563EB] transition-all shadow-sm">
                <ChevronLeft size={16}/>
              </button>
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === testimonialIdx ? "bg-[#2563EB] w-6" : "bg-[#E2E8F0]"}`}/>
              ))}
              <button onClick={() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center hover:border-[#2563EB] hover:text-[#2563EB] transition-all shadow-sm">
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ═══════════════════════════════════ */}
      <section id="pricing" className="bg-[#F8FAFC] py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <BarChart3 size={12}/> Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Start free. Scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRICING.map((p, i) => (
              <div key={i} className={`relative rounded-3xl p-8 flex flex-col ${
                p.highlight
                  ? "bg-gradient-to-br from-[#2563EB] to-[#06B6D4] text-white shadow-2xl shadow-blue-200 scale-105"
                  : "bg-white border border-[#E2E8F0] shadow-sm"
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <div className={`text-sm font-bold mb-1 ${p.highlight ? "text-blue-100" : "text-[#64748B]"}`}>{p.plan}</div>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-4xl font-extrabold ${p.highlight ? "text-white" : "text-[#0F172A]"}`}>{p.price}</span>
                    <span className={`text-sm pb-1 ${p.highlight ? "text-blue-100" : "text-[#64748B]"}`}>{p.period}</span>
                  </div>
                  <p className={`text-sm ${p.highlight ? "text-blue-100" : "text-[#64748B]"}`}>{p.desc}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        p.highlight ? "bg-white/20" : "bg-blue-50"
                      }`}>
                        <CheckCircle size={12} className={p.highlight ? "text-white" : "text-[#2563EB]"}/>
                      </div>
                      <span className={p.highlight ? "text-blue-50" : "text-[#64748B]"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={openSignUp}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    p.highlight
                      ? "bg-white text-[#2563EB] hover:bg-blue-50"
                      : "bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white hover:opacity-90 shadow-md shadow-blue-100"
                  }`}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ RESOURCES ═════════════════════════════════ */}
      <section id="resources" className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <FileText size={12}/> Resources
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              Latest Resources
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">Expert guides, templates, and insights to supercharge your HR strategy.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { tag:"Blog",             icon:"📝", title:"AI Trends in HR 2025",                desc:"How AI is reshaping recruitment, from screening to onboarding.",    color:"blue" },
              { tag:"HR Insights",      icon:"💡", title:"Reducing Time-to-Hire by 80%",        desc:"Data-backed strategies from 500+ companies using AI screening.",    color:"purple" },
              { tag:"Resume Templates", icon:"📄", title:"ATS-Optimized Resume Templates",      desc:"Free templates designed to pass automated screening systems.",       color:"cyan" },
              { tag:"Interview Tips",   icon:"🎤", title:"AI Interview Preparation Guide",      desc:"Expert tips to help candidates perform their best in AI-assessed interviews.", color:"emerald" },
            ].map((r, i) => (
              <div key={i} className="bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] p-6 hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
                <div className="text-3xl mb-4">{r.icon}</div>
                <div className={`text-xs font-bold mb-2 px-2.5 py-1 rounded-full inline-block ${
                  r.color === "blue"    ? "bg-blue-50 text-blue-600"
                  : r.color === "purple" ? "bg-purple-50 text-purple-600"
                  : r.color === "cyan"   ? "bg-cyan-50 text-cyan-600"
                  : "bg-emerald-50 text-emerald-600"
                }`}>{r.tag}</div>
                <h3 className="font-bold text-[#0F172A] mb-2 mt-2 group-hover:text-[#2563EB] transition-colors">{r.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0891B2] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full"/>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full"/>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ready to Transform Your<br className="hidden md:block"/> Hiring Process?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Join 1,000+ companies using AssistLana AI to hire smarter, faster, and with greater confidence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={openSignUp}
              className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-xl">
              Try AI Free <ArrowRight size={16}/>
            </button>
            <Link href="/#contact"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════ */}
      <footer id="contact" className="bg-[#0F172A] py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center">
                  <Zap size={15} className="text-white" strokeWidth={2.5}/>
                </div>
                <span className="text-lg font-extrabold text-white">AssistLana AI</span>
              </div>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">AI-Powered HR Technology Platform for modern recruitment teams.</p>
              <p className="text-slate-500 text-xs">Pondicherry, Tamil Nadu, India</p>
              <p className="text-slate-500 text-xs mt-1">contact@assistlana.com</p>
              <p className="text-slate-500 text-xs mt-1">+91 8553451935</p>
            </div>

            {/* Products */}
            <div>
              <div className="font-bold text-white mb-4 text-sm">Products</div>
              <div className="space-y-2.5">
                {["AI Resume Screening","AI Resume Optimizer","AI Job Match","ATS Resume Checker"].map(l => (
                  <Link key={l} href="#" className="block text-slate-400 text-sm hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
            </div>

            {/* Company */}
            <div>
              <div className="font-bold text-white mb-4 text-sm">Company</div>
              <div className="space-y-2.5">
                {[["Home","/"],["Jobs","/jobs"],["Internships","/apply"],["Pricing","/#pricing"],["Contact","/#contact"]].map(([l,h]) => (
                  <Link key={l} href={h} className="block text-slate-400 text-sm hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <div className="font-bold text-white mb-4 text-sm">Resources</div>
              <div className="space-y-2.5">
                {["Blog","HR Insights","Resume Templates","Interview Tips"].map(l => (
                  <Link key={l} href="/#resources" className="block text-slate-400 text-sm hover:text-white transition-colors">{l}</Link>
                ))}
              </div>
              <div className="mt-5">
                <div className="font-bold text-white mb-3 text-sm">Sign In</div>
                <button onClick={openSignIn}
                  className="text-slate-400 text-sm hover:text-white transition-colors text-left">
                  HR / Candidate Portal →
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">© 2025 AssistLana AI. All rights reserved.</p>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
              <Zap size={12} className="text-[#06B6D4]"/>
              <span className="text-xs text-slate-400 font-semibold">Powered by Advanced AI</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══ SIGN IN MODAL ══════════════════════════════ */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] px-8 py-5 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Sign In</div>
                <div className="text-white/70 text-sm">Access your portal</div>
              </div>
              <button onClick={() => { setShowSignIn(false); resetModal(); }} className="text-white/70 hover:text-white">
                <X size={20}/>
              </button>
            </div>
            <div className="p-7">
              {/* Step 1: choose portal */}
              {!portalChoice && (
                <div>
                  <div className="text-sm font-semibold text-[#64748B] mb-4 text-center">Who are you signing in as?</div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setPortalChoice("hr")}
                      className="flex flex-col items-center gap-2 p-5 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#2563EB] hover:bg-blue-50 transition-all">
                      <Users size={26} className="text-[#2563EB]"/>
                      <div className="font-bold text-[#0F172A] text-sm">HR Team</div>
                      <div className="text-[11px] text-[#64748B]">Recruiter Portal</div>
                    </button>
                    <button onClick={() => setPortalChoice("candidate")}
                      className="flex flex-col items-center gap-2 p-5 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#06B6D4] hover:bg-cyan-50 transition-all">
                      <UserCircle size={26} className="text-[#06B6D4]"/>
                      <div className="font-bold text-[#0F172A] text-sm">Candidate</div>
                      <div className="text-[11px] text-[#64748B]">Job Seeker Portal</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: login form */}
              {portalChoice && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => { setPortalChoice(null); setError(""); }}
                      className="text-xs text-[#64748B] hover:text-[#0F172A] underline">← Back</button>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      portalChoice === "hr" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#ECFEFF] text-[#0891B2]"
                    }`}>
                      {portalChoice === "hr" ? "HR Portal" : "Candidate Portal"}
                    </span>
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                      <AlertCircle size={14}/>{error}
                    </div>
                  )}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
                      <input type="email" placeholder="Enter your email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#2563EB] outline-none transition-colors"/>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
                      <input type={showPass ? "text" : "password"} placeholder="Enter your password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSignIn()}
                        className="w-full pl-9 pr-10 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#2563EB] outline-none transition-colors"/>
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleSignIn} disabled={loading}
                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
                    {loading ? "Signing in..." : "Sign In →"}
                  </button>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-[#64748B]">
                Don't have an account?{" "}
                <button onClick={() => { setShowSignIn(false); openSignUp(); }}
                  className="text-[#2563EB] font-semibold hover:underline">Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SIGN UP MODAL ══════════════════════════════ */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] px-8 py-5 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Create Account</div>
                <div className="text-white/70 text-sm">Join AssistLana AI platform</div>
              </div>
              <button onClick={() => { setShowSignUp(false); resetModal(); }} className="text-white/70 hover:text-white">
                <X size={20}/>
              </button>
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
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Email Address</label>
                <input type="email" placeholder="Enter your email" value={signupData.email}
                  onChange={e => setSignupData(p => ({ ...p, email:e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Password</label>
                <input type="password" placeholder="Minimum 6 characters" value={signupData.password}
                  onChange={e => setSignupData(p => ({ ...p, password:e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[["candidate","👤 Candidate"],["hr","👥 HR Recruiter"]].map(([role,label]) => (
                    <button key={role} onClick={() => setSignupData(p => ({ ...p, role }))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        signupData.role === role
                          ? role === "hr"
                            ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                            : "border-[#06B6D4] bg-cyan-50 text-[#0891B2]"
                          : "border-[#E2E8F0] text-[#64748B]"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSignUp} disabled={loading}
                className="w-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
                {loading ? "Creating account..." : "Create Account →"}
              </button>
              <div className="mt-4 text-center text-sm text-[#64748B]">
                Already have an account?{" "}
                <button onClick={() => { setShowSignUp(false); openSignIn(); }}
                  className="text-[#2563EB] font-semibold hover:underline">Sign In</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

