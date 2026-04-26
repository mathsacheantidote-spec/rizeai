import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, BrainCircuit, Clock3, Code2, FileSearch, Gauge, Play, ShieldCheck, Sparkles, Terminal } from "lucide-react";

type CodingProblem = Pick<Tables<"coding_problems">, "id" | "title" | "difficulty" | "category" | "prompt" | "input_format" | "output_format" | "examples" | "constraints_text" | "supported_languages" | "starter_code">;
type Language = "javascript" | "python" | "java" | "cpp";
type ScoreResult = {
  correctnessScore: number;
  qualityScore: number;
  speedScore: number;
  communicationScore: number;
  employabilityScore: number;
  stored: boolean;
  report: {
    summary: string;
    strengths: string[];
    improvements: string[];
    execution: { pass: number; total: number; stdout: string; stderr: string };
  };
};

const labels: Record<Language, string> = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
};

const fallbackProblems: CodingProblem[] = [
  {
    id: "00000000-0000-0000-0000-000000000000",
    title: "Two Sum Readiness",
    difficulty: "easy",
    category: "Arrays",
    prompt: "Given an array of integers and a target, return the indexes of two numbers that add up to the target. Optimize for clarity and time complexity.",
    input_format: "nums: number[], target: number",
    output_format: "number[] with two indexes",
    examples: [{ input: "nums=[2,7,11,15], target=9", output: "[0,1]" }],
    constraints_text: "2 <= nums.length <= 10^4. Exactly one valid answer exists.",
    supported_languages: ["javascript", "python", "java", "cpp"],
    starter_code: {
      javascript: "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n}\n",
      python: "def two_sum(nums, target):\n    seen = {}\n    for i, value in enumerate(nums):\n        need = target - value\n        if need in seen:\n            return [seen[need], i]\n        seen[value] = i\n",
      java: "import java.util.*;\nclass Solution {\n  public int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> seen = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n      int need = target - nums[i];\n      if (seen.containsKey(need)) return new int[]{seen.get(need), i};\n      seen.put(nums[i], i);\n    }\n    return new int[]{};\n  }\n}\n",
      cpp: "#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nclass Solution {\npublic:\n  vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); i++) {\n      int need = target - nums[i];\n      if (seen.count(need)) return {seen[need], i};\n      seen[nums[i]] = i;\n    }\n    return {};\n  }\n};\n",
    },
  },
];

const asStarter = (value: CodingProblem["starter_code"], language: Language) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const code = (value as Record<string, unknown>)[language];
    return typeof code === "string" ? code : "";
  }
  return "";
};

const asExamples = (value: CodingProblem["examples"]) => Array.isArray(value) ? value as Array<{ input?: string; output?: string }> : [];
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

export default function CodingLab() {
  const { toast } = useToast();
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const loadProblems = async () => {
      const { data } = await supabase
        .from("coding_problems")
        .select("id,title,difficulty,category,prompt,input_format,output_format,examples,constraints_text,supported_languages,starter_code")
        .order("created_at", { ascending: true });
      const next = data?.length ? data : fallbackProblems;
      setProblems(next);
      setSelectedId(next[0]?.id ?? "");
    };
    loadProblems();
  }, []);

  const selected = useMemo(() => problems.find((p) => p.id === selectedId) ?? problems[0] ?? fallbackProblems[0], [problems, selectedId]);
  const supported = (selected.supported_languages ?? ["javascript", "python", "java", "cpp"]).filter((l): l is Language => l in labels);

  useEffect(() => {
    setCode(asStarter(selected.starter_code, language));
    setSeconds(0);
    setResult(null);
  }, [selected.id, language]);

  useEffect(() => {
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, []);

  const submit = async () => {
    setRunning(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("score-code", {
      body: { problemId: selected.id, language, code, timeSpentSeconds: seconds },
    });
    setRunning(false);

    if (error) {
      toast({ title: "Scoring failed", description: error.message, variant: "destructive" });
      return;
    }

    setResult(data as ScoreResult);
    toast({ title: "Code report ready", description: `Employability score: ${(data as ScoreResult).employabilityScore}%` });
  };

  return (
    <AppShell contentWidth="full">
      <div className="px-5 lg:px-0 py-6 lg:py-8 animate-float-up">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Coding Lab</p>
            <h1 className="font-display text-3xl font-bold">Practice in a real IDE-style assessment</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Solve role-based problems and get a coding employability report based on correctness, quality, speed, and communication signals.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-3 text-center shadow-card">
            <div><p className="text-lg font-bold text-accent">{formatTime(seconds)}</p><p className="text-[10px] text-muted-foreground">Time</p></div>
            <div><p className="text-lg font-bold text-primary">{result?.employabilityScore ?? "—"}</p><p className="text-[10px] text-muted-foreground">Score</p></div>
            <div><p className="text-lg font-bold text-warning">{result?.report.execution.pass ?? 0}/{result?.report.execution.total ?? 0}</p><p className="text-[10px] text-muted-foreground">Tests</p></div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 font-display font-bold"><FileSearch className="h-4 w-4 text-primary" /> Problem set</div>
            <div className="mt-4 space-y-2">
              {problems.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => setSelectedId(problem.id)}
                  className={cn("w-full rounded-xl border p-3 text-left transition-base tap-scale", selected.id === problem.id ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-secondary hover:border-primary/40")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{problem.title}</span>
                    <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{problem.difficulty}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{problem.category}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-secondary p-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-accent" /> Scoring model</div>
              <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                <p>Correctness: hidden tests and edge cases</p>
                <p>Quality: readability, structure, complexity signals</p>
                <p>Speed: time-to-solution under assessment pressure</p>
                <p>Communication: naming and explainability clues</p>
              </div>
            </div>
          </aside>

          <main className="min-w-0 rounded-2xl border border-border bg-card shadow-card overflow-hidden">
            <div className="border-b border-border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-bold">{selected.title}</h2>
                    <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase text-accent">{selected.category}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{selected.prompt}</p>
                </div>
                <Button onClick={submit} disabled={running || !code.trim() || selected.id === fallbackProblems[0].id && problems.length === 0} className="h-12 rounded-full bg-gradient-primary px-5">
                  {running ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
                  {running ? "Scoring" : "Run assessment"}
                </Button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-secondary p-3 text-xs"><span className="font-bold text-foreground">Input:</span> <span className="text-muted-foreground">{selected.input_format}</span></div>
                <div className="rounded-xl bg-secondary p-3 text-xs"><span className="font-bold text-foreground">Output:</span> <span className="text-muted-foreground">{selected.output_format}</span></div>
              </div>
              <div className="mt-3 rounded-xl bg-secondary p-3 text-xs text-muted-foreground"><span className="font-bold text-foreground">Constraints:</span> {selected.constraints_text}</div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/50 px-4 py-3">
              {supported.map((item) => (
                <button key={item} onClick={() => setLanguage(item)} className={cn("rounded-full px-3 py-2 text-xs font-semibold transition-base", language === item ? "bg-gradient-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>{labels[item]}</button>
              ))}
            </div>

            <div className="grid min-h-[520px] lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-w-0">
                <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs font-semibold text-muted-foreground"><Terminal className="h-4 w-4" /> editor.rize</div>
                <textarea
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  spellCheck={false}
                  className="h-[480px] w-full resize-none bg-background p-4 font-mono text-sm leading-6 text-foreground outline-none selection:bg-primary/30"
                />
              </div>
              <aside className="border-t border-border bg-secondary/40 p-4 lg:border-l lg:border-t-0">
                <div className="flex items-center gap-2 font-semibold"><Code2 className="h-4 w-4 text-primary" /> Examples</div>
                <div className="mt-3 space-y-3">
                  {asExamples(selected.examples).map((example, index) => (
                    <div key={index} className="rounded-xl border border-border bg-card p-3 text-xs">
                      <p className="font-semibold">Example {index + 1}</p>
                      <p className="mt-2 text-muted-foreground"><span className="text-foreground">Input:</span> {example.input}</p>
                      <p className="mt-1 text-muted-foreground"><span className="text-foreground">Output:</span> {example.output}</p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </main>

          <aside className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2 font-display font-bold"><BrainCircuit className="h-4 w-4 text-accent" /> Employability report</div>
            {!result ? (
              <div className="mt-10 flex flex-col items-center text-center text-muted-foreground">
                <Gauge className="h-10 w-10 text-primary" />
                <h3 className="mt-3 font-display font-bold text-foreground">No report yet</h3>
                <p className="mt-1 text-sm">Run an assessment to score coding skill, quality, and speed.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border bg-gradient-card p-4 text-center">
                  <p className="text-xs text-muted-foreground">Employability coding score</p>
                  <p className="mt-1 text-5xl font-bold text-accent">{result.employabilityScore}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{result.report.summary}</p>
                </div>
                {[
                  { label: "Correctness", value: result.correctnessScore, icon: BadgeCheck },
                  { label: "Code quality", value: result.qualityScore, icon: Code2 },
                  { label: "Speed", value: result.speedScore, icon: Clock3 },
                  { label: "Communication", value: result.communicationScore, icon: FileSearch },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold"><span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-primary" />{label}</span><span>{value}%</span></div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent">Strengths</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{result.report.strengths.map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
                <div className="rounded-xl bg-secondary p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-warning">Next improvements</p>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">{result.report.improvements.map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
