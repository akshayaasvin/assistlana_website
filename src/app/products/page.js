"use client";
import Link from "next/link";
import {
  Brain, CheckCheck, Target, FileText, Cpu, Workflow,
  MessageSquare, BarChart3, BookOpen, GitBranch, ArrowRight, Zap,
} from "lucide-react";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const HR_PRODUCTS = [
  {
    id: "ai-resume-screening",
    icon: <Brain size={26} className="text-white"/>,
    gradient: "from-[#2563EB] to-[#3B82F6]",
    title: "AI Resume Screening",
    badge: "Most Popular",
    desc: "Upload hundreds of resumes and receive instant, AI-ranked candidate shortlists. Our NLP engine extracts skills, calculates ATS scores, and matches candidates to job descriptions with 99.1% accuracy.",
    features: ["Bulk PDF/Word upload", "ATS score per resume", "JD semantic matching", "Skill gap analysis", "Ranked candidate export", "Excel / CSV download"],
    href: "/hr/upload",
  },
  {
    id: "ai-resume-optimizer",
    icon: <FileText size={26} className="text-white"/>,
    gradient: "from-[#06B6D4] to-[#0891B2]",
    title: "AI Resume Optimizer",
    badge: null,
    desc: "Candidates receive personalized, section-by-section AI feedback to improve their resume, increase their ATS score, and align with the job roles they're targeting.",
    features: ["Section-level analysis", "Keyword recommendations", "ATS optimization", "Score improvement tips", "Industry-specific advice", "Instant results"],
    href: "/candidate/resume",
  },
  {
    id: "ai-job-match",
    icon: <Target size={26} className="text-white"/>,
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    title: "AI Job Match",
    badge: null,
    desc: "Semantic matching engine that pairs the right candidates with the right jobs — automatically. Goes beyond keyword matching to understand context, transferable skills, and career trajectory.",
    features: ["Semantic matching", "Context-aware scoring", "Transferable skill recognition", "Multi-JD batch matching", "Match confidence scores", "API access"],
    href: "/hr/matches",
  },
  {
    id: "ats-checker",
    icon: <CheckCheck size={26} className="text-white"/>,
    gradient: "from-[#10B981] to-[#059669]",
    title: "ATS Resume Checker",
    badge: null,
    desc: "Verify whether a resume will pass the ATS filters used by top companies before submitting. Instant checklist with actionable fixes to maximize interview callback rates.",
    features: ["Instant ATS compatibility score", "Format analysis", "Keyword density check", "Font & layout audit", "Action item checklist", "Pass/fail verdict"],
    href: "/candidate/resume",
  },
];

const BIZ_PRODUCTS = [
  {
    id: "ai-agent-builder",
    icon: <Cpu size={26} className="text-white"/>,
    gradient: "from-[#F59E0B] to-[#D97706]",
    title: "AI Agent Builder",
    badge: "New",
    desc: "Design, configure, and deploy autonomous AI agents that handle complex multi-step tasks with minimal human intervention — from data processing to customer communications.",
    features: ["Visual agent designer", "Multi-step task orchestration", "API trigger support", "Error handling & retry logic", "Monitoring dashboard", "No-code deployment"],
    href: "#",
  },
  {
    id: "ai-workflow",
    icon: <Workflow size={26} className="text-white"/>,
    gradient: "from-[#EC4899] to-[#BE185D]",
    title: "AI Workflow Automation",
    badge: null,
    desc: "Map out your business processes and let AI automate them. Connect any tool, trigger workflows on events, and watch manual tasks disappear — without writing a single line of code.",
    features: ["Drag-and-drop builder", "500+ integrations", "Event-based triggers", "Conditional branching", "Real-time monitoring", "Audit trail"],
    href: "#",
  },
  {
    id: "ai-chat",
    icon: <MessageSquare size={26} className="text-white"/>,
    gradient: "from-[#6366F1] to-[#4F46E5]",
    title: "AI Chat Assistant",
    badge: null,
    desc: "Build and deploy intelligent conversational AI trained on your company's knowledge base, product documentation, and support data — delivering instant, accurate responses 24/7.",
    features: ["Custom knowledge base", "Multi-channel deployment", "Escalation routing", "Conversation analytics", "Multilingual support", "LLM model selection"],
    href: "#",
  },
  {
    id: "ai-document",
    icon: <FileText size={26} className="text-white"/>,
    gradient: "from-[#14B8A6] to-[#0F766E]",
    title: "AI Document Intelligence",
    badge: null,
    desc: "Automatically extract, classify, and process unstructured documents — contracts, invoices, forms, and reports — with AI-powered precision and structured data output.",
    features: ["OCR + AI extraction", "Custom field mapping", "Document classification", "Validation rules", "ERP/CRM integration", "99.1% extraction accuracy"],
    href: "#",
  },
  {
    id: "ai-analytics",
    icon: <BarChart3 size={26} className="text-white"/>,
    gradient: "from-[#0EA5E9] to-[#0369A1]",
    title: "AI Analytics Dashboard",
    badge: null,
    desc: "Real-time business intelligence with AI-powered anomaly detection, trend forecasting, and automated reporting — without needing a data science team.",
    features: ["Real-time data streams", "AI anomaly detection", "Predictive forecasting", "Custom KPI builders", "Automated reports", "Embeddable widgets"],
    href: "#",
  },
  {
    id: "ai-knowledge",
    icon: <BookOpen size={26} className="text-white"/>,
    gradient: "from-[#84CC16] to-[#4D7C0F]",
    title: "AI Knowledge Base",
    badge: null,
    desc: "Self-organizing knowledge repositories that automatically categorize, tag, and surface the right information at the right time — learning from how your team actually uses it.",
    features: ["Auto-categorization", "Semantic search", "Version control", "Access permissions", "AI article generation", "Analytics & insights"],
    href: "#",
  },
  {
    id: "smart-automation",
    icon: <GitBranch size={26} className="text-white"/>,
    gradient: "from-[#F97316] to-[#C2410C]",
    title: "Smart Business Automation",
    badge: null,
    desc: "End-to-end business process automation connecting all your tools, teams, and data sources into a unified, intelligent operating system for your entire organization.",
    features: ["Process mining AI", "Cross-tool orchestration", "Team collaboration", "ROI tracking", "Compliance automation", "Enterprise SLA"],
    href: "#",
  },
];

function ProductCard({ product, compact = false }) {
  return (
    <div id={product.id} className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
      <div className={`bg-gradient-to-br ${product.gradient} p-8 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize:"20px 20px" }}/>
        <div className="relative flex items-start justify-between">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            {product.icon}
          </div>
          {product.badge && (
            <span className="bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              {product.badge}
            </span>
          )}
        </div>
        <h3 className="text-xl font-extrabold text-white mt-5 mb-2">{product.title}</h3>
        <p className="text-white/80 text-sm leading-relaxed">{product.desc}</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-2 mb-6">
          {product.features.map(f => (
            <div key={f} className="flex items-center gap-2 text-xs text-[#64748B]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] flex-shrink-0"/>
              {f}
            </div>
          ))}
        </div>
        <Link href={product.href}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-blue-100">
          Get Started <ArrowRight size={14}/>
        </Link>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicHeader/>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize:"40px 40px" }}/>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#60A5FA] px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <Zap size={11} strokeWidth={3}/> Product Catalog
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Our AI Product Suite
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Eleven intelligent software products — from AI agents to workflow automation — designed to transform every function of your business.
          </p>
        </div>
      </section>

      <div className="flex-1 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-20">

          {/* Category A: AI HR Products */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-xl flex items-center justify-center shadow-md shadow-blue-200">
                <Brain size={18} className="text-white"/>
              </div>
              <div>
                <div className="text-xs font-bold text-[#2563EB] uppercase tracking-widest mb-0.5">Category A</div>
                <h2 className="text-2xl font-extrabold text-[#0F172A]">AI HR Products</h2>
              </div>
              <div className="flex-1 h-px bg-[#E2E8F0] ml-4"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {HR_PRODUCTS.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>

          {/* Category B: AI Business Products */}
          <div>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#F59E0B] rounded-xl flex items-center justify-center shadow-md">
                <Cpu size={18} className="text-white"/>
              </div>
              <div>
                <div className="text-xs font-bold text-[#8B5CF6] uppercase tracking-widest mb-0.5">Category B</div>
                <h2 className="text-2xl font-extrabold text-[#0F172A]">AI Business Products</h2>
              </div>
              <div className="flex-1 h-px bg-[#E2E8F0] ml-4"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {BIZ_PRODUCTS.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#2563EB] to-[#0891B2] py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Can't find what you need?</h2>
          <p className="text-blue-100 mb-8">We build custom AI solutions for enterprise clients. Let's talk about your specific requirements.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-xl">
            Contact Us <ArrowRight size={16}/>
          </Link>
        </div>
      </section>

      <GlobalFooter/>
    </div>
  );
}
