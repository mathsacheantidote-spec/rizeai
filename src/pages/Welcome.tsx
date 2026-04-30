import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, FileText, Map, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import rizeLogo from "@/assets/rize-logo.png";

export default function Welcome() {
  const heroRef = useRef<HTMLElement>(null);
  const [cursor, setCursor] = useState({ x: 50, y: 42 });
  const [visible, setVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // Smoothly track pointer with rAF to avoid jitter
  useEffect(() => {
    if (isTouch) return;
    let frame = 0;
    let target = { x: 50, y: 42 };
    const onMove = (event: PointerEvent) => {
      const node = heroRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      target = {
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      };
      if (!frame) {
        frame = requestAnimationFrame(() => {
          setCursor(target);
          frame = 0;
        });
      }
    };
    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);
    const node = heroRef.current;
    node?.addEventListener("pointermove", onMove);
    node?.addEventListener("pointerenter", onEnter);
    node?.addEventListener("pointerleave", onLeave);
    return () => {
      node?.removeEventListener("pointermove", onMove);
      node?.removeEventListener("pointerenter", onEnter);
      node?.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [isTouch]);

  const cursorStyle = !isTouch ? { cursor: "none" as const } : undefined;

  return (
    <AppShell hideNav>
      <main
        ref={heroRef}
        style={cursorStyle}
        className="relative min-h-screen overflow-hidden bg-background"
      >
        {/* Grid + ambient gradients */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.20)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.20)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-80" />

        {/* Mouse-tracking circles — desktop only */}
        {!isTouch && (
          <>
            <div
              className="pointer-events-none absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/25 bg-primary/10 blur-sm"
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: visible ? 1 : 0, transition: "left 480ms cubic-bezier(0.22,1,0.36,1), top 480ms cubic-bezier(0.22,1,0.36,1), opacity 320ms ease" }}
            />
            <div
              className="pointer-events-none absolute h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/35 bg-accent/10"
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: visible ? 1 : 0, transition: "left 320ms cubic-bezier(0.22,1,0.36,1), top 320ms cubic-bezier(0.22,1,0.36,1), opacity 240ms ease" }}
            />
            <div
              className="pointer-events-none absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/40"
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: visible ? 1 : 0, transition: "left 220ms cubic-bezier(0.22,1,0.36,1), top 220ms cubic-bezier(0.22,1,0.36,1), opacity 200ms ease" }}
            >
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-accent-glow" />
              <span className="absolute bottom-1 left-5 h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
            </div>
            <div
              className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: visible ? 1 : 0, transition: "left 90ms linear, top 90ms linear, opacity 180ms ease" }}
            />
          </>
        )}

        {/* Ambient drifting orbs (mobile + desktop) */}
        <div className="pointer-events-none absolute left-[8%] top-[18%] h-20 w-20 rounded-full border border-accent/20 bg-card/40 animate-ambient-drift" />
        <div className="pointer-events-none absolute bottom-[18%] right-[10%] h-28 w-28 rounded-full border border-primary/20 bg-primary/10 animate-ambient-drift" style={{ animationDelay: "1.2s" }} />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <nav className="flex items-center justify-between animate-float-up">
            <Link to="/" className="flex items-center gap-2">
              <img src={rizeLogo} alt="Rize" className="h-10 w-24 object-contain" />
            </Link>
            <Link to="/signup" className="hidden h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-muted-foreground transition-base hover:text-foreground sm:flex">Sign in</Link>
          </nav>

          <section className="flex flex-1 flex-col justify-center py-12 lg:py-20">
            <div className="max-w-5xl animate-float-up" style={{ animationDelay: "80ms" }}>
              <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">AI career operating system</div>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] md:text-7xl">Code, prove, and launch your next role.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Rize turns quizzes, coding attempts, resumes, and roadmaps into one live employability signal so students know exactly what to improve next.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full bg-gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-glow">
                  <Link to="/signup">Start readiness engine</Link>
                </Button>
                <Link to="/coding-lab" className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-8 text-base font-semibold transition-base hover:bg-muted"><Code2 className="h-4 w-4" /> Open Coding Lab</Link>
              </div>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-float-up" style={{ animationDelay: "160ms" }}>
              {[
                { icon: Target, label: "Skill Map" },
                { icon: Code2, label: "Coding Signal" },
                { icon: Map, label: "AI Roadmap" },
                { icon: FileText, label: "Resume Proof" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card/80 p-5 shadow-card backdrop-blur transition-base hover:-translate-y-0.5 hover:border-primary/40">
                  <item.icon className="h-5 w-5 text-accent" />
                  <p className="mt-4 font-display font-bold">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between gap-4 pb-2 text-xs text-muted-foreground"><span>Free for students · Compiler-backed practice · Web-first</span><span className="hidden items-center gap-1 sm:flex"><TrendingUp className="h-3.5 w-3.5 text-accent" /> Proof improves with every run</span></div>
        </div>
      </main>
    </AppShell>
  );
}
