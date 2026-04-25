// Mock data + shared types for Rize

export type StepStatus = "locked" | "in-progress" | "completed";
export type StepType = "certification" | "course" | "project" | "assessment";

export interface RoadmapStep {
  id: string;
  title: string;
  type: StepType;
  status: StepStatus;
  xp: number;
  skillTags: string[];
  estTime: string;
  resourceUrl?: string;
  whyItMatters: string;
}

export interface RoadmapPhase {
  id: string;
  name: string;
  tagline: string;
  steps: RoadmapStep[];
}

export interface JobRole {
  id: string;
  title: string;
  emoji: string;
  domain: string;
  salary: string;
  keywords: string[];
}

export const JOB_ROLES: JobRole[] = [
  { id: "swe", title: "Software Engineer", emoji: "💻", domain: "Tech", salary: "₹8–18 LPA", keywords: ["JavaScript", "Data Structures", "System Design", "Git", "React", "APIs"] },
  { id: "data", title: "Data Analyst", emoji: "📊", domain: "Data", salary: "₹6–14 LPA", keywords: ["SQL", "Python", "Excel", "Tableau", "Statistics", "Storytelling"] },
  { id: "pm", title: "Product Manager", emoji: "🚀", domain: "Product", salary: "₹10–24 LPA", keywords: ["Roadmapping", "User Research", "Analytics", "Prioritization", "SQL"] },
  { id: "ux", title: "UI/UX Designer", emoji: "🎨", domain: "Design", salary: "₹5–14 LPA", keywords: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"] },
  { id: "marketing", title: "Marketing Manager", emoji: "📣", domain: "Marketing", salary: "₹5–13 LPA", keywords: ["SEO", "Content", "Analytics", "Brand", "Social Media"] },
  { id: "ds", title: "Machine Learning Engineer", emoji: "🧠", domain: "AI", salary: "₹10–28 LPA", keywords: ["Python", "ML", "Statistics", "SQL", "Deep Learning"] },
  { id: "cyber", title: "Cybersecurity Analyst", emoji: "🛡️", domain: "Security", salary: "₹7–18 LPA", keywords: ["Networks", "Linux", "SIEM", "Pen Testing", "Cryptography"] },
  { id: "ba", title: "Business Analyst", emoji: "📈", domain: "Business", salary: "₹6–16 LPA", keywords: ["SQL", "Excel", "Stakeholders", "Process Mapping"] },
  { id: "cloud", title: "Cloud Architect", emoji: "☁️", domain: "Cloud", salary: "₹14–35 LPA", keywords: ["AWS", "Docker", "K8s", "Linux", "CI/CD"] },
  { id: "devops", title: "DevOps Engineer", emoji: "⚙️", domain: "Cloud", salary: "₹9–22 LPA", keywords: ["Linux", "Docker", "K8s", "CI/CD", "Monitoring"] },
];

export interface QuizQuestion {
  id: string;
  category: "Technical" | "Communication" | "Problem Solving" | "Domain Knowledge" | "Tools & Software";
  question: string;
  options: { label: string; score: number }[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: "q1", category: "Technical", question: "How comfortable are you writing code?", options: [
    { label: "Never written code", score: 0 },
    { label: "Tried tutorials", score: 25 },
    { label: "Built small projects", score: 60 },
    { label: "Confident & shipping", score: 95 },
  ]},
  { id: "q2", category: "Technical", question: "Your understanding of data structures & algorithms?", options: [
    { label: "What's a stack?", score: 0 }, { label: "Basics only", score: 30 }, { label: "Solve mediums", score: 65 }, { label: "Solve hards", score: 95 },
  ]},
  { id: "q3", category: "Tools & Software", question: "Have you used Git/GitHub?", options: [
    { label: "Never", score: 0 }, { label: "Cloned repos", score: 35 }, { label: "Branches & PRs", score: 70 }, { label: "Daily pro user", score: 95 },
  ]},
  { id: "q4", category: "Communication", question: "Presenting in front of a group feels…", options: [
    { label: "Terrifying", score: 10 }, { label: "Manageable", score: 45 }, { label: "Pretty good", score: 75 }, { label: "I love it", score: 95 },
  ]},
  { id: "q5", category: "Problem Solving", question: "When stuck on a hard problem, you…", options: [
    { label: "Give up quickly", score: 10 }, { label: "Ask immediately", score: 40 }, { label: "Try a few angles", score: 75 }, { label: "Decompose & solve", score: 95 },
  ]},
  { id: "q6", category: "Domain Knowledge", question: "How well do you understand your target industry?", options: [
    { label: "Not at all", score: 5 }, { label: "Surface level", score: 35 }, { label: "Read regularly", score: 70 }, { label: "Deep insider", score: 95 },
  ]},
  { id: "q7", category: "Tools & Software", question: "Comfort with spreadsheets & data tools?", options: [
    { label: "Basic sums", score: 20 }, { label: "Pivot tables", score: 55 }, { label: "Advanced formulas", score: 80 }, { label: "Power user", score: 95 },
  ]},
  { id: "q8", category: "Communication", question: "Writing clear emails & docs is…", options: [
    { label: "A struggle", score: 15 }, { label: "Okay", score: 50 }, { label: "A strength", score: 80 }, { label: "My superpower", score: 95 },
  ]},
  { id: "q9", category: "Problem Solving", question: "When learning something new, you…", options: [
    { label: "Wait for a course", score: 25 }, { label: "Watch videos", score: 55 }, { label: "Build to learn", score: 85 }, { label: "Teach others", score: 95 },
  ]},
  { id: "q10", category: "Technical", question: "Familiarity with databases / SQL?", options: [
    { label: "What's SQL?", score: 0 }, { label: "Basic SELECTs", score: 35 }, { label: "Joins & subqueries", score: 70 }, { label: "Optimized queries", score: 95 },
  ]},
];

const swEngineerRoadmap: RoadmapPhase[] = [
  {
    id: "foundation",
    name: "Foundation",
    tagline: "Build your base",
    steps: [
      { id: "f1", title: "Master Git & GitHub", type: "course", status: "completed", xp: 50, skillTags: ["Git", "Collaboration"], estTime: "1 week", whyItMatters: "Every engineering team uses Git daily. You'll collaborate, branch, and review code from day one." },
      { id: "f2", title: "JavaScript Fundamentals", type: "course", status: "completed", xp: 80, skillTags: ["JavaScript", "Programming"], estTime: "3 weeks", whyItMatters: "JavaScript powers the modern web — a non-negotiable foundation for software roles." },
      { id: "f3", title: "Build a Personal Portfolio Site", type: "project", status: "in-progress", xp: 100, skillTags: ["HTML", "CSS", "Deployment"], estTime: "2 weeks", whyItMatters: "Recruiters want to see your work. A live portfolio doubles your callback rate." },
      { id: "f4", title: "Foundations Checkpoint", type: "assessment", status: "locked", xp: 60, skillTags: ["Assessment"], estTime: "30 min", whyItMatters: "Validate that your fundamentals are rock solid before moving to core skills." },
    ],
  },
  {
    id: "core",
    name: "Core Skills",
    tagline: "Become job-shaped",
    steps: [
      { id: "c1", title: "Data Structures & Algorithms", type: "course", status: "locked", xp: 150, skillTags: ["DSA", "Problem Solving"], estTime: "6 weeks", whyItMatters: "DSA is the #1 thing tested in technical interviews at top companies." },
      { id: "c2", title: "React Framework Deep Dive", type: "course", status: "locked", xp: 120, skillTags: ["React", "Frontend"], estTime: "4 weeks", whyItMatters: "React is requested in 70% of frontend job postings — the highest leverage frontend skill." },
      { id: "c3", title: "REST API Project", type: "project", status: "locked", xp: 140, skillTags: ["APIs", "Backend"], estTime: "3 weeks", whyItMatters: "Building APIs proves you understand how software systems actually communicate." },
      { id: "c4", title: "AWS Cloud Practitioner", type: "certification", status: "locked", xp: 200, skillTags: ["AWS", "Cloud"], estTime: "4 weeks", whyItMatters: "Cloud literacy is now a baseline expectation — this cert is recognized everywhere." },
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    tagline: "Stand out from the crowd",
    steps: [
      { id: "a1", title: "System Design Basics", type: "course", status: "locked", xp: 180, skillTags: ["System Design"], estTime: "5 weeks", whyItMatters: "Senior interviews & promotions hinge on system design. Start early to compound." },
      { id: "a2", title: "Full-Stack Capstone Project", type: "project", status: "locked", xp: 250, skillTags: ["Full-Stack"], estTime: "6 weeks", whyItMatters: "A polished capstone is the single strongest signal you can put on your resume." },
      { id: "a3", title: "Open Source Contribution", type: "project", status: "locked", xp: 120, skillTags: ["Collaboration"], estTime: "Ongoing", whyItMatters: "Real-world commits prove you can ship in unfamiliar codebases — what teams hire for." },
    ],
  },
  {
    id: "ready",
    name: "Job Ready",
    tagline: "Land the offer",
    steps: [
      { id: "j1", title: "Mock Interview Series", type: "assessment", status: "locked", xp: 100, skillTags: ["Interview"], estTime: "2 weeks", whyItMatters: "Interviewing is a separate skill. Reps under pressure are the only way to get good." },
      { id: "j2", title: "Resume Polish & ATS Optimize", type: "course", status: "locked", xp: 60, skillTags: ["Resume"], estTime: "3 days", whyItMatters: "Most resumes are filtered by software before a human ever sees them." },
      { id: "j3", title: "Apply to 50 Targeted Roles", type: "project", status: "locked", xp: 150, skillTags: ["Job Search"], estTime: "4 weeks", whyItMatters: "Funnel math: 50 quality applications typically yields 5–8 interviews." },
    ],
  },
];

export const ROADMAPS: Record<string, RoadmapPhase[]> = {
  swe: swEngineerRoadmap,
};

export function getRoadmap(roleId: string): RoadmapPhase[] {
  // Fallback: clone SWE roadmap and rename for unknown roles
  const base = ROADMAPS[roleId] ?? ROADMAPS.swe;
  return base;
}

export interface NewsItem {
  id: string;
  domain: string;
  headline: string;
  source: string;
  readTime: string;
  tag: "Trending" | "Opportunity" | "Skill" | "Salary";
  summary: string;
  whyForYou: string;
}

export const NEWS_ITEMS: NewsItem[] = [
  { id: "n1", domain: "Tech", headline: "AI engineer salaries jump 38% YoY in India", source: "TechCrunch", readTime: "3 min", tag: "Salary", summary: "Demand for engineers who can ship LLM features outpaces supply across startups and enterprises.", whyForYou: "Adding 'LLM' and 'prompt engineering' to your roadmap can unlock a higher salary band." },
  { id: "n2", domain: "Tech", headline: "Top 5 skills hiring managers screen for in 2025", source: "LinkedIn News", readTime: "5 min", tag: "Skill", summary: "System design, AI literacy, cloud, communication, and shipping speed top the list.", whyForYou: "Three of these are already in your roadmap — you're tracking the right things." },
  { id: "n3", domain: "Tech", headline: "Microsoft opens campus hiring for 1,200 SDE roles", source: "Inc42", readTime: "2 min", tag: "Opportunity", summary: "Applications open until end of next month for 2026 graduating batch.", whyForYou: "Your target role aligns. Get your portfolio project shipped this week to apply." },
  { id: "n4", domain: "Tech", headline: "Why React is still the highest-paid frontend skill", source: "Dev.to", readTime: "4 min", tag: "Trending", summary: "Despite framework churn, React job postings continue to dominate frontend listings.", whyForYou: "React is in your Core phase — high ROI to lock in soon." },
];

export interface ProjectRecommendation {
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  roleFit: string;
  skills: string[];
  impact: string;
}

export const PROJECT_RECOMMENDATIONS: Record<string, ProjectRecommendation[]> = {
  swe: [
    { title: "Create a REST API with auth", level: "Intermediate", roleFit: "Backend proof", skills: ["APIs", "Databases", "Auth"], impact: "Shows you can ship production-style services." },
    { title: "Build a campus placement tracker", level: "Intermediate", roleFit: "Full-stack proof", skills: ["React", "SQL", "Deployment"], impact: "Turns your portfolio into a realistic hiring artifact." },
    { title: "Design a URL shortener system", level: "Advanced", roleFit: "System design", skills: ["Caching", "Scaling", "System Design"], impact: "Prepares you for architecture interview rounds." },
  ],
  data: [
    { title: "Build a sales dashboard", level: "Beginner", roleFit: "Analytics proof", skills: ["SQL", "Excel", "Storytelling"], impact: "Proves you can convert raw data into business decisions." },
    { title: "Customer churn analysis", level: "Intermediate", roleFit: "Business insight", skills: ["Python", "Statistics", "Visualization"], impact: "Strong interview story for analytics roles." },
  ],
};

export const INTERVIEW_QUESTIONS = [
  "Tell me about a project where you solved a hard technical problem.",
  "How would you explain your strongest skill to a non-technical recruiter?",
  "What would you learn next to become job-ready faster?",
];

export function roleMatchesFromSkills(clusters: SkillCluster[]) {
  const tech = clusters.find((c) => c.name === "Technical")?.score ?? 30;
  const tools = clusters.find((c) => c.name === "Tools & Software")?.score ?? 30;
  const comm = clusters.find((c) => c.name === "Communication")?.score ?? 30;
  const problem = clusters.find((c) => c.name === "Problem Solving")?.score ?? 30;
  return JOB_ROLES.map((role) => {
    const score = Math.round((
      (role.domain === "Data" ? tools + tech : tech + problem) +
      (role.domain === "Product" || role.domain === "Business" || role.domain === "Marketing" ? comm * 1.4 : comm) +
      Math.min(100, role.keywords.length * 10)
    ) / 3.4);
    return { role, score: Math.min(96, score) };
  }).sort((a, b) => b.score - a.score).slice(0, 4);
}

export interface SkillCluster {
  name: string;
  score: number;
  color: string;
}

export function clusterScoresFromQuiz(answers: Record<string, number>): SkillCluster[] {
  const buckets: Record<string, number[]> = {
    "Technical": [], "Communication": [], "Problem Solving": [], "Domain Knowledge": [], "Tools & Software": [],
  };
  for (const q of QUIZ_QUESTIONS) {
    const v = answers[q.id];
    if (typeof v === "number") buckets[q.category].push(v);
  }
  const palette: Record<string, string> = {
    "Technical": "hsl(var(--primary))",
    "Communication": "hsl(var(--accent))",
    "Problem Solving": "hsl(var(--primary-glow))",
    "Domain Knowledge": "hsl(var(--warning))",
    "Tools & Software": "hsl(var(--success))",
  };
  return Object.entries(buckets).map(([name, arr]) => ({
    name,
    score: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 30,
    color: palette[name],
  }));
}

export function overallScore(clusters: SkillCluster[]): number {
  if (!clusters.length) return 0;
  return Math.round(clusters.reduce((a, c) => a + c.score, 0) / clusters.length);
}
