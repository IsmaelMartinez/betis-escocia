ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: Authenticated users can see their own, admins can see all
CREATE POLICY "Contact submissions: authenticated users can view their own, admins can view all" ON public.contact_submissions
FOR SELECT TO authenticated
USING (
  (auth.jwt()->>'sub' = user_id) OR ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
);

-- Policy for SELECT: Anonymous users can view submissions where user_id is null
CREATE POLICY "Contact submissions: anonymous users can view unlinked submissions" ON public.contact_submissions
FOR SELECT TO anon
USING (
  user_id IS NULL
);

-- Policy for INSERT: Authenticated users can insert, anonymous users can insert (user_id will be null)
CREATE POLICY "Contact submissions: authenticated and anonymous users can insert" ON public.contact_submissions
FOR INSERT TO authenticated, anon
WITH CHECK (
  (auth.jwt()->>'sub' = user_id) OR (user_id IS NULL)
);

-- Policy for UPDATE: Authenticated users can update their own, admins can update all
CREATE POLICY "Contact submissions: authenticated users can update their own, admins can update all" ON public.contact_submissions
FOR UPDATE TO authenticated
USING (
  (auth.jwt()->>'sub' = user_id) OR ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
);

-- Policy for DELETE: Authenticated users can delete their own, admins can delete all
CREATE POLICY "Contact submissions: authenticated users can delete their own, admins can delete all" ON public.contact_submissions
FOR DELETE TO authenticated
USING (
  (auth.jwt()->>'sub' = user_id) OR ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
);