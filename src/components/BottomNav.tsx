import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Home, Map, Sparkles, User, Bell, LogOut, Check, ChevronsUpDown, Building2, FileText, Newspaper, Settings, Search, Brain, Code2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRize } from "@/lib/store";
import { JOB_ROLES } from "@/lib/rize-data";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import rizeLogo from "@/assets/rize-logo.png";

const tabs = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/roadmap", icon: Map, label: "Roadmap" },
  { to: "/skills", icon: Sparkles, label: "Skills" },
  { to: "/profile", icon: User, label: "Profile" },
];

const sideTabs = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/roadmap", icon: Map, label: "Roadmap" },
  { to: "/skills", icon: Sparkles, label: "Skills" },
  { to: "/career-engine", icon: Brain, label: "Career Engine" },
  { to: "/mentors", icon: Users, label: "Mentors" },
  { to: "/coding-lab", icon: Code2, label: "Coding Lab" },
  { to: "/resume", icon: FileText, label: "Resume" },
  { to: "/insights", icon: Newspaper, label: "Insights" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="mx-3 mb-3 rounded-3xl border border-border/60 bg-card/85 backdrop-blur-lg shadow-elevated">
        <ul className="grid grid-cols-4 px-2 py-2">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 rounded-2xl tap-scale transition-base",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-label={t.label}
                  aria-current={active ? "page" : undefined}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-2xl transition-spring",
                      active && "bg-primary/10 shadow-glow"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", active && "scale-110")} strokeWidth={active ? 2.5 : 2} />
                  </span>
                  <span className={cn("text-[10px] font-medium", active && "font-semibold")}>{t.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function SideNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profile = useRize((s) => s.profile);
  const role = useRize((s) => s.getRole)();
  const selectRole = useRize((s) => s.selectRole);
  const reset = useRize((s) => s.reset);
  const initials = (profile?.name || "You").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleRoleChange = (newId: string) => {
    if (newId === role.id) { setPickerOpen(false); return; }
    const next = JOB_ROLES.find((r) => r.id === newId);
    selectRole(newId);
    setPickerOpen(false);
    toast({
      title: `Now targeting ${next?.title ?? "new role"}`,
      description: "Re-running your gap report and updating your roadmap…",
    });
    navigate("/gap");
  };

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-sm">
      <div className="px-6 py-6">
        <Link to="/home" className="flex items-center gap-2">
          <img src={rizeLogo} alt="Rize" className="h-10 w-16 object-contain drop-shadow-[0_0_18px_hsl(var(--primary)/0.45)]" />
          <div>
            <div className="font-display font-bold text-lg leading-none">Rize</div>
            <div className="text-[10px] text-muted-foreground italic">Rise with a Z</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {sideTabs.map((t) => {
            const active = pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <li key={t.to}>
                <Link
                  to={t.to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl border-l-2 text-sm font-medium transition-base tap-scale",
                    active
                      ? "border-primary bg-primary/15 text-foreground shadow-glow"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 px-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Targeting</div>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                className="w-full text-left rounded-2xl bg-gradient-card border border-border p-3 hover:border-primary/40 transition-base tap-scale group"
                aria-label="Change target role"
              >
                <div className="flex items-start gap-2">
                  <div className="text-2xl leading-none">{role.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-bold text-sm leading-tight truncate">{role.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{role.domain}</div>
                  </div>
                  <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground mt-1 group-hover:text-primary transition-base" />
                </div>
                <div className="text-[11px] text-primary font-semibold mt-2">Change role →</div>
              </button>
            </PopoverTrigger>
            <PopoverContent side="right" align="start" className="w-72 p-2">
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold">Switch target role</p>
                <p className="text-[11px] text-muted-foreground">Re-runs your gap report and updates the roadmap.</p>
              </div>
              <ul className="max-h-80 overflow-y-auto mt-1">
                {JOB_ROLES.map((r) => {
                  const active = r.id === role.id;
                  return (
                    <li key={r.id}>
                      <button
                        onClick={() => handleRoleChange(r.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-sm transition-base tap-scale",
                          active ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                      >
                        <span className="text-lg leading-none">{r.emoji}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block font-semibold text-sm leading-tight truncate">{r.title}</span>
                          <span className="block text-[10px] text-muted-foreground">{r.domain}</span>
                        </span>
                        {active && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </PopoverContent>
          </Popover>

          <Link
            to="/admin"
            className={cn(
              "mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-base tap-scale",
              pathname.startsWith("/admin")
                ? "bg-accent/10 text-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Building2 className="h-3.5 w-3.5" />
            Institution admin
          </Link>
        </div>
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-xs">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{profile?.name || "Your name"}</div>
            <div className="text-[10px] text-muted-foreground truncate">{profile?.email || ""}</div>
          </div>
          <button
            onClick={() => { reset(); navigate("/"); }}
            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-base"
            aria-label="Reset"
            title="Reset & start over"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ title }: { title?: string }) {
  return (
    <header className="hidden lg:flex sticky top-0 z-30 h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
      <div>
        {title && <h1 className="font-display font-bold text-lg">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-72 items-center gap-2 rounded-full border border-border bg-input px-4 text-muted-foreground">
          <Search className="h-4 w-4" />
          <span className="text-sm">Search skills, roles, projects</span>
        </div>
        <button className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-base" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
