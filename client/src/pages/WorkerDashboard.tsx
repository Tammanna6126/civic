import React, { useState, useEffect } from 'react';
import { Complaint } from '../types';
import { api } from '../services/api';
import { uploadComplaintImage } from '../services/supabaseClient';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  HardHat,
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
  Navigation,
  Upload,
  AlertTriangle,
  FileCheck,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const WorkerDashboard: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');

  // Resolution Modal State
  const [resolvingTarget, setResolvingTarget] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkerTasks = async () => {
    try {
      setLoading(true);
      const res = await api.getComplaints();
      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      console.error('Failed to load worker tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerTasks();
  }, []);

  const handleStartWork = async (id: string) => {
    try {
      await api.updateStatus(id, 'in_progress', 'Field technician arrived on site and commenced repairs.');
      fetchWorkerTasks();
    } catch (err) {
      console.error('Failed to start work:', err);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingTarget) return;

    try {
      setSubmitting(true);
      let proofUrl = '';
      if (proofFile) {
        proofUrl = await uploadComplaintImage(proofFile);
      }

      await api.updateStatus(
        resolvingTarget.id,
        'resolved',
        'Repair completed and verified by field lead.',
        resolutionNotes || 'Remediation completed successfully.',
        proofUrl
      );

      setResolvingTarget(null);
      setResolutionNotes('');
      setProofFile(null);
      setProofPreview(null);
      fetchWorkerTasks();
    } catch (err) {
      console.error('Failed to resolve complaint:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingTasks = complaints.filter(
    (c) => c.status === 'assigned' || c.status === 'in_progress' || c.status === 'under_review'
  );
  const resolvedTasks = complaints.filter((c) => c.status === 'resolved');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Worker Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold">
            <HardHat className="w-3.5 h-3.5" />
            <span>FIELD OPERATIONS & INFRASTRUCTURE CREW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Assigned Work Orders & Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Field execution console for onsite inspection, cordoning, and proof-of-work submission.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl self-start md:self-center">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Work ({pendingTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'resolved'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({resolvedTasks.length})
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'pending' ? pendingTasks : resolvedTasks).map((c) => {
          const isPending = c.status !== 'resolved';
          const isInProgress = c.status === 'in_progress';

          return (
            <div
              key={c.id}
              className="glass-card p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    {c.ticket_number}
                  </span>
                  <PriorityBadge tier={c.priority_tier} score={c.priority_score} size="sm" />
                </div>

                <h3 className="font-bold text-sm text-white line-clamp-2">{c.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{c.description}</p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>GPS: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${c.latitude},${c.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>

                {c.ai_analyses && (
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                      Dispatch Recommended Action:
                    </span>
                    <p className="text-slate-300">{c.ai_analyses.recommended_action}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <StatusBadge status={c.status} size="sm" />

                {isPending && (
                  <div className="flex items-center space-x-2">
                    {!isInProgress ? (
                      <button
                        onClick={() => handleStartWork(c.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setResolvingTarget(c)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md shadow-emerald-600/30 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    )}
                  </div>
                )}

                {!isPending && (
                  <Link
                    to={`/complaints/${c.id}`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    View Proof &rarr;
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resolution Proof Modal */}
      {resolvingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">
                  Submit Resolution Proof & Notes
                </h3>
              </div>
              <button
                onClick={() => setResolvingTarget(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-mono text-emerald-400 font-bold">
                  {resolvingTarget.ticket_number}
                </span>
                <h4 className="font-semibold text-white mt-0.5">{resolvingTarget.title}</h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Work Completion Notes *
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the repairs made (e.g., replaced concrete slab, patched 3m asphalt crater, sealed transformer box)..."
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Resolution Photo Proof (Optional)
                </label>
                <div className="flex items-center space-x-3">
                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 flex items-center space-x-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload Proof Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const f = e.target.files[0];
                          setProofFile(f);
                          setProofPreview(URL.createObjectURL(f));
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {proofPreview && (
                    <img
                      src={proofPreview}
                      alt="Proof"
                      className="w-12 h-12 object-cover rounded-lg border border-emerald-500"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResolvingTarget(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Verifying & Closing...' : 'Complete & Close Ticket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
