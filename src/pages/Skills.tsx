import { AppShell } from "@/components/AppShell";
import { useRize } from "@/lib/store";
import { ScoreRing } from "@/components/ScoreRing";
import { Award, Target, CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend,
} from "recharts";

const skillAxes = [
  { axis: "DSA & Problem Solving", you: 65, required: 85, tip: "Focus on Tree and Graph problems on LeetCode" },
  { axis: "Web Development", you: 70, required: 90, tip: "Build 2-3 full-stack projects with React + Node.js" },
  { axis: "System Design", you: 35, required: 80, tip: "Watch Gaurav Sen's playlist and practice HLD questions" },
  { axis: "Tools & DevOps", you: 50, required: 75, tip: "Get hands-on with Docker, Git workflows, and CI/CD pipelines" },
  { axis: "Soft Skills", you: 75, required: 80, tip: "Practice mock interviews on Pramp or InterviewBit" },
  { axis: "Domain Knowledge", you: 60, required: 70, tip: "Read NPTEL notes and build domain-specific side projects" },
];

function gapColor(you: number, req: number) {
  const gap = req - you;
  if (gap <= 0) return "bg-accent";
  if (gap <= 20) return "bg-warning";
  return "bg-destructive";
}

function gapLabel(you: number, req: number) {
  const gap = req - you;
  if (gap <= 0) return "text-accent";
  if (gap <= 20) return "text-warning";
  return "text-destructive";
}

export default function Skills() {
  const role = useRize((s) => s.getRole)();
  const clusters = useRize((s) => s.getClusters)();
  const overall = useRize((s) => s.getOverallScore)();
  const completed = useRize((s) => s.completedSteps);

  const employability = 67;

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
      <div className="px-5 pt-6 pb-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Your Skill Map</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compared against your target role: <span className="font-semibold text-foreground">{role.title}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-xs rounded-xl gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Retake Assessment
          </Button>
        </div>

        {/* Radar Chart */}
        <section className="mt-6 bg-card border border-border rounded-3xl p-5 shadow-card">
          <div className="w-full" style={{ height: 340 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillAxes} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke="hsl(240 16% 20%)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "hsl(240 16% 58%)", fontSize: 10, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Required for Software Engineer"
                  dataKey="required"
                  stroke="hsl(164 95% 43%)"
                  fill="hsl(164 95% 43%)"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                />
                <Radar
                  name="Your Current Level"
                  dataKey="you"
                  stroke="hsl(262 83% 58%)"
                  fill="hsl(262 83% 58%)"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Gap Analysis */}
        <section className="mt-6">
          <h2 className="font-display font-bold text-lg mb-4">Skill Gap Analysis</h2>
          <div className="space-y-3">
            {skillAxes.map((s) => {
              const gap = s.required - s.you;
              return (
                <div key={s.axis} className="bg-card border border-border rounded-2xl p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{s.axis}</span>
                    <span className={`text-xs font-bold ${gapLabel(s.you, s.required)}`}>
                      {s.you}% / {s.required}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${gapColor(s.you, s.required)}`}
                      style={{ width: `${Math.min(100, (s.you / s.required) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">{s.tip}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Employability Score */}
        <section className="mt-8 bg-card border border-border rounded-3xl p-6 shadow-card flex flex-col items-center">
          <ScoreRing value={employability} size={160} strokeWidth={14} label="Employability Score" />
          <p className="text-sm text-muted-foreground text-center mt-4 max-w-md">
            Strong foundation — bridge your <span className="font-semibold text-foreground">System Design</span> gap to unlock your resume
          </p>
        </section>

        {/* Overall match */}
        <div className="mt-6 bg-gradient-card border border-border rounded-3xl p-5 shadow-card flex flex-col items-center animate-float-up">
          <ScoreRing value={overall} size={140} strokeWidth={12} label="Overall match" />
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold bg-accent/15 text-accent px-3 py-1.5 rounded-full">
            <Target className="h-3 w-3" /> Need {Math.max(0, 80 - overall)}% more for 80% match
          </div>
        </div>

        {/* ATS Keywords */}
        <section className="mt-6">
          <h2 className="font-display font-bold mb-3">ATS keywords for {role.title}</h2>
          <div className="flex flex-wrap gap-2">
            {role.keywords.map((k, i) => {
              const got = i < Math.floor((overall / 100) * role.keywords.length);
              return (
                <span key={k} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  got ? "bg-accent/15 text-accent border-accent/30" : "bg-card text-muted-foreground border-border"
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
