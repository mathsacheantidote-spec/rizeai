import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { INTERVIEW_QUESTIONS, PROJECT_RECOMMENDATIONS, roleMatchesFromSkills } from "@/lib/rize-data";
import { useRize } from "@/lib/store";
import { Brain, Briefcase, GitBranch, MapPinned, Mic, Play, TrendingUp } from "lucide-react";

export default function CareerEngine() {
  const role = useRize((s) => s.getRole)();
  const clusters = useRize((s) => s.getClusters)();
  const overall = useRize((s) => s.getOverallScore)();
  const [simulation, setSimulation] = useState("React project");
  const matches = useMemo(() => roleMatchesFromSkills(clusters), [clusters]);
  const projects = PROJECT_RECOMMENDATIONS[role.id] ?? PROJECT_RECOMMENDATIONS.swe;
  const boost = simulation.includes("internship") ? 30 : simulation.includes("SQL") ? 18 : 20;

  return (
    <AppShell>
      <div className="px-5 lg:px-0 pt-6 lg:pt-8 animate-float-up">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Decision engine</p>
        <h1 className="font-display text-3xl font-bold">From skills to job decisions</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Every widget answers one question: how does this student get closer to a real job?</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display font-bold flex items-center gap-2"><Brain className="h-4 w-4 text-primary" /> Best-fit roles</h2>
            <div className="mt-4 space-y-3">
              {matches.map(({ role: match, score }) => (
                <div key={match.id} className="rounded-xl border border-border bg-secondary p-3">
                  <div className="flex items-center justify-between"><span className="font-semibold">{match.emoji} {match.title}</span><span className="text-sm font-bold text-accent">{score}%</span></div>
                  <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-primary" style={{ width: `${score}%` }} /></div>
                  <p className="mt-2 text-xs text-muted-foreground">Signal: {match.keywords.slice(0, 3).join(" · ")}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-gradient-card p-5 shadow-card">
            <h2 className="font-display font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> Career simulation</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["React project", "SQL sprint", "internship"].map((item) => <button key={item} onClick={() => setSimulation(item)} className={`rounded-full px-3 py-2 text-xs font-semibold transition-base ${simulation === item ? "bg-gradient-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground"}`}>{item}</button>)}
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-center">
              <p className="text-sm text-muted-foreground">If you add</p>
              <p className="mt-1 font-display text-xl font-bold">{simulation}</p>
              <p className="mt-3 text-3xl font-bold text-accent">+{boost}%</p>
              <p className="text-sm text-muted-foreground">projected match lift · {overall}% → {Math.min(99, overall + boost)}%</p>
            </div>
          </section>
        </div>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-display font-bold flex items-center gap-2"><Briefcase className="h-4 w-4 text-warning" /> Project recommendations</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {projects.map((project) => (
              <article key={project.title} className="rounded-xl border border-border bg-secondary p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{project.level} · {project.roleFit}</span>
                <h3 className="mt-2 font-display font-bold leading-tight">{project.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{project.impact}</p>
                <div className="mt-3 flex flex-wrap gap-1">{project.skills.map((s) => <span key={s} className="rounded-full bg-accent-soft px-2 py-1 text-[10px] font-semibold text-accent">{s}</span>)}</div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display font-bold flex items-center gap-2"><MapPinned className="h-4 w-4 text-primary" /> Career path visualizer</h2>
            <div className="mt-5 flex items-center justify-between gap-2 text-center text-xs font-semibold">
              {["Current skills", "Close gaps", "Ship projects", "Interview ready", role.title].map((step, i) => <div key={step} className="flex flex-1 flex-col items-center gap-2"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground">{i + 1}</span><span>{step}</span></div>)}
            </div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h2 className="font-display font-bold flex items-center gap-2"><Mic className="h-4 w-4 text-accent" /> Mock interview</h2>
            <div className="mt-4 space-y-2">{INTERVIEW_QUESTIONS.map((q) => <div key={q} className="flex items-start gap-3 rounded-xl bg-secondary p-3"><Play className="mt-0.5 h-4 w-4 text-primary" /><p className="text-sm">{q}</p></div>)}</div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
