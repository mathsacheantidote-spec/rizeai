import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { JOB_ROLES } from "@/lib/rize-data";
import { useRize } from "@/lib/store";
import { Button } from "@/components/ui/button";

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
      <div className="px-6 pt-6 pb-10 min-h-screen flex flex-col">
        <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted tap-scale" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mt-4 mb-6 animate-float-up">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Step 2 of 2</span>
          <h1 className="font-display text-3xl font-bold tracking-tight mt-1">Pick your dream role</h1>
          <p className="text-muted-foreground mt-1.5">We'll tailor your roadmap, news, and resume to it.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 flex-1">
          {JOB_ROLES.map((r) => {
            const active = picked === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setPicked(r.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-spring tap-scale ${
                  active ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="text-3xl mb-2">{r.emoji}</div>
                <div className="font-semibold text-sm leading-tight">{r.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{r.domain}</div>
              </button>
            );
          })}
        </div>

        <Button onClick={submit} className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold mt-6 shadow-glow">
          Generate my roadmap
        </Button>
      </div>
    </AppShell>
  );
}
