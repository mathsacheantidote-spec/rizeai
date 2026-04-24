import { Link } from "react-router-dom";
import heroImg from "@/assets/welcome-hero.jpg";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export default function Welcome() {
  return (
    <AppShell hideNav>
      <div className="relative min-h-screen flex flex-col">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-glow opacity-90" />

        <div className="relative flex-1 flex flex-col items-center justify-between px-6 pt-16 pb-8 text-primary-foreground">
          <div className="flex items-center gap-2 animate-float-up">
            <div className="h-9 w-9 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Rize</span>
          </div>

          <div className="w-full flex flex-col items-center text-center gap-8 animate-float-up" style={{ animationDelay: "100ms" }}>
            <div className="relative">
              <div className="absolute inset-0 -m-8 bg-white/10 rounded-full blur-3xl" />
              <img
                src={heroImg}
                alt="Glowing staircase rising into the sky"
                width={1024}
                height={1024}
                className="relative w-64 h-64 object-cover rounded-3xl shadow-elevated"
              />
            </div>

            <div className="space-y-3 max-w-sm">
              <h1 className="font-display text-4xl font-bold leading-tight">
                Rise with a <span className="italic">Z</span>
              </h1>
              <p className="text-base text-white/85 leading-relaxed">
                Your career, mapped by AI. Build the skills that get you hired — one step at a time.
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3 animate-float-up" style={{ animationDelay: "200ms" }}>
            <Button asChild size="lg" className="w-full h-12 rounded-full bg-white text-primary hover:bg-white/95 font-semibold text-base shadow-elevated">
              <Link to="/signup">Get started</Link>
            </Button>
            <button className="w-full h-12 rounded-full border border-white/30 text-white font-medium text-sm tap-scale">
              I already have an account
            </button>
            <p className="text-center text-xs text-white/60 mt-2">Free for students • No credit card</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
