import {
  Complaint,
  DashboardStats,
  Hotspot,
  ActionBrief,
  ComplaintCategory,
  PriorityTier
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = {
  // Submit new complaint
  async submitComplaint(data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    latitude: number;
    longitude: number;
    address: string;
    landmark?: string;
    ward_or_zone?: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit complaint');
    }
    return res.json();
  },

  // Get complaints list with filters
  async getComplaints(filters?: {
    status?: string;
    category?: string;
    priority_tier?: string;
    ward_or_zone?: string;
    search?: string;
  }): Promise<{ success: boolean; count: number; complaints: Complaint[] }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.priority_tier) params.append('priority_tier', filters.priority_tier);
    if (filters?.ward_or_zone) params.append('ward_or_zone', filters.ward_or_zone);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/complaints?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load complaints');
    return res.json();
  },

  // Get single complaint by ID
  async getComplaintById(id: string): Promise<{ success: boolean; complaint: Complaint; duplicates: any[] }> {
    const res = await fetch(`${API_BASE}/complaints/${id}`);
    if (!res.ok) throw new Error('Failed to load complaint details');
    return res.json();
  },

  // Update complaint status
  async updateStatus(
    id: string,
    status: string,
    comment?: string,
    resolution_notes?: string,
    proof_image_url?: string
  ): Promise<{ success: boolean; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment, resolution_notes, proof_image_url })
    });
    if (!res.ok) throw new Error('Failed to update complaint status');
    return res.json();
  },

  // Assign complaint
  async assignComplaint(
    id: string,
    department_id?: string,
    worker_id?: string,
    comment?: string
  ): Promise<{ success: boolean; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_id, worker_id, comment })
    });
    if (!res.ok) throw new Error('Failed to assign complaint');
    return res.json();
  },

  // Review duplicate
  async reviewDuplicate(
    id: string,
    possible_duplicate_id: string,
    action: 'confirm_merge' | 'dismiss'
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/review-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ possible_duplicate_id, action })
    });
    if (!res.ok) throw new Error('Failed to review duplicate');
    return res.json();
  },

  // Get Hotspots
  async getHotspots(): Promise<{ success: boolean; hotspots: Hotspot[] }> {
    const res = await fetch(`${API_BASE}/analytics/hotspots`);
    if (!res.ok) throw new Error('Failed to load hotspots');
    return res.json();
  },

  // Get Dashboard KPI Stats
  async getStats(): Promise<{ success: boolean } & DashboardStats> {
    const res = await fetch(`${API_BASE}/analytics/stats`);
    if (!res.ok) throw new Error('Failed to load dashboard stats');
    return res.json();
  },

  // Generate / Get AI Action Brief
  async getActionBrief(): Promise<{ success: boolean; brief: ActionBrief }> {
    const res = await fetch(`${API_BASE}/analytics/action-brief`);
    if (!res.ok) throw new Error('Failed to generate action brief');
    return res.json();
  }
};
