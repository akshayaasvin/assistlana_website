export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ASSISTLANA",
    "url": "https://assistlana-website-6fzh.vercel.app",
    "logo": "https://assistlana-website-6fzh.vercel.app/logo.png",
    "description": "AI-powered HR platform offering resume screening, mock interviews, job matching and internship opportunities across India.",
    "foundingDate": "2024",
    "areaServed": "IN",
    "serviceType": [
      "AI Resume Screening",
      "AI Mock Interview",
      "Job Portal",
      "Internship Platform",
      "HR Recruitment Software"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "admin@assistlana.com",
      "availableLanguage": ["English", "Tamil"]
    },
    "sameAs": []
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ASSISTLANA",
    "url": "https://assistlana-website-6fzh.vercel.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://assistlana-website-6fzh.vercel.app/jobs?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function JobPostingSchema({ job }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.job_title || job.title,
    "description": job.description,
    "datePosted": job.created_at,
    "validThrough": job.deadline || job.valid_through,
    "employmentType": job.job_type || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name || "ASSISTLANA",
      "sameAs": "https://assistlana-website-6fzh.vercel.app"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "IN"
      }
    },
    ...(job.salary_range ? {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salary_range
        }
      }
    } : {}),
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": "India"
    }
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

const FAQ_ITEMS = [
  {
    q: "What is ASSISTLANA?",
    a: "ASSISTLANA is an AI-powered HR and recruitment platform in India that offers AI resume screening, ATS score checking, AI mock interviews, job matching, and internship opportunities for job seekers and HR professionals."
  },
  {
    q: "How does AI resume screening work on ASSISTLANA?",
    a: "Upload your PDF or DOCX resume on ASSISTLANA and our AI instantly analyzes it for ATS compatibility, missing keywords, formatting issues, and gives you a score out of 100 with specific improvement suggestions."
  },
  {
    q: "Can freshers apply for internships on ASSISTLANA?",
    a: "Yes, ASSISTLANA has internship listings across India for freshers in IT, Marketing, Finance, HR, and other domains. Create a free job seeker account and apply directly."
  },
  {
    q: "How do HR companies post jobs on ASSISTLANA?",
    a: "HR companies register on ASSISTLANA, get approved by admin, and receive login credentials. They can then post jobs, upload and screen resumes with AI, shortlist candidates, and manage the entire recruitment process."
  },
  {
    q: "What is AI Mock Interview on ASSISTLANA?",
    a: "ASSISTLANA's AI Mock Interview feature simulates real job interviews. Choose your domain, experience level, and preferred language (English or Tamil). An AI avatar asks domain-specific questions, evaluates your answers, and gives feedback with a score."
  },
  {
    q: "Is ASSISTLANA free for job seekers?",
    a: "Yes, job seekers can create a free account on ASSISTLANA to access resume AI analysis, apply for jobs and internships, and practice with AI mock interviews."
  }
]

export function FAQSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_ITEMS.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ASSISTLANA AI HR Platform",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "500"
    },
    "description": "AI-powered HR recruitment platform with resume screening, mock interviews, and job matching for India."
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export { FAQ_ITEMS }
