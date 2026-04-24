import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { FileText, Download, Sparkles, Lock, CheckCircle2, RefreshCw, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useRize } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

export default function Resume() {
  const profile = useRize((s) => s.profile);
  const role = useRize((s) => s.getRole)();
  const overall = useRize((s) => s.getOverallScore)();
  const phases = useRize((s) => s.roadmap);
  const completed = useRize((s) => s.completedSteps);
  const resume = useRize((s) => s.resume);
  const saveResume = useRize((s) => s.saveResume);
  const [generating, setGenerating] = useState(false);

  const unlocked = overall >= 60;

  // Resume content derived from profile + completed roadmap steps
  const data = useMemo(() => {
    const allSteps = phases.flatMap((p) => p.steps);
    const doneSteps = allSteps.filter((s) => completed.includes(s.id));
    const certifications = doneSteps.filter((s) => s.type === "certification");
    const projects = doneSteps.filter((s) => s.type === "project");
    const courses = doneSteps.filter((s) => s.type === "course");
    const skillSet = Array.from(new Set([
      ...role.keywords,
      ...doneSteps.flatMap((s) => s.skillTags),
    ]));
    const summary = `${profile?.program || "Student"} at ${profile?.college || "—"} targeting a ${role.title} role. ` +
      `${overall}% match against role keywords with ${doneSteps.length} verified milestones across ` +
      `${certifications.length} certifications, ${projects.length} live projects, and ${courses.length} courses. ` +
      `Strong foundation in ${role.keywords.slice(0, 3).join(", ")}.`;
    // ATS score: skill keyword coverage (60%) + completion (40%)
    const coverage = Math.min(100, Math.round((skillSet.length / Math.max(role.keywords.length * 1.5, 1)) * 100));
    const completion = Math.min(100, doneSteps.length * 10);
    const atsScore = Math.round(coverage * 0.6 + completion * 0.4);
    return { doneSteps, certifications, projects, courses, skillSet, summary, atsScore };
  }, [phases, completed, role, profile, overall]);

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 48;
      let y = margin;

      const ink = (r: number, g: number, b: number) => doc.setTextColor(r, g, b);
      const drawLine = () => {
        doc.setDrawColor(220);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageW - margin, y);
      };

      // Header — name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      ink(20, 20, 30);
      doc.text(profile?.name || "Your Name", margin, y);
      y += 18;

      // Contact / role
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      ink(90, 90, 100);
      const contact = [profile?.email, `${profile?.program || ""} · ${profile?.college || ""}`, `Targeting: ${role.title}`]
        .filter(Boolean).join("  |  ");
      doc.text(contact, margin, y);
      y += 14;
      drawLine();
      y += 18;

      const section = (title: string) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        ink(79, 70, 229); // primary indigo
        doc.text(title.toUpperCase(), margin, y);
        y += 4;
        drawLine();
        y += 14;
        ink(30, 30, 40);
      };

      const para = (text: string, opts?: { bold?: boolean; size?: number }) => {
        doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
        doc.setFontSize(opts?.size ?? 10);
        const lines = doc.splitTextToSize(text, pageW - margin * 2);
        doc.text(lines, margin, y);
        y += lines.length * (opts?.size ? opts.size + 3 : 13);
      };

      // Summary
      section("Professional Summary");
      para(data.summary);
      y += 6;

      // Skills (ATS keywords)
      section("Skills");
      para(data.skillSet.join(" · "));
      y += 6;

      // Education
      section("Education");
      para(`${profile?.program || "Program"} — ${profile?.college || "Institution"}`, { bold: true });
      para(`Year: ${profile?.year || "—"}`);
      y += 6;

      // Certifications
      if (data.certifications.length) {
        section("Certifications");
        data.certifications.forEach((c) => {
          para(`• ${c.title}`, { bold: true });
          para(`  ${c.skillTags.join(", ")} — ${c.estTime}`);
        });
        y += 4;
      }

      // Projects
      if (data.projects.length) {
        section("Projects");
        data.projects.forEach((p) => {
          para(`• ${p.title}`, { bold: true });
          para(`  ${p.whyItMatters}`);
          para(`  Tech: ${p.skillTags.join(", ")}`);
          y += 2;
        });
      }

      // Courses
      if (data.courses.length) {
        section("Coursework");
        data.courses.forEach((c) => {
          para(`• ${c.title} — ${c.skillTags.join(", ")}`);
        });
      }

      // Footer
      doc.setFontSize(8);
      ink(150, 150, 160);
      doc.text(
        `Generated by Rize · ATS Score ${data.atsScore}/100 · ${new Date().toLocaleDateString()}`,
        margin,
        doc.internal.pageSize.getHeight() - 24
      );

      const filename = `${(profile?.name || "resume").replace(/\s+/g, "_")}_${role.id}_resume.pdf`;
      const dataUrl = doc.output("datauristring");

      saveResume({
        dataUrl,
        filename,
        atsScore: data.atsScore,
        generatedAt: Date.now(),
        roleId: role.id,
      });
      doc.save(filename);
      toast({ title: "Resume generated", description: `Saved to your app · ATS ${data.atsScore}/100` });
    } catch (err) {
      console.error(err);
      toast({ title: "Could not generate resume", description: String(err), variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const downloadStored = () => {
    if (!resume) return;
    const a = document.createElement("a");
    a.href = resume.dataUrl;
    a.download = resume.filename;
    a.click();
  };

  if (!unlocked) {
    return (
      <AppShell>
        <div className="px-5 pt-6">
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> AI Resume Builder
          </h1>
          <div className="mt-6 rounded-3xl bg-gradient-card border border-border p-8 text-center shadow-card">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="font-display font-bold text-lg">Locked at 60% readiness</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Hit a 60% skill score and we'll auto-generate an ATS-optimized resume from your profile and completed roadmap steps.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              You're at {overall}% — {60 - overall}% to go
            </div>
            <Link to="/roadmap" className="mt-6 inline-block h-11 px-6 rounded-full bg-gradient-primary text-primary-foreground font-semibold leading-[44px] shadow-glow tap-scale">
              Continue your roadmap
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-hero" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-glow" />

        <header className="relative px-5 pt-6 pb-5 text-primary-foreground">
          <Link to="/home" className="lg:hidden inline-flex items-center gap-1 text-xs text-white/80 mb-2">
            <ArrowLeft className="h-3 w-3" /> Home
          </Link>
          <p className="text-xs font-medium text-white/75">AI-generated for</p>
          <h1 className="font-display text-2xl font-bold">{role.emoji} {role.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <div className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> ATS {data.atsScore}/100
            </div>
            <div className="bg-white/15 backdrop-blur border border-white/20 rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-3 w-3" /> {data.doneSteps.length} milestones
            </div>
          </div>
        </header>

        <div className="relative px-5 mt-2 space-y-4">
          {/* Action card */}
          <div className="bg-card rounded-3xl shadow-elevated p-5 animate-float-up">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground shadow-glow flex-shrink-0">
                <FileText className="h-7 w-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display font-bold">Your ATS-optimized resume</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-built from your profile and {data.doneSteps.length} completed roadmap steps. Recruiter + ATS friendly.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={generatePdf}
                disabled={generating}
                className="h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold shadow-glow tap-scale flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {generating ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Generating…</>
                ) : resume ? (
                  <><RefreshCw className="h-4 w-4" /> Regenerate PDF</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate PDF</>
                )}
              </button>
              <button
                onClick={downloadStored}
                disabled={!resume}
                className="h-12 rounded-full bg-accent text-accent-foreground font-semibold tap-scale flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4" /> Download PDF
              </button>
            </div>

            {resume && (
              <div className="mt-3 text-[11px] text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-accent" />
                Saved in app · {resume.filename} · ATS {resume.atsScore}/100 · {new Date(resume.generatedAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* ATS score meter */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-sm">ATS Score</h3>
              <span className="text-xs font-bold tabular-nums">{data.atsScore}/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-700"
                style={{ width: `${data.atsScore}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {data.atsScore >= 80 ? "Excellent — your resume should sail through ATS filters." :
               data.atsScore >= 60 ? "Solid — finish a few more roadmap steps to push above 80." :
               "Add more keywords by completing core skill steps."}
            </p>
          </div>

          {/* Live preview */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-sm">Live preview</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Modern · Single column</span>
            </div>

            <div className="font-sans text-sm">
              <div className="border-b border-border pb-3">
                <p className="font-display font-bold text-lg leading-tight">{profile?.name || "Your name"}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {profile?.email} · {profile?.program} · {profile?.college} · Targeting {role.title}
                </p>
              </div>

              <Section title="Summary">
                <p className="text-xs text-foreground/80 leading-relaxed">{data.summary}</p>
              </Section>

              <Section title="Skills">
                <p className="text-xs text-foreground/80 leading-relaxed">{data.skillSet.join(" · ")}</p>
              </Section>

              <Section title="Education">
                <p className="text-xs"><strong>{profile?.program || "Program"}</strong> — {profile?.college || "Institution"}</p>
                <p className="text-[11px] text-muted-foreground">Year: {profile?.year || "—"}</p>
              </Section>

              {data.certifications.length > 0 && (
                <Section title="Certifications">
                  <ul className="space-y-1">
                    {data.certifications.map((c) => (
                      <li key={c.id} className="text-xs">
                        <strong>{c.title}</strong> — <span className="text-muted-foreground">{c.skillTags.join(", ")}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {data.projects.length > 0 && (
                <Section title="Projects">
                  <ul className="space-y-2">
                    {data.projects.map((p) => (
                      <li key={p.id} className="text-xs">
                        <strong>{p.title}</strong>
                        <p className="text-foreground/75">{p.whyItMatters}</p>
                        <p className="text-[10px] text-muted-foreground">Tech: {p.skillTags.join(", ")}</p>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {data.courses.length > 0 && (
                <Section title="Coursework">
                  <ul className="space-y-1">
                    {data.courses.map((c) => (
                      <li key={c.id} className="text-xs">
                        <strong>{c.title}</strong> — <span className="text-muted-foreground">{c.skillTags.join(", ")}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-4">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary border-b border-border pb-1 mb-2">
        {title}
      </h4>
      {children}
    </section>
  );
}
