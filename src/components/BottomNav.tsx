import { Link, useLocation } from "react-router-dom";
import { Home, Map, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/roadmap", icon: Map, label: "Roadmap" },
  { to: "/skills", icon: Sparkles, label: "Skills" },
  { to: "/profile", icon: User, label: "Profile" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40">
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
