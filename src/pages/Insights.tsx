import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { NEWS_ITEMS } from "@/lib/rize-data";
import { useRize } from "@/lib/store";
import { Bookmark, Flame, Newspaper, TrendingUp } from "lucide-react";

const filters = ["All", "Domain", "Trending", "Jobs", "Skills"];

export default function Insights() {
  const role = useRize((s) => s.getRole)();
  const [filter, setFilter] = useState("All");
  const items = NEWS_ITEMS.filter((item) => filter === "All" || item.tag === filter.replace("Jobs", "Opportunity").replace("Skills", "Skill") || item.domain === role.domain);

  return (
    <AppShell>
      <div className="px-5 lg:px-0 pt-6 lg:pt-8 animate-float-up">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Career insights</p>
            <h1 className="font-display text-3xl font-bold">What is moving in {role.domain}</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">AI-curated trends, salary signals, and skill demand for students targeting {role.title}.</p>
          </div>
          <div className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-accent">Fresh mock AI session</div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto hide-scrollbar">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`h-10 rounded-full px-4 text-sm font-semibold transition-base ${filter === f ? "bg-gradient-primary text-primary-foreground shadow-glow" : "border border-border bg-card text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <section className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-card transition-base hover:-translate-y-0.5 hover:border-primary/40">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Newspaper className="h-4 w-4 text-accent" /> {item.source} · {item.readTime}</span>
                  <button className="h-9 w-9 rounded-full border border-border text-muted-foreground hover:text-primary transition-base" aria-label="Bookmark"><Bookmark className="mx-auto h-4 w-4" /></button>
                </div>
                <h2 className="mt-4 font-display text-lg font-bold leading-tight">{item.headline}</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
                <div className="mt-4 rounded-xl border border-border bg-secondary p-3">
                  <p className="text-xs font-bold text-primary">Why this matters for you</p>
                  <p className="mt-1 text-sm text-foreground/85 leading-relaxed">{item.whyForYou}</p>
                </div>
                <span className="mt-4 inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{item.tag}</span>
              </article>
            ))}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
              <h2 className="font-display font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-warning" /> Salary trends</h2>
              {["Entry", "Associate", "Mid", "Senior"].map((label, i) => (
                <div key={label} className="mt-4">
                  <div className="flex justify-between text-xs"><span>{label}</span><span className="text-muted-foreground">{6 + i * 5} LPA</span></div>
                  <div className="mt-1 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-primary" style={{ width: `${35 + i * 18}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <h2 className="font-display font-bold flex items-center gap-2"><Flame className="h-4 w-4 text-accent" /> Hot skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.keywords.slice(0, 5).map((skill) => <span key={skill} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold">{skill}</span>)}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
