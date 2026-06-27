"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, UserCircle, X, Mail, Lock, Eye, EyeOff,
  AlertCircle, CheckCircle, ChevronLeft, ChevronRight,
  Zap, Shield, Globe, ArrowRight, Star,
  Brain, Cpu, Workflow, MessageSquare, BarChart3,
  Cloud, GitBranch, Layers, Rocket, CheckCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

/* ─── PWA Install ───────────────────────────────────── */
function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed,      setInstalled]      = useState(false);
  useEffect(() => {
    const handler = e => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  if (installed || !deferredPrompt) return null;
  return (
    <button onClick={async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    }} className="flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-4 py-2 rounded-xl text-sm font-semibold shadow">
      📲 Install App
    </button>
  );
}

/* ─── Animated counter ──────────────────────────────── */
function Counter({ end, suffix = "", label }) {
  const [count,  setCount]  = useState(0);
  const ref      = useRef(null);
  const started  = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const target = parseInt(end.replace(/\D/g, ""), 10);
        let cur = 0;
        const step = target / (1800 / 16);
        const timer = setInterval(() => {
          cur += step;
          if (cur >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(cur));
        }, 16);
      }
    }, { threshold: 0.4 });
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

/* ─── Testimonials ──────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: "Kavitha Nair", role: "CTO, TechServe India", rating: 5,
    text: "AssistLana's AI workflow automation cut our manual processing time by 78%. The agent builder is incredibly intuitive — we deployed our first autonomous agent in hours, not weeks.",
    avatar: "KN", gradient: "from-blue-500 to-cyan-400",
  },
  {
    name: "Rajesh Subramanian", role: "Head of Engineering, CyberMatics", rating: 5,
    text: "The AI analytics dashboard gave us insights we never had before. Real-time business intelligence with zero infrastructure overhead. This is enterprise-grade software.",
    avatar: "RS", gradient: "from-purple-500 to-pink-400",
  },
  {
    name: "Divya Krishnan", role: "VP Operations, CloudEdge Systems", rating: 5,
    text: "We automated 60% of our document processing workflows using AssistLana AI. The ROI was visible within the first month. Genuinely transformative technology.",
    avatar: "DK", gradient: "from-emerald-500 to-teal-400",
  },
];

/* ─── Tech stack ticker ─────────────────────────────── */
const TECH_STACK = [
  "OpenAI", "Google AI", "React", "Next.js", "Firebase",
  "Supabase", "TypeScript", "Node.js", "Python", "TensorFlow",
  "LangChain", "Vercel",
];

/* ════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
export default function HomePage() {
  const router = useRouter();

  /* auth state */
  const [showSignIn,   setShowSignIn]   = useState(false);
  const [showSignUp,   setShowSignUp]   = useState(false);
  const [portalChoice, setPortalChoice] = useState(null);
  const [showPass,     setShowPass]     = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [signupData,   setSignupData]   = useState({ name:"", email:"", password:"", role:"candidate" });

  /* UI state */
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() =>
      setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  /* auth helpers */
  const resetModal = () => {
    setError(""); setEmail(""); setPassword("");
    setShowPass(false); setPortalChoice(null); setLoading(false);
  };
  const openSignIn = () => { resetModal(); setShowSignIn(true); };
  const openSignUp = () => { resetModal(); setShowSignUp(true); };

  const handleSignIn = async () => {
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (portalChoice === "hr") {
      // hr_registry has no password column — authentication is by email existence
      // Status check (pending/approved/rejected) happens in the HR portal itself
      const { data: hrUser, error: hrErr } = await supabase
        .from("hr_registry")
        .select("id, name, email, company, status")
        .eq("email", email.trim().toLowerCase())
        .single();
      if (hrErr || !hrUser) {
        setError("No HR account found with this email. Contact admin@assistlana.com to register.");
        setLoading(false);
        return;
      }
      localStorage.setItem("hr_user", JSON.stringify({
        name: hrUser.name, email: hrUser.email,
        company: hrUser.company, role: "HR Manager", status: hrUser.status,
      }));
      setShowSignIn(false); resetModal(); router.push("/hr/upload");
    } else {
      const { data, error: dbErr } = await supabase.from("candidates").select("*").eq("email", email).single();
      if (dbErr || !data) { setError("No account found. Please sign up first."); setLoading(false); return; }
      if (data.password !== password) { setError("Incorrect password."); setLoading(false); return; }
      localStorage.setItem("candidate_user", JSON.stringify({ name:data.name, email:data.email, id:data.id }));
      setShowSignIn(false); resetModal(); router.push("/candidate/dashboard");
    }
  };

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
          const { data: updated, error: upErr } = await supabase.from("candidates")
            .update({ password: signupData.password, name: signupData.name })
            .eq("email", signupData.email).select().single();
          if (upErr) { setError("Update failed: " + upErr.message); setLoading(false); return; }
          localStorage.setItem("candidate_user", JSON.stringify({ name:updated.name, email:updated.email, id:updated.id }));
        } else {
          const { data: created, error: createErr } = await supabase.from("candidates")
            .insert([{ name:signupData.name, email:signupData.email, password:signupData.password, status:"Pending", ai_score:0, jd_match:0, skills:[] }])
            .select().single();
          if (createErr) { setError("Signup failed: " + createErr.message); setLoading(false); return; }
          localStorage.setItem("candidate_user", JSON.stringify({ name:created.name, email:created.email, id:created.id }));
        }
        setLoading(false); setShowSignUp(false); resetModal(); router.push("/candidate/dashboard");
      } else {
        // HR signup: insert into hr_registry with pending status
        const { error: hrErr } = await supabase.from("hr_registry").insert([{
          name:    signupData.name.trim(),
          email:   signupData.email.trim().toLowerCase(),
          company: "ASSISTLANA",
          status:  "pending",
        }]);
        setLoading(false); setShowSignUp(false);
        if (hrErr && hrErr.code !== "23505") {
          setSuccessMsg("Request sent! Admin will review your account.");
        } else {
          setSuccessMsg("HR account request sent! Admin will review and approve within 24 hours.");
        }
        setTimeout(() => setSuccessMsg(""), 6000);
      }
    } catch (err) { setError("Something went wrong: " + err.message); setLoading(false); }
  };

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

      {/* ══ HERO ════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0A0F1E] min-h-[92vh] flex items-center py-20 px-4 md:px-8">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "40px 40px" }}/>
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none"/>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none"/>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#60A5FA] px-4 py-1.5 rounded-full text-xs font-bold mb-7 backdrop-blur-sm">
                <Zap size={11} strokeWidth={3}/> Next-Generation AI Software Company
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] mb-6">
                Building Intelligent<br/>
                <span className="bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent">
                  AI Products
                </span>{" "}
                for<br/>
                Modern Businesses
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl">
                Developing AI-powered software, automation platforms, intelligent agents, and enterprise SaaS solutions that transform the way organizations work.
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                <button onClick={openSignUp}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-blue-900/40">
                  Try AI Free <ArrowRight size={16}/>
                </button>
                <Link href="/products"
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:bg-white/10 transition-all backdrop-blur-sm">
                  Explore Products
                </Link>
              </div>
              {/* Social proof */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex -space-x-2">
                  {["KN","RS","DK","AM","VP"].map((init, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#0A0F1E] flex items-center justify-center text-[10px] font-bold text-white ${
                      ["bg-blue-500","bg-purple-500","bg-emerald-500","bg-orange-500","bg-pink-500"][i]
                    }`}>{init}</div>
                  ))}
                </div>
                <span className="text-slate-400 text-sm"><span className="text-white font-bold">500+</span> businesses powered by AI</span>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s=><Star key={s} size={12} className="text-yellow-400 fill-yellow-400"/>)}
                  <span className="text-white font-bold text-sm ml-1">4.9</span>
                  <span className="text-slate-400 text-sm">/5</span>
                </div>
              </div>
            </div>

            {/* Right — AI terminal/dashboard visual */}
            <div className="hidden lg:block relative">
              <div className="relative bg-[#0D1117] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Terminal header */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-white/3">
                  <div className="w-3 h-3 rounded-full bg-red-500/70"/><div className="w-3 h-3 rounded-full bg-yellow-500/70"/><div className="w-3 h-3 rounded-full bg-green-500/70"/>
                  <span className="ml-3 text-xs font-mono text-slate-500">assistlana-ai-engine v2.1</span>
                </div>
                {/* Terminal body */}
                <div className="px-5 py-5 font-mono text-xs space-y-2">
                  <div className="text-slate-500">$ <span className="text-[#60A5FA]">initialize</span> <span className="text-[#34D399]">--mode=enterprise</span></div>
                  <div className="text-slate-400">✓ AI Engine initialized · 3ms</div>
                  <div className="text-slate-500 mt-2">$ <span className="text-[#60A5FA]">deploy</span> <span className="text-[#34D399]">workflow-automation</span></div>
                  <div className="text-slate-400">↳ Analyzing 2,847 process nodes...</div>
                  <div className="text-slate-400">↳ Optimizing with GPT-4o + custom model</div>
                  <div className="text-emerald-400">✓ Automation deployed · 94.3% efficiency gain</div>
                  <div className="text-slate-500 mt-2">$ <span className="text-[#60A5FA]">agent.run</span> <span className="text-[#34D399]">--task="process_documents"</span></div>
                  <div className="text-slate-400">↳ Processing 1,247 documents...</div>
                  <div className="text-[#22D3EE]">↳ AI extraction: 99.1% accuracy</div>
                  <div className="text-slate-400">↳ Routing to relevant departments...</div>
                  <div className="text-emerald-400">✓ All tasks complete · 2.4s total</div>
                  <div className="text-slate-500 mt-2">$ <span className="text-slate-400">█</span></div>
                </div>
                {/* Metric strip */}
                <div className="border-t border-white/5 px-5 py-3.5 grid grid-cols-3 gap-4">
                  {[
                    { label:"Accuracy",  val:"99.1%",  color:"text-emerald-400" },
                    { label:"Speed",     val:"2.4s",    color:"text-[#60A5FA]"  },
                    { label:"Uptime",    val:"99.9%",   color:"text-[#22D3EE]"  },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <div className={`text-lg font-extrabold ${m.color}`}>{m.val}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating cards */}
              <div className="absolute -top-5 -right-5 glass rounded-2xl shadow-xl p-4 float-a border border-white/20 bg-white/90">
                <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide">AI Agents Active</div>
                <div className="text-2xl font-extrabold text-[#2563EB]">47</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">↑ 12 new today</div>
              </div>
              <div className="absolute -bottom-5 -left-5 glass rounded-2xl shadow-xl p-4 float-b border border-white/20 bg-white/90">
                <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wide">Time Saved</div>
                <div className="text-2xl font-extrabold text-[#06B6D4]">840h</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">this month</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ TRUSTED TECH TICKER ═══════════════════════ */}
      <section className="bg-[#F8FAFC] border-y border-[#E2E8F0] py-6 overflow-hidden">
        <div className="text-center text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-5">
          Powered by world-class AI & cloud technologies
        </div>
        <div className="relative flex">
          <div className="flex items-center gap-12 animate-[ticker_20s_linear_infinite] whitespace-nowrap">
            {[...TECH_STACK, ...TECH_STACK].map((t, i) => (
              <span key={i} className="text-sm font-bold text-[#64748B] hover:text-[#2563EB] transition-colors cursor-default px-2">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT SNIPPET ═════════════════════════════ */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold mb-5">
                <Cpu size={11}/> About AssistLana
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-5 leading-tight">
                An AI Software Company<br/>
                <span className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
                  Built for the Future
                </span>
              </h2>
              <p className="text-[#64748B] leading-relaxed mb-6">
                AssistLana is an AI software company dedicated to building intelligent digital products that automate business operations through artificial intelligence, machine learning, cloud technology, and enterprise software. We help organizations innovate, improve productivity, and accelerate digital transformation.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {["Company Vision","AI Technology","Enterprise Software","Digital Transformation","Product Development","Cloud Solutions"].map(tag => (
                  <div key={tag} className="flex items-center gap-2 text-sm text-[#64748B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0"/>
                    {tag}
                  </div>
                ))}
              </div>
              <Link href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] hover:gap-3 transition-all">
                Learn more about us <ArrowRight size={14}/>
              </Link>
            </div>
            {/* Stats panel */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { val:"500+",   label:"Businesses Automated", color:"blue"    },
                { val:"99.1%",  label:"AI Accuracy Rate",     color:"cyan"    },
                { val:"840h",   label:"Hours Saved Monthly",  color:"emerald" },
                { val:"24/7",   label:"AI Agent Uptime",      color:"purple"  },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-6 border ${
                  s.color === "blue"    ? "bg-blue-50 border-blue-100"     :
                  s.color === "cyan"    ? "bg-cyan-50 border-cyan-100"     :
                  s.color === "emerald" ? "bg-emerald-50 border-emerald-100":
                                         "bg-purple-50 border-purple-100"
                }`}>
                  <div className={`text-3xl font-extrabold mb-1 ${
                    s.color === "blue"    ? "text-[#2563EB]" :
                    s.color === "cyan"    ? "text-[#0891B2]" :
                    s.color === "emerald" ? "text-emerald-600":
                                           "text-purple-600"
                  }`}>{s.val}</div>
                  <div className="text-sm text-[#64748B] font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRODUCT SHOWCASE GRID ══════════════════════ */}
      <section className="bg-[#F8FAFC] py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Layers size={11}/> Product Suite
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              Intelligent Software for Every Business Function
            </h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">
              From autonomous AI agents to enterprise workflow automation — our product suite covers every layer of modern business operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon:<Brain size={22} className="text-white"/>,       gradient:"from-[#2563EB] to-[#3B82F6]", title:"AI Agent Builder",         desc:"Design, deploy, and monitor autonomous AI agents that work 24/7 without human intervention.",       href:"/products#ai-agent-builder" },
              { icon:<Workflow size={22} className="text-white"/>,    gradient:"from-[#8B5CF6] to-[#7C3AED]", title:"Workflow Automation",       desc:"Map and automate complex business processes with drag-and-drop AI orchestration tools.",           href:"/products#ai-workflow" },
              { icon:<MessageSquare size={22} className="text-white"/>,gradient:"from-[#06B6D4] to-[#0891B2]",title:"AI Chat Assistant",         desc:"Build intelligent conversational interfaces trained on your business knowledge and data.",          href:"/products#ai-chat" },
              { icon:<BarChart3 size={22} className="text-white"/>,   gradient:"from-[#10B981] to-[#059669]", title:"AI Analytics Dashboard",    desc:"Real-time business intelligence with AI-powered pattern detection and predictive insights.",          href:"/products#ai-analytics" },
              { icon:<Brain size={22} className="text-white"/>,       gradient:"from-[#F59E0B] to-[#D97706]", title:"AI Resume Screening",       desc:"Intelligent resume parsing, ATS scoring, and candidate ranking for smarter HR decisions.",          href:"/products#ai-resume-screening" },
              { icon:<CheckCheck size={22} className="text-white"/>,  gradient:"from-[#EC4899] to-[#BE185D]", title:"AI Document Intelligence",  desc:"Extract, classify, and process unstructured documents automatically with AI precision.",            href:"/products#ai-document" },
              { icon:<Globe size={22} className="text-white"/>,       gradient:"from-[#6366F1] to-[#4F46E5]", title:"AI Knowledge Base",         desc:"Self-organizing knowledge repositories that learn from your team's collective intelligence.",         href:"/products#ai-knowledge" },
              { icon:<GitBranch size={22} className="text-white"/>,   gradient:"from-[#14B8A6] to-[#0F766E]", title:"Smart Business Automation",  desc:"End-to-end business process automation connecting all your tools, teams, and data sources.",       href:"/products#smart-automation" },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className={`w-12 h-12 bg-gradient-to-br ${p.gradient} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  {p.icon}
                </div>
                <h3 className="font-bold text-[#0F172A] text-sm mb-2">{p.title}</h3>
                <p className="text-[#64748B] text-xs leading-relaxed mb-4">{p.desc}</p>
                <Link href={p.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:gap-2 transition-all">
                  Learn More <ArrowRight size={11}/>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/products"
              className="inline-flex items-center gap-2 border-2 border-[#2563EB] text-[#2563EB] px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-[#2563EB] hover:text-white transition-all">
              View Full Product Catalog <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ WHY CHOOSE — 9 CARDS ══════════════════════ */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <CheckCheck size={11}/> Why AssistLana
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              Why Forward-Thinking Businesses Choose Us
            </h2>
            <p className="text-[#64748B] max-w-2xl mx-auto">
              9 core strengths that make AssistLana the trusted AI software partner for enterprise digital transformation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon:<Zap size={18} className="text-[#2563EB]"/>,      bg:"bg-blue-50",    title:"AI Powered",             desc:"State-of-the-art LLMs and custom-trained models powering every product feature with exceptional accuracy." },
              { icon:<Globe size={18} className="text-purple-600"/>,    bg:"bg-purple-50",  title:"Enterprise Ready",       desc:"Built for scale — from 10 to 100,000+ daily users, with multi-org support, SSO, and role-based access." },
              { icon:<Shield size={18} className="text-slate-600"/>,    bg:"bg-slate-50",   title:"Secure Platform",        desc:"SOC 2 Type II ready, AES-256 encryption at rest and in transit, GDPR and ISO 27001 compliant." },
              { icon:<Cloud size={18} className="text-cyan-600"/>,      bg:"bg-cyan-50",    title:"Cloud Native",           desc:"Architected for cloud-first deployment on AWS, GCP, and Azure with auto-scaling and 99.9% SLA uptime." },
              { icon:<Workflow size={18} className="text-orange-600"/>, bg:"bg-orange-50",  title:"Workflow Automation",    desc:"No-code/low-code automation builders that empower business teams to deploy workflows without engineering." },
              { icon:<GitBranch size={18} className="text-indigo-600"/>,bg:"bg-indigo-50",  title:"API Integration",        desc:"500+ pre-built integrations with popular business tools — Salesforce, HubSpot, Slack, Jira, and more." },
              { icon:<Layers size={18} className="text-teal-600"/>,     bg:"bg-teal-50",    title:"Scalable Architecture",  desc:"Microservices-based design ensures your AI stack grows with your business without performance degradation." },
              { icon:<Rocket size={18} className="text-pink-600"/>,     bg:"bg-pink-50",    title:"Fast Deployment",        desc:"Go from setup to production in hours. Pre-configured templates, guided onboarding, and live AI support." },
              { icon:<CheckCheck size={18} className="text-emerald-600"/>,bg:"bg-emerald-50",title:"Modern User Experience", desc:"Premium UI/UX design across every interface — intuitive, accessible, and delightful for all user types." },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 p-6 rounded-2xl border border-[#E2E8F0] hover:border-[#2563EB]/30 hover:shadow-md transition-all group">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-[#0F172A] mb-1.5 text-sm">{f.title}</h3>
                  <p className="text-[#64748B] text-xs leading-relaxed">{f.desc}</p>
                </div>
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
              Driving Real Business Results
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">Measured impact across every organization we partner with.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter end="500"   suffix="+"  label="Businesses Automated"/>
            <Counter end="99"    suffix="%"  label="AI Accuracy Rate"/>
            <Counter end="840"   suffix="h"  label="Hours Saved / Month"/>
            <Counter end="24"    suffix="/7" label="AI Support"/>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══════════════════════════════ */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Star size={11} className="fill-yellow-500 text-yellow-500"/> Customer Success
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">What Our Customers Say</h2>
          </div>
          <div className="relative">
            <div className="bg-[#F8FAFC] rounded-3xl p-8 md:p-12 border border-[#E2E8F0]">
              <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(s=><Star key={s} size={16} className="text-yellow-400 fill-yellow-400"/>)}
              </div>
              <p className="text-[#0F172A] text-lg md:text-xl font-medium leading-relaxed mb-8">
                &ldquo;{TESTIMONIALS[testimonialIdx].text}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${TESTIMONIALS[testimonialIdx].gradient} flex items-center justify-center text-white font-bold`}>
                  {TESTIMONIALS[testimonialIdx].avatar}
                </div>
                <div>
                  <div className="font-bold text-[#0F172A]">{TESTIMONIALS[testimonialIdx].name}</div>
                  <div className="text-sm text-[#64748B]">{TESTIMONIALS[testimonialIdx].role}</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={() => setTestimonialIdx(i => (i-1+TESTIMONIALS.length)%TESTIMONIALS.length)}
                className="w-10 h-10 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center hover:border-[#2563EB] hover:text-[#2563EB] transition-all shadow-sm">
                <ChevronLeft size={16}/>
              </button>
              {TESTIMONIALS.map((_,i) => (
                <button key={i} onClick={() => setTestimonialIdx(i)}
                  className={`h-2.5 rounded-full transition-all ${i===testimonialIdx ? "bg-[#2563EB] w-6" : "bg-[#E2E8F0] w-2.5"}`}/>
              ))}
              <button onClick={() => setTestimonialIdx(i => (i+1)%TESTIMONIALS.length)}
                className="w-10 h-10 rounded-xl border border-[#E2E8F0] bg-white flex items-center justify-center hover:border-[#2563EB] hover:text-[#2563EB] transition-all shadow-sm">
                <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#0891B2] py-24 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/5 rounded-full"/>
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full"/>
          <div className="absolute inset-0" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize:"30px 30px" }}/>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ready to Build with AI?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Start using intelligent software that helps your business automate processes, improve efficiency, and scale with confidence.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={openSignUp}
              className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-xl">
              Start Free <ArrowRight size={16}/>
            </button>
            <Link href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              Book Demo
            </Link>
          </div>
        </div>
      </section>

      <GlobalFooter/>

      {/* ══ SIGN IN MODAL ══════════════════════════════ */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] px-8 py-5 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Sign In</div>
                <div className="text-white/70 text-sm">Access your portal</div>
              </div>
              <button onClick={() => { setShowSignIn(false); resetModal(); }} className="text-white/70 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-7">
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
              {portalChoice && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <button onClick={() => { setPortalChoice(null); setError(""); }} className="text-xs text-[#64748B] hover:text-[#0F172A] underline">← Back</button>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${portalChoice==="hr" ? "bg-[#DBEAFE] text-[#1D4ED8]" : "bg-[#ECFEFF] text-[#0891B2]"}`}>
                      {portalChoice==="hr" ? "HR Portal" : "Candidate Portal"}
                    </span>
                  </div>
                  {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm"><AlertCircle size={14}/>{error}</div>}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
                      <input type="email" placeholder="Enter your email" value={email} onChange={e=>setEmail(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#2563EB] outline-none transition-colors"/>
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]"/>
                      <input type={showPass?"text":"password"} placeholder="Enter your password" value={password}
                        onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignIn()}
                        className="w-full pl-9 pr-10 py-2.5 border border-[#E2E8F0] rounded-xl text-sm bg-white focus:border-[#2563EB] outline-none transition-colors"/>
                      <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
                        {showPass?<EyeOff size={16}/>:<Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleSignIn} disabled={loading}
                    className="w-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
                    {loading?"Signing in...":"Sign In →"}
                  </button>
                </div>
              )}
              <div className="mt-4 text-center text-sm text-[#64748B]">
                Don't have an account?{" "}
                <button onClick={()=>{setShowSignIn(false);openSignUp();}} className="text-[#2563EB] font-semibold hover:underline">Sign Up</button>
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
              <button onClick={()=>{setShowSignUp(false);resetModal();}} className="text-white/70 hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-7">
              {error && <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm"><AlertCircle size={14}/>{error}</div>}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Full Name</label>
                <input type="text" placeholder="e.g. Priya Rajan" value={signupData.name}
                  onChange={e=>setSignupData(p=>({...p,name:e.target.value}))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Email Address</label>
                <input type="email" placeholder="Enter your email" value={signupData.email}
                  onChange={e=>setSignupData(p=>({...p,email:e.target.value}))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Password</label>
                <input type="password" placeholder="Minimum 6 characters" value={signupData.password}
                  onChange={e=>setSignupData(p=>({...p,password:e.target.value}))}
                  className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#64748B] mb-1.5">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {[["candidate","👤 Candidate"],["hr","👥 HR Recruiter"]].map(([role,label])=>(
                    <button key={role} onClick={()=>setSignupData(p=>({...p,role}))}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        signupData.role===role
                          ? role==="hr" ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-[#06B6D4] bg-cyan-50 text-[#0891B2]"
                          : "border-[#E2E8F0] text-[#64748B]"
                      }`}>{label}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleSignUp} disabled={loading}
                className="w-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all">
                {loading?"Creating account...":"Create Account →"}
              </button>
              <div className="mt-4 text-center text-sm text-[#64748B]">
                Already have an account?{" "}
                <button onClick={()=>{setShowSignUp(false);openSignIn();}} className="text-[#2563EB] font-semibold hover:underline">Sign In</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
