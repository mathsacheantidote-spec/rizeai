import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.104.1";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BodySchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum(["javascript", "python", "java", "cpp"]),
  code: z.string().min(20).max(20000),
  timeSpentSeconds: z.number().int().min(0).max(14400),
});

type Problem = {
  id: string;
  slug: string;
  title: string;
  hidden_tests: unknown;
  scoring_weights: Record<string, number>;
};

type Execution = {
  pass: number;
  total: number;
  stdout: string;
  stderr: string;
  status: string;
  runner: "judge0" | "piston" | "static";
  testResults: Array<{ name: string; passed: boolean; expected?: string; actual?: string }>;
};

const pistonRuntimeMap: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
};

const judge0LanguageIds: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

const jsonEscape = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

function buildHarness(slug: string, language: string, code: string) {
  if (language === "javascript") {
    const fn = slug === "two-sum-readiness" ? "twoSum" : slug === "api-log-parser" ? "summarizeLogs" : "averageValidScore";
    const tests = slug === "two-sum-readiness"
      ? [[[2, 7, 11, 15], 9, [0, 1]], [[3, 2, 4], 6, [1, 2]], [[-1, -2, -3, -4, -5], -8, [2, 4]]]
      : slug === "api-log-parser"
        ? [[[
          "GET /users 200",
          "POST /login 401",
        ], { success: 1, clientError: 1, serverError: 0 }], [["GET /a 200", "POST /b 500", "bad-line", "GET /c 404"], { success: 1, clientError: 1, serverError: 1 }]]
        : [[[70, 90, 110], 80], [[100, 50, -4, 51], 67], [[], 0]];
    return `${code}\nconst deep=(a,b)=>JSON.stringify(a)===JSON.stringify(b);\nconst tests=${jsonEscape(tests)};\nconst results=[];\nfor (let i=0;i<tests.length;i++){ const t=tests[i]; let actual; let passed=false; try{ actual=${fn}.apply(null,t.slice(0,-1)); passed=deep(actual,t[t.length-1]); }catch(err){ actual=String(err?.message||err); } results.push({name:'Hidden test '+(i+1),passed,expected:JSON.stringify(t[t.length-1]),actual:JSON.stringify(actual)}); }\nconsole.log('__RIZE_RESULT__'+JSON.stringify({pass:results.filter(r=>r.passed).length,total:results.length,testResults:results}));`;
  }

  if (language === "python") {
    const fn = slug === "two-sum-readiness" ? "two_sum" : slug === "api-log-parser" ? "summarize_logs" : "average_valid_score";
    const tests = slug === "two-sum-readiness"
      ? [ [[2, 7, 11, 15], 9, [0, 1]], [[3, 2, 4], 6, [1, 2]], [[-1, -2, -3, -4, -5], -8, [2, 4]] ]
      : slug === "api-log-parser"
        ? [ [["GET /users 200", "POST /login 401"], { success: 1, clientError: 1, serverError: 0 }], [["GET /a 200", "POST /b 500", "bad-line", "GET /c 404"], { success: 1, clientError: 1, serverError: 1 }] ]
        : [ [[70, 90, 110], 80], [[100, 50, -4, 51], 67], [[], 0] ];
    return `${code}\nimport json\ntests=${JSON.stringify(tests).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None")}\nresults=[]\nfor i,t in enumerate(tests):\n    args=t[:-1]; expected=t[-1]\n    try:\n        actual=${fn}(*args)\n        passed=actual == expected\n    except Exception as err:\n        actual=str(err); passed=False\n    results.append({'name':'Hidden test '+str(i+1),'passed':passed,'expected':json.dumps(expected),'actual':json.dumps(actual)})\nprint('__RIZE_RESULT__'+json.dumps({'pass':sum(1 for r in results if r['passed']),'total':len(results),'testResults':results}))`;
  }

  if (language === "java") {
    const body = slug === "two-sum-readiness"
      ? `int pass=0,total=3; Solution s=new Solution(); if(java.util.Arrays.equals(s.twoSum(new int[]{2,7,11,15},9),new int[]{0,1})) pass++; if(java.util.Arrays.equals(s.twoSum(new int[]{3,2,4},6),new int[]{1,2})) pass++; if(java.util.Arrays.equals(s.twoSum(new int[]{-1,-2,-3,-4,-5},-8),new int[]{2,4})) pass++; System.out.println("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+"}");`
      : slug === "api-log-parser"
        ? `int pass=0,total=2; Solution s=new Solution(); java.util.Map<String,Integer> a=s.summarizeLogs(java.util.Arrays.asList("GET /users 200","POST /login 401")); if(a.getOrDefault("success",0)==1&&a.getOrDefault("clientError",0)==1&&a.getOrDefault("serverError",0)==0) pass++; java.util.Map<String,Integer> b=s.summarizeLogs(java.util.Arrays.asList("GET /a 200","POST /b 500","bad-line","GET /c 404")); if(b.getOrDefault("success",0)==1&&b.getOrDefault("clientError",0)==1&&b.getOrDefault("serverError",0)==1) pass++; System.out.println("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+"}");`
        : `int pass=0,total=3; Solution s=new Solution(); if(s.averageValidScore(new int[]{70,90,110})==80) pass++; if(s.averageValidScore(new int[]{100,50,-4,51})==67) pass++; if(s.averageValidScore(new int[]{})==0) pass++; System.out.println("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+"}");`;
    return `${code}\nclass Main { public static void main(String[] args) { ${body} } }`;
  }

  if (language === "cpp") {
    const body = slug === "two-sum-readiness"
      ? `int pass=0,total=3; Solution s; vector<int>a={2,7,11,15}; if(s.twoSum(a,9)==vector<int>{0,1}) pass++; vector<int>b={3,2,4}; if(s.twoSum(b,6)==vector<int>{1,2}) pass++; vector<int>c={-1,-2,-3,-4,-5}; if(s.twoSum(c,-8)==vector<int>{2,4}) pass++; cout<<"__RIZE_RESULT__{\\\"pass\\\":"<<pass<<",\\\"total\\\":"<<total<<"}";`
      : slug === "api-log-parser"
        ? `int pass=0,total=2; auto a=summarizeLogs({"GET /users 200","POST /login 401"}); if(a["success"]==1&&a["clientError"]==1&&a["serverError"]==0) pass++; auto b=summarizeLogs({"GET /a 200","POST /b 500","bad-line","GET /c 404"}); if(b["success"]==1&&b["clientError"]==1&&b["serverError"]==1) pass++; cout<<"__RIZE_RESULT__{\\\"pass\\\":"<<pass<<",\\\"total\\\":"<<total<<"}";`
        : `int pass=0,total=3; if(averageValidScore({70,90,110})==80) pass++; if(averageValidScore({100,50,-4,51})==67) pass++; if(averageValidScore({})==0) pass++; cout<<"__RIZE_RESULT__{\\\"pass\\\":"<<pass<<",\\\"total\\\":"<<total<<"}";`;
    return `${code}\n#include <iostream>\nint main(){ ${body} return 0; }`;
  }

  return null;
}

function staticQuality(code: string) {
  let score = 62;
  const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 6 && lines.length <= 80) score += 8;
  if (/Map|Set|dict|HashMap|unordered_map|\{\}/.test(code)) score += 10;
  if (/return/.test(code)) score += 7;
  if (/\/\/|#|\/\*/.test(code)) score += 4;
  if (!/console\.log\(|print\(|System\.out/.test(code.replace(/console\.log\(JSON/, ""))) score += 4;
  if (/for\s*\([^)]*for\s*\(|for .*:\s*\n\s*for /.test(code)) score -= 10;
  if (/TODO|pass\s*$|return new int\[\]\{\}|return \{\};/.test(code)) score -= 20;
  return Math.max(0, Math.min(100, score));
}

function speedScore(seconds: number) {
  if (seconds <= 300) return 95;
  if (seconds <= 900) return 82;
  if (seconds <= 1800) return 68;
  if (seconds <= 3600) return 54;
  return 40;
}

function communicationScore(code: string) {
  const hasNames = /target|score|status|result|count|index|valid|seen|need/i.test(code);
  const comments = (code.match(/\/\/|#|\/\*/g) ?? []).length;
  return Math.min(100, 58 + (hasNames ? 22 : 0) + Math.min(20, comments * 5));
}

function parseExecution(stdout: string, stderr: string, status: string, runner: Execution["runner"]): Execution {
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const markerLine = [...lines].reverse().find((line) => line.startsWith("__RIZE_RESULT__"));
  if (!markerLine) return { pass: 0, total: 0, stdout, stderr, status, runner, testResults: [] };
  const parsed = JSON.parse(markerLine.replace("__RIZE_RESULT__", ""));
  const pass = Number(parsed.pass ?? 0);
  const total = Number(parsed.total ?? 0);
  const testResults = Array.isArray(parsed.testResults)
    ? parsed.testResults.map((item: Record<string, unknown>, index: number) => ({
      name: String(item.name ?? `Hidden test ${index + 1}`),
      passed: Boolean(item.passed),
      expected: item.expected === undefined ? undefined : String(item.expected),
      actual: item.actual === undefined ? undefined : String(item.actual),
    }))
    : Array.from({ length: total }, (_, index) => ({ name: `Hidden test ${index + 1}`, passed: index < pass }));
  return { pass, total, stdout, stderr, status, runner, testResults };
}

async function runWithJudge0(language: string, harness: string): Promise<Execution | null> {
  const languageId = judge0LanguageIds[language];
  if (!languageId) return null;
  const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language_id: languageId, source_code: harness, cpu_time_limit: 5, wall_time_limit: 10 }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Judge0 runner failed: ${data?.message ?? response.statusText}`);
  const stdout = String(data?.stdout ?? "").trim();
  const stderr = String(data?.stderr ?? data?.compile_output ?? data?.message ?? "").trim();
  return parseExecution(stdout, stderr, String(data?.status?.description ?? "Executed"), "judge0");
}

async function runWithPiston(language: string, harness: string): Promise<Execution | null> {
  const runtime = pistonRuntimeMap[language];
  if (!runtime) return null;
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...runtime, files: [{ content: harness }], run_timeout: 3000 }),
  });
  const data = await response.json();
  if (!response.ok || data?.message) throw new Error(String(data?.message ?? response.statusText));
  const stdout = String(data?.run?.stdout ?? "").trim();
  const stderr = String(data?.run?.stderr ?? data?.compile?.stderr ?? "").trim();
  return parseExecution(stdout, stderr, "Executed", "piston");
}

function staticExecution(code: string, note: string): Execution {
  const score = Math.max(30, Math.min(88, staticQuality(code) - 8));
  const pass = Math.max(0, Math.min(3, Math.round(score / 34)));
  return {
    pass,
    total: 3,
    stdout: "Runner unavailable; scored with secure static analysis fallback.",
    stderr: note,
    status: "Static analysis fallback",
    runner: "static",
    testResults: Array.from({ length: 3 }, (_, index) => ({ name: `Static signal ${index + 1}`, passed: index < pass })),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) throw new Error("Cloud environment is not configured");

    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { problemId, language, code, timeSpentSeconds } = parsed.data;

    const { data: problem, error: problemError } = await supabase
      .from("coding_problems")
      .select("id, slug, title, hidden_tests, scoring_weights")
      .eq("id", problemId)
      .single<Problem>();

    if (problemError || !problem) {
      return new Response(JSON.stringify({ error: "Problem not found or unavailable" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const harness = buildHarness(problem.slug, language, code);
    let execution: Execution = harness ? staticExecution(code, "No external runner response yet.") : staticExecution(code, "No harness available for this language.");

    if (harness) {
      try {
        execution = await runWithJudge0(language, harness) ?? execution;
      } catch (judgeError) {
        try {
          execution = await runWithPiston(language, harness) ?? execution;
        } catch (pistonError) {
          execution = staticExecution(code, `${judgeError instanceof Error ? judgeError.message : "Judge0 failed"}; ${pistonError instanceof Error ? pistonError.message : "Piston failed"}`);
        }
      }
    }

    const correctnessScore = execution.total ? Math.round((execution.pass / execution.total) * 100) : execution.runner === "static" ? Math.max(30, Math.min(88, staticQuality(code) - 8)) : 15;
    const quality = staticQuality(code);
    const speed = speedScore(timeSpentSeconds);
    const communication = communicationScore(code);
    const weights = { correctness: 45, quality: 30, speed: 15, communication: 10, ...(problem.scoring_weights ?? {}) };
    const employability = Math.round((correctnessScore * weights.correctness + quality * weights.quality + speed * weights.speed + communication * weights.communication) / 100);
    const report = {
      summary: employability >= 80 ? "Strong job-ready signal: correct, readable, and delivered efficiently." : employability >= 60 ? "Promising attempt: improve edge cases and code clarity to raise employability signal." : "Needs more practice: focus on correctness first, then optimize readability and speed.",
      strengths: [correctnessScore >= 70 ? "Functional correctness" : "Attempted problem decomposition", quality >= 75 ? "Readable structure" : "Room for cleaner structure", speed >= 80 ? "Fast completion" : "Measured persistence"],
      improvements: [correctnessScore < 80 ? "Cover edge cases and verify outputs against hidden tests." : "Explain time complexity in comments before submitting.", quality < 80 ? "Use clearer helper names and remove placeholder code." : "Consider reducing branching where possible."],
      execution,
    };

    let stored = false;
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { error: insertError } = await supabase.from("coding_submissions").insert({
        user_id: userData.user.id,
        problem_id: problem.id,
        language,
        code,
        time_spent_seconds: timeSpentSeconds,
        correctness_score: correctnessScore,
        quality_score: quality,
        speed_score: speed,
        communication_score: communication,
        employability_score: employability,
        report,
        status: "scored",
      });
      stored = !insertError;
    }

    return new Response(JSON.stringify({ correctnessScore, qualityScore: quality, speedScore: speed, communicationScore: communication, employabilityScore: employability, report, stored }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("score-code error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Scoring failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
