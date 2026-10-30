-- ==============================================================================
-- CIVIC INTELLIGENCE — PAN-INDIA SEED COMPLAINTS
-- Run this in Supabase Cloud -> SQL Editor to add complaints across Indian Metros
-- ==============================================================================

INSERT INTO public.complaints (
    ticket_number, title, description, category, status, latitude, longitude, 
    address, landmark, ward_or_zone, priority_score, priority_tier, is_duplicate, 
    assigned_department_id, created_at
) VALUES
-- DELHI NCR
('CIVIC-2026-DEL-01', 'Severe waterlogging at Minto Bridge underpass with stranded bus', 'Underpass flooded with over 4 feet of stormwater after sudden monsoon cloudburst. DTC bus stalled in the middle.', 'waterlogging', 'under_review', 28.6328, 77.2223, 'Minto Bridge Underpass, Connaught Place Outer Circle', 'Near Shivaji Bridge Railway Station', 'Delhi NCR - Central', 97, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 hours'),
('CIVIC-2026-DEL-02', 'Multiple deep potholes on Ring Road near AIIMS flyover', 'Heavy truck traffic has excavated 4 deep potholes right at flyover descent. Multiple two-wheelers losing balance.', 'pothole', 'assigned', 28.5672, 77.2100, 'Ring Road, AIIMS Flyover Descent, South Extension', 'Opposite AIIMS Trauma Center Gate', 'Delhi NCR - South', 89, 'critical', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 hours'),
('CIVIC-2026-DEL-03', 'Streetlights out along dark stretch of Noida Expressway', 'Over 12 consecutive high-mast streetlights are unlit on the highway corridor. Severe night visibility hazard.', 'streetlights', 'in_progress', 28.5020, 77.3820, 'Noida-Greater Noida Expressway, Sector 128', 'Near Jaypee Hospital exit', 'Delhi NCR - Noida', 76, 'high', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '18 hours'),

-- MUMBAI
('CIVIC-2026-BOM-01', 'Hindmata Dadar subway waterlogging blocking vehicular transit', 'Continuous high tide and monsoon rainfall caused 2.5 feet water accumulation. BEST bus services diverted.', 'waterlogging', 'in_progress', 19.0178, 72.8478, 'Dr. Babasaheb Ambedkar Road, Hindmata, Dadar East', 'Opposite Hindmata Cinema', 'Mumbai - F South Ward (Dadar)', 96, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '3 hours'),
('CIVIC-2026-BOM-02', 'Open manhole with missing cast iron cover on SV Road', 'Sewer manhole lid missing on busy pedestrian sidewalk. Covered only with temporary tree branch. Fatal pedestrian risk.', 'public_hazard', 'under_review', 19.1197, 72.8464, 'SV Road, Andheri West near Station Junction', 'Outside McDonald’s / Andheri Subway entry', 'Mumbai - K West Ward (Andheri)', 98, 'critical', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 hour'),
('CIVIC-2026-BOM-03', 'Garbage dump overflowing onto Marine Drive approach road', 'Community refuse bins completely overwhelmed. Waste spilling onto the approach lane causing foul odors.', 'garbage', 'assigned', 18.9438, 72.8233, 'Veer Nariman Road, Churchgate near Marine Drive', 'Corner of Ambassador Hotel lane', 'Mumbai - A Ward (Colaba/Churchgate)', 58, 'medium', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day'),

-- HYDERABAD
('CIVIC-2026-HYD-01', 'Massive sinkhole opening near Hitec City Cyber Towers', 'Road collapsed around underground stormwater pipeline. Traffic police barricaded one lane, bottlenecking tech corridor.', 'pothole', 'under_review', 17.4504, 78.3808, 'Hitec City Main Road, Cyber Towers Intersection', 'Beside Cyber Gateway flyover pillar 12', 'Hyderabad - Serilingampally (GHMC)', 94, 'critical', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '4 hours'),
('CIVIC-2026-HYD-02', 'Drainage overflow into residential colony near Hussain Sagar', 'Overflowing storm canal backing up into lower ground floors of apartment complexes on Tank Bund road.', 'drainage', 'assigned', 17.4239, 78.4738, 'Necklace Road approach, Khairatabad', 'Near IMAX Circle', 'Hyderabad - Central Zone', 82, 'high', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '12 hours'),

-- CHENNAI
('CIVIC-2026-MAA-01', 'Seawater backflow causing severe waterlogging in Velachery', 'High monsoon tides preventing stormwater discharge. Residential streets submerged under 1 foot stagnant water.', 'waterlogging', 'in_progress', 12.9815, 80.2180, 'Velachery Main Road, Ram Nagar', 'Near Velachery MRTS Station', 'Chennai - Zone 13 (Adyar/Velachery)', 91, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '6 hours'),
('CIVIC-2026-MAA-02', 'Exposed live power distribution cable on T. Nagar shopping street', 'Underground cable joint exposed after road dig. Sparks seen during rain showers near shopping crowd.', 'public_hazard', 'under_review', 13.0418, 80.2341, 'Usman Road, T. Nagar shopping district', 'Outside Ranganathan Street entrance', 'Chennai - Zone 10 (Kodambakkam)', 95, 'critical', false, 'd5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '2 hours'),

-- KOLKATA
('CIVIC-2026-CCU-01', 'Tram line asphalt crumbling creating dangerous ruts on College Street', 'Road surface between tram tracks has deteriorated into deep grooves. Multiple bicycles caught in rail gap.', 'pothole', 'assigned', 22.5744, 88.3629, 'College Street, Bowbazar area', 'Near Presidency University gate', 'Kolkata - Borough V (KMC)', 83, 'high', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '8 hours'),
('CIVIC-2026-CCU-02', 'Storm drain clogged with silt at Park Circus 7-point crossing', 'Heavy waterlogging reaching curb level after 30 minutes of rain. Traffic moving at walking speed.', 'drainage', 'in_progress', 22.5413, 88.3653, 'Park Circus 7-Point Crossing, Syed Amir Ali Avenue', 'Beside Quest Mall flyover entry', 'Kolkata - Borough VII (KMC)', 88, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '14 hours'),

-- PUNE
('CIVIC-2026-PNQ-01', 'Severe road crater on Hinjewadi IT Park Phase 1 bridge ramp', 'Pothole cluster spanning 50 meters on the flyover ramp. Heavy evening IT commute delayed by 45 mins.', 'pothole', 'under_review', 18.5913, 73.7389, 'Hinjewadi IT Park Main Road, Phase 1', 'Near Shivaji Chowk', 'Pune - Pimpri-Chinchwad (PCMC)', 86, 'critical', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '7 hours'),
('CIVIC-2026-PNQ-02', 'Garbage accumulation near riverside road in Deccan Gymkhana', 'Debris left unattended by municipal contractor. Stray animals tearing plastics into Mutha river bed.', 'garbage', 'submitted', 18.5173, 73.8415, 'Deccan Gymkhana Riverside Road, FC Road side', 'Near Sambhaji Park Gate', 'Pune - Kasba-Vishrambaug (PMC)', 64, 'medium', false, 'd4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 day'),

-- AHMEDABAD
('CIVIC-2026-AMD-01', 'Water pipe rupture on SG Highway service road near ISKCON', 'High-pressure municipal potable main leaking thousands of gallons per hour onto commercial parking.', 'waterlogging', 'assigned', 23.0338, 72.5074, 'SG Highway Service Road, Bodakdev', 'Near ISKCON Cross Roads', 'Ahmedabad - West Zone (Bodakdev)', 84, 'high', false, 'd2222222-2222-2222-2222-222222222222', NOW() - INTERVAL '9 hours'),

-- JAIPUR
('CIVIC-2026-JAI-01', 'Loose stone slab on heritage wall overhang in Pink City', 'Masonry brick dislodged on Badi Chaupar bazaar lane. High footfall tourist zone at risk of falling debris.', 'public_hazard', 'under_review', 26.9239, 75.8267, 'Badi Chaupar Heritage Market, Pink City', 'Near Hawa Mahal North entrance', 'Jaipur - Heritage Zone', 93, 'critical', false, 'd6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '5 hours'),

-- LUCKNOW
('CIVIC-2026-LKO-01', 'Open sewer line overflowing on Hazratganj pedestrian promenade', 'Blocked domestic sewer backflowing onto Hazratganj main promenade. Foul smell spreading into retail stores.', 'drainage', 'in_progress', 26.8504, 80.9427, 'Hazratganj Main Market, Mahatma Gandhi Marg', 'Opposite GPO building', 'Lucknow - Zone 1 (Central)', 87, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '11 hours'),

-- KOCHI
('CIVIC-2026-COK-01', 'Canal bridge railing damaged and tilted over waterway', 'Vehicle collided with iron bridge railing over canal. Gap left open with direct 15ft drop into water.', 'public_hazard', 'assigned', 9.9656, 76.2421, 'Fort Kochi Beach Road, Calvathy Canal Bridge', 'Near Chinese Fishing Nets', 'Kochi - West Zone (Fort Kochi)', 92, 'critical', false, 'd1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '16 hours'),

-- GUWAHATI
('CIVIC-2026-GAU-01', 'Flash flood water accumulation along GS Road tech corridor', 'Rainfall runoff from adjacent hills flooded GS road with 2 feet of red mud and water.', 'waterlogging', 'under_review', 26.1584, 91.7770, 'GS Road, Christian Basti', 'Opposite Guwahati Central Mall', 'Guwahati - Dispur Zone', 89, 'critical', false, 'd3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '8 hours'),

-- CHANDIGARH
('CIVIC-2026-IXC-01', 'Fallen tree bough blocking Sector 17 roundabout exit', 'Large bough snapped during evening winds, blocking Sector 17 / Sector 22 roundabout exit.', 'public_hazard', 'resolved', 30.7380, 76.7820, 'Sector 17 / Sector 22 Roundabout, Himalaya Marg', 'Near Neelam Cinema Plaza', 'Chandigarh - Central Sector', 65, 'high', false, 'd6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '2 days')
ON CONFLICT (ticket_number) DO NOTHING;
