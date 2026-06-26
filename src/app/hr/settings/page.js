"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HRSidebar from "@/components/hr/HRSidebar";
import { Save, Eye, EyeOff, Check, Lock, Bell, User, FileText } from "lucide-react";

const TABS = ["Profile", "Preferences", "Notifications", "Security"];

export default function HRSettings() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [saved,     setSaved]     = useState("");
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);

  const [profile, setProfile] = useState({
    name:"", email:"", phone:"", department:"HR", location:"Chennai",
  });

  const [passwords, setPasswords] = useState({
    oldPassword:"", newPassword:"", confirmPassword:"",
  });

  const [prefs, setPrefs] = useState({
    autoShortlist: true, showScores: true,
    defaultSort: "score", resultsPerPage: "20",
  });

  const [notifs, setNotifs] = useState({
    parseComplete: true, newApplication: true,
    shortlistAlert: true, weeklyReport: false, emailDigest: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("hr_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    setProfile(p => ({ ...p, name: u.name, email: u.email }));
  }, []);

  const handleSave = (section) => {
    setSaved(`✅ ${section} saved successfully!`);
    setTimeout(() => setSaved(""), 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <HRSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1 w-full min-w-0">

        {/* Topbar */}
        <div className="bg-white border-b border-[#E2E8F0] px-4 md:px-8 py-3 md:py-4 sticky top-0 z-10">
          <div className="pl-12 md:pl-0">
            <div className="text-base md:text-lg font-bold text-[#1E293B]">HR Settings</div>
            <div className="text-xs text-slate-400">Manage your profile, preferences and security</div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <Check size={16}/>{saved}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-2xl border border-[#E2E8F0] p-1.5 mb-6 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "bg-[#0EA5C9] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* PROFILE */}
          {activeTab === "Profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">
                  <User size={16} className="inline mr-2 text-[#0EA5C9]"/>Profile Information
                </div>
                <div className="flex items-center gap-4 mb-5 p-4 bg-[#F0F9FF] rounded-xl">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[#0EA5C9] rounded-2xl flex items-center justify-center text-white text-base md:text-lg font-bold flex-shrink-0">
                    {user.name?.split(" ").map(n=>n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#1E293B] truncate">{user.name}</div>
                    <div className="text-sm text-[#0EA5C9]">{user.role}</div>
                  </div>
                </div>
                {[
                  { label:"Full Name",   key:"name",       type:"text"  },
                  { label:"Email",       key:"email",      type:"email" },
                  { label:"Phone",       key:"phone",      type:"tel"   },
                  { label:"Department",  key:"department", type:"text"  },
                  { label:"Location",    key:"location",   type:"text"  },
                ].map(f => (
                  <div key={f.key} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{f.label}</label>
                    <input type={f.type} value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC] focus:bg-white transition-all"/>
                  </div>
                ))}
                <button onClick={() => handleSave("Profile")}
                  className="w-full flex items-center justify-center gap-2 bg-[#0EA5C9] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0284a8] transition-all">
                  <Save size={15}/> Save Profile
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6 h-fit">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">
                  <FileText size={16} className="inline mr-2 text-[#0EA5C9]"/>Resume Parse Preferences
                </div>
                {[
                  { label:"Default Resume Format", options:["PDF","DOCX","Both"] },
                  { label:"Auto-assign to Job",    options:["Enabled","Disabled"] },
                  { label:"Parse Language",        options:["English","Tamil","Hindi","All"] },
                ].map((item,i) => (
                  <div key={i} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{item.label}</label>
                    <select className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                      {item.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <button onClick={() => handleSave("Parse Preferences")}
                  className="w-full flex items-center justify-center gap-2 bg-[#1253A4] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0d47a1] transition-all">
                  <Save size={14}/> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {activeTab === "Preferences" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">⚙️ Dashboard Preferences</div>
                {[
                  { key:"autoShortlist", label:"Auto-Shortlist Top Candidates", desc:"Automatically shortlist candidates scoring 85+" },
                  { key:"showScores",    label:"Show AI Scores in Table",        desc:"Display score column in candidates table"       },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0 gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#1E293B]">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <button onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        prefs[item.key] ? "bg-[#0EA5C9]" : "bg-[#E2E8F0]"
                      }`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        prefs[item.key] ? "left-5" : "left-0.5"
                      }`}/>
                    </button>
                  </div>
                ))}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Default Sort</label>
                    <select value={prefs.defaultSort}
                      onChange={e => setPrefs(p => ({ ...p, defaultSort: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                      <option value="score">AI Score</option>
                      <option value="jd_match">JD Match</option>
                      <option value="name">Name</option>
                      <option value="date">Upload Date</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">Results Per Page</label>
                    <select value={prefs.resultsPerPage}
                      onChange={e => setPrefs(p => ({ ...p, resultsPerPage: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none bg-[#F8FAFC]">
                      <option>10</option><option>20</option><option>50</option><option>100</option>
                    </select>
                  </div>
                </div>
                <button onClick={() => handleSave("Preferences")}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#0EA5C9] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0284a8] transition-all">
                  <Save size={15}/> Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === "Notifications" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">
                  <Bell size={16} className="inline mr-2 text-[#0EA5C9]"/>Notification Preferences
                </div>
                {[
                  { key:"parseComplete",  label:"Resume Parse Complete", desc:"Notify when AI finishes parsing"    },
                  { key:"newApplication", label:"New Application",       desc:"Notify when candidate applies"      },
                  { key:"shortlistAlert", label:"Shortlist Updated",     desc:"Notify when shortlist changes"      },
                  { key:"weeklyReport",   label:"Weekly Hiring Report",  desc:"Summary every Monday morning"       },
                  { key:"emailDigest",    label:"Email Digest",          desc:"Daily email with platform activity" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0 gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#1E293B]">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <button onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        notifs[item.key] ? "bg-[#0EA5C9]" : "bg-[#E2E8F0]"
                      }`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        notifs[item.key] ? "left-5" : "left-0.5"
                      }`}/>
                    </button>
                  </div>
                ))}
                <button onClick={() => handleSave("Notifications")}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#0EA5C9] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0284a8] transition-all">
                  <Save size={15}/> Save Notifications
                </button>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "Security" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-6">
                <div className="font-bold text-[#1E293B] mb-4 text-sm md:text-base">
                  <Lock size={16} className="inline mr-2 text-[#0EA5C9]"/>Change Password
                </div>
                {[
                  { label:"Current Password", key:"oldPassword",     show:showOld, setShow:setShowOld },
                  { label:"New Password",     key:"newPassword",     show:showNew, setShow:setShowNew },
                  { label:"Confirm Password", key:"confirmPassword", show:showNew, setShow:setShowNew },
                ].map(field => (
                  <div key={field.key} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{field.label}</label>
                    <div className="relative">
                      <input type={field.show ? "text" : "password"}
                        value={passwords[field.key]}
                        onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#0EA5C9] bg-[#F8FAFC] pr-11"/>
                      <button type="button" onClick={() => field.setShow(!field.show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {field.show ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleSave("Password")}
                  className="w-full flex items-center justify-center gap-2 bg-[#0EA5C9] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#0284a8] transition-all">
                  <Lock size={15}/> Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}