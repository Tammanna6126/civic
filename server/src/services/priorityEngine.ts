import { GeminiAnalysisOutput } from '../schemas/complaint.schema';

export interface PriorityBreakdown {
  safety_pts: number;
  severity_pts: number;
  impact_pts: number;
  age_pts: number;
  cluster_pts: number;
  total_score: number;
  tier: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
}

/**
 * Deterministic, explainable 0-100 Priority Scoring Engine
 * 
 * Score Formula:
 * - Safety Risk (0 to 35 pts)
 * - Severity Level (0 to 25 pts)
 * - Public Impact (0 to 15 pts)
 * - Unresolved Age (0 to 10 pts)
 * - Cluster/Nearby Reports Bonus (0 to 15 pts)
 */
export function calculatePriorityScore(params: {
  analysis: GeminiAnalysisOutput;
  nearbyCount?: number;
  createdAt?: Date;
}): PriorityBreakdown {
  const { analysis, nearbyCount = 0, createdAt = new Date() } = params;
  const reasons: string[] = [];

  // 1. Safety Risk Points (0-35)
  // Scale 1-10 -> 3.5 pts each
  const safety_pts = Math.min(35, Math.round(analysis.safety_risk_score * 3.5));
  reasons.push(`Safety hazard rating of ${analysis.safety_risk_score}/10 contributed ${safety_pts}/35 points.`);

  // 2. Severity Points (0-25)
  let severity_pts = 5;
  switch (analysis.severity) {
    case 'critical':
      severity_pts = 25;
      reasons.push('Critical severity classification added maximum 25/25 severity points.');
      break;
    case 'high':
      severity_pts = 18;
      reasons.push('High severity classification added 18/25 severity points.');
      break;
    case 'medium':
      severity_pts = 10;
      reasons.push('Moderate severity classification added 10/25 severity points.');
      break;
    case 'low':
      severity_pts = 5;
      break;
  }

  // 3. Public Impact Points (0-15)
  let impact_pts = 4;
  switch (analysis.estimated_public_impact) {
    case 'massive':
      impact_pts = 15;
      reasons.push('Massive public impact (arterial transit/hospital access) added 15/15 points.');
      break;
    case 'high':
      impact_pts = 11;
      reasons.push('High public impact added 11/15 points.');
      break;
    case 'medium':
      impact_pts = 7;
      break;
    case 'low':
      impact_pts = 3;
      break;
  }

  // 4. Time Unresolved Points (0-10)
  const ageHours = Math.max(0, (Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
  let age_pts = 2;
  if (ageHours > 72) {
    age_pts = 10;
    reasons.push('Unresolved for >72 hours added 10/10 escalation points.');
  } else if (ageHours > 24) {
    age_pts = 6;
    reasons.push('Unresolved for >24 hours added 6/10 escalation points.');
  } else if (ageHours > 6) {
    age_pts = 4;
  }

  // 5. Cluster / Frequency Points (0-15)
  let cluster_pts = 0;
  if (nearbyCount >= 4) {
    cluster_pts = 15;
    reasons.push(`Severe hotspot density (${nearbyCount} nearby complaints) added 15/15 cluster points.`);
  } else if (nearbyCount >= 2) {
    cluster_pts = 10;
    reasons.push(`Repeated complaints (${nearbyCount} nearby) added 10/15 cluster points.`);
  } else if (nearbyCount === 1) {
    cluster_pts = 5;
  }

  let total_score = safety_pts + severity_pts + impact_pts + age_pts + cluster_pts;

  // FAST-TRACK CRITICAL OVERRIDE:
  // If safety_risk_score is 9 or 10 (life threatening like live power cable or open submerged manhole),
  // ensure the minimum score is 88 (Critical tier)
  if (analysis.safety_risk_score >= 9 && total_score < 88) {
    total_score = 88;
    reasons.push('FAST-TRACK: Immediate life-safety emergency automatically elevated score into Critical tier (>=88).');
  }

  // Bound to 0-100
  total_score = Math.max(0, Math.min(100, total_score));

  // Determine tier
  let tier: PriorityBreakdown['tier'] = 'low';
  if (total_score >= 85) {
    tier = 'critical';
  } else if (total_score >= 65) {
    tier = 'high';
  } else if (total_score >= 35) {
    tier = 'medium';
  }

  return {
    safety_pts,
    severity_pts,
    impact_pts,
    age_pts,
    cluster_pts,
    total_score,
    tier,
    reasons
  };
}
