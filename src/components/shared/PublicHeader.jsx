"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Zap } from "lucide-react";

const PRODUCTS = [
  { label: "AI Resume Screening",  href: "/hr/upload",           desc: "Instant ATS scoring & AI ranking" },
  { label: "AI Resume Optimizer",  href: "/candidate/resume",    desc: "Improve your resume with AI tips" },
  { label: "AI Job Match",         href: "/hr/matches",          desc: "Semantic candidate-job matching" },
  { label: "ATS Resume Checker",   href: "/candidate/resume",    desc: "Check ATS compatibility instantly" },
];

const RESOURCES = [
  { label: "Blog",               href: "/#resources" },
  { label: "HR Insights",        href: "/#resources" },
  { label: "Resume Templates",   href: "/#resources" },
  { label: "Interview Tips",     href: "/#resources" },
];

export default function PublicHeader({ onSignIn, onGetStarted }) {
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [mobileSection,  setMobileSection]  = useState(null);

  const toggleSection = (s) => setMobileSection(prev => prev === s ? null : s);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
            <Zap size={15} className="text-white" strokeWidth={2.5}/>
          </div>
          <span className="text-[17px] font-extrabold bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent tracking-tight">
            AssistLana AI
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          <Link href="/"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Home
          </Link>

          {/* Products dropdown */}
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
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-64"
                style={{ animation: "navDropIn 0.15s ease" }}>
                {PRODUCTS.map(p => (
                  <Link key={p.label} href={p.href}
                    className="flex flex-col px-4 py-3 rounded-xl hover:bg-blue-50 transition-all group">
                    <span className="text-sm font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">{p.label}</span>
                    <span className="text-xs text-[#94A3B8] mt-0.5">{p.desc}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/jobs"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Jobs
          </Link>
          <Link href="/apply"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Internships
          </Link>
          <Link href="/#pricing"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Pricing
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
              <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 w-48"
                style={{ animation: "navDropIn 0.15s ease" }}>
                {RESOURCES.map(r => (
                  <Link key={r.label} href={r.href}
                    className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[#0F172A] hover:bg-blue-50 hover:text-[#2563EB] transition-all">
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/#contact"
            className="px-3.5 py-2 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Contact
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <button onClick={onSignIn}
            className="px-4 py-2 text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">
            Sign In
          </button>
          {onGetStarted ? (
            <button onClick={onGetStarted}
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all shadow-md shadow-blue-200">
              Try AI Free
            </button>
          ) : (
            <Link href="/"
              className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all shadow-md shadow-blue-200">
              Try AI Free
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
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-0.5">
          <Link href="/" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Home
          </Link>

          {/* Products accordion */}
          <div>
            <button onClick={() => toggleSection("products")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
              Products
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileSection === "products" ? "rotate-180" : ""}`}/>
            </button>
            {mobileSection === "products" && (
              <div className="ml-4 space-y-0.5 mb-1">
                {PRODUCTS.map(p => (
                  <Link key={p.label} href={p.href} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
                    {p.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/jobs" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Jobs
          </Link>
          <Link href="/apply" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Internships
          </Link>
          <Link href="/#pricing" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Pricing
          </Link>

          {/* Resources accordion */}
          <div>
            <button onClick={() => toggleSection("resources")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
              Resources
              <ChevronDown size={14} className={`transition-transform duration-200 ${mobileSection === "resources" ? "rotate-180" : ""}`}/>
            </button>
            {mobileSection === "resources" && (
              <div className="ml-4 space-y-0.5 mb-1">
                {RESOURCES.map(r => (
                  <Link key={r.label} href={r.href} onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
                    {r.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/#contact" onClick={() => setMobileOpen(false)}
            className="block px-4 py-3 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#2563EB] hover:bg-blue-50 transition-all">
            Contact
          </Link>

          <div className="pt-3 border-t border-gray-100 mt-2 flex gap-2">
            <button onClick={() => { setMobileOpen(false); onSignIn?.(); }}
              className="flex-1 py-2.5 text-sm font-semibold text-[#0F172A] border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
              Sign In
            </button>
            {onGetStarted ? (
              <button onClick={() => { setMobileOpen(false); onGetStarted(); }}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all">
                Try AI Free
              </button>
            ) : (
              <Link href="/" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-xl hover:opacity-90 transition-all text-center">
                Try AI Free
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
