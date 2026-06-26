"use client";
import Link from "next/link";
import {
  Users, GraduationCap, Heart, DollarSign, ShoppingBag,
  Factory, Truck, Cpu, ArrowRight, Zap, CheckCircle,
} from "lucide-react";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const INDUSTRIES = [
  {
    icon: <Users size={28} className="text-white"/>,
    gradient: "from-[#2563EB] to-[#3B82F6]",
    industry: "Human Resources",
    headline: "AI-Powered Talent Operations",
    desc: "Transform every stage of the HR lifecycle with intelligent automation — from recruitment and screening to onboarding, performance management, and employee engagement.",
    usecases: [
      "Automated resume screening & ranking",
      "AI-driven job description optimization",
      "Candidate-to-role semantic matching",
      "Automated interview scheduling",
      "Employee performance analytics",
      "AI-assisted workforce planning",
    ],
    impact: ["80% faster screening", "40% lower cost-per-hire", "3× recruiter productivity"],
  },
  {
    icon: <GraduationCap size={28} className="text-white"/>,
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    industry: "Education",
    headline: "Intelligent Learning Platforms",
    desc: "Build adaptive, personalized learning experiences with AI that responds to each student's pace, style, and performance — from K-12 through enterprise training programs.",
    usecases: [
      "Adaptive learning paths",
      "AI-graded assignments & feedback",
      "Student performance prediction",
      "Curriculum optimization",
      "Automated content generation",
      "Learning analytics dashboards",
    ],
    impact: ["60% improved completion rates", "Real-time student insights", "Reduced administrative load"],
  },
  {
    icon: <Heart size={28} className="text-white"/>,
    gradient: "from-[#EC4899] to-[#BE185D]",
    industry: "Healthcare",
    headline: "Clinical & Operational AI",
    desc: "Accelerate diagnoses, reduce administrative burden, and improve patient outcomes with AI that seamlessly integrates into existing clinical workflows and EHR systems.",
    usecases: [
      "Medical document processing",
      "Patient intake automation",
      "Clinical note AI assistance",
      "Appointment scheduling AI",
      "Insurance claim processing",
      "Compliance monitoring",
    ],
    impact: ["70% less admin overhead", "Faster patient onboarding", "Improved care coordination"],
  },
  {
    icon: <DollarSign size={28} className="text-white"/>,
    gradient: "from-[#10B981] to-[#059669]",
    industry: "Finance",
    headline: "Intelligent Financial Automation",
    desc: "Automate financial operations, detect anomalies in real time, streamline compliance reporting, and deliver AI-powered insights that drive smarter investment and risk decisions.",
    usecases: [
      "Invoice & PO automation",
      "Fraud detection models",
      "Regulatory compliance AI",
      "Financial report generation",
      "Risk assessment agents",
      "Audit trail automation",
    ],
    impact: ["90% faster invoice processing", "Real-time fraud alerts", "Full audit compliance"],
  },
  {
    icon: <ShoppingBag size={28} className="text-white"/>,
    gradient: "from-[#F59E0B] to-[#D97706]",
    industry: "Retail",
    headline: "Personalized Retail Intelligence",
    desc: "Deliver hyper-personalized shopping experiences, optimize inventory with predictive AI, and automate customer service — across e-commerce, physical stores, and omnichannel platforms.",
    usecases: [
      "Product recommendation AI",
      "Demand forecasting",
      "Inventory optimization",
      "AI-powered customer service",
      "Pricing optimization",
      "Returns & fraud detection",
    ],
    impact: ["35% uplift in conversion", "20% inventory cost reduction", "24/7 customer support"],
  },
  {
    icon: <Factory size={28} className="text-white"/>,
    gradient: "from-[#6366F1] to-[#4F46E5]",
    industry: "Manufacturing",
    headline: "Smart Factory Operations",
    desc: "Implement predictive maintenance, quality control automation, and AI-driven supply chain management to reduce downtime, cut defects, and improve production efficiency.",
    usecases: [
      "Predictive maintenance AI",
      "Quality defect detection",
      "Production schedule optimization",
      "Supply chain intelligence",
      "Worker safety monitoring",
      "Energy consumption AI",
    ],
    impact: ["50% downtime reduction", "99.2% defect detection", "Optimized production planning"],
  },
  {
    icon: <Truck size={28} className="text-white"/>,
    gradient: "from-[#14B8A6] to-[#0F766E]",
    industry: "Logistics",
    headline: "Intelligent Supply Chain AI",
    desc: "Optimize routes in real time, automate warehouse operations, predict delivery delays before they happen, and create complete supply chain visibility with AI-powered intelligence.",
    usecases: [
      "Route optimization AI",
      "Warehouse automation",
      "Delivery prediction & ETA",
      "Freight document processing",
      "Demand-supply balancing",
      "Fleet management AI",
    ],
    impact: ["25% fuel cost savings", "Real-time shipment tracking", "Automated customs docs"],
  },
  {
    icon: <Cpu size={28} className="text-white"/>,
    gradient: "from-[#0EA5E9] to-[#0369A1]",
    industry: "Information Technology",
    headline: "AI-Native IT Operations",
    desc: "Supercharge IT teams with AIOps, intelligent ticketing, automated code review, and predictive infrastructure monitoring that resolves issues before they impact users.",
    usecases: [
      "AIOps & incident prediction",
      "Intelligent IT helpdesk",
      "Automated code review AI",
      "Infrastructure monitoring",
      "Cybersecurity threat detection",
      "DevOps pipeline optimization",
    ],
    impact: ["60% faster incident resolution", "Proactive system alerts", "Automated L1 support"],
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader/>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize:"40px 40px" }}/>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#60A5FA] px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <Zap size={11} strokeWidth={3}/> Industry Solutions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
            AI Solutions Across Every Industry
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            AssistLana's AI platform is built to be industry-agnostic. Discover how intelligent automation transforms operations across 8 major sectors.
          </p>
        </div>
      </section>

      {/* Industry blocks */}
      <div className="flex-1 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {INDUSTRIES.map((ind, i) => (
            <div key={ind.industry}
              className={`rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-lg transition-all ${
                i % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
              }`}>
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Left panel */}
                <div className={`bg-gradient-to-br ${ind.gradient} p-8 flex flex-col justify-between relative overflow-hidden`}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize:"20px 20px" }}/>
                  <div className="relative">
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-sm">
                      {ind.icon}
                    </div>
                    <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">{ind.industry}</div>
                    <h2 className="text-2xl font-extrabold text-white mb-4 leading-tight">{ind.headline}</h2>
                    <p className="text-white/80 text-sm leading-relaxed">{ind.desc}</p>
                  </div>
                  <div className="relative mt-8 space-y-2">
                    {ind.impact.map(m => (
                      <div key={m} className="flex items-center gap-2 text-white/90 text-sm">
                        <CheckCircle size={14} className="text-white/70 flex-shrink-0"/>
                        {m}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right panel */}
                <div className="lg:col-span-2 p-8">
                  <div className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-5">Key Use Cases</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {ind.usecases.map(u => (
                      <div key={u} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-[#E2E8F0] group hover:border-[#2563EB]/30 hover:shadow-sm transition-all">
                        <div className="w-2 h-2 rounded-full bg-[#2563EB] mt-1.5 flex-shrink-0"/>
                        <span className="text-sm text-[#0F172A] font-medium">{u}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/contact"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-md shadow-blue-100">
                    Explore {ind.industry} Solution <ArrowRight size={14}/>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Don't see your industry?</h2>
          <p className="text-slate-400 mb-8">Our AI platform adapts to any business domain. Let's co-create a tailored solution.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-8 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg">
            Talk to Our Team <ArrowRight size={16}/>
          </Link>
        </div>
      </section>

      <GlobalFooter/>
    </div>
  );
}
