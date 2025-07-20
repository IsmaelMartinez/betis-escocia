
CREATE TABLE classification_cache (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.classification_cache ENABLE ROW LEVEL SECURITY;

-- Create a default restrictive policy
CREATE POLICY "Restrict all access by default" ON public.classification_cache
FOR ALL USING (false)
WITH CHECK (false);

-- Grant SELECT access to the anonymous role
CREATE POLICY "Allow anonymous read access" ON public.classification_cache
FOR SELECT USING (true);

-- Grant INSERT access to the anonymous role
CREATE POLICY "Allow anonymous write access" ON public.classification_cache
FOR INSERT WITH CHECK (true);
