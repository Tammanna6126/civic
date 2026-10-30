-- ==============================================================================
-- CIVIC INTELLIGENCE — SMART CITY INFRASTRUCTURE MANAGEMENT PLATFORM
-- Migration 001: Initial Schema, Row Level Security (RLS), & Synthetic Seed Data
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. DEPARTMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    contact_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Extends Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'municipal_admin', 'maintenance_worker')) DEFAULT 'citizen',
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. COMPLAINTS TABLE (Core entity)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT NOT NULL UNIQUE,
    citizen_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'pothole', 
        'waterlogging', 
        'garbage', 
        'streetlights', 
        'drainage', 
        'public_hazard', 
        'other'
    )),
    status TEXT NOT NULL CHECK (status IN (
        'submitted', 
        'ai_analyzed', 
        'under_review', 
        'assigned', 
        'in_progress', 
        'resolved', 
        'closed', 
        'rejected'
    )) DEFAULT 'submitted',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT NOT NULL,
    landmark TEXT,
    ward_or_zone TEXT NOT NULL DEFAULT 'Central Zone',
    priority_score INTEGER NOT NULL DEFAULT 0 CHECK (priority_score >= 0 AND priority_score <= 100),
    priority_tier TEXT NOT NULL CHECK (priority_tier IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low',
    is_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    primary_complaint_id UUID REFERENCES public.complaints(id) ON DELETE SET NULL,
    assigned_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. COMPLAINT IMAGES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type TEXT NOT NULL CHECK (image_type IN ('evidence_original', 'resolution_proof')) DEFAULT 'evidence_original',
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. AI ANALYSES TABLE (Gemini Structured Insights)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL UNIQUE REFERENCES public.complaints(id) ON DELETE CASCADE,
    predicted_category TEXT NOT NULL,
    summary TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    safety_risk_score INTEGER NOT NULL CHECK (safety_risk_score >= 1 AND safety_risk_score <= 10),
    estimated_public_impact TEXT NOT NULL CHECK (estimated_public_impact IN ('low', 'medium', 'high', 'massive')),
    suggested_department_code TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    cascading_risks TEXT,
    priority_score INTEGER NOT NULL CHECK (priority_score >= 0 AND priority_score <= 100),
    priority_tier TEXT NOT NULL CHECK (priority_tier IN ('low', 'medium', 'high', 'critical')),
    priority_breakdown JSONB NOT NULL,
    raw_model_response JSONB,
    model_version TEXT DEFAULT 'gemini-1.5-flash',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. COMPLAINT DUPLICATES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.complaint_duplicates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    possible_duplicate_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    similarity_score NUMERIC(4,3) NOT NULL,
    distance_meters NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('suggested', 'confirmed_merged', 'dismissed')) DEFAULT 'suggested',
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_duplicate_pair UNIQUE(complaint_id, possible_duplicate_id)
);

-- ------------------------------------------------------------------------------
-- 7. STATUS HISTORY TABLE (Audit Trail)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. AI ACTION BRIEFS TABLE (Executive Summaries for Admins)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_action_briefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    urgent_issues JSONB NOT NULL,
    hotspots_summary JSONB NOT NULL,
    infrastructure_relationships JSONB NOT NULL,
    recommended_priorities JSONB NOT NULL,
    generated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority_score ON public.complaints(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_priority_tier ON public.complaints(priority_tier);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON public.complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON public.complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_dept ON public.complaints(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_worker ON public.complaints(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_complaints_coords ON public.complaints(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_complaint ON public.status_history(complaint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaint_images_complaint ON public.complaint_images(complaint_id);
CREATE INDEX IF NOT EXISTS idx_duplicates_complaint ON public.complaint_duplicates(complaint_id);

-- ==============================================================================
-- TRIGGERS & FUNCTIONS FOR AUTO-TIMESTAMPS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_timestamp ON public.profiles;
CREATE TRIGGER trigger_update_profiles_timestamp
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_update_complaints_timestamp ON public.complaints;
CREATE TRIGGER trigger_update_complaints_timestamp
    BEFORE UPDATE ON public.complaints
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_duplicates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_action_briefs ENABLE ROW LEVEL SECURITY;

-- 1. Departments: Readable by everyone, editable by admin
CREATE POLICY "Departments are viewable by all users" 
    ON public.departments FOR SELECT 
    USING (true);

CREATE POLICY "Departments editable by admin or service role" 
    ON public.departments FOR ALL 
    USING (
        auth.jwt() ->> 'role' = 'service_role' OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'municipal_admin')
    );

-- 2. Profiles: Users can view all public worker/admin profiles, update own profile
CREATE POLICY "Profiles viewable by authenticated users" 
    ON public.profiles FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

CREATE POLICY "Service role full access on profiles" 
    ON public.profiles FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 3. Complaints:
-- Anyone can view complaints (for community transparency & map hotspots)
-- Anyone can insert complaints (allows anonymous public reporting or authenticated citizens)
-- Admins and workers can update complaints
CREATE POLICY "Complaints are viewable by all users" 
    ON public.complaints FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can insert complaints" 
    ON public.complaints FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Complaints can be updated" 
    ON public.complaints FOR UPDATE 
    USING (true);

CREATE POLICY "Service role full access on complaints" 
    ON public.complaints FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 4. Complaint Images:
CREATE POLICY "Complaint images viewable by everyone" 
    ON public.complaint_images FOR SELECT 
    USING (true);

CREATE POLICY "Anyone can insert complaint images" 
    ON public.complaint_images FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Service role full access on complaint images" 
    ON public.complaint_images FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 5. AI Analyses:
CREATE POLICY "AI analyses viewable by everyone" 
    ON public.ai_analyses FOR SELECT 
    USING (true);

CREATE POLICY "AI analyses manageable by all roles" 
    ON public.ai_analyses FOR ALL 
    USING (true);

-- 6. Duplicates, Status History, Action Briefs:
CREATE POLICY "Duplicates viewable by everyone" 
    ON public.complaint_duplicates FOR SELECT 
    USING (true);

CREATE POLICY "Duplicates manageable by all roles" 
    ON public.complaint_duplicates FOR ALL 
    USING (true);

CREATE POLICY "Status history viewable by everyone" 
    ON public.status_history FOR SELECT 
    USING (true);

CREATE POLICY "Status history insertable by all roles" 
    ON public.status_history FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Service role full access on status history" 
    ON public.status_history FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Action briefs viewable by everyone" 
    ON public.ai_action_briefs FOR SELECT 
    USING (true);

CREATE POLICY "Action briefs manageable by all roles" 
    ON public.ai_action_briefs FOR ALL 
    USING (true);

-- ==============================================================================
-- SYNTHETIC SEED DATA (Departments & 45 Realistic Civic Complaints)
-- ==============================================================================

-- 1. Insert Departments
INSERT INTO public.departments (id, code, name, description, contact_email) VALUES
('d1111111-1111-1111-1111-111111111111', 'ROADS', 'Roads & Infrastructure Maintenance', 'Handles asphalt repairs, potholes, road medians, and structural pavement.', 'roads-dispatch@smartcity.gov'),
('d2222222-2222-2222-2222-222222222222', 'WATER_SEWERAGE', 'Water Supply & Sewerage Board', 'Manages potable water mains, sewer blockages, manhole covers, and pipeline leaks.', 'water-alerts@smartcity.gov'),
('d3333333-3333-3333-3333-333333333333', 'DRAINAGE', 'Stormwater & Flood Management', 'Maintains stormwater drains, culverts, flood gates, and anti-waterlogging pumps.', 'drainage-ops@smartcity.gov'),
('d4444444-4444-4444-4444-444444444444', 'WASTE', 'Solid Waste & Sanitation', 'Manages community trash bins, illegal garbage dumping, and street cleanliness.', 'sanitation@smartcity.gov'),
('d5555555-5555-5555-5555-555555555555', 'ELECTRICAL', 'Electrical Utilities & Lighting', 'Maintains street illumination, transformers, high-tension lines, and traffic signals.', 'electrical-safety@smartcity.gov'),
('d6666666-6666-6666-6666-666666666666', 'PUBLIC_SAFETY', 'Civil Defense & Public Safety Hazard Team', 'Rapid response for hazardous cave-ins, fallen trees, and emergency cordons.', 'emergency-civic@smartcity.gov')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert 45 Curated Complaints with Geo Clusters & Cascading Scenarios
-- Centered around Metro Urban District (Coordinates ~ Lat 12.9716, Lng 77.5946)
-- Cluster A: Indiranagar Ward (Potholes + Drainage overflow cascading)
-- Cluster B: Koramangala Ward (Severe Waterlogging + Solid Waste accumulation)
-- Cluster C: Whitefield Ward (Industrial corridor, broken streetlights, electrical hazard)
-- Cluster D: Central Business District (Traffic bottlenecks, fallen branches)
-- Deliberate Duplicates: Ticket 0001 & 0002; Ticket 0012 & 0013; Ticket 0025 & 0026

INSERT INTO public.complaints (
    id, ticket_number, title, description, category, status, latitude, longitude, 
    address, landmark, ward_or_zone, priority_score, priority_tier, is_duplicate, 
    assigned_department_id, created_at
) VALUES
-- CLUSTER A: INDIRANAGAR (Drainage + Pothole Cascade)
('c0000001-0000-0000-0000-000000000001', 'CIVIC-2026-0001', 'Deep 3-foot pothole on 100ft Road junction', 'Massive crater formed after heavy rain, already caused 2 two-wheeler skids this morning. Water filled inside making it invisible to drivers.', 'pothole', 'under_review', 12.97836, 77.64082, '100ft Road, 12th Main Junction, Indiranagar', 'Opposite Metro Pillar 84', 'East Zone - Indiranagar', 92, 'critical', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 hours'),

-- DELIBERATE DUPLICATE OF 0001
('c0000002-0000-0000-0000-000000000002', 'CIVIC-2026-0002', 'Huge crater near 12th Main traffic light', 'Extremely dangerous road pit right before the signal. Scooters are swerving violently into opposite traffic.', 'pothole', 'submitted', 12.97842, 77.64095, '12th Main Road, near 100ft Road intersection', 'Near Cafe Coffee Day', 'East Zone - Indiranagar', 88, 'critical', true, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 hours'),

('c0000003-0000-0000-0000-000000000003', 'CIVIC-2026-0003', 'Storm drain clogged with plastic debris and silt', 'The main shoulder drain is 100% choked. Rainwater is overflowing directly onto the road shoulder, eroding the road foundation.', 'drainage', 'assigned', 12.97815, 77.64050, '100ft Road, near 11th Cross, Indiranagar', 'Next to Apollo Pharmacy', 'East Zone - Indiranagar', 78, 'high', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day'),

('c0000004-0000-0000-0000-000000000004', 'CIVIC-2026-0004', 'Broken concrete slab over pedestrian sidewalk drain', 'Pedestrian foot fell through yesterday evening. Heavy rebar exposed and rusty, serious trip hazard especially for elderly.', 'public_hazard', 'in_progress', 12.97750, 77.63980, 'CMH Road, Indiranagar', 'In front of Post Office', 'East Zone - Indiranagar', 84, 'high', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days'),

('c0000005-0000-0000-0000-000000000005', 'CIVIC-2026-0005', 'Overflowing community garbage dumpster', 'Garbage spilled over 15 meters on the road. Stray animals tearing bags, foul smell reaching nearby apartment complex.', 'garbage', 'resolved', 12.97920, 77.64210, '6th Main, Defense Colony, Indiranagar', 'Corner of Park gate', 'East Zone - Indiranagar', 55, 'medium', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '4 days'),

('c0000006-0000-0000-0000-000000000006', 'CIVIC-2026-0006', 'Flickering and dead streetlights along entire residential lane', '5 consecutive poles are unlit. Total darkness for women walking home from metro station after 8 PM.', 'streetlights', 'assigned', 12.97650, 77.63820, '9th A Main Road, HAL 2nd Stage', 'Behind Indiranagar Club', 'East Zone - Indiranagar', 68, 'high', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '18 hours'),

('c0000007-0000-0000-0000-000000000007', 'CIVIC-2026-0007', 'Water pipe rupture flooding clean drinking water', 'High pressure potable pipeline burst. Thousands of liters of freshwater gushing out and flooding road curb.', 'waterlogging', 'under_review', 12.97980, 77.64400, 'Double Road, Indiranagar', 'Near Cambridge School gate', 'East Zone - Indiranagar', 82, 'high', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '5 hours'),

-- CLUSTER B: KORAMANGALA (Severe Waterlogging + Manhole Safety Risks)
('c0000008-0000-0000-0000-000000000008', 'CIVIC-2026-0008', 'CRITICAL: Open uncovered sewer manhole submerged under water', 'Cast iron manhole lid was displaced during storm. Opening is totally submerged in 1 foot of water. Life-threatening hazard.', 'public_hazard', 'under_review', 12.93510, 77.62440, '80ft Road, 4th Block, Koramangala', 'Outside Sony World Junction', 'South Zone - Koramangala', 98, 'critical', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 hour'),

('c0000009-0000-0000-0000-000000000009', 'CIVIC-2026-0009', 'Severe knee-deep waterlogging blocking hospital approach', 'Ambulances cannot navigate into St. Johns road entrance. Inadequate stormwater outlet.', 'waterlogging', 'in_progress', 12.93480, 77.62510, '100ft Inner Ring Road, Koramangala', 'Near St. Johns Hospital side-gate', 'South Zone - Koramangala', 95, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '7 hours'),

('c0000010-0000-0000-0000-000000000010', 'CIVIC-2026-0010', 'Illegal commercial trash dumping blocking drainage inlet', 'Restaurants dumping grease traps and food boxes right into storm inlet. Causing stagnant breeding ground for mosquitoes.', 'garbage', 'assigned', 12.93600, 77.62650, '5th Block Commercial Street, Koramangala', 'Behind Empire Restaurant alley', 'South Zone - Koramangala', 74, 'high', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day'),

('c0000011-0000-0000-0000-000000000011', 'CIVIC-2026-0011', 'Road sinkhole opening around storm drain chamber', 'Asphalt is collapsing around the concrete storm drain chamber. 2ft deep sinkhole expanding daily.', 'pothole', 'under_review', 12.93420, 77.62380, '1st Cross, 4th Block, Koramangala', 'Near Bethany High School', 'South Zone - Koramangala', 89, 'critical', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '9 hours'),

-- DELIBERATE DUPLICATES 0012 & 0013
('c0000012-0000-0000-0000-000000000012', 'CIVIC-2026-0012', 'Exposed live electric cable sparking near bus stop', 'Low hanging electrical wire snapping against tree branches with sparks when windy. Bus commuters waiting in rain.', 'public_hazard', 'assigned', 12.93720, 77.62150, 'Koramangala Water Tank Bus Stop', 'Near Bus Shelter 3', 'South Zone - Koramangala', 96, 'critical', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '4 hours'),

('c0000013-0000-0000-0000-000000000013', 'CIVIC-2026-0013', 'Sparks flying from overhead cable near water tank stop', 'Sparks seen dropping on pedestrians. Dangerous situation with overhead power cables near water tank.', 'public_hazard', 'submitted', 12.93728, 77.62142, 'Opposite Water Tank, Koramangala Main Road', 'Beside newspaper kiosk', 'South Zone - Koramangala', 94, 'critical', true, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 hours'),

('c0000014-0000-0000-0000-000000000014', 'CIVIC-2026-0014', 'Blocked sewage backflow into residential basements', 'Main sewer line backed up. Foul sewage water entering basement car parking and lift shafts.', 'drainage', 'in_progress', 12.93310, 77.62720, '6th Block, 17th D Main, Koramangala', 'Sri Sai Residency', 'South Zone - Koramangala', 87, 'critical', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '14 hours'),

('c0000015-0000-0000-0000-000000000015', 'CIVIC-2026-0015', 'Multiple speed breaker paint worn out causing sudden braking', 'Unmarked speed bumps causing frequent minor collisions and vehicle bottom scraping.', 'pothole', 'resolved', 12.93850, 77.62310, '3rd Block, 12th Main, Koramangala', 'Near Koramangala Post Office', 'South Zone - Koramangala', 42, 'medium', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days'),

-- CLUSTER C: WHITEFIELD TECH CORRIDOR (Heavy Traffic & Utility Failures)
('c0000016-0000-0000-0000-000000000016', 'CIVIC-2026-0016', 'Major asphalt disintegration outside IT Park entrance', 'Heavy truck traffic has crushed the road surface into loose gravel and 4 consecutive potholes.', 'pothole', 'under_review', 12.96980, 77.75000, 'ITPL Main Road, Whitefield', 'Opposite Prestige Shantiniketan gate 2', 'East Zone - Whitefield', 81, 'high', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '12 hours'),

('c0000017-0000-0000-0000-000000000017', 'CIVIC-2026-0017', 'Streetlight pole tilted at 45 degree angle after truck impact', 'Light pole knocked askew by delivery truck. Leaning over pedestrian path and power lines are under tension.', 'public_hazard', 'assigned', 12.97120, 77.74850, 'ECC Road, Whitefield', 'Near Deen Academy', 'East Zone - Whitefield', 88, 'critical', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 day'),

('c0000018-0000-0000-0000-000000000018', 'CIVIC-2026-0018', 'Construction debris dumped illegally along lake bund', 'Dumpers unloaded 5 heaps of concrete slurry and bricks directly on the wetland perimeter.', 'garbage', 'under_review', 12.96750, 77.75300, 'Nallurahalli Lake Road, Whitefield', 'East Bund entry', 'East Zone - Whitefield', 72, 'high', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days'),

('c0000019-0000-0000-0000-000000000019', 'CIVIC-2026-0019', 'Drain silt left on road after desilting work', 'Municipal team scooped black sludge from drain 3 days ago but left heaps on the driving lane.', 'drainage', 'in_progress', 12.97250, 77.74600, 'Hope Farm Junction, Whitefield', 'Beside Metro Station Pillar 102', 'East Zone - Whitefield', 64, 'medium', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '3 days'),

('c0000020-0000-0000-0000-000000000020', 'CIVIC-2026-0020', 'Traffic light controller dead causing massive junction gridlock', 'Signal controller box went blank. Traffic snarled for 2 kilometers in all directions.', 'streetlights', 'resolved', 12.97380, 77.74510, 'Channasandra Main Junction, Whitefield', 'Circle intersection', 'East Zone - Whitefield', 91, 'critical', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '6 hours'),

-- CLUSTER D: CENTRAL BUSINESS DISTRICT (High Density & Pedestrian Safety)
('c0000021-0000-0000-0000-000000000021', 'CIVIC-2026-0021', 'Fallen tree branch crushing pedestrian walkway rail', 'Heavy bough broke off during thunderstorm, blocking walkway and partially obstructing left lane.', 'public_hazard', 'assigned', 12.97560, 77.60660, 'MG Road, near Anil Kumble Circle', 'Outside Metro Station Gate 1', 'Central Zone - CBD', 76, 'high', false, 'd6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '8 hours'),

('c0000022-0000-0000-0000-000000000022', 'CIVIC-2026-0022', 'Broken tactile paving tiles dangerous for visually impaired', 'Blinded tactile navigation tiles completely broken and loose on busy commercial footway.', 'public_hazard', 'submitted', 12.97490, 77.60800, 'Brigade Road Commercial Strip', 'Outside Rex Plaza', 'Central Zone - CBD', 62, 'medium', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day'),

('c0000023-0000-0000-0000-000000000023', 'CIVIC-2026-0023', 'Subway underpass waterlogged with foul standing water', 'Pedestrian subway connecting commercial street has 8 inches of dirty water. Pedestrians forced to cross dangerous 6-lane road.', 'waterlogging', 'under_review', 12.97680, 77.60450, 'Cubbon Park Subway Cross', 'Near High Court gate', 'Central Zone - CBD', 86, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '10 hours'),

('c0000024-0000-0000-0000-000000000024', 'CIVIC-2026-0024', 'Overflowing public litter bins near tourist landmark', 'Overfull dustbins with food containers and bottles littering the promenade garden.', 'garbage', 'resolved', 12.97800, 77.59250, 'Vidhana Soudha North Gate Walkway', 'Opposite General Post Office', 'Central Zone - CBD', 48, 'medium', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days'),

-- DELIBERATE DUPLICATES 0025 & 0026 (MALLESHWARAM WARD)
('c0000025-0000-0000-0000-000000000025', 'CIVIC-2026-0025', 'Open transformer box with door dangling on pedestrian street', 'High voltage 11kV distribution transformer ground box has its lock broken and metal door open. School children walk right past it.', 'public_hazard', 'under_review', 13.00310, 77.56430, '8th Cross, Sampige Road, Malleshwaram', 'Near MES College entrance', 'West Zone - Malleshwaram', 99, 'critical', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '40 minutes'),

('c0000026-0000-0000-0000-000000000026', 'CIVIC-2026-0026', 'Electric transformer box door open near college', 'Live electrical components exposed at waist level on 8th cross footway. Extremely dangerous emergency.', 'public_hazard', 'submitted', 13.00318, 77.56441, 'Sampige Road, 8th Cross', 'In front of bakery near MES College', 'West Zone - Malleshwaram', 97, 'critical', true, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '25 minutes'),

('c0000027-0000-0000-0000-000000000027', 'CIVIC-2026-0027', 'Potable water supply contaminated with muddy odor', 'Residents of 4th temple street getting discolored and foul smelling tap water since morning.', 'waterlogging', 'assigned', 13.00550, 77.56800, '4th Temple Street, Malleshwaram', 'Near Kadu Malleshwara Temple', 'West Zone - Malleshwaram', 85, 'critical', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '11 hours'),

('c0000028-0000-0000-0000-000000000028', 'CIVIC-2026-0028', 'Steep road gradient eroded creating dangerous rut', 'Rainwater runoff has carved a 10-inch trench across the tarmac on steep slope.', 'pothole', 'in_progress', 13.00120, 77.56200, '15th Cross, Margosa Road, Malleshwaram', 'Opposite Canara Union', 'West Zone - Malleshwaram', 69, 'high', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days'),

('c0000029-0000-0000-0000-000000000029', 'CIVIC-2026-0029', 'Dry leaves and organic garden waste dumped on road side', 'Large heap of trimmed tree branches blocking parking lane for a week.', 'garbage', 'submitted', 13.00700, 77.56500, '18th Cross, Malleshwaram', 'Near Playground corner', 'West Zone - Malleshwaram', 32, 'low', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '6 days'),

('c0000030-0000-0000-0000-000000000030', 'CIVIC-2026-0030', 'Streetlight timer malfunctioning remaining on during daytime', '10 LED streetlamps remain illuminated at noon, wasting municipal power.', 'streetlights', 'resolved', 13.00420, 77.56680, '11th Cross, Malleshwaram', 'Near Market building', 'West Zone - Malleshwaram', 25, 'low', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '4 days'),

-- ADDITIONAL REALISTIC SPREAD COMPLAINTS (31 TO 45)
('c0000031-0000-0000-0000-000000000031', 'CIVIC-2026-0031', 'Broken stormwater grating causing wheel trap', 'Iron grill over roadside storm gutter has 2 bars missing. Cycle and motorbike tires getting trapped.', 'drainage', 'assigned', 12.98200, 77.63500, 'Double Road, Domlur Stage 2', 'Near ESI Hospital signal', 'East Zone - Indiranagar', 77, 'high', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '16 hours'),

('c0000032-0000-0000-0000-000000000032', 'CIVIC-2026-0032', 'Stagnant water pool creating dengue hazard', 'Unfinished road excavation filled with 2 feet of stagnant green water for 3 weeks.', 'waterlogging', 'under_review', 12.98110, 77.63720, 'Krishna Temple Road, Indiranagar', 'Adjacent to community hall', 'East Zone - Indiranagar', 75, 'high', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day'),

('c0000033-0000-0000-0000-000000000033', 'CIVIC-2026-0033', 'Pothole patch job eroded after single rain shower', 'Cold asphalt patch applied last week has washed away into road gravel.', 'pothole', 'submitted', 12.97720, 77.64350, '14th Main, HAL 2nd Stage', 'Near BSNL Exchange', 'East Zone - Indiranagar', 58, 'medium', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days'),

('c0000034-0000-0000-0000-000000000034', 'CIVIC-2026-0034', 'Sewage line leakage spreading across bicycle track', 'Blackwater bubbling out from sewer joint onto protected cycle path.', 'drainage', 'in_progress', 12.93250, 77.62100, 'Koramangala 3rd Block Outer Ring', 'Near Wipro Park cycle track', 'South Zone - Koramangala', 83, 'high', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '18 hours'),

('c0000035-0000-0000-0000-000000000035', 'CIVIC-2026-0035', 'Broken streetlight arm dangling over roadway', 'Fixture loosened during wind, hanging by electrical wire over driving lane.', 'public_hazard', 'assigned', 12.93180, 77.62550, 'Sarjapur Road Junction, Koramangala', 'Near Jakkasandra signal', 'South Zone - Koramangala', 86, 'critical', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '5 hours'),

('c0000036-0000-0000-0000-000000000036', 'CIVIC-2026-0036', 'Dumped poultry waste attracting scavengers', 'Rotting organic poultry remnants dumped in open vacant lot near school.', 'garbage', 'resolved', 12.93650, 77.62800, 'Koramangala 6th Block, 80ft Road', 'Opposite Government Primary School', 'South Zone - Koramangala', 79, 'high', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days'),

('c0000037-0000-0000-0000-000000000037', 'CIVIC-2026-0037', 'Sinking utility trench across newly paved avenue', 'Gas pipeline trench has sunk 6 inches below asphalt grade after backfill settled.', 'pothole', 'under_review', 12.96820, 77.74400, 'Whitefield Main Road', 'Near Forum Shantiniketan Mall', 'East Zone - Whitefield', 71, 'high', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '15 hours'),

('c0000038-0000-0000-0000-000000000038', 'CIVIC-2026-0038', 'Storm drain concrete wall collapsed inward', 'Retaining wall of major rainwater storm canal crumbled, restricting water passage by 60%.', 'drainage', 'assigned', 12.96600, 77.75100, 'Kundalahalli Gate to Whitefield stretch', 'Near Varthur Kodi canal', 'East Zone - Whitefield', 87, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 days'),

('c0000039-0000-0000-0000-000000000039', 'CIVIC-2026-0039', 'Defective pedestrian crossing signal countdown timer', 'Countdown jumps from 25 seconds directly to zero, stranding pedestrians midway.', 'streetlights', 'in_progress', 12.97210, 77.60950, 'Residency Road Cross, CBD', 'Near Bishop Cotton School', 'Central Zone - CBD', 67, 'high', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 day'),

('c0000040-0000-0000-0000-000000000040', 'CIVIC-2026-0040', 'Missing storm drain cover in dimly lit lane', 'Drain opening without cover in residential pathway with zero streetlights.', 'public_hazard', 'under_review', 12.97350, 77.60300, 'Lavelle Road, 2nd Cross, CBD', 'Near Bangalore Club backgate', 'Central Zone - CBD', 93, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '6 hours'),

('c0000041-0000-0000-0000-000000000041', 'CIVIC-2026-0041', 'Burst water valve creating geyser on roadway', 'Pressurized drinking water jet shooting 4 meters high from roadway control valve.', 'waterlogging', 'assigned', 12.97600, 77.59600, 'Kasturba Road, CBD', 'Outside Visvesvaraya Museum', 'Central Zone - CBD', 84, 'high', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '9 hours'),

('c0000042-0000-0000-0000-000000000042', 'CIVIC-2026-0042', 'Garbage mound blocking pedestrian entry to subway', 'Rotting vegetable heaps dumped directly on steps of public subway pedestrian stairs.', 'garbage', 'submitted', 13.00200, 77.56700, 'Malleshwaram Circle Subway Entry', 'Beside Railway Station underpass', 'West Zone - Malleshwaram', 63, 'medium', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day'),

('c0000043-0000-0000-0000-000000000043', 'CIVIC-2026-0043', 'Cracked road embankment retaining wall over railway line', 'Masonry stones falling loose onto railway track below. Structural risk.', 'public_hazard', 'assigned', 13.00400, 77.56100, 'Railway Parallel Road, Malleshwaram', 'Bridge 14 over suburban line', 'West Zone - Malleshwaram', 95, 'critical', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day'),

('c0000044-0000-0000-0000-000000000044', 'CIVIC-2026-0044', 'Broken water pipe causing road cavitation beneath asphalt', 'Underground leak has hollowed out the gravel base beneath asphalt, creating hollow road crust.', 'waterlogging', 'under_review', 12.98000, 77.63900, 'Indiranagar 100ft Road, 4th Cross', 'Near Starbucks', 'East Zone - Indiranagar', 88, 'critical', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '8 hours'),

('c0000045-0000-0000-0000-000000000045', 'CIVIC-2026-0045', 'Tree branches heavily entangled with low voltage distribution line', 'Boughs sagging against live wires during wind, causing intermittent power outages.', 'public_hazard', 'in_progress', 12.93800, 77.62500, 'Koramangala 4th Block, 7th Main', 'Near Maharaja Signal', 'South Zone - Koramangala', 73, 'high', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 days')
ON CONFLICT (ticket_number) DO NOTHING;

-- 3. Pre-seed AI Analysis for Core Complaints (Ensures demo dashboard is rich immediately)
INSERT INTO public.ai_analyses (
    complaint_id, predicted_category, summary, severity, safety_risk_score, 
    estimated_public_impact, suggested_department_code, recommended_action, 
    cascading_risks, priority_score, priority_tier, priority_breakdown
) VALUES
('c0000001-0000-0000-0000-000000000001', 'pothole', 
 'Massive 3ft submerged pothole on high-speed arterial road with reported two-wheeler accidents.', 
 'critical', 9, 'massive', 'ROADS', 
 'Deploy immediate emergency cold-mix asphalt patch, barricade hazard zone, clear clogged drain causing water retention.', 
 'Water retention is degrading sub-base layer, likely to cause wider road cave-in and secondary multi-vehicle collisions.', 
 92, 'critical', 
 '{"safety_pts": 33, "severity_pts": 24, "impact_pts": 15, "age_pts": 5, "cluster_pts": 15, "reasons": ["High speed arterial road", "Submerged hazard causing vehicle skids", "Cascading water erosion"]}'::jsonb),

('c0000008-0000-0000-0000-000000000008', 'public_hazard', 
 'Life-threatening open submerged sewer manhole in waterlogged pedestrian/vehicle intersection.', 
 'critical', 10, 'massive', 'WATER_SEWERAGE', 
 'Immediate emergency cordoning within 15 minutes, deploy heavy crane replacement cast iron lid, pump standing water.', 
 'Fatal drowning and fall hazard for pedestrians and cyclists in standing water; sewer overflow into drinking lines.', 
 98, 'critical', 
 '{"safety_pts": 35, "severity_pts": 25, "impact_pts": 15, "age_pts": 8, "cluster_pts": 15, "reasons": ["Life safety emergency", "Zero visibility in floodwater", "Near major commercial junction"]}'::jsonb),

('c0000025-0000-0000-0000-000000000025', 'public_hazard', 
 'Open 11kV high-voltage electrical transformer box door directly adjacent to college pedestrian footpath.', 
 'critical', 10, 'high', 'ELECTRICAL', 
 'Dispatch high-voltage emergency crew immediately, disconnect or isolate ground bus, secure metal enclosure with padlock.', 
 'Immediate lethal electrocution risk to students and pedestrians; potential arc-flash fire adjacent to commercial buildings.', 
 99, 'critical', 
 '{"safety_pts": 35, "severity_pts": 25, "impact_pts": 14, "age_pts": 10, "cluster_pts": 15, "reasons": ["11kV live exposure", "School zone foot traffic", "Open accessible metal cabinet"]}'::jsonb)
ON CONFLICT (complaint_id) DO NOTHING;

-- 4. Pre-link Identified Duplicates
INSERT INTO public.complaint_duplicates (
    complaint_id, possible_duplicate_id, similarity_score, distance_meters, status
) VALUES
('c0000002-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 0.892, 16.40, 'suggested'),
('c0000013-0000-0000-0000-000000000013', 'c0000012-0000-0000-0000-000000000012', 0.915, 12.10, 'suggested'),
('c0000026-0000-0000-0000-000000000026', 'c0000025-0000-0000-0000-000000000025', 0.945, 9.80, 'suggested')
ON CONFLICT (complaint_id, possible_duplicate_id) DO NOTHING;

-- 5. Insert Status History Audit Records for Demonstration
INSERT INTO public.status_history (complaint_id, from_status, to_status, comment, created_at) VALUES
('c0000001-0000-0000-0000-000000000001', 'submitted', 'ai_analyzed', 'AI completed multi-factor risk categorization. Priority score: 92 (Critical).', NOW() - INTERVAL '2 hours 55 minutes'),
('c0000001-0000-0000-0000-000000000001', 'ai_analyzed', 'under_review', 'Municipal control room flagged for emergency road dispatch.', NOW() - INTERVAL '2 hours 30 minutes'),
('c0000004-0000-0000-0000-000000000004', 'submitted', 'in_progress', 'Road maintenance crew #4 dispatched with concrete replacement slabs.', NOW() - INTERVAL '1 day'),
('c0000005-0000-0000-0000-000000000005', 'in_progress', 'resolved', 'Sanitation compactor truck cleared 2.5 tons of refuse. Disinfected area.', NOW() - INTERVAL '3 days 20 hours')
ON CONFLICT DO NOTHING;
