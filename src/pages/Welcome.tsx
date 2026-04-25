import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Map, Sparkles, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export default function Welcome() {
  return (
    <AppShell hideNav>
      <main className="relative min-h-screen overflow-hidden bg-background">
        <div className="absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-primary/25 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6">
          <nav className="flex items-center justify-between animate-float-up">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary shadow-glow"><Sparkles className="h-5 w-5 text-primary-foreground" /></span>
              <span className="font-display text-xl font-bold">Rize</span>
            </Link>
            <Link to="/signup" className="hidden h-11 items-center rounded-full border border-border px-5 text-sm font-semibold text-muted-foreground transition-base hover:text-foreground sm:flex">Sign in</Link>
          </nav>

          <section className="flex flex-1 flex-col justify-center py-16 lg:py-24">
            <div className="max-w-4xl animate-float-up" style={{ animationDelay: "80ms" }}>
              <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">AI-powered skill development</div>
              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] md:text-7xl">Rise with a Z. Your career, engineered by AI.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">Map your skills, discover best-fit roles, close gaps with micro-roadmaps, and ship an ATS-ready resume that gets you closer to a real job.</p>
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
