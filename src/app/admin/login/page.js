"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_USERS } from "@/lib/mockData";
import { Eye, EyeOff, Shield, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [userId,   setUserId]   = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async () => {
    // Clear old error
    setError("");

    // Basic validation
    if (!userId || !password) {
      setError("Please enter both User ID and Password.");
      return;
    }

    setLoading(true);

    // Simulate API call delay
    await new Promise(r => setTimeout(r, 1000));

    // Check credentials against mock data
    const admin = ADMIN_USERS.find(
      a => a.userId === userId && a.password === password
    );

    if (admin) {
      // Save to localStorage (we'll replace with real auth later)
      localStorage.setItem("admin_user", JSON.stringify(admin));
      router.push("/admin/dashboard");
    } else {
      setError("Invalid User ID or Password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT PANEL — Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0B1D3A] flex-col justify-between p-12">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-[#0EA5C9] rounded-xl flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <div className="text-white font-bold text-xl">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs tracking-widest uppercase">HR Consultancy</div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            AI-Powered<br/>Recruitment<br/>Platform
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Manage your entire recruitment ecosystem from one powerful admin panel.
          </p>
        </div>

        {/* Stats at bottom */}
        <div className="grid grid-cols-3 gap-6">
          {[
            { val: "1,247", label: "Candidates" },
            { val: "99.1%", label: "Parse Accuracy" },
            { val: "10x",   label: "Faster Hiring" },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-[#0EA5C9]">{s.val}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F0F4FA]">
        <div className="w-full max-w-md">

          {/* Admin Shield Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-[#1253A4] rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="text-white" size={32}/>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#1E293B] text-center mb-1">
            Admin Login
          </h2>
          <p className="text-slate-500 text-sm text-center mb-8">
            Enter your Admin credentials to access the control panel
          </p>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-8">

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
                <AlertCircle size={16}/>
                {error}
              </div>
            )}

            {/* User ID Field */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Admin User ID
              </label>
              <input
                type="text"
                placeholder="e.g. admin001"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#1E293B] bg-[#F8FAFC] focus:border-[#0EA5C9] focus:bg-white transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#1253A4] hover:bg-[#0d47a1] text-white font-semibold py-3 rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Login to Admin Panel →"}
            </button>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-[#F0F4FA] rounded-xl border border-[#E2E8F0]">
              <div className="text-xs font-semibold text-slate-500 mb-2">Demo Credentials:</div>
              <div className="text-xs text-slate-600 font-mono">
                User ID: <span className="text-[#1253A4] font-bold">admin001</span><br/>
                Password: <span className="text-[#1253A4] font-bold">Admin@123</span>
              </div>
            </div>

          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            ASSISTLANA HR Consultancy · Admin Portal v1.0
          </p>
        </div>
      </div>
    </div>
  );
}