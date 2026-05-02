import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Circle, ArrowRight } from "lucide-react";

const filters = ["All", "Technical", "Product", "Design", "Data", "Career"] as const;

const mentors = [
  {
    name: "Priya Sharma", initials: "PS", role: "SDE-2", company: "Google",
    skills: ["DSA", "System Design", "React"], match: 94, category: "Technical",
    bio: "Cracked Google SDE-2 after 3 attempts — loves helping others avoid her mistakes.",
    available: true, color: "bg-primary",
  },
  {
    name: "Rahul Verma", initials: "RV", role: "ML Engineer", company: "Microsoft",
    skills: ["Python", "ML", "Statistics"], match: 87, category: "Data",
    bio: "Published 4 papers, built production ML pipelines serving 50M+ users.",
    available: true, color: "bg-accent",
  },
  {
    name: "Ananya Iyer", initials: "AI", role: "Product Manager", company: "Swiggy",
    skills: ["Product Strategy", "SQL", "Analytics"], match: 78, category: "Product",
    bio: "Transitioned from engineering to PM — can guide you through the switch.",
    available: false, color: "bg-warning",
  },
  {
    name: "Karan Mehta", initials: "KM", role: "DevOps Engineer", company: "Zomato",
    skills: ["AWS", "Docker", "CI/CD"], match: 72, category: "Technical",
    bio: "Automated deployments for 200+ microservices, AWS certified x3.",
    available: true, color: "bg-destructive",
  },
  {
    name: "Sneha Patel", initials: "SP", role: "Data Scientist", company: "Paytm",
    skills: ["Python", "Tableau", "ML"], match: 85, category: "Data",
    bio: "Built fraud detection models saving ₹200Cr+ annually.",
    available: false, color: "bg-primary",
  },
  {
    name: "Arjun Nair", initials: "AN", role: "Full Stack Developer", company: "Razorpay",
    skills: ["Node.js", "React", "MongoDB"], match: 91, category: "Technical",
    bio: "Open-source contributor, built payment infra handling 1B+ transactions.",
    available: true, color: "bg-accent",
  },
];

const steps = [
  { title: "We analyze your skill gaps", desc: "Your quiz results and profile data reveal exactly where you need to improve." },
  { title: "We find mentors who mastered those exact skills", desc: "Our algorithm matches mentors who've successfully bridged similar gaps." },
  { title: "You get ranked matches with availability", desc: "See your best-fit mentors first, with real-time availability status." },
];

export default function Mentors() {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All" ? mentors : mentors.filter((m) => m.category === filter);

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-10">
        <h1 className="font-display text-2xl font-bold">Find Your Mentor</h1>
        <p className="text-sm text-muted-foreground mt-1">Matched to your skill gaps and target role</p>

        {/* Filter bar */}
        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold border transition-base tap-scale",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Mentor grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((m) => {
            const matchColor = m.match >= 80 ? "text-accent bg-accent/15" : "text-warning bg-warning/15";
            return (
              <div key={m.name} className="relative bg-card border border-border rounded-2xl p-5 shadow-card transition-base hover:border-primary/30">
                {/* Match badge */}
                <span className={cn("absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full", matchColor)}>
                  {m.match}% Match
                </span>

                <div className="flex items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground", m.color)}>
                    {m.initials}
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role} at {m.company}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-muted-foreground border border-border">
                      {s}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{m.bio}</p>

                <div className="flex items-center gap-1.5 mt-3">
                  <Circle className={cn("h-2.5 w-2.5 fill-current", m.available ? "text-accent" : "text-muted-foreground")} />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {m.available ? "Available this week" : "Busy"}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 text-xs rounded-xl">View Profile</Button>
                  <Button size="sm" className="flex-1 text-xs rounded-xl">Request Session</Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* How matching works */}
        <section className="mt-10">
          <h2 className="font-display font-bold text-lg mb-4">How matching works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {steps.map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 shadow-card relative">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-bold mb-3">
                  {i + 1}
                </div>
                <h3 className="font-display font-bold text-sm">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.desc}</p>
                {i < 2 && (
                  <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
