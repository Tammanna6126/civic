import React from 'react';
import { ActionBrief } from '../../types';
import {
  Sparkles,
  AlertTriangle,
  GitMerge,
  CheckCircle2,
  Building,
  RefreshCw
} from 'lucide-react';

interface Props {
  brief: ActionBrief | null;
  loading: boolean;
  onRefresh: () => void;
}

export const ActionBriefView: React.FC<Props> = ({ brief, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
        <h3 className="font-bold text-base text-white">
          Gemini AI Synthesizing Municipal Action Brief...
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Correlating multi-ward hazard density, cross-department dependencies, and cascading infrastructure risks.
        </p>
      </div>
    );
  }

  if (!brief) {
    return null;
  }

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-indigo-500/20 space-y-8 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>GEMINI MUNICIPAL INTELLIGENCE</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            {brief.title}
          </h2>
        </div>

        <button
          onClick={onRefresh}
          className="self-start sm:self-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          <span>Regenerate Brief</span>
        </button>
      </div>

      {/* Executive Summary */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-sm leading-relaxed text-slate-200">
        <p className="font-medium">{brief.summary}</p>
      </div>

      {/* Grid: Urgent Hazards & Hotspot Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Issues */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Top Life-Safety Hazards Requiring Emergency Cordon</span>
          </div>

          <div className="space-y-2.5">
            {brief.urgent_issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{issue.title}</h4>
                  <span className="text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
                    Score {issue.priority}
                  </span>
                </div>
                <p className="text-xs text-rose-300/80">{issue.hazard}</p>
                <div className="text-[11px] text-slate-400 font-mono">
                  Location: {issue.location}
                </div>
                <div className="text-xs font-medium text-emerald-400 pt-1 border-t border-slate-800/80">
                  Action: {issue.recommended_action}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hotspots Summary */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>Cluster Density Across Municipal Wards</span>
          </div>

          <div className="space-y-2.5">
            {brief.hotspots_summary.map((hs, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-100">{hs.zone}</h4>
                  <span className="text-[11px] text-slate-400">
                    Primary: <span className="capitalize text-amber-400">{hs.primary_category}</span>
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold text-white">
                    {hs.complaint_count} Complaints
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      hs.risk_level === 'Critical'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {hs.risk_level} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Infrastructure Relationship & Cascading Dependencies */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
          <GitMerge className="w-4 h-4" />
          <span>Cross-System Infrastructure Dependencies & Cascading Risks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brief.infrastructure_relationships.map((rel, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/80 border border-indigo-500/20 space-y-2 text-xs"
            >
              <div className="font-bold text-white text-xs flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>{rel.relationship}</span>
              </div>
              <p className="text-slate-400">
                <strong className="text-slate-300">Contributing:</strong> {rel.contributing_factors}
              </p>
              <p className="text-slate-400">
                <strong className="text-rose-400">Cascading Impact:</strong> {rel.cascading_impact}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-emerald-400 font-medium">
                <strong>Remediation:</strong> {rel.intervention}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Priorities */}
      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Recommended Commissioner Directives</span>
        </h4>
        <ul className="space-y-1.5">
          {brief.recommended_priorities.map((rec, i) => (
            <li key={i} className="text-xs text-slate-200 flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
