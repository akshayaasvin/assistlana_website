"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Users, UserCircle, X, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { HR_USERS_AUTH, CANDIDATE_USERS_AUTH } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
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
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 bg-[#0EA5C9] hover:bg-[#0284a8] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
    >
      📲 Install App
    </button>
  );
}

export default function HomePage() {
  const router = useRouter();

  // Modal states
  const [showSignIn,   setShowSignIn]   = useState(false);
  const [showSignUp,   setShowSignUp]   = useState(false);
  const [portalChoice, setPortalChoice] = useState(null); // "hr" | "candidate"
  const [showPass,     setShowPass]     = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [successMsg,   setSuccessMsg]   = useState("");

  // Form states
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");

  // Signup form
  const [signupData, setSignupData] = useState({ name:"", email:"", password:"", role:"candidate" });

  // Reset modal
  const resetModal = () => {
    setError(""); setEmail(""); setPassword("");
    setShowPass(false); setPortalChoice(null);
    setLoading(false);
  };

  // ── SIGN IN ──────────────────────────────────────
  const handleSignIn = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));

    if (portalChoice === "hr") {
      const user = HR_USERS_AUTH.find(
        u => u.email === email && u.password === password
      );

      if (user) {
        localStorage.setItem("hr_user", JSON.stringify(user));
        setShowSignIn(false);
        resetModal();
        router.push("/hr/upload");
      } else {
        setError("Invalid HR email or password.");
        setLoading(false);
      }
    } else {
      // Check Supabase database for real candidates
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        setError("No account found with this email. Please sign up first.");
        setLoading(false);
        return;
      }

      if (data.password !== password) {
        setError("Incorrect password. Please try again.");
        setLoading(false);
        return;
      }

      // Login successful
      localStorage.setItem(
        "candidate_user",
        JSON.stringify({
          name: data.name,
          email: data.email,
          id: data.id,
        })
      );

      setShowSignIn(false);
      resetModal();
      router.push("/candidate/dashboard");
    }
  };

  // ── SIGN UP ──────────────────────────────────────
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

        // Check if candidate already exists (uploaded by HR)
        const { data: existing } = await supabase
          .from("candidates")
          .select("*")
          .eq("email", signupData.email)
          .maybeSingle();

        if (existing) {
          // ── Candidate already exists (HR uploaded) → just add password ──
          const { data: updated, error: updateError } = await supabase
            .from("candidates")
            .update({ password: signupData.password, name: signupData.name })
            .eq("email", signupData.email)
            .select()
            .single();

          if (updateError) {
            setError("Update failed: " + updateError.message);
            setLoading(false); return;
          }

          localStorage.setItem("candidate_user", JSON.stringify({
            name: updated.name, email: updated.email, id: updated.id,
          }));
          setLoading(false);
          setShowSignUp(false);
          resetModal();
          router.push("/candidate/dashboard");

        } else {
          // ── New candidate → create fresh row ──
          const { data: created, error: createError } = await supabase
            .from("candidates")
            .insert([{
              name:     signupData.name,
              email:    signupData.email,
              password: signupData.password,
              status:   "Pending",
              ai_score: 0,
              jd_match: 0,
              skills:   [],
            }])
            .select()
            .single();

          if (createError) {
            setError("Signup failed: " + createError.message);
            setLoading(false); return;
          }

          localStorage.setItem("candidate_user", JSON.stringify({
            name: created.name, email: created.email, id: created.id,
          }));
          setLoading(false);
          setShowSignUp(false);
          resetModal();
          router.push("/candidate/dashboard");
        }

      } else {
        // HR signup
        setLoading(false);
        setShowSignUp(false);
        setSuccessMsg("HR account request sent! Admin will approve.");
        setTimeout(() => setSuccessMsg(""), 4000);
      }

    } catch (err) {
      setError("Something went wrong: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1D3A] flex flex-col overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 md:px-16 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0EA5C9] rounded-xl flex items-center justify-center">
            <Brain size={22} className="text-white"/>
          </div>
          <div>
            <div className="text-white font-bold text-xl tracking-tight">ASSISTLANA</div>
            <div className="text-[#0EA5C9] text-xs tracking-widest uppercase">HR Consultancy</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {successMsg && (
            <div className="flex items-center gap-2 bg-green-500/20 text-green-400 border border-green-500/30 px-4 py-2 rounded-xl text-sm">
              <CheckCircle size={14}/>{successMsg}
            </div>
          )}
          <InstallButton/>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#0EA5C9]/10 border border-[#0EA5C9]/20 text-[#0EA5C9] px-4 py-2 rounded-full text-sm font-semibold mb-8">
          <Brain size={14}/>
          AI-Powered Resume Screening Platform
        </div>

        {/* Big Headline */}
        <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
          ASSISTLANA
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-[#0EA5C9] mb-6">
          Smarter Hiring Starts Here
        </h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          An AI-powered SaaS recruitment platform that automatically parses resumes,
          scores candidates, matches job descriptions, and shortlists talent —
          cutting your hiring time by <span className="text-white font-semibold">90%</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4 mb-20">
          <button
            onClick={() => { resetModal(); setShowSignIn(true); }}
            className="flex items-center gap-2 bg-[#0EA5C9] hover:bg-[#0284a8] text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-[#0EA5C9]/20"
          >
            Sign In <ArrowRight size={18}/>
          </button>
          <button
            onClick={() => { resetModal(); setShowSignUp(true); }}
            className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-bold text-base transition-all"
          >
            Create Account
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl w-full mb-20">
          {[
            { val:"99.1%", label:"Parse Accuracy",      icon:"🎯" },
            { val:"10x",   label:"Faster Hiring",        icon:"⚡" },
            { val:"1,247", label:"Candidates Processed", icon:"👥" },
            { val:"50+",   label:"Companies Trust Us",   icon:"🏢" },
          ].map((s,i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold text-[#0EA5C9] mb-1">{s.val}</div>
              <div className="text-slate-400 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
          {[
            { icon:"📄", title:"AI Resume Parsing",    desc:"Automatically extract name, skills, experience and education from any PDF or DOCX resume in under 5 seconds.",      color:"#1253A4" },
            { icon:"🎯", title:"Smart JD Matching",    desc:"Semantic similarity matching using sentence-transformers to score how well each candidate fits your job description.", color:"#0EA5C9" },
            { icon:"⭐", title:"Auto Shortlisting",    desc:"Weighted AI scoring across skills, experience and education automatically ranks and shortlists your top candidates.",   color:"#10B981" },
            { icon:"📊", title:"Analytics Dashboard",  desc:"Real-time recruitment analytics — funnel metrics, skill demand trends and department-wise hiring insights.",           color:"#8B5CF6" },
            { icon:"🔒", title:"Secure & Role-Based",  desc:"Multi-tenant architecture with JWT auth, row-level security and full audit logging for compliance.",                    color:"#F59E0B" },
            { icon:"🤖", title:"Candidate AI Coach",   desc:"Candidates get personalized AI suggestions to improve their resume score and match specific job descriptions.",        color:"#EF4444" },
          ].map((f,i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-white/8 transition-all">
              <div className="text-3xl mb-4">{f.icon}</div>
              <div className="text-white font-bold mb-2">{f.title}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="text-center py-6 border-t border-white/10 text-slate-600 text-xs">
        ASSISTLANA HR Consultancy © 2026 · AI Resume Screening Platform v1.0
      </div>

      {/* ══ SIGN IN MODAL ══ */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Modal Header */}
            <div className="bg-[#0B1D3A] px-8 py-6 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Sign In</div>
                <div className="text-slate-400 text-sm">Access your portal</div>
              </div>
              <button onClick={() => { setShowSignIn(false); resetModal(); }}
                className="text-slate-400 hover:text-white transition-all">
                <X size={20}/>
              </button>
            </div>

            <div className="p-8">

              {/* Step 1: Choose Portal */}
              {!portalChoice && (
                <div>
                  <div className="text-sm font-semibold text-slate-600 mb-4 text-center">
                    Who are you signing in as?
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setPortalChoice("hr")}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#0EA5C9] hover:bg-[#F0F9FF] transition-all group"
                    >
                      <div className="w-12 h-12 bg-[#F0F9FF] group-hover:bg-[#BAE6FD] rounded-2xl flex items-center justify-center transition-all">
                        <Users size={24} className="text-[#0EA5C9]"/>
                      </div>
                      <div>
                        <div className="font-bold text-[#1E293B] text-sm">HR Team</div>
                        <div className="text-xs text-slate-400">Recruiter access</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setPortalChoice("candidate")}
                      className="flex flex-col items-center gap-3 p-6 border-2 border-[#E2E8F0] rounded-2xl hover:border-[#10B981] hover:bg-[#F0FDF4] transition-all group"
                    >
                      <div className="w-12 h-12 bg-[#F0FDF4] group-hover:bg-[#A7F3D0] rounded-2xl flex items-center justify-center transition-all">
                        <UserCircle size={24} className="text-[#10B981]"/>
                      </div>
                      <div>
                        <div className="font-bold text-[#1E293B] text-sm">Candidate</div>
                        <div className="text-xs text-slate-400">Job seeker access</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Login Form */}
              {portalChoice && (
                <div>
                  {/* Back + Portal label */}
                  <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => { setPortalChoice(null); setError(""); }}
                      className="text-xs text-slate-400 hover:text-slate-600 underline">
                      ← Change
                    </button>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                      portalChoice === "hr"
                        ? "bg-[#F0F9FF] text-[#0EA5C9] border border-[#BAE6FD]"
                        : "bg-[#F0FDF4] text-[#10B981] border border-[#A7F3D0]"
                    }`}>
                      {portalChoice === "hr" ? <Users size={12}/> : <UserCircle size={12}/>}
                      {portalChoice === "hr" ? "HR Portal" : "Candidate Portal"}
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                      <AlertCircle size={14}/>{error}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                      <input type="email" placeholder="Enter your email" value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all outline-none"/>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                      <input type={showPass ? "text" : "password"} placeholder="Enter your password"
                        value={password} onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSignIn()}
                        className="w-full pl-10 pr-12 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all outline-none"/>
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>

                  <button onClick={handleSignIn} disabled={loading}
                    className={`w-full text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60 ${
                      portalChoice === "hr" ? "bg-[#0EA5C9] hover:bg-[#0284a8]" : "bg-[#10B981] hover:bg-[#059669]"
                    }`}>
                    {loading ? "Signing in..." : `Sign In as ${portalChoice === "hr" ? "HR" : "Candidate"} →`}
                  </button>

                  {/* Demo credentials */}
                  <div className={`mt-4 p-4 rounded-xl border text-xs font-mono ${
                    portalChoice === "hr"
                      ? "bg-[#F0F9FF] border-[#BAE6FD]"
                      : "bg-[#F0FDF4] border-[#A7F3D0]"
                  }`}>
                    <div className="font-semibold text-slate-500 mb-1 font-sans">Demo credentials:</div>
                    {portalChoice === "hr" ? (
                      <div className="text-slate-600">
                        Email: <span className="text-[#0EA5C9] font-bold">kavitha@assistlana.com</span><br/>
                        Pass: <span className="text-[#0EA5C9] font-bold">HR@123</span>
                      </div>
                    ) : (
                      <div className="text-slate-600">
                        Email: <span className="text-[#10B981] font-bold">priya@email.com</span><br/>
                        Pass: <span className="text-[#10B981] font-bold">Pass@123</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <button onClick={() => { setShowSignIn(false); setShowSignUp(true); resetModal(); }}
                  className="text-[#0EA5C9] font-semibold hover:underline">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ SIGN UP MODAL ══ */}
      {showSignUp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-[#0B1D3A] px-8 py-6 flex items-center justify-between">
              <div>
                <div className="text-white font-bold text-lg">Create Account</div>
                <div className="text-slate-400 text-sm">Join ASSISTLANA platform</div>
              </div>
              <button onClick={() => { setShowSignUp(false); resetModal(); }}
                className="text-slate-400 hover:text-white transition-all">
                <X size={20}/>
              </button>
            </div>
            <div className="p-8">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle size={14}/>{error}
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                <input type="text" placeholder="e.g. Priya Rajan"
                  value={signupData.name}
                  onChange={e => setSignupData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all outline-none"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                <input type="email" placeholder="Enter your email"
                  value={signupData.email}
                  onChange={e => setSignupData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all outline-none"/>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-600 mb-2">Password</label>
                <input type="password" placeholder="Create a password"
                  value={signupData.password}
                  onChange={e => setSignupData(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all outline-none"/>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-600 mb-2">I am a...</label>
                <div className="grid grid-cols-2 gap-3">
                  {["candidate","hr"].map(role => (
                    <button key={role}
                      onClick={() => setSignupData(p => ({ ...p, role }))}
                      className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                        signupData.role === role
                          ? role === "hr"
                            ? "border-[#0EA5C9] bg-[#F0F9FF] text-[#0EA5C9]"
                            : "border-[#10B981] bg-[#F0FDF4] text-[#10B981]"
                          : "border-[#E2E8F0] text-slate-400"
                      }`}>
                      {role === "hr" ? "👥 HR Recruiter" : "👤 Candidate"}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleSignUp} disabled={loading}
                className="w-full bg-[#1253A4] hover:bg-[#0d47a1] text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60">
                {loading ? "Creating account..." : "Create Account →"}
              </button>
              <div className="mt-4 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <button onClick={() => { setShowSignUp(false); setShowSignIn(true); resetModal(); }}
                  className="text-[#0EA5C9] font-semibold hover:underline">Sign In</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}