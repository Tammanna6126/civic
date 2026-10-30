import React, { useState, useEffect } from 'react';
import { ComplaintForm } from '../components/citizen/ComplaintForm';
import { Complaint } from '../types';
import { api } from '../services/api';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { StatusTimeline } from '../components/citizen/StatusTimeline';
import {
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CitizenPortal: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.getComplaints();
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error('Failed to load citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmitted = (newComplaint: Complaint) => {
    setActiveComplaint(newComplaint);
    setComplaints((prev) => [newComplaint, ...prev]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-emerald-500/20 p-8 sm:p-10 shadow-2xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-POWERED CIVIC REPORTING & RAPID TRIAGE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Report Infrastructure Issues in Seconds
          </h1>
          <p className="text-sm sm:text-base text-slate-300">
            Submit road hazards, clogged drains, waterlogging, or power issues.
            Google Gemini instantly classifies the root hazard, assesses public safety risk, and notifies field teams.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mt-8 flex items-center space-x-3 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'submit'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>File New Complaint</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-bold border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Live City Reports ({complaints.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'submit' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Submission Form Column */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Submit Infrastructure Incident</span>
            </h2>
            <ComplaintForm onSuccess={handleSubmitted} />
          </div>

          {/* Instant AI Assessment Result Panel */}
          <div className="lg:col-span-5 space-y-6">
            {activeComplaint ? (
              <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-5 animate-slide-up bg-slate-900/90">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-white">Ticket Registered</span>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {activeComplaint.ticket_number}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-white">{activeComplaint.title}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{activeComplaint.address}</span>
                  </div>
                </div>

                {/* Priority Breakdown Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      AI Priority Score
                    </span>
                    <PriorityBadge
                      tier={activeComplaint.priority_tier}
                      score={activeComplaint.priority_score}
                      size="md"
                    />
                  </div>

                  {activeComplaint.ai_analyses && (
                    <div className="space-y-2 text-xs">
                      <p className="text-slate-300 font-medium">
                        {activeComplaint.ai_analyses.summary}
                      </p>
                      <div className="pt-2 border-t border-slate-800 text-slate-400">
                        <strong className="text-slate-200">Recommended Action:</strong>{' '}
                        {activeComplaint.ai_analyses.recommended_action}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lifecycle Pipeline */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Progress Timeline
                  </h4>
                  <StatusTimeline currentStatus={activeComplaint.status} />
                </div>

                <Link
                  to={`/complaints/${activeComplaint.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-colors border border-slate-700"
                >
                  <span>Open Full Ticket & Inspection View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Instant AI Diagnostic Ready</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fill in the incident details on the left. Once submitted, Google Gemini will evaluate the safety risk, compute the transparent 0–100 score, scan for nearby duplicates, and route to the correct municipal division.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History / Live City Reports Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <Link
                key={c.id}
                to={`/complaints/${c.id}`}
                className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {c.ticket_number}
                    </span>
                    <PriorityBadge tier={c.priority_tier} score={c.priority_score} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {c.title}
                  </h4>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <StatusBadge status={c.status} size="sm" />
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(c.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
