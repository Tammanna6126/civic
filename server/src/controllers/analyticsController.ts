import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { generateActionBrief } from '../services/actionBriefService';

/**
 * Get aggregated hotspots and spatial clusters
 */
export async function getHotspots(req: Request, res: Response) {
  try {
    const { data: complaints, error } = await supabaseAdmin
      .from('complaints')
      .select('id, ticket_number, title, category, priority_score, priority_tier, latitude, longitude, ward_or_zone, status')
      .neq('status', 'resolved');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch complaints for hotspot calculation' });
    }

    const items = complaints || [];

    // Group complaints by Ward / Zone
    const zonesMap: Record<
      string,
      {
        ward: string;
        count: number;
        criticalCount: number;
        totalPriority: number;
        avgLat: number;
        avgLng: number;
        categories: Record<string, number>;
        items: any[];
      }
    > = {};

    for (const c of items) {
      const zoneKey = c.ward_or_zone || 'Central Zone';
      if (!zonesMap[zoneKey]) {
        zonesMap[zoneKey] = {
          ward: zoneKey,
          count: 0,
          criticalCount: 0,
          totalPriority: 0,
          avgLat: 0,
          avgLng: 0,
          categories: {},
          items: []
        };
      }

      const z = zonesMap[zoneKey];
      z.count++;
      if (c.priority_tier === 'critical') z.criticalCount++;
      z.totalPriority += c.priority_score;
      z.avgLat += c.latitude;
      z.avgLng += c.longitude;
      z.categories[c.category] = (z.categories[c.category] || 0) + 1;
      z.items.push(c);
    }

    const hotspots = Object.values(zonesMap).map((z) => {
      // Find top dominant category
      let topCategory = 'pothole';
      let maxCatCount = 0;
      for (const [cat, count] of Object.entries(z.categories)) {
        if (count > maxCatCount) {
          maxCatCount = count;
          topCategory = cat;
        }
      }

      const avgPriority = Math.round(z.totalPriority / z.count);
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (avgPriority >= 80 || z.criticalCount >= 2) {
        riskLevel = 'critical';
      } else if (avgPriority >= 60 || z.count >= 4) {
        riskLevel = 'high';
      } else if (avgPriority >= 35) {
        riskLevel = 'medium';
      }

      return {
        ward: z.ward,
        count: z.count,
        criticalCount: z.criticalCount,
        avgPriority,
        riskLevel,
        centerLat: z.avgLat / z.count,
        centerLng: z.avgLng / z.count,
        dominantCategory: topCategory,
        categoryBreakdown: z.categories
      };
    });

    // Sort by risk priority and count
    hotspots.sort((a, b) => b.avgPriority - a.avgPriority);

    return res.json({
      success: true,
      hotspots
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get dashboard KPI statistics
 */
export async function getDashboardStats(req: Request, res: Response) {
  try {
    const { data: complaints, error } = await supabaseAdmin
      .from('complaints')
      .select('id, category, status, priority_tier, priority_score, created_at, resolved_at');

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch complaints stats' });
    }

    const items = complaints || [];
    const total = items.length;
    const critical = items.filter((c) => c.priority_tier === 'critical').length;
    const high = items.filter((c) => c.priority_tier === 'high').length;
    const resolved = items.filter((c) => c.status === 'resolved').length;
    const inProgress = items.filter((c) => c.status === 'in_progress' || c.status === 'assigned').length;
    const pendingTriage = items.filter((c) => c.status === 'submitted' || c.status === 'ai_analyzed').length;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    for (const c of items) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }

    // Status distribution
    const statusCounts: Record<string, number> = {};
    for (const c of items) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    }

    // Average resolution time for resolved items in hours
    const resolvedItems = items.filter((c) => c.status === 'resolved' && c.resolved_at);
    let avgResolutionHours = 18.5; // default benchmark
    if (resolvedItems.length > 0) {
      const totalHours = resolvedItems.reduce((acc, c) => {
        const diff = (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60);
        return acc + Math.max(1, diff);
      }, 0);
      avgResolutionHours = Math.round((totalHours / resolvedItems.length) * 10) / 10;
    }

    return res.json({
      success: true,
      kpis: {
        totalComplaints: total,
        criticalHazards: critical,
        highPriority: high,
        pendingTriage,
        inProgress,
        resolved,
        resolutionRatePercent: total > 0 ? Math.round((resolved / total) * 100) : 0,
        avgResolutionHours
      },
      categoryDistribution: Object.entries(categoryCounts).map(([name, value]) => ({ name, value })),
      statusDistribution: Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Generate or get latest Action Brief
 */
export async function getActionBrief(req: Request, res: Response) {
  try {
    const brief = await generateActionBrief();
    return res.json({ success: true, brief });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
