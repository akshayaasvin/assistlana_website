"use client";
import { useState } from "react";
import {
  Phone, Mail, MapPin, CheckCircle, AlertCircle, ArrowRight, Zap, Calendar,
} from "lucide-react";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";

const SUBJECTS = [
  "Product Demo Request",
  "Sales Inquiry",
  "Technical Support",
  "Partnership Opportunity",
  "Pricing Question",
  "Enterprise Inquiry",
  "Other",
];

const CONTACT_CARDS = [
  {
    icon: <Phone size={22} className="text-white"/>,
    gradient: "from-[#2563EB] to-[#3B82F6]",
    title: "Call Us",
    lines: [
      { text: "+91 85534 51935", href: "tel:+918553451935", clickable: true },
      { text: "Mon–Sat · 9AM to 7PM IST", clickable: false },
    ],
    cta: { text: "Call Now", href: "tel:+918553451935" },
  },
  {
    icon: <Mail size={22} className="text-white"/>,
    gradient: "from-[#06B6D4] to-[#0891B2]",
    title: "Email Us",
    lines: [
      { text: "hr@assistlana.com", href: "mailto:hr@assistlana.com", clickable: true },
      { text: "We respond within 4 business hours", clickable: false },
    ],
    cta: { text: "Send Email", href: "mailto:hr@assistlana.com" },
  },
  {
    icon: <MapPin size={22} className="text-white"/>,
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    title: "Visit Our Office",
    lines: [
      { text: "AssistLana Technologies", clickable: false },
      { text: "TIDEL NEO – Thiruchitrambalam (Villupuram)", clickable: false },
      { text: "Koot Road, Tamil Nadu – 605111, India", clickable: false },
    ],
    cta: { text: "Get Directions", href: "https://maps.google.com/?q=TIDEL+NEO+Thiruchitrambalam+Villupuram+Tamil+Nadu" },
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", subject: "", message: "",
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (action) => {
    setError("");
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Please fill in Name, Email, Subject, and Message.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid business email.");
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <PublicHeader/>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-12 text-center max-w-md shadow-md">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle size={30} className="text-white"/>
            </div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] mb-3">Message Sent!</h2>
            <p className="text-[#64748B] mb-6">
              Thank you, <strong>{form.name}</strong>. We'll get back to you at <strong>{form.email}</strong> within 4 business hours.
            </p>
            <button onClick={() => { setSuccess(false); setForm({ name:"", company:"", email:"", phone:"", subject:"", message:"" }); }}
              className="w-full py-3 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              Send Another Message
            </button>
          </div>
        </div>
        <GlobalFooter/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicHeader/>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] py-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize:"40px 40px" }}/>
        <div className="absolute right-1/4 top-1/4 w-64 h-64 bg-[#2563EB]/15 rounded-full blur-3xl pointer-events-none"/>
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-[#60A5FA] px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            <Zap size={11} strokeWidth={3}/> Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5">
            Let's Build Something<br/>
            <span className="bg-gradient-to-r from-[#60A5FA] to-[#22D3EE] bg-clip-text text-transparent">
              Intelligent Together
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Whether you're exploring AI for the first time or ready to scale enterprise automation — our team is ready to help.
          </p>
        </div>
      </section>

      <div className="flex-1 py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">

          {/* 3-card contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            {CONTACT_CARDS.map(c => (
              <div key={c.title} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className={`bg-gradient-to-br ${c.gradient} p-5 flex items-center gap-4`}>
                  <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    {c.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white">{c.title}</h3>
                </div>
                <div className="p-5">
                  <div className="space-y-1.5 mb-5">
                    {c.lines.map((l, i) => (
                      l.clickable ? (
                        <a key={i} href={l.href} className="block text-sm font-semibold text-[#0F172A] hover:text-[#2563EB] transition-colors">{l.text}</a>
                      ) : (
                        <p key={i} className="text-sm text-[#64748B]">{l.text}</p>
                      )
                    ))}
                  </div>
                  <a href={c.cta.href} target={c.cta.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.cta.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] hover:gap-3 transition-all">
                    {c.cta.text} <ArrowRight size={13}/>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Main content: form + map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Contact form */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm p-8">
              <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">Send Us a Message</h2>
              <p className="text-[#64748B] text-sm mb-7">Fill in the form below and we'll get back to you within 4 business hours.</p>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
                  <AlertCircle size={14}/>{error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Full Name *</label>
                    <input type="text" placeholder="Your full name" value={form.name}
                      onChange={e => set("name", e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Company Name <span className="text-[#94A3B8] font-normal">(Optional)</span></label>
                    <input type="text" placeholder="Your company" value={form.company}
                      onChange={e => set("company", e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Business Email *</label>
                    <input type="email" placeholder="you@company.com" value={form.email}
                      onChange={e => set("email", e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Phone Number</label>
                    <input type="tel" placeholder="+91 9876543210" value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none transition-colors"/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Subject *</label>
                  <select value={form.subject} onChange={e => set("subject", e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none bg-white text-[#0F172A] transition-colors">
                    <option value="">Select a subject...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#64748B] mb-1.5">Message *</label>
                  <textarea placeholder="Tell us about your project, requirements, or questions..." value={form.message}
                    onChange={e => set("message", e.target.value)} rows={5}
                    className="w-full px-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:border-[#2563EB] outline-none resize-none transition-colors"/>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={() => handleSubmit("message")} disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-60 hover:opacity-90 transition-all shadow-md shadow-blue-100 inline-flex items-center justify-center gap-2">
                  {loading ? "Sending..." : <><span>Send Message</span><ArrowRight size={14}/></>}
                </button>
                <button onClick={() => handleSubmit("demo")} disabled={loading}
                  className="flex-1 border-2 border-[#2563EB] text-[#2563EB] font-bold py-3 rounded-xl text-sm hover:bg-blue-50 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60">
                  <Calendar size={14}/> Schedule a Demo
                </button>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] shadow-sm">
              <div className="bg-white px-6 py-4 border-b border-[#E2E8F0]">
                <h3 className="font-bold text-[#0F172A]">Our Office Location</h3>
                <p className="text-sm text-[#64748B] mt-1">TIDEL NEO, Thiruchitrambalam, Villupuram, Tamil Nadu</p>
              </div>
              <iframe
                src="https://maps.google.com/maps?q=TIDEL+NEO+Thiruchitrambalam+Villupuram+Tamil+Nadu+605111&output=embed&z=14"
                width="100%"
                height="420"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="AssistLana Office Location"
                className="block"
              />
              <div className="bg-white px-6 py-4 border-t border-[#E2E8F0]">
                <a href="https://maps.google.com/?q=TIDEL+NEO+Thiruchitrambalam+Villupuram+Tamil+Nadu"
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] hover:gap-3 transition-all">
                  Open in Google Maps <ArrowRight size={13}/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlobalFooter/>
    </div>
  );
}
