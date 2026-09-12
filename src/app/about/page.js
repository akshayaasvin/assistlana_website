"use client";
import Link from "next/link";
import {
  Zap, ArrowRight, Target, Lightbulb, Brain, Globe,
  Layers, Rocket, Cloud, TrendingUp, Shield,
} from "lucide-react";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const FOCUS_AREAS = [
  {
    icon: <Target size={20} className="text-[#2563EB]"/>,
    bg: "bg-blue-50",
    title: "Company Vision",
    desc: "To become the world's most trusted AI software company — making intelligent automation accessible to every business, regardless of size or sector.",
  },
  {
    icon: <Lightbulb size={20} className="text-[#F59E0B]"/>,
    bg: "bg-yellow-50",
    title: "Innovation",
    desc: "Continuous R&D investment in frontier AI technologies — LLMs, multimodal models, agentic systems, and human-in-the-loop orchestration frameworks.",
  },
  {
    icon: <Brain size={20} className="text-[#8B5CF6]"/>,
    bg: "bg-purple-50",
    title: "AI Technology",
    desc: "Our proprietary AI engine combines state-of-the-art foundation models with domain-specific fine-tuning to deliver accuracy and reliability at enterprise scale.",
  },
  {
    icon: <Globe size={20} className="text-[#10B981]"/>,
    bg: "bg-emerald-50",
    title: "Enterprise Software",
    desc: "Every product is engineered for mission-critical enterprise use — with security, compliance, scalability, and uptime guarantees that businesses depend on.",
  },
  {
    icon: <TrendingUp size={20} className="text-[#EC4899]"/>,
    bg: "bg-pink-50",
    title: "Digital Transformation",
    desc: "We partner with organizations at every stage of their digital journey — from initial automation pilots to full-scale AI-native operating model redesign.",
  },
  {
    icon: <Layers size={20} className="text-[#06B6D4]"/>,
    bg: "bg-cyan-50",
    title: "Product Development",
    desc: "Our product engineering culture emphasizes rapid iteration, user-centric design, and data-driven decision-making — shipping value every two weeks.",
  },
  {
    icon: <Cloud size={20} className="text-[#6366F1]"/>,
    bg: "bg-indigo-50",
    title: "Cloud Solutions",
    desc: "Cloud-native architecture built for AWS, Google Cloud, and Azure — with auto-scaling, multi-region deployment, and infrastructure-as-code from day one.",
  },
  {
    icon: <Rocket size={20} className="text-[#F97316]"/>,
    bg: "bg-orange-50",
    title: "Future AI Roadmap",
    desc: "We're actively building toward AGI-augmented workflows, real-time multi-agent coordination, and AI systems that continuously improve without retraining.",
  },
];

const TEAM_VALUES = [
  { emoji: "🎯", title: "Mission-Driven",    desc: "Every line of code serves a business outcome." },
  { emoji: "🔬", title: "Research-First",    desc: "We apply cutting-edge AI research to real problems." },
  { emoji: "🤝", title: "Customer-Obsessed", desc: "Customer success defines our own success." },
  { emoji: "⚡", title: "Bias for Action",   desc: "We ship, learn, and improve faster than anyone." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicHeader/>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-24 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize:"40px 40px" }}/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#60A5FA] px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <Zap size={11} strokeWidth={3}/> About AssistLana
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            An AI Software Company<br/>
            <span className="bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent">
              Dedicated to Building<br/>the Intelligent Future
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            We build the AI products and platforms that power next-generation business operations.
          </p>
        </div>
      </section>

      {/* Mission statement */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold mb-5">
                <Target size={11}/> Our Mission
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-6 leading-tight">
                Intelligent Software for a<br/>
                <span className="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
                  Transformed World
                </span>
              </h2>
              <p className="text-[#64748B] leading-relaxed text-lg mb-6">
                AssistLana is an AI software company dedicated to building intelligent digital products that automate business operations through artificial intelligence, machine learning, cloud technology, and enterprise software.
              </p>
              <p className="text-[#64748B] leading-relaxed mb-8">
                We help organizations innovate, improve productivity, and accelerate digital transformation — delivering measurable, lasting impact across every industry we serve.
              </p>
              <Link href="/contact"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-7 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-blue-200">
                Work With Us <ArrowRight size={16}/>
              </Link>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              {[
                { val:"Est. 2019",  label:"Founded in Pondicherry, Tamil Nadu",    color:"blue"    },
                { val:"500+",       label:"Businesses powered by our AI platform", color:"purple"  },
                { val:"11",         label:"AI products across 2 major categories", color:"cyan"    },
                { val:"8",          label:"Industries actively served",            color:"emerald" },
                { val:"99.1%",      label:"AI model accuracy rate",               color:"orange"  },
                { val:"24/7",       label:"Autonomous AI agent uptime",           color:"pink"    },
              ].map(s => (
                <div key={s.label} className={`flex items-center gap-5 p-4 rounded-2xl border ${
                  s.color==="blue"    ? "bg-blue-50 border-blue-100"     :
                  s.color==="purple"  ? "bg-purple-50 border-purple-100" :
                  s.color==="cyan"    ? "bg-cyan-50 border-cyan-100"     :
                  s.color==="emerald" ? "bg-emerald-50 border-emerald-100":
                  s.color==="orange"  ? "bg-orange-50 border-orange-100" :
                                        "bg-pink-50 border-pink-100"
                }`}>
                  <div className={`text-2xl font-extrabold flex-shrink-0 w-20 text-right ${
                    s.color==="blue"    ? "text-[#2563EB]"   :
                    s.color==="purple"  ? "text-purple-600"  :
                    s.color==="cyan"    ? "text-[#0891B2]"   :
                    s.color==="emerald" ? "text-emerald-600" :
                    s.color==="orange"  ? "text-orange-600"  :
                                          "text-pink-600"
                  }`}>{s.val}</div>
                  <div className="text-sm text-[#64748B] font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Focus areas */}
      <section className="bg-[#F8FAFC] py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#2563EB] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
              <Layers size={11}/> Focus Areas
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">
              8 Pillars of AssistLana's AI Strategy
            </h2>
            <p className="text-[#64748B] max-w-xl mx-auto">The core domains that define how we build, ship, and evolve our AI products.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FOCUS_AREAS.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className={`w-10 h-10 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-[#64748B] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] mb-3">How We Work</h2>
            <p className="text-[#64748B] max-w-xl mx-auto">The values and operating principles behind every product we ship.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM_VALUES.map(v => (
              <div key={v.title} className="rounded-2xl border border-[#E2E8F0] p-6 text-center hover:shadow-md transition-all">
                <div className="text-4xl mb-4">{v.emoji}</div>
                <h3 className="font-bold text-[#0F172A] mb-2">{v.title}</h3>
                <p className="text-[#64748B] text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="bg-[#F8FAFC] py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-8 md:p-12 text-center shadow-sm">
            <div className="text-4xl mb-5">📍</div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-3">Where We Are</h2>
            <p className="text-[#64748B] mb-2">AssistLana Technologies</p>
            <p className="text-[#64748B] mb-6">TIDEL NEO – Thiruchitrambalam (Villupuram),<br/>Koot Road, Tamil Nadu – 605111, India</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:+918553451935"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md shadow-blue-100">
                📞 +91 85534 51935
              </a>
              <a href="mailto:hr@assistlana.com"
                className="inline-flex items-center gap-2 border-2 border-[#2563EB] text-[#2563EB] px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">
                ✉️ hr@assistlana.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <GlobalFooter/>
    </div>
  );
}
