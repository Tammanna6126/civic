import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env';
import { GeminiAnalysisSchema, GeminiAnalysisOutput } from '../schemas/complaint.schema';

let genAI: GoogleGenerativeAI | null = null;
if (ENV.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    console.log('🤖 Google Gemini Client initialized.');
  } catch (err) {
    console.error('Failed to initialize Google Gemini client:', err);
  }
}

/**
 * Robust AI complaint analysis with Zod validation and reliable fallback
 */
export async function analyzeComplaintWithGemini(params: {
  title: string;
  description: string;
  category: string;
  address: string;
  ward_or_zone?: string;
}): Promise<GeminiAnalysisOutput> {
  const { title, description, category, address, ward_or_zone } = params;

  const prompt = `
You are a senior municipal civil engineer and AI risk analyst for a smart city infrastructure platform.
Analyze the following citizen infrastructure complaint and provide structured assessment.

COMPLAINT DETAILS:
- Title: "${title}"
- Description: "${description}"
- Citizen Selected Category: "${category}"
- Address: "${address}"
- Zone/Ward: "${ward_or_zone || 'Urban Ward'}"

Return ONLY valid JSON matching this schema exactly (no markdown formatting, no code block backticks):
{
  "predicted_category": "pothole" | "waterlogging" | "garbage" | "streetlights" | "drainage" | "public_hazard" | "other",
  "summary": "Concise 1-2 sentence executive summary of the issue and location",
  "severity": "low" | "medium" | "high" | "critical",
  "safety_risk_score": integer between 1 and 10 (10 = imminent life safety danger like live 11kV wire or open submerged manhole),
  "estimated_public_impact": "low" | "medium" | "high" | "massive",
  "suggested_department_code": "ROADS" | "WATER_SEWERAGE" | "DRAINAGE" | "WASTE" | "ELECTRICAL" | "PUBLIC_SAFETY",
  "recommended_action": "Specific, actionable operational steps for municipal field dispatch",
  "cascading_risks": "Explain potential domino infrastructure effects (e.g., trash clogging drains -> waterlogging -> road erosion)",
  "priority_explanation": "Clear, objective explanation of why this priority and severity were assigned",
  "safety_factors": ["list", "of", "specific", "hazards", "identified"]
}
`;

  // Attempt live Gemini inference if client and key exist
  if (genAI && ENV.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsedJson = JSON.parse(text);

      const validated = GeminiAnalysisSchema.parse(parsedJson);
      return validated;
    } catch (err: any) {
      console.warn('⚠️ Gemini live inference failed or returned unparseable output. Using expert civic rules fallback:', err.message);
    }
  }

  // Graceful civic expert rule-based fallback (Guarantees zero demo failures)
  return generateCivicRuleFallback(title, description, category);
}

/**
 * Deterministic, intelligent civic-rule fallback when AI API is unavailable/rate-limited
 */
function generateCivicRuleFallback(
  title: string,
  description: string,
  category: string
): GeminiAnalysisOutput {
  const combined = (title + ' ' + description).toLowerCase();

  let predicted_category: GeminiAnalysisOutput['predicted_category'] = 'other';
  let suggested_department_code: GeminiAnalysisOutput['suggested_department_code'] = 'PUBLIC_SAFETY';
  let severity: GeminiAnalysisOutput['severity'] = 'medium';
  let safety_risk_score = 5;
  let estimated_public_impact: GeminiAnalysisOutput['estimated_public_impact'] = 'medium';
  const safety_factors: string[] = [];

  // 1. Critical Hazard & Electrical Check
  if (
    combined.includes('wire') ||
    combined.includes('electric') ||
    combined.includes('transformer') ||
    combined.includes('spark') ||
    combined.includes('current') ||
    combined.includes('shock')
  ) {
    predicted_category = 'public_hazard';
    suggested_department_code = 'ELECTRICAL';
    severity = 'critical';
    safety_risk_score = 10;
    estimated_public_impact = 'high';
    safety_factors.push('High-voltage electrocution hazard', 'Fire risk to nearby pedestrian traffic');
  } else if (
    combined.includes('manhole') ||
    combined.includes('open drain') ||
    combined.includes('uncovered') ||
    combined.includes('sinkhole') ||
    combined.includes('collapsed')
  ) {
    predicted_category = 'public_hazard';
    suggested_department_code = 'WATER_SEWERAGE';
    severity = 'critical';
    safety_risk_score = 9;
    estimated_public_impact = 'high';
    safety_factors.push('Fall injury hazard', 'Vehicle wheel entrapment', 'Submerged cavity');
  } else if (
    combined.includes('pothole') ||
    combined.includes('crater') ||
    combined.includes('road broken') ||
    combined.includes('asphalt') ||
    category === 'pothole'
  ) {
    predicted_category = 'pothole';
    suggested_department_code = 'ROADS';
    severity = combined.includes('deep') || combined.includes('accident') ? 'high' : 'medium';
    safety_risk_score = severity === 'high' ? 8 : 5;
    estimated_public_impact = 'high';
    safety_factors.push('Two-wheeler skid risk', 'Traffic bottleneck');
  } else if (
    combined.includes('waterlog') ||
    combined.includes('flood') ||
    combined.includes('drain') ||
    category === 'waterlogging' ||
    category === 'drainage'
  ) {
    predicted_category = combined.includes('drain') ? 'drainage' : 'waterlogging';
    suggested_department_code = 'DRAINAGE';
    severity = combined.includes('knee') || combined.includes('severe') ? 'critical' : 'high';
    safety_risk_score = severity === 'critical' ? 8 : 6;
    estimated_public_impact = 'massive';
    safety_factors.push('Road sub-base erosion', 'Waterborne vector diseases', 'Access obstruction');
  } else if (
    combined.includes('garbage') ||
    combined.includes('trash') ||
    combined.includes('dump') ||
    combined.includes('waste') ||
    category === 'garbage'
  ) {
    predicted_category = 'garbage';
    suggested_department_code = 'WASTE';
    severity = combined.includes('huge') || combined.includes('spill') ? 'high' : 'medium';
    safety_risk_score = 4;
    estimated_public_impact = 'medium';
    safety_factors.push('Sanitary nuisance', 'Drain blockages', 'Stray animal accumulation');
  } else if (
    combined.includes('streetlight') ||
    combined.includes('dark') ||
    combined.includes('lamp') ||
    category === 'streetlights'
  ) {
    predicted_category = 'streetlights';
    suggested_department_code = 'ELECTRICAL';
    severity = 'medium';
    safety_risk_score = 6;
    estimated_public_impact = 'medium';
    safety_factors.push('Reduced nighttime visibility', 'Pedestrian personal security risk');
  }

  return {
    predicted_category,
    summary: `${title}. Reported in public transit area requiring municipal remediation.`,
    severity,
    safety_risk_score,
    estimated_public_impact,
    suggested_department_code,
    recommended_action: `Dispatch ${suggested_department_code} inspection unit, erect protective safety cordon, and schedule priority repair.`,
    cascading_risks: `Unaddressed ${predicted_category} can trigger secondary road deterioration, drainage obstruction, and increased vehicular hazards.`,
    priority_explanation: `Assigned severity '${severity}' based on physical safety risk score of ${safety_risk_score}/10 and community mobility impact.`,
    safety_factors: safety_factors.length > 0 ? safety_factors : ['Public right-of-way obstruction']
  };
}
