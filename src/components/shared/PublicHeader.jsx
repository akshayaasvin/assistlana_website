"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Zap, ArrowRight } from "lucide-react";

const HR_PRODUCTS = [
  { label: "AI Resume Screening",  href: "/products#ai-resume-screening",  desc: "Bulk upload & instant ATS ranking"     },
  { label: "AI Resume Optimizer",  href: "/products#ai-resume-optimizer",  desc: "AI-powered resume improvement tips"    },
  { label: "AI Job Match",         href: "/products#ai-job-match",          desc: "Semantic candidate-to-job matching"   },
  { label: "ATS Resume Checker",   href: "/products#ats-checker",           desc: "Verify ATS compatibility instantly"   },
];

const BIZ_PRODUCTS = [
  { label: "AI Agent Builder",       href: "/products#ai-agent-builder",     desc: "Build autonomous AI agents"          },
  { label: "AI Workflow Automation", href: "/products#ai-workflow",           desc: "Automate complex business processes" },
  { label: "AI Chat Assistant",      href: "/products#ai-chat",               desc: "Intelligent conversational AI"       },
  { label: "AI Analytics Dashboard", href: "/products#ai-analytics",          desc: "Real-time business intelligence"     },
];

const RESOURCES_LINKS = [
  { label: "AI Blog",               href: "/resources#blog"        },
  { label: "AI Insights",           href: "/resources#insights"    },
  { label: "Product Documentation", href: "/resources#docs"        },
  { label: "API Documentation",     href: "/resources#api"         },
  { label: "Case Studies",          href: "/resources#case-studies"},
  { label: "Developer Guides",      href: "/resources#dev-guides"  },
];

export default function PublicHeader({ onSignIn, onGetStarted }) {
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileSection,  setMobileSection]  = useState(null);

  const toggleSection = (s) => setMobileSection(p => p === s ? null : s);

  return (
    <header className="bg-white/95 backdrop-blur border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
            <Zap size={15} className="text-white" strokeWidth={2.5}/>
          </div>
          <span className="text-[17px] font-extrabold bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent tracking-tight">
            AssistLana
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">

          {/* Products mega-dropdown */}
          <div className="relative"
            onMouseEnter={() => setActiveDropdown("products")}
            onMouseLeave={() => setActiveDropdown(null)}>
            <button className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDropdown === "products" ? "text-[#2563EB] bg-blue-50" : "text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50"
            }`}>
              Products
              <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === "products" ? "rotate-180" : ""}`}/>
            </button>

            {activeDropdown === "products" && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-[520px]"
                style={{ animation: "navDropIn 0.15s ease" }}>
                <div className="grid grid-cols-2 gap-1">
                  {/* Left: HR products */}
                  <div>
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-3 py-2">AI HR Products</div>
                    {HR_PRODUCTS.map(p => (
                      <Link key={p.label} href={p.href}
                        className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-all group">
                        <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{p.label}</span>
                        <span className="text-xs text-[#94A3B8] mt-0.5">{p.desc}</span>
                      </Link>
                    ))}
                  </div>
                  {/* Right: Business products */}
                  <div className="border-l border-gray-100 pl-1">
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest px-3 py-2">AI Business Products</div>
                    {BIZ_PRODUCTS.map(p => (
                      <Link key={p.label} href={p.href}
                        className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-blue-50 transition-all group">
                        <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{p.label}</span>
                        <span className="text-xs text-[#94A3B8] mt-0.5">{p.desc}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 mt-2 pt-3 px-3">
                  <Link href="/products"
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:gap-3 transition-all">
                    View all products <ArrowRight size={12}/>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/solutions"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Solutions
          </Link>
          <Link href="/jobs"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Jobs
          </Link>
          <Link href="/apply"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Internships
          </Link>
          <Link href="/about"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            About
          </Link>

          {/* Resources dropdown */}
          <div className="relative"
            onMouseEnter={() => setActiveDropdown("resources")}
            onMouseLeave={() => setActiveDropdown(null)}>
            <button className={`flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeDropdown === "resources" ? "text-[#2563EB] bg-blue-50" : "text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50"
            }`}>
              Resources
              <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdown === "resources" ? "rotate-180" : ""}`}/>
            </button>
            {activeDropdown === "resources" && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-52"
                style={{ animation: "navDropIn 0.15s ease" }}>
                {RESOURCES_LINKS.map(r => (
                  <Link key={r.label} href={r.href}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[#0F172A] hover:bg-blue-50 hover:text-[#2563EB] transition-all">
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/contact"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Contact
          </Link>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {onGetStarted ? (
            <button onClick={onGetStarted}
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all shadow-md shadow-blue-200">
              AI Resume Scanning
            </button>
          ) : (
            <Link href="/"
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all shadow-md shadow-blue-200">
              AI Resume Scanning
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-xl text-[#64748B] hover:bg-gray-100 transition-colors">
          {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-0.5 max-h-[80vh] overflow-y-auto">

          {/* Products accordion */}
          <div>
            <button onClick={() => toggleSection("products")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
              Products
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileSection === "products" ? "rotate-180" : ""}`}/>
            </button>
            {mobileSection === "products" && (
              <div className="ml-3 space-y-0.5 mb-1">
                <div className="px-4 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">AI HR Products</div>
                {HR_PRODUCTS.map(p => (
                  <Link key={p.label} href={p.href} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-xl text-sm text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
                    {p.label}
                  </Link>
                ))}
                <div className="px-4 py-1 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mt-2">AI Business Products</div>
                {BIZ_PRODUCTS.map(p => (
                  <Link key={p.label} href={p.href} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-xl text-sm text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
                    {p.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {[
            { label: "Solutions",   href: "/solutions" },
            { label: "Jobs",        href: "/jobs" },
            { label: "Internships", href: "/apply" },
            { label: "About",       href: "/about" },
          ].map(l => (
            <Link key={l.label} href={l.href} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
              {l.label}
            </Link>
          ))}

          {/* Resources accordion */}
          <div>
            <button onClick={() => toggleSection("resources")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
              Resources
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileSection === "resources" ? "rotate-180" : ""}`}/>
            </button>
            {mobileSection === "resources" && (
              <div className="ml-3 space-y-0.5 mb-1">
                {RESOURCES_LINKS.map(r => (
                  <Link key={r.label} href={r.href} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/contact" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Contact
          </Link>

          <div className="pt-3 border-t border-gray-100 mt-2 flex gap-2">
            {onGetStarted ? (
              <button onClick={() => { setMobileOpen(false); onGetStarted(); }}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all">
                AI Resume Scanning
              </button>
            ) : (
              <Link href="/" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all text-center">
                AI Resume Scanning
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
