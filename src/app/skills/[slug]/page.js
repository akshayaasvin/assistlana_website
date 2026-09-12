import { notFound } from "next/navigation";
import PublicHeader from "@/components/shared/PublicHeader";
import GlobalFooter from "@/components/shared/GlobalFooter";
import SkillsExperience from "../SkillsExperience";
import { getSkill, skills } from "@/lib/skillsData";

export function generateStaticParams() {
  return skills.map(skill => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) return {};
  return {
    title: `${skill.name} | Free Learning and Certification`,
    description: `${skill.description} Learn with practical explanations and take a skill-based assessment on ASSISTLANA Skills.`,
    alternates: { canonical: `https://assistlana-website-6fzh.vercel.app/skills/${skill.slug}` },
    openGraph: { title: `${skill.name} | ASSISTLANA Skills`, description: skill.description },
  };
}

export default async function SkillPage({ params }) {
  const { slug } = await params;
  const skill = getSkill(slug);
  if (!skill) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: skill.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  };
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: skill.name,
    description: skill.description,
    provider: { "@type": "Organization", name: "ASSISTLANA Skills", url: "https://assistlana-website-6fzh.vercel.app/skills" },
    isAccessibleForFree: true,
    educationalLevel: skill.level,
  };

  return <div className="min-h-screen bg-[#f6f8fc] text-[#10213b]"><PublicHeader /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }} /><SkillsExperience skill={skill} /><GlobalFooter /></div>;
}
