import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.104.1";
import { z } from "npm:zod@3.25.76";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const languages = ["javascript", "typescript", "python", "java", "cpp", "csharp", "go", "ruby", "php"] as const;
const BodySchema = z.object({
  problemId: z.string().uuid(),
  language: z.enum(languages),
  code: z.string().min(8).max(40000),
  files: z.array(z.object({ name: z.string().max(120), content: z.string().max(40000) })).max(12).optional(),
  timeSpentSeconds: z.number().int().min(0).max(14400),
});

type Problem = { id: string; slug: string; title: string; hidden_tests: unknown; scoring_weights: Record<string, number> };
type Language = typeof languages[number];
type Execution = {
  pass: number;
  total: number;
  stdout: string;
  stderr: string;
  status: string;
  runner: "judge0" | "piston" | "static";
  testResults: Array<{ name: string; passed: boolean; expected?: string; actual?: string }>;
};

type FilePayload = { name: string; content: string };

const pistonRuntimeMap: Partial<Record<Language, { language: string; version: string }>> = {
  javascript: { language: "javascript", version: "20.11.1" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.12.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
  csharp: { language: "csharp", version: "6.12.0" },
  go: { language: "go", version: "1.16.2" },
  ruby: { language: "ruby", version: "3.0.1" },
  php: { language: "php", version: "8.2.3" },
};

const judge0LanguageIds: Record<Language, number> = {
  javascript: 63,
  typescript: 74,
  python: 71,
  java: 62,
  cpp: 54,
  csharp: 51,
  go: 60,
  ruby: 72,
  php: 68,
};

const jsonEscape = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");
const pyLiteral = (value: unknown) => JSON.stringify(value).replace(/true/g, "True").replace(/false/g, "False").replace(/null/g, "None");
const phpValue = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(phpValue).join(",")}]`;
  if (value && typeof value === "object") return `[${Object.entries(value).map(([k, v]) => `${JSON.stringify(k)}=>${phpValue(v)}`).join(",")}]`;
  return JSON.stringify(value);
};

function problemSpec(slug: string) {
  if (slug === "api-log-parser") {
    return {
      key: "logs",
      jsName: "summarizeLogs",
      pyName: "summarize_logs",
      csName: "SummarizeLogs",
      goName: "summarizeLogs",
      rbName: "summarize_logs",
      tests: [
        { args: [["GET /users 200", "POST /login 401"]], expected: { success: 1, clientError: 1, serverError: 0 } },
        { args: [["GET /a 200", "POST /b 500", "bad-line", "GET /c 404"]], expected: { success: 1, clientError: 1, serverError: 1 } },
      ],
    };
  }
  if (slug === "portfolio-score-normalizer") {
    return {
      key: "average",
      jsName: "averageValidScore",
      pyName: "average_valid_score",
      csName: "AverageValidScore",
      goName: "averageValidScore",
      rbName: "average_valid_score",
      tests: [
        { args: [[70, 90, 110]], expected: 80 },
        { args: [[100, 50, -4, 51]], expected: 67 },
        { args: [[]], expected: 0 },
      ],
    };
  }
  return {
    key: "twoSum",
    jsName: "twoSum",
    pyName: "two_sum",
    csName: "TwoSum",
    goName: "twoSum",
    rbName: "two_sum",
    tests: [
      { args: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { args: [[3, 2, 4], 6], expected: [1, 2] },
      { args: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] },
    ],
  };
}

function auxCode(files: FilePayload[] | undefined, primary: string) {
  return (files ?? [])
    .filter((file) => !/^solution\.|^notes\.md$|^tests\.txt$/i.test(file.name) && file.content.trim() && file.content !== primary)
    .map((file) => `\n/* imported: ${file.name.replace(/\*\//g, "")} */\n${file.content}`)
    .join("\n");
}

function buildHarness(slug: string, language: Language, code: string, files?: FilePayload[]) {
  const spec = problemSpec(slug);
  const extra = auxCode(files, code);
  const fullCode = `${code}\n${extra}`;

  if (language === "javascript" || language === "typescript") {
    const tests = spec.tests.map((test) => [...test.args, test.expected]);
    return `${fullCode}\nconst deep=(a,b)=>JSON.stringify(a)===JSON.stringify(b);\nconst tests=${jsonEscape(tests)};\nconst results=[];\nfor (let i=0;i<tests.length;i++){ const t=tests[i]; let actual; let passed=false; try{ actual=${spec.jsName}.apply(null,t.slice(0,-1)); passed=deep(actual,t[t.length-1]); }catch(err){ actual=String((err && err.message) || err); } results.push({name:'Hidden test '+(i+1),passed,expected:JSON.stringify(t[t.length-1]),actual:JSON.stringify(actual)}); }\nconsole.log('__RIZE_RESULT__'+JSON.stringify({pass:results.filter(r=>r.passed).length,total:results.length,testResults:results}));`;
  }

  if (language === "python") {
    const tests = spec.tests.map((test) => [...test.args, test.expected]);
    return `${fullCode}\nimport json\ntests=${pyLiteral(tests)}\nresults=[]\nfor i,t in enumerate(tests):\n    args=t[:-1]; expected=t[-1]\n    try:\n        actual=${spec.pyName}(*args)\n        passed=actual == expected\n    except Exception as err:\n        actual=str(err); passed=False\n    results.append({'name':'Hidden test '+str(i+1),'passed':passed,'expected':json.dumps(expected),'actual':json.dumps(actual)})\nprint('__RIZE_RESULT__'+json.dumps({'pass':sum(1 for r in results if r['passed']),'total':len(results),'testResults':results}))`;
  }

  if (language === "ruby") {
    const tests = spec.tests.map((test) => [...test.args, test.expected]);
    return `${fullCode}\nrequire 'json'\ntests = ${jsonEscape(tests)}\nresults = []\ntests.each_with_index do |t, i|\n  expected = t[-1]\n  begin\n    actual = send(:${spec.rbName}, *t[0...-1])\n    passed = actual == expected\n  rescue => err\n    actual = err.message\n    passed = false\n  end\n  results << { name: "Hidden test #{i + 1}", passed: passed, expected: expected.to_json, actual: actual.to_json }\nend\nputs '__RIZE_RESULT__' + { pass: results.count { |r| r[:passed] }, total: results.length, testResults: results }.to_json`;
  }

  if (language === "php") {
    const cases = spec.tests.map((test, index) => `{ "name" => "Hidden test ${index + 1}", "args" => [${test.args.map(phpValue).join(",")}], "expected" => ${phpValue(test.expected)} }`).join(",");
    const cleanCode = fullCode.replace(/^\s*<\?php/, "");
    return `<?php\n${cleanCode}\n$tests = [${cases}];\n$results = [];\nforeach ($tests as $t) {\n  try {\n    $actual = call_user_func_array('${spec.jsName}', $t['args']);\n    $passed = $actual == $t['expected'];\n  } catch (Throwable $err) {\n    $actual = $err->getMessage();\n    $passed = false;\n  }\n  $results[] = ['name'=>$t['name'], 'passed'=>$passed, 'expected'=>json_encode($t['expected']), 'actual'=>json_encode($actual)];\n}\n$pass = count(array_filter($results, fn($r) => $r['passed']));\necho '__RIZE_RESULT__'.json_encode(['pass'=>$pass, 'total'=>count($results), 'testResults'=>$results]);\n?>`;
  }

  if (language === "java") {
    const body = spec.key === "twoSum"
      ? `int pass=0,total=3; java.util.List<String> rows=new java.util.ArrayList<>(); Solution s=new Solution(); int[] a=s.twoSum(new int[]{2,7,11,15},9); boolean p1=java.util.Arrays.equals(a,new int[]{0,1}); if(p1) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 1\\\",\\\"passed\\\":"+p1+",\\\"expected\\\":\\\"[0,1]\\\",\\\"actual\\\":\\\""+java.util.Arrays.toString(a).replace(" ","")+"\\\"}"); int[] b=s.twoSum(new int[]{3,2,4},6); boolean p2=java.util.Arrays.equals(b,new int[]{1,2}); if(p2) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 2\\\",\\\"passed\\\":"+p2+",\\\"expected\\\":\\\"[1,2]\\\",\\\"actual\\\":\\\""+java.util.Arrays.toString(b).replace(" ","")+"\\\"}"); int[] c=s.twoSum(new int[]{-1,-2,-3,-4,-5},-8); boolean p3=java.util.Arrays.equals(c,new int[]{2,4}); if(p3) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 3\\\",\\\"passed\\\":"+p3+",\\\"expected\\\":\\\"[2,4]\\\",\\\"actual\\\":\\\""+java.util.Arrays.toString(c).replace(" ","")+"\\\"}"); System.out.println("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+",\\\"testResults\\\":["+String.join(",",rows)+"]}");`
      : spec.key === "logs"
        ? `int pass=0,total=2; java.util.List<String> rows=new java.util.ArrayList<>(); Solution s=new Solution(); java.util.Map<String,Integer> a=s.summarizeLogs(java.util.Arrays.asList("GET /users 200","POST /login 401")); boolean p1=a.getOrDefault("success",0)==1&&a.getOrDefault("clientError",0)==1&&a.getOrDefault("serverError",0)==0; if(p1) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 1\\\",\\\"passed\\\":"+p1+",\\\"expected\\\":\\\"{success:1,clientError:1,serverError:0}\\\",\\\"actual\\\":\\\""+a.toString().replace("\\\"","'")+"\\\"}"); java.util.Map<String,Integer> b=s.summarizeLogs(java.util.Arrays.asList("GET /a 200","POST /b 500","bad-line","GET /c 404")); boolean p2=b.getOrDefault("success",0)==1&&b.getOrDefault("clientError",0)==1&&b.getOrDefault("serverError",0)==1; if(p2) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 2\\\",\\\"passed\\\":"+p2+",\\\"expected\\\":\\\"{success:1,clientError:1,serverError:1}\\\",\\\"actual\\\":\\\""+b.toString().replace("\\\"","'")+"\\\"}"); System.out.println("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+",\\\"testResults\\\":["+String.join(",",rows)+"]}");`
        : `int pass=0,total=3; java.util.List<String> rows=new java.util.ArrayList<>(); Solution s=new Solution(); int a=s.averageValidScore(new int[]{70,90,110}); boolean p1=a==80; if(p1) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 1\\\",\\\"passed\\\":"+p1+",\\\"expected\\\":\\\"80\\\",\\\"actual\\\":\\\""+a+"\\\"}"); int b=s.averageValidScore(new int[]{100,50,-4,51}); boolean p2=b==67; if(p2) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 2\\\",\\\"passed\\\":"+p2+",\\\"expected\\\":\\\"67\\\",\\\"actual\\\":\\\""+b+"\\\"}"); int c=s.averageValidScore(new int[]{}); boolean p3=c==0; if(p3) pass++; rows.add("{\\\"name\\\":\\\"Hidden test 3\\\",\\\"passed\\\":"+p3+",\\\"expected\\\":\\\"0\\\",\\\"actual\\\":\\\""+c+"\\\"}"); System.out.println("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+",\\\"testResults\\\":["+String.join(",",rows)+"]}");`;
    return `${fullCode}\nclass Main { public static void main(String[] args) { ${body} } }`;
  }

  if (language === "cpp") {
    const body = spec.key === "twoSum"
      ? `int pass=0,total=3; vector<string> rows; Solution s; vector<int>a={2,7,11,15}; auto r1=s.twoSum(a,9); bool p1=r1==vector<int>{0,1}; if(p1) pass++; rows.push_back("{\\\"name\\\":\\\"Hidden test 1\\\",\\\"passed\\\":"+string(p1?"true":"false")+",\\\"expected\\\":\\\"[0,1]\\\"}"); vector<int>b={3,2,4}; auto r2=s.twoSum(b,6); bool p2=r2==vector<int>{1,2}; if(p2) pass++; rows.push_back("{\\\"name\\\":\\\"Hidden test 2\\\",\\\"passed\\\":"+string(p2?"true":"false")+",\\\"expected\\\":\\\"[1,2]\\\"}"); vector<int>c={-1,-2,-3,-4,-5}; auto r3=s.twoSum(c,-8); bool p3=r3==vector<int>{2,4}; if(p3) pass++; rows.push_back("{\\\"name\\\":\\\"Hidden test 3\\\",\\\"passed\\\":"+string(p3?"true":"false")+",\\\"expected\\\":\\\"[2,4]\\\"}"); cout<<"__RIZE_RESULT__{\\\"pass\\\":"<<pass<<",\\\"total\\\":"<<total<<",\\\"testResults\\\":["; for(size_t i=0;i<rows.size();++i){ if(i) cout<<","; cout<<rows[i]; } cout<<"]}";`
      : spec.key === "logs"
        ? `int pass=0,total=2; auto a=summarizeLogs({"GET /users 200","POST /login 401"}); if(a["success"]==1&&a["clientError"]==1&&a["serverError"]==0) pass++; auto b=summarizeLogs({"GET /a 200","POST /b 500","bad-line","GET /c 404"}); if(b["success"]==1&&b["clientError"]==1&&b["serverError"]==1) pass++; cout<<"__RIZE_RESULT__{\\\"pass\\\":"<<pass<<",\\\"total\\\":"<<total<<"}";`
        : `int pass=0,total=3; if(averageValidScore({70,90,110})==80) pass++; if(averageValidScore({100,50,-4,51})==67) pass++; if(averageValidScore({})==0) pass++; cout<<"__RIZE_RESULT__{\\\"pass\\\":"<<pass<<",\\\"total\\\":"<<total<<"}";`;
    return `${fullCode}\n#include <iostream>\n#include <string>\nint main(){ ${body} return 0; }`;
  }

  if (language === "csharp") {
    const body = spec.key === "twoSum"
      ? `int pass=0,total=3; var rows=new System.Collections.Generic.List<string>(); var s=new Solution(); var a=s.TwoSum(new int[]{2,7,11,15},9); bool p1=System.Linq.Enumerable.SequenceEqual(a,new int[]{0,1}); if(p1) pass++; rows.Add("{\\\"name\\\":\\\"Hidden test 1\\\",\\\"passed\\\":"+p1.ToString().ToLower()+"}"); var b=s.TwoSum(new int[]{3,2,4},6); bool p2=System.Linq.Enumerable.SequenceEqual(b,new int[]{1,2}); if(p2) pass++; rows.Add("{\\\"name\\\":\\\"Hidden test 2\\\",\\\"passed\\\":"+p2.ToString().ToLower()+"}"); var c=s.TwoSum(new int[]{-1,-2,-3,-4,-5},-8); bool p3=System.Linq.Enumerable.SequenceEqual(c,new int[]{2,4}); if(p3) pass++; rows.Add("{\\\"name\\\":\\\"Hidden test 3\\\",\\\"passed\\\":"+p3.ToString().ToLower()+"}"); System.Console.WriteLine("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+",\\\"testResults\\\":["+string.Join(",",rows)+"]}");`
      : spec.key === "logs"
        ? `int pass=0,total=2; var s=new Solution(); var a=s.SummarizeLogs(new System.Collections.Generic.List<string>{"GET /users 200","POST /login 401"}); if(a.GetValueOrDefault("success")==1&&a.GetValueOrDefault("clientError")==1&&a.GetValueOrDefault("serverError")==0) pass++; var b=s.SummarizeLogs(new System.Collections.Generic.List<string>{"GET /a 200","POST /b 500","bad-line","GET /c 404"}); if(b.GetValueOrDefault("success")==1&&b.GetValueOrDefault("clientError")==1&&b.GetValueOrDefault("serverError")==1) pass++; System.Console.WriteLine("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+"}");`
        : `int pass=0,total=3; var s=new Solution(); if(s.AverageValidScore(new int[]{70,90,110})==80) pass++; if(s.AverageValidScore(new int[]{100,50,-4,51})==67) pass++; if(s.AverageValidScore(new int[]{})==0) pass++; System.Console.WriteLine("__RIZE_RESULT__{\\\"pass\\\":"+pass+",\\\"total\\\":"+total+"}");`;
    return `using System;\nusing System.Collections.Generic;\nusing System.Linq;\n${fullCode}\nclass Program { static void Main() { ${body} } }`;
  }

  if (language === "go") {
    const cleanCode = fullCode.replace(/^\s*package\s+main\s*/, "").trim();
    const body = spec.key === "twoSum"
      ? `pass,total:=0,3\nif reflect.DeepEqual(twoSum([]int{2,7,11,15},9),[]int{0,1}){pass++}\nif reflect.DeepEqual(twoSum([]int{3,2,4},6),[]int{1,2}){pass++}\nif reflect.DeepEqual(twoSum([]int{-1,-2,-3,-4,-5},-8),[]int{2,4}){pass++}\nfmt.Printf("__RIZE_RESULT__{\\\"pass\\\":%d,\\\"total\\\":%d}",pass,total)`
      : spec.key === "logs"
        ? `pass,total:=0,2\na:=summarizeLogs([]string{"GET /users 200","POST /login 401"}); if a["success"]==1&&a["clientError"]==1&&a["serverError"]==0{pass++}\nb:=summarizeLogs([]string{"GET /a 200","POST /b 500","bad-line","GET /c 404"}); if b["success"]==1&&b["clientError"]==1&&b["serverError"]==1{pass++}\nfmt.Printf("__RIZE_RESULT__{\\\"pass\\\":%d,\\\"total\\\":%d}",pass,total)`
        : `pass,total:=0,3\nif averageValidScore([]int{70,90,110})==80{pass++}\nif averageValidScore([]int{100,50,-4,51})==67{pass++}\nif averageValidScore([]int{})==0{pass++}\nfmt.Printf("__RIZE_RESULT__{\\\"pass\\\":%d,\\\"total\\\":%d}",pass,total)`;
    return `package main\nimport (\n  "fmt"\n  "reflect"\n)\n${cleanCode}\nfunc main(){\n${body}\n}`;
  }

  return null;
}

function staticQuality(code: string) {
  let score = 62;
  const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 6 && lines.length <= 100) score += 8;
  if (/Map|Set|dict|HashMap|unordered_map|Dictionary|map\[|\{\}/.test(code)) score += 10;
  if (/return/.test(code)) score += 7;
  if (/\/\/|#|\/\*/.test(code)) score += 4;
  if (!/console\.log\(|print\(|System\.out|Console\.WriteLine|fmt\.Print|echo /.test(code.replace(/console\.log\(JSON/, ""))) score += 4;
  if (/for\s*\([^)]*for\s*\(|for .*:\s*\n\s*for /.test(code)) score -= 10;
  if (/TODO|pass\s*$|return new int\[\]\{\}|return \{\}|return \[\];|return 0;?\s*$/.test(code)) score -= 18;
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
  const hasNames = /target|score|status|result|count|index|valid|seen|need|clientError|serverError/i.test(code);
  const comments = (code.match(/\/\/|#|\/\*/g) ?? []).length;
  return Math.min(100, 58 + (hasNames ? 22 : 0) + Math.min(20, comments * 5));
}

function parseExecution(stdout: string, stderr: string, status: string, runner: Execution["runner"]): Execution {
  const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
  const markerLine = [...lines].reverse().find((line) => line.startsWith("__RIZE_RESULT__"));
  if (!markerLine) return { pass: 0, total: 0, stdout, stderr, status, runner, testResults: [] };
  try {
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
  } catch (_error) {
    return { pass: 0, total: 0, stdout, stderr: `${stderr}\nCould not parse test marker.`, status, runner, testResults: [] };
  }
}

async function runWithJudge0(language: Language, harness: string): Promise<Execution | null> {
  const response = await fetch("https://ce.judge0.com/submissions?base64_encoded=false&wait=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language_id: judge0LanguageIds[language], source_code: harness, cpu_time_limit: 6, wall_time_limit: 12, memory_limit: 128000 }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Judge0 compiler failed: ${data?.message ?? response.statusText}`);
  const stdout = String(data?.stdout ?? "").trim();
  const stderr = String(data?.stderr ?? data?.compile_output ?? data?.message ?? "").trim();
  return parseExecution(stdout, stderr, String(data?.status?.description ?? "Executed"), "judge0");
}

async function runWithPiston(language: Language, harness: string): Promise<Execution | null> {
  const runtime = pistonRuntimeMap[language];
  if (!runtime) return null;
  const ext: Record<Language, string> = { javascript: "js", typescript: "ts", python: "py", java: "java", cpp: "cpp", csharp: "cs", go: "go", ruby: "rb", php: "php" };
  const fileName = language === "java" ? "Main.java" : `main.${ext[language]}`;
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...runtime, files: [{ name: fileName, content: harness }], run_timeout: 5000, compile_timeout: 10000 }),
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
    stdout: "Compiler APIs were unavailable; scored with secure static analysis fallback.",
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
    const { problemId, language, code, files, timeSpentSeconds } = parsed.data;

    const { data: problem, error: problemError } = await supabase
      .from("coding_problems")
      .select("id, slug, title, hidden_tests, scoring_weights")
      .eq("id", problemId)
      .single<Problem>();

    if (problemError || !problem) {
      return new Response(JSON.stringify({ error: "Problem not found or unavailable" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const harness = buildHarness(problem.slug, language, code, files);
    let execution: Execution = harness ? staticExecution(code, "No external compiler response yet.") : staticExecution(code, "No harness available for this language.");

    if (harness) {
      try {
        execution = await runWithPiston(language, harness) ?? execution;
        if (execution.total === 0 && execution.stderr) throw new Error(execution.stderr.slice(0, 500));
      } catch (pistonError) {
        try {
          execution = await runWithJudge0(language, harness) ?? execution;
          if (execution.total === 0 && execution.stderr) throw new Error(execution.stderr.slice(0, 500));
        } catch (judgeError) {
          execution = staticExecution(code, `${pistonError instanceof Error ? pistonError.message : "Piston failed"}; ${judgeError instanceof Error ? judgeError.message : "Judge0 failed"}`);
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
