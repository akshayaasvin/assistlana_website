"use client";
import Link from "next/link";
import {
  Zap, BookOpen, Lightbulb, FileText, Code, BarChart3,
  ScrollText, Rocket, Video, ArrowRight, Search,
} from "lucide-react";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const CATEGORIES = [
  {
    id: "blog",
    icon: <BookOpen size={22} className="text-white"/>,
    gradient: "from-[#2563EB] to-[#3B82F6]",
    title: "AI Blog",
    desc: "Expert analysis, AI industry trends, product deep-dives, and engineering insights from the AssistLana team.",
    count: "24 articles",
    articles: [
      "The Rise of Agentic AI: What It Means for Enterprise Operations",
      "How RAG Architectures Are Transforming Business Knowledge Systems",
      "LLM Fine-Tuning vs Prompt Engineering: When to Use Which",
      "Building Production-Grade AI Pipelines in 2025",
    ],
  },
  {
    id: "insights",
    icon: <Lightbulb size={22} className="text-white"/>,
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    title: "AI Insights",
    desc: "Data-driven research, market analysis, and strategic AI adoption insights for business leaders and decision-makers.",
    count: "18 reports",
    articles: [
      "State of AI Automation in Indian Enterprises 2025",
      "ROI Report: AI Workflow Automation Across 200+ SMEs",
      "HR Technology Benchmark: AI vs Traditional Recruiting",
      "The $4.7T Opportunity in Enterprise AI — Where India Stands",
    ],
  },
  {
    id: "docs",
    icon: <FileText size={22} className="text-white"/>,
    gradient: "from-[#10B981] to-[#059669]",
    title: "Product Documentation",
    desc: "Comprehensive setup guides, configuration references, feature walkthroughs, and troubleshooting for every AssistLana product.",
    count: "120+ pages",
    articles: [
      "Quick Start: AI Resume Screening in 5 Minutes",
      "Configuring AI Agent Builder — Advanced Settings",
      "Workflow Automation: Trigger Types & Event Mapping",
      "AI Analytics Dashboard: KPI Configuration Guide",
    ],
  },
  {
    id: "api",
    icon: <Code size={22} className="text-white"/>,
    gradient: "from-[#06B6D4] to-[#0891B2]",
    title: "API Documentation",
    desc: "Full REST and GraphQL API references, authentication guides, webhook documentation, rate limits, and SDK documentation.",
    count: "REST & GraphQL",
    articles: [
      "Authentication: API Keys, OAuth 2.0 & JWT",
      "Resume Analysis Endpoint Reference",
      "Webhooks: Real-time Event Streaming Setup",
      "Rate Limits, Quotas & Best Practices",
    ],
  },
  {
    id: "case-studies",
    icon: <BarChart3 size={22} className="text-white"/>,
    gradient: "from-[#F59E0B] to-[#D97706]",
    title: "Case Studies",
    desc: "Real-world customer success stories with detailed metrics, implementation timelines, and business impact measurements.",
    count: "12 stories",
    articles: [
      "TechServe India: 80% Reduction in Hiring Time with AI Screening",
      "CyberMatics: $2.1M Saved Annually via Workflow Automation",
      "CloudEdge: Deploying 47 AI Agents Across 6 Departments",
      "FinCore Solutions: Automated Invoice Processing at Scale",
    ],
  },
  {
    id: "whitepapers",
    icon: <ScrollText size={22} className="text-white"/>,
    gradient: "from-[#EC4899] to-[#BE185D]",
    title: "White Papers",
    desc: "In-depth technical research papers on AI system design, enterprise architecture, security frameworks, and compliance models.",
    count: "8 papers",
    articles: [
      "Enterprise AI Architecture: A Framework for Scale",
      "AI Security & Compliance in Regulated Industries",
      "Agentic Systems: Design Patterns for Production",
      "Data Governance for LLM-Powered Enterprise Products",
    ],
  },
  {
    id: "product-updates",
    icon: <Rocket size={22} className="text-white"/>,
    gradient: "from-[#6366F1] to-[#4F46E5]",
    title: "Product Updates",
    desc: "Changelog, release notes, feature announcements, and deprecation notices for all AssistLana AI products.",
    count: "v2.1 current",
    articles: [
      "v2.1 Release: AI Agent Builder General Availability",
      "New: Multi-LLM Support in AI Chat Assistant",
      "Performance: 3× Faster Resume Processing Engine",
      "Breaking: API v1 Deprecation — Migration Guide",
    ],
  },
  {
    id: "dev-guides",
    icon: <Video size={22} className="text-white"/>,
    gradient: "from-[#14B8A6] to-[#0F766E]",
    title: "Developer Guides",
    desc: "Step-by-step tutorials, code samples, integration guides, and best practices for developers building on the AssistLana platform.",
    count: "32 guides",
    articles: [
      "Building Your First AI Agent with AssistLana SDK",
      "Integrating Workflow Automation via REST API",
      "Node.js & Python SDK: Quickstart Examples",
      "Testing AI Pipelines: Mocking & Fixtures",
    ],
  },
];

const FEATURED = [
  {
    tag: "Case Study",
    tagColor: "bg-blue-50 text-[#2563EB] border-blue-200",
    title: "How TechServe India Reduced Hiring Time by 80%",
    desc: "A deep dive into deploying AI Resume Screening at scale — from pilot to full rollout across 12 departments.",
    readTime: "8 min read",
    gradient: "from-[#2563EB] to-[#06B6D4]",
  },
  {
    tag: "White Paper",
    tagColor: "bg-purple-50 text-purple-700 border-purple-200",
    title: "Enterprise AI Architecture: A Framework for Scale",
    desc: "Technical guide to designing reliable, cost-effective, and secure AI systems that grow with your organization.",
    readTime: "22 min read",
    gradient: "from-[#8B5CF6] to-[#06B6D4]",
  },
  {
    tag: "API Docs",
    tagColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
    title: "Resume Analysis API — Complete Reference",
    desc: "Full endpoint documentation with request/response schemas, error codes, rate limits, and working code examples.",
    readTime: "Reference",
    gradient: "from-[#06B6D4] to-[#2563EB]",
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicHeader/>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize:"40px 40px" }}/>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#60A5FA] px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <Zap size={11} strokeWidth={3}/> Resource Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
            Knowledge, Docs & AI Insights
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Everything you need to understand, implement, and get the most from AssistLana's AI products — from first-time setup to enterprise-scale architecture.
          </p>
          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input type="text" placeholder="Search docs, guides, API references..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/15 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#60A5FA] backdrop-blur-sm transition-colors"/>
          </div>
        </div>
      </section>

      <div className="flex-1 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Featured */}
          <div className="mb-16">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">Featured Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURED.map(f => (
                <div key={f.title} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group cursor-pointer">
                  <div className={`h-2 bg-gradient-to-r ${f.gradient}`}/>
                  <div className="p-6">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${f.tagColor} mb-4 inline-block`}>{f.tag}</span>
                    <h3 className="font-bold text-[#0F172A] mb-2 group-hover:text-[#2563EB] transition-colors leading-snug">{f.title}</h3>
                    <p className="text-[#64748B] text-sm leading-relaxed mb-4">{f.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">{f.readTime}</span>
                      <span className="text-xs font-bold text-[#2563EB] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight size={11}/>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All categories */}
          <h2 className="text-xl font-bold text-[#0F172A] mb-6">All Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CATEGORIES.map(cat => (
              <div key={cat.id} id={cat.id} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className={`bg-gradient-to-r ${cat.gradient} p-5 flex items-center gap-4`}>
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white">{cat.title}</h3>
                    <div className="text-white/60 text-xs">{cat.count}</div>
                  </div>
                </div>
                {/* Body */}
                <div className="p-5">
                  <p className="text-[#64748B] text-sm mb-4 leading-relaxed">{cat.desc}</p>
                  <div className="space-y-2 mb-4">
                    {cat.articles.map(a => (
                      <div key={a} className="flex items-start gap-2 text-sm text-[#0F172A] hover:text-[#2563EB] transition-colors cursor-pointer group">
                        <ArrowRight size={12} className="mt-1 text-[#2563EB] flex-shrink-0 group-hover:translate-x-0.5 transition-transform"/>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                  <button className="text-xs font-bold text-[#2563EB] hover:underline inline-flex items-center gap-1">
                    View all {cat.title} <ArrowRight size={11}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#2563EB] to-[#0891B2] py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Can't find what you're looking for?</h2>
          <p className="text-blue-100 mb-8">Our developer team and AI support agents are available 24/7 to help you.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#2563EB] px-8 py-4 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-xl">
            Contact Support <ArrowRight size={16}/>
          </Link>
        </div>
      </section>

      <GlobalFooter/>
    </div>
  );
}
