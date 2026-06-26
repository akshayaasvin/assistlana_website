"use client";
import Link from "next/link";
import { Zap, Phone, Mail, MapPin } from "lucide-react";

const PRODUCTS_COL = [
  { label: "AI Resume Screening",    href: "/products#ai-resume-screening" },
  { label: "AI Resume Optimizer",    href: "/products#ai-resume-optimizer" },
  { label: "AI Job Match",           href: "/products#ai-job-match" },
  { label: "ATS Resume Checker",     href: "/products#ats-checker" },
  { label: "AI Agent Builder",       href: "/products#ai-agent-builder" },
  { label: "AI Workflow Automation", href: "/products#ai-workflow" },
];

const COMPANY_COL = [
  { label: "Home",        href: "/" },
  { label: "Products",    href: "/products" },
  { label: "Solutions",   href: "/solutions" },
  { label: "About",       href: "/about" },
  { label: "Resources",   href: "/resources" },
  { label: "Contact",     href: "/contact" },
];

const PORTAL_COL = [
  { label: "Jobs",              href: "/jobs" },
  { label: "Internships",       href: "/apply" },
];

const SOCIAL = [
  {
    label: "LinkedIn", href: "#",
    svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>,
  },
  {
    label: "GitHub", href: "#",
    svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>,
  },
  {
    label: "X (Twitter)", href: "#",
    svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    label: "Instagram", href: "#",
    svg: <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
];

export default function GlobalFooter() {
  return (
    <footer className="bg-[#0A0F1E] text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">

          {/* Brand column */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/40">
                <Zap size={15} className="text-white" strokeWidth={2.5}/>
              </div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent">
                AssistLana
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Building Intelligent AI Products for Modern Businesses. Automation platforms, AI agents, and enterprise SaaS solutions that transform organizations.
            </p>

            {/* Contact info */}
            <div className="space-y-3">
              <a href="tel:+918553451935"
                className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition-colors group">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-blue-900/40 transition-colors">
                  <Phone size={13} className="text-[#60A5FA]"/>
                </div>
                +91 85534 51935
              </a>
              <a href="mailto:hr@assistlana.com"
                className="flex items-center gap-3 text-slate-400 hover:text-white text-sm transition-colors group">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-blue-900/40 transition-colors">
                  <Mail size={13} className="text-[#60A5FA]"/>
                </div>
                hr@assistlana.com
              </a>
              <div className="flex items-start gap-3 text-slate-400 text-sm">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={13} className="text-[#60A5FA]"/>
                </div>
                <span className="leading-relaxed">
                  TIDEL NEO – Thiruchitrambalam (Villupuram),<br/>
                  Koot Road, Tamil Nadu – 605111, India
                </span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Products</div>
            <div className="space-y-2.5">
              {PRODUCTS_COL.map(l => (
                <Link key={l.label} href={l.href}
                  className="block text-slate-400 text-sm hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Company</div>
            <div className="space-y-2.5">
              {COMPANY_COL.map(l => (
                <Link key={l.label} href={l.href}
                  className="block text-slate-400 text-sm hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Portals + Social */}
          <div>
            <div className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Portals</div>
            <div className="space-y-2.5 mb-8">
              {PORTAL_COL.map(l => (
                <Link key={l.label} href={l.href}
                  className="block text-slate-400 text-sm hover:text-white transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Follow Us</div>
            <div className="flex gap-2">
              {SOCIAL.map(({ svg, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-8 h-8 bg-white/5 hover:bg-blue-900/50 rounded-lg flex items-center justify-center transition-colors group text-slate-400 hover:text-[#60A5FA]">
                  {svg}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-xs">
            © 2026 AssistLana. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
          <p className="text-slate-600 text-xs hidden md:block">
            Built with AI · Powered by Next.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  );
}
