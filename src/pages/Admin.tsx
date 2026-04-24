import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Users, TrendingUp, AlertTriangle, Trophy, Building2, FileDown, ArrowLeft, GraduationCap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { JOB_ROLES } from "@/lib/rize-data";

interface Student {
  id: string;
  name: string;
  email: string;
  program: string;
  year: string;
  targetRoleId: string;
  skillScore: number;
  stepsCompleted: number;
  startedRoadmap: boolean;
  clusters: { name: string; score: number }[];
}

const CLUSTERS = ["Technical", "Communication", "Problem Solving", "Domain Knowledge", "Tools & Software"];

// Seeded mock cohort — 24 students across roles & completion stages
const STUDENTS: Student[] = [
  ["Aarav Sharma", "aarav.s@iitb.ac.in", "B.Tech CSE", "3rd", "swe", 82, 11, true],
  ["Priya Iyer", "priya.iyer@iitb.ac.in", "B.Tech CSE", "3rd", "data", 74, 9, true],
  ["Rohan Mehta", "rohan.m@iitb.ac.in", "B.Tech ECE", "2nd", "swe", 41, 4, true],
  ["Ishita Kapoor", "ishita.k@iitb.ac.in", "BBA", "3rd", "pm", 67, 7, true],
  ["Vikram Reddy", "vikram.r@iitb.ac.in", "B.Tech CSE", "4th", "ai", 88, 13, true],
  ["Sneha Joshi", "sneha.j@iitb.ac.in", "B.Des", "3rd", "ux", 71, 8, true],
  ["Arjun Patel", "arjun.p@iitb.ac.in", "B.Tech IT", "2nd", "swe", 28, 2, true],
  ["Kavya Nair", "kavya.n@iitb.ac.in", "B.Sc Data Sci", "3rd", "ds", 79, 10, true],
  ["Aditya Singh", "aditya.s@iitb.ac.in", "B.Tech CSE", "4th", "cloud", 85, 12, true],
  ["Meera Gupta", "meera.g@iitb.ac.in", "BBA", "2nd", "marketing", 52, 5, true],
  ["Karan Desai", "karan.d@iitb.ac.in", "B.Tech ECE", "3rd", "cyber", 44, 4, true],
  ["Riya Bansal", "riya.b@iitb.ac.in", "B.Sc Eco", "2nd", "ba", 38, 3, false],
  ["Devansh Rao", "devansh.r@iitb.ac.in", "B.Tech CSE", "3rd", "swe", 61, 7, true],
  ["Tara Menon", "tara.m@iitb.ac.in", "B.Des", "4th", "ux", 84, 12, true],
  ["Yash Agarwal", "yash.a@iitb.ac.in", "B.Tech IT", "3rd", "data", 56, 6, true],
  ["Ananya Pillai", "ananya.p@iitb.ac.in", "B.Sc Data Sci", "4th", "ai", 92, 14, true],
  ["Siddharth Jain", "sid.j@iitb.ac.in", "B.Tech CSE", "2nd", "swe", 22, 1, false],
  ["Pooja Verma", "pooja.v@iitb.ac.in", "BBA", "3rd", "pm", 58, 6, true],
  ["Nikhil Shah", "nikhil.s@iitb.ac.in", "B.Tech ECE", "4th", "cloud", 73, 9, true],
  ["Diya Krishnan", "diya.k@iitb.ac.in", "B.Tech CSE", "3rd", "ds", 65, 7, true],
  ["Aryan Malhotra", "aryan.m@iitb.ac.in", "B.Tech IT", "2nd", "cyber", 31, 2, false],
  ["Saanvi Rao", "saanvi.r@iitb.ac.in", "B.Des", "2nd", "ux", 47, 4, true],
  ["Kabir Sethi", "kabir.s@iitb.ac.in", "B.Tech CSE", "4th", "ai", 80, 11, true],
  ["Nisha Bhatt", "nisha.b@iitb.ac.in", "BBA", "3rd", "marketing", 35, 3, false],
].map(([name, email, program, year, targetRoleId, skillScore, stepsCompleted, startedRoadmap], i) => {
  // Pseudo-random but stable cluster scores anchored on overall score
  const base = skillScore as number;
  const seed = (i + 1) * 7;
  const clusters = CLUSTERS.map((name, j) => ({
    name,
    score: Math.max(10, Math.min(100, base + ((seed * (j + 1)) % 30) - 15)),
  }));
  return {
    id: `s${i + 1}`,
    name: name as string,
    email: email as string,
    program: program as string,
    year: year as string,
    targetRoleId: targetRoleId as string,
    skillScore: skillScore as number,
    stepsCompleted: stepsCompleted as number,
    startedRoadmap: startedRoadmap as boolean,
    clusters,
  };
});

export default function Admin() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STUDENTS.filter((s) => {
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.program.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || s.targetRoleId === roleFilter;
      return matchQ && matchRole;
    });
  }, [query, roleFilter]);

  const stats = useMemo(() => {
    const total = STUDENTS.length;
    const avg = Math.round(STUDENTS.reduce((a, s) => a + s.skillScore, 0) / total);
    const placementReady = STUDENTS.filter((s) => s.skillScore >= 70).length;
    const notStarted = STUDENTS.filter((s) => !s.startedRoadmap).length;
    return {
      total,
      avg,
      placementReady,
      placementPct: Math.round((placementReady / total) * 100),
      notStarted,
      notStartedPct: Math.round((notStarted / total) * 100),
    };
  }, []);

  // Cohort cluster averages for heatmap
  const clusterAverages = useMemo(() => {
    return CLUSTERS.map((name) => {
      const scores = STUDENTS.map((s) => s.clusters.find((c) => c.name === name)?.score ?? 0);
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      return { name, avg };
    });
  }, []);

  const roleDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    STUDENTS.forEach((s) => counts.set(s.targetRoleId, (counts.get(s.targetRoleId) ?? 0) + 1));
    return JOB_ROLES.filter((r) => counts.has(r.id)).map((r) => ({
      role: r,
      count: counts.get(r.id) ?? 0,
      pct: Math.round(((counts.get(r.id) ?? 0) / STUDENTS.length) * 100),
    })).sort((a, b) => b.count - a.count);
  }, []);

  const leaderboard = useMemo(
    () => [...STUDENTS].sort((a, b) => b.skillScore - a.skillScore).slice(0, 5),
    []
  );

  const exportCsv = () => {
    const header = "Name,Email,Program,Year,Target Role,Skill Score,Steps Completed,Started\n";
    const rows = filtered.map((s) => {
      const role = JOB_ROLES.find((r) => r.id === s.targetRoleId)?.title ?? "—";
      return [s.name, s.email, s.program, s.year, role, s.skillScore, s.stepsCompleted, s.startedRoadmap ? "Yes" : "No"]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cohort_skill_report_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const heatColor = (score: number) => {
    if (score >= 75) return "bg-accent text-accent-foreground";
    if (score >= 55) return "bg-warning/80 text-foreground";
    if (score >= 40) return "bg-warning/40 text-foreground";
    return "bg-destructive/70 text-destructive-foreground";
  };

  return (
    <AppShell contentWidth="wide">
      <div className="px-5 lg:px-8 pt-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link to="/home" className="lg:hidden inline-flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <ArrowLeft className="h-3 w-3" /> Back to app
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="font-display text-xl lg:text-2xl font-bold">Institution admin</h1>
                <p className="text-xs text-muted-foreground">IIT Bombay · 2025-26 cohort</p>
              </div>
            </div>
          </div>
          <button
            onClick={exportCsv}
            className="h-10 px-4 rounded-full bg-card border border-border text-sm font-semibold flex items-center gap-2 tap-scale hover:border-primary/40"
          >
            <FileDown className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* KPI cards */}
        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi icon={Users} label="Total students" value={stats.total} accent="primary" />
          <Kpi icon={TrendingUp} label="Avg skill score" value={`${stats.avg}%`} accent="primary" />
          <Kpi icon={Trophy} label="Placement ready" value={`${stats.placementPct}%`} sub={`${stats.placementReady} students ≥70%`} accent="accent" />
          <Kpi icon={AlertTriangle} label="Not started" value={`${stats.notStartedPct}%`} sub={`${stats.notStarted} need a nudge`} accent="warning" />
        </div>

        {/* Alert banner */}
        {stats.notStartedPct >= 10 && (
          <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{stats.notStartedPct}% of students haven't started their roadmap</p>
              <p className="text-xs text-muted-foreground mt-0.5">Send a reminder or assign mentors to re-engage these students.</p>
            </div>
          </div>
        )}

        <div className="mt-6 grid lg:grid-cols-3 gap-4">
          {/* Cohort skill-gap heatmap */}
          <section className="lg:col-span-2 bg-card border border-border rounded-3xl shadow-card p-5">
            <h2 className="font-display font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Cohort skill-gap heatmap
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Average score per cluster across all {stats.total} students.</p>
            <div className="mt-4 space-y-2">
              {clusterAverages.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="text-xs font-semibold w-36 flex-shrink-0">{c.name}</div>
                  <div className="flex-1 h-7 rounded-lg bg-muted overflow-hidden relative">
                    <div className={`h-full ${heatColor(c.avg)} transition-all duration-700 flex items-center justify-end px-2`} style={{ width: `${c.avg}%` }}>
                      <span className="text-[11px] font-bold tabular-nums">{c.avg}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-destructive/70" /> &lt;40 critical</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warning/60" /> 40-74 needs work</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-accent" /> ≥75 strong</span>
            </div>
          </section>

          {/* Leaderboard */}
          <section className="bg-card border border-border rounded-3xl shadow-card p-5">
            <h2 className="font-display font-bold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-warning" /> Top by skill score
            </h2>
            <ul className="mt-3 space-y-2">
              {leaderboard.map((s, i) => {
                const role = JOB_ROLES.find((r) => r.id === s.targetRoleId);
                return (
                  <li key={s.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-base">
                    <span className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      i === 0 ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground"
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{role?.emoji} {role?.title}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{s.skillScore}%</span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Role distribution */}
        <section className="mt-4 bg-card border border-border rounded-3xl shadow-card p-5">
          <h2 className="font-display font-bold">Targeted roles</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {roleDistribution.map(({ role, count, pct }) => (
              <button
                key={role.id}
                onClick={() => setRoleFilter(roleFilter === role.id ? "all" : role.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-base tap-scale ${
                  roleFilter === role.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                {role.emoji} {role.title} <span className="opacity-70">· {count} ({pct}%)</span>
              </button>
            ))}
            {roleFilter !== "all" && (
              <button onClick={() => setRoleFilter("all")} className="text-xs text-muted-foreground underline px-2 py-1.5">
                Clear filter
              </button>
            )}
          </div>
        </section>

        {/* Student roster */}
        <section className="mt-4 bg-card border border-border rounded-3xl shadow-card p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="font-display font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> Student roster
              <span className="text-xs font-medium text-muted-foreground">({filtered.length})</span>
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, program…"
                className="w-full h-10 pl-9 pr-3 rounded-full bg-muted border border-transparent focus:border-primary focus:bg-card focus:outline-none text-sm transition-base"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="text-left font-semibold py-2 px-2">Student</th>
                  <th className="text-left font-semibold py-2 px-2">Program</th>
                  <th className="text-left font-semibold py-2 px-2">Target role</th>
                  <th className="text-right font-semibold py-2 px-2">Steps</th>
                  <th className="text-right font-semibold py-2 px-2">Skill score</th>
                  <th className="text-right font-semibold py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const role = JOB_ROLES.find((r) => r.id === s.targetRoleId);
                  return (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-muted/30 transition-base">
                      <td className="py-3 px-2">
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">{s.email}</p>
                      </td>
                      <td className="py-3 px-2 text-xs">{s.program} · {s.year}</td>
                      <td className="py-3 px-2 text-xs">{role?.emoji} {role?.title}</td>
                      <td className="py-3 px-2 text-right tabular-nums text-xs">{s.stepsCompleted}</td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full ${s.skillScore >= 70 ? "bg-accent" : s.skillScore >= 50 ? "bg-primary" : "bg-warning"}`} style={{ width: `${s.skillScore}%` }} />
                          </div>
                          <span className="font-bold tabular-nums text-xs w-9 text-right">{s.skillScore}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {!s.startedRoadmap ? (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-warning/15 text-warning">Not started</span>
                        ) : s.skillScore >= 70 ? (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-accent/15 text-accent">Ready</span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-sm text-muted-foreground">
                      No students match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <ul className="md:hidden space-y-2">
            {filtered.map((s) => {
              const role = JOB_ROLES.find((r) => r.id === s.targetRoleId);
              return (
                <li key={s.id} className="p-3 rounded-2xl border border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{role?.emoji} {role?.title} · {s.program}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums">{s.skillScore}%</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${s.skillScore >= 70 ? "bg-accent" : s.skillScore >= 50 ? "bg-primary" : "bg-warning"}`} style={{ width: `${s.skillScore}%` }} />
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-center py-10 text-sm text-muted-foreground">No students match your search.</li>
            )}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}

function Kpi({
  icon: Icon, label, value, sub, accent,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  sub?: string;
  accent: "primary" | "accent" | "warning";
}) {
  const accentMap = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/15 text-warning",
  } as const;
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${accentMap[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-3">{label}</p>
      <p className="font-display font-bold text-xl mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
