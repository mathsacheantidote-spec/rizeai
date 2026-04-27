import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Map, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import rizeLogo from "@/assets/rize-logo.png";

export default function Welcome() {
  const [cursor, setCursor] = useState({ x: 50, y: 42 });

  return (
    <AppShell hideNav>
      <main
        className="relative min-h-screen overflow-hidden bg-background"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setCursor({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-80" style={{ background: `radial-gradient(520px circle at ${cursor.x}% ${cursor.y}%, hsl(var(--primary) / 0.28), hsl(var(--accent) / 0.10) 36%, transparent 68%)` }} />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.22)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.22)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30 [mask-image:radial-gradient(circle_at_center,black,transparent_76%)]" />
        <div className="absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <nav className="flex items-center justify-between animate-float-up">
            <Link to="/" className="flex items-center gap-2">
              <img src={rizeLogo} alt="Rize" className="h-10 w-24 object-contain" />
            </Link>
            <Link to="/signup" className="hidden h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-muted-foreground transition-base hover:text-foreground sm:flex">Sign in</Link>
          </nav>

          <section className="flex flex-1 flex-col justify-center py-16 lg:py-24">
            <div className="max-w-4xl animate-float-up" style={{ animationDelay: "80ms" }}>
              <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">Career intelligence for students</div>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] md:text-7xl">Turn raw potential into interview-ready proof.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Rize maps your skills, exposes the gaps blocking your next role, and converts practice into roadmaps, resumes, and measurable employability signals.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full bg-gradient-primary px-8 text-base font-semibold text-primary-foreground shadow-glow">
                  <Link to="/signup">Get started free</Link>
                </Button>
                <Link to="/career-engine" className="inline-flex h-12 items-center justify-center rounded-full border border-border px-8 text-base font-semibold transition-base hover:bg-muted">Explore engine</Link>
              </div>
            </div>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-float-up" style={{ animationDelay: "160ms" }}>
              {[
                { icon: Target, label: "Skill Map" },
                { icon: Map, label: "AI Roadmap" },
                { icon: FileText, label: "Resume Builder" },
                { icon: TrendingUp, label: "Career Insights" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-border bg-card/80 p-5 shadow-card backdrop-blur transition-base hover:-translate-y-0.5 hover:border-primary/40">
                  <item.icon className="h-5 w-5 text-accent" />
                  <p className="mt-4 font-display font-bold">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="pb-2 text-xs text-muted-foreground">Free for students · Mock AI enabled · Web-first</div>
        </div>
      </main>
    </AppShell>
  );
}
