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
    return (
      <div className="min-h-screen w-full bg-background">
        <div className="w-full min-h-screen bg-background">
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
        <main className={`flex-1 pb-28 lg:pb-10 mx-auto w-full px-0 lg:px-8 ${widthClass}`}>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
