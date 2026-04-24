import { AppShell } from "@/components/AppShell";
import { useRize } from "@/lib/store";
import { ScoreRing } from "@/components/ScoreRing";
import { Award, Target, CheckCircle2 } from "lucide-react";

export default function Skills() {
  const role = useRize((s) => s.getRole)();
  const clusters = useRize((s) => s.getClusters)();
  const overall = useRize((s) => s.getOverallScore)();
  const completed = useRize((s) => s.completedSteps);

  // Build a simple radar polygon from cluster scores
  const size = 240;
  const center = size / 2;
  const radius = 90;
  const angle = (i: number) => (Math.PI * 2 * i) / clusters.length - Math.PI / 2;
  const point = (score: number, i: number) => {
    const r = (score / 100) * radius;
    return [center + r * Math.cos(angle(i)), center + r * Math.sin(angle(i))];
  };
  const polygonPoints = clusters.map((c, i) => point(c.score, i).join(",")).join(" ");
  const ringSteps = [0.25, 0.5, 0.75, 1];

  const badges = [
    { id: "starter", name: "First Step", earned: completed.length >= 1, icon: "🌱" },
    { id: "streak", name: "On a Roll", earned: completed.length >= 3, icon: "🔥" },
    { id: "foundation", name: "Foundation", earned: completed.length >= 4, icon: "🧱" },
    { id: "halfway", name: "Halfway Hero", earned: overall >= 50, icon: "⚡" },
    { id: "ats", name: "ATS Ready", earned: overall >= 70, icon: "📝" },
    { id: "champion", name: "Champion", earned: overall >= 85, icon: "🏆" },
  ];

  return (
    <AppShell>
      <div className="px-5 pt-6">
        <h1 className="font-display text-2xl font-bold">Skill Dashboard</h1>
        <p className="text-sm text-muted-foreground">Targeting <span className="font-semibold text-foreground">{role.title}</span></p>

        <div className="mt-5 bg-gradient-card border border-border rounded-3xl p-5 shadow-card flex flex-col items-center animate-float-up">
          <ScoreRing value={overall} size={140} strokeWidth={12} label="Overall match" />
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-accent-soft text-accent px-3 py-1.5 rounded-full">
            <Target className="h-3 w-3" /> Need {Math.max(0, 80 - overall)}% more for 80% match
          </div>
        </div>

        {/* Radar chart */}
        <section className="mt-6 bg-card border border-border rounded-3xl p-5 shadow-card">
          <h2 className="font-display font-bold">Skill clusters</h2>
          <div className="flex justify-center mt-2">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {ringSteps.map((r, i) => (
                <polygon
                  key={i}
                  fill="none" stroke="hsl(var(--border))" strokeWidth={1}
                  points={clusters.map((_, idx) => {
                    const x = center + (radius * r) * Math.cos(angle(idx));
                    const y = center + (radius * r) * Math.sin(angle(idx));
                    return `${x},${y}`;
                  }).join(" ")}
                />
              ))}
              {clusters.map((_, i) => {
                const [x, y] = point(100, i);
                return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="hsl(var(--border))" strokeWidth={1} />;
              })}
              <polygon points={polygonPoints} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth={2} strokeLinejoin="round" />
              {clusters.map((c, i) => {
                const [x, y] = point(100, i);
                const lx = center + (radius + 18) * Math.cos(angle(i));
                const ly = center + (radius + 18) * Math.sin(angle(i));
                return (
                  <g key={c.name}>
                    <circle cx={point(c.score, i)[0]} cy={point(c.score, i)[1]} r={3.5} fill="hsl(var(--primary))" />
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                          className="fill-muted-foreground" style={{ fontSize: 9, fontWeight: 600 }}>
                      {c.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-4 space-y-3">
            {clusters.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold">{c.name}</span>
                  <span className="text-xs font-bold tabular-nums text-muted-foreground">{c.score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full transition-all duration-700" style={{ width: `${c.score}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Keywords */}
        <section className="mt-6">
          <h2 className="font-display font-bold mb-3">ATS keywords for {role.title}</h2>
          <div className="flex flex-wrap gap-2">
            {role.keywords.map((k, i) => {
              const got = i < Math.floor((overall / 100) * role.keywords.length);
              return (
                <span key={k} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  got ? "bg-accent-soft text-accent border-accent/30" : "bg-card text-muted-foreground border-border"
                }`}>
                  {got && <CheckCircle2 className="h-3 w-3" />} {k}
                </span>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        <section className="mt-7 mb-6">
          <h2 className="font-display font-bold mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-warning" /> Badges
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-center p-2 border transition-base ${
                b.earned ? "bg-gradient-card border-primary/30 shadow-card" : "bg-muted/40 border-dashed border-border opacity-60"
              }`}>
                <span className={`text-3xl ${b.earned ? "" : "grayscale"}`}>{b.icon}</span>
                <span className="text-[10px] font-semibold mt-1 leading-tight">{b.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
