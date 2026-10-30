import { supabaseAdmin } from '../config/supabase';

/**
 * Calculate Great-Circle distance between two coordinates in meters using Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Tokenize text into normalized lowercase word sets
 */
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Compute Jaccard similarity between two token sets
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersectionCount = 0;
  for (const token of tokens1) {
    if (tokens2.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = new Set([...tokens1, ...tokens2]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

export interface DuplicateCandidate {
  possibleDuplicateId: string;
  ticketNumber: string;
  title: string;
  distanceMeters: number;
  similarityScore: number;
  status: string;
}

/**
 * Detect possible duplicates for a newly submitted complaint against existing database complaints
 */
export async function detectDuplicates(
  newComplaintId: string,
  latitude: number,
  longitude: number,
  title: string,
  description: string,
  category: string
): Promise<DuplicateCandidate[]> {
  try {
    // Fetch recent active complaints within rough bounding box (+/- 0.01 deg is ~1.1km)
    const { data: candidates, error } = await supabaseAdmin
      .from('complaints')
      .select('id, ticket_number, title, description, category, latitude, longitude, status, created_at')
      .neq('id', newComplaintId)
      .gte('latitude', latitude - 0.01)
      .lte('latitude', latitude + 0.01)
      .gte('longitude', longitude - 0.01)
      .lte('longitude', longitude + 0.01)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !candidates || candidates.length === 0) {
      return [];
    }

    const detectedDuplicates: DuplicateCandidate[] = [];
    const combinedNewText = `${title} ${description}`;

    for (const item of candidates) {
      const distance = calculateDistanceMeters(latitude, longitude, item.latitude, item.longitude);
      
      // Duplicates typically occur within 150 meters
      if (distance <= 150) {
        const combinedItemText = `${item.title} ${item.description}`;
        const textSim = calculateTextSimilarity(combinedNewText, combinedItemText);
        const categoryMatchBonus = item.category === category ? 0.2 : 0;
        const totalSim = Math.min(1.0, textSim + categoryMatchBonus);

        // Flag as duplicate suggestion if similarity >= 0.50 within 150m or very close (<30m) with same category
        if (totalSim >= 0.50 || (distance <= 30 && item.category === category)) {
          detectedDuplicates.push({
            possibleDuplicateId: item.id,
            ticketNumber: item.ticket_number,
            title: item.title,
            distanceMeters: distance,
            similarityScore: Math.round(totalSim * 1000) / 1000,
            status: item.status
          });

          // Insert into complaint_duplicates table
          await supabaseAdmin.from('complaint_duplicates').upsert({
            complaint_id: newComplaintId,
            possible_duplicate_id: item.id,
            similarity_score: Math.round(totalSim * 1000) / 1000,
            distance_meters: distance,
            status: 'suggested'
          });
        }
      }
    }

    return detectedDuplicates;
  } catch (err) {
    console.error('Error during duplicate detection:', err);
    return [];
  }
}
