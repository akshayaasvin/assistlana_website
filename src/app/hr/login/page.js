"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { Eye, EyeOff } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function HRLoginPage() {
  const router = useRouter();
  const [hrId,     setHrId]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!hrId.trim() || !password.trim()) { setError("Please enter your HR ID and password."); return; }

    setLoading(true);
    const { data, error: dbErr } = await supabase
      .from("hr_registry")
      .select("*")
      .eq("hr_login_id", hrId.trim().toUpperCase())
      .single();

    if (dbErr || !data) {
      setError("HR ID not found. Check your credentials.");
      setLoading(false);
      return;
    }

    // bcrypt comparison — handles both hashed and (legacy) plain-text passwords
    let passwordMatch = false;
    if (data.password) {
      if (data.password.startsWith("$2")) {
        // bcrypt hash
        passwordMatch = await bcrypt.compare(password, data.password);
      } else {
        // legacy plain text (pre-migration rows)
        passwordMatch = data.password === password;
      }
    }

    if (!passwordMatch) {
      setError("Incorrect password.");
      setLoading(false);
      return;
    }

    if (data.status === "pending")  { setError("Your account is pending admin approval."); setLoading(false); return; }
    if (data.status === "rejected") { setError("Your account was not approved. Contact support."); setLoading(false); return; }
    if (data.status !== "approved") { setError("Account not active. Contact support."); setLoading(false); return; }

    localStorage.setItem("hr_user", JSON.stringify({
      id:          data.id,
      name:        data.name,
      email:       data.email,
      company:     data.company,
      hr_login_id: data.hr_login_id,
      status:      data.status,
      loginTime:   Date.now(),
    }));
    router.push("/hr/upload");
  };

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#1253A4] rounded-xl flex items-center justify-center text-white font-bold text-lg">A</div>
          <div>
            <div className="font-bold text-[#1E293B] text-lg">ASSISTLANA</div>
            <div className="text-xs text-[#0EA5C9] tracking-widest uppercase">HR Portal</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1E293B] mb-1">HR Login</h1>
        <p className="text-sm text-slate-400 mb-7">Sign in with your ASSISTLANA HR credentials</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">HR ID</label>
            <input
              type="text"
              value={hrId}
              onChange={e => setHrId(e.target.value)}
              placeholder="ASLHR1234"
              className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#1253A4] transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-2.5 pr-11 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#1253A4] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1253A4] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#0d47a1] disabled:opacity-60 transition-all mt-2">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have credentials? Contact your ASSISTLANA admin.
        </p>
        <p className="text-center text-xs text-slate-400 mt-2">
          <a href="/" className="text-[#1253A4] hover:underline">← Back to Home</a>
        </p>
      </div>
    </div>
  );
}
