"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SYSTEM_STATS } from "@/lib/mockData";
import {
  Activity, Users, Building2, Settings,
  LogOut, Shield, Bell, Lock,
  Save, Eye, EyeOff, Check, Brain
} from "lucide-react";

const NAV = [
  { label:"Dashboard",     icon: Activity,  href:"/admin/dashboard" },
  { label:"HR Users",      icon: Users,     href:"/admin/users"     },
  { label:"Organizations", icon: Building2, href:"/admin/orgs"      },
  { label:"Settings",      icon: Settings,  href:"/admin/settings"  },
];

const TABS = ["Profile", "Scoring Config", "Notifications", "Security"];

export default function AdminSettings() {
  const router = useRouter();
  const [admin,      setAdmin]      = useState(null);
  const [activeTab,  setActiveTab]  = useState("Profile");
  const [saved,      setSaved]      = useState("");
  const [showOld,    setShowOld]    = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [showConfirm,setShowConfirm]= useState(false);

  // Profile form
  const [profile, setProfile] = useState({
    name: "", email: "", phone: "", org: "ASSISTLANA",
  });

  // Password form
  const [passwords, setPasswords] = useState({
    oldPassword: "", newPassword: "", confirmPassword: "",
  });

  // Scoring weights
  const [weights, setWeights] = useState({
    skills: 40, experience: 30, education: 20, extras: 10,
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    newResume:      true,
    parseComplete:  true,
    shortlist:      true,
    weeklyReport:   false,
    systemAlerts:   true,
    loginAlerts:    true,
  });

  // Security
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: "30",
    loginAlerts: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (!stored) { router.push("/admin/login"); return; }
    const a = JSON.parse(stored);
    setAdmin(a);
    setProfile(prev => ({ ...prev, name: a.name, email: a.userId + "@assistlana.com" }));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  const handleSave = (section) => {
    setSaved(`✅ ${section} saved successfully!`);
    setTimeout(() => setSaved(""), 3000);
  };

  const totalWeight = Object.values(weights).reduce((a,b) => a+b, 0);

  if (!admin) return null;

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">

      {/* Sidebar */}
      <div className="w-56 bg-[#0B1D3A] min-h-screen flex flex-col fixed left-0 top-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0EA5C9] rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-white"/>
            </div>
            <div>
              <div className="text-white font-bold text-sm">ASSISTLANA</div>
              <div className="text-[#0EA5C9] text-xs">Admin Portal</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4">
          <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-3 px-2">Main Menu</div>
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/admin/settings";
            return (
              <button key={item.label} onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0EA5C9]/20 text-[#0EA5C9] border border-[#0EA5C9]/30"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}>
                <Icon size={16}/>{item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-[#1253A4] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {admin.name.split(" ").map(n=>n[0]).join("")}
            </div>
            <div>
              <div className="text-white text-xs font-semibold">{admin.name}</div>
              <div className="text-white/40 text-xs">{admin.role}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all">
            <LogOut size={14}/>Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 sticky top-0 z-10">
          <div className="text-lg font-bold text-[#1E293B]">Admin Settings</div>
          <div className="text-xs text-slate-400">Manage your profile, scoring config and security</div>
        </div>

        <div className="p-8">

          {/* Success message */}
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <Check size={16}/>{saved}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-[#E2E8F0] p-1.5 mb-6 w-fit">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-[#1253A4] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── PROFILE TAB ── */}
          {activeTab === "Profile" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-5">👤 Profile Information</div>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-[#F8FAFC] rounded-xl">
                  <div className="w-16 h-16 bg-[#1253A4] rounded-2xl flex items-center justify-center text-white text-xl font-bold">
                    {admin.name.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <div>
                    <div className="font-bold text-[#1E293B]">{admin.name}</div>
                    <div className="text-sm text-slate-400">{admin.role}</div>
                    <button className="text-xs text-[#1253A4] font-semibold hover:underline mt-1">
                      Change Avatar
                    </button>
                  </div>
                </div>

                {[
                  { label:"Full Name",    key:"name",  type:"text",  placeholder:"Your full name"     },
                  { label:"Email",        key:"email", type:"email", placeholder:"Your email address"  },
                  { label:"Phone",        key:"phone", type:"tel",   placeholder:"Your phone number"   },
                  { label:"Organization", key:"org",   type:"text",  placeholder:"Organization name"   },
                ].map(field => (
                  <div key={field.key} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">{field.label}</label>
                    <input type={field.type} value={profile[field.key]}
                      onChange={e => setProfile(p => ({ ...p, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC] focus:bg-white transition-all"/>
                  </div>
                ))}
                <button onClick={() => handleSave("Profile")}
                  className="w-full flex items-center justify-center gap-2 bg-[#1253A4] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                  <Save size={15}/> Save Profile
                </button>
              </div>

              {/* Role info */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="font-bold text-[#1E293B] mb-4">🛡️ Account Details</div>
                  {[
                    ["User ID",    admin.userId || "admin001"],
                    ["Role",       admin.role               ],
                    ["Access",     "Full System Access"     ],
                    ["Status",     "Active"                 ],
                    ["Member Since","January 2025"          ],
                  ].map(([l,v],i) => (
                    <div key={i} className="flex justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
                      <span className="text-sm text-slate-400">{l}</span>
                      <span className="text-sm font-semibold text-[#1E293B]">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#EFF6FF] rounded-2xl border border-[#BFDBFE] p-4">
                  <div className="flex items-center gap-2 text-[#1253A4] font-bold text-sm mb-1">
                    <Shield size={16}/> Admin Privileges
                  </div>
                  <div className="text-xs text-[#1E40AF] space-y-1">
                    {["Full platform access","Manage all HR users","Configure AI scoring","View all audit logs","Billing & subscription control"].map((p,i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check size={11}/>{p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SCORING CONFIG TAB ── */}
          {activeTab === "Scoring Config" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-2">⚙️ AI Scoring Weights</div>
                <div className="text-xs text-slate-400 mb-5">
                  Total must equal 100%. Current total:
                  <span className={`font-bold ml-1 ${totalWeight === 100 ? "text-green-600" : "text-red-500"}`}>
                    {totalWeight}%
                  </span>
                </div>

                {[
                  { key:"skills",     label:"Skills Match",   color:"#0EA5C9", icon:"🔧" },
                  { key:"experience", label:"Experience",      color:"#1253A4", icon:"💼" },
                  { key:"education",  label:"Education Level", color:"#8B5CF6", icon:"🎓" },
                  { key:"extras",     label:"Extras / Certs",  color:"#10B981", icon:"⭐" },
                ].map(item => (
                  <div key={item.key} className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-600">{item.icon} {item.label}</span>
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" max="100"
                          value={weights[item.key]}
                          onChange={e => setWeights(p => ({ ...p, [item.key]: parseInt(e.target.value)||0 }))}
                          className="w-16 px-2 py-1 border border-[#E2E8F0] rounded-lg text-sm text-center font-bold outline-none focus:border-[#0EA5C9]"
                          style={{ color: item.color }}/>
                        <span className="text-sm text-slate-400">%</span>
                      </div>
                    </div>
                    <input type="range" min="0" max="100"
                      value={weights[item.key]}
                      onChange={e => setWeights(p => ({ ...p, [item.key]: parseInt(e.target.value) }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: item.color }}/>
                    <div className="h-1.5 bg-[#E2E8F0] rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width:`${weights[item.key]}%`, background: item.color }}/>
                    </div>
                  </div>
                ))}

                {totalWeight !== 100 && (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-2 text-xs mb-4">
                    ⚠️ Weights must total 100%. Currently {totalWeight}%.
                  </div>
                )}

                <button onClick={() => totalWeight === 100 && handleSave("Scoring Config")}
                  disabled={totalWeight !== 100}
                  className="w-full flex items-center justify-center gap-2 bg-[#1253A4] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Save size={15}/> Save Scoring Weights
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="font-bold text-[#1E293B] mb-4">🎯 Threshold Settings</div>
                  {[
                    { label:"Auto-shortlist threshold", val:"85", unit:"score" },
                    { label:"JD match minimum",          val:"70", unit:"%" },
                    { label:"Batch parse limit",         val:"50", unit:"files" },
                    { label:"Parse timeout",             val:"30", unit:"seconds" },
                  ].map((item,i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0">
                      <span className="text-sm text-slate-600">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <input defaultValue={item.val}
                          className="w-16 px-2 py-1 border border-[#E2E8F0] rounded-lg text-sm text-center font-bold outline-none focus:border-[#0EA5C9]"/>
                        <span className="text-xs text-slate-400">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => handleSave("Thresholds")}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#0EA5C9] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0284a8] transition-all">
                    <Save size={14}/> Save Thresholds
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="font-bold text-[#1E293B] mb-4">📊 Score Preview</div>
                  <div className="space-y-2">
                    {[
                      { label:"Skills ("+weights.skills+"%)",     val: Math.round(92*weights.skills/100),     color:"#0EA5C9" },
                      { label:"Experience ("+weights.experience+"%)",val: Math.round(92*weights.experience/100), color:"#1253A4" },
                      { label:"Education ("+weights.education+"%)", val: Math.round(92*weights.education/100),  color:"#8B5CF6" },
                      { label:"Extras ("+weights.extras+"%)",     val: Math.round(92*weights.extras/100),     color:"#10B981" },
                    ].map((s,i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">{s.label}</span>
                          <span className="font-bold" style={{ color:s.color }}>{s.val}</span>
                        </div>
                        <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${(s.val/40)*100}%`, background:s.color }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === "Notifications" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-5">🔔 Notification Preferences</div>
                {[
                  { key:"newResume",     label:"New Resume Uploaded",     desc:"Alert when HR uploads resumes"        },
                  { key:"parseComplete", label:"Parse Completed",          desc:"Alert when AI parsing finishes"       },
                  { key:"shortlist",     label:"Candidate Shortlisted",    desc:"Alert when HR shortlists a candidate" },
                  { key:"weeklyReport",  label:"Weekly Report",            desc:"Receive weekly analytics summary"     },
                  { key:"systemAlerts",  label:"System Alerts",            desc:"Critical system notifications"        },
                  { key:"loginAlerts",   label:"Login Alerts",             desc:"Alert on new admin login"             },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-[#1E293B]">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <button onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        notifs[item.key] ? "bg-[#1253A4]" : "bg-[#E2E8F0]"
                      }`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        notifs[item.key] ? "left-5" : "left-0.5"
                      }`}/>
                    </button>
                  </div>
                ))}
                <button onClick={() => handleSave("Notifications")}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#1253A4] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                  <Save size={15}/> Save Preferences
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 h-fit">
                <div className="font-bold text-[#1E293B] mb-4">📧 Email Notification Settings</div>
                {[
                  { label:"Notification Email", val:"admin@assistlana.com" },
                  { label:"Digest Frequency",   val:"Daily"                },
                  { label:"Report Day",         val:"Monday"               },
                ].map((item,i) => (
                  <div key={i} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{item.label}</label>
                    <input defaultValue={item.val}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC]"/>
                  </div>
                ))}
                <button onClick={() => handleSave("Email Settings")}
                  className="w-full flex items-center justify-center gap-2 bg-[#0EA5C9] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0284a8] transition-all">
                  <Save size={14}/> Save Email Settings
                </button>
              </div>
            </div>
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === "Security" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-5">🔒 Change Password</div>
                {[
                  { label:"Current Password",  key:"oldPassword",     show:showOld,    setShow:setShowOld    },
                  { label:"New Password",      key:"newPassword",     show:showNew,    setShow:setShowNew    },
                  { label:"Confirm Password",  key:"confirmPassword", show:showConfirm,setShow:setShowConfirm },
                ].map(field => (
                  <div key={field.key} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">{field.label}</label>
                    <div className="relative">
                      <input type={field.show ? "text" : "password"}
                        value={passwords[field.key]}
                        onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC] pr-11"/>
                      <button type="button" onClick={() => field.setShow(!field.show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {field.show ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                ))}

                {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2 mb-4">
                    ⚠️ Passwords do not match
                  </div>
                )}

                <button onClick={() => handleSave("Password")}
                  disabled={!passwords.oldPassword || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword}
                  className="w-full flex items-center justify-center gap-2 bg-[#1253A4] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Lock size={15}/> Update Password
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="font-bold text-[#1E293B] mb-4">🛡️ Security Settings</div>
                  {[
                    { key:"twoFactor",    label:"Two-Factor Authentication", desc:"Extra layer of login security"  },
                    { key:"loginAlerts",  label:"Login Alerts",              desc:"Email on each new admin login"  },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0">
                      <div>
                        <div className="text-sm font-semibold text-[#1E293B]">{item.label}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>
                      <button onClick={() => setSecurity(p => ({ ...p, [item.key]: !p[item.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-all ${
                          security[item.key] ? "bg-[#1253A4]" : "bg-[#E2E8F0]"
                        }`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                          security[item.key] ? "left-5" : "left-0.5"
                        }`}/>
                      </button>
                    </div>
                  ))}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-2">Session Timeout</label>
                    <select value={security.sessionTimeout}
                      onChange={e => setSecurity(p => ({ ...p, sessionTimeout: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                  <button onClick={() => handleSave("Security")}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#1253A4] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                    <Save size={14}/> Save Security Settings
                  </button>
                </div>


              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}