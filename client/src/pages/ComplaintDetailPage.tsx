import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Complaint } from '../types';
import { api } from '../services/api';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatusTimeline } from '../components/citizen/StatusTimeline';
import {
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  Building2,
  GitMerge,
  ArrowLeft,
  CheckCircle2,
  Info,
  Layers,
  Flame,
  Calendar
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const markerIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#10b981" stroke="#047857" stroke-width="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  className: 'detail-map-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

export const ComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.getComplaintById(id);
        if (res.success && res.complaint) {
          setComplaint(res.complaint);
        } else {
          setError('Complaint not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Loading verified incident details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Incident Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Unable to locate ticket record.'}</p>
        <Link to="/" className="inline-block px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-emerald-400">
          Back to Overview
        </Link>
      </div>
    );
  }

  const breakdown = complaint.ai_analyses?.priority_breakdown;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Console</span>
        </Link>

        <div className="flex items-center space-x-2">
          <StatusBadge status={complaint.status} size="md" />
          <PriorityBadge tier={complaint.priority_tier} score={complaint.priority_score} size="md" />
        </div>
      </div>

      {/* Main Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {complaint.ticket_number}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {complaint.category.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>{new Date(complaint.created_at).toLocaleString()}</span>
            </span>
            {complaint.is_duplicate && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                Linked Duplicate
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {complaint.title}
        </h1>

        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          {complaint.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">{complaint.address}</span>
          </div>
          <span>•</span>
          <div>
            Zone: <span className="text-slate-200 font-semibold">{complaint.ward_or_zone}</span>
          </div>
          <span>•</span>
          <div>
            Assigned: <span className="text-emerald-400 font-semibold">{complaint.departments?.name || 'In Triage Queue'}</span>
          </div>
        </div>
      </div>

      {/* Grid: AI Risk Analysis & Mini Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: AI Explainability & Priority Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Transparent Score Breakdown Card */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-5 shadow-xl bg-slate-900/90">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">
                  Explainable Priority Score Breakdown
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Total Score:</span>
                <span className="text-lg font-mono font-extrabold text-white bg-slate-950 px-2.5 py-0.5 rounded-lg border border-indigo-500/40">
                  {complaint.priority_score} / 100
                </span>
              </div>
            </div>

            {/* Component Factor Bars */}
            {breakdown && (
              <div className="space-y-3">
                {/* Safety Risk */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>Public Safety Hazard Rating</span>
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      {breakdown.safety_pts} / 35 pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${(breakdown.safety_pts / 35) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">Structural Problem Severity</span>
                    <span className="font-mono font-bold text-amber-400">
                      {breakdown.severity_pts} / 25 pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(breakdown.severity_pts / 25) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Public Impact */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">Public Transit / Density Impact</span>
                    <span className="font-mono font-bold text-sky-400">
                      {breakdown.impact_pts} / 15 pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${(breakdown.impact_pts / 15) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Cluster & Repeats */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">Nearby Complaint Frequency & Density</span>
                    <span className="font-mono font-bold text-purple-400">
                      {breakdown.cluster_pts} / 15 pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(breakdown.cluster_pts / 15) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Age Escalation */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">Unresolved Time Escalation</span>
                    <span className="font-mono font-bold text-slate-400">
                      {breakdown.age_pts} / 10 pts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-slate-500 rounded-full"
                      style={{ width: `${(breakdown.age_pts / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Score Rationale Bullet Points */}
            {breakdown?.reasons && (
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Algorithmic Rationale:
                </span>
                <ul className="space-y-1">
                  {breakdown.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start space-x-1.5">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* AI Insights: Action & Cascading Risks */}
          {complaint.ai_analyses && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center space-x-2">
                <GitMerge className="w-4 h-4 text-emerald-400" />
                <span>Field Operational Directives & Cascading Risks</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase text-[10px]">
                    Recommended Field Action:
                  </span>
                  <p className="text-slate-200">{complaint.ai_analyses.recommended_action}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-bold text-rose-400 uppercase text-[10px]">
                    Cascading Infrastructure Risk:
                  </span>
                  <p className="text-slate-300">{complaint.ai_analyses.cascading_risks}</p>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Proof Notes (if resolved) */}
          {complaint.status === 'resolved' && (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 space-y-3 bg-emerald-950/15">
              <div className="flex items-center space-x-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Verified Remediation Proof</h3>
              </div>
              <p className="text-xs text-slate-200 font-medium">
                {complaint.resolution_notes || 'All reported hazards eliminated and verified by field lead.'}
              </p>
              {complaint.resolved_at && (
                <div className="text-[11px] font-mono text-slate-400">
                  Resolved on: {new Date(complaint.resolved_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Map & Status Pipeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Mini Map */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Exact Incident Coordinates
              </h4>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${complaint.latitude},${complaint.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
              >
                <span>Open in Google Maps ↗</span>
              </a>
            </div>
            <div className="h-60 rounded-xl overflow-hidden border border-slate-700">
              <MapContainer
                center={[complaint.latitude, complaint.longitude]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution="&copy; Google Maps"
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  maxZoom={20}
                />
                <Marker position={[complaint.latitude, complaint.longitude]} icon={markerIcon} />
              </MapContainer>
            </div>
            <div className="text-right text-[11px] font-mono text-emerald-400">
              GPS: {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
            </div>
          </div>

          {/* Status Pipeline Timeline */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Lifecycle History & Audit Trail
            </h4>
            <StatusTimeline
              currentStatus={complaint.status}
              history={complaint.status_history || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
