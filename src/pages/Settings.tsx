import { AppShell } from "@/components/AppShell";
import { Bell, Database, KeyRound, Moon, Shield, Trash2 } from "lucide-react";

export default function Settings() {
  const rows = [
    { icon: Bell, label: "Weekly career digest", value: "Enabled" },
    { icon: Moon, label: "Dark mode", value: "Permanent" },
    { icon: Shield, label: "Privacy export", value: "Ready" },
    { icon: KeyRound, label: "Institution API keys", value: "Admin only" },
    { icon: Database, label: "AI cache", value: "24 hours" },
    { icon: Trash2, label: "Account deletion", value: "Request" },
  ];

  return (
    <AppShell contentWidth="narrow">
      <div className="px-5 lg:px-0 pt-6 lg:pt-8 animate-float-up">
        <p className="text-xs font-bold uppercase tracking-wider text-primary">Settings</p>
        <h1 className="font-display text-3xl font-bold">Control center</h1>
        <p className="mt-2 text-sm text-muted-foreground">Rize is dark-only by design. Manage notifications, privacy, and admin controls here.</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {rows.map((row) => (
            <button key={row.label} className="flex w-full items-center gap-4 border-b border-border p-4 text-left transition-base last:border-b-0 hover:bg-muted/60">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><row.icon className="h-4 w-4" /></span>
              <span className="flex-1 font-semibold">{row.label}</span>
              <span className="text-xs font-semibold text-muted-foreground">{row.value}</span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
