"use client";
import { useRouter, usePathname } from "next/navigation";
import { Upload, Users, Briefcase, BarChart2, LogOut, Layout, Brain, Settings } from "lucide-react";
const NAV = [
  { label:"Upload Resumes", icon: Upload,    href:"/hr/upload"     },
  { label:"Candidates",     icon: Users,     href:"/hr/candidates" },
  { label:"Jobs",           icon: Briefcase, href:"/hr/jobs"       },
  { label:"Shortlist",      icon: Layout,    href:"/hr/shortlist"  },
  { label:"Analytics",      icon: BarChart2, href:"/hr/analytics"  },
  { label:"Settings",       icon: Settings,  href:"/hr/settings"   },
];

export default function HRSidebar({ user }) {
  const router   = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("hr_user");
    router.push("/");
  };

  return (
    <div className="w-56 bg-[#0B1D3A] min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0EA5C9] rounded-xl flex items-center justify-center">
            <Brain size={18} className="text-white"/>
          </div>
          <div>
            <div className="text-white font-bold text-sm">ASSISTLANA</div>
            <div className="text-[#0EA5C9] text-xs">HR Portal</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <div className="text-xs text-white/30 font-semibold uppercase tracking-widest mb-3 px-2">HR Tools</div>
        {NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
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
          <div className="w-8 h-8 bg-[#0EA5C9] rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.split(" ").map(n => n[0]).join("")}
          </div>
          <div>
            <div className="text-white text-xs font-semibold">{user?.name}</div>
            <div className="text-white/40 text-xs">{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all">
          <LogOut size={14}/>Logout
        </button>
      </div>
    </div>
  );
}