import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function sitemap() {
  const baseUrl = 'https://assistlana-website-6fzh.vercel.app'

  const staticPages = [
    { url: baseUrl,                       lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${baseUrl}/jobs`,             lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/internships`,      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/about`,            lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/hr/signup`,        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/candidate/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  let jobPages = []
  try {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, updated_at')
      .eq('status', 'active')
    if (jobs) {
      jobPages = jobs.map(job => ({
        url: `${baseUrl}/jobs/${job.id}`,
        lastModified: new Date(job.updated_at),
        changeFrequency: 'weekly',
        priority: 0.8,
      }))
    }
  } catch (e) {}

  let internshipPages = []
  try {
    const { data: internships } = await supabase
      .from('internship_applications')
      .select('id, updated_at')
    if (internships) {
      internshipPages = internships.map(i => ({
        url: `${baseUrl}/internships/${i.id}`,
        lastModified: new Date(i.updated_at),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }
  } catch (e) {}

  return [...staticPages, ...jobPages, ...internshipPages]
}
