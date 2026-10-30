import { z } from 'zod';

export const CreateComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'pothole',
    'waterlogging',
    'garbage',
    'streetlights',
    'drainage',
    'public_hazard',
    'other'
  ]).default('other'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().min(3, 'Address is required'),
  landmark: z.string().optional(),
  ward_or_zone: z.string().default('Central Zone'),
  imageUrl: z.string().optional().or(z.literal('')),
  citizen_id: z.string().uuid().optional()
});

export type CreateComplaintInput = z.infer<typeof CreateComplaintSchema>;

// Strict schema for Gemini structured JSON output
export const GeminiAnalysisSchema = z.object({
  predicted_category: z.enum([
    'pothole',
    'waterlogging',
    'garbage',
    'streetlights',
    'drainage',
    'public_hazard',
    'other'
  ]),
  summary: z.string().min(10),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  safety_risk_score: z.number().int().min(1).max(10),
  estimated_public_impact: z.enum(['low', 'medium', 'high', 'massive']),
  suggested_department_code: z.enum([
    'ROADS',
    'WATER_SEWERAGE',
    'DRAINAGE',
    'WASTE',
    'ELECTRICAL',
    'PUBLIC_SAFETY'
  ]),
  recommended_action: z.string().min(10),
  cascading_risks: z.string(),
  priority_explanation: z.string(),
  safety_factors: z.array(z.string()).default([])
});

export type GeminiAnalysisOutput = z.infer<typeof GeminiAnalysisSchema>;

export const UpdateStatusSchema = z.object({
  status: z.enum([
    'submitted',
    'ai_analyzed',
    'under_review',
    'assigned',
    'in_progress',
    'resolved',
    'closed',
    'rejected'
  ]),
  comment: z.string().optional(),
  resolution_notes: z.string().optional(),
  proof_image_url: z.string().url().optional().or(z.literal('')),
  userId: z.string().uuid().optional()
});

export const AssignComplaintSchema = z.object({
  department_id: z.string().uuid().optional(),
  worker_id: z.string().uuid().optional(),
  assigned_by: z.string().uuid().optional(),
  comment: z.string().optional()
});
