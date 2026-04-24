import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { QUIZ_QUESTIONS } from "@/lib/rize-data";
import { useRize } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function Quiz() {
  const navigate = useNavigate();
  const setQuizAnswer = useRize((s) => s.setQuizAnswer);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const q = QUIZ_QUESTIONS[idx];
  const progress = ((idx) / QUIZ_QUESTIONS.length) * 100;

  const next = () => {
    if (selected === null) return;
    setQuizAnswer(q.id, q.options[selected].score);
    setSelected(null);
    if (idx + 1 < QUIZ_QUESTIONS.length) {
      setIdx(idx + 1);
    } else {
      navigate("/goal");
    }
  };

  return (
    <AppShell hideNav>
      <div className="px-6 pt-6 pb-10 min-h-screen flex flex-col">
        <div className="flex items-center gap-3">
          <button onClick={() => (idx === 0 ? navigate(-1) : setIdx(idx - 1))} className="h-10 w-10 -ml-2 rounded-full flex items-center justify-center hover:bg-muted tap-scale" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium tabular-nums">{idx + 1}/{QUIZ_QUESTIONS.length}</span>
        </div>

        <div key={q.id} className="mt-10 flex-1 flex flex-col animate-float-up">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{q.category}</span>
          <h2 className="font-display text-2xl font-bold mt-2 leading-snug">{q.question}</h2>

          <div className="mt-8 space-y-3">
            {q.options.map((opt, i) => {
              const active = selected === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-base tap-scale ${
                    active
                      ? "border-primary bg-primary/5 shadow-glow"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-base ${
                      active ? "border-primary" : "border-muted-foreground/40"
                    }`}>
                      {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
                    </span>
                    <span className="font-medium">{opt.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Button onClick={next} disabled={selected === null} className="w-full h-12 rounded-full bg-gradient-primary text-primary-foreground font-semibold mt-6 shadow-glow disabled:opacity-50 disabled:shadow-none">
          {idx + 1 === QUIZ_QUESTIONS.length ? "See results" : "Next"}
        </Button>
      </div>
    </AppShell>
  );
}
