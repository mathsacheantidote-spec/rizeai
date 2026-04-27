import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code2, FileText, Map, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import rizeLogo from "@/assets/rize-logo.png";

export default function Welcome() {
  const [cursor, setCursor] = useState({ x: 50, y: 42 });
  const [visible, setVisible] = useState(false);

  return (
    <AppShell hideNav>
      <main
        className="relative min-h-screen cursor-none overflow-hidden bg-background"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setCursor({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.20)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.20)_1px,transparent_1px)] bg-[size:44px_44px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-80" />
        <div className="pointer-events-none absolute h-72 w-72 rounded-full border border-primary/25 bg-primary/10 blur-sm animate-ambient-drift" style={{ left: `calc(${cursor.x}% - 9rem)`, top: `calc(${cursor.y}% - 9rem)`, transition: "left 360ms ease-out, top 360ms ease-out" }} />
        <div className="pointer-events-none absolute h-44 w-44 rounded-full border border-accent/35 bg-accent/10 animate-cursor-breathe" style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }} />
        <div className="pointer-events-none absolute h-28 w-28 rounded-full border border-primary/40 animate-cursor-orbit" style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}>
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-accent shadow-accent-glow" />
          <span className="absolute bottom-1 left-5 h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
        </div>
        <div className="pointer-events-none absolute h-5 w-5 rounded-full border border-foreground/80 bg-background/30 backdrop-blur-sm" style={{ left: `${cursor.x}%`, top: `${cursor.y}%`, opacity: visible ? 1 : 0, transform: "translate(-50%, -50%)", transition: "opacity 180ms ease" }} />
        <div className="pointer-events-none absolute left-[8%] top-[18%] h-20 w-20 rounded-full border border-accent/20 bg-card/40 animate-ambient-drift" />
        <div className="pointer-events-none absolute bottom-[18%] right-[10%] h-28 w-28 rounded-full border border-primary/20 bg-primary/10 animate-ambient-drift" style={{ animationDelay: "1.2s" }} />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <nav className="flex items-center justify-between animate-float-up">
            <Link to="/" className="flex items-center gap-2 cursor-none">
              <img src={rizeLogo} alt="Rize" className="h-10 w-24 object-contain" />
            </Link>
            <Link to="/signup" className="hidden h-11 cursor-none items-center rounded-full border border-border px-5 text-sm font-semibold text-muted-foreground transition-base hover:text-foreground sm:flex">Sign in</Link>
          </nav>

          <section className="flex flex-1 flex-col justify-center py-12 lg:py-20">
            <div className="max-w-5xl animate-float-up" style={{ animationDelay: "80ms" }}>
              <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">AI career operating system</div>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] md:text-7xl">Code, prove, and launch your next role.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Rize turns quizzes, coding attempts, resumes, and roadmaps into one live employability signal so students know exactly what to improve next.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 cursor-none rounded-full bg-gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-glow">
                  <Link to="/signup">Start readiness engine</Link>
                </Button>
                <Link to="/coding-lab" className="inline-flex h-12 cursor-none items-center justify-center gap-2 rounded-full border border-border px-8 text-base font-semibold transition-base hover:bg-muted"><Code2 className="h-4 w-4" /> Open Coding Lab</Link>
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
