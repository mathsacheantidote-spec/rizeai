import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CollegeAutocomplete } from "@/components/CollegeAutocomplete";
import { useRize } from "@/lib/store";

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Recent grad"];

export default function Signup() {
  const navigate = useNavigate();
  const setProfile = useRize((s) => s.setProfile);
  const [form, setForm] = useState({
    name: "", email: "", college: "", program: "", year: "3rd year",
  });

  const valid = form.name.trim() && form.email.trim() && form.college.trim() && form.program.trim();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setProfile(form);
    navigate("/quiz");
  };

  return (
    <AppShell hideNav>
      <div className="px-6 pt-6 pb-10">
        <button onClick={() => navigate(-1)} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted tap-scale" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mt-4 mb-8 animate-float-up">
          <h1 className="font-display text-3xl font-bold tracking-tight">Let's set you up</h1>
          <p className="text-muted-foreground mt-1.5">Tell us a bit about you to personalize your roadmap.</p>
        </div>

        <form onSubmit={submit} className="space-y-5 animate-float-up" style={{ animationDelay: "60ms" }}>
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Aarav Sharma" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@college.edu" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="college">College</Label>
            <CollegeAutocomplete id="college" placeholder="Start typing — e.g. IIT Delhi" value={form.college} onChange={(value) => setForm({ ...form, college: value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="program">Program</Label>
            <Input id="program" placeholder="B.Tech Computer Science" value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} className="h-12 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Year</Label>
            <div className="grid grid-cols-3 gap-2">
              {YEARS.map((y) => {
                const active = form.year === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setForm({ ...form, year: y })}
                    className={`h-10 rounded-full text-xs font-medium border transition-base tap-scale ${
                      active ? "bg-primary text-primary-foreground border-primary shadow-glow" : "bg-card border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={!valid} className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold mt-4 shadow-glow disabled:opacity-50 disabled:shadow-none">
            Continue <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
