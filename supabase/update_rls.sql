-- ==============================================================================
-- CIVIC INTELLIGENCE — Quick RLS Update for Prototype
-- Paste and Run in Supabase Cloud -> SQL Editor to allow prototype inserts
-- ==============================================================================

DROP POLICY IF EXISTS "Citizens can insert complaints" ON public.complaints;
DROP POLICY IF EXISTS "Anyone can insert complaints" ON public.complaints;
CREATE POLICY "Anyone can insert complaints" 
    ON public.complaints FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Complaints are viewable by all authenticated users" ON public.complaints;
DROP POLICY IF EXISTS "Complaints are viewable by all users" ON public.complaints;
CREATE POLICY "Complaints are viewable by all users" 
    ON public.complaints FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Admins can update any complaint" ON public.complaints;
DROP POLICY IF EXISTS "Workers can update assigned complaints" ON public.complaints;
DROP POLICY IF EXISTS "Complaints can be updated" ON public.complaints;
CREATE POLICY "Complaints can be updated" 
    ON public.complaints FOR UPDATE 
    USING (true);

DROP POLICY IF EXISTS "AI analyses insertable and editable by service role or admin" ON public.ai_analyses;
DROP POLICY IF EXISTS "AI analyses manageable by all roles" ON public.ai_analyses;
CREATE POLICY "AI analyses manageable by all roles" 
    ON public.ai_analyses FOR ALL 
    USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert complaint images" ON public.complaint_images;
DROP POLICY IF EXISTS "Anyone can insert complaint images" ON public.complaint_images;
CREATE POLICY "Anyone can insert complaint images" 
    ON public.complaint_images FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Status history insertable by authenticated users" ON public.status_history;
DROP POLICY IF EXISTS "Status history insertable by all roles" ON public.status_history;
CREATE POLICY "Status history insertable by all roles" 
    ON public.status_history FOR INSERT 
    WITH CHECK (true);

DROP POLICY IF EXISTS "Duplicates manageable by admins and service role" ON public.complaint_duplicates;
DROP POLICY IF EXISTS "Duplicates manageable by all roles" ON public.complaint_duplicates;
CREATE POLICY "Duplicates manageable by all roles" 
    ON public.complaint_duplicates FOR ALL 
    USING (true);

DROP POLICY IF EXISTS "Action briefs manageable by admins and service role" ON public.ai_action_briefs;
DROP POLICY IF EXISTS "Action briefs manageable by all roles" ON public.ai_action_briefs;
CREATE POLICY "Action briefs manageable by all roles" 
    ON public.ai_action_briefs FOR ALL 
    USING (true);
