"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Home",        href: "/" },
  { label: "Jobs",        href: "/jobs" },
  { label: "Internship",  href: "/apply" },
  { label: "Gallery",     href: "/gallery" },
  { label: "About",       href: "/#about" },
];

export default function PublicHeader({ onSignIn, onGetStarted }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold bg-gradient-to-r from-[#0284C7] to-[#0D9488] bg-clip-text text-transparent tracking-tight">
            ASSISTLANA
          </span>
          <span className="hidden sm:block text-xs text-[#64748B] font-medium">HR Consultancy</span>
        </Link>

        {/* Center Nav (md+) */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href}
              className="px-4 py-2 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#0284C7] hover:bg-[#F0F9FF] transition-all">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onSignIn}
            className="px-4 py-2 text-sm font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9] transition-all">
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#0284C7] to-[#0D9488] rounded-xl hover:opacity-90 transition-all shadow-sm">
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl border border-[#E2E8F0] text-[#64748B]">
          {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E2E8F0] px-4 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.label} href={l.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[#64748B] hover:text-[#0284C7] hover:bg-[#F0F9FF]">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
            <button onClick={() => { setMobileOpen(false); onSignIn?.(); }}
              className="flex-1 py-2.5 text-sm font-semibold text-[#0F172A] border border-[#E2E8F0] rounded-xl hover:bg-[#F1F5F9]">
              Sign In
            </button>
            <button onClick={() => { setMobileOpen(false); onGetStarted?.(); }}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-[#0284C7] to-[#0D9488] rounded-xl hover:opacity-90">
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
