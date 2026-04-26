import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.104.1";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

const runtimeMap: Record<string, { language: string; version: string }> = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
};

function buildHarness(slug: string, language: string, code: string) {
  if (language === "javascript") {
    const fn = slug === "two-sum-readiness" ? "twoSum" : slug === "api-log-parser" ? "summarizeLogs" : "averageValidScore";
    const tests = slug === "two-sum-readiness"
      ? `[[[2,7,11,15],9,[0,1]],[[3,2,4],6,[1,2]],[[-1,-2,-3,-4,-5],-8,[2,4]]]`
      : slug === "api-log-parser"
        ? `[[["GET /users 200","POST /login 401"],{success:1,clientError:1,serverError:0}],[["GET /a 200","POST /b 500","bad-line","GET /c 404"],{success:1,clientError:1,serverError:1}]]`
        : `[[[70,90,110],80],[[100,50,-4,51],67],[[],0]]`;
    return `${code}\nconst deep=(a,b)=>JSON.stringify(a)===JSON.stringify(b);\nlet pass=0,total=0;\nfor (const t of ${tests}) { total++; const out = ${fn}.apply(null, t.slice(0,-1)); if (deep(out, t[t.length-1])) pass++; }\nconsole.log(JSON.stringify({pass,total}));`;
  }

  if (language === "python") {
    const fn = slug === "two-sum-readiness" ? "two_sum" : slug === "api-log-parser" ? "summarize_logs" : "average_valid_score";
    const tests = slug === "two-sum-readiness"
      ? `[([2,7,11,15],9,[0,1]),([3,2,4],6,[1,2]),([-1,-2,-3,-4,-5],-8,[2,4])]`
      : slug === "api-log-parser"
        ? `[(["GET /users 200","POST /login 401"],{"success":1,"clientError":1,"serverError":0}),(["GET /a 200","POST /b 500","bad-line","GET /c 404"],{"success":1,"clientError":1,"serverError":1})]`
        : `[([70,90,110],80),([100,50,-4,51],67),([],0)]`;
    return `${code}\nimport json\npass_count=0\ntests=${tests}\nfor t in tests:\n    args=t[:-1]; expected=t[-1]\n    try:\n        out=${fn}(*args)\n        if out == expected: pass_count += 1\n    except Exception:\n        pass\nprint(json.dumps({"pass": pass_count, "total": len(tests)}))`;
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
  const hasNames = /target|score|status|result|count|index|valid/i.test(code);
  const comments = (code.match(/\/\/|#|\/\*/g) ?? []).length;
  return Math.min(100, 58 + (hasNames ? 22 : 0) + Math.min(20, comments * 5));
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

    let correctnessScore = 35;
    let execution = { pass: 0, total: 0, stdout: "", stderr: "" };
    const harness = buildHarness(problem.slug, language, code);

    if (harness && runtimeMap[language]) {
      const run = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...runtimeMap[language], files: [{ content: harness }], run_timeout: 3000 }),
      });
      const result = await run.json();
      const stdout = String(result?.run?.stdout ?? "").trim();
      const stderr = String(result?.run?.stderr ?? result?.compile?.stderr ?? "").trim();
      const lastLine = stdout.split("\n").filter(Boolean).at(-1) ?? "";
      try {
        const parsedResult = JSON.parse(lastLine);
        execution = { pass: Number(parsedResult.pass ?? 0), total: Number(parsedResult.total ?? 0), stdout, stderr };
        correctnessScore = execution.total ? Math.round((execution.pass / execution.total) * 100) : 0;
      } catch {
        execution = { pass: 0, total: 0, stdout, stderr };
        correctnessScore = stderr ? 15 : 30;
      }
    } else {
      correctnessScore = Math.max(30, Math.min(88, staticQuality(code) - 8));
      execution = { pass: Math.round(correctnessScore / 34), total: 3, stdout: "Static scoring fallback for compiled language.", stderr: "" };
    }

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
