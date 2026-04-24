import { Link } from "react-router-dom";
import { Bell, Sparkles, Map, FileText, BarChart3, ChevronRight, CheckCircle2, Circle, Newspaper } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScoreRing } from "@/components/ScoreRing";
import { useRize } from "@/lib/store";
import { NEWS_ITEMS } from "@/lib/rize-data";

export default function Home() {
  const profile = useRize((s) => s.profile);
  const role = useRize((s) => s.getRole)();
  const overall = useRize((s) => s.getOverallScore)();
  const roadmap = useRize((s) => s.roadmap);
  const completed = useRize((s) => s.completedSteps);
  const inProgress = useRize((s) => s.inProgressSteps);
  const toggleStep = useRize((s) => s.toggleStep);

  const firstName = (profile?.name?.split(" ")[0]) || "there";

  // Today's todos = first 3 not-completed steps across roadmap
  const todos = roadmap.flatMap((p) => p.steps).filter((s) => !completed.includes(s.id)).slice(0, 3);

  return (
    <AppShell>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-hero" />
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-glow" />

        <header className="relative px-5 pt-6 flex items-center justify-between text-primary-foreground">
          <div>
            <p className="text-xs font-medium text-white/75">Hey {firstName} 👋</p>
            <p className="font-display text-lg font-bold leading-tight">You're {overall}% ready for {role.title}</p>
          </div>
          <button className="h-10 w-10 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center tap-scale" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
        </header>

        <div className="relative px-5 mt-5">
          <div className="bg-card rounded-3xl shadow-elevated p-5 flex items-center gap-5 animate-float-up">
            <ScoreRing value={overall} size={120} strokeWidth={10} label="Skill Score" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{role.emoji} {role.title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-snug">
                Keep going — {Math.max(0, 60 - overall)}% to unlock the AI Resume Builder.
              </p>
              <Link to="/roadmap" className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-primary tap-scale">
                View roadmap <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="px-5 mt-5 grid grid-cols-4 gap-2">
          {[
            { to: "/roadmap", icon: Map, label: "Roadmap" },
            { to: "/resume", icon: FileText, label: "Resume", lock: overall < 60 },
            { to: "/skills", icon: BarChart3, label: "Skills" },
            { to: "/profile", icon: Sparkles, label: "Profile" },
          ].map((q) => (
            <Link key={q.to} to={q.to} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-card border border-border shadow-card tap-scale">
              <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
                <q.icon className="h-4 w-4" />
              </span>
              <span className="text-[11px] font-medium">{q.label}</span>
              {q.lock && <span className="text-[9px] text-muted-foreground">🔒 60%</span>}
            </Link>
          ))}
        </div>

        {/* Today's to-dos */}
        <section className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Today's to-do</h2>
            <span className="text-xs text-muted-foreground">{completed.length} done · {inProgress.length} active</span>
          </div>
          <div className="space-y-2.5">
            {todos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm bg-card rounded-2xl border border-dashed border-border">
                🎉 You're all caught up!
              </div>
            )}
            {todos.map((s) => {
              const isProg = inProgress.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleStep(s.id)}
                  className="w-full text-left p-4 rounded-2xl bg-card border border-border shadow-card flex items-center gap-3 tap-scale hover:border-primary/40 transition-base"
                >
                  {isProg ? (
                    <Circle className="h-5 w-5 text-primary fill-primary/15" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">{s.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 capitalize">{s.type} · {s.estTime} · +{s.xp} XP</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground/40" />
                </button>
              );
            })}
          </div>
        </section>

        {/* News feed */}
        <section className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-accent" /> For you
            </h2>
            <span className="text-xs font-medium text-primary">See all</span>
          </div>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-2">
            {NEWS_ITEMS.map((n) => (
              <article key={n.id} className="min-w-[260px] max-w-[260px] bg-gradient-card border border-border rounded-2xl p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent">{n.tag}</span>
                  <span className="text-[10px] text-muted-foreground">{n.readTime}</span>
                </div>
                <h3 className="font-display font-bold text-sm leading-snug line-clamp-3">{n.headline}</h3>
                <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{n.summary}</p>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[10px] font-semibold text-primary mb-1">✨ Why this matters for you</p>
                  <p className="text-[11px] text-foreground/80 leading-snug">{n.whyForYou}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
