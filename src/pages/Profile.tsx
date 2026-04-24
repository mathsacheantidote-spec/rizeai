import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { useRize } from "@/lib/store";
import { ChevronRight, LogOut, Moon, Bell, FileText, Target, GraduationCap, Award, Building2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Profile() {
  const navigate = useNavigate();
  const profile = useRize((s) => s.profile);
  const role = useRize((s) => s.getRole)();
  const overall = useRize((s) => s.getOverallScore)();
  const completed = useRize((s) => s.completedSteps);
  const reset = useRize((s) => s.reset);

  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const initials = (profile?.name || "You").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const stats = [
    { label: "Days active", value: 7 },
    { label: "Steps done", value: completed.length },
    { label: "Score", value: `${overall}%` },
  ];

  const menu = [
    { icon: Target, label: "Change target role", onClick: () => navigate("/goal") },
    { icon: FileText, label: "AI Resume Builder", onClick: () => navigate("/resume") },
    { icon: Building2, label: "Institution admin", onClick: () => navigate("/admin") },
    { icon: Bell, label: "Notifications", onClick: () => {} },
  ];

  return (
    <AppShell>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-hero" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-glow" />

        <div className="relative px-5 pt-8 pb-6 flex flex-col items-center text-primary-foreground">
          <div className="h-20 w-20 rounded-full bg-white/15 backdrop-blur border-2 border-white/30 flex items-center justify-center font-display font-bold text-2xl shadow-elevated">
            {initials}
          </div>
          <h1 className="font-display text-xl font-bold mt-3">{profile?.name || "Your name"}</h1>
          <p className="text-xs text-white/75">{profile?.email}</p>
          <span className="mt-2 text-[11px] font-semibold bg-white/15 backdrop-blur px-3 py-1 rounded-full border border-white/20">
            {role.emoji} {role.title}
          </span>
        </div>

        <div className="relative px-5">
          <div className="bg-card rounded-3xl shadow-card border border-border grid grid-cols-3 divide-x divide-border p-2">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center py-2">
                <span className="font-display font-bold text-lg">{s.value}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">About you</h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            <Row icon={GraduationCap} label="College" value={profile?.college || "—"} />
            <Row icon={Award} label="Program" value={profile?.program || "—"} />
            <Row icon={Target} label="Year" value={profile?.year || "—"} />
          </div>
        </div>

        <div className="px-5 mt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">Account</h3>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {menu.map((m) => (
              <button key={m.label} onClick={m.onClick} className="w-full flex items-center gap-3 p-4 tap-scale hover:bg-muted/50 transition-base first:rounded-t-2xl">
                <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
                  <m.icon className="h-4 w-4" />
                </span>
                <span className="flex-1 text-left text-sm font-medium">{m.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
            <button onClick={() => setDark((v) => !v)} className="w-full flex items-center gap-3 p-4 tap-scale hover:bg-muted/50 transition-base">
              <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
                <Moon className="h-4 w-4" />
              </span>
              <span className="flex-1 text-left text-sm font-medium">Dark mode</span>
              <span className={`h-6 w-10 rounded-full p-0.5 transition-base ${dark ? "bg-primary" : "bg-muted"}`}>
                <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${dark ? "translate-x-4" : ""}`} />
              </span>
            </button>
            <button
              onClick={() => { reset(); navigate("/"); }}
              className="w-full flex items-center gap-3 p-4 tap-scale hover:bg-destructive/5 transition-base rounded-b-2xl text-destructive"
            >
              <span className="h-9 w-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="h-4 w-4" />
              </span>
              <span className="flex-1 text-left text-sm font-semibold">Reset & start over</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-6 mb-2">Rize · Rise with a Z</p>
      </div>
    </AppShell>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof Bell; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-4">
      <span className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
