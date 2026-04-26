CREATE TABLE public.coding_problems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  examples JSONB NOT NULL DEFAULT '[]'::jsonb,
  constraints_text TEXT,
  supported_languages TEXT[] NOT NULL DEFAULT ARRAY['javascript','python','java','cpp'],
  starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
  hidden_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  scoring_weights JSONB NOT NULL DEFAULT '{"correctness":45,"quality":30,"speed":15,"communication":10}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.coding_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.coding_problems(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  correctness_score INTEGER NOT NULL DEFAULT 0 CHECK (correctness_score BETWEEN 0 AND 100),
  quality_score INTEGER NOT NULL DEFAULT 0 CHECK (quality_score BETWEEN 0 AND 100),
  speed_score INTEGER NOT NULL DEFAULT 0 CHECK (speed_score BETWEEN 0 AND 100),
  communication_score INTEGER NOT NULL DEFAULT 0 CHECK (communication_score BETWEEN 0 AND 100),
  employability_score INTEGER NOT NULL DEFAULT 0 CHECK (employability_score BETWEEN 0 AND 100),
  report JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'scored' CHECK (status IN ('queued','running','scored','failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view coding problems"
ON public.coding_problems
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their own coding submissions"
ON public.coding_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coding submissions"
ON public.coding_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_coding_submissions_user_created ON public.coding_submissions(user_id, created_at DESC);
CREATE INDEX idx_coding_submissions_problem ON public.coding_submissions(problem_id);

INSERT INTO public.coding_problems (slug, title, difficulty, category, prompt, input_format, output_format, examples, constraints_text, starter_code, hidden_tests)
VALUES
('two-sum-readiness', 'Two Sum Readiness', 'easy', 'Arrays', 'Given an array of integers and a target, return the indexes of two numbers that add up to the target. Optimize for clarity and time complexity.', 'nums: number[], target: number', 'number[] with two indexes', '[{"input":"nums=[2,7,11,15], target=9","output":"[0,1]"}]'::jsonb, '2 <= nums.length <= 10^4. Exactly one valid answer exists.', '{"javascript":"function twoSum(nums, target) {\n  // Write your solution here\n}\n","python":"def two_sum(nums, target):\n    # Write your solution here\n    pass\n","java":"class Solution {\n  public int[] twoSum(int[] nums, int target) {\n    // Write your solution here\n    return new int[]{};\n  }\n}\n","cpp":"#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n  vector<int> twoSum(vector<int>& nums, int target) {\n    // Write your solution here\n    return {};\n  }\n};\n"}'::jsonb, '[{"input":{"nums":[3,2,4],"target":6},"output":[1,2]},{"input":{"nums":[-1,-2,-3,-4,-5],"target":-8},"output":[2,4]}]'::jsonb),
('api-log-parser', 'API Log Parser', 'medium', 'Backend', 'Parse a list of API log lines and return counts by status family: 2xx, 4xx, and 5xx. Handle malformed lines gracefully.', 'logs: string[]', 'object with keys success, clientError, serverError', '[{"input":"[\"GET /users 200\", \"POST /login 401\"]","output":"{ success: 1, clientError: 1, serverError: 0 }"}]'::jsonb, '1 <= logs.length <= 10^5. Status code is the last token when present.', '{"javascript":"function summarizeLogs(logs) {\n  // Write your solution here\n}\n","python":"def summarize_logs(logs):\n    # Write your solution here\n    pass\n","java":"import java.util.*;\nclass Solution {\n  public Map<String, Integer> summarizeLogs(List<String> logs) {\n    // Write your solution here\n    return new HashMap<>();\n  }\n}\n","cpp":"#include <vector>\n#include <string>\n#include <map>\nusing namespace std;\n\nmap<string, int> summarizeLogs(vector<string> logs) {\n  // Write your solution here\n  return {};\n}\n"}'::jsonb, '[{"input":{"logs":["GET /a 200","POST /b 500","bad-line","GET /c 404"]},"output":{"success":1,"clientError":1,"serverError":1}}]'::jsonb),
('portfolio-score-normalizer', 'Portfolio Score Normalizer', 'medium', 'Data', 'Normalize raw project scores to percentages and return the average rounded to the nearest integer. Ignore invalid scores outside 0-100.', 'scores: number[]', 'integer average percentage', '[{"input":"[70, 90, 110]","output":"80"}]'::jsonb, '0 <= scores.length <= 10^5.', '{"javascript":"function averageValidScore(scores) {\n  // Write your solution here\n}\n","python":"def average_valid_score(scores):\n    # Write your solution here\n    pass\n","java":"class Solution {\n  public int averageValidScore(int[] scores) {\n    // Write your solution here\n    return 0;\n  }\n}\n","cpp":"#include <vector>\nusing namespace std;\n\nint averageValidScore(vector<int> scores) {\n  // Write your solution here\n  return 0;\n}\n"}'::jsonb, '[{"input":{"scores":[100,50,-4,51]},"output":67}]'::jsonb);