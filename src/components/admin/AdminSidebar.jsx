"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, Briefcase,
  Building2, Settings, LogOut, Menu, X, UserCheck
} from "lucide-react";

const NAV = [
  { section: "OVERVIEW", items: [
    { label:"Dashboard",   icon: LayoutDashboard, href:"/admin/dashboard"   },
  ]},
  { section: "USERS", items: [
    { label:"HR Users",    icon: UserCheck,       href:"/admin/hr-users"    },
    { label:"Job Seekers", icon: Users,           href:"/admin/candidates"  },
  ]},
  { section: "CONTENT", items: [
    { label:"All Jobs",    icon: Briefcase,       href:"/admin/jobs"        },
    { label:"Internships", icon: GraduationCap,   href:"/admin/internships" },
  ]},
  { section: "SYSTEM", items: [
    { label:"Organizations",icon: Building2,      href:"/admin/orgs"        },
    { label:"Settings",    icon: Settings,        href:"/admin/settings"    },
  ]},
];

export default function AdminSidebar({ user }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    router.push("/admin/login");
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0,2) || "AD";

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white border border-[#E2E8F0] text-[#0F172A] p-2 rounded-xl shadow-sm">
        <Menu size={20}/>
      </button>

      {open && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)}/>
      )}

      <div className={`w-56 bg-white border-r border-[#E2E8F0] min-h-screen flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>

        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <div className="text-base font-extrabold bg-gradient-to-r from-[#0284C7] to-[#0D9488] bg-clip-text text-transparent">
              ASSISTLANA
            </div>
            <div className="text-[10px] text-[#64748B]">Admin Portal</div>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-[#64748B]"><X size={18}/></button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV.map((section) => (
            <div key={section.section}>
              <div className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2 px-2 mt-2">
                {section.section}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <button key={item.label}
                    onClick={() => { router.push(item.href); setOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl mb-0.5 text-sm font-medium transition-all text-left ${
                      isActive
                        ? "bg-gradient-to-r from-[#0284C7]/10 to-[#0D9488]/10 text-[#0284C7] border-l-2 border-[#0284C7]"
                        : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    }`}>
                    <Icon size={15} className="flex-shrink-0"/>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#7C3AED] to-[#0284C7] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#0F172A] truncate">{user?.name || "Admin"}</div>
              <div className="text-[10px] text-[#64748B] truncate">{user?.role || "Admin"}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 text-xs font-medium transition-all">
            <LogOut size={13}/>Logout
          </button>
        </div>
      </div>
    </>
  );
}
