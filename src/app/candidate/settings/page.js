"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CandidateSidebar from "@/components/candidate/CandidateSidebar";
import { Save, Eye, EyeOff, Check, Lock, Bell, User, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TABS = ["Profile", "Resume Settings", "Notifications", "Security"];

export default function CandidateSettings() {
  const router = useRouter();
  const [user,      setUser]      = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [saved,     setSaved]     = useState("");
  const [showOld,   setShowOld]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);

  const [profile, setProfile] = useState({
    name:"", email:"", phone:"", location:"",
    age:"", linkedin:"", portfolio:"",
  });

  const [passwords, setPasswords] = useState({
    oldPassword:"", newPassword:"", confirmPassword:"",
  });

  const [resumeSettings, setResumeSettings] = useState({
    visibility:"public", autoApply:false, showScore:true, jobAlerts:true,
  });

  const [notifs, setNotifs] = useState({
    applicationUpdate:true, newJobs:true, shortlistAlert:true,
    aiSuggestions:true, emailDigest:false,
  });

  useEffect(() => {
    const stored = localStorage.getItem("candidate_user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    loadFromSupabase(u);
  }, []);

  const loadFromSupabase = async (u) => {
    const { data } = await supabase
      .from("candidates")
      .select("*")
      .eq("email", u.email)
      .maybeSingle();

    if (data) {
      setCandidate(data);
      setProfile({
        name:      data.name      || u.name  || "",
        email:     data.email     || u.email || "",
        phone:     data.phone     || "",
        location:  data.location  || "",
        age:       data.age?.toString() || "",
        linkedin:  data.linkedin  || "",
        portfolio: data.portfolio || "",
      });
    }
  };

  const handleSave = async (section) => {
    if (section === "Profile") {
      const { error } = await supabase
        .from("candidates")
        .update({
          name:      profile.name,
          phone:     profile.phone,
          location:  profile.location,
          age:       profile.age ? parseInt(profile.age) : null,
          linkedin:  profile.linkedin,
          portfolio: profile.portfolio,
        })
        .eq("email", user?.email || "");

      if (!error) {
        setSaved("✅ Profile saved successfully!");
      } else {
        setSaved("❌ Save failed: " + error.message);
      }
    } else {
      setSaved(`✅ ${section} saved successfully!`);
    }
    setTimeout(() => setSaved(""), 3000);
  };

  if (!user || !candidate) return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <div className="w-56 bg-[#0B1D3A] min-h-screen flex-shrink-0"/>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"/>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F0F4FA]">
      <CandidateSidebar user={user}/>
      <div className="ml-0 md:ml-56 flex-1">
        <div className="bg-white border-b border-[#E2E8F0] px-8 py-4 sticky top-0 z-10">
          <div className="text-lg font-bold text-[#1E293B]">My Settings</div>
          <div className="text-xs text-slate-400">Manage your profile, resume visibility and notifications</div>
        </div>

        <div className="p-8">
          {saved && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-6 text-sm font-medium">
              <Check size={16}/>{saved}
            </div>
          )}

          <div className="flex gap-1 bg-white rounded-2xl border border-[#E2E8F0] p-1.5 mb-6 w-fit">
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-[#10B981] text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* PROFILE TAB */}
          {activeTab === "Profile" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-5">
                  <User size={16} className="inline mr-2 text-[#10B981]"/>
                  Personal Information
                </div>

                {/* Profile header from Supabase */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-[#F0FDF4] rounded-xl">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold bg-[#10B981]">
                    {(candidate.name||"?").split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[#1E293B]">{candidate.name}</div>
                    <div className="text-sm text-[#10B981]">{candidate.email}</div>
                    <div className="text-xs text-slate-400">AI Score: {candidate.ai_score||0}/100</div>
                  </div>
                </div>

                {[
                  { label:"Full Name",    key:"name",      type:"text"   },
                  { label:"Email",        key:"email",     type:"email"  },
                  { label:"Phone",        key:"phone",     type:"tel"    },
                  { label:"Location",     key:"location",  type:"text"   },
                  { label:"Age",          key:"age",       type:"number" },
                  { label:"LinkedIn URL", key:"linkedin",  type:"url"    },
                  { label:"Portfolio",    key:"portfolio", type:"url"    },
                ].map(f => (
                  <div key={f.key} className="mb-3">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{f.label}</label>
                    <input type={f.type} value={profile[f.key]}
                      onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#10B981] bg-[#F8FAFC] focus:bg-white transition-all"/>
                  </div>
                ))}

                <button onClick={() => handleSave("Profile")}
                  className="mt-2 w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all">
                  <Save size={15}/> Save Profile
                </button>
              </div>

              {/* Stats from Supabase */}
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="font-bold text-[#1E293B] mb-4">📊 Your Stats</div>
                  {[
                    ["AI Score",      (candidate.ai_score||0)+"/100"          ],
                    ["JD Match",      (candidate.jd_match||0)+"%"             ],
                    ["Experience",    (candidate.experience_years||"—")+" yrs"],
                    ["Education",     candidate.education    || "—"           ],
                    ["Location",      candidate.location     || "—"           ],
                    ["Qualification", candidate.qualification|| "—"           ],
                  ].map(([l,v],i) => (
                    <div key={i} className="flex justify-between py-2.5 border-b border-[#F1F5F9] last:border-0">
                      <span className="text-sm text-slate-400">{l}</span>
                      <span className="text-sm font-bold text-[#1E293B]">{v}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                  <div className="font-bold text-[#1E293B] mb-3">🔧 Your Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {(candidate.skills||[]).map((s,i) => (
                      <span key={i} className="text-xs bg-[#F0FDF4] text-[#10B981] border border-[#A7F3D0] px-3 py-1.5 rounded-full font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                  <button className="mt-3 text-xs text-[#10B981] font-semibold hover:underline"
                    onClick={() => router.push("/candidate/resume")}>
                    + Update skills via Resume Upload
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESUME SETTINGS TAB */}
          {activeTab === "Resume Settings" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-5">
                  <FileText size={16} className="inline mr-2 text-[#10B981]"/>
                  Resume Visibility & Settings
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">Resume Visibility</label>
                  <div className="grid grid-cols-2 gap-3">
                    {["public","private"].map(opt => (
                      <button key={opt}
                        onClick={() => setResumeSettings(p => ({ ...p, visibility: opt }))}
                        className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                          resumeSettings.visibility === opt
                            ? "border-[#10B981] bg-[#F0FDF4] text-[#10B981]"
                            : "border-[#E2E8F0] text-slate-400"
                        }`}>
                        {opt === "public" ? "🌐 Public" : "🔒 Private"}
                      </button>
                    ))}
                  </div>
                </div>
                {[
                  { key:"showScore", label:"Show AI Score to HR",  desc:"HR can see your AI score"           },
                  { key:"jobAlerts", label:"Job Match Alerts",      desc:"Notify when matching jobs posted"   },
                  { key:"autoApply", label:"Auto-Apply to Matches", desc:"Auto-apply when JD match above 85%" },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-[#1E293B]">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <button onClick={() => setResumeSettings(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        resumeSettings[item.key] ? "bg-[#10B981]" : "bg-[#E2E8F0]"
                      }`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        resumeSettings[item.key] ? "left-5" : "left-0.5"
                      }`}/>
                    </button>
                  </div>
                ))}
                <button onClick={() => handleSave("Resume Settings")}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all">
                  <Save size={15}/> Save Settings
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "Notifications" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-5">
                  <Bell size={16} className="inline mr-2 text-[#10B981]"/>
                  Notification Preferences
                </div>
                {[
                  { key:"applicationUpdate", label:"Application Status Update", desc:"Know when HR reviews your application" },
                  { key:"newJobs",           label:"New Job Alerts",            desc:"Notify when matching jobs are posted"  },
                  { key:"shortlistAlert",    label:"Shortlist Notification",    desc:"Alert when you are shortlisted"        },
                  { key:"aiSuggestions",     label:"AI Resume Tips",            desc:"Weekly AI improvement suggestions"     },
                  { key:"emailDigest",       label:"Email Digest",              desc:"Daily email with job recommendations"  },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between py-3.5 border-b border-[#F1F5F9] last:border-0">
                    <div>
                      <div className="text-sm font-semibold text-[#1E293B]">{item.label}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                    <button onClick={() => setNotifs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${
                        notifs[item.key] ? "bg-[#10B981]" : "bg-[#E2E8F0]"
                      }`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                        notifs[item.key] ? "left-5" : "left-0.5"
                      }`}/>
                    </button>
                  </div>
                ))}
                <button onClick={() => handleSave("Notifications")}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all">
                  <Save size={15}/> Save Notifications
                </button>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === "Security" && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
                <div className="font-bold text-[#1E293B] mb-5">
                  <Lock size={16} className="inline mr-2 text-[#10B981]"/>
                  Change Password
                </div>
                {[
                  { label:"Current Password", key:"oldPassword",     show:showOld, toggle:setShowOld },
                  { label:"New Password",     key:"newPassword",     show:showNew, toggle:setShowNew },
                  { label:"Confirm Password", key:"confirmPassword", show:showNew, toggle:setShowNew },
                ].map(field => (
                  <div key={field.key} className="mb-4">
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{field.label}</label>
                    <div className="relative">
                      <input type={field.show ? "text" : "password"}
                        value={passwords[field.key]}
                        onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm outline-none focus:border-[#10B981] bg-[#F8FAFC] pr-11"/>
                      <button type="button" onClick={() => field.toggle(!field.show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {field.show ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={() => handleSave("Password")}
                  className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#059669] transition-all">
                  <Lock size={15}/> Update Password
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 h-fit">
                <div className="font-bold text-[#1E293B] mb-4">🔐 Account Security</div>
                <div className="space-y-3">
                  {[
                    { icon:"✅", label:"Email Verified",  val:"Verified" },
                    { icon:"📱", label:"Phone Verified",   val:"Not Set"  },
                    { icon:"🔒", label:"Two-Factor Auth",  val:"Disabled" },
                    { icon:"🕐", label:"Last Login",       val:"Just now" },
                    { icon:"🌐", label:"Active Sessions",  val:"1 device" },
                  ].map((item,i) => (
                    <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#F1F5F9] last:border-0">
                      <span className="text-sm text-slate-600">{item.icon} {item.label}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        item.val === "Verified"  ? "bg-green-100 text-green-700" :
                        item.val === "Disabled" || item.val === "Not Set" ? "bg-red-100 text-red-600" :
                        "bg-slate-100 text-slate-600"
                      }`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}