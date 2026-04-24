import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ScoreRing } from "@/components/ScoreRing";
import { Button } from "@/components/ui/button";
import { useRize } from "@/lib/store";

export default function GapReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const finishOnboarding = useRize((s) => s.finishOnboarding);
  const role = useRize((s) => s.getRole)();
  const clusters = useRize((s) => s.getClusters)();
  const overall = useRize((s) => s.getOverallScore)();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <AppShell hideNav>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-hero text-primary-foreground">
          <div className="relative mb-6">
            <div className="absolute inset-0 -m-6 bg-white/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative h-20 w-20 rounded-full bg-white/15 backdrop-blur flex items-center justify-center border border-white/30">
              <Sparkles className="h-10 w-10 animate-pulse" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold">AI is mapping your skills…</h2>
          <p className="text-white/80 mt-2 text-sm max-w-xs">Analyzing your answers against {role.title} requirements.</p>
        </div>
      </AppShell>
    );
  }

  const gaps = clusters.filter((c) => c.score < 60).slice(0, 3);

  return (
    <AppShell hideNav>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-hero" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-glow" />

        <div className="relative px-6 pt-10 pb-8 text-primary-foreground text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
            <Sparkles className="h-3 w-3" /> Your Skill Gap Report
          </span>
          <h1 className="font-display text-2xl font-bold mt-3">You're <span className="italic">{overall}%</span> ready for</h1>
          <p className="font-display text-3xl font-bold">{role.emoji} {role.title}</p>
        </div>

        <div className="relative mx-6 -mt-2">
          <div className="bg-card rounded-3xl p-6 shadow-elevated flex flex-col items-center animate-float-up">
            <ScoreRing value={overall} label="Match Score" sublabel="vs target role" />
            <p className="text-center text-sm text-muted-foreground mt-4 max-w-xs">
              {overall >= 70 ? "Strong start! Polish a few areas and you're job-ready." : overall >= 40 ? "Solid foundation. Your roadmap will close the key gaps." : "Plenty of runway — your personalized roadmap starts now."}
            </p>
          </div>
        </div>

        <div className="px-6 mt-6 space-y-3">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Priority gaps
          </h3>
          {gaps.length === 0 && (
            <div className="bg-accent-soft text-accent rounded-2xl p-4 text-sm font-medium">
              🎉 No major gaps detected — keep building depth.
            </div>
          )}
          {gaps.map((g) => (
            <div key={g.name} className="bg-card border border-border rounded-2xl p-4 shadow-card">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm">{g.name}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color: g.color }}>{g.score}%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full transition-all duration-700" style={{ width: `${g.score}%`, background: g.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 mt-6">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" /> Top ATS keywords for you
          </h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {role.keywords.map((k) => (
              <span key={k} className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">{k}</span>
            ))}
          </div>
        </div>

        <div className="px-6 mt-8 pb-10">
          <Button
            onClick={() => { finishOnboarding(); navigate("/home"); }}
            className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow"
          >
            See my roadmap →
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
