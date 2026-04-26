DROP POLICY IF EXISTS "Authenticated users can view coding problems" ON public.coding_problems;

CREATE POLICY "Anyone can view coding problems"
ON public.coding_problems
FOR SELECT
USING (true);