/**
 * Script to seed Pan-India complaints into Supabase
 * Distributes realistic civic infrastructure complaints across major Indian metros:
 * Delhi NCR, Mumbai, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow, Kochi, Guwahati, Chandigarh.
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || 'https://quqiwofieqybsnrpyxpc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const panIndiaComplaints = [
  // --- DELHI NCR ---
  {
    ticket_number: 'CIVIC-2026-DEL-01',
    title: 'Severe waterlogging at Minto Bridge underpass',
    description: 'Underpass flooded with over 4 feet of stormwater after sudden cloudburst. DTC bus stalled in the middle.',
    category: 'waterlogging',
    status: 'under_review',
    latitude: 28.6328,
    longitude: 77.2223,
    address: 'Minto Bridge Underpass, Connaught Place Outer Circle',
    landmark: 'Near Shivaji Bridge Railway Station',
    ward_or_zone: 'Delhi NCR - Central',
    priority_score: 97,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd3333333-3333-3333-3333-333333333333'
  },
  {
    ticket_number: 'CIVIC-2026-DEL-02',
    title: 'Multiple deep potholes on Ring Road near AIIMS flyover',
    description: 'Heavy truck traffic has excavated 4 deep potholes right at the flyover descent. Multiple two-wheelers losing balance.',
    category: 'pothole',
    status: 'assigned',
    latitude: 28.5672,
    longitude: 77.2100,
    address: 'Ring Road, AIIMS Flyover Descent, South Extension',
    landmark: 'Opposite AIIMS Trauma Center Gate',
    ward_or_zone: 'Delhi NCR - South',
    priority_score: 89,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd1111111-1111-1111-1111-111111111111'
  },
  {
    ticket_number: 'CIVIC-2026-DEL-03',
    title: 'Streetlights out along dark stretch of Noida-Greater Noida Expressway',
    description: 'Over 12 consecutive high-mast streetlights are unlit on the highway corridor. Severe night visibility hazard.',
    category: 'streetlights',
    status: 'in_progress',
    latitude: 28.5020,
    longitude: 77.3820,
    address: 'Noida-Greater Noida Expressway, Sector 128',
    landmark: 'Near Jaypee Hospital exit',
    ward_or_zone: 'Delhi NCR - Noida',
    priority_score: 76,
    priority_tier: 'high',
    is_duplicate: false,
    assigned_department_id: 'd5555555-5555-5555-5555-555555555555'
  },

  // --- MUMBAI ---
  {
    ticket_number: 'CIVIC-2026-BOM-01',
    title: 'Hindmata Dadar subway waterlogging blocking traffic',
    description: 'Continuous high tide and monsoon rainfall caused 2.5 feet water accumulation. Best bus services diverted.',
    category: 'waterlogging',
    status: 'in_progress',
    latitude: 19.0178,
    longitude: 72.8478,
    address: 'Dr. Babasaheb Ambedkar Road, Hindmata, Dadar East',
    landmark: 'Opposite Hindmata Cinema',
    ward_or_zone: 'Mumbai - F South Ward (Dadar)',
    priority_score: 96,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd3333333-3333-3333-3333-333333333333'
  },
  {
    ticket_number: 'CIVIC-2026-BOM-02',
    title: 'Open manhole with missing cast iron cover on SV Road',
    description: 'Sewer manhole lid missing on busy pedestrian sidewalk. Covered only with temporary tree branch. Fatal pedestrian risk.',
    category: 'public_hazard',
    status: 'under_review',
    latitude: 19.1197,
    longitude: 72.8464,
    address: 'SV Road, Andheri West near Station Junction',
    landmark: 'Outside McDonald’s / Andheri Subway entry',
    ward_or_zone: 'Mumbai - K West Ward (Andheri)',
    priority_score: 98,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd2222222-2222-2222-2222-222222222222'
  },
  {
    ticket_number: 'CIVIC-2026-BOM-03',
    title: 'Garbage dump overflowing onto Marine Drive promenade side-street',
    description: 'Community refuse bins completely overwhelmed. Debris spilling onto the approach lane causing foul odors.',
    category: 'garbage',
    status: 'assigned',
    latitude: 18.9438,
    longitude: 72.8233,
    address: 'Veer Nariman Road, Churchgate near Marine Drive',
    landmark: 'Corner of Ambassador Hotel lane',
    ward_or_zone: 'Mumbai - A Ward (Colaba/Churchgate)',
    priority_score: 58,
    priority_tier: 'medium',
    is_duplicate: false,
    assigned_department_id: 'd4444444-4444-4444-4444-444444444444'
  },

  // --- HYDERABAD ---
  {
    ticket_number: 'CIVIC-2026-HYD-01',
    title: 'Massive sinkhole opening near Hitec City Cyber Towers circle',
    description: 'Road collapsed around underground stormwater pipeline. Traffic police barricaded one lane, bottlenecking tech corridor.',
    category: 'pothole',
    status: 'under_review',
    latitude: 17.4504,
    longitude: 78.3808,
    address: 'Hitec City Main Road, Cyber Towers Intersection',
    landmark: 'Beside Cyber Gateway flyover pillar 12',
    ward_or_zone: 'Hyderabad - Serilingampally (GHMC)',
    priority_score: 94,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd1111111-1111-1111-1111-111111111111'
  },
  {
    ticket_number: 'CIVIC-2026-HYD-02',
    title: 'Drainage overflow into residential colony near Hussain Sagar',
    description: 'Overflowing storm canal backing up into lower ground floors of apartment complexes on Tank Bund road.',
    category: 'drainage',
    status: 'assigned',
    latitude: 17.4239,
    longitude: 78.4738,
    address: 'Necklace Road approach, Khairatabad',
    landmark: 'Near IMAX Circle',
    ward_or_zone: 'Hyderabad - Central Zone',
    priority_score: 82,
    priority_tier: 'high',
    is_duplicate: false,
    assigned_department_id: 'd3333333-3333-3333-3333-333333333333'
  },

  // --- CHENNAI ---
  {
    ticket_number: 'CIVIC-2026-MAA-01',
    title: 'Seawater backflow into storm drains causing waterlogging in Velachery',
    description: 'High monsoon tides preventing stormwater discharge. Residential streets submerged under 1 foot stagnant water.',
    category: 'waterlogging',
    status: 'in_progress',
    latitude: 12.9815,
    longitude: 80.2180,
    address: 'Velachery Main Road, Ram Nagar',
    landmark: 'Near Velachery MRTS Station',
    ward_or_zone: 'Chennai - Zone 13 (Adyar/Velachery)',
    priority_score: 91,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd3333333-3333-3333-3333-333333333333'
  },
  {
    ticket_number: 'CIVIC-2026-MAA-02',
    title: 'Exposed live power distribution cable on T. Nagar commercial street',
    description: 'Underground cable joint exposed after road dig. Sparks seen during rain showers near shopping crowd.',
    category: 'public_hazard',
    status: 'under_review',
    latitude: 13.0418,
    longitude: 80.2341,
    address: 'Usman Road, T. Nagar shopping district',
    landmark: 'Outside Ranganathan Street entrance',
    ward_or_zone: 'Chennai - Zone 10 (Kodambakkam)',
    priority_score: 95,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd5555555-5555-5555-5555-555555555555'
  },

  // --- KOLKATA ---
  {
    ticket_number: 'CIVIC-2026-CCU-01',
    title: 'Tram line asphalt crumbling creating dangerous ruts on College Street',
    description: 'Road surface between tram tracks has deteriorated into deep grooves. Multiple bicycles caught in rail gap.',
    category: 'pothole',
    status: 'assigned',
    latitude: 22.5744,
    longitude: 88.3629,
    address: 'College Street, Bowbazar area',
    landmark: 'Near Presidency University gate',
    ward_or_zone: 'Kolkata - Borough V (KMC)',
    priority_score: 83,
    priority_tier: 'high',
    is_duplicate: false,
    assigned_department_id: 'd1111111-1111-1111-1111-111111111111'
  },
  {
    ticket_number: 'CIVIC-2026-CCU-02',
    title: 'Storm drain clogged with silt at Park Circus 7-point crossing',
    description: 'Heavy waterlogging reaching curb level after 30 minutes of rain. Traffic moving at walking speed.',
    category: 'drainage',
    status: 'in_progress',
    latitude: 22.5413,
    longitude: 88.3653,
    address: 'Park Circus 7-Point Crossing, Syed Amir Ali Avenue',
    landmark: 'Beside Quest Mall flyover entry',
    ward_or_zone: 'Kolkata - Borough VII (KMC)',
    priority_score: 88,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd3333333-3333-3333-3333-333333333333'
  },

  // --- PUNE ---
  {
    ticket_number: 'CIVIC-2026-PNQ-01',
    title: 'Severe road deterioration on Hinjewadi IT Park Phase 1 bridge',
    description: 'Pothole cluster spanning 50 meters on the flyover ramp. Heavy evening IT commute delayed by 45 mins.',
    category: 'pothole',
    status: 'under_review',
    latitude: 18.5913,
    longitude: 73.7389,
    address: 'Hinjewadi IT Park Main Road, Phase 1',
    landmark: 'Near Shivaji Chowk',
    ward_or_zone: 'Pune - Pimpri-Chinchwad (PCMC)',
    priority_score: 86,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd1111111-1111-1111-1111-111111111111'
  },
  {
    ticket_number: 'CIVIC-2026-PNQ-02',
    title: 'Garbage accumulation near riverside road in Deccan Gymkhana',
    description: 'Debris left unattended by municipal contractor. Stray dogs tearing plastics into Mutha river bed.',
    category: 'garbage',
    status: 'submitted',
    latitude: 18.5173,
    longitude: 73.8415,
    address: 'Deccan Gymkhana Riverside Road, FC Road side',
    landmark: 'Near Sambhaji Park Gate',
    ward_or_zone: 'Pune - Kasba-Vishrambaug (PMC)',
    priority_score: 64,
    priority_tier: 'medium',
    is_duplicate: false,
    assigned_department_id: 'd4444444-4444-4444-4444-444444444444'
  },

  // --- AHMEDABAD ---
  {
    ticket_number: 'CIVIC-2026-AMD-01',
    title: 'Water pipe rupture on SG Highway service road',
    description: 'High-pressure municipal potable main leaking thousands of gallons per hour onto commercial parking.',
    category: 'waterlogging',
    status: 'assigned',
    latitude: 23.0338,
    longitude: 72.5074,
    address: 'SG Highway Service Road, Bodakdev',
    landmark: 'Near ISKCON Cross Roads',
    ward_or_zone: 'Ahmedabad - West Zone (Bodakdev)',
    priority_score: 84,
    priority_tier: 'high',
    is_duplicate: false,
    assigned_department_id: 'd2222222-2222-2222-2222-222222222222'
  },

  // --- JAIPUR ---
  {
    ticket_number: 'CIVIC-2026-JAI-01',
    title: 'Loose stone slab on historic heritage wall overhang in Old City',
    description: 'Masonry brick dislodged on Badi Chaupar bazaar lane. High footfall tourist zone at risk.',
    category: 'public_hazard',
    status: 'under_review',
    latitude: 26.9239,
    longitude: 75.8267,
    address: 'Badi Chaupar Heritage Market, Pink City',
    landmark: 'Near Hawa Mahal North entrance',
    ward_or_zone: 'Jaipur - Heritage Zone',
    priority_score: 93,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd6666666-6666-6666-6666-666666666666'
  },

  // --- LUCKNOW ---
  {
    ticket_number: 'CIVIC-2026-LKO-01',
    title: 'Open sewer line overflowing on Hazratganj pedestrian walk',
    description: 'Blocked domestic sewer backflowing onto Hazratganj main promenade. Foul smell spreading into retail stores.',
    category: 'drainage',
    status: 'in_progress',
    latitude: 26.8504,
    longitude: 80.9427,
    address: 'Hazratganj Main Market, Mahatma Gandhi Marg',
    landmark: 'Opposite GPO building',
    ward_or_zone: 'Lucknow - Zone 1 (Central)',
    priority_score: 87,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd3333333-3333-3333-3333-333333333333'
  },

  // --- KOCHI ---
  {
    ticket_number: 'CIVIC-2026-COK-01',
    title: 'Canal bridge railing damaged and tilted over waterway',
    description: 'Vehicle collided with iron bridge railing over canal. Gap left open with direct 15ft drop into water.',
    category: 'public_hazard',
    status: 'assigned',
    latitude: 9.9656,
    longitude: 76.2421,
    address: 'Fort Kochi Beach Road, Calvathy Canal Bridge',
    landmark: 'Near Chinese Fishing Nets',
    ward_or_zone: 'Kochi - West Zone (Fort Kochi)',
    priority_score: 92,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd1111111-1111-1111-1111-111111111111'
  },

  // --- GUWAHATI ---
  {
    ticket_number: 'CIVIC-2026-GAU-01',
    title: 'Flash flood water accumulation along GS Road tech corridor',
    description: 'Rainfall runoff from adjacent hills flooded GS road with 2 feet of red mud and water.',
    category: 'waterlogging',
    status: 'under_review',
    latitude: 26.1584,
    longitude: 91.7770,
    address: 'GS Road, Christian Basti',
    landmark: 'Opposite Guwahati Central Mall',
    ward_or_zone: 'Guwahati - Dispur Zone',
    priority_score: 89,
    priority_tier: 'critical',
    is_duplicate: false,
    assigned_department_id: 'd3333333-3333-3333-3333-333333333333'
  },

  // --- CHANDIGARH ---
  {
    ticket_number: 'CIVIC-2026-IXC-01',
    title: 'Fallen eucalyptus tree branch blocking roundabout exit',
    description: 'Large bough snapped during evening winds, blocking Sector 17 / Sector 22 roundabout exit.',
    category: 'public_hazard',
    status: 'resolved',
    latitude: 30.7380,
    longitude: 76.7820,
    address: 'Sector 17 / Sector 22 Roundabout, Himalaya Marg',
    landmark: 'Near Neelam Cinema Plaza',
    ward_or_zone: 'Chandigarh - Central Sector',
    priority_score: 65,
    priority_tier: 'high',
    is_duplicate: false,
    assigned_department_id: 'd6666666-6666-6666-6666-666666666666'
  }
];

async function seedPanIndiaComplaints() {
  console.log(`🚀 Seeding ${panIndiaComplaints.length} Pan-India complaints across Delhi, Mumbai, Kolkata, Chennai, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow, Kochi, Guwahati, Chandigarh...`);

  let insertedCount = 0;
  for (const item of panIndiaComplaints) {
    const { error } = await supabase
      .from('complaints')
      .upsert(item, { onConflict: 'ticket_number' });

    if (error) {
      console.warn(`⚠️ Error inserting ${item.ticket_number}:`, error.message);
    } else {
      insertedCount++;
    }
  }

  console.log(`✅ Successfully seeded ${insertedCount} Pan-India complaints!`);
}

seedPanIndiaComplaints();
