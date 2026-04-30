import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Code2, BarChart3, Rocket, Palette, Megaphone,
  BrainCircuit, ShieldCheck, LineChart, Cloud, Settings2, Briefcase,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { JOB_ROLES } from "@/lib/rize-data";
import { useRize } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLE_ICON: Record<string, typeof Code2> = {
  swe: Code2,
  data: BarChart3,
  pm: Rocket,
  ux: Palette,
  marketing: Megaphone,
  ds: BrainCircuit,
  cyber: ShieldCheck,
  ba: LineChart,
  cloud: Cloud,
  devops: Settings2,
};

export default function Goal() {
  const navigate = useNavigate();
  const selectRole = useRize((s) => s.selectRole);
  const [picked, setPicked] = useState<string>("swe");

  const submit = () => {
    selectRole(picked);
    navigate("/gap");
  };

  return (
    <AppShell hideNav>
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-10 pt-6">
        <button onClick={() => navigate(-1)} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted tap-scale" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mt-4 mb-6 animate-float-up">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Step 2 of 2</span>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">Pick your target role</h1>
          <p className="mt-1.5 text-muted-foreground">We'll tailor your roadmap, news, and resume to it.</p>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2.5 sm:grid-cols-2">
          {JOB_ROLES.map((role) => {
            const active = picked === role.id;
            const Icon = ROLE_ICON[role.id] ?? Briefcase;
            return (
              <button
                key={role.id}
                onClick={() => setPicked(role.id)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border p-3.5 text-left transition-base tap-scale",
                  active
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-base",
                  active ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-secondary text-muted-foreground",
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{role.title}</p>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{role.domain}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{role.salary}</p>
                </div>
              </button>
            );
          })}
        </div>

        <Button onClick={submit} className="mt-6 h-12 w-full rounded-full bg-gradient-primary font-semibold text-primary-foreground shadow-glow">
          Generate my roadmap <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </AppShell>
  );
}
