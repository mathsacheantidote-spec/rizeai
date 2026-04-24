import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function AppShell({ children, hideNav }: AppShellProps) {
  return (
    <div className="min-h-screen w-full bg-muted/30">
      <div className="app-shell shadow-elevated">
        <main className={hideNav ? "" : "pb-28"}>{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
