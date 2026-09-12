import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";
import { skills } from "@/lib/skillsData";

export const metadata = {
  title: "Learn | What Is Python, SQL, AI, React and More | ASSISTLANA",
  description: "Beginner-friendly answers to practical questions about programming, web development, data, AI, digital marketing, and professional skills.",
  alternates: { canonical: "https://assistlana-website-6fzh.vercel.app/learn" },
};

const hubQuestions = [
  ["What is Python?", "Python is a readable general-purpose language used for automation, data, web services, and AI.", "python-fundamentals"],
  ["What is JavaScript?", "JavaScript is a programming language that adds behavior to web pages and also runs beyond the browser.", "javascript-fundamentals"],
  ["What is SQL?", "SQL is a language for asking questions of and managing data stored in relational databases.", "sql-fundamentals"],
  ["What is HTML and CSS?", "HTML describes page structure and CSS controls presentation, layout, and responsive appearance.", "html-css-fundamentals"],
  ["What is React?", "React is a JavaScript library for composing interfaces from reusable components.", "react-fundamentals"],
  ["What is AI?", "Artificial intelligence describes software that performs tasks involving recognition, prediction, or language generation.", "artificial-intelligence-fundamentals"],
  ["What is machine learning?", "Machine learning creates systems that learn patterns from examples and use them for predictions or decisions.", "machine-learning-fundamentals"],
  ["What is data analytics?", "Data analytics examines information to find patterns, answer questions, and support decisions.", "data-analytics-fundamentals"],
  ["What is digital marketing?", "Digital marketing uses online channels and measurable campaigns to reach and help a defined audience.", "digital-marketing-fundamentals"],
  ["What is business communication?", "Business communication is the purposeful exchange of information that helps people understand, decide, and act at work.", "business-communication"],
];

export default function LearnPage() {
  const categories = [...new Set(skills.map(skill => skill.category))];
  return <div className="min-h-screen bg-[#f6f8fc] text-[#10213b]"><PublicHeader /><main><section className="bg-[#10213b] text-white"><div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24"><div className="max-w-3xl"><div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-cyan-300"><BookOpen size={15} /> What is the answer hub</div><h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Start with a question. Leave with a learning path.</h1><p className="mt-6 text-lg leading-8 text-slate-300">Direct, beginner-friendly answers to the questions learners ask before they start. Every answer connects to a free skill pathway and an optional assessment.</p><div className="mt-8 flex max-w-xl items-center gap-3 border border-white/15 bg-white/10 px-4 py-3 text-sm text-slate-300"><Search size={17} /> Search-friendly learning answers across technology, data, AI, and work skills.</div></div></div></section><section className="mx-auto max-w-7xl px-5 py-16 md:px-8"><div className="mb-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600">Explore by category</p><h2 className="mt-3 text-3xl font-black">Useful context before a course</h2></div><div className="flex flex-wrap gap-3">{categories.map(category => <span key={category} className="border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600">{category}</span>)}</div><div className="mt-10 grid gap-4 md:grid-cols-2">{hubQuestions.map(([question, answer, slug]) => <article key={question} className="border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/5"><h3 className="text-xl font-extrabold">{question}</h3><p className="mt-3 leading-7 text-slate-600">{answer}</p><Link href={`/skills/${slug}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900">Read the full learning path <ArrowRight size={15} /></Link></article>)}</div></section><section className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-5 py-14 md:px-8"><h2 className="text-2xl font-black">The ASSISTLANA Skills learning journey</h2><div className="mt-7 grid gap-4 md:grid-cols-4">{[["Answer", "Understand the concept in plain language."], ["Learn", "Follow a structured beginner curriculum."], ["Practise", "Use examples and small tasks to make it stick."], ["Certify", "Take the selected skill assessment when ready."]].map(([title, text], index) => <div key={title} className="border-l-2 border-cyan-400 pl-4"><span className="text-xs font-black text-blue-600">0{index + 1}</span><h3 className="mt-3 font-extrabold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div></div></section></main><GlobalFooter /></div>;
}
