"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

const ADMIN_UID = "dd0b11eb-76c6-4afd-94b4-0d0845c85b5c";

export default function AdminLogin() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please enter email and password."); return; }

    setLoading(true);

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    });

    if (authErr || !data.user) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    if (data.user.id !== ADMIN_UID) {
      await supabase.auth.signOut();
      setError("You are not authorized to access the admin panel.");
      setLoading(false);
      return;
    }

    localStorage.setItem("adminAuth", JSON.stringify({
      id:        data.user.id,
      email:     data.user.email,
      role:      "admin",
      loginTime: Date.now(),
    }));

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT — Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0B1D3A] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-[#0EA5C9] rounded-xl flex items-center justify-center text-white font-bold text-lg">A</div>
            <div>
              <div className="text-white font-bold text-xl">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs tracking-widest uppercase">Admin Control Panel</div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Manage<br/>Everything<br/>From Here.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Approve HR accounts, manage candidates, monitor jobs and control platform data.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[{ val:"7 Tabs", label:"Full Control" },{ val:"Live", label:"DB Sync" },{ val:"Secure", label:"UID Guard" }].map((s,i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-xl font-bold text-[#0EA5C9]">{s.val}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F0F4FA]">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-[#1253A4] rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={32}/>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] text-center mb-1">Admin Login</h2>
          <p className="text-slate-500 text-sm text-center mb-8">Restricted access — authorised personnel only</p>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
                <AlertCircle size={15}/>{error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Email Address</label>
              <input type="email" placeholder="admin@assistlana.com" value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white outline-none transition-all"/>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white outline-none transition-all pr-12"/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

            <button onClick={handleLogin} disabled={loading}
              className="w-full bg-[#1253A4] hover:bg-[#0d47a1] text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-60 transition-all">
              {loading ? "Verifying..." : "Login to Admin Panel →"}
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-6">ASSISTLANA · Admin Portal</p>
        </div>
      </div>
    </div>
  );
}
