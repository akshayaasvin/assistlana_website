// ─── ADMIN CREDENTIALS ───────────────────────────
export const ADMIN_USERS = [
  { userId:"admin001", password:"Admin@123", name:"Preethi Menon", role:"Super Admin", uid:"dd0b11eb-76c6-4afd-94b4-0d0845c85b5c" },
  { userId:"admin002", password:"Admin@456", name:"Sanjay Kumar",  role:"Org Admin",   uid:"" },
];

// ─── HR CREDENTIALS ──────────────────────────────
export const HR_USERS_AUTH = [
  { email:"kavitha@assistlana.com", password:"HR@123", name:"Kavitha Nair", role:"HR Manager" },
  { email:"sanjay@assistlana.com",  password:"HR@456", name:"Sanjay Kumar", role:"HR Manager" },
];

// ─── CANDIDATE CREDENTIALS ───────────────────────
export const CANDIDATE_USERS_AUTH = [
  { email:"priya@email.com", password:"Pass@123", name:"Priya Rajan", id:1 },
  { email:"arjun@email.com", password:"Pass@123", name:"Arjun Mehta", id:2 },
  { email:"sneha@email.com", password:"Pass@123", name:"Sneha Patel", id:3 },
];

// ─── SYSTEM STATS ────────────────────────────────
export const SYSTEM_STATS = {
  totalOrgs:       12,
  totalHRUsers:    38,
  totalCandidates: 1247,
  totalResumes:    1893,
  activeJobs:      24,
  parsedToday:     87,
  systemUptime:    "99.8%",
  parseSuccess:    "99.1%",
};

// ─── HR USERS (Admin view) ────────────────────────
export const HR_USERS = [
  { id:1, name:"Kavitha Nair",  userId:"hr001", email:"kavitha@assistlana.com", role:"HR Manager", status:"Active",   org:"ASSISTLANA", lastLogin:"2 hours ago" },
  { id:2, name:"Sanjay Kumar",  userId:"hr002", email:"sanjay@assistlana.com",  role:"HR Viewer",  status:"Active",   org:"ASSISTLANA", lastLogin:"1 day ago"   },
  { id:3, name:"Ravi Chandran", userId:"hr003", email:"ravi@assistlana.com",    role:"HR Manager", status:"Inactive", org:"TechCorp",   lastLogin:"5 days ago"  },
  { id:4, name:"Meera Pillai",  userId:"hr004", email:"meera@techcorp.com",     role:"HR Viewer",  status:"Active",   org:"TechCorp",   lastLogin:"3 hours ago" },
  { id:5, name:"Arjun Das",     userId:"hr005", email:"arjun@startupx.com",     role:"HR Manager", status:"Active",   org:"StartupX",   lastLogin:"Just now"    },
];

// ─── CANDIDATES ───────────────────────────────────
export const CANDIDATES = [
  { id:1, name:"Priya Rajan",      email:"priya@email.com",   avatar:"PR", color:"#1253A4", role:"Full Stack Developer", score:92, jd_match:94, skills:["React","Node.js","Python","AWS"],     exp:5, edu:"B.Tech CS",  status:"Shortlisted", location:"Chennai",   age:27, qualification:"B.Tech" },
  { id:2, name:"Arjun Mehta",      email:"arjun@email.com",   avatar:"AM", color:"#0EA5C9", role:"ML Engineer",          score:88, jd_match:91, skills:["Python","TensorFlow","spaCy","SQL"],  exp:4, edu:"M.Tech AI",  status:"Shortlisted", location:"Bangalore", age:26, qualification:"M.Tech" },
  { id:3, name:"Sneha Patel",      email:"sneha@email.com",   avatar:"SP", color:"#8B5CF6", role:"UI/UX Designer",       score:85, jd_match:87, skills:["Figma","React","CSS","Framer"],       exp:3, edu:"B.Des",      status:"Reviewing",   location:"Tambaram",  age:25, qualification:"B.Des"  },
  { id:4, name:"Karthik Sundaram", email:"karthik@email.com", avatar:"KS", color:"#10B981", role:"DevOps Engineer",      score:79, jd_match:82, skills:["Docker","K8s","AWS","Terraform"],     exp:6, edu:"B.E. IT",    status:"Reviewing",   location:"Chennai",   age:30, qualification:"B.E"    },
  { id:5, name:"Divya Krishnan",   email:"divya@email.com",   avatar:"DK", color:"#F59E0B", role:"Data Scientist",       score:76, jd_match:78, skills:["Python","sklearn","SQL","Tableau"],   exp:3, edu:"M.Sc Stats", status:"Pending",     location:"Tambaram",  age:24, qualification:"M.Sc"   },
  { id:6, name:"Rahul Sharma",     email:"rahul@email.com",   avatar:"RS", color:"#EF4444", role:"Backend Developer",    score:71, jd_match:74, skills:["Java","Spring","PostgreSQL","Redis"], exp:4, edu:"B.Tech CS",  status:"Pending",     location:"Mumbai",    age:28, qualification:"B.Tech" },
  { id:7, name:"Meera Nair",       email:"meera@email.com",   avatar:"MN", color:"#6366F1", role:"Data Analyst",         score:68, jd_match:65, skills:["SQL","Tableau","Excel","Python"],     exp:2, edu:"BCA",        status:"Pending",     location:"Chennai",   age:23, qualification:"BCA"    },
  { id:8, name:"Vikram Das",       email:"vikram@email.com",  avatar:"VD", color:"#EC4899", role:"iOS Developer",        score:63, jd_match:61, skills:["Swift","SwiftUI","Xcode","Firebase"], exp:2, edu:"B.Tech CS",  status:"Rejected",    location:"Hyderabad", age:25, qualification:"B.Tech" },
];

// ─── JOBS ─────────────────────────────────────────
export const JOBS = [
  { id:1, title:"Senior Full Stack Developer", dept:"Engineering",    matches:24, shortlisted:5, status:"Active", posted:"3 days ago",  skills:["React","Node.js","PostgreSQL","AWS"],        exp:"3-5 years", desc:"We are looking for a senior full stack developer to build scalable web applications."   },
  { id:2, title:"ML Engineer – NLP Focus",     dept:"AI/ML",          matches:18, shortlisted:4, status:"Active", posted:"1 week ago",  skills:["Python","spaCy","TensorFlow","BERT"],        exp:"2-4 years", desc:"Join our AI team to build NLP pipelines and ML models for resume screening."            },
  { id:3, title:"Product Designer",            dept:"Design",         matches:31, shortlisted:6, status:"Active", posted:"5 days ago",  skills:["Figma","User Research","Prototyping","CSS"], exp:"2-3 years", desc:"Design beautiful and intuitive user interfaces for our SaaS platform."                  },
  { id:4, title:"DevOps Engineer",             dept:"Infrastructure", matches:12, shortlisted:3, status:"Active", posted:"2 weeks ago", skills:["AWS","Kubernetes","Terraform","CI/CD"],      exp:"4-6 years", desc:"Build and maintain our cloud infrastructure and deployment pipelines."                   },
  { id:5, title:"Data Scientist",              dept:"Analytics",      matches:22, shortlisted:4, status:"Active", posted:"4 days ago",  skills:["Python","sklearn","SQL","Tableau"],          exp:"2-4 years", desc:"Analyze recruitment data and build predictive models for candidate success."             },
];

// ─── ANALYTICS ────────────────────────────────────
export const ANALYTICS = {
  funnel: [
    { stage:"Uploaded",    count:247 },
    { stage:"Parsed",      count:241 },
    { stage:"Scored",      count:238 },
    { stage:"Matched",     count:189 },
    { stage:"Shortlisted", count:43  },
    { stage:"Interviewed", count:18  },
  ],
  weekly: [
    { day:"Mon", resumes:34, shortlisted:8  },
    { day:"Tue", resumes:52, shortlisted:12 },
    { day:"Wed", resumes:41, shortlisted:9  },
    { day:"Thu", resumes:67, shortlisted:15 },
    { day:"Fri", resumes:53, shortlisted:11 },
    { day:"Sat", resumes:22, shortlisted:5  },
  ],
  skills: [
    { name:"Python", value:82 },
    { name:"React",  value:68 },
    { name:"SQL",    value:74 },
    { name:"AWS",    value:45 },
    { name:"Docker", value:38 },
    { name:"Node.js",value:59 },
  ],
  dept: [
    { name:"Engineering", value:42, color:"#1253A4" },
    { name:"AI/ML",       value:22, color:"#0EA5C9" },
    { name:"Design",      value:18, color:"#8B5CF6" },
    { name:"DevOps",      value:10, color:"#10B981" },
    { name:"Analytics",   value:8,  color:"#F59E0B" },
  ],
};

// ─── AUDIT LOGS ──────────────────────────────────
export const AUDIT_LOGS = [
  { id:1, user:"Kavitha Nair",  action:"Uploaded 5 resumes",       time:"10 mins ago", type:"upload" },
  { id:2, user:"admin001",      action:"Created HR user hr005",     time:"1 hour ago",  type:"admin"  },
  { id:3, user:"Arjun Das",     action:"Shortlisted 3 candidates",  time:"2 hours ago", type:"hr"     },
  { id:4, user:"Meera Pillai",  action:"Viewed candidate profile",  time:"3 hours ago", type:"view"   },
  { id:5, user:"admin001",      action:"Updated scoring weights",   time:"1 day ago",   type:"config" },
];

// ─── ORGANIZATIONS ────────────────────────────────
export const ORGANIZATIONS = [
  { id:1, name:"ASSISTLANA", plan:"Enterprise", users:15, resumes:893, status:"Active"   },
  { id:2, name:"TechCorp",   plan:"Growth",     users:8,  resumes:412, status:"Active"   },
  { id:3, name:"StartupX",   plan:"Starter",    users:3,  resumes:188, status:"Active"   },
  { id:4, name:"HireHub",    plan:"Growth",     users:6,  resumes:290, status:"Inactive" },
];

// ─── CANDIDATE APPLICATIONS ───────────────────────
export const APPLICATIONS = [
  { id:1, candidateId:1, jobId:1, status:"Shortlisted", appliedDate:"2 days ago", score:92 },
  { id:2, candidateId:1, jobId:2, status:"Reviewing",   appliedDate:"5 days ago", score:78 },
  { id:3, candidateId:2, jobId:2, status:"Shortlisted", appliedDate:"1 week ago", score:88 },
];

// ─── AI SUGGESTIONS ───────────────────────────────
export const AI_SUGGESTIONS = [
  "Add quantified achievements e.g. 'Improved performance by 40%'",
  "Include Docker and Kubernetes in your skills section",
  "Add a professional summary at the top of your resume",
  "Mention cloud platforms like AWS or GCP",
  "Add links to GitHub projects or portfolio",
  "Use action verbs: Built, Developed, Optimized, Led",
];
export const RECENT_UPLOADS = [
  { name:"Priya Rajan",   file:"Priya_Rajan_Resume.pdf",    time:"2 mins ago",  score:92, email:"priya@email.com"   },
  { name:"Arjun Mehta",   file:"Arjun_Mehta_CV.pdf",        time:"15 mins ago", score:88, email:"arjun@email.com"   },
  { name:"Sneha Patel",   file:"Sneha_Patel_Portfolio.pdf", time:"1 hour ago",  score:85, email:"sneha@email.com"   },
  { name:"Karthik S",     file:"Karthik_Resume.pdf",        time:"3 hours ago", score:79, email:"karthik@email.com" },
];