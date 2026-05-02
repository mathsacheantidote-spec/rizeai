import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, BrainCircuit, CheckCircle2, Clock3, Code2, FileInput, FilePlus2, FileSearch, Gauge, History, Play, RotateCcw, Save, Search, ShieldCheck, Sparkles, Terminal, TrendingUp, Type, X, XCircle, AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type CodingProblem = Pick<Tables<"coding_problems">, "id" | "title" | "difficulty" | "category" | "prompt" | "input_format" | "output_format" | "examples" | "constraints_text" | "supported_languages" | "starter_code">;
type Language = "javascript" | "typescript" | "python" | "java" | "cpp" | "csharp" | "go" | "ruby" | "php";
type FileTab = { name: string; content: string };
type TestResult = { name: string; passed: boolean; expected?: string; actual?: string };
type HistoryItem = { id: string; problemId: string; problemTitle: string; language: Language; score: number; createdAt: number; result: ScoreResult };
type AIFeedback = { score: number; timeComplexity: string; spaceComplexity: string; strengths: string[]; improvements: string[]; employabilityImpact: string; nextChallenge: string };
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
    execution: { pass: number; total: number; stdout: string; stderr: string; status?: string; runner?: string; testResults?: TestResult[] };
  };
};

const labels: Record<Language, string> = { javascript: "JavaScript", typescript: "TypeScript", python: "Python", java: "Java", cpp: "C++", csharp: "C#", go: "Go", ruby: "Ruby", php: "PHP" };
const extensions: Record<Language, string> = { javascript: "js", typescript: "ts", python: "py", java: "java", cpp: "cpp", csharp: "cs", go: "go", ruby: "rb", php: "php" };
const relevantLanguages = Object.keys(labels) as Language[];
const difficultyOptions = ["all", "easy", "medium", "hard"];
const codeExtensions = ".js,.ts,.py,.java,.cpp,.cc,.cs,.go,.rb,.php,.json,.txt,.md";

const editorThemes = {
  rize: { label: "Rize Night", editor: "bg-background", panel: "bg-secondary/50", border: "border-primary/20", accent: "text-primary" },
  orbit: { label: "Orbit Mint", editor: "bg-card", panel: "bg-accent/10", border: "border-accent/30", accent: "text-accent" },
  graphite: { label: "Graphite Focus", editor: "bg-secondary", panel: "bg-muted/70", border: "border-border", accent: "text-muted-foreground" },
} as const;
const editorFonts = {
  jetbrains: { label: "JetBrains Mono", family: "'JetBrains Mono', ui-monospace, monospace" },
  fira: { label: "Fira Code", family: "'Fira Code', ui-monospace, monospace" },
  ibm: { label: "IBM Plex Mono", family: "'IBM Plex Mono', ui-monospace, monospace" },
} as const;

const fallbackProblems: CodingProblem[] = [{
  id: "00000000-0000-0000-0000-000000000000",
  title: "Two Sum Readiness",
  difficulty: "easy",
  category: "Arrays",
  prompt: "Given an array of integers and a target, return the indexes of two numbers that add up to the target. Optimize for clarity and time complexity.",
  input_format: "nums: number[], target: number",
  output_format: "number[] with two indexes",
  examples: [{ input: "nums=[2,7,11,15], target=9", output: "[0,1]" }],
  constraints_text: "2 <= nums.length <= 10^4. Exactly one valid answer exists.",
  supported_languages: relevantLanguages,
  starter_code: {},
}];

const fallbackStarter: Record<string, Partial<Record<Language, string>>> = {
  "Two Sum Readiness": {
    javascript: "function twoSum(nums, target) {\n  // Write your solution here\n}\n",
    typescript: "function twoSum(nums: number[], target: number): number[] {\n  // Write your solution here\n  return [];\n}\n",
    python: "def two_sum(nums, target):\n    # Write your solution here\n    pass\n",
    java: "class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[]{};\n  }\n}\n",
    cpp: "#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n  vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n  }\n};\n",
    csharp: "class Solution {\n  public int[] TwoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[]{};\n  }\n}\n",
    go: "package main\n\nfunc twoSum(nums []int, target int) []int {\n  // Write your solution here\n  return []int{}\n}\n",
    ruby: "def two_sum(nums, target)\n  # Write your solution here\nend\n",
    php: "<?php\nfunction twoSum($nums, $target) {\n  // Write your solution here\n  return [];\n}\n",
  },
  "API Log Parser": {
    javascript: "function summarizeLogs(logs) {\n  // Write your solution here\n}\n",
    typescript: "function summarizeLogs(logs: string[]): { success: number; clientError: number; serverError: number } {\n  // Write your solution here\n  return { success: 0, clientError: 0, serverError: 0 };\n}\n",
    python: "def summarize_logs(logs):\n    # Write your solution here\n    pass\n",
    java: "import java.util.*;\nclass Solution {\n  public Map<String, Integer> summarizeLogs(List<String> logs) {\n    // Write your solution here\n    return new HashMap<>();\n  }\n}\n",
    cpp: "#include <vector>\n#include <string>\n#include <map>\nusing namespace std;\n\nmap<string, int> summarizeLogs(vector<string> logs) {\n  // Write your solution here\n  return {};\n}\n",
    csharp: "using System.Collections.Generic;\n\nclass Solution {\n  public Dictionary<string, int> SummarizeLogs(List<string> logs) {\n    // Write your solution here\n    return new Dictionary<string, int>();\n  }\n}\n",
    go: "package main\n\nfunc summarizeLogs(logs []string) map[string]int {\n  // Write your solution here\n  return map[string]int{}\n}\n",
    ruby: "def summarize_logs(logs)\n  # Write your solution here\nend\n",
    php: "<?php\nfunction summarizeLogs($logs) {\n  // Write your solution here\n  return ['success' => 0, 'clientError' => 0, 'serverError' => 0];\n}\n",
  },
  "Portfolio Score Normalizer": {
    javascript: "function averageValidScore(scores) {\n  // Write your solution here\n}\n",
    typescript: "function averageValidScore(scores: number[]): number {\n  // Write your solution here\n  return 0;\n}\n",
    python: "def average_valid_score(scores):\n    # Write your solution here\n    pass\n",
    java: "class Solution {\n  public int averageValidScore(int[] scores) {\n    // Write your solution here\n    return 0;\n  }\n}\n",
    cpp: "#include <vector>\nusing namespace std;\n\nint averageValidScore(vector<int> scores) {\n  // Write your solution here\n  return 0;\n}\n",
    csharp: "class Solution {\n  public int AverageValidScore(int[] scores) {\n    // Write your solution here\n    return 0;\n  }\n}\n",
    go: "package main\n\nfunc averageValidScore(scores []int) int {\n  // Write your solution here\n  return 0\n}\n",
    ruby: "def average_valid_score(scores)\n  # Write your solution here\n  0\nend\n",
    php: "<?php\nfunction averageValidScore($scores) {\n  // Write your solution here\n  return 0;\n}\n",
  },
};

const asStarter = (problem: CodingProblem, language: Language) => {
  if (problem.starter_code && typeof problem.starter_code === "object" && !Array.isArray(problem.starter_code)) {
    const code = (problem.starter_code as Record<string, unknown>)[language];
    if (typeof code === "string") return code;
  }
  return fallbackStarter[problem.title]?.[language] ?? fallbackStarter["Two Sum Readiness"][language] ?? "";
};
const asExamples = (value: CodingProblem["examples"]) => Array.isArray(value) ? value as Array<{ input?: string; output?: string }> : [];
const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const draftKey = (problemId: string, language: Language) => `rize-code-draft:${problemId}:${language}`;
const historyKey = "rize-code-history";

function makeFiles(problem: CodingProblem, language: Language): FileTab[] {
  return [
    { name: `solution.${extensions[language]}`, content: asStarter(problem, language) },
    { name: "notes.md", content: `# Approach\n- State the pattern\n- Explain complexity\n- List edge cases\n` },
    { name: "tests.txt", content: asExamples(problem.examples).map((e) => `Input: ${e.input}\nOutput: ${e.output}`).join("\n\n") },
  ];
}

function targetedSuggestion(label: string, value: number) {
  if (label === "Correctness") return value >= 80 ? "Lock in edge cases before submitting." : "Match the exact output shape and trace every hidden case.";
  if (label === "Code quality") return value >= 80 ? "Keep helpers small and names consistent." : "Remove placeholders, extract repeated logic, and simplify branching.";
  if (label === "Speed") return value >= 80 ? "Great pace; reserve final minutes for complexity notes." : "Practice timed pattern recognition before implementation.";
  return value >= 80 ? "Your naming communicates intent clearly." : "Add short comments for trade-offs and improve variable names.";
}

export default function CodingLab() {
  const { toast } = useToast();
  const importRef = useRef<HTMLInputElement>(null);
  const timer = useRef<number | null>(null);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [files, setFiles] = useState<FileTab[]>([]);
  const [activeFile, setActiveFile] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [difficulty, setDifficulty] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [debugLines, setDebugLines] = useState<string[]>(["Debugger ready. Run code to capture stdout, stderr, tests, and runner status."]);
  const [editorTheme, setEditorTheme] = useState<keyof typeof editorThemes>("rize");
  const [editorFont, setEditorFont] = useState<keyof typeof editorFonts>("jetbrains");
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  useEffect(() => {
    const loadProblems = async () => {
      const { data } = await supabase.from("coding_problems").select("id,title,difficulty,category,prompt,input_format,output_format,examples,constraints_text,supported_languages,starter_code").order("created_at", { ascending: true });
      const next = data?.length ? data : fallbackProblems;
      setProblems(next);
      setSelectedId(next[0]?.id ?? "");
    };
    loadProblems();
    setHistory(JSON.parse(localStorage.getItem(historyKey) ?? "[]"));
  }, []);

  const selected = useMemo(() => problems.find((p) => p.id === selectedId) ?? problems[0] ?? fallbackProblems[0], [problems, selectedId]);
  const supported = relevantLanguages;
  const categories = useMemo(() => ["all", ...Array.from(new Set(problems.map((p) => p.category)))], [problems]);
  const filteredProblems = useMemo(() => problems.filter((p) =>
    (difficulty === "all" || p.difficulty === difficulty) &&
    (category === "all" || p.category === category) &&
    (!query.trim() || `${p.title} ${p.category} ${p.prompt}`.toLowerCase().includes(query.toLowerCase()))
  ), [problems, difficulty, category, query]);
  const code = files[0]?.content ?? "";
  const theme = editorThemes[editorTheme];
  const font = editorFonts[editorFont];

  useEffect(() => {
    const saved = localStorage.getItem(draftKey(selected.id, language));
    if (saved) {
      const parsed = JSON.parse(saved) as { files: FileTab[]; seconds: number };
      setFiles(parsed.files?.length ? parsed.files : makeFiles(selected, language));
      setSeconds(parsed.seconds ?? 0);
    } else {
      setFiles(makeFiles(selected, language));
      setSeconds(0);
    }
    setActiveFile(0);
    setResult(null);
    setDebugLines([`Loaded ${selected.title} in ${labels[language]}.`, "Import helper files if your solution depends on additional modules."]);
  }, [selected.id, selected.title, language]);

  useEffect(() => {
    timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, []);

  useEffect(() => {
    if (!selected.id || files.length === 0) return;
    localStorage.setItem(draftKey(selected.id, language), JSON.stringify({ files, seconds, savedAt: Date.now() }));
  }, [files, seconds, selected.id, language]);

  const updateActiveFile = (content: string) => setFiles((current) => current.map((file, index) => index === activeFile ? { ...file, content } : file));
  const removeFile = (index: number) => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  const resetStarter = () => { setFiles(makeFiles(selected, language)); setActiveFile(0); setResult(null); };
  const retake = (item: HistoryItem) => { setSelectedId(item.problemId); setLanguage(item.language); setResult(item.result); toast({ title: "Retake loaded", description: item.problemTitle }); };

  const importFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files ?? []);
    if (!incoming.length) return;
    const imported = await Promise.all(incoming.slice(0, 8).map(async (file) => ({ name: file.name, content: await file.text() })));
    setFiles((current) => [...current, ...imported.filter((file) => file.content.length <= 40000)]);
    setActiveFile(files.length);
    setDebugLines((lines) => [...lines, `Imported ${imported.length} file${imported.length > 1 ? "s" : ""}: ${imported.map((file) => file.name).join(", ")}`]);
    event.target.value = "";
  };

  const submit = async () => {
    setRunning(true);
    setResult(null);
    setDebugLines([`▶ Running ${selected.title}`, `Language: ${labels[language]}`, `Files attached: ${files.map((file) => file.name).join(", ")}`, "Sending code to compiler API..."]);
    const { data, error } = await supabase.functions.invoke("score-code", { body: { problemId: selected.id, language, code, files, timeSpentSeconds: seconds } });
    setRunning(false);
    if (error) {
      setDebugLines((lines) => [...lines, `✕ Function error: ${error.message}`]);
      toast({ title: "Scoring failed", description: error.message, variant: "destructive" });
      return;
    }
    const scored = data as ScoreResult;
    if (!scored?.report?.execution) {
      const message = (data as { error?: string })?.error ?? "Compiler returned an invalid response.";
      setDebugLines((lines) => [...lines, `✕ ${message}`]);
      toast({ title: "Runner response failed", description: message, variant: "destructive" });
      return;
    }
    const execution = scored.report.execution;
    setDebugLines([
      `✓ Runner: ${(execution.runner ?? "runner").toUpperCase()} · ${execution.status ?? "completed"}`,
      `Tests: ${execution.pass}/${execution.total}`,
      execution.stdout ? `stdout:\n${execution.stdout}` : "stdout: <empty>",
      execution.stderr ? `stderr:\n${execution.stderr}` : "stderr: <empty>",
    ]);
    const item: HistoryItem = { id: crypto.randomUUID(), problemId: selected.id, problemTitle: selected.title, language, score: scored.employabilityScore, createdAt: Date.now(), result: scored };
    const nextHistory = [item, ...history].slice(0, 12);
    setResult(scored);
    setHistory(nextHistory);
    localStorage.setItem(historyKey, JSON.stringify(nextHistory));
    toast({ title: "Code report ready", description: `Employability score: ${scored.employabilityScore}%` });
  };

  const rubric = result ? [
    { label: "Correctness", value: result.correctnessScore, icon: BadgeCheck },
    { label: "Code quality", value: result.qualityScore, icon: Code2 },
    { label: "Speed", value: result.speedScore, icon: Clock3 },
    { label: "Communication", value: result.communicationScore, icon: FileSearch },
  ] : [];
  const trend = history.slice(0, 6).reverse();
  const lowestRubric = rubric.length ? [...rubric].sort((a, b) => a.value - b.value)[0] : null;
  const tests = result?.report.execution.testResults ?? [];

  return (
    <AppShell contentWidth="full">
      <div className="min-h-screen px-3 py-4 animate-float-up sm:px-4 lg:px-6 lg:py-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Coding Lab</p>
            <h1 className="font-display text-3xl font-bold lg:text-4xl">Interview-grade coding workspace</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Solve problems in a real multi-language IDE, import helper files, run compiler-backed tests, and turn every attempt into targeted employability feedback.</p>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="px-4 py-3 text-center"><p className="text-xl font-bold text-accent">{formatTime(seconds)}</p><p className="text-[10px] text-muted-foreground">Time</p></div>
            <div className="border-x border-border px-4 py-3 text-center"><p className="text-xl font-bold text-primary">{result?.employabilityScore ?? "—"}</p><p className="text-[10px] text-muted-foreground">Score</p></div>
            <div className="px-4 py-3 text-center"><p className="text-xl font-bold text-warning">{result?.report.execution.pass ?? 0}/{result?.report.execution.total ?? 0}</p><p className="text-[10px] text-muted-foreground">Tests</p></div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
          <aside className="rounded-2xl border border-border bg-card shadow-card xl:h-[calc(100vh-150px)] xl:overflow-hidden">
            <div className="border-b border-border p-4">
              <div className="flex items-center gap-2 font-display font-bold"><FileSearch className="h-4 w-4 text-primary" /> Problem browser</div>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-input px-3 py-2 text-sm text-muted-foreground"><Search className="h-4 w-4" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search challenges" className="w-full bg-transparent outline-none" /></div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-xl border border-border bg-input px-3 py-2 text-xs outline-none">
                  {difficultyOptions.map((item) => <option key={item} value={item}>{item === "all" ? "All levels" : item}</option>)}
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-border bg-input px-3 py-2 text-xs outline-none">
                  {categories.map((item) => <option key={item} value={item}>{item === "all" ? "All categories" : item}</option>)}
                </select>
              </div>
            </div>
            <div className="max-h-[360px] space-y-2 overflow-y-auto p-3 xl:h-[calc(100%-192px)] xl:max-h-none">
              {filteredProblems.map((problem) => (
                <button key={problem.id} onClick={() => setSelectedId(problem.id)} className={cn("w-full rounded-xl border p-3 text-left transition-base tap-scale", selected.id === problem.id ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-secondary hover:border-primary/40")}>
                  <div className="flex items-start justify-between gap-2"><span className="text-sm font-semibold leading-tight">{problem.title}</span><span className="rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">{problem.difficulty}</span></div>
                  <p className="mt-1 text-xs text-muted-foreground">{problem.category}</p>
                </button>
              ))}
            </div>
            <div className="border-t border-border p-4"><div className="rounded-xl border border-border bg-secondary p-3"><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-accent" /> Scoring rubric</div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Correctness, quality, speed, and communication combine into your coding employability score.</p></div></div>
          </aside>

          <main className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card xl:h-[calc(100vh-150px)]">
            <div className="border-b border-border p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-display text-xl font-bold">{selected.title}</h2><span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase text-accent">{selected.category}</span></div><p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground">{selected.prompt}</p></div>
                <Button onClick={submit} disabled={running || !code.trim()} className="h-11 rounded-full bg-gradient-primary px-5 text-primary-foreground shadow-glow">{running ? <Sparkles className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}{running ? "Running" : "Run code"}</Button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2"><div className="rounded-xl bg-secondary p-3 text-xs"><span className="font-bold text-foreground">Input:</span> <span className="text-muted-foreground">{selected.input_format}</span></div><div className="rounded-xl bg-secondary p-3 text-xs"><span className="font-bold text-foreground">Output:</span> <span className="text-muted-foreground">{selected.output_format}</span></div></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary/50 px-4 py-3">
              <div className="flex flex-wrap gap-2">{supported.map((item) => <button key={item} onClick={() => setLanguage(item)} className={cn("rounded-full px-3 py-2 text-xs font-semibold transition-base", language === item ? "bg-gradient-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground")}>{labels[item]}</button>)}</div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground"><Save className="h-3.5 w-3.5" /> Draft autosaved</div>
            </div>
            <div className="grid min-h-[680px] lg:grid-cols-[minmax(0,1fr)_360px] xl:h-[calc(100%-191px)] xl:min-h-0">
              <div className="flex min-h-0 min-w-0 flex-col">
                <div className={cn("flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2", theme.panel, theme.border)}>
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {files.map((file, index) => <button key={`${file.name}-${index}`} onClick={() => setActiveFile(index)} className={cn("group inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold", activeFile === index ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted")}>{file.name}{index > 0 && <span onClick={(event) => { event.stopPropagation(); removeFile(index); }} className="rounded-full p-0.5 opacity-60 hover:bg-muted hover:opacity-100"><X className="h-3 w-3" /></span>}</button>)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input ref={importRef} type="file" accept={codeExtensions} multiple onChange={importFiles} className="hidden" />
                    <button onClick={() => importRef.current?.click()} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground transition-base hover:text-foreground"><FileInput className="h-3.5 w-3.5" /> Import</button>
                    <button onClick={resetStarter} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-muted-foreground transition-base hover:text-foreground"><FilePlus2 className="h-3.5 w-3.5" /> Starter</button>
                    <select value={editorTheme} onChange={(e) => setEditorTheme(e.target.value as keyof typeof editorThemes)} className="h-8 rounded-full border border-border bg-card px-3 text-xs outline-none">{Object.entries(editorThemes).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>
                    <select value={editorFont} onChange={(e) => setEditorFont(e.target.value as keyof typeof editorFonts)} className="h-8 rounded-full border border-border bg-card px-3 text-xs outline-none">{Object.entries(editorFonts).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select>
                  </div>
                </div>
                <textarea value={files[activeFile]?.content ?? ""} onChange={(event) => updateActiveFile(event.target.value)} spellCheck={false} style={{ fontFamily: font.family }} className={cn("min-h-[500px] flex-1 resize-none p-5 text-sm leading-6 text-foreground outline-none selection:bg-primary/30 xl:min-h-0", theme.editor)} />
              </div>
              <aside className="grid border-t border-border bg-secondary/40 lg:border-l lg:border-t-0 lg:grid-rows-[1fr_1fr]">
                <section className="min-h-0 p-4"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2 font-semibold"><Terminal className="h-4 w-4 text-primary" /> Console debugger</div><span className="text-[10px] uppercase text-muted-foreground">{result?.report.execution.runner ?? "idle"}</span></div><div className="mt-3 h-56 overflow-y-auto rounded-xl border border-border bg-background p-3 text-xs leading-5 text-muted-foreground whitespace-pre-wrap lg:h-[calc(100%-32px)]" style={{ fontFamily: font.family }}>{running ? "Running compiler, tests, and scoring rubric..." : debugLines.join("\n\n")}</div></section>
                <section className="min-h-0 border-t border-border p-4"><div className="flex items-center gap-2 font-semibold"><Code2 className="h-4 w-4 text-accent" /> Test results</div><div className="mt-3 max-h-56 space-y-2 overflow-y-auto lg:max-h-[calc(100%-32px)]">{tests.length ? tests.map((test) => <div key={test.name} className="rounded-xl border border-border bg-card p-3 text-xs"><div className="flex items-center gap-2 font-semibold">{test.passed ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <XCircle className="h-4 w-4 text-destructive" />}{test.name}</div>{!test.passed && <p className="mt-2 text-muted-foreground">Expected {test.expected ?? "matching output"}; got {test.actual ?? "no output"}</p>}</div>) : asExamples(selected.examples).map((example, index) => <div key={index} className="rounded-xl border border-border bg-card p-3 text-xs"><p className="font-semibold">Example {index + 1}</p><p className="mt-2 text-muted-foreground"><span className="text-foreground">Input:</span> {example.input}</p><p className="mt-1 text-muted-foreground"><span className="text-foreground">Output:</span> {example.output}</p></div>)}</div></section>
              </aside>
            </div>
          </main>

          <aside className="space-y-4 2xl:h-[calc(100vh-150px)] 2xl:overflow-y-auto">
            <section className="rounded-2xl border border-border bg-card p-4 shadow-card"><div className="flex items-center gap-2 font-display font-bold"><BrainCircuit className="h-4 w-4 text-accent" /> Feedback report</div>{!result ? <div className="mt-10 flex flex-col items-center text-center text-muted-foreground"><Gauge className="h-10 w-10 text-primary" /><h3 className="mt-3 font-display font-bold text-foreground">No report yet</h3><p className="mt-1 text-sm">Run code to generate ATS-style and learning feedback.</p></div> : <div className="mt-4 space-y-4"><div className="rounded-2xl border border-border bg-gradient-card p-4 text-center"><p className="text-xs text-muted-foreground">Employability coding score</p><p className="mt-1 text-5xl font-bold text-accent">{result.employabilityScore}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{result.report.summary}</p></div>{rubric.map(({ label, value, icon: Icon }) => <div key={label}><div className="mb-1 flex items-center justify-between text-xs font-semibold"><span className="flex items-center gap-1.5"><Icon className="h-3.5 w-3.5 text-primary" />{label}</span><span>{value}%</span></div><Progress value={value} className="h-2" /><p className="mt-1 text-[11px] text-muted-foreground">{targetedSuggestion(label, value)}</p></div>)}<div className="rounded-xl bg-secondary p-3"><p className="text-xs font-bold uppercase tracking-wider text-accent">AI failure explanation</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{result.correctnessScore < 80 ? "Your solution likely misses edge cases or returns a different output shape than the tests expect. Review failed test output in the debugger first." : "Tests look strong; next improve explanation, naming, and complexity notes for interview signal."}</p></div><div className="rounded-xl bg-secondary p-3"><p className="text-xs font-bold uppercase tracking-wider text-warning">Roadmap priority</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Prioritize {lowestRubric?.label ?? "Correctness"}: this maps to roadmap skills for problem solving, assessment readiness, and technical interviews.</p></div></div>}</section>
            <section className="rounded-2xl border border-border bg-card p-4 shadow-card"><div className="flex items-center gap-2 font-display font-bold"><History className="h-4 w-4 text-primary" /> Submission history</div>{history.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Your scored attempts will appear here.</p> : <div className="mt-4 space-y-3"><div className="flex h-20 items-end gap-1 rounded-xl bg-secondary p-3">{trend.map((item) => <div key={item.id} className="flex-1 rounded-t bg-primary" style={{ height: `${Math.max(12, item.score)}%` }} title={`${item.score}%`} />)}</div>{history.slice(0, 5).map((item) => <div key={item.id} className="rounded-xl border border-border bg-secondary p-3"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.problemTitle}</p><p className="text-[11px] text-muted-foreground">{labels[item.language]} · {new Date(item.createdAt).toLocaleDateString()}</p></div><span className="font-bold text-accent">{item.score}</span></div><button onClick={() => retake(item)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary"><RotateCcw className="h-3 w-3" /> Retake</button></div>)}</div>}</section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
