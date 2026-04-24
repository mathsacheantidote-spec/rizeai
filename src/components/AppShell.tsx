import { ReactNode } from "react";
import { BottomNav, SideNav } from "./BottomNav";

interface AppShellProps {
  children: ReactNode;
  hideNav?: boolean;
  /** Constrain inner content to a comfortable reading width on desktop */
  contentWidth?: "narrow" | "wide" | "full";
}

export function AppShell({ children, hideNav, contentWidth = "wide" }: AppShellProps) {
  if (hideNav) {
    // Onboarding screens — center a phone-like card on desktop, full screen on mobile
    return (
      <div className="min-h-screen w-full bg-muted/30 flex items-center justify-center lg:p-6">
        <div className="w-full lg:max-w-md min-h-screen lg:min-h-0 lg:rounded-3xl lg:overflow-hidden bg-background lg:shadow-elevated">
          {children}
        </div>
      </div>
    );
  }

  const widthClass =
    contentWidth === "narrow" ? "max-w-3xl"
    : contentWidth === "full" ? "max-w-none"
    : "max-w-6xl";

  return (
    <div className="min-h-screen w-full bg-background flex">
      <SideNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className={`flex-1 pb-28 lg:pb-10 mx-auto w-full ${widthClass}`}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
