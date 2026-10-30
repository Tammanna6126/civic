import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import {
  CreateComplaintSchema,
  UpdateStatusSchema,
  AssignComplaintSchema
} from '../schemas/complaint.schema';
import { analyzeComplaintWithGemini } from '../services/geminiService';
import { calculatePriorityScore } from '../services/priorityEngine';
import { detectDuplicates } from '../services/duplicateService';

/**
 * Submit a new citizen complaint with immediate AI analysis & priority scoring
 */
export async function submitComplaint(req: Request, res: Response) {
  try {
    const validated = CreateComplaintSchema.parse(req.body);

    // Generate readable sequential-style ticket number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `CIVIC-2026-${randomSuffix}`;

    // 1. Insert initial complaint record
    const { data: complaint, error: insertError } = await supabaseAdmin
      .from('complaints')
      .insert({
        ticket_number: ticketNumber,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        latitude: validated.latitude,
        longitude: validated.longitude,
        address: validated.address,
        landmark: validated.landmark || null,
        ward_or_zone: validated.ward_or_zone || 'Central Zone',
        status: 'submitted',
        citizen_id: validated.citizen_id || null
      })
      .select()
      .single();

    if (insertError || !complaint) {
      console.error('Failed to insert complaint in DB:', insertError);
      return res.status(500).json({ error: 'Failed to create complaint in database', details: insertError?.message });
    }

    // 2. Save image if provided
    if (validated.imageUrl) {
      await supabaseAdmin.from('complaint_images').insert({
        complaint_id: complaint.id,
        image_url: validated.imageUrl,
        image_type: 'evidence_original'
      });
    }

    // 3. Run Gemini AI analysis
    const aiAnalysis = await analyzeComplaintWithGemini({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      address: complaint.address,
      ward_or_zone: complaint.ward_or_zone
    });

    // 4. Run Duplicate Detection against nearby complaints
    const duplicates = await detectDuplicates(
      complaint.id,
      complaint.latitude,
      complaint.longitude,
      complaint.title,
      complaint.description,
      aiAnalysis.predicted_category
    );

    // 5. Calculate transparent priority score
    const priority = calculatePriorityScore({
      analysis: aiAnalysis,
      nearbyCount: duplicates.length,
      createdAt: new Date(complaint.created_at)
    });

    // 6. Look up matching department ID
    const { data: dept } = await supabaseAdmin
      .from('departments')
      .select('id')
      .eq('code', aiAnalysis.suggested_department_code)
      .maybeSingle();

    // 7. Update complaint with computed priority & status 'ai_analyzed'
    const { data: updatedComplaint } = await supabaseAdmin
      .from('complaints')
      .update({
        category: aiAnalysis.predicted_category, // Auto-refine category if AI identified better match
        priority_score: priority.total_score,
        priority_tier: priority.tier,
        status: 'ai_analyzed',
        assigned_department_id: dept?.id || null,
        is_duplicate: duplicates.length > 0
      })
      .eq('id', complaint.id)
      .select('*, departments(*), complaint_images(*)')
      .single();

    // 8. Store AI analysis record
    await supabaseAdmin.from('ai_analyses').insert({
      complaint_id: complaint.id,
      predicted_category: aiAnalysis.predicted_category,
      summary: aiAnalysis.summary,
      severity: aiAnalysis.severity,
      safety_risk_score: aiAnalysis.safety_risk_score,
      estimated_public_impact: aiAnalysis.estimated_public_impact,
      suggested_department_code: aiAnalysis.suggested_department_code,
      recommended_action: aiAnalysis.recommended_action,
      cascading_risks: aiAnalysis.cascading_risks,
      priority_score: priority.total_score,
      priority_tier: priority.tier,
      priority_breakdown: priority
    });

    // 9. Record initial status history audit trail
    await supabaseAdmin.from('status_history').insert([
      {
        complaint_id: complaint.id,
        from_status: null,
        to_status: 'submitted',
        comment: 'Citizen submitted infrastructure report'
      },
      {
        complaint_id: complaint.id,
        from_status: 'submitted',
        to_status: 'ai_analyzed',
        comment: `AI risk evaluation completed. Score: ${priority.total_score} (${priority.tier.toUpperCase()}). Suggested Dept: ${aiAnalysis.suggested_department_code}`
      }
    ]);

    return res.status(201).json({
      success: true,
      complaint: updatedComplaint || complaint,
      aiAnalysis,
      priorityBreakdown: priority,
      duplicates
    });
  } catch (err: any) {
    console.error('Error in submitComplaint:', err);
    return res.status(400).json({ error: err.message || 'Validation or processing error' });
  }
}

/**
 * Get all complaints with filtering, sorting, and relations
 */
export async function getComplaints(req: Request, res: Response) {
  try {
    const { status, category, priority_tier, ward_or_zone, search } = req.query;

    let query = supabaseAdmin
      .from('complaints')
      .select('*, departments(*), ai_analyses(*), complaint_images(*)')
      .order('priority_score', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }
    if (category && category !== 'all') {
      query = query.eq('category', category as string);
    }
    if (priority_tier && priority_tier !== 'all') {
      query = query.eq('priority_tier', priority_tier as string);
    }
    if (ward_or_zone && ward_or_zone !== 'all') {
      query = query.eq('ward_or_zone', ward_or_zone as string);
    }
    if (search && typeof search === 'string') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,ticket_number.ilike.%${search}%,address.ilike.%${search}%`);
    }

    const { data: complaints, error } = await query;

    if (error) {
      console.error('Error fetching complaints:', error);
      return res.status(500).json({ error: 'Failed to fetch complaints' });
    }

    return res.json({ success: true, count: complaints?.length || 0, complaints: complaints || [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get single complaint by ID with all relations
 */
export async function getComplaintById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const { data: complaint, error } = await supabaseAdmin
      .from('complaints')
      .select('*, departments(*), ai_analyses(*), complaint_images(*), status_history(*)')
      .eq('id', id)
      .single();

    if (error || !complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Fetch any duplicate linkages
    const { data: duplicateLinks } = await supabaseAdmin
      .from('complaint_duplicates')
      .select('*, possible_duplicate:possible_duplicate_id(*)')
      .eq('complaint_id', id);

    return res.json({
      success: true,
      complaint,
      duplicates: duplicateLinks || []
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Update complaint status (with audit trail)
 */
export async function updateComplaintStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validated = UpdateStatusSchema.parse(req.body);

    const { data: current, error: fetchErr } = await supabaseAdmin
      .from('complaints')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchErr || !current) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const updates: any = {
      status: validated.status
    };

    if (validated.status === 'resolved') {
      updates.resolved_at = new Date().toISOString();
      if (validated.resolution_notes) {
        updates.resolution_notes = validated.resolution_notes;
      }
    }

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select('*, departments(*)')
      .single();

    if (updateErr) {
      return res.status(500).json({ error: 'Failed to update status', details: updateErr.message });
    }

    // Save proof image if attached
    if (validated.proof_image_url) {
      await supabaseAdmin.from('complaint_images').insert({
        complaint_id: id,
        image_url: validated.proof_image_url,
        image_type: 'resolution_proof',
        caption: validated.comment || 'Work completion proof'
      });
    }

    // Add audit entry
    await supabaseAdmin.from('status_history').insert({
      complaint_id: id,
      from_status: current.status,
      to_status: validated.status,
      changed_by: validated.userId || null,
      comment: validated.comment || `Status updated from ${current.status} to ${validated.status}`
    });

    return res.json({ success: true, complaint: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

/**
 * Assign complaint to department or worker
 */
export async function assignComplaint(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const validated = AssignComplaintSchema.parse(req.body);

    const updates: any = {
      status: 'assigned'
    };
    if (validated.department_id) updates.assigned_department_id = validated.department_id;
    if (validated.worker_id) updates.assigned_worker_id = validated.worker_id;

    const { data: updated, error } = await supabaseAdmin
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select('*, departments(*)')
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to assign complaint', details: error.message });
    }

    await supabaseAdmin.from('status_history').insert({
      complaint_id: id,
      from_status: 'under_review',
      to_status: 'assigned',
      changed_by: validated.assigned_by || null,
      comment: validated.comment || 'Assigned to field operational department'
    });

    return res.json({ success: true, complaint: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}

/**
 * Review and resolve duplicate suggestions
 */
export async function reviewDuplicate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { possible_duplicate_id, action, reviewed_by } = req.body;

    if (!possible_duplicate_id || !action) {
      return res.status(400).json({ error: 'possible_duplicate_id and action are required' });
    }

    if (action === 'confirm_merge') {
      // Mark as duplicate and link primary
      await supabaseAdmin
        .from('complaints')
        .update({
          is_duplicate: true,
          primary_complaint_id: possible_duplicate_id
        })
        .eq('id', id);

      await supabaseAdmin
        .from('complaint_duplicates')
        .update({
          status: 'confirmed_merged',
          reviewed_by: reviewed_by || null
        })
        .eq('complaint_id', id)
        .eq('possible_duplicate_id', possible_duplicate_id);

      return res.json({ success: true, message: 'Complaint linked to primary ticket successfully' });
    } else {
      await supabaseAdmin
        .from('complaint_duplicates')
        .update({
          status: 'dismissed',
          reviewed_by: reviewed_by || null
        })
        .eq('complaint_id', id)
        .eq('possible_duplicate_id', possible_duplicate_id);

      return res.json({ success: true, message: 'Duplicate suggestion dismissed' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
