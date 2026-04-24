import { useState } from "react";
import { CheckCircle2, Circle, Lock, Award, BookOpen, Hammer, ClipboardCheck, X, Sparkles, ExternalLink, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useRize } from "@/lib/store";
import type { RoadmapStep, StepType } from "@/lib/rize-data";

const TYPE_META: Record<StepType, { icon: typeof Award; label: string; color: string }> = {
  certification: { icon: Award, label: "Certification", color: "text-warning" },
  course: { icon: BookOpen, label: "Course", color: "text-primary" },
  project: { icon: Hammer, label: "Project", color: "text-accent" },
  assessment: { icon: ClipboardCheck, label: "Assessment", color: "text-primary-glow" },
};

export default function Roadmap() {
  const role = useRize((s) => s.getRole)();
  const phases = useRize((s) => s.roadmap);
  const completed = useRize((s) => s.completedSteps);
  const inProgress = useRize((s) => s.inProgressSteps);
  const toggleStep = useRize((s) => s.toggleStep);
  const startStep = useRize((s) => s.startStep);
  const [active, setActive] = useState<RoadmapStep | null>(null);

  const status = (s: RoadmapStep) =>
    completed.includes(s.id) ? "completed" : inProgress.includes(s.id) ? "in-progress" : s.status;

  const totalSteps = phases.flatMap((p) => p.steps).length;
  const totalXp = phases.flatMap((p) => p.steps).filter((s) => completed.includes(s.id)).reduce((a, s) => a + s.xp, 0);

  return (
    <AppShell>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-hero" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-glow" />

        <header className="relative px-5 pt-6 pb-5 text-primary-foreground">
          <p className="text-xs font-medium text-white/75">Your roadmap to</p>
          <h1 className="font-display text-2xl font-bold">{role.emoji} {role.title}</h1>
          <div className="mt-3 flex gap-2">
            <div className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> {completed.length}/{totalSteps} steps
            </div>
            <div className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> {totalXp} XP
            </div>
          </div>
        </header>

        <div className="relative px-5 space-y-6 pt-2">
          {phases.map((phase, pIdx) => (
            <section key={phase.id} className="animate-float-up" style={{ animationDelay: `${pIdx * 60}ms` }}>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-display text-xs font-bold text-primary">PHASE {pIdx + 1}</span>
                <h2 className="font-display font-bold text-lg">{phase.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground -mt-2 mb-3">{phase.tagline}</p>

              <div className="relative">
                <div className="absolute left-[22px] top-2 bottom-2 w-px bg-border" />
                <ul className="space-y-3">
                  {phase.steps.map((step) => {
                    const st = status(step);
                    const meta = TYPE_META[step.type];
                    const Icon = meta.icon;
                    const isLocked = st === "locked";
                    return (
                      <li key={step.id}>
                        <button
                          onClick={() => setActive(step)}
                          className={`w-full text-left flex gap-3 items-start p-3 rounded-2xl border bg-card transition-base tap-scale ${
                            st === "completed" ? "border-accent/40 bg-accent-soft/30" :
                            st === "in-progress" ? "border-primary/40 shadow-glow" :
                            "border-border"
                          } ${isLocked ? "opacity-60" : "hover:border-primary/40"}`}
                        >
                          <div className="relative z-10 flex-shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center bg-card border-2"
                               style={{ borderColor: st === "completed" ? "hsl(var(--accent))" : st === "in-progress" ? "hsl(var(--primary))" : "hsl(var(--border))" }}>
                            {st === "completed" ? (
                              <CheckCircle2 className="h-5 w-5 text-accent" />
                            ) : st === "locked" ? (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            ) : st === "in-progress" ? (
                              <Circle className="h-5 w-5 text-primary fill-primary/20 animate-pulse" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <Icon className={`h-3 w-3 ${meta.color}`} />
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{meta.label}</span>
                            </div>
                            <p className="font-semibold text-sm mt-0.5 leading-tight">{step.title}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">+{step.xp} XP</span>
                              <span className="text-[10px] font-medium text-muted-foreground">⏱ {step.estTime}</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* Step detail sheet */}
      {active && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-in fade-in" onClick={() => setActive(null)}>
          <div
            className="w-full max-w-[480px] bg-card rounded-t-3xl p-6 pb-8 animate-in slide-in-from-bottom shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{TYPE_META[active.type].label}</span>
                <h3 className="font-display text-xl font-bold mt-1 leading-tight">{active.title}</h3>
              </div>
              <button onClick={() => setActive(null)} className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center tap-scale" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-gradient-card border border-border p-4">
              <div className="flex items-center gap-1.5 text-primary mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Why this matters</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{active.whyItMatters}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">+{active.xp} XP</span>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground">⏱ {active.estTime}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {active.skillTags.map((t) => (
                <span key={t} className="text-[10px] font-medium px-2 py-1 rounded-full bg-accent-soft text-accent">{t}</span>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              {!completed.includes(active.id) && !inProgress.includes(active.id) && status(active) !== "locked" && (
                <button
                  onClick={() => { startStep(active.id); setActive(null); }}
                  className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow tap-scale"
                >
                  Start this step
                </button>
              )}
              <button
                onClick={() => { toggleStep(active.id); setActive(null); }}
                className="w-full h-12 rounded-full bg-accent text-accent-foreground font-semibold tap-scale"
              >
                {completed.includes(active.id) ? "Mark as not done" : "Mark as completed"}
              </button>
              {active.resourceUrl && (
                <a href={active.resourceUrl} target="_blank" rel="noreferrer" className="w-full h-12 rounded-full border border-border flex items-center justify-center gap-2 font-medium text-sm tap-scale">
                  Open resource <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
