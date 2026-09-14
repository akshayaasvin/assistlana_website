import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";

import "./globals.css";

import {
  OrganizationSchema,
  WebSiteSchema,
} from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://assistlana.com"),

  title: {
    default:
      "AI Products, Agents & Enterprise Automation | ASSISTLANA",
    template: "%s | ASSISTLANA",
  },

  description:
    "ASSISTLANA builds AI products, intelligent agents, workflow automation platforms, enterprise SaaS and custom AI software solutions. Explore AI HR technology, business automation and practical career tools.",

  keywords: [
    // =====================================================
    // FREE LEARNING
    // =====================================================

    "free learning",
    "free learning platform",
    "free learning website",
    "free online learning",
    "free online courses",
    "free courses",
    "free courses online",
    "free courses India",
    "free learning India",
    "free education",
    "free education platform",
    "free online education",
    "free training",
    "free online training",
    "free skills training",
    "free skill development",
    "free skill learning",
    "free career learning",
    "free career skills",
    "free technology learning",
    "free technology courses",
    "free IT courses",
    "free computer courses",
    "free professional courses",
    "free job skills training",
    "free career development",
    "free learning resources",
    "free study courses",
    "learn for free",
    "learn online for free",
    "study online for free",

    // =====================================================
    // FREE CERTIFICATE & CERTIFICATION
    // =====================================================

    "free certificate",
    "free certificates",
    "free certification",
    "free certifications",
    "free online certificate",
    "free online certificates",
    "free online certification",
    "free online certifications",
    "free certificate courses",
    "free certification courses",
    "free courses with certificate",
    "free courses with certificates",
    "free online courses with certificate",
    "free online courses with certificates",
    "free skill certificate",
    "free skill certification",
    "free skills certificate",
    "free skills certification",
    "free course certificate",
    "free training certificate",
    "free professional certificate",
    "free professional certification",
    "free technology certificate",
    "free technology certification",
    "free certification India",
    "free certificate India",
    "free certificates India",
    "free certification courses India",
    "free certificate courses India",
    "online certificate free",
    "online certification free",
    "earn free certificate",
    "get free certificate",
    "free skill assessment",
    "free online assessment",
    "free skills assessment",

    // =====================================================
    // FREE COURSES FOR STUDENTS & FRESHERS
    // =====================================================

    "free courses for students",
    "free courses for freshers",
    "free courses for beginners",
    "free certification for students",
    "free certificate for students",
    "free certification for freshers",
    "free certificate for freshers",
    "free skills for students",
    "free career courses for students",
    "free training for freshers",
    "free learning for students",
    "free learning for freshers",
    "free online courses for students",
    "free online courses for freshers",
    "free courses for college students",
    "free courses for graduates",
    "free certification for graduates",
    "free courses for job seekers",

    // =====================================================
    // INTERNSHIPS
    // =====================================================

    "internships",
    "internship",
    "internships in India",
    "internship in India",
    "internships for students",
    "internships for freshers",
    "internship for freshers",
    "internships for college students",
    "internship for college students",
    "student internships",
    "online internships",
    "online internship",
    "virtual internships",
    "remote internships",
    "remote internship",
    "work from home internship",
    "work from home internships",
    "paid internships",
    "paid internship",
    "free internships",
    "free internship",
    "internship opportunities",
    "internship opportunities India",
    "internship programs India",
    "internship program for students",
    "internship program for freshers",
    "summer internships",
    "summer internship India",
    "technical internships",
    "IT internships",
    "software internships",
    "software development internship",
    "web development internship",
    "python internship",
    "javascript internship",
    "react internship",
    "data analytics internship",
    "AI internship",
    "machine learning internship",
    "digital marketing internship",
    "HR internship",
    "business internship",
    "internship with certificate",
    "internship certificate",
    "internship and certificate",
    "internship for beginners",
    "internships near me",
    "internships Tamil Nadu",
    "internships Pondicherry",
    "internships Chennai",
    "internships for engineering students",
    "internships for computer science students",
    "internships for graduates",
    "internships for final year students",
    "internships for college students India",

    // =====================================================
    // PROGRAMMING
    // =====================================================

    "what is Python",
    "Python for beginners",
    "learn Python",
    "Python fundamentals",
    "Python programming basics",
    "free Python course",
    "free Python certification",
    "free Python certificate",
    "Python course for beginners",

    "what is JavaScript",
    "JavaScript for beginners",
    "learn JavaScript",
    "JavaScript fundamentals",
    "JavaScript programming basics",
    "free JavaScript course",
    "free JavaScript certification",
    "free JavaScript certificate",

    "what is SQL",
    "SQL for beginners",
    "learn SQL",
    "SQL fundamentals",
    "SQL database basics",
    "free SQL course",
    "free SQL certification",
    "free SQL certificate",

    "what is HTML",
    "what is CSS",
    "HTML CSS for beginners",
    "learn HTML CSS",
    "HTML CSS fundamentals",
    "free HTML course",
    "free CSS course",
    "free HTML CSS course",
    "free web development course",
    "free web development certification",

    "what is React",
    "React for beginners",
    "learn React",
    "React fundamentals",
    "free React course",
    "free React certification",
    "free React certificate",

    // =====================================================
    // AI & DATA
    // =====================================================

    "what is AI",
    "what is artificial intelligence",
    "AI for beginners",
    "learn AI",
    "AI fundamentals",
    "free AI course",
    "free AI courses",
    "free AI certification",
    "free AI certificate",
    "free artificial intelligence course",
    "free artificial intelligence certification",

    "what is machine learning",
    "machine learning for beginners",
    "learn machine learning",
    "machine learning fundamentals",
    "free machine learning course",
    "free machine learning certification",
    "free machine learning certificate",

    "what is data analytics",
    "data analytics for beginners",
    "learn data analytics",
    "data analytics fundamentals",
    "free data analytics course",
    "free data analytics certification",
    "free data analytics certificate",

    // =====================================================
    // DIGITAL MARKETING & PROFESSIONAL SKILLS
    // =====================================================

    "what is digital marketing",
    "digital marketing for beginners",
    "learn digital marketing",
    "digital marketing fundamentals",
    "free digital marketing course",
    "free digital marketing certification",
    "free digital marketing certificate",

    "what is business communication",
    "business communication skills",
    "professional communication skills",
    "free business communication course",
    "free communication skills course",
    "free professional skills course",
    "free workplace skills training",

    // =====================================================
    // CAREER & JOB SEEKER
    // =====================================================

    "career skills",
    "career development",
    "job skills",
    "skills for freshers",
    "skills for students",
    "skills for graduates",
    "employability skills",
    "job ready skills",
    "job ready courses",
    "career courses",
    "career training",
    "career guidance",
    "AI career guidance",
    "career guidance for students",
    "career guidance for freshers",
    "job preparation",
    "job preparation for freshers",
    "fresher career opportunities",
    "fresher jobs India",
    "jobs for freshers India",
    "entry level jobs India",

    // =====================================================
    // ASSISTLANA HR PLATFORM
    // =====================================================

    "AI product company",
    "AI software development",
    "AI agents",
    "enterprise SaaS",
    "workflow automation",
    "custom AI solutions",
    "AI HR platform India",
    "AI resume screening",
    "ATS resume checker",
    "mock interview AI",
    "jobs in India",
    "internships India",
    "HR recruitment software",
    "job seeker platform",
    "AI job match",
    "resume optimizer AI",
    "Tamil Nadu jobs",
    "Pondicherry jobs",
    "fresher jobs India",
    "HR software India",
    "AI recruitment platform",
    "online mock interview",
    "internship for freshers",
    "job portal India",
    "AI career guidance",
    "resume ATS score",
  ],

  authors: [
    {
      name: "ASSISTLANA",
      url: "https://assistlana.com",
    },
  ],

  creator: "ASSISTLANA",
  publisher: "ASSISTLANA",

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://assistlana.com/learn",
    siteName: "ASSISTLANA",

    title:
      "Free Learning & Free Certificates | Jobs & Internships | ASSISTLANA",

    description:
      "Learn for free, build job-ready skills, take free skill assessments, earn free certificates, find internships and jobs, and access AI-powered career tools with ASSISTLANA.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ASSISTLANA Free Learning, Certificates, Jobs and Internships",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Free Learning & Free Certificates | Jobs & Internships | ASSISTLANA",

    description:
      "Free learning paths, free skill assessments, free certificates, internships, jobs and AI-powered career tools for students and job seekers.",

    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  verification: {
    google: "add-your-google-search-console-verification-code-here",
  },

  alternates: {
    canonical: "https://assistlana.com/learn",
  },

  manifest: "/manifest.json",

  icons: {
    icon: [
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-192.png", type: "image/png", sizes: "192x192" }],
  },

  other: {
    "llms.txt": "/llms.txt",
  },
};

export const viewport = {
  themeColor: "#1253A4",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        <OrganizationSchema />
        <WebSiteSchema />

        {/* OpenAI Pixel */}
        <Script
          id="openai-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(w,d,s,u){
                if(w.oaiq)return;

                var q=function(){
                  q.q.push(arguments)
                };

                q.q=[];
                w.oaiq=q;

                var j=d.createElement(s);
                j.async=1;
                j.src=u;

                var f=d.getElementsByTagName(s)[0];
                f.parentNode.insertBefore(j,f);
              }(
                window,
                document,
                "script",
                "https://bzrcdn.openai.com/sdk/oaiq.min.js"
              );

              oaiq("init", {
                pixelId: "MRq8gAtUtu54vYXNXee6rG",
                debug: true
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
