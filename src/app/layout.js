import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OrganizationSchema, WebSiteSchema } from "@/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://assistlana-website-6fzh.vercel.app"),

  title: {
    default: "ASSISTLANA - AI-Powered HR Platform | Jobs & Internships in India",
    template: "%s | ASSISTLANA",
  },

  description:
    "ASSISTLANA is an AI-powered HR platform offering AI resume screening, mock interviews, job matching, and internship opportunities across India. HR teams can find top talent using AI. Job seekers get instant ATS scores and career guidance.",

  keywords: [
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

  authors: [{ name: "ASSISTLANA", url: "https://assistlana-website-6fzh.vercel.app" }],
  creator: "ASSISTLANA",
  publisher: "ASSISTLANA",

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://assistlana-website-6fzh.vercel.app",
    siteName: "ASSISTLANA",
    title: "ASSISTLANA - AI-Powered HR Platform | Jobs & Internships India",
    description:
      "Find jobs, internships, and AI-powered career tools. HR teams use ASSISTLANA to screen resumes with AI, conduct mock interviews, and hire faster.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ASSISTLANA - AI HR Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ASSISTLANA - AI HR Platform | Jobs & Internships India",
    description: "AI resume screening, mock interviews, and job matching platform for India.",
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
    canonical: "https://assistlana-website-6fzh.vercel.app",
  },

  manifest: "/manifest.json",

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
      </body>
    </html>
  );
}
