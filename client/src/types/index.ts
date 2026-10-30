export type UserRole = 'citizen' | 'municipal_admin' | 'maintenance_worker';

export type ComplaintCategory = 
  | 'pothole' 
  | 'waterlogging' 
  | 'garbage' 
  | 'streetlights' 
  | 'drainage' 
  | 'public_hazard' 
  | 'other';

export type ComplaintStatus = 
  | 'submitted' 
  | 'ai_analyzed' 
  | 'under_review' 
  | 'assigned' 
  | 'in_progress' 
  | 'resolved' 
  | 'closed' 
  | 'rejected';

export type PriorityTier = 'low' | 'medium' | 'high' | 'critical';

export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  contact_email?: string;
}

export interface ComplaintImage {
  id: string;
  complaint_id: string;
  image_url: string;
  image_type: 'evidence_original' | 'resolution_proof';
  caption?: string;
  created_at: string;
}

export interface PriorityBreakdown {
  safety_pts: number;
  severity_pts: number;
  impact_pts: number;
  age_pts: number;
  cluster_pts: number;
  total_score: number;
  tier: PriorityTier;
  reasons: string[];
}

export interface AIAnalysis {
  id?: string;
  complaint_id: string;
  predicted_category: ComplaintCategory;
  summary: string;
  severity: PriorityTier;
  safety_risk_score: number;
  estimated_public_impact: 'low' | 'medium' | 'high' | 'massive';
  suggested_department_code: string;
  recommended_action: string;
  cascading_risks: string;
  priority_score: number;
  priority_tier: PriorityTier;
  priority_breakdown: PriorityBreakdown;
  created_at?: string;
}

export interface StatusHistory {
  id: string;
  complaint_id: string;
  from_status?: string | null;
  to_status: string;
  comment?: string;
  created_at: string;
}

export interface DuplicateCandidate {
  possibleDuplicateId: string;
  ticketNumber: string;
  title: string;
  distanceMeters: number;
  similarityScore: number;
  status: string;
}

export interface Complaint {
  id: string;
  ticket_number: string;
  citizen_id?: string | null;
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string | null;
  ward_or_zone: string;
  priority_score: number;
  priority_tier: PriorityTier;
  is_duplicate: boolean;
  primary_complaint_id?: string | null;
  assigned_department_id?: string | null;
  assigned_worker_id?: string | null;
  resolution_notes?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
  departments?: Department;
  ai_analyses?: AIAnalysis;
  complaint_images?: ComplaintImage[];
  status_history?: StatusHistory[];
}

export interface DashboardStats {
  kpis: {
    totalComplaints: number;
    criticalHazards: number;
    highPriority: number;
    pendingTriage: number;
    inProgress: number;
    resolved: number;
    resolutionRatePercent: number;
    avgResolutionHours: number;
  };
  categoryDistribution: Array<{ name: string; value: number }>;
  statusDistribution: Array<{ name: string; value: number }>;
}

export interface Hotspot {
  ward: string;
  count: number;
  criticalCount: number;
  avgPriority: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  centerLat: number;
  centerLng: number;
  dominantCategory: string;
  categoryBreakdown: Record<string, number>;
}

export interface ActionBrief {
  id?: string;
  title: string;
  summary: string;
  urgent_issues: Array<{
    title: string;
    hazard: string;
    location: string;
    priority: number;
    recommended_action: string;
  }>;
  hotspots_summary: Array<{
    zone: string;
    complaint_count: number;
    primary_category: string;
    risk_level: string;
  }>;
  infrastructure_relationships: Array<{
    relationship: string;
    contributing_factors: string;
    cascading_impact: string;
    intervention: string;
  }>;
  recommended_priorities: string[];
  created_at?: string;
}
